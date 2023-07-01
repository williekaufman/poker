URL = 'http://ec2-34-192-101-140.compute-1.amazonaws.com:5002/'

// URL = 'http://localhost:5001/'

let playerCards = []

let dealerCards = []

let dealerBestHand = [];

let previousToast = null;

let gameId = null;

let selectedCards = [];

let won = null;

let playerNameInput = document.getElementById('player-name-input');

let playerHand = document.getElementById('player-hand');
let playerHandDescription = document.getElementById('player-hand-description');

let dealerHand = document.getElementById('dealer-hand');
let dealerHandDescription = document.getElementById('dealer-hand-description');

let highlightDealerBestHand = document.getElementById('highlight-dealer-best-hand');

const howToPlayPopup = document.getElementById('how-to-play-popup');
const howToPlayBtnText = document.getElementById('how-to-play-btn-text');

function setRecord(record) {
    if (!record || (record.wins == 0 && record.losses == 0)) {
        document.getElementById('record').textContent = '';
        return;
    }
    document.getElementById('record').textContent = `${record.wins}W / ${record.losses}L`;
}

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

keyboardSuits = {
    'KeyS': '♠',
    'KeyC': '♣',
    'KeyH': '♥',
    'KeyD': '♦',
}

classBySuits = {
    '♠': 'spades',
    '♣': 'clubs',
    '♥': 'hearts',
    '♦': 'diamonds',
}


function getCardElement(rank, suit, inHand = false) {
    var cards = document.getElementsByClassName('card');

    function f(card) {
        if (card.classList.contains('description') || card.classList.contains('outline')) {
            return false;
        } if (card.classList.contains('in-hand') != inHand) {
            return false;
        }
        return card.querySelector('.rank').textContent == rank && card.querySelector('.suit').textContent == suit;
    }

    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (f(card)) {
            return card
        }
    }
}

