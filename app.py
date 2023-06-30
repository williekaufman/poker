from flask import Flask, jsonify, request, make_response, render_template
from flask_cors import CORS, cross_origin
from redis_utils import rget, rset, redis
from settings import LOCAL, player_hand_type_prefix
from cards import rule_of_string, shuffled_deck, deal_card, best_five_card_hand, get_card, compare_hands
from secrets import compare_digest, token_hex
import random
import requests
import json

from enum import Enum

app = Flask(__name__)
CORS(app)


class Player(Enum):
    PLAYER = 1
    DEALER = 2

class Result(Enum):
    WIN = 'wins'
    LOSS = 'losses'

def add_cards(cards, game_id, player=Player.PLAYER):
    key = 'cards' if player == Player.PLAYER else 'dealer_cards'
    if cards == []:
        return json.loads(rget(key, game_id=game_id))
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

def str_add(a, b):
    return str(int(a) + b)

def get_record_helper(player_name, result):
    return int(rget(f'{player_name}:{result.value}', game_id=None) or 0)

def add_win(player_name):
    current_wins = get_record_helper(player_name, Result.WIN)
    rset(f'{player_name}:wins', current_wins + 1, game_id=None, ex=None)

def add_loss(player_name):
    current_losses = get_record_helper(player_name, Result.LOSS)
    rset(f'{player_name}:losses', current_losses + 1, game_id=None, ex=None)

def get_record(player_name):
    if not player_name:
        return {'wins': 0, 'losses': 0}
    return {
        'wins': get_record_helper(player_name, Result.WIN), 
        'losses': get_record_helper(player_name, Result.LOSS)
    }

def add_ip_address(address):
    current_count = int(rget(f'ip_address:{address}', game_id=None) or 0)
    rset(f'ip_address:{address}', current_count + 1, game_id=None, ex=None)

@app.route("/", methods=['GET'])
def index():
    return render_template('index.html')


@app.route("/new_game", methods=['POST'])
@cross_origin()
def new_game():
    game_id = token_hex(16)
    deck = shuffled_deck()
    add_ip_address(request.remote_addr)
    rset('deck', json.dumps([card.to_json()
         for card in deck]), game_id=game_id)
    rset('cards', json.dumps([]), game_id=game_id)
    rset('dealer_cards', json.dumps([]), game_id=game_id)
    rset('finished', 'false', game_id=game_id)
    return {'success': True, 'gameId': game_id}


@app.route("/current_cards", methods=['GET'])
@cross_origin()
def current_cards():
    game_id = request.args.get('gameId')
    if game_id is None:
        return {'success': False, 'message': 'Must provide gameId'}
    cards = json.loads(rget('cards', game_id=game_id))
    dealer_cards = json.loads(rget('dealer_cards', game_id=game_id))
    return {'success': True, 'playerCards': cards, 'dealerCards': dealer_cards}


def serialize_list_of_cards(cards):
    return [card.to_json() for card in cards]


@app.route("/best_hands", methods=['GET'])
@cross_origin()
def best_hands():
    game_id = request.args.get('gameId')
    if game_id is None:
        return {'success': False, 'message': 'Must provide gameId'}
    cards = json.loads(rget('cards', game_id=game_id))
    dealer_cards = json.loads(rget('dealer_cards', game_id=game_id))
    player_hand = best_five_card_hand(cards)
    dealer_hand = best_five_card_hand(dealer_cards)
    return {'success': True, 'playerHand': player_hand and serialize_list_of_cards(player_hand.cards), 'dealerHand': dealer_hand and serialize_list_of_cards(dealer_hand.cards)}


