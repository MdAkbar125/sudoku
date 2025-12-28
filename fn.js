const board = document.getElementById("board");
const message = document.getElementById("message");
const timeDisplay = document.getElementById("time");
const difficultySelect = document.getElementById("difficulty");
const congratsModal = document.getElementById("congratsModal");
const completionTimeDisplay = document.getElementById("completionTime");

let startTime, timerInterval;
let currentPuzzle = [];
let originalPuzzle = [];

const puzzles = {
  easy: {
    puzzle: [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ],
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ]
  },
  medium: {
    puzzle: [
      [0,0,0,2,6,0,7,0,1],
      [6,8,0,0,7,0,0,9,0],
      [1,9,0,0,0,4,5,0,0],
      [8,2,0,1,0,0,0,4,0],
      [0,0,4,6,0,2,9,0,0],
      [0,5,0,0,0,3,0,2,8],
      [0,0,9,3,0,0,0,7,4],
      [0,4,0,0,5,0,0,3,6],
      [7,0,3,0,1,8,0,0,0]
    ],
    solution: [
      [4,3,5,2,6,9,7,8,1],
      [6,8,2,5,7,1,4,9,3],
      [1,9,7,8,3,4,5,6,2],
      [8,2,6,1,9,5,3,4,7],
      [5,7,4,6,8,2,9,1,3],
      [9,5,1,7,4,3,6,2,8],
      [2,6,9,3,5,7,8,1,4],
      [3,4,8,9,5,6,2,7,1],
      [7,1,3,4,2,8,1,5,6]
    ]
  },
  hard: {
    puzzle: [
      [0,2,0,0,0,0,0,0,0],
      [0,0,0,6,0,0,0,0,3],
      [0,7,4,0,8,0,0,0,0],
      [0,0,0,0,0,3,0,0,2],
      [0,8,0,0,4,0,0,1,0],
      [6,0,0,5,0,0,0,0,0],
      [0,0,0,0,1,0,7,8,0],
      [5,0,0,0,0,9,0,0,0],
      [0,0,0,0,0,0,0,4,0]
    ],
    solution: [
      [1,2,6,4,3,7,9,5,8],
      [8,9,5,6,2,1,4,7,3],
      [3,7,4,9,8,5,1,2,6],
      [4,5,7,1,9,3,8,6,2],
      [9,8,3,2,4,6,5,1,7],
      [6,1,2,5,7,8,3,9,4],
      [2,6,9,3,1,4,7,8,5],
      [5,4,8,7,6,9,2,3,1],
      [7,3,1,8,5,2,6,4,9]
    ]
  }
};

function initGame() {
  changeDifficulty();
}

function createBoard() {
  board.innerHTML = "";
  message.textContent = "";
  message.style.color = "";
  message.style.backgroundColor = "";
  clearErrorClasses();

  const inputs = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("input");
      cell.type = "text";
      cell.maxLength = 1;
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (currentPuzzle[r][c] !== 0) {
        cell.value = currentPuzzle[r][c];
        cell.classList.add("prefilled");
      } else {
        cell.addEventListener("input", () => validate(cell));
        cell.addEventListener("keydown", handleKeyDown);
        cell.addEventListener("focus", () => cell.style.backgroundColor = "#e0f2fe");
        cell.addEventListener("blur", () => {
          if (!cell.classList.contains("error")) {
            cell.style.backgroundColor = "white";
          }
        });
      }

      board.appendChild(cell);
      inputs.push(cell);
    }
  }

  if (!timerInterval) {
    startTimer();
  }
}

function handleKeyDown(e) {
  const cell = e.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  
  if (!/[1-9]|Backspace|Arrow/.test(e.key)) {
    e.preventDefault();
    return;
  }

  const inputs = [...document.querySelectorAll("#board input")];
  const currentIndex = row * 9 + col;

  switch(e.key) {
    case 'ArrowRight':
      if (col < 8) inputs[currentIndex + 1].focus();
      e.preventDefault();
      break;
    case 'ArrowLeft':
      if (col > 0) inputs[currentIndex - 1].focus();
      e.preventDefault();
      break;
    case 'ArrowDown':
      if (row < 8) inputs[currentIndex + 9].focus();
      e.preventDefault();
      break;
    case 'ArrowUp':
      if (row > 0) inputs[currentIndex - 9].focus();
      e.preventDefault();
      break;
  }
}

