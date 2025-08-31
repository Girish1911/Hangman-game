// Word categories with difficulty levels
const wordCategories = {
    Animals: {
        Easy: ['CAT', 'DOG', 'FISH', 'BIRD', 'BEAR'],
        Medium: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'TIGER'],
        Hard: ['BUTTERFLY', 'KANGAROO', 'FLAMINGO', 'RHINOCEROS', 'CHIMPANZEE']
    },
    Countries: {
        Easy: ['USA', 'ITALY', 'SPAIN', 'JAPAN', 'CHINA'],
        Medium: ['BRAZIL', 'CANADA', 'FRANCE', 'GERMANY', 'MEXICO'],
        Hard: ['AUSTRALIA', 'ARGENTINA', 'BANGLADESH', 'SWITZERLAND', 'NETHERLANDS']
    },
    Food: {
        Easy: ['PIZZA', 'BREAD', 'APPLE', 'CAKE', 'MILK'],
        Medium: ['HAMBURGER', 'SANDWICH', 'PANCAKE', 'COOKIE', 'BANANA'],
        Hard: ['SPAGHETTI', 'CHOCOLATE', 'STRAWBERRY', 'AVOCADO', 'CAPPUCCINO']
    },
    Movies: {
        Easy: ['AVATAR', 'FROZEN', 'SHREK', 'CARS', 'UP'],
        Medium: ['TITANIC', 'BATMAN', 'SUPERMAN', 'MARVEL', 'DISNEY'],
        Hard: ['INCEPTION', 'GLADIATOR', 'SPIDERMAN', 'INTERSTELLAR', 'TRANSFORMERS']
    },
    Sports: {
        Easy: ['SOCCER', 'TENNIS', 'GOLF', 'BOXING', 'SWIM'],
        Medium: ['BASKETBALL', 'FOOTBALL', 'BASEBALL', 'HOCKEY', 'CYCLING'],
        Hard: ['VOLLEYBALL', 'BADMINTON', 'WRESTLING', 'GYMNASTICS', 'SKATEBOARDING']
    }
};

// Audio elements
const soundClick = new Audio('sounds/click.mp3');
const soundCorrect = new Audio('sounds/correct.mp3');
const soundWrong = new Audio('sounds/wrong.mp3');
const soundWin = new Audio('sounds/win.mp3');
const soundLose = new Audio('sounds/lose.mp3');

// Preload sounds
[soundClick, soundCorrect, soundWrong, soundWin, soundLose].forEach(s => {
    s.preload = 'auto';
    s.volume = 0.8;
});

// Game state
let currentWord = '';
let currentCategory = 'Animals';
let currentCategoryEmoji = '🐾';
let currentDifficulty = 'Medium';
let currentDifficultyEmoji = '🤔';
let guessedLetters = [];
let wrongGuesses = 0;
let gameOver = false;
const maxWrongGuesses = 6;

// Hangman body parts in order (head is special case)
const hangmanParts = [
    'head',
    'body', 
    'leftArm',
    'rightArm',
    'leftLeg',
    'rightLeg'
];

// Toggle dropdown with insane animations
function toggleDropdown(dropdownId) {
    playClickSound(); // Add click sound
    const dropdown = document.getElementById(dropdownId);
    const isOpen = dropdown.classList.contains('open');
    
    // Close all dropdowns first
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
    
    // Toggle current dropdown with delay for smooth effect
    if (!isOpen) {
        setTimeout(() => {
            dropdown.classList.add('open');
        }, 100);
    }
}

// Select category
function selectCategory(category, emoji) {
    playClickSound(); // Add click sound
    currentCategory = category;
    currentCategoryEmoji = emoji;
    document.getElementById('selectedCategory').textContent = `${emoji} ${category}`;
    document.getElementById('categoryDropdown').classList.remove('open');
}

// Select difficulty
function selectDifficulty(difficulty, emoji) {
    playClickSound(); // Add click sound
    currentDifficulty = difficulty;
    currentDifficultyEmoji = emoji;
    document.getElementById('selectedDifficulty').textContent = `${emoji} ${difficulty}`;
    document.getElementById('difficultyDropdown').classList.remove('open');
}

