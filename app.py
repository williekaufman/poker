from flask import Flask, jsonify, request, make_response, render_template
from flask_cors import CORS, cross_origin
from redis_utils import rget, rset
from settings import LOCAL
from cards import Rule, Card, rule_of_string, shuffled_deck, deal_card, best_five_card_hand
from secrets import compare_digest
import random
import requests
import json

from enum import Enum

app = Flask(__name__)
CORS(app)


class Player(Enum):
    PLAYER = 1
    DEALER = 2


def add_cards(cards, game_id, player=Player.PLAYER):
    key = 'cards' if player == Player.PLAYER else 'dealer_cards'
    if cards == []:
        return rget(key, game_id=game_id)
    ret = json.loads(rget(key, game_id=game_id))
    for card in cards:
        ret = add_card(card, game_id, player=player)
    return ret


def add_card(card, game_id, player=Player.PLAYER):
    key = 'cards' if player == Player.PLAYER else 'dealer_cards'
    cards = json.loads(rget(key, game_id=game_id))
    cards.append(card)
    rset(key, json.dumps(cards), game_id=game_id)
    return cards


@app.route("/", methods=['GET'])
def index():
    return render_template('index.html')


@app.route("/new_game", methods=['POST'])
@cross_origin()
def new_game():
    game_id = request.json.get('gameId')
    if game_id is None:
        return {'success': False}
    deck = shuffled_deck()
    rset('deck', json.dumps([card.to_json()
         for card in deck]), game_id=game_id)
    rset('cards', json.dumps([]), game_id=game_id)
    rset('dealer_cards', json.dumps([]), game_id=game_id)
    return {'success': True}


@app.route("/current_cards", methods=['POST'])
@cross_origin()
def current_cards():
    game_id = request.json.get('gameId')
    if game_id is None:
        return {'success': False, 'message': 'Must provide gameId'}
    cards = json.loads(rget('cards', game_id=game_id))
    dealer_cards = json.loads(rget('dealer_cards', game_id=game_id))
    return {'success': True, 'cards': cards, 'dealerCards': dealer_cards}


def serialize_list_of_cards(cards):
    return [card.to_json() for card in cards]


@app.route("/best_hands", methods=['POST'])
@cross_origin()
def best_hands():
    game_id = request.json.get('gameId')
    if game_id is None:
        return {'success': False, 'message': 'Must provide gameId'}
    cards = json.loads(rget('cards', game_id=game_id))
    dealer_cards = json.loads(rget('dealer_cards', game_id=game_id))
    player_hand = best_five_card_hand(cards)
    dealer_hand = best_five_card_hand(dealer_cards)
    print(dealer_hand)
    return {'success': True, 'playerHand': player_hand and serialize_list_of_cards(player_hand.cards), 'dealerHand': dealer_hand and serialize_list_of_cards(dealer_hand.cards)}


@app.route("/deal", methods=['POST'])
@cross_origin()
def deal():
    game_id = request.json.get('gameId')
    rule = request.json.get('rule')
    try:
        rule = rule_of_string(rule)
    except:
        return {'success': False, 'message': 'Invalid rule'}
    if game_id is None:
        return {'success': False, 'message': 'Must provide gameId'}
    deck = json.loads(rget('deck', game_id=game_id))
    card, dealer_cards, deck = deal_card(deck, rule)
    if card is None:
        return {'success': False, 'message': "Rule doesn't match any cards left in deck"}
    rset('deck', json.dumps(deck), game_id=game_id)
    player_cards = add_card(card, game_id)
    dealer_cards = add_cards(dealer_cards, game_id, player=Player.DEALER)
    return {'success': True, 'cards': player_cards, 'dealerCards': dealer_cards}


if __name__ == '__main__':
    print('app running!')
    app.run(host='0.0.0.0', port=5001 if LOCAL else 5002)
