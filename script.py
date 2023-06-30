import requests
import json
from redis_utils import redis

def get_suit(suit):
    return ' '.join([str(rank) + suit for rank in range(2, 15)])

def rule(rank):
    return ' '.join([str(rank) + suit for rank in range(rank, 15) for suit in "SHCD"])

def card_matching(playerCards):
    return ' '.join([str(rank) + suit for rank in set([card['rank'] for card in playerCards]) for suit in "SHCD"])

trials = 100

wins = 0

def run_trial():
    global trials
    game = requests.post('http://localhost:5001/new_game',
                     json={}).json()['gameId']
    for _ in range(3):
        response = requests.post('http://localhost:5001/deal',
                             json={'gameId': game, 'rule': rule(2)}).json()
    player_cards = response['playerCards']
    for _ in range(2):
        response = requests.post('http://localhost:5001/deal', json={'gameId': game, 'rule': card_matching(player_cards)}).json()
        if 'playerCards' not in response:
            trials -= 1
            return False
        player_cards = response['playerCards']
    if 'won' not in response:
        print('failed')
        return False
    return response['won']

for j in range(trials):
    wins += run_trial()

print(wins, trials, wins / trials)