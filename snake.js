document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const winScreen = document.getElementById('win-screen');

    // Configuración del juego
    const gridSize = 20; // Tamaño de cada cuadrito
    const tileCount = canvas.width / gridSize;
    
    let score = 0;
    let velocityX = 0;
    let velocityY = 0;
    let snake = [{x: 10, y: 10}]; // Cabeza inicial
    let food = {x: 15, y: 15};
    let gameInterval;
    let isGameRunning = true;

    // Iniciar juego
    gameInterval = setInterval(gameLoop, 1000 / 10); // 10 FPS (Velocidad)

    function gameLoop() {
        if (!isGameRunning) return;

        moveSnake();
        if (checkCollisions()) {
            resetGame(); // Perdiste
            return;
        }
        checkFood();
        drawGame();
        
        // CONDICIÓN DE VICTORIA
        if (score >= 5) {
            winGame();
        }
    }

    function moveSnake() {
        const head = {x: snake[0].x + velocityX, y: snake[0].y + velocityY};
        snake.unshift(head); // Añadir nueva cabeza
        snake.pop(); // Eliminar cola (se mueve)
    }

    function checkFood() {
        // Si la cabeza está en la misma posición que la comida
        if (snake[0].x === food.x && snake[0].y === food.y) {
            score++;
            scoreElement.innerText = score;
            snake.push({}); // Alargar serpiente (no hacemos pop)
            placeFood();
        }
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        
        // Asegurarse de que la comida no aparezca dentro de la serpiente
        snake.forEach(part => {
            if (part.x === food.x && part.y === food.y) placeFood();
        });
    }

    function checkCollisions() {
        const head = snake[0];

        // Paredes
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            return true;
        }

        // Chocar con uno mismo (empezamos loop en 1 para no chocar con la propia cabeza)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        return false;
    }

    function drawGame() {
        // Fondo
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Serpiente
        ctx.fillStyle = '#1db954'; // Verde
        snake.forEach((part, index) => {
            // Cabeza un poco más clara
            if (index === 0) ctx.fillStyle = '#1ed760';
            else ctx.fillStyle = '#1db954';
            
            ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
        });

        // Comida
        ctx.fillStyle = 'red';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    }

    function resetGame() {
        score = 0;
        scoreElement.innerText = score;
        snake = [{x: 10, y: 10}];
        velocityX = 0;
        velocityY = 0;
        placeFood();
    }

    function winGame() {
        isGameRunning = false;
        clearInterval(gameInterval);
        winScreen.classList.remove('hidden');
    }

    // --- CONTROLES ---
    document.addEventListener('keydown', changeDirection);

    function changeDirection(event) {
        // Evitar scroll con flechas
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
            event.preventDefault();
        }

        const keyPressed = event.keyCode;
        const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;

        if (keyPressed === LEFT && velocityX !== 1) { velocityX = -1; velocityY = 0; }
        if (keyPressed === UP && velocityY !== 1) { velocityX = 0; velocityY = -1; }
        if (keyPressed === RIGHT && velocityX !== -1) { velocityX = 1; velocityY = 0; }
        if (keyPressed === DOWN && velocityY !== -1) { velocityX = 0; velocityY = 1; }
    }

    // Controles para Botones en Móvil
    document.getElementById('left-btn').addEventListener('click', () => { if(velocityX !== 1) { velocityX = -1; velocityY = 0; }});
    document.getElementById('up-btn').addEventListener('click', () => { if(velocityY !== 1) { velocityX = 0; velocityY = -1; }});
    document.getElementById('right-btn').addEventListener('click', () => { if(velocityX !== -1) { velocityX = 1; velocityY = 0; }});
    document.getElementById('down-btn').addEventListener('click', () => { if(velocityY !== -1) { velocityX = 0; velocityY = 1; }});
});