function getGrid() {
  const inputs = [...document.querySelectorAll("#board input")];
  let grid = [];

  for (let r = 0; r < 9; r++) {
    grid[r] = [];
    for (let c = 0; c < 9; c++) {
      const val = inputs[r * 9 + c].value;
      grid[r][c] = val === "" ? 0 : parseInt(val);
    }
  }
  return grid;
}

function validate(cell) {
  message.textContent = "";
  message.style.color = "";
  message.style.backgroundColor = "";
  cell.classList.remove("error");

  if (!/^[1-9]$/.test(cell.value)) {
    cell.value = "";
    return;
  }

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const grid = getGrid();
  const num = grid[row][col];

  const error = checkError(grid, row, col, num);
  if (error) {
    cell.classList.add("error");
    cell.value = "";
    message.textContent = error;
    message.style.color = "#dc2626";
    message.style.backgroundColor = "#fecaca";
    return;
  }

  if (isCompleted(grid)) {
    stopTimer();
    showCongratulations();
  }
}

function showCongratulations() {
  const elapsed = new Date(new Date() - startTime);
  const minutes = elapsed.getUTCMinutes().toString().padStart(2, '0');
  const seconds = elapsed.getUTCSeconds().toString().padStart(2, '0');
  
  completionTimeDisplay.textContent = `${minutes}:${seconds}`;
  congratsModal.style.display = "block";
  createFireworks();
}

function closeCongratsModal() {
  congratsModal.style.display = "none";
  resetGame();
}

function createFireworks() {
  const fireworksContainer = document.querySelector('.fireworks');
  fireworksContainer.innerHTML = '';
  
  for (let i = 0; i < 8; i++) {
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.style.left = `${Math.random() * 80 + 10}%`;
    firework.style.animationDelay = `${Math.random() * 1}s`;
    firework.style.backgroundColor = getRandomColor();
    fireworksContainer.appendChild(firework);
  }
}

function getRandomColor() {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#ff0088'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function clearErrorClasses() {
  const cells = [...document.querySelectorAll("#board input")];
  cells.forEach(cell => {
    cell.classList.remove("error");
    if (!cell.classList.contains("prefilled")) {
      cell.style.backgroundColor = "white";
    }
  });
}

function checkError(grid, row, col, num) {
  for (let c = 0; c < 9; c++)
    if (c !== col && grid[row][c] === num)
      return `❌ Row ${row + 1} already has ${num}`;

  for (let r = 0; r < 9; r++)
    if (r !== row && grid[r][col] === num)
      return `❌ Column ${col + 1} already has ${num}`;

  const sr = Math.floor(row / 3) * 3;
  const sc = Math.floor(col / 3) * 3;

  for (let r = sr; r < sr + 3; r++)
    for (let c = sc; c < sc + 3; c++)
      if ((r !== row || c !== col) && grid[r][c] === num)
        return `❌ 3×3 Box conflict`;

  return null;
}

function isCompleted(grid) {
  if (!grid.every(row => row.every(cell => cell !== 0))) {
    return false;
  }
  
  const difficulty = difficultySelect.value;
  const solution = puzzles[difficulty].solution;
  
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== solution[r][c]) {
        return false;
      }
    }
  }
  
  return true;
}

function startTimer() {
  startTime = new Date();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
  updateTimer();
}

function updateTimer() {
  const elapsed = new Date(new Date() - startTime);
  const minutes = elapsed.getUTCMinutes().toString().padStart(2, '0');
  const seconds = elapsed.getUTCSeconds().toString().padStart(2, '0');
  timeDisplay.textContent = `${minutes}:${seconds}`;
}

function stopTimer() {
  clearInterval(timerInterval);
}

function changeDifficulty() {
  const difficulty = difficultySelect.value;
  const puzzleData = puzzles[difficulty];
  
  currentPuzzle = JSON.parse(JSON.stringify(puzzleData.puzzle));
  originalPuzzle = JSON.parse(JSON.stringify(puzzleData.puzzle));
  
  createBoard();
  startTimer();
}

function newGame() {
  changeDifficulty();
  if (congratsModal.style.display === "block") {
    closeCongratsModal();
  }
}

function resetGame() {
  currentPuzzle = JSON.parse(JSON.stringify(originalPuzzle));
  createBoard();
  startTimer();
}

window.onclick = function(event) {
  if (event.target == congratsModal) {
    closeCongratsModal();
  }
}

window.onload = initGame;