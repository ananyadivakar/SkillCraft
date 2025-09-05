document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('board');
  const messageEl = document.getElementById('message');
  const resetBtn = document.getElementById('resetBtn');
  const modeRadios = document.querySelectorAll('input[name="mode"]');

  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  let board = Array(9).fill('');
  let gameActive = false;
  let currentPlayer = 'X'; // used for PvP
  const HUMAN = 'X', AI = 'O';

  function getMode() {
    return document.querySelector('input[name="mode"]:checked').value; // 'pvp' or 'ai'
  }

  function initGame() {
    board = Array(9).fill('');
    gameActive = true;
    currentPlayer = 'X';
    render();
    messageEl.textContent = getMode() === 'ai' ? 'Your turn (X)' : `Player ${currentPlayer}'s turn`;
  }

  function render() {
    boardEl.innerHTML = '';
    board.forEach((val, idx) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = idx;
      cell.textContent = val;
      cell.addEventListener('click', onCellClick);
      boardEl.appendChild(cell);
    });
  }

  function onCellClick(e) {
    if (!gameActive) return;
    const idx = Number(e.currentTarget.dataset.index);
    if (board[idx] !== '') return;

    const mode = getMode();

    if (mode === 'pvp') {
      // Player vs Player
      placeMove(idx, currentPlayer);
      const res = evaluateBoard();
      if (handleResult(res)) return;
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      messageEl.textContent = `Player ${currentPlayer}'s turn`;
    } else {
      // Player vs Computer (human is X)
      placeMove(idx, HUMAN);
      let res = evaluateBoard();
      if (handleResult(res)) return;

      // AI move (delay to simulate thinking)
      messageEl.textContent = "Computer's turn...";
      setTimeout(() => {
        if (!gameActive) return;
        const aiIndex = findBestMove(board);
        // safety fallback
        const moveIndex = (typeof aiIndex === 'number') ? aiIndex : randomEmptyIndex(board);
        placeMove(moveIndex, AI);
        const res2 = evaluateBoard();
        if (handleResult(res2)) return;
        if (gameActive) messageEl.textContent = 'Your turn (X)';
      }, 240);
    }
  }

  function placeMove(idx, player) {
    board[idx] = player;
    const cell = boardEl.querySelector(`.cell[data-index="${idx}"]`);
    if (cell) cell.textContent = player;
  }

  function evaluateBoard() {
    // return { winner: 'X'|'O'|null, pattern: [i,i,i]|null, draw: bool }
    for (const p of winPatterns) {
      const [a,b,c] = p;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], pattern: p, draw: false };
      }
    }
    if (board.every(cell => cell !== '')) return { winner: null, pattern: null, draw: true };
    return { winner: null, pattern: null, draw: false };
  }

  function handleResult(result) {
    if (result.winner) {
      gameActive = false;
      highlightPattern(result.pattern);
      messageEl.textContent = result.winner === HUMAN ? 'You win! 🎉' : 'Computer wins 😢';
      return true;
    }
    if (result.draw) {
      gameActive = false;
      messageEl.textContent = "It's a draw!";
      return true;
    }
    return false;
  }

  function highlightPattern(pattern) {
    if (!pattern) return;
    pattern.forEach(i => {
      const el = boardEl.querySelector(`.cell[data-index="${i}"]`);
      if (el) el.classList.add('highlight');
    });
  }

  function randomEmptyIndex(b) {
    const empties = b.map((v,i) => v === '' ? i : null).filter(i => i !== null);
    return empties.length ? empties[Math.floor(Math.random() * empties.length)] : null;
  }

  // === Minimax algorithm ===
  function findBestMove(b) {
    let bestScore = -Infinity;
    let bestMoves = [];
    const empties = b.map((v,i) => v === '' ? i : null).filter(i => i !== null);
    if (!empties.length) return null;

    for (const idx of empties) {
      b[idx] = AI;
      const score = minimax(b, 0, false);
      b[idx] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [idx];
      } else if (score === bestScore) {
        bestMoves.push(idx);
      }
    }
    // if multiple best moves, choose random among them (adds variety)
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  function minimax(boardState, depth, isMaximizing) {
    const result = winnerFromBoard(boardState);
    if (result === AI) return 10 - depth;
    if (result === HUMAN) return depth - 10;
    if (result === 'draw') return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === '') {
          boardState[i] = AI;
          const evalScore = minimax(boardState, depth + 1, false);
          boardState[i] = '';
          maxEval = Math.max(maxEval, evalScore);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === '') {
          boardState[i] = HUMAN;
          const evalScore = minimax(boardState, depth + 1, true);
          boardState[i] = '';
          minEval = Math.min(minEval, evalScore);
        }
      }
      return minEval;
    }
  }

  function winnerFromBoard(b) {
    for (const p of winPatterns) {
      const [a,b1,c] = p;
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    if (b.every(cell => cell !== '')) return 'draw';
    return null;
  }
  // === end minimax ===

  // Event wiring
  resetBtn.addEventListener('click', initGame);
  modeRadios.forEach(r => r.addEventListener('change', initGame));

  // start
  initGame();
});
