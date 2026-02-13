// Game State
let currentLevel = 'beginner';
let gridSize = 4;
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let mismatches = 0;
let score = 0;
let timer = 0;
let timerInterval = null;
let isProcessing = false;
let emojiImages = [];

// Difficulty Configurations
const difficultyConfig = {
    beginner: { grid: 4, pairs: 8, multiplier: 1, baseScore: 100 },
    intermediate: { grid: 6, pairs: 18, multiplier: 1.5, baseScore: 150 },
    advanced: { grid: 8, pairs: 32, multiplier: 2, baseScore: 200 },
    expert: { grid: 10, pairs: 50, multiplier: 3, baseScore: 300 }
};

// Emoji Image Paths Configuration
const EMOJI_CONFIG = {
    faces: {
        path: 'emojis/EmojiFaces/',
        count: 52  // Adjust based on your actual number of face images
    },
    items: {
        path: 'emojis/EmojiItems/',
        count: 48  // Adjust based on your actual number of item images
    }
};

// Load Emoji Images
async function loadEmojiImages() {
    emojiImages = [];

    const testImage = src =>
        new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });

    // Load face emojis (1-52)
    for (let i = 1; i <= 52; i++) {
        const src = `emojis/EmojiFaces/${i}.png`;
        const ok = await testImage(src);
        if (ok) emojiImages.push({ src, type: 'face' });
        else console.warn("Missing face emoji:", src);
    }

    // Load item emojis (91-138)
    for (let i = 91; i <= 138; i++) {
        const src = `emojis/EmojiItems/${i}.png`;
        const ok = await testImage(src);
        if (ok) emojiImages.push({ src, type: 'item' });
        else console.warn("Missing item emoji:", src);
    }

    console.log(`Verified emojis loaded: ${emojiImages.length}`);
    console.log("Faces loaded:", emojiImages.filter(e => e.type === 'face').length);
    console.log("Items loaded:", emojiImages.filter(e => e.type === 'item').length);
}



// Get Level from URL
function getLevelFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('level') || 'beginner';
}

// Initialize Game
document.addEventListener('DOMContentLoaded', async () => {
    // Load emoji images first
    await loadEmojiImages();
    
    // Get level from URL parameter
    currentLevel = getLevelFromURL();
    gridSize = difficultyConfig[currentLevel].grid;
    
    // Setup game
    setupGameControls();
    startGame();
});

// Start Game
function startGame() {
    // Reset game state
    matchedPairs = 0;
    moves = 0;
    mismatches = 0;
    score = 0;
    timer = 0;
    flippedCards = [];
    isProcessing = false;
    
    // Update UI
    document.getElementById('current-level').textContent = currentLevel.toUpperCase();
    document.getElementById('moves').textContent = '0';
    document.getElementById('score').textContent = '0';
    document.getElementById('timer').textContent = '00:00';
    
    // Generate and setup board
    setupBoard();
    
    // Start timer
    startTimer();
}

// Setup Game Board
function setupBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    board.className = `game-board grid-${gridSize}`;
    
    // Generate card deck
    const config = difficultyConfig[currentLevel];
    const totalTiles = gridSize * gridSize;
    const pairsNeeded = totalTiles / 2;
    
    // Select random emojis from loaded images
    const shuffledEmojis = [...emojiImages].sort(() => Math.random() - 0.5);
    const selectedEmojis = shuffledEmojis.slice(0, pairsNeeded);
    
    // Create pairs and shuffle
    cards = [...selectedEmojis, ...selectedEmojis]
        .sort(() => Math.random() - 0.5)
        .map((emoji, index) => ({
            id: index,
            imageSrc: emoji.src,
            type: emoji.type,
            isFlipped: false,
            isMatched: false
        }));
    
    // Create tile elements
    cards.forEach(card => {
        const tile = document.createElement('div');
        tile.className = 'memory-tile';
        tile.dataset.id = card.id;
        
        // Back of tile (? symbol)
        const back = document.createElement('div');
        back.className = 'tile-back';
        back.textContent = '?';
        
        // Front of tile (emoji image)
        const front = document.createElement('div');
        front.className = 'tile-front';
        front.style.display = 'none';
        
        const img = document.createElement('img');
        img.src = card.imageSrc;
        img.className = 'tile-emoji-img';
        img.alt = 'emoji';
        
        front.appendChild(img);
        tile.appendChild(back);
        tile.appendChild(front);
        
        tile.addEventListener('click', () => handleTileClick(card.id));
        
        board.appendChild(tile);
    });
}

// Handle Tile Click
function handleTileClick(cardId) {
    if (isProcessing) return;
    
    const card = cards[cardId];
    const tile = document.querySelector(`[data-id="${cardId}"]`);
    
    // Ignore if already flipped or matched
    if (card.isFlipped || card.isMatched) return;
    
    // Ignore if already have 2 flipped cards
    if (flippedCards.length >= 2) return;
    
    // Flip the card
    flipCard(cardId, tile);
    flippedCards.push({ id: cardId, imageSrc: card.imageSrc });
    
    // Check for match when 2 cards are flipped
    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;
        isProcessing = true;
        
        setTimeout(() => {
            checkMatch();
        }, 800);
    }
}

