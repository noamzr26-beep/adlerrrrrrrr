const board = document.getElementById('board');
const status = document.getElementById('status');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreOLabel = document.getElementById('scoreOLabel');
const modeSelect = document.getElementById('modeSelect');
const modeHint = document.getElementById('modeHint');
const resetBtn = document.getElementById('resetBtn');
const newGameBtn = document.getElementById('newGameBtn');

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let gameBoard = Array(9).fill('');
let currentPlayer = 'X';
let isGameOver = false;
let score = { X: 0, O: 0 };
let aiMode = false;

function updateStatus(message) {
  status.textContent = message;
}

function updateModeHint() {
  if (aiMode) {
    scoreOLabel.textContent = 'AI';
    modeHint.textContent = 'אתה משחק X, וה-AI משחק O.';
  } else {
    scoreOLabel.textContent = 'שחקן O';
    modeHint.textContent = 'שני שחקנים משחקים לסירוגין.';
  }
}

function checkWinner(boardState) {
  for (const [a, b, c] of winningCombos) {
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return boardState[a];
    }
  }
  return null;
}

function getAvailableMoves(boardState) {
  return boardState
    .map((cell, index) => (cell === '' ? index : null))
    .filter((index) => index !== null);
}

function getWinningMove(boardState, symbol) {
  for (const index of getAvailableMoves(boardState)) {
    const next = [...boardState];
    next[index] = symbol;
    if (checkWinner(next) === symbol) {
      return index;
    }
  }
  return null;
}

function pickAiMove() {
  const human = currentPlayer === 'X' ? 'O' : 'X';

  const winningMove = getWinningMove(gameBoard, 'O');
  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove = getWinningMove(gameBoard, human);
  if (blockingMove !== null) {
    return blockingMove;
  }

  const center = 4;
  if (gameBoard[center] === '') {
    return center;
  }

  const corners = [0, 2, 6, 8].filter((index) => gameBoard[index] === '');
  if (corners.length > 0) {
    return corners[0];
  }

  const edges = [1, 3, 5, 7].filter((index) => gameBoard[index] === '');
  return edges[0] ?? null;
}

function renderBoard() {
  board.innerHTML = '';

  gameBoard.forEach((value, index) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell';
    cell.textContent = value;
    cell.disabled = !!value || isGameOver || (aiMode && currentPlayer === 'O');
    cell.setAttribute('aria-label', `משבצת ${index + 1}`);

    cell.addEventListener('click', () => handleMove(index));
    board.appendChild(cell);
  });
}

function endGame(winner) {
  isGameOver = true;

  if (winner) {
    score[winner] += 1;
    scoreX.textContent = score.X;
    scoreO.textContent = score.O;
    updateStatus(`הניצחון ללוחם ${winner}!`);

    const cells = board.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
      if (gameBoard[index] === winner) {
        cell.classList.add(`winner-${winner.toLowerCase()}`);
      }
    });
  } else {
    updateStatus('תיקו!');
  }

  renderBoard();
}

function finishTurn() {
  const winner = checkWinner(gameBoard);

  if (winner) {
    endGame(winner);
    return;
  }

  if (!gameBoard.includes('')) {
    endGame(null);
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus(`תור: ${currentPlayer}`);
  renderBoard();

  if (aiMode && currentPlayer === 'O') {
    const aiMove = pickAiMove();
    if (aiMove !== null) {
      handleMove(aiMove);
    }
  }
}

function handleMove(index) {
  if (isGameOver || gameBoard[index]) return;
  if (aiMode && currentPlayer === 'O') return;

  gameBoard[index] = currentPlayer;
  finishTurn();
}

function resetBoard() {
  gameBoard = Array(9).fill('');
  currentPlayer = 'X';
  isGameOver = false;
  updateStatus(`תור: ${currentPlayer}`);
  renderBoard();
}

function newGame() {
  resetBoard();
  score = { X: 0, O: 0 };
  scoreX.textContent = '0';
  scoreO.textContent = '0';
}

modeSelect.addEventListener('change', (event) => {
  aiMode = event.target.value === 'ai';
  updateModeHint();
  newGame();
});

resetBtn.addEventListener('click', resetBoard);
newGameBtn.addEventListener('click', newGame);

updateModeHint();
renderBoard();
updateStatus(`תור: ${currentPlayer}`);
