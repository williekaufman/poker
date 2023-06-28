URL = 'http://ec2-34-192-101-140.compute-1.amazonaws.com:5002/'

let playerCards = []

let dealerCards = []

let dealerBestCards = [];

let previousToast = null;

let gameId = null;

let selectedCards = [];

let won = null;

let playerHand = document.getElementById('player-hand');
let playerHandDescription = document.getElementById('player-hand-description');

let dealerHand = document.getElementById('dealer-hand');
let dealerHandDescription = document.getElementById('dealer-hand-description');

const howToPlayPopup = document.getElementById('how-to-play-popup');
const howToPlayBtnText = document.getElementById('how-to-play-btn-text');

// Yes this is a stupid way to do it but copilot made it really fast lol
let cards = {
    1: { 'rank': 14, 'suit': 'S' },
    2: { 'rank': 13, 'suit': 'S' },
    3: { 'rank': 12, 'suit': 'S' },
    4: { 'rank': 11, 'suit': 'S' },
    5: { 'rank': 10, 'suit': 'S' },
    6: { 'rank': 9, 'suit': 'S' },
    7: { 'rank': 8, 'suit': 'S' },
    8: { 'rank': 7, 'suit': 'S' },
    9: { 'rank': 6, 'suit': 'S' },
    10: { 'rank': 5, 'suit': 'S' },
    11: { 'rank': 4, 'suit': 'S' },
    12: { 'rank': 3, 'suit': 'S' },
    13: { 'rank': 2, 'suit': 'S' },
    14: { 'rank': 14, 'suit': 'C' },
    15: { 'rank': 13, 'suit': 'C' },
    16: { 'rank': 12, 'suit': 'C' },
    17: { 'rank': 11, 'suit': 'C' },
    18: { 'rank': 10, 'suit': 'C' },
    19: { 'rank': 9, 'suit': 'C' },
    20: { 'rank': 8, 'suit': 'C' },
    21: { 'rank': 7, 'suit': 'C' },
    22: { 'rank': 6, 'suit': 'C' },
    23: { 'rank': 5, 'suit': 'C' },
    24: { 'rank': 4, 'suit': 'C' },
    25: { 'rank': 3, 'suit': 'C' },
    26: { 'rank': 2, 'suit': 'C' },
    27: { 'rank': 14, 'suit': 'H' },
    28: { 'rank': 13, 'suit': 'H' },
    29: { 'rank': 12, 'suit': 'H' },
    30: { 'rank': 11, 'suit': 'H' },
    31: { 'rank': 10, 'suit': 'H' },
    32: { 'rank': 9, 'suit': 'H' },
    33: { 'rank': 8, 'suit': 'H' },
    34: { 'rank': 7, 'suit': 'H' },
    35: { 'rank': 6, 'suit': 'H' },
    36: { 'rank': 5, 'suit': 'H' },
    37: { 'rank': 4, 'suit': 'H' },
    38: { 'rank': 3, 'suit': 'H' },
    39: { 'rank': 2, 'suit': 'H' },
    40: { 'rank': 14, 'suit': 'D' },
    41: { 'rank': 13, 'suit': 'D' },
    42: { 'rank': 12, 'suit': 'D' },
    43: { 'rank': 11, 'suit': 'D' },
    44: { 'rank': 10, 'suit': 'D' },
    45: { 'rank': 9, 'suit': 'D' },
    46: { 'rank': 8, 'suit': 'D' },
    47: { 'rank': 7, 'suit': 'D' },
    48: { 'rank': 6, 'suit': 'D' },
    49: { 'rank': 5, 'suit': 'D' },
    50: { 'rank': 4, 'suit': 'D' },
    51: { 'rank': 3, 'suit': 'D' },
    52: { 'rank': 2, 'suit': 'D' },
}

ranks = {
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'J',
    12: 'Q',
    13: 'K',
    14: 'A',
}

suits = {
    'S': '♠',
    'C': '♣',
    'H': '♥',
    'D': '♦',
}

classBySuits = {
    '♠': 'spades',
    '♣': 'clubs',
    '♥': 'hearts',
    '♦': 'diamonds',
}


function getCardElement(rank, suit, inHand = false) {
    var cards = document.getElementsByClassName('card');

    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (!card.classList.contains('description') && card.querySelector('.rank').textContent == rank && card.querySelector('.suit').textContent == suit && card.classList.contains('inHand') == inHand) {
            return card;
        }
    }
}

