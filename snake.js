document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const winScreen = document.getElementById('win-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreElement = document.getElementById('final-score');

    // Configuración del juego
    const gridSize = 20; // Tamaño del cuadrito
    // Calculamos cuántos cuadritos caben (300 / 20 = 15 cuadritos, índices 0 al 14)
    const tileCountX = canvas.width / gridSize;
    const tileCountY = canvas.height / gridSize;
    
    let score = 0;
    let velocityX = 0;
    let velocityY = 0;
    let snake = [{x: 7, y: 7}]; // Cabeza inicial centrada
    let food = {}; // La iniciamos vacía y la generamos abajo
    let gameInterval;
    let isGameRunning = true;

    // --- INICIO DEL JUEGO ---
    placeFood(); // CORRECCIÓN: Generar la primera manzana antes de empezar
    gameInterval = setInterval(gameLoop, 1000 / 10); // Velocidad del juego (10 FPS)

    function gameLoop() {
        if (!isGameRunning) return;

        moveSnake();
        
        if (checkCollisions()) {
            showGameOver();
            return;
        }
        
        checkFood();
        drawGame();
        
        if (score >= 10) {
            winGame();
        }
    }

    function moveSnake() {
        // Solo mover si hay velocidad (si el jugador ha pulsado una tecla)
        if (velocityX === 0 && velocityY === 0) return;

        const head = {x: snake[0].x + velocityX, y: snake[0].y + velocityY};
        snake.unshift(head); 
        snake.pop(); 
    }

    function checkFood() {
        if (snake[0].x === food.x && snake[0].y === food.y) {
            score++;
            scoreElement.innerText = score;
            snake.push({}); // Añadir un segmento a la cola (al no hacer pop)
            placeFood();
        }
    }

    function placeFood() {
        // Generar coordenadas aleatorias dentro de los límites (0 a 14)
        food.x = Math.floor(Math.random() * tileCountX);
        food.y = Math.floor(Math.random() * tileCountY);
        
        // Asegurarse de que la comida no aparezca encima del cuerpo de la serpiente
        // Si pasa, volvemos a intentar generar otra posición.
        snake.forEach(part => {
            if (part.x === food.x && part.y === food.y) {
                placeFood();
            }
        });
    }

    function checkCollisions() {
        const head = snake[0];

        // 1. Chocar contra Paredes
        // Si x es menor que 0 Ó x es igual o mayor a 15 (tileCountX)
        if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
            return true;
        }

        // 2. Chocar con uno mismo
        // Empezamos el bucle en 1 porque la cabeza[0] siempre choca con la cabeza[0]
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        return false;
    }

    function drawGame() {
        // Limpiar el canvas (Fondo negro)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar Serpiente
        snake.forEach((part, index) => {
            if (index === 0) ctx.fillStyle = '#1ed760'; // Cabeza verde claro
            else ctx.fillStyle = '#1db954'; // Cuerpo verde normal
            
            // Dibujamos el cuadrito restando 2px para dejar un pequeño borde negro entre partes
            ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
        });

        // Dibujar Comida (Manzana roja)
        ctx.fillStyle = 'red';
        ctx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);
    }

    // --- FUNCIONES DE ESTADO DEL JUEGO ---

    function winGame() {
        isGameRunning = false;
        clearInterval(gameInterval);
        winScreen.classList.remove('hidden');
    }

    function showGameOver() {
        isGameRunning = false;
        clearInterval(gameInterval);
        finalScoreElement.innerText = score;
        gameOverScreen.classList.remove('hidden');
    }

    // --- CONTROLES ---
    document.addEventListener('keydown', changeDirection);

    function changeDirection(event) {
        // Evitar el scroll de la página con las flechas
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
            event.preventDefault();
        }

        const keyPressed = event.keyCode;
        const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;

        // Lógica para evitar que la serpiente gire 180 grados sobre sí misma
        // (Ej: si va a la derecha, no puede ir inmediatamente a la izquierda)
        if (keyPressed === LEFT && velocityX !== 1) { velocityX = -1; velocityY = 0; }
        if (keyPressed === UP && velocityY !== 1) { velocityX = 0; velocityY = -1; }
        if (keyPressed === RIGHT && velocityX !== -1) { velocityX = 1; velocityY = 0; }
        if (keyPressed === DOWN && velocityY !== -1) { velocityX = 0; velocityY = 1; }
    }

    // Controles táctiles / Botones en pantalla para móvil
    document.getElementById('left-btn').addEventListener('click', () => { if(velocityX !== 1) { velocityX = -1; velocityY = 0; }});
    document.getElementById('up-btn').addEventListener('click', () => { if(velocityY !== 1) { velocityX = 0; velocityY = -1; }});
    document.getElementById('right-btn').addEventListener('click', () => { if(velocityX !== -1) { velocityX = 1; velocityY = 0; }});
    document.getElementById('down-btn').addEventListener('click', () => { if(velocityY !== -1) { velocityX = 0; velocityY = 1; }});
});