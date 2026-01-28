let answers = [];
let allowed = [];
let targetWord = '';
let currentRow = 0;
let currentGuess = '';
let gameOver = false;
let evaluations = [];
let keyboardColors = {};
let currentLevel = 'intermediate';
let wordLength = 5;
let totalScore = 0;
let roundsPlayed = 0;

const keyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'BACK'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER']
];

const levelConfig = {
    beginner: { length: 4, name: '4 WORDS' },
    intermediate: { length: 5, name: '5 WORDS' }
};

const scorePoints = {
    0: 12,  // First row
    1: 10,  // Second row
    2: 8,   // Third row
    3: 6,   // Fourth row
    4: 4,   // Fifth row
    5: 2    // Sixth row
};

// Get level from URL
function getLevelFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('level') || 'intermediate';
}

// Back button
document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'level-select.html';
});

async function init() {
    currentLevel = getLevelFromURL();
    wordLength = levelConfig[currentLevel].length;
    
    // Update level badge
    document.getElementById('level-badge').textContent = levelConfig[currentLevel].name;
    
    const words = await loadWords(currentLevel);
    answers = words.answers.map(w => w.toUpperCase());
    allowed = words.allowed.map(w => w.toUpperCase());
    
    targetWord = answers[Math.floor(Math.random() * answers.length)];
    console.log('Target word:', targetWord);
    
    createBoard();
    createKeyboard();
    updateStatsDisplay();
    
    document.addEventListener('keydown', handlePhysicalKeyboard);
    document.getElementById('reset-btn').addEventListener('click', resetGame);
}

function createBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.id = `row-${i}`;
        
        for (let j = 0; j < wordLength; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `tile-${i}-${j}`;
            row.appendChild(tile);
        }
        
        board.appendChild(row);
    }
}

function createKeyboard() {
    const keyboardEl = document.getElementById('keyboard');
    keyboardEl.innerHTML = '';
    
    keyboard.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'keyboard-row';
        
        row.forEach(key => {
            const keyEl = document.createElement('button');
            keyEl.className = 'key';
            keyEl.textContent = key === 'BACK' ? '⌫' : key;
            keyEl.dataset.key = key;
            
            if (key === 'ENTER' || key === 'BACK') {
                keyEl.classList.add('wide');
            }
            
            keyEl.addEventListener('click', () => handleKeyPress(key));
            rowEl.appendChild(keyEl);
        });
        
        keyboardEl.appendChild(rowEl);
    });
}

function handlePhysicalKeyboard(e) {
    if (gameOver) return;
    
    if (e.key === 'Enter') {
        handleKeyPress('ENTER');
    } else if (e.key === 'Backspace') {
        handleKeyPress('BACK');
    } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
    }
}

function handleKeyPress(key) {
    if (gameOver) return;
    
    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACK') {
        currentGuess = currentGuess.slice(0, -1);
        updateBoard();
    } else if (currentGuess.length < wordLength) {
        currentGuess += key;
        updateBoard();
    }
}

function updateBoard() {
    for (let i = 0; i < wordLength; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        tile.textContent = currentGuess[i] || '';
        tile.classList.toggle('filled', currentGuess[i] !== undefined);
    }
}

function evaluateGuess(guess) {
    const result = Array(wordLength).fill('absent');
    const targetLetters = targetWord.split('');
    const guessLetters = guess.split('');
    
    guessLetters.forEach((letter, i) => {
        if (letter === targetLetters[i]) {
            result[i] = 'correct';
            targetLetters[i] = null;
        }
    });
    
    guessLetters.forEach((letter, i) => {
        if (result[i] === 'absent' && targetLetters.includes(letter)) {
            result[i] = 'present';
            targetLetters[targetLetters.indexOf(letter)] = null;
        }
    });
    
    return result;
}

function updateKeyboardColors(guess, evaluation) {
    guess.split('').forEach((letter, i) => {
        const current = keyboardColors[letter];
        const newColor = evaluation[i];
        
        if (!current || 
            (current === 'absent' && newColor !== 'absent') ||
            (current === 'present' && newColor === 'correct')) {
            keyboardColors[letter] = newColor;
            
            const keyEl = document.querySelector(`[data-key="${letter}"]`);
            if (keyEl) {
                keyEl.classList.remove('correct', 'present', 'absent');
                keyEl.classList.add(newColor);
            }
        }
    });
}

function updateStatsDisplay() {
    const scoreEl = document.getElementById('score-display');
    const roundsEl = document.getElementById('rounds-display');
    
    if (scoreEl) {
        scoreEl.textContent = totalScore;
    }
    if (roundsEl) {
        roundsEl.textContent = roundsPlayed;
    }
}

function addScore(rowNumber) {
    const points = scorePoints[rowNumber] || 0;
    totalScore += points;
    roundsPlayed++;
    updateStatsDisplay();
    return points;
}

function incrementRounds() {
    roundsPlayed++;
    updateStatsDisplay();
}

function showMessage(text, duration = 2000) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.classList.remove('hidden');
    
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, duration);
}

function submitGuess() {
    if (currentGuess.length !== wordLength) {
        showMessage('Not enough letters');
        return;
    }
    
    if (!allowed.includes(currentGuess)) {
        showMessage('Not in word list');
        return;
    }
    
    const evaluation = evaluateGuess(currentGuess);
    evaluations[currentRow] = evaluation;
    
    for (let i = 0; i < wordLength; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        setTimeout(() => {
            tile.classList.add(evaluation[i]);
        }, i * 100);
    }
    
    updateKeyboardColors(currentGuess, evaluation);
    
    if (currentGuess === targetWord) {
        const pointsEarned = addScore(currentRow);
        setTimeout(() => {
            showMessage(`Congratulations! +${pointsEarned} points 🎉`, 3000);
            gameOver = true;
            document.getElementById('reset-btn').classList.remove('hidden');
        }, 500);
    } else if (currentRow === 5) {
        incrementRounds();
        setTimeout(() => {
            showMessage(`Game Over! The word was ${targetWord}`, 5000);
            gameOver = true;
            document.getElementById('reset-btn').classList.remove('hidden');
        }, 500);
    } else {
        currentRow++;
        currentGuess = '';
    }
}

function resetGame() {
    currentRow = 0;
    currentGuess = '';
    gameOver = false;
    evaluations = [];
    keyboardColors = {};
    targetWord = answers[Math.floor(Math.random() * answers.length)];
    console.log('New target word:', targetWord);
    
    createBoard();
    createKeyboard();
    
    document.getElementById('message').classList.add('hidden');
    document.getElementById('reset-btn').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', init);