// Flip Card
function flipCard(cardId, tile) {
    const card = cards[cardId];
    card.isFlipped = true;
    
    tile.classList.add('flipped');
    tile.querySelector('.tile-back').style.display = 'none';
    tile.querySelector('.tile-front').style.display = 'flex';
}

// Unflip Card
function unflipCard(cardId, tile) {
    const card = cards[cardId];
    card.isFlipped = false;
    
    tile.classList.remove('flipped');
    tile.querySelector('.tile-back').style.display = 'flex';
    tile.querySelector('.tile-front').style.display = 'none';
}

// Check Match
function checkMatch() {
    const [card1, card2] = flippedCards;
    const tile1 = document.querySelector(`[data-id="${card1.id}"]`);
    const tile2 = document.querySelector(`[data-id="${card2.id}"]`);
    
    if (card1.imageSrc === card2.imageSrc) {
        // Match found!
        cards[card1.id].isMatched = true;
        cards[card2.id].isMatched = true;
        
        tile1.classList.add('matched');
        tile2.classList.add('matched');
        
        // Disable matched tiles
        tile1.classList.add('disabled');
        tile2.classList.add('disabled');
        
        matchedPairs++;
        updateScore(true);
        
        // Check if game is complete
        const config = difficultyConfig[currentLevel];
        if (matchedPairs === config.pairs) {
            setTimeout(() => {
                endGame();
            }, 500);
        }
    } else {
        // No match - flip back
        mismatches++;
        setTimeout(() => {
            unflipCard(card1.id, tile1);
            unflipCard(card2.id, tile2);
        }, 300);
    }
    
    flippedCards = [];
    isProcessing = false;
}

// Update Score
function updateScore(isMatch) {
    const config = difficultyConfig[currentLevel];
    
    if (isMatch) {
        // Base score for match
        let matchScore = config.baseScore;
        
        // Time bonus (faster = more points, decreases over time)
        const timeBonus = Math.max(0, 100 - Math.floor(timer / 2));
        
        // Accuracy bonus (fewer moves = more points)
        const accuracy = matchedPairs / moves;
        const accuracyBonus = Math.floor(accuracy * 200);
        
        // Efficiency bonus (fewer mismatches)
        const efficiencyBonus = Math.max(0, 100 - (mismatches * 10));
        
        // Difficulty multiplier
        matchScore = Math.floor((matchScore + timeBonus + accuracyBonus + efficiencyBonus) * config.multiplier);
        
        score += matchScore;
        document.getElementById('score').textContent = score;
    }
}

// Timer
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timer++;
        const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
        const seconds = (timer % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// End Game
function endGame() {
    stopTimer();
    
    // Calculate accuracy
    const accuracy = Math.round((matchedPairs / moves) * 100);
    
    // Update win screen
    document.getElementById('win-level').textContent = currentLevel.toUpperCase();
    const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
    const seconds = (timer % 60).toString().padStart(2, '0');
    document.getElementById('win-time').textContent = `${minutes}:${seconds}`;
    document.getElementById('win-moves').textContent = moves;
    document.getElementById('win-score').textContent = score;
    document.getElementById('win-accuracy').textContent = `${accuracy}%`;
    document.getElementById('win-mismatches').textContent = mismatches;
    
    // Save best score to localStorage
    saveBestScore();
    
    // Show win screen
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('win-screen').classList.remove('hidden');
}

// Save Best Score
function saveBestScore() {
    const storageKey = `monkey-matches-best-${currentLevel}`;
    const bestScore = localStorage.getItem(storageKey);
    
    if (!bestScore || score > parseInt(bestScore)) {
        localStorage.setItem(storageKey, score);
        console.log(`New best score for ${currentLevel}: ${score}`);
    }
}

// Game Controls
function setupGameControls() {
    // Back button - return to level select
    document.getElementById('back-btn').addEventListener('click', () => {
        stopTimer();
        window.location.href = 'level-select.html';
    });
    
    // Restart button - restart same level
    document.getElementById('restart-btn').addEventListener('click', () => {
        stopTimer();
        startGame();
    });
    
    // Play again button - restart same level
    document.getElementById('play-again-btn').addEventListener('click', () => {
        document.getElementById('win-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        startGame();
    });
    
    // Change level button - go back to level select
    document.getElementById('change-level-btn').addEventListener('click', () => {
        window.location.href = 'level-select.html';
    });
}

// Preload Images (optional but recommended for smoother gameplay)
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function preloadAllImages() {
    console.log('Preloading images...');
    const promises = emojiImages.map(emoji => preloadImage(emoji.src));
    try {
        await Promise.all(promises);
        console.log('All images preloaded successfully');
    } catch (error) {
        console.warn('Some images failed to preload:', error);
    }
}