function toggleCards(value, type, r = (x) => false) {
    var cards = document.getElementsByClassName('card');

    cards_to_select = [];

    function f(card) {
        if (card.classList.contains('description') || card.classList.contains('in-hand')) {
            return false;
        }
        return r(card) || (type && card.querySelector(`.${type}`).textContent == value);
    }

    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (f(card)) {
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

function updateDealCardButton() {
    let c = expectedDealerCards();

    c = c ? Math.round(c * 10) / 10 : '';

    dealCardButton.textContent = 'Deal card' + (c === '' ? '' : ' (' + c + ')');
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

    updateDealCardButton();
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

function makeRequestOptions(body, method = 'POST') {
    if (method == 'GET') {
        return {
            method,
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
        };
    }

    return {
        method,
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };
}

function fetchWrapper(url, body, method = 'POST') {
    if (method == 'GET') {
        for (var key in body) {
            url = `${url}?${key}=${body[key]}`;
        }
    }
    return fetch(url, makeRequestOptions(body, method));
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
    dealerBestHand = [];
    won = null;

    unselectAllCards();
    describeHands();
    updateCards();

    showToast('', 0);

    fetchWrapper(`${URL}/new_game`, null, 'POST')
        .then(response => response.json())
        .then(data => {
            gameId = data.gameId;
        })
}

function currentCards() {
    const body = {
        gameId,
    };

    fetchWrapper(`${URL}/current_cards`, body, 'GET')
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
            card.classList.remove('player-card');
        }
    }
}

function markDealerBestHand() {
    if (!dealerBestHand || dealerBestHand.length == 0) {
        return;
    }

    function f(card) {
        if (highlightDealerBestHand.checked) {
            card.classList.add('dealer-best');
        } else {
            card.classList.remove('dealer-best');
        }
    }

    for (var card in cards) {
        card = processCard(cards[card]);
        if (includes(card, dealerBestHand)) {
            card = getCardElement(card['rank'], card['suit'], true);
            f(card);
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
        cardElement.classList.add('in-hand');
        cardElement.classList.add(classBySuits[card['suit']]);
        cardElement.innerHTML = `
            <span class="rank">${card['rank']}</span>
            <span class="suit">${card['suit']}</span>
        `;
        playerHand.appendChild(cardElement);
    }

    for (var i = 0; i < 5 - playerCards.length; i++) {
        var cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.classList.add('in-hand');
        cardElement.classList.add('outline');
        playerHand.appendChild(cardElement);
    }

    for (var i = 0; i < dealerCards.length; i++) {
        var card = dealerCards[i];
        var cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.classList.add('in-hand');
        cardElement.classList.add(classBySuits[card['suit']]);
        cardElement.innerHTML = `
            <span class="rank">${card['rank']}</span>
            <span class="suit">${card['suit']}</span>
        `;
        dealerHand.appendChild(cardElement);
    }

    for (var i = 0; i < 8 - dealerCards.length; i++) {
        var cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.classList.add('in-hand');
        cardElement.classList.add('outline');
        dealerHand.appendChild(cardElement);
    }

    markDealtCards();
    markDealerBestHand();
    updateDealCardButton();
}

function handleFinished(data) {
    won = data.won;
    setRecord(data.record);
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
    const body = {
        gameId,
        rule: selectedCardsQueryArg(),
        playerName: playerNameInput.value,
    };

    fetchWrapper(`${URL}/deal`, body)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                playerCards = data.playerCards && data.playerCards.map(processCard);
                dealerCards = data.dealerCards && data.dealerCards.map(processCard);
                dealerBestHand = data.dealerHand && data.dealerHand.map(processCard);
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

function getRecord() {
    const body = {
        playerName: playerNameInput.value,
    };

    fetchWrapper(`${URL}/record`, body, 'GET')
        .then(response => response.json())
        .then(data => {
            if (data['success']) {
                setRecord(data.record);
            }
        }
        );
}

function deleteRecord() {
    const body = {
        playerName: playerNameInput.value,
    };

    fetchWrapper(`${URL}/record`, body, 'DELETE')
        .then(response => response.json())
        .then(data => {
            setRecord(data.record);
        }
        );
}

function expectedDealerCards() {
    var cards = document.getElementsByClassName('card');

    var selected = 0;
    var total = 0;

    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (card.classList.contains('player-card') || card.classList.contains('dealer-card') || card.classList.contains('description') || card.classList.contains('in-hand')) {
            continue;
        } else
            if (card.classList.contains('selected')) {
                selected++;
            }
            else {
                total++;
            }
    }

    return selected ? (total + selected + 1) / (selected + 1) - 1 : 0;
}

const newGameButton = document.getElementById('new-game-btn');
newGameButton.addEventListener('click', async () => {
    await newGame();
});

const dealCardButton = document.getElementById('deal-card-btn');
dealCardButton.addEventListener('click', async () => {
    await dealCard();
});

const deleteRecordButton = document.getElementById('delete-record-btn');
deleteRecordButton.addEventListener('click', async () => {
    await deleteRecord();
});

keyboard_ranks = {
    'KeyA': 'A',
    'KeyK': 'K',
    'KeyQ': 'Q',
    'KeyJ': 'J',
    'KeyT': '10',
    'Digit0': '10',
    'Digit9': '9',
    'Digit8': '8',
    'Digit7': '7',
    'Digit6': '6',
    'Digit5': '5',
    'Digit4': '4',
    'Digit3': '3',
    'Digit2': '2',
}

str_to_rank = {
    'A': 14,
    'K': 13,
    'Q': 12,
    'J': 11,
    '10': 10,
    '9': 9,
    '8': 8,
    '7': 7,
    '6': 6,
    '5': 5,
    '4': 4,
    '3': 3,
    '2': 2,
}

function handleKeyDown(e) {
    if (!e.ctrlKey) {
        console.log(e.code);
        if (e.code in keyboard_ranks) {
        toggleCards(keyboard_ranks[e.code], 'rank');
        } else if (e.code in keyboardSuits) {
            toggleCards(keyboardSuits[e.code], 'suit');
        } else if (e.code === 'KeyU') {
            toggleCards('', '', (x) => true);
        } else if (e.key === 'KeyP') {
            e.preventDefault();
            playerNameInput.focus();
        }
    }
    if (e.ctrlKey && !e.altKey) {
        if (e.code in keyboard_ranks) {
            e.preventDefault();
            r = function (card) {
                return str_to_rank[card.querySelector('.rank').textContent] >= str_to_rank[keyboard_ranks[e.code]];
            }
            toggleCards('', '', r); 
        }
    }
    if (e.ctrlKey && e.altKey) {
        if (e.code === 'KeyD') {
            e.preventDefault();
            dealCard();
        } if (e.code === 'KeyN') {
            e.preventDefault();
            newGame();
        } if (e.code === 'KeyR') {
            e.preventDefault();
            deleteRecord();
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

function submitPlayerName() {
    localStorage.setItem('personalGoatPlayerName', playerNameInput.value);
    if (playerNameInput.value === '') {
        document.getElementById('record').textContent = '';
        return;
    }
    getRecord();
}

playerNameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        submitPlayerName();
    } if (e.key === 'Escape') {
        e.preventDefault();
        playerNameInput.blur();
    }
})

playerNameInput.addEventListener('focus', function (e) {
    document.removeEventListener('keydown', handleKeyDown);
})

playerNameInput.addEventListener('blur', function (e) {
    document.addEventListener('keydown', handleKeyDown);
    submitPlayerName();
})

if (localStorage.getItem('personalGoatPlayerName')) {
    playerNameInput.value = localStorage.getItem('personalGoatPlayerName');
    getRecord();
}

if (localStorage.getItem('highlightDealerBestHand')) {
    highlightDealerBestHand.checked = localStorage.getItem('highlightDealerBestHand') === 'true';
    markDealerBestHand();
}

highlightDealerBestHand.addEventListener('change', function (e) {
    localStorage.setItem('highlightDealerBestHand', highlightDealerBestHand.checked);
    markDealerBestHand();
})

newGame();