function toggleCards(value, type) {
    var cards = document.getElementsByClassName('card');

    cards_to_select = [];

    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (!card.classList.contains('description') && card.querySelector(`.${type}`).textContent == value && !card.classList.contains('inHand')) {
            cards_to_select.push(card);
        }
    }

    selectCards(cards_to_select);
}

function selectCards(cards) {
    atleast_one_unselected = false;
    
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (!card.classList.contains('selected') && !card.classList.contains('dealer-card')) {
            atleast_one_unselected = true;
        }
    }

    if (atleast_one_unselected) {
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            selectCard(card);
        }
    }

    else {
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            unselectCard(card);
        }
    }
}

function selectCard(card) {
    if (card.classList.contains('selected')) {
        return
    }

    toggleCardSelected(card);
}

function unselectCard(card) {
    if (!card.classList.contains('selected')) {
        return
    }

    toggleCardSelected(card);
}

function toggleCardSelected(card) {
    card.classList.toggle('selected');

    var index = Array.prototype.indexOf.call(card.parentNode.children, card);

    if (card.classList.contains('selected')) {
        selectedCards.push(index + 1);
    } else {
        var position = selectedCards.indexOf(index + 1);
        selectedCards.splice(position, 1);
    }
}

// Obsolete
function selectCardWithIndex(index) {
   if (selectedCards.includes(index)) {
         selectedCards.splice(selectedCards.indexOf(index), 1);
    } else {
        selectedCards.push(index);
    } 
}

function selectedCardsQueryArg() {
    ret = '';

    for (var i = 0; i < selectedCards.length; i++) {
        card = cards[selectedCards[i]];
        ret += card['rank'] + card['suit'] + ' ';
    }

    return ret
}

function showToast(message, seconds = 3) {
    const toast = document.createElement('div');

    toast.classList.add('toast');
    toast.textContent = message;

    previousToast?.remove();

    previousToast = toast;

    if (seconds == 0) {
        return;
    }
    document.body.appendChild(toast);

    setTimeout(function () {
        toast.remove();
    }, seconds * 1000);
}

function processCard(card) {
    return {
        rank: ranks[card['rank']],
        suit: suits[card['suit']],
    }
}

function makeRequestOptions(body) {
    return {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body,
    };
}

function unselectAllCards() {
    var cards = document.getElementsByClassName('card');

    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (card.classList.contains('selected') && !card.classList.contains('description')) {
            toggleCardSelected(card);
        }
    }
}

function newGame() {
    dealerCards = [];
    playerCards = [];
    dealerBestCards = [];
    won = null;

    unselectAllCards();
    describeHands();
    updateCards(); 

    showToast('', 0);

    fetch(`${URL}/new_game`, makeRequestOptions())
        .then(response => response.json())
        .then(data => {
            gameId = data.gameId;
        })
}

function currentCards() {
    const body = JSON.stringify({
        gameId,
    });

    fetch(`${URL}/current_cards`, makeRequestOptions(body))
        .then(response => response.json())
        .then(data => {
            playerCards = data.playerCards;
            dealerCards = data.dealerCards;
            updateCards();
        });
}

function includes(card, cards) {
    for (var i = 0; i < cards.length; i++) {
        if (cards[i]['rank'] == card['rank'] && cards[i]['suit'] == card['suit']) {
            return true;
        }
    }

    return false;
}

function markDealtCards() {
    for (var card in cards) {
        card = processCard(cards[card]);
        if (includes(card, dealerCards)) {
            card = getCardElement(card['rank'], card['suit']);
            card.classList.add('dealer-card');
        } else if (includes(card, playerCards)) {
            card = getCardElement(card['rank'], card['suit']);
            card.classList.add('player-card'); 
        } else {
            card = getCardElement(card['rank'], card['suit']);
            card.classList.remove('dealer-card');
        }
    }
}

function markDealerBestCards() {
    if (!dealerBestCards || dealerBestCards.length == 0) {
        return;
    }
    for (var card in cards) {
        card = processCard(cards[card]);
        if (includes(card, dealerBestCards)) {
            card = getCardElement(card['rank'], card['suit'], true);
            card.classList.add('dealer-best');
        }
    }
}

