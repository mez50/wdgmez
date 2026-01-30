// let answers = [];
// let allowed = [];
// let targetWord = '';
// let currentRow = 0;
// let currentGuess = '';
// let gameOver = false;
// let evaluations = [];
// let keyboardColors = {};

// const keyboard = [
//     ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
//     ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'BACK'],
//     ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER']
// ];

// const rec = 'zemme50';

// function check() {
//     const pw = prompt('Enter:');
    
//     if (pw === rec) {
//         return true;
//     } else if (pw === null) {
//         document.body.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; color: white; font-size: 1.5rem;">Access Denied</div>';
//         return false;
//     } else {
//         alert('Incorrect!');
//         return check();
//     }
// }

// async function init() {
//     if (!check()) {
//         return;
//     }

//     const words = await loadWords();
//     answers = words.answers.map(w => w.toUpperCase());
//     allowed = words.allowed.map(w => w.toUpperCase());
    
//     targetWord = answers[Math.floor(Math.random() * answers.length)];
    
//     createBoard();
//     createKeyboard();
    
//     document.addEventListener('keydown', handlePhysicalKeyboard);
//     document.getElementById('reset-btn').addEventListener('click', resetGame);
// }

// function createBoard() {
//     const board = document.getElementById('game-board');
//     board.innerHTML = '';
    
//     for (let i = 0; i < 6; i++) {
//         const row = document.createElement('div');
//         row.className = 'row';
//         row.id = `row-${i}`;
        
//         for (let j = 0; j < 5; j++) {
//             const tile = document.createElement('div');
//             tile.className = 'tile';
//             tile.id = `tile-${i}-${j}`;
//             row.appendChild(tile);
//         }
        
//         board.appendChild(row);
//     }
// }

// function createKeyboard() {
//     const keyboardEl = document.getElementById('keyboard');
//     keyboardEl.innerHTML = '';
    
//     keyboard.forEach(row => {
//         const rowEl = document.createElement('div');
//         rowEl.className = 'keyboard-row';
        
//         row.forEach(key => {
//             const keyEl = document.createElement('button');
//             keyEl.className = 'key';
//             keyEl.textContent = key === 'BACK' ? '⌫' : key;
//             keyEl.dataset.key = key;
            
//             if (key === 'ENTER' || key === 'BACK') {
//                 keyEl.classList.add('wide');
//             }
            
//             keyEl.addEventListener('click', () => handleKeyPress(key));
//             rowEl.appendChild(keyEl);
//         });
        
//         keyboardEl.appendChild(rowEl);
//     });
// }

// function handlePhysicalKeyboard(e) {
//     if (gameOver) return;
    
//     if (e.key === 'Enter') {
//         handleKeyPress('ENTER');
//     } else if (e.key === 'Backspace') {
//         handleKeyPress('BACK');
//     } else if (/^[a-zA-Z]$/.test(e.key)) {
//         handleKeyPress(e.key.toUpperCase());
//     }
// }

// function handleKeyPress(key) {
//     if (gameOver) return;
    
//     if (key === 'ENTER') {
//         submitGuess();
//     } else if (key === 'BACK') {
//         currentGuess = currentGuess.slice(0, -1);
//         updateBoard();
//     } else if (currentGuess.length < 5) {
//         currentGuess += key;
//         updateBoard();
//     }
// }

// function updateBoard() {
//     for (let i = 0; i < 5; i++) {
//         const tile = document.getElementById(`tile-${currentRow}-${i}`);
//         tile.textContent = currentGuess[i] || '';
//         tile.classList.toggle('filled', currentGuess[i] !== undefined);
//     }
// }

// function evaluateGuess(guess) {
//     const result = Array(5).fill('absent');
//     const targetLetters = targetWord.split('');
//     const guessLetters = guess.split('');

//     guessLetters.forEach((letter, i) => {
//         if (letter === targetLetters[i]) {
//             result[i] = 'correct';
//             targetLetters[i] = null;
//         }
//     });

//     guessLetters.forEach((letter, i) => {
//         if (result[i] === 'absent' && targetLetters.includes(letter)) {
//             result[i] = 'present';
//             targetLetters[targetLetters.indexOf(letter)] = null;
//         }
//     });
    
//     return result;
// }

// function updateKeyboardColors(guess, evaluation) {
//     guess.split('').forEach((letter, i) => {
//         const current = keyboardColors[letter];
//         const newColor = evaluation[i];
        
//         if (!current || 
//             (current === 'absent' && newColor !== 'absent') ||
//             (current === 'present' && newColor === 'correct')) {
//             keyboardColors[letter] = newColor;
            
//             const keyEl = document.querySelector(`[data-key="${letter}"]`);
//             if (keyEl) {
//                 keyEl.classList.remove('correct', 'present', 'absent');
//                 keyEl.classList.add(newColor);
//             }
//         }
//     });
// }

// function showMessage(text, duration = 2000) {
//     const messageEl = document.getElementById('message');
//     messageEl.textContent = text;
//     messageEl.classList.remove('hidden');
    
//     setTimeout(() => {
//         messageEl.classList.add('hidden');
//     }, duration);
// }

// function submitGuess() {
//     if (currentGuess.length !== 5) {
//         showMessage('Not enough letters');
//         return;
//     }
    
//     if (!allowed.includes(currentGuess)) {
//         showMessage('Not in word list');
//         return;
//     }
    
//     const evaluation = evaluateGuess(currentGuess);
//     evaluations[currentRow] = evaluation;
 
//     for (let i = 0; i < 5; i++) {
//         const tile = document.getElementById(`tile-${currentRow}-${i}`);
//         setTimeout(() => {
//             tile.classList.add(evaluation[i]);
//         }, i * 100);
//     }
    
//     updateKeyboardColors(currentGuess, evaluation);
    
//     if (currentGuess === targetWord) {
//         setTimeout(() => {
//             showMessage('Congratulations! 🎉', 5000);
//             gameOver = true;
//             document.getElementById('reset-btn').classList.remove('hidden');
//         }, 500);
//     } else if (currentRow === 5) {
//         setTimeout(() => {
//             showMessage(`Game Over! The word was ${targetWord}`, 5000);
//             gameOver = true;
//             document.getElementById('reset-btn').classList.remove('hidden');
//         }, 500);
//     } else {
//         currentRow++;
//         currentGuess = '';
//     }
// }

// function resetGame() {
//     currentRow = 0;
//     currentGuess = '';
//     gameOver = false;
//     evaluations = [];
//     keyboardColors = {};
//     targetWord = answers[Math.floor(Math.random() * answers.length)];
    
//     createBoard();
//     createKeyboard();
    
//     document.getElementById('message').classList.add('hidden');
//     document.getElementById('reset-btn').classList.add('hidden');
// }

// document.addEventListener('DOMContentLoaded', init);