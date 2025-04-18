// Конфигурация игры
const GameConfig = {
  cardSuits: ['♠', '♥', '♦', '♣'],
  cardRanks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
  dealerStandThreshold: 17,
  blackjackValue: 21
};

// Состояние игры
const GameState = {
  deck: [],
  dealerHand: [],
  playerHand: [],
  gameOver: false
};

// DOM элементы
const elements = {
  dealerCards: document.getElementById('dealercards'),
  playerCards: document.getElementById('playercards'),
  dealerScore: document.getElementById('dltwentyone'),
  playerScore: document.getElementById('pltwentyone'),
  dealBtn: document.getElementById('dealbtn'),
  hitBtn: document.getElementById('hitbtn'),
  standBtn: document.getElementById('standbtn'),
  againBtn: document.getElementById('againbtn'),
  message: document.getElementById('message')
};

// Инициализация игры
function initGame() {
  initDeck();
  setupEventListeners();
}

// Инициализация колоды
function initDeck() {
  GameState.deck = [];
  for (const suit of GameConfig.cardSuits) {
    for (const rank of GameConfig.cardRanks) {
      GameState.deck.push({ suit, rank });
    }
  }
  shuffleDeck();
}

// Перемешивание колоды
function shuffleDeck() {
  for (let i = GameState.deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [GameState.deck[i], GameState.deck[j]] = [GameState.deck[j], GameState.deck[i]];
  }
}

// Взятие карты из колоды
function drawCard() {
  return GameState.deck.pop();
}

// Получение значения карты
function getCardValue(rank) {
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return parseInt(rank);
}

