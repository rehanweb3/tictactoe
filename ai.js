let aiBoard = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
];
const HUMAN = -1;
const COMP = 1;

function syncBoards() {
    aiBoard = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ];
    board.forEach((val, idx) => {
        const x = Math.floor(idx / 3);
        const y = idx % 3;
        aiBoard[x][y] = val === 'X' ? HUMAN : val === 'O' ? COMP : 0;
    });
}

function resetAIBoard() {
    aiBoard = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ];
}

function evalute(state) {
    let score = 0;
    if (gameOver(state, COMP)) {
        score = 1;
    } else if (gameOver(state, HUMAN)) {
        score = -1;
    } else {
        score = 0;
    }
    return score;
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

    for (let i = 0; i < 8; i++) {
        const line = win_state[i];
        let filled = 0;
        for (let j = 0; j < 3; j++) {
            if (line[j] === player) filled++;
        }
        if (filled === 3) return true;
    }
    return false;
}

function gameOverAll(state) {
    return gameOver(state, HUMAN) || gameOver(state, COMP);
}

function emptyCells(state) {
    const cells = [];
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            if (state[x][y] === 0) cells.push([x, y]);
        }
    }
    return cells;
}

function validMove(x, y) {
    try {
        return aiBoard[x][y] === 0;
    } catch (e) {
        return false;
    }
}

function setMove(x, y, player) {
    if (validMove(x, y)) {
        aiBoard[x][y] = player;
        const idx = x * 3 + y;
        board[idx] = player === HUMAN ? 'X' : 'O';
        return true;
    }
    return false;
}

function minimax(state, depth, player) {
    let best;

    if (player === COMP) {
        best = [-1, -1, -1000];
    } else {
        best = [-1, -1, 1000];
    }

    if (depth === 0 || gameOverAll(state)) {
        const score = evalute(state);
        return [-1, -1, score];
    }

    emptyCells(state).forEach(cell => {
        const x = cell[0];
        const y = cell[1];
        state[x][y] = player;
        const score = minimax(state, depth - 1, -player);
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
    syncBoards();
    let x, y;
    if (emptyCells(aiBoard).length === 9) {
        x = Math.floor(Math.random() * 3);
        y = Math.floor(Math.random() * 3);
    } else {
        const move = minimax(aiBoard, emptyCells(aiBoard).length, COMP);
        x = move[0];
        y = move[1];
    }

    if (setMove(x, y, COMP)) {
        const cell = document.getElementById(`${x}${y}`);
        cell.innerHTML = getSymbolHTML('O');
        board[x * 3 + y] = 'O';

        if (checkWinner()) {
            chooseText.textContent = "AI Wins!";
            gameOver = true;
            disableBoard(true);
            return;
        }

        if (board.every(c => c !== "")) {
            chooseText.textContent = "Draw!";
            gameOver = true;
            disableBoard(true);
            return;
        }

        chooseText.textContent = `${currentPlayer}'s Turn`;
    }
}

function handleAIMove(cell, index) {
    if (board[index] !== "" || gameOver) return;

    const x = Math.floor(index / 3);
    const y = index % 3;

    if (setMove(x, y, HUMAN)) {
        cell.innerHTML = getSymbolHTML('X');
        board[index] = 'X';

        if (checkWinner()) {
            chooseText.textContent = `${currentPlayer} Wins!`;
            gameOver = true;
            disableBoard(true);
            return;
        }

        if (board.every(c => c !== "")) {
            chooseText.textContent = "Draw!";
            gameOver = true;
            disableBoard(true);
            return;
        }

        setTimeout(aiTurn, 500);
    }
}