// Start game - transition to game page
function startGame() {
    playClickSound(); // Add click sound
    document.getElementById('menuPage').classList.add('hidden');
    document.getElementById('gamePage').classList.remove('hidden');
    document.getElementById('currentCategory').textContent = currentCategory;
    document.getElementById('currentDifficulty').textContent = currentDifficulty;
    newGame();
}

// Back to menu
function backToMenu() {
    playClickSound(); // Add click sound
    document.getElementById('gamePage').classList.add('hidden');
    document.getElementById('menuPage').classList.remove('hidden');
}

// Create virtual keyboard with crazy animations
function createVirtualKeyboard() {
    const keyboardDiv = document.getElementById('virtualKeyboard');
    keyboardDiv.innerHTML = '';
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const button = document.createElement('button');
        button.className = 'key-btn';
        button.textContent = letter;
        button.onclick = () => guessLetter(letter);
        button.id = `key-${letter}`;
        button.style.setProperty('--i', i);
        keyboardDiv.appendChild(button);
    }
}

// Start new game
function newGame() {
    playClickSound(); // Add click sound
    // Reset game state
    guessedLetters = [];
    wrongGuesses = 0;
    gameOver = false;
    
    // Choose word based on category and difficulty
    const words = wordCategories[currentCategory][currentDifficulty];
    currentWord = words[Math.floor(Math.random() * words.length)];
    
    // Update display
    document.getElementById('wrongCount').textContent = wrongGuesses;
    const messageDiv = document.getElementById('gameMessage');
    messageDiv.style.display = 'none';
    
    // Reset virtual keyboard buttons
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i);
        const btn = document.getElementById(`key-${letter}`);
        if (btn) {
            btn.disabled = false;
            btn.className = 'key-btn';
        }
    }
    
    // Reset all hangman parts
    hangmanParts.forEach(partId => {
        const part = document.getElementById(partId);
        if (part) {
            part.classList.remove('show');
            part.style.opacity = '0';
            if (partId === 'head') {
                part.style.strokeDasharray = '126';
                part.style.strokeDashoffset = '126';
            } else {
                part.style.strokeDasharray = '100';
                part.style.strokeDashoffset = '100';
            }
        }
    });
    
    updateWordDisplay();
}

// Update word display with guessed letters
function updateWordDisplay() {
    const display = currentWord.split('').map(letter => {
        return guessedLetters.includes(letter) ? letter : '_';
    }).join(' ');
    
    document.getElementById('wordDisplay').textContent = display;
}

// Handle letter guess with enhanced animations
function guessLetter(letter) {
    if (gameOver || guessedLetters.includes(letter)) return;
    
    soundClick.play(); // Play click sound when any letter is pressed
    guessedLetters.push(letter);
    const btn = document.getElementById(`key-${letter}`);
    btn.disabled = true;
    
    if (currentWord.includes(letter)) {
        // Correct guess
        soundCorrect.play();
        btn.classList.add('correct');
        updateWordDisplay();
        checkWin();
    } else {
        // Wrong guess
        soundWrong.play();
        btn.classList.add('wrong');
        wrongGuesses++;
        document.getElementById('wrongCount').textContent = wrongGuesses;
        showHangmanPart();
        checkLoss();
    }
}

// Show next hangman body part with smooth progressive animation
function showHangmanPart() {
    if (wrongGuesses <= hangmanParts.length) {
        const partId = hangmanParts[wrongGuesses - 1];
        const part = document.getElementById(partId);
        
        if (part) {
            // Set initial state
            part.style.opacity = '1';
            
            // Add animation class
            part.classList.add('show');
            
            // Set stroke animation
            if (partId === 'head') {
                part.style.strokeDasharray = '126';
                part.style.strokeDashoffset = '0';
            } else {
                part.style.strokeDasharray = '100';
                part.style.strokeDashoffset = '0';
            }
        }
    }
}

// Check if player won
function checkWin() {
    const hasWon = currentWord.split('').every(letter => guessedLetters.includes(letter));
    
    if (hasWon) {
        gameOver = true;
        soundWin.play(); // Play win sound
        setTimeout(() => {
            const messageDiv = document.getElementById('gameMessage');
            messageDiv.textContent = `🎉 AMAZING! You guessed "${currentWord}" correctly!`;
            messageDiv.className = 'game-message win-message';
            messageDiv.style.display = 'block';
            
            // Create celebration particles
            createCelebrationParticles();
        }, 500);
        
        // Disable all keyboard buttons
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i);
            const btn = document.getElementById(`key-${letter}`);
            if (btn) btn.disabled = true;
        }
    }
}

