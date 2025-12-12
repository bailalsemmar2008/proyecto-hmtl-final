document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const scoreTargetElement = document.getElementById('score-target');
    
    // Pantallas
    const menuScreen = document.getElementById('menu-screen');
    const winScreen = document.getElementById('win-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreElement = document.getElementById('final-score');

    // Configuración
    const gridSize = 20; 
    const tileCountX = canvas.width / gridSize;
    const tileCountY = canvas.height / gridSize;
    
    // VARIABLES DE ESTADO
    let gameInterval;
    let isGameRunning = false;
    let currentMode = null; // 'challenge' o 'infinite'
    const CHALLENGE_TARGET = 5;

    let snake = [];
    let food = {};
    let score = 0;
    let velocityX = 0;
    let velocityY = 0;

    // --- EVENT LISTENERS DEL MENÚ ---
    document.getElementById('btn-mode-challenge').addEventListener('click', () => startGame('challenge'));
    document.getElementById('btn-mode-infinite').addEventListener('click', () => startGame('infinite'));

    // Botones de "Reintentar" (Mantienen el modo actual)
    document.getElementById('win-retry-btn').addEventListener('click', () => startGame(currentMode));
    document.getElementById('lose-retry-btn').addEventListener('click', () => startGame(currentMode));

    // Botones de "Volver al Menú"
    document.getElementById('win-menu-btn').addEventListener('click', showMenu);
    document.getElementById('lose-menu-btn').addEventListener('click', showMenu);

    // Controles táctiles / botones
    document.getElementById('left-btn').addEventListener('click', () => changeDir(-1, 0));
    document.getElementById('up-btn').addEventListener('click', () => changeDir(0, -1));
    document.getElementById('right-btn').addEventListener('click', () => changeDir(1, 0));
    document.getElementById('down-btn').addEventListener('click', () => changeDir(0, 1));
    document.addEventListener('keydown', handleKeydown);


    // --- LÓGICA DEL JUEGO ---

    function showMenu() {
        stopGame();
        menuScreen.classList.remove('hidden');
        winScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
    }

    function startGame(mode) {
        currentMode = mode;
        
        // Ocultar todas las pantallas superpuestas
        menuScreen.classList.add('hidden');
        winScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');

        // Configurar UI según modo
        if (currentMode === 'challenge') {
            scoreTargetElement.innerText = `/ ${CHALLENGE_TARGET}`;
        } else {
            scoreTargetElement.innerText = "(∞)";
        }

        // Resetear variables
        snake = [{x: 7, y: 7}];
        score = 0;
        scoreElement.innerText = score;
        velocityX = 0;
        velocityY = 0;
        
        placeFood();
        
        isGameRunning = true;
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 1000 / 10);
    }

    function stopGame() {
        isGameRunning = false;
        clearInterval(gameInterval);
    }

    function gameLoop() {
        if (!isGameRunning) return;

        moveSnake();
        
        if (checkCollisions()) {
            gameOver();
            return;
        }
        
        checkFood();
        drawGame();
        
        // CONDICIÓN DE VICTORIA (Solo en modo desafío)
        if (currentMode === 'challenge' && score >= CHALLENGE_TARGET) {
            winGame();
        }
    }

    function moveSnake() {
        if (velocityX === 0 && velocityY === 0) return;

        const head = {x: snake[0].x + velocityX, y: snake[0].y + velocityY};
        snake.unshift(head);
        snake.pop();
    }

    function checkFood() {
        if (snake[0].x === food.x && snake[0].y === food.y) {
            score++;
            scoreElement.innerText = score;
            snake.push({}); // Crecer
            placeFood();
        }
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * tileCountX);
        food.y = Math.floor(Math.random() * tileCountY);
        
        // Evitar spawn sobre la serpiente
        snake.forEach(part => {
            if (part.x === food.x && part.y === food.y) placeFood();
        });
    }

    function checkCollisions() {
        const head = snake[0];
        // Paredes
        if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) return true;
        // Cuerpo
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) return true;
        }
        return false;
    }

    function drawGame() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Serpiente
        snake.forEach((part, index) => {
            ctx.fillStyle = (index === 0) ? '#1ed760' : '#1db954';
            ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
        });

        // Comida
        ctx.fillStyle = (currentMode === 'infinite') ? '#00bfff' : 'red'; // Azul en infinito, roja en normal
        ctx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);
    }

    function winGame() {
        stopGame();
        winScreen.classList.remove('hidden');
    }

    function gameOver() {
        stopGame();
        finalScoreElement.innerText = score;
        gameOverScreen.classList.remove('hidden');
    }

    // --- CONTROLES ---
    function changeDir(x, y) {
        // Evitar giro 180 grados
        if (x !== 0 && velocityX === -x) return;
        if (y !== 0 && velocityY === -y) return;
        velocityX = x; 
        velocityY = y;
    }

    function handleKeydown(event) {
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
            event.preventDefault();
        }
        const k = event.key;
        if (k === 'ArrowLeft') changeDir(-1, 0);
        if (k === 'ArrowUp') changeDir(0, -1);
        if (k === 'ArrowRight') changeDir(1, 0);
        if (k === 'ArrowDown') changeDir(0, 1);
    }
});