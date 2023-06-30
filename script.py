import requests
import json
from redis_utils import redis

def get_suit(suit):
    return ' '.join([str(rank) + suit for rank in range(2, 15)])

def rule(rank):
    return ' '.join([str(rank) + suit for rank in range(rank, 15) for suit in "SHCD"])

trials = 1

d = {i: 0 for i in range(2, 100)}

def run_trial(rank):
    game = requests.post('http://localhost:5001/new_game',
                     json={}).json()['gameId']
    first_card = requests.post('http://localhost:5001/deal', json={'gameId': game, 'rule': rule(rank)}).json()['playerCards'][0]
    for _ in range(4):
        response = requests.post('http://localhost:5001/deal', json={'gameId': game, 'rule': get_suit(first_card['suit'])}).json()
    return len(response['dealerCards'])

for j in range(trials):
    result = run_trial(2)
    d[result] += 1

d = { i : d[i] / trials for i in range(2, 100)}

print(sum([k * v for k, v in d.items()]))

print(d)