// Check if player lost
function checkLoss() {
    if (wrongGuesses >= maxWrongGuesses) {
        gameOver = true;
        soundLose.play(); // Play lose sound
        setTimeout(() => {
            const messageDiv = document.getElementById('gameMessage');
            messageDiv.textContent = `💀 Game Over! The word was "${currentWord}". Try again!`;
            messageDiv.className = 'game-message lose-message';
            messageDiv.style.display = 'block';
        }, 800);
        
        // Disable all keyboard buttons
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i);
            const btn = document.getElementById(`key-${letter}`);
            if (btn) btn.disabled = true;
        }
        
        // Reveal the full word with animation
        setTimeout(() => {
            document.getElementById('wordDisplay').textContent = currentWord.split('').join(' ');
        }, 1200);
    }
}

// Create mega celebration particles for win
function createCelebrationParticles() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        particle.style.boxShadow = '0 0 10px currentColor';
        
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 50;
        const velocity = Math.random() * 400 + 300;
        const gravity = 600;
        
        let x = startX;
        let y = startY;
        let vx = Math.cos(angle) * velocity;
        let vy = Math.sin(angle) * velocity;
        
        const animate = () => {
            vx *= 0.98;
            vy += gravity * 0.016;
            x += vx * 0.016;
            y += vy * 0.016;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = Math.max(0, 1 - (y - startY) / 600);
            particle.style.transform = `rotate(${(Date.now() - startTime) * 0.01}deg)`;
            
            if (y < window.innerHeight + 100 && particle.style.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }
        };
        
        const startTime = Date.now();
        setTimeout(() => requestAnimationFrame(animate), i * 30);
    }
}

// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Initialize game
function initGame() {
    createParticles();
    createVirtualKeyboard();
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
    }
});

// Handle keyboard input
document.addEventListener('keydown', function(event) {
    const letter = event.key.toUpperCase();
    if (letter >= 'A' && letter <= 'Z' && !gameOver) {
        const btn = document.getElementById(`key-${letter}`);
        if (btn && !btn.disabled) {
            // Add visual feedback for keyboard press
            btn.style.animation = 'keyPress 0.3s ease-out';
            setTimeout(() => {
                btn.style.animation = '';
            }, 300);
            
            guessLetter(letter);
        }
    }
    
    // Close dropdowns on Escape
    if (event.key === 'Escape') {
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
    }
});

// Enhanced button interactions with ripple effects
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('key-btn') || 
            e.target.classList.contains('dropdown-btn') || 
            e.target.classList.contains('start-game-btn') ||
            e.target.classList.contains('new-game-btn') ||
            e.target.classList.contains('back-btn') ||
            e.target.classList.contains('dropdown-item')) {
            
            playClickSound(); // Add click sound for all buttons
            
            // Create mega ripple effect
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.7)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'megaRipple 0.8s ease-out';
            ripple.style.pointerEvents = 'none';
            
            const rect = e.target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.5;
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            
            e.target.style.position = 'relative';
            e.target.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 800);
        }
    });
});

// Start the game when page loads
window.onload = initGame;

// Add this function near the top of your file after the game state variables
function playClickSound() {
    soundClick.currentTime = 0; // Reset sound to start
    soundClick.play();
}

// Update these existing functions to include sound
function toggleDropdown(dropdownId) {
    playClickSound(); // Add click sound
    const dropdown = document.getElementById(dropdownId);
    const isOpen = dropdown.classList.contains('open');
    
    // Close all dropdowns first
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
    
    // Toggle current dropdown with delay for smooth effect
    if (!isOpen) {
        setTimeout(() => {
            dropdown.classList.add('open');
        }, 100);
    }
}

// Select category
function selectCategory(category, emoji) {
    playClickSound(); // Add click sound
    currentCategory = category;
    currentCategoryEmoji = emoji;
    document.getElementById('selectedCategory').textContent = `${emoji} ${category}`;
    document.getElementById('categoryDropdown').classList.remove('open');
}