function updateCards() {
    playerHand.innerHTML = '';
    dealerHand.innerHTML = '';

    for (var i = 0; i < playerCards.length; i++) {
        var card = playerCards[i];
        var cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.classList.add('inHand');
        cardElement.classList.add(classBySuits[card['suit']]);
        cardElement.innerHTML = `
            <span class="rank">${card['rank']}</span>
            <span class="suit">${card['suit']}</span>
        `;
        playerHand.appendChild(cardElement);
    }

    for (var i = 0; i < dealerCards.length; i++) {
        var card = dealerCards[i];
        var cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.classList.add('inHand');
        cardElement.classList.add(classBySuits[card['suit']]);
        cardElement.innerHTML = `
            <span class="rank">${card['rank']}</span>
            <span class="suit">${card['suit']}</span>
        `;
        dealerHand.appendChild(cardElement);
    }

    markDealtCards();
    markDealerBestCards();
}

function handleFinished(data) {
    dealerBestCards = [...dealerBestCards, ...(data.playerCards.map(processCard))];
    won = data.won;
    showToast(data.message, 10);
}

function describeHands(playerDescription, dealerDescription) {
    if (won === true) {
        playerHandDescription.classList.add('winning');
        dealerHandDescription.classList.add('losing');
    } else if (won === false) {
        playerHandDescription.classList.add('losing');
        dealerHandDescription.classList.add('winning');
    } else {
        playerHandDescription.classList.remove('winning');
        dealerHandDescription.classList.remove('winning');
        playerHandDescription.classList.remove('losing');
        dealerHandDescription.classList.remove('losing');
    }
    if (playerDescription) {
        playerHandDescription.textContent = 'Player: ' + playerDescription;
    } else {
        playerHandDescription.textContent = 'Player';
    }
    if (dealerDescription) {
        dealerHandDescription.textContent = 'Dealer: ' + dealerDescription;
    } else {
        dealerHandDescription.textContent = 'Dealer';
    }
}

function dealCard() {
    const body = JSON.stringify({
        gameId,
        rule: selectedCardsQueryArg(),
    });

    fetch(`${URL}/deal`, makeRequestOptions(body))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                playerCards = data.playerCards && data.playerCards.map(processCard);
                dealerCards = data.dealerCards && data.dealerCards.map(processCard);
                dealerBestCards = data.dealerHand && data.dealerHand.map(processCard);
                if (data.finished) {
                    handleFinished(data);
                }
                updateCards();
                describeHands(data.playerHandDescription, data.dealerHandDescription);
            } else {
                showToast(data.message);
            }
        }
    );
}

const newGameButton = document.getElementById('new-game-btn');
newGameButton.addEventListener('click', async () => {
    await newGame();
});

const dealCardButton = document.getElementById('deal-card-btn');
dealCardButton.addEventListener('click', async () => {
    await dealCard();
});

keyboard_ranks = {
    'A': 'A',
    'K': 'K',
    'Q': 'Q',
    'J': 'J',
    'T': '10',
    '(': '9',
    '*': '8',
    '&': '7',
    '^': '6',
    '%': '5',
    '$': '4',
    '#': '3',
    '@': '2',
}

function handleKeyDown(e) {
    if (e.shiftKey) {
        if (e.key in keyboard_ranks) {
            toggleCards(keyboard_ranks[e.key], 'rank');
        } else if (e.key in suits) {
            toggleCards(suits[e.key], 'suit');
        } else if (e.key === 'U') {
            unselectAllCards();
        }
    }
    if (e.ctrlKey && (e.altKey || e.metaKey)) {
        if (e.key == 'd') {
            e.preventDefault();
            dealCard();
        } if (e.key == 'n') {
            e.preventDefault();
            newGame();
        }
    } if (e.key === 'Escape' && howToPlayPopup.style.visibility === 'visible') {
        toggleHowToPlay(e);
    } 
}

function toggleHowToPlay(event) {
    event.stopPropagation();
    if (howToPlayPopup.style.visibility === 'hidden') {
      howToPlayPopup.style.visibility = 'visible';
      howToPlayPopup.style.opacity = '1';
      howToPlayBtnText.textContent = 'Close how to play';
    } else {
      howToPlayPopup.style.visibility = 'hidden';
      howToPlayPopup.style.opacity = '0';
      howToPlayBtnText.textContent = 'How to play';
    }
  }

document.addEventListener('keydown', handleKeyDown);

document.addEventListener('DOMContentLoaded', function () {
    howToPlayPopup.style.visibility = 'hidden';
});

newGame();