def finish_game(player_cards, dealer_cards, deck, game_id, player_name=None):
    while len(dealer_cards) < 8:
        card, deck = get_card(deck) 
        dealer_cards = add_card(card, game_id, player=Player.DEALER)
    rset('finished', 'true', game_id=game_id)
    player_hand = best_five_card_hand(player_cards)
    dealer_hand = best_five_card_hand(dealer_cards)
    ret = {
        'success': True,
        'finished': True,
        'dealerHandDescription': dealer_hand.description(),
        'playerHandDescription': player_hand.description(),
        'playerCards': player_cards,
        'dealerCards': dealer_cards,
        'dealerHand': serialize_list_of_cards(dealer_hand.cards)
    }
    if compare_hands(player_hand, dealer_hand) == 1:
        player_name and add_win(player_name)
        add_win(player_hand_type_prefix + player_hand.type())
        record = get_record(player_name)
        return {
            **ret,
            'won': True,
            'message': 'You win!',
            'record': record
        }
    else:
        player_name and add_loss(player_name)
        add_loss(player_hand_type_prefix + player_hand.type())
        record = get_record(player_name)
        return {
            **ret,
            'won': False,
            'message': 'You lose!',
            'record': record
        }

@app.route("/deal", methods=['POST'])
@cross_origin()
def deal():
    game_id = request.json.get('gameId')
    player_name = request.json.get('playerName')
    if rget('finished', game_id=game_id) == 'true':
        return {'success': False, 'message': 'Game is over'}
    rule = request.json.get('rule')
    try:
        rule = rule_of_string(rule)
    except:
        return {'success': False, 'message': 'Invalid rule'}
    if game_id is None:
        return {'success': False, 'message': 'Must provide gameId'}
    deck = json.loads(rget('deck', game_id=game_id))
    if deck is None:
        return {'success': False, 'message': 'Invalid gameId - start a new game'}
    card, dealer_cards, deck = deal_card(deck, rule)
    if card is None:
        return {'success': False, 'message': "Rule doesn't match any cards left in deck"}
    rset('deck', json.dumps(deck), game_id=game_id)
    player_cards = add_card(card, game_id)
    dealer_cards = add_cards(dealer_cards, game_id, player=Player.DEALER)
    if len(player_cards) == 5:
        return finish_game(player_cards, dealer_cards, deck, game_id, player_name)
    dealer_best_hand = best_five_card_hand(dealer_cards)
    return { 'success': True, 'finished': False, 'dealerHandDescription': dealer_best_hand and dealer_best_hand.description(), 'playerCards': player_cards, 'dealerCards': dealer_cards , 'dealerHand': dealer_best_hand and serialize_list_of_cards(dealer_best_hand.cards)}

@app.route("/record", methods=['GET'])
@cross_origin()
def record():
    player_name = request.args.get('playerName')
    print(player_name)
    if not player_name:
        return {'success': False, 'message': 'Must provide playerName'}
    return {'success': True, 'record': get_record(player_name)}

@app.route("/record", methods=['DELETE'])
@cross_origin()
def delete_record():
    player_name = request.json.get('playerName')
    if not player_name:
        return {'success': False, 'message': 'Must provide playerName'}
    rset(f'{player_name}:wins', 0, game_id=None)
    rset(f'{player_name}:losses', 0, game_id=None)
    return {'success': True, 'record': get_record(player_name)}

def get_record_by_hand_type_helper(key, result):
    return int(rget(f'{key}:{result.value}', game_id=None) or 0)

def get_record_by_hand_type(hand_type):
    key = f'{player_hand_type_prefix}{hand_type}'
    wins, losses = get_record_by_hand_type_helper(key, Result.WIN), get_record_by_hand_type_helper(key, Result.LOSS)
    return {
        'wins': wins,
        'losses': losses,
        'percentage': wins / (wins + losses) if wins + losses > 0 else 0 
    }

@app.route("/record/by_hand_type", methods=['GET'])
@cross_origin()
def record_by_hand_type():
    ret = []
    for hand_type in ['straight_flush', 'four_of_a_kind', 'full_house', 'flush', 'straight', 'three_of_a_kind', 'two_pair', 'pair', 'high_card']:
        ret.append({'type': hand_type, **get_record_by_hand_type(hand_type)}) 
    return {'success': True, 'record': ret}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001 if LOCAL else 5002)