// Подсчет очков в руке
function calculateScore(hand) {
  let score = hand.reduce((sum, card) => sum + getCardValue(card.rank), 0);
  let aces = hand.filter(card => card.rank === 'A').length;
  
  while (score > GameConfig.blackjackValue && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}

// Проверка на Blackjack
function hasBlackjack(hand) {
  return hand.length === 2 && calculateScore(hand) === GameConfig.blackjackValue;
}

// Начало новой игры
function deal() {
  GameState.dealerHand = [drawCard(), drawCard()];
  GameState.playerHand = [drawCard(), drawCard()];
  GameState.gameOver = false;
  
  updateUI();
  
  // Проверка на Blackjack у игрока
  if (hasBlackjack(GameState.playerHand)) {
    stand();
  }
}

// Игрок берет карту
function hit() {
  if (!GameState.gameOver) {
    GameState.playerHand.push(drawCard());
    const playerScore = calculateScore(GameState.playerHand);
    
    if (playerScore >= GameConfig.blackjackValue) {
      stand();
    } else {
      updateUI();
    }
  }
}

// Игрок завершает ход
function stand() {
  GameState.gameOver = true;
  
  // Дилер берет карты по правилам
  while (calculateScore(GameState.dealerHand) < GameConfig.dealerStandThreshold && 
         calculateScore(GameState.playerHand) <= GameConfig.blackjackValue) {
    GameState.dealerHand.push(drawCard());
  }
  
  updateUI();
  showResult();
}

// Сброс игры
function resetGame() {
  initDeck();
  GameState.dealerHand = [];
  GameState.playerHand = [];
  GameState.gameOver = false;
  
  updateUI();
  elements.message.style.display = 'none';
}

// Обновление интерфейса
function updateUI() {
  renderHand(GameState.dealerHand, elements.dealerCards, !GameState.gameOver);
  renderHand(GameState.playerHand, elements.playerCards, false);
  updateScores();
  updateButtons();
}

// Отрисовка карт
function renderHand(hand, container, hideFirstCard) {
  container.innerHTML = hand.map((card, index) => {
    const isRed = ['♥', '♦'].includes(card.suit);
    const isHidden = hideFirstCard && index === 0;
    return `
      <div class="card ${isRed ? 'red' : ''}">
        ${isHidden ? '🂠' : `${card.rank}${card.suit}`}
      </div>
    `;
  }).join('');
}
//function renderHand(hand, container, hideFirstCard) {
//  container.innerHTML = hand.map((card, index) => {
//    const isHidden = hideFirstCard && index === 0;
//    const suitClass = ['♥', '♦'].includes(card.suit) ? 
//      (card.suit === '♥' ? 'hearts' : 'diamonds') : 
//      (card.suit === '♠' ? 'spades' : 'clubs');
//    
//    if (isHidden) {
//      return `
//        <div class="card hidden ${suitClass}" data-suit="${card.suit}" data-rank="${card.rank}">
//          <div class="card-top">🂠</div>
//          <div class="card-center">🂠</div>
//          <div class="card-bottom">🂠</div>
//        </div>
//      `;
//    }
//    
//    return `
//      <div class="card ${suitClass}" data-suit="${card.suit}" data-rank="${card.rank}">
//        <div class="card-top">
//          <span>${card.rank}</span>
//          <span>${card.suit}</span>
//        </div>
//        <div class="card-center">${card.suit}</div>
//        <div class="card-bottom">
//          <span>${card.rank}</span>
//          <span>${card.suit}</span>
//        </div>
//      </div>
//    `;
//  }).join('');
//}

// Обновление счетов
function updateScores() {
  const dealerScore = GameState.gameOver 
    ? calculateScore(GameState.dealerHand)
    : GameState.dealerHand.length > 0 
      ? getCardValue(GameState.dealerHand[0].rank)
      : 0;
  
  const playerScore = calculateScore(GameState.playerHand);
  
  elements.dealerScore.textContent = GameState.gameOver ? dealerScore : `? + ${dealerScore - getCardValue(GameState.dealerHand[0].rank)}`;
  elements.playerScore.textContent = playerScore;
  
  if (playerScore === GameConfig.blackjackValue) {
    elements.playerScore.textContent += " (Blackjack 21)";
  } else if (playerScore > GameConfig.blackjackValue) {
    elements.playerScore.textContent += " (Перебор)";
  }
}

// Обновление кнопок
function updateButtons() {
  const playerScore = calculateScore(GameState.playerHand);
  
  elements.dealBtn.disabled = GameState.deck.length < 10 || !GameState.gameOver;
  elements.hitBtn.disabled = GameState.gameOver || playerScore >= GameConfig.blackjackValue;
  elements.standBtn.disabled = GameState.gameOver;
  elements.againBtn.disabled = !GameState.gameOver;
}

// Показать результат игры
function showResult() {
  const playerScore = calculateScore(GameState.playerHand);
  const dealerScore = calculateScore(GameState.dealerHand);
  
  let message = "";
  let messageClass = "";
  
  if (playerScore > GameConfig.blackjackValue) {
    message = "Перебор! Вы проиграли!";
    messageClass = "red";
  } else if (dealerScore > GameConfig.blackjackValue) {
    message = "Дилер перебрал! Вы выиграли!";
    messageClass = "green";
  } else if (playerScore > dealerScore) {
    message = "Поздравляем! Вы выиграли!";
    messageClass = "green";
  } else if (playerScore === dealerScore) {
    message = "Ничья!";
    messageClass = "";
  } else {
    message = "Вы проиграли!";
    messageClass = "red";
  }
  
  if (hasBlackjack(GameState.playerHand)) {
    message = "Blackjack! Вы выиграли!";
    messageClass = "green";
  }
  
  elements.message.textContent = message;
  elements.message.className = `message ${messageClass}`;
  elements.message.style.display = 'block';
}

// Настройка обработчиков событий
function setupEventListeners() {
  elements.dealBtn.addEventListener('click', deal);
  elements.hitBtn.addEventListener('click', hit);
  elements.standBtn.addEventListener('click', stand);
  elements.againBtn.addEventListener('click', resetGame);
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);