// Select difficulty
function selectDifficulty(difficulty, emoji) {
    playClickSound(); // Add click sound
    currentDifficulty = difficulty;
    currentDifficultyEmoji = emoji;
    document.getElementById('selectedDifficulty').textContent = `${emoji} ${difficulty}`;
    document.getElementById('difficultyDropdown').classList.remove('open');
}

// Start game - transition to game page
function startGame() {
    playClickSound(); // Add click sound
    document.getElementById('menuPage').classList.add('hidden');
    document.getElementById('gamePage').classList.remove('hidden');
    document.getElementById('currentCategory').textContent = currentCategory;
    document.getElementById('currentDifficulty').textContent = currentDifficulty;
    newGame();
}

// Back to menu
function backToMenu() {
    playClickSound(); // Add click sound
    document.getElementById('gamePage').classList.add('hidden');
    document.getElementById('menuPage').classList.remove('hidden');
}

// Create virtual keyboard with crazy animations
function createVirtualKeyboard() {
    const keyboardDiv = document.getElementById('virtualKeyboard');
    keyboardDiv.innerHTML = '';
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const button = document.createElement('button');
        button.className = 'key-btn';
        button.textContent = letter;
        button.onclick = () => guessLetter(letter);
        button.id = `key-${letter}`;
        button.style.setProperty('--i', i);
        keyboardDiv.appendChild(button);
    }
}

// Start new game
function newGame() {
    playClickSound(); // Add click sound
    // Reset game state
    guessedLetters = [];
    wrongGuesses = 0;
    gameOver = false;
    
    // Choose word based on category and difficulty
    const words = wordCategories[currentCategory][currentDifficulty];
    currentWord = words[Math.floor(Math.random() * words.length)];
    
    // Update display
    document.getElementById('wrongCount').textContent = wrongGuesses;
    const messageDiv = document.getElementById('gameMessage');
    messageDiv.style.display = 'none';
    
    // Reset virtual keyboard buttons
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i);
        const btn = document.getElementById(`key-${letter}`);
        if (btn) {
            btn.disabled = false;
            btn.className = 'key-btn';
        }
    }
    
    // Reset all hangman parts
    hangmanParts.forEach(partId => {
        const part = document.getElementById(partId);
        if (part) {
            part.classList.remove('show');
            part.style.opacity = '0';
            if (partId === 'head') {
                part.style.strokeDasharray = '126';
                part.style.strokeDashoffset = '126';
            } else {
                part.style.strokeDasharray = '100';
                part.style.strokeDashoffset = '100';
            }
        }
    });
    
    updateWordDisplay();
}

// Update word display with guessed letters
function updateWordDisplay() {
    const display = currentWord.split('').map(letter => {
        return guessedLetters.includes(letter) ? letter : '_';
    }).join(' ');
    
    document.getElementById('wordDisplay').textContent = display;
}

// Handle letter guess with enhanced animations
function guessLetter(letter) {
    if (gameOver || guessedLetters.includes(letter)) return;
    
    soundClick.play(); // Play click sound when any letter is pressed
    guessedLetters.push(letter);
    const btn = document.getElementById(`key-${letter}`);
    btn.disabled = true;
    
    if (currentWord.includes(letter)) {
        // Correct guess
        soundCorrect.play();
        btn.classList.add('correct');
        updateWordDisplay();
        checkWin();
    } else {
        // Wrong guess
        soundWrong.play();
        btn.classList.add('wrong');
        wrongGuesses++;
        document.getElementById('wrongCount').textContent = wrongGuesses;
        showHangmanPart();
        checkLoss();
    }
}

// Show next hangman body part with smooth progressive animation
function showHangmanPart() {
    if (wrongGuesses <= hangmanParts.length) {
        const partId = hangmanParts[wrongGuesses - 1];
        const part = document.getElementById(partId);
        
        if (part) {
            // Set initial state
            part.style.opacity = '1';
            
            // Add animation class
            part.classList.add('show');
            
            // Set stroke animation
            if (partId === 'head') {
                part.style.strokeDasharray = '126';
                part.style.strokeDashoffset = '0';
                part.setAttribute('fill', '#000');
            } else {
                part.style.strokeDasharray = '100';
                part.style.strokeDashoffset = '0';
            }
        }
    }
}

