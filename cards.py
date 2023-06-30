import random
import itertools
from collections import Counter

rank_names = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    11: "Jack",
    12: "Queen",
    13: "King",
    14: "Ace"
}

def card_of_string(s):
    return Card(int(s[:-1]), s[-1])

def card_of_dict(d):
    return Card(d['rank'], d['suit'])

def rule_of_string(s):
    return Rule([card_of_string(card) for card in s.split()])

class Rule():
    def __init__(self, cards):
        self.cards = cards

    def matches(self, card):
        return any(card.equals(c) for c in self.cards)
    
    def __repr__(self):
        return " ".join(str(card) for card in self.cards)

class Card():
    def __init__(self, rank, suit):
        self.rank = rank
        self.suit = suit

    def rank(self):
        return self.rank

    def suit(self):
        return self.suit

    def equals(self, other):
        return self.rank == other.rank and self.suit == other.suit
    
    def to_json(self):
        return {'rank': self.rank, 'suit': self.suit}
    
    def __repr__(self):
        return f"{rank_names[self.rank]}{self.suit}"

def compare(x, y):
    return 1 if x > y else 0 if x == y else -1

def compare_hands_of_same_type(hand1, hand2):
    for c1, c2 in zip(hand1.cards, hand2.cards):
        if compare(c1.rank, c2.rank):
            return compare(c1.rank, c2.rank)
    return 0

class StraightFlush():
    def __init__(self, cards):
        self.cards = cards

    def power(self):
        return 9
    
    def description(self):
        return f'{rank_names[max(card.rank for card in self.cards)]} high straight flush'

    def type(self):
        return 'straight_flush'

class FourOfAKind():
    def __init__(self, cards):
        self.cards = cards

    def power(self):
        return 8
    
    def description(self):
        return f'Four {rank_names[self.cards[0].rank]}s'

    def type(self):
        return 'four_of_a_kind'

class FullHouse():
    def __init__(self, cards):
        self.cards = cards

    def power(self):
        return 7
    
    def description(self):
        return f'{rank_names[self.cards[0].rank]}s full of {rank_names[self.cards[3].rank]}s'

    def type(self):
        return 'full_house'

class Flush():
    def __init__(self, cards):
        self.cards = cards

    def power(self):
        return 6
    
    def description(self):
        return f'{rank_names[max(card.rank for card in self.cards)]} high flush'

    def type(self):
        return 'flush'

class Straight():
    def __init__(self, cards):
        self.cards = cards

    def power(self):
        return 5
    
    def description(self):
        if 2 in [card.rank for card in self.cards] and 14 in [card.rank for card in self.cards]:
            return f'5 high straight'
        return f'{rank_names[max(card.rank for card in self.cards)]} high straight'

    def type(self):
        return 'straight'

class ThreeOfAKind():
    def __init__(self, cards):
        self.cards = cards

    def power(self):
        return 4
    
    def description(self):
        return f'Three {rank_names[self.cards[0].rank]}s'

    def type(self):
        return 'three_of_a_kind'

class TwoPair():
    def __init__(self, cards):
        self.cards = cards

    def power(self):
        return 3
    
    def description(self):
        return f'{rank_names[self.cards[0].rank]}s and {rank_names[self.cards[2].rank]}s'

    def type(self):
        return 'two_pair'
    
class Pair():
    def __init__(self, cards):
        self.cards = cards
    
    def power(self):
        return 2
    
    def description(self):
        return f'Pair of {rank_names[self.cards[0].rank]}s'        

    def type(self):
        return 'pair'
    
class HighCard():
    def __init__(self, cards):
        self.cards = cards

    def power(self):
        return 1
    
    def description(self):
        return f'{rank_names[max(card.rank for card in self.cards)]} high'

    def type(self):
        return 'high_card'

def flush(cards):
    if len(set(c.suit for c in cards)) == 1:
        return Flush(sorted(cards, key=lambda card: card.rank, reverse=True))

def straight(cards):
    ranks = sorted((card.rank for card in cards), reverse = True)
    if ranks == [14, 5, 4, 3, 2]:
        cards = sorted([card for card in cards if card.rank != 14], key=lambda card: card.rank, reverse=True) + [card for card in cards if card.rank == 14]
        return Straight(cards)
    if len(set(ranks)) == 5 and ranks[0] - ranks[4] == 4:
        cards = sorted(cards, key=lambda card: card.rank, reverse=True)
        return Straight(cards)

