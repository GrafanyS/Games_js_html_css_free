const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const resetButton = document.getElementById('reset');

let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

function handleCellClick(e) {
  const clickedCell = e.target;
  const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

  if (gameState[clickedCellIndex] !== '' || !gameActive) return;

  updateCell(clickedCell, clickedCellIndex);
  checkResult();
}

function updateCell(cell, index) {
  gameState[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer);
}

function changePlayer() {
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  status.textContent = `Ход: ${currentPlayer}`;
}

function checkResult() {
  let roundWon = false;
  
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') continue;
    
    if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
      roundWon = true;
      break;
    }
  }
  
  if (roundWon) {
    status.textContent = `Игрок ${currentPlayer} победил!`;
    gameActive = false;
    return;
  }
  
  if (!gameState.includes('')) {
    status.textContent = 'Ничья!';
    gameActive = false;
    return;
  }
  
  changePlayer();
}

function resetGame() {
  currentPlayer = 'X';
  gameState = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  status.textContent = `Ход: ${currentPlayer}`;
  
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('X', 'O');
  });
}

function setupEventListeners() {
  cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
  });
  
  resetButton.addEventListener('click', resetGame);
}

// Инициализация игры
setupEventListeners();
status.textContent = `Ход: ${currentPlayer}`;
