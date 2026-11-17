
// ==========================================
// AI WORD SEARCH PUZZLE
// 7 x 7 GRID
// HORIZONTAL AND VERTICAL ONLY
// ==========================================

const ROWS = 7;
const COLS = 7;

const WORDS = [
    "BINARY",
    "NEURAL",
    "ROBOT",
    "LOGIC",
    "DATA",
    "CODE",
    "AI"
];

const DIRECTIONS = [
    [0, 1],   // Horizontal right
    [0, -1],  // Horizontal left
    [1, 0],   // Vertical down
    [-1, 0]   // Vertical up
];

const LEADERBOARD_KEY = "aiWordSearchLeaderboard";

let grid = [];
let placements = [];
let foundWords = [];
let selectedCells = [];

let playerName = "Player";
let elapsedSeconds = 0;
let hintsRemaining = 3;

let timerInterval = null;
let hintTimer = null;

let isSelecting = false;
let gameStarted = false;
let gameFinished = false;


// ==========================================
// HTML ELEMENTS
// ==========================================

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const leaderboardScreen = document.getElementById("leaderboardScreen");

const wordGrid = document.getElementById("wordGrid");
const wordList = document.getElementById("wordList");

const timerElement = document.getElementById("timer");
const hintsCount = document.getElementById("hintsCount");
const foundCount = document.getElementById("foundCount");

const message = document.getElementById("message");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const hintBtn = document.getElementById("hintBtn");


// ==========================================
// BUTTON EVENTS
// ==========================================

document.getElementById("startBtn").addEventListener("click", () => {

    const enteredName =
        document.getElementById("playerNameInput").value.trim();

    if (!enteredName) {
        alert("Please enter your name!");
        return;
    }

    playerName = enteredName;

    document.getElementById("displayPlayerName").textContent = playerName;

    startScreen.classList.add("hidden");
    leaderboardScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    newGame();
});


document.getElementById("playerNameInput")
.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        document.getElementById("startBtn").click();
    }

});


document.getElementById("homeBtn").addEventListener("click", () => {

    stopTimer();

    gameScreen.classList.add("hidden");
    leaderboardScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");

});


document.getElementById("newPuzzleBtn")
.addEventListener("click", newGame);


document.getElementById("hintBtn")
.addEventListener("click", showHint);


document.getElementById("leaderboardBtn")
.addEventListener("click", showLeaderboard);


document.getElementById("backToGameBtn")
.addEventListener("click", () => {

    leaderboardScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

});


document.getElementById("backHomeBtn")
.addEventListener("click", () => {

    stopTimer();

    leaderboardScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");

});


document.getElementById("playAgainBtn")
.addEventListener("click", () => {

    document.getElementById("completionPopup")
        .classList.add("hidden");

    newGame();

});


document.getElementById("viewLeaderboardBtn")
.addEventListener("click", () => {

    document.getElementById("completionPopup")
        .classList.add("hidden");

    showLeaderboard();

});


// ==========================================
// NEW GAME
// ==========================================

function newGame() {

    stopTimer();

    if (hintTimer) {
        clearTimeout(hintTimer);
        hintTimer = null;
    }

    document.getElementById("completionPopup")
        .classList.add("hidden");

    elapsedSeconds = 0;
    hintsRemaining = 3;

    foundWords = [];
    selectedCells = [];

    isSelecting = false;
    gameStarted = false;
    gameFinished = false;

    timerElement.textContent = "00:00";
    hintsCount.textContent = hintsRemaining;

    foundCount.textContent = `0 / ${WORDS.length}`;

    hintBtn.disabled = false;

    message.textContent = "Drag horizontally or vertically to find words!";

    updateProgress();
    renderFoundWords();

    generatePuzzle();
    renderGrid();

}


// ==========================================
// GENERATE RANDOM 7 x 7 PUZZLE
// ==========================================