def straight_flush(cards):
    if flush(cards) and straight(cards):
        if 2 in [card.rank for card in cards] and 14 in [card.rank for card in cards]:
            cards = sorted([card for card in cards if card.rank != 14], key=lambda card: card.rank, reverse=True) + [card for card in cards if card.rank == 14]
            return StraightFlush(cards)
        return StraightFlush(sorted(cards, key=lambda card: card.rank, reverse=True))

def four_of_a_kind(cards):
    c = Counter(card.rank for card in cards)
    for k, v in c.items():
        if v == 4:
            cards = [card for card in cards if card.rank == k] + [card for card in cards if card.rank != k]
            return FourOfAKind(cards)

def full_house(cards):
    c = Counter(card.rank for card in cards)
    for k, v in c.items():
        if v == 3:
            for k2, v2 in c.items():
                if v2 == 2:
                    cards = [card for card in cards if card.rank == k] + [card for card in cards if card.rank == k2]
                    return FullHouse(cards)

def three_of_a_kind(cards):
    c = Counter(card.rank for card in cards)
    for k, v in c.items():
        if v == 3:
            cards = [card for card in cards if card.rank == k] + sorted([card for card in cards if card.rank != k], key=lambda card: card.rank, reverse=True)
            return ThreeOfAKind(cards)

def two_pair(cards):
    c = Counter(card.rank for card in cards)
    for k, v in c.items():
        if v == 2:
            for k2, v2 in c.items():
                if v2 == 2 and k2 != k:
                    if k2 > k:
                        k, k2 = k2, k
                    cards = [card for card in cards if card.rank == k] + [card for card in cards if card.rank == k2] + [card for card in cards if card.rank != k and card.rank != k2]
                    return TwoPair(cards)

def pair(cards):
    c = Counter(card.rank for card in cards)
    for k, v in c.items():
        if v == 2:
            cards = [card for card in cards if card.rank == k] + sorted([card for card in cards if card.rank != k], key=lambda card: card.rank, reverse=True)
            return Pair(cards)

def high_card(cards):
    return HighCard(sorted(cards, key=lambda card: card.rank, reverse=True))

functions = [straight_flush, four_of_a_kind, full_house, flush, straight, three_of_a_kind, two_pair, pair, high_card]

giveup_on = {
    StraightFlush: four_of_a_kind,
    FourOfAKind: full_house,
    FullHouse: flush,
    Flush: straight,
    Straight: three_of_a_kind,
    ThreeOfAKind: two_pair,
    TwoPair: pair,
    Pair: high_card,
    HighCard: None
}

def best_hand(cards, giveup_on=None):
    for f in functions:
        if giveup_on and f == giveup_on:
            return None
        if f(cards):
            return f(cards)

def compare_hands(hand1, hand2):
    if not hand1 or not hand2:
        return hand1 or hand2
    if compare(hand1.power(), hand2.power()):
        return compare(hand1.power(), hand2.power())
    return compare_hands_of_same_type(hand1, hand2)

def best_five_card_hand(cards):
    cards = [card_of_dict(card) for card in cards]
    if len(cards) < 5:
        return None
    best_so_far = None
    for hand in itertools.combinations(cards, 5):
        if best_so_far is None or compare_hands(best_hand(hand, giveup_on=giveup_on[type(best_so_far)]), best_so_far) == 1:
            best_so_far = best_hand(hand)
    return best_so_far

def shuffled_deck():
    deck = [Card(rank, suit) for rank in range(2, 15) for suit in "HDCS"]
    random.shuffle(deck)
    return deck

def get_card(deck):
    if not deck:
        return None, []
    card = card_of_dict(deck.pop())
    return card.to_json(), deck

def deal_card(deck, rule):
    if not deck:
        return None, [], []
    copy = deck.copy()
    dealer_cards = []
    card = card_of_dict(deck.pop())
    while not rule.matches(card):
        if not deck:
            return None, [], copy
        dealer_cards.append(card)
        card = card_of_dict(deck.pop())
    return card.to_json(), [dealer_card.to_json() for dealer_card in dealer_cards], deck