// Check if player won
function checkWin() {
    const hasWon = currentWord.split('').every(letter => guessedLetters.includes(letter));
    
    if (hasWon) {
        gameOver = true;
        soundWin.play(); // Play win sound
        setTimeout(() => {
            const messageDiv = document.getElementById('gameMessage');
            messageDiv.textContent = `🎉 AMAZING! You guessed "${currentWord}" correctly!`;
            messageDiv.className = 'game-message win-message';
            messageDiv.style.display = 'block';
            
            // Create celebration particles
            createCelebrationParticles();
        }, 500);
        
        // Disable all keyboard buttons
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i);
            const btn = document.getElementById(`key-${letter}`);
            if (btn) btn.disabled = true;
        }
    }
}

// Check if player lost
function checkLoss() {
    if (wrongGuesses >= maxWrongGuesses) {
        gameOver = true;
        soundLose.play(); // Play lose sound
        setTimeout(() => {
            const messageDiv = document.getElementById('gameMessage');
            messageDiv.textContent = `💀 Game Over! The word was "${currentWord}". Try again!`;
            messageDiv.className = 'game-message lose-message';
            messageDiv.style.display = 'block';
        }, 800);
        
        // Disable all keyboard buttons
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i);
            const btn = document.getElementById(`key-${letter}`);
            if (btn) btn.disabled = true;
        }
        
        // Reveal the full word with animation
        setTimeout(() => {
            document.getElementById('wordDisplay').textContent = currentWord.split('').join(' ');
        }, 1200);
    }
}

// Create mega celebration particles for win
function createCelebrationParticles() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        particle.style.boxShadow = '0 0 10px currentColor';
        
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 50;
        const velocity = Math.random() * 400 + 300;
        const gravity = 600;
        
        let x = startX;
        let y = startY;
        let vx = Math.cos(angle) * velocity;
        let vy = Math.sin(angle) * velocity;
        
        const animate = () => {
            vx *= 0.98;
            vy += gravity * 0.016;
            x += vx * 0.016;
            y += vy * 0.016;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = Math.max(0, 1 - (y - startY) / 600);
            particle.style.transform = `rotate(${(Date.now() - startTime) * 0.01}deg)`;
            
            if (y < window.innerHeight + 100 && particle.style.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }
        };
        
        const startTime = Date.now();
        setTimeout(() => requestAnimationFrame(animate), i * 30);
    }
}

// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Initialize game
function initGame() {
    createParticles();
    createVirtualKeyboard();
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
    }
});

// Handle keyboard input
document.addEventListener('keydown', function(event) {
    const letter = event.key.toUpperCase();
    if (letter >= 'A' && letter <= 'Z' && !gameOver) {
        const btn = document.getElementById(`key-${letter}`);
        if (btn && !btn.disabled) {
            // Add visual feedback for keyboard press
            btn.style.animation = 'keyPress 0.3s ease-out';
            setTimeout(() => {
                btn.style.animation = '';
            }, 300);
            
            guessLetter(letter);
        }
    }
    
    // Close dropdowns on Escape
    if (event.key === 'Escape') {
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
    }
});

// Enhanced button interactions with ripple effects
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('key-btn') || 
            e.target.classList.contains('dropdown-btn') || 
            e.target.classList.contains('start-game-btn') ||
            e.target.classList.contains('new-game-btn') ||
            e.target.classList.contains('back-btn') ||
            e.target.classList.contains('dropdown-item')) {
            
            playClickSound(); // Add click sound for all buttons
            
            // Create mega ripple effect
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.7)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'megaRipple 0.8s ease-out';
            ripple.style.pointerEvents = 'none';
            
            const rect = e.target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.5;
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            
            e.target.style.position = 'relative';
            e.target.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 800);
        }
    });
});

// (Duplicate declaration removed)

// Update the showHangmanPart function
function showHangmanPart() {
    if (wrongGuesses <= hangmanParts.length) {
        const partId = hangmanParts[wrongGuesses - 1];
        const part = document.getElementById(partId);
        
        if (part) {
            // Set initial state
            part.style.opacity = '1';
            
            // Add animation class
            part.classList.add('show');
            
            // Set stroke animation
            if (partId === 'head') {
                part.style.strokeDasharray = '126';
                part.style.strokeDashoffset = '0';
                part.setAttribute('fill', '#000'); // Fill head after it's revealed
            } else {
                part.style.strokeDasharray = '100';
                part.style.strokeDashoffset = '0';
            }
        }
    }
}