function generatePuzzle() {

    let success = false;
    let attempts = 0;

    while (!success && attempts < 1000) {

        attempts++;

        grid = Array.from(
            { length: ROWS },
            () => Array(COLS).fill("")
        );

        placements = [];

        // Place longest words first
        const sortedWords = [...WORDS].sort(
            (a, b) => b.length - a.length
        );

        success = sortedWords.every(placeWord);

    }

    if (!success) {
        throw new Error("Unable to generate puzzle. Please try again.");
    }

    // Fill empty cells with random letters
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            if (grid[row][col] === "") {

                grid[row][col] =
                    letters[Math.floor(Math.random() * letters.length)];

            }

        }

    }

}


// ==========================================
// PLACE WORDS HORIZONTALLY / VERTICALLY
// ==========================================

function placeWord(word) {

    const shuffledDirections = [...DIRECTIONS]
        .sort(() => Math.random() - 0.5);

    for (let attempt = 0; attempt < 200; attempt++) {

        const [dr, dc] = shuffledDirections[
            Math.floor(Math.random() * shuffledDirections.length)
        ];

        const startRow = Math.floor(Math.random() * ROWS);
        const startCol = Math.floor(Math.random() * COLS);

        const endRow = startRow + (word.length - 1) * dr;
        const endCol = startCol + (word.length - 1) * dc;

        // Check grid boundaries
        if (
            endRow < 0 || endRow >= ROWS ||
            endCol < 0 || endCol >= COLS
        ) {
            continue;
        }

        let canPlace = true;

        // Check overlapping letters
        for (let i = 0; i < word.length; i++) {

            const row = startRow + i * dr;
            const col = startCol + i * dc;

            const existing = grid[row][col];

            if (existing !== "" && existing !== word[i]) {

                canPlace = false;
                break;

            }

        }

        if (!canPlace) continue;

        const cells = [];

        // Place the word
        for (let i = 0; i < word.length; i++) {

            const row = startRow + i * dr;
            const col = startCol + i * dc;

            grid[row][col] = word[i];

            cells.push({ row, col });

        }

        placements.push({
            word: word,
            cells: cells
        });

        return true;

    }

    return false;

}


// ==========================================
// DISPLAY GRID
// ==========================================

function renderGrid() {

    wordGrid.innerHTML = "";

    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            const cell = document.createElement("div");

            cell.className = "letter-cell";
            cell.textContent = grid[row][col];

            cell.dataset.row = row;
            cell.dataset.col = col;

            wordGrid.appendChild(cell);

        }

    }

}


// ==========================================
// TIMER
// ==========================================

function startTimer() {

    if (timerInterval || gameFinished) return;

    timerInterval = setInterval(() => {

        elapsedSeconds++;

        updateTimer();

    }, 1000);

}


function stopTimer() {

    if (timerInterval) {

        clearInterval(timerInterval);
        timerInterval = null;

    }

}


function updateTimer() {

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    timerElement.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

}


// ==========================================
// DRAG SELECTION
// HORIZONTAL AND VERTICAL ONLY
// ==========================================

wordGrid.addEventListener("pointerdown", event => {

    if (gameFinished) return;

    const cell = event.target.closest(".letter-cell");

    if (!cell || !wordGrid.contains(cell)) return;

    if (!gameStarted) {

        gameStarted = true;
        startTimer();

    }

    isSelecting = true;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    selectedCells = [{ row, col }];

    renderSelection();

});


document.addEventListener("pointermove", event => {

    if (!isSelecting || gameFinished) return;

    const cell = document.elementFromPoint(
        event.clientX,
        event.clientY
    );

    if (!cell || !cell.classList.contains("letter-cell")) return;

    if (!wordGrid.contains(cell)) return;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    updateSelection(row, col);

});


document.addEventListener("pointerup", () => {

    if (!isSelecting) return;

    isSelecting = false;

    checkSelectedWord();

});


document.addEventListener("pointercancel", () => {

    isSelecting = false;
    selectedCells = [];
    clearSelection();

});


// ==========================================
// UPDATE SELECTION
// ONLY STRAIGHT HORIZONTAL / VERTICAL
// ==========================================

function updateSelection(endRow, endCol) {

    if (selectedCells.length === 0) return;

    const start = selectedCells[0];

    const rowDifference = endRow - start.row;
    const colDifference = endCol - start.col;

    // Reject diagonal selection
    if (rowDifference !== 0 && colDifference !== 0) {
        return;
    }

    const rowStep = Math.sign(rowDifference);
    const colStep = Math.sign(colDifference);

    const distance = Math.max(
        Math.abs(rowDifference),
        Math.abs(colDifference)
    );

    const newSelection = [];

    for (let i = 0; i <= distance; i++) {

        newSelection.push({

            row: start.row + i * rowStep,
            col: start.col + i * colStep

        });

    }

    selectedCells = newSelection;

    renderSelection();

}


// ==========================================
// SELECTION COLOUR
// ==========================================

function renderSelection() {

    clearSelection();

    selectedCells.forEach(position => {

        const cell = getCell(position.row, position.col);

        if (cell && !cell.classList.contains("found")) {

            cell.classList.add("selected");

        }

    });

}


function clearSelection() {

    document.querySelectorAll(".letter-cell.selected")
        .forEach(cell => {

            cell.classList.remove("selected");

        });

}


function getCell(row, col) {

    return wordGrid.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );

}


// ==========================================
// CHECK SELECTED WORD
// ==========================================

function checkSelectedWord() {

    if (selectedCells.length === 0) return;

    const selectedWord = selectedCells.map(position => {

        return grid[position.row][position.col];

    }).join("");

    const matchedPlacement = placements.find(placement => {

        if (foundWords.includes(placement.word)) return false;

        return (
            samePath(selectedCells, placement.cells) ||
            samePath(selectedCells, [...placement.cells].reverse())
        );

    });

    clearSelection();

    if (matchedPlacement) {

        markWordFound(matchedPlacement);

    } else {

        message.textContent =
            `"${selectedWord}" is not a hidden word. Try again!`;

    }

    selectedCells = [];

}


// ==========================================
// COMPARE WORD COORDINATES
// ==========================================

function samePath(path1, path2) {

    if (path1.length !== path2.length) return false;

    return path1.every((position, index) => {

        return (
            position.row === path2[index].row &&
            position.col === path2[index].col
        );

    });

}


// ==========================================
// MARK WORD FOUND
// ==========================================

function markWordFound(placement) {

    const word = placement.word;

    if (foundWords.includes(word)) return;

    foundWords.push(word);

    placement.cells.forEach(position => {

        const cell = getCell(position.row, position.col);

        if (cell) {
            cell.classList.add("found");
        }

    });

    message.textContent = `Correct! You found ${word} 🎉`;

    renderFoundWords();
    updateProgress();

    if (foundWords.length === WORDS.length) {

        finishGame();

    }

}


// ==========================================
// DISPLAY ONLY FOUND WORDS
// ==========================================

function renderFoundWords() {

    wordList.innerHTML = "";

    if (foundWords.length === 0) {

        wordList.innerHTML = `
            <p class="empty-message">
                No words found yet. Start searching!
            </p>
        `;

        return;

    }

    foundWords.forEach(word => {

        const item = document.createElement("div");

        item.className = "found-word";

        const name = document.createElement("span");
        name.textContent = word;

        const status = document.createElement("small");
        status.textContent = "✓ Found";

        item.appendChild(name);
        item.appendChild(status);

        wordList.appendChild(item);

    });

}


// ==========================================
// UPDATE PROGRESS
// ==========================================

function updateProgress() {

    const percentage = Math.round(
        (foundWords.length / WORDS.length) * 100
    );

    foundCount.textContent =
        `${foundWords.length} / ${WORDS.length}`;

    progressFill.style.width = percentage + "%";

    progressText.textContent =
        percentage + "% Completed";

}


// ==========================================
// HINT SYSTEM
// ==========================================

function showHint() {

    if (gameFinished) return;

    if (hintsRemaining <= 0) {

        message.textContent = "No hints remaining!";

        return;

    }

    const remainingPlacements = placements.filter(placement => {

        return !foundWords.includes(placement.word);

    });

    if (remainingPlacements.length === 0) return;

    hintsRemaining--;

    hintsCount.textContent = hintsRemaining;

    const randomPlacement = remainingPlacements[
        Math.floor(Math.random() * remainingPlacements.length)
    ];

    const firstCell = randomPlacement.cells[0];

    if (hintTimer) {
        clearTimeout(hintTimer);
    }

    document.querySelectorAll(".letter-cell.hint-cell")
        .forEach(cell => cell.classList.remove("hint-cell"));

    const hintCell = getCell(firstCell.row, firstCell.col);

    if (hintCell) {
        hintCell.classList.add("hint-cell");
    }

    message.textContent =
        `Hint: Find a word starting with ${randomPlacement.word[0]}!`;

    if (hintsRemaining === 0) {
        hintBtn.disabled = true;
    }

    hintTimer = setTimeout(() => {

        document.querySelectorAll(".letter-cell.hint-cell")
            .forEach(cell => cell.classList.remove("hint-cell"));

        hintTimer = null;

    }, 2500);

}


// ==========================================
// FINISH GAME
// ==========================================

function finishGame() {

    gameFinished = true;

    stopTimer();

    hintBtn.disabled = true;

    const hintsUsed = 3 - hintsRemaining;

    const score = elapsedSeconds + (hintsUsed * 30);

    saveScore({

        name: playerName,
        time: elapsedSeconds,
        hints: hintsUsed,
        score: score,
        date: new Date().toISOString()

    });

    document.getElementById("finalTime").textContent =
        timerElement.textContent;

    document.getElementById("finalScore").textContent =
        score + " points";

    message.textContent = "Puzzle completed successfully!";

    document.getElementById("completionPopup")
        .classList.remove("hidden");

}


// ==========================================
// SAVE LEADERBOARD
// ==========================================

function saveScore(newScore) {

    let scores = [];

    try {

        scores = JSON.parse(
            localStorage.getItem(LEADERBOARD_KEY)
        ) || [];

        if (!Array.isArray(scores)) scores = [];

    } catch (error) {

        scores = [];

    }

    scores.push(newScore);

    scores.sort((a, b) => a.score - b.score);

    scores = scores.slice(0, 10);

    localStorage.setItem(
        LEADERBOARD_KEY,
        JSON.stringify(scores)
    );

}


// ==========================================
// DISPLAY LEADERBOARD
// ==========================================

function showLeaderboard() {

    stopTimer();

    gameScreen.classList.add("hidden");
    startScreen.classList.add("hidden");

    leaderboardScreen.classList.remove("hidden");

    const tbody = document.getElementById("leaderboardBody");

    tbody.innerHTML = "";

    let scores = [];

    try {

        scores = JSON.parse(
            localStorage.getItem(LEADERBOARD_KEY)
        ) || [];

        if (!Array.isArray(scores)) scores = [];

    } catch (error) {

        scores = [];

    }

    scores.sort((a, b) => a.score - b.score);

    if (scores.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;

        cell.textContent =
            "No players yet. Complete a puzzle first!";

        row.appendChild(cell);
        tbody.appendChild(row);

        return;

    }

    scores.slice(0, 10).forEach((player, index) => {

        const row = document.createElement("tr");

        const values = [
            index + 1,
            player.name,
            formatTime(player.time),
            player.hints,
            player.score
        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });

        tbody.appendChild(row);

    });

}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(totalSeconds) {

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );

}


// ==========================================
// END OF SCRIPT
// ==========================================
