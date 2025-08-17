// ==================== GAME VARIABLES ====================
const cells = document.querySelectorAll('.cell1');
const crossBtn = document.querySelector('.cross');
const circleBtn = document.querySelector('.circle');
const resetBtn = document.querySelector('.reset');
const chooseText = document.querySelector('.text');
const modeAI = document.querySelector('.mode-ai');
const modeMulti = document.querySelector('.mode-multi');

let mode = ""; // "ai" or "multi"
let boardArray = ["", "", "", "", "", "", "", "", ""]; // Multiplayer board
let boardAI = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
]; // AI board
let HUMAN = -1;
let COMP = +1;
let currentPlayer = "";
let otherPlayer = "";
let gameOverFlag = false;

// ==================== INIT ====================
disableBoard(true);

// ==================== MODE SELECTION ====================
modeAI.addEventListener('click', () => {
    mode = "ai";
    chooseText.textContent = "Choose X or O";
    crossBtn.classList.remove("selected");
    circleBtn.classList.remove("selected");
});

modeMulti.addEventListener('click', () => {
    mode = "multi";
    chooseText.textContent = "Choose X or O";
    crossBtn.classList.remove("selected");
    circleBtn.classList.remove("selected");
});

// ==================== PLAYER SELECTION ====================
crossBtn.addEventListener('click', () => {
    if (!mode) return;
    currentPlayer = 'X';
    otherPlayer = 'O';
    highlightSelection('X');
    startGame();
});

circleBtn.addEventListener('click', () => {
    if (!mode) return;
    currentPlayer = 'O';
    otherPlayer = 'X';
    highlightSelection('O');
    startGame();
});

// ==================== START GAME ====================
function startGame() {
    clearBoard();
    disableBoard(false);

    if (mode === "ai") {
        boardAI = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        chooseText.textContent = `${currentPlayer}'s Turn`;
        if (currentPlayer === 'O') {
            aiTurn();
        }
    } else {
        chooseText.textContent = `${currentPlayer}'s Turn`;
    }
}

// ==================== CELL CLICKS ====================
cells.forEach((cell, index) => {
    cell.addEventListener('click', () => {
        if (gameOverFlag) return;

        if (mode === "multi") {
            if (boardArray[index] !== "") return;
            boardArray[index] = currentPlayer;
            cell.innerHTML = getSymbolHTML(currentPlayer);

            if (checkWinnerMulti()) {
                chooseText.textContent = `${currentPlayer} Wins!`;
                gameOverFlag = true;
                disableBoard(true);
                return;
            }

            if (boardArray.every(c => c !== "")) {
                chooseText.textContent = "Draw!";
                gameOverFlag = true;
                disableBoard(true);
                return;
            }

            [currentPlayer, otherPlayer] = [otherPlayer, currentPlayer];
            chooseText.textContent = `${currentPlayer}'s Turn`;

        } else if (mode === "ai") {
            let x = Math.floor(index / 3);
            let y = index % 3;

            if (!validMove(x, y)) return;
            setMove(x, y, HUMAN);
            cell.innerHTML = getSymbolHTML(currentPlayer);

            if (gameOver(boardAI, HUMAN)) {
                chooseText.textContent = "You Win!";
                gameOverFlag = true;
                disableBoard(true);
                return;
            }
            if (emptyCells(boardAI).length === 0) {
                chooseText.textContent = "Draw!";
                gameOverFlag = true;
                disableBoard(true);
                return;
            }
            aiTurn();
        }
    });
});

// ==================== RESET BUTTON ====================
resetBtn.addEventListener('click', () => {
    clearBoard();
    disableBoard(true);
    currentPlayer = "";
    otherPlayer = "";
    mode = "";
    gameOverFlag = false;

    crossBtn.classList.remove("selected");
    circleBtn.classList.remove("selected");
    chooseText.textContent = "Choose Mode";
});

// ==================== HELPERS ====================
function clearBoard() {
    boardArray = ["", "", "", "", "", "", "", "", ""];
    boardAI = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.style.color = "#444";
    });
    gameOverFlag = false;
}

function getSymbolHTML(player) {
    if (player === 'X') {
        return `<img class="cr" src="cross.png" alt="Cross">`;
    } else {
        return `<img src="circle.png" alt="Circle">`;
    }
}

function checkWinnerMulti() {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    return wins.some(([a,b,c]) => boardArray[a] && boardArray[a] === boardArray[b] && boardArray[a] === boardArray[c]);
}

function disableBoard(state) {
    cells.forEach(cell => {
        cell.style.pointerEvents = state ? "none" : "auto";
    });
}

function highlightSelection(player) {
    crossBtn.classList.remove("selected");
    circleBtn.classList.remove("selected");
    if (player === 'X') {
        crossBtn.classList.add("selected");
    } else {
        circleBtn.classList.add("selected");
    }
}

// ==================== AI MINIMAX LOGIC ====================
function evalute(state) {
    if (gameOver(state, COMP)) return +1;
    if (gameOver(state, HUMAN)) return -1;
    return 0;
}

function gameOver(state, player) {
    const win_state = [
        [state[0][0], state[0][1], state[0][2]],
        [state[1][0], state[1][1], state[1][2]],
        [state[2][0], state[2][1], state[2][2]],
        [state[0][0], state[1][0], state[2][0]],
        [state[0][1], state[1][1], state[2][1]],
        [state[0][2], state[1][2], state[2][2]],
        [state[0][0], state[1][1], state[2][2]],
        [state[2][0], state[1][1], state[0][2]],
    ];
    return win_state.some(line => line.every(cell => cell === player));
}

function gameOverAll(state) {
    return gameOver(state, HUMAN) || gameOver(state, COMP);
}

function emptyCells(state) {
    let cells = [];
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            if (state[x][y] === 0) cells.push([x, y]);
        }
    }
    return cells;
}

function validMove(x, y) {
    return boardAI[x][y] === 0;
}

function setMove(x, y, player) {
    if (validMove(x, y)) {
        boardAI[x][y] = player;
        return true;
    }
    return false;
}

function minimax(state, depth, player) {
    let best = (player === COMP) ? [-1, -1, -1000] : [-1, -1, 1000];

    if (depth === 0 || gameOverAll(state)) {
        return [-1, -1, evalute(state)];
    }

    emptyCells(state).forEach(cell => {
        let [x, y] = cell;
        state[x][y] = player;
        let score = minimax(state, depth - 1, -player);
        state[x][y] = 0;
        score[0] = x;
        score[1] = y;

        if (player === COMP) {
            if (score[2] > best[2]) best = score;
        } else {
            if (score[2] < best[2]) best = score;
        }
    });
    return best;
}

function aiTurn() {
    if (gameOverFlag) return;
    let x, y;
    if (emptyCells(boardAI).length === 9) {
        x = Math.floor(Math.random() * 3);
        y = Math.floor(Math.random() * 3);
    } else {
        let move = minimax(boardAI, emptyCells(boardAI).length, COMP);
        x = move[0];
        y = move[1];
    }
    setMove(x, y, COMP);
    let index = x * 3 + y;
    cells[index].innerHTML = getSymbolHTML(otherPlayer);
    if (gameOver(boardAI, COMP)) {
        chooseText.textContent = "AI Wins!";
        gameOverFlag = true;
        disableBoard(true);
    } else if (emptyCells(boardAI).length === 0) {
        chooseText.textContent = "Draw!";
        gameOverFlag = true;
        disableBoard(true);
    }
}
