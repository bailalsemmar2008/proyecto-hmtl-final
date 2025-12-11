document.addEventListener('DOMContentLoaded', () => {
    // ELEMENTOS GLOBALES
    const puzzleWrapper = document.getElementById('puzzle-wrapper');
    const rewardWrapper = document.getElementById('reward-wrapper');
    const puzzleBoard = document.getElementById('puzzle-board');
    const statusMsg = document.getElementById('status-msg');

    // --- 1. CONTROL DE ACCESO (Url / Puzzle) ---
    const urlParams = new URLSearchParams(window.location.search);
    const isUnlocked = urlParams.get('unlocked');

    // Lista de imágenes para el puzzle (Tu lista personalizada)
    const puzzleImages = [ 
        'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c9a27e0a-52f7-4cec-a932-b6246308a58e/dfg6451-bf8a1a80-3af1-4485-a22a-ce68c40fdc9f.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9jOWEyN2UwYS01MmY3LTRjZWMtYTkzMi1iNjI0NjMwOGE1OGUvZGZnNjQ1MS1iZjhhMWE4MC0zYWYxLTQ0ODUtYTIyYS1jZTY4YzQwZmRjOWYuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.4GScQMOAjRf80dZnpzeuFH4cu0cqGf2NfRQjzndROEg', 
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa6h11UfK0kutO4Y97kJ4iwb3yDjn1H-SNAA&s', 
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTulYq9zMObsZf-ZKa3PFvJUyw5NQcSicZQPQ&s', 
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDKpVo_NEQ875K0ZEpFNAlme6r780XGtT8Zg&s', 
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbwOGolbycEAqRi2LSV_rL_0KslOpkukRpFQ&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxkrggw9rn6fAlFXP65XSVm5lTeeMl-5kmrQ&s', 
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-5oQiwIaJDM53rFmzFLUF6YDRjBt5SK-R1g&s', 
        'https://m.media-amazon.com/images/I/51uHWNxp6AL._SX354_SY354_BL0_QL100__UXNaN_FMjpg_QL85_.jpg', 
        'https://images.genius.com/318a0bc7dfe22d4329f244e933fa0a2e.900x900x1.jpg',
        'https://i.ytimg.com/vi/nD_7YPIeyw8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDDIApb7uA-gD9NvY8hyMFwjN9u8g'
    ];

    // Verificar si mostramos puzzle o dashboard
    if (isUnlocked === 'true') {
        unlockContent();
    } else {
        localStorage.removeItem('musicAccess'); // Limpiar caché vieja por si acaso
        initPuzzle();
    }

    function unlockContent() {
        puzzleWrapper.classList.add('hidden');
        rewardWrapper.classList.remove('hidden');
        
        // Inicializar los 3 módulos del dashboard
        initMusicPlayer();
        initEmojiSystem();
        initHigherLowerGame();
    }

    // ==========================================================
    // MÓDULO 1: PUZZLE (Lógica original simplificada)
    // ==========================================================
    function initPuzzle() {
        const size = 3;
        let pieces = [];
        puzzleBoard.innerHTML = '';
        
        const randomIndex = Math.floor(Math.random() * puzzleImages.length);
        const currentImageUrl = puzzleImages[randomIndex];

        for (let i = 0; i < size * size; i++) pieces.push(i);
        pieces.sort(() => Math.random() - 0.5);

        pieces.forEach((val, index) => {
            const div = document.createElement('div');
            div.classList.add('puzzle-piece');
            div.setAttribute('draggable', 'true');
            div.dataset.index = index; div.dataset.value = val;
            
            div.style.backgroundImage = `url('${currentImageUrl}')`;
            
            const col = val % size;
            const row = Math.floor(val / size);
            div.style.backgroundPosition = `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`;
            
            // Event listeners del drag (resumido para ahorrar espacio, funciona igual)
            addDragEvents(div);
            puzzleBoard.appendChild(div);
        });
    }

    // ... (Mantengo las funciones drag/drop tuyas aquí ocultas para que el código sea limpio, usa las mismas de antes) ...
    // Funciones Helper del Drag & Drop
    let dragSrcEl = null;
    function addDragEvents(item) {
        item.addEventListener('dragstart', function(e) { dragSrcEl = this; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/html', this.innerHTML); this.classList.add('dragging'); });
        item.addEventListener('dragover', function(e) { if(e.preventDefault) e.preventDefault(); return false; });
        item.addEventListener('drop', function(e) { if(e.stopPropagation) e.stopPropagation(); if(dragSrcEl !== this) { swapPieces(dragSrcEl, this); checkWin(); } return false; });
        item.addEventListener('dragend', function() { this.classList.remove('dragging'); });
        // Touch events
        item.addEventListener('touchstart', function(e) { dragSrcEl = this; }, {passive: true});
        item.addEventListener('touchend', function(e) { 
            let changedTouch = e.changedTouches[0];
            let elem = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
            if(elem && elem.classList.contains('puzzle-piece') && elem !== dragSrcEl) { swapPieces(dragSrcEl, elem); checkWin(); }
        });
    }
    function swapPieces(i1, i2) {
        let tempBg = i1.style.backgroundPosition; i1.style.backgroundPosition = i2.style.backgroundPosition; i2.style.backgroundPosition = tempBg;
        let tempVal = i1.dataset.value; i1.dataset.value = i2.dataset.value; i2.dataset.value = tempVal;
    }
    function checkWin() {
        let solved = true;
        document.querySelectorAll('.puzzle-piece').forEach((p, i) => { if(parseInt(p.dataset.value) !== i) solved = false; });
        if(solved) {
            statusMsg.textContent = "¡ACCESO CONCEDIDO!";
            statusMsg.style.color = "#1db954";
            setTimeout(unlockContent, 1000);
        }
    }


    // ==========================================================
    // MÓDULO 2: SELECTOR DE EMOJIS FLOTANTES
    // ==========================================================
    function initEmojiSystem() {
        const emojiContainer = document.getElementById('emoji-grid');
        // Lista generosa de emojis (CORREGIDA: se eliminó "sneezing" y se añadió el emoji)
        const emojis = ["😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎","😍","😘","🥰","😗","😙","😚","🙂","🤗","🤩","🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮","🤐","😯","😪","😫","😴","😌","😛","😜","😝","🤤","😒","😓","😔","😕","🙃","🤑","😲","☹️","🙁","😖","😞","😟","😤","😢","😭","😦","😧","😨","😩","🤯","😬","😰","😱","🥵","🥶","😳","🤪","😵","😡","😠","🤬","😷","🤒","🤕","🤢","🤮","🤧","😇","🥳","🥺","🤠","🤡","🤥","🤫","🤭","🧐","🤓","😈","👿","👹","👺","💀","👻","👽","🤖","💩","😺","😸","😹","😻","😼","😽","🙀","😿","😾"];
        
        emojiContainer.innerHTML = '';
        
        emojis.forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.classList.add('emoji-btn');
            span.addEventListener('click', () => spawnFloatingEmoji(char));
            emojiContainer.appendChild(span);
        });
    }

    function spawnFloatingEmoji(char) {
        const el = document.createElement('div');
        el.textContent = char;
        el.classList.add('floating-emoji');
        document.body.appendChild(el);

        // Posición inicial aleatoria
        let x = Math.random() * (window.innerWidth - 50);
        let y = Math.random() * (window.innerHeight - 50);
        
        // Velocidad aleatoria
        let vx = (Math.random() - 0.5) * 10; // Velocidad X
        let vy = (Math.random() - 0.5) * 10; // Velocidad Y

        el.style.left = x + 'px';
        el.style.top = y + 'px';

        // Animación de rebote
        function animate() {
            // Actualizar posición
            x += vx;
            y += vy;

            // Detectar bordes y rebotar
            if (x <= 0 || x >= window.innerWidth - 50) vx *= -1;
            if (y <= 0 || y >= window.innerHeight - 50) vy *= -1;

            el.style.left = x + 'px';
            el.style.top = y + 'px';

            // Si el elemento sigue en el DOM, continuar animación
            if (document.body.contains(el)) {
                requestAnimationFrame(animate);
            }
        }
        animate();

        // Eliminar después de 15 segundos para no saturar la PC
        setTimeout(() => el.remove(), 15000);
    }


    // ==========================================================
    // MÓDULO 3: MÚSICA (Tu lista personalizada)
    // ==========================================================
    function initMusicPlayer() {
        const container = document.getElementById('player-container');
        const songsData = [
            { title: "M.A.I", artist: "Milo J", url: "https://files.catbox.moe/nkv4ww.webm" },  
            { title: "20 Min", artist: "Lil Uzi Vert", url: "https://files.catbox.moe/fh08je.mp3" }, 
            { title: "Lo Que Tiene", artist: "Morad, Beny Jr, Rvfv", url: "https://files.catbox.moe/ryiyu8.mp3" }, 
            { title: "goosebumps", artist: "Travis Scott", url: "https://files.catbox.moe/0chh19.mp3" }, 
            { title: "All The Stars", artist: "Kendrick Lamar, SZA", url: "https://files.catbox.moe/9ly72f.mp3" }, 
            { title: "See You Again", artist: "Tryler, The Creator", url: "https://files.catbox.moe/x3ecve.mp3" }
        ];

        container.innerHTML = '';
        songsData.forEach(song => {
            const div = document.createElement('div');
            div.classList.add('song-item');
            div.innerHTML = `
                <div class="song-info"><span class="song-title">${song.title}</span><span class="song-artist">${song.artist}</span></div>
                <button class="play-btn" data-url="${song.url}">▶</button>
            `;
            container.appendChild(div);
        });

        // Lógica del reproductor
        const audioPlayer = document.getElementById('audio-player');
        let currentBtn = null;
        
        audioPlayer.addEventListener('ended', () => {
            if (currentBtn) { currentBtn.textContent = "▶"; currentBtn.classList.remove('playing'); currentBtn = null; }
        });

        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.target.dataset.url;
                if (currentBtn === e.target) {
                    if (audioPlayer.paused) { audioPlayer.play(); e.target.textContent = "II"; e.target.classList.add('playing'); }
                    else { audioPlayer.pause(); e.target.textContent = "▶"; e.target.classList.remove('playing'); }
                } else {
                    if (currentBtn) { currentBtn.textContent = "▶"; currentBtn.classList.remove('playing'); }
                    audioPlayer.src = url; audioPlayer.play();
                    e.target.textContent = "II"; e.target.classList.add('playing');
                    currentBtn = e.target;
                }
            });
        });
    }


    // ==========================================================
    // MÓDULO 4: HIGHER OR LOWER (Juego)
    // ==========================================================
    function initHigherLowerGame() {
        // Base de datos de artistas (Valores ficticios aproximados a búsquedas/streams mensuales)
        const hlData = [
            { name: "Travis Scott", val: 55000000, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDKpVo_NEQ875K0ZEpFNAlme6r780XGtT8Zg&s" },
            { name: "The Rock", val: 8000000, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTulYq9zMObsZf-ZKa3PFvJUyw5NQcSicZQPQ&s" },
            { name: "Milo J", val: 18000000, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa6h11UfK0kutO4Y97kJ4iwb3yDjn1H-SNAA&s" },
            { name: "Taylor Swift", val: 100000000, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbwOGolbycEAqRi2LSV_rL_0KslOpkukRpFQ&s" },
            { name: "Lionel Messi", val: 60000000, img: "https://i.ytimg.com/vi/nD_7YPIeyw8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDDIApb7uA-gD9NvY8hyMFwjN9u8g" },
            { name: "IShowSpeed", val: 15000000, img: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c9a27e0a-52f7-4cec-a932-b6246308a58e/dfg6451-bf8a1a80-3af1-4485-a22a-ce68c40fdc9f.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9jOWEyN2UwYS01MmY3LTRjZWMtYTkzMi1iNjI0NjMwOGE1OGUvZGZnNjQ1MS1iZjhhMWE4MC0zYWYxLTQ0ODUtYTIyYS1jZTY4YzQwZmRjOWYuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.4GScQMOAjRf80dZnpzeuFH4cu0cqGf2NfRQjzndROEg" },
            { name: "Bad Bunny", val: 65000000, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-5oQiwIaJDM53rFmzFLUF6YDRjBt5SK-R1g&s" },
            { name: "Minecraft", val: 40000000, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxkrggw9rn6fAlFXP65XSVm5lTeeMl-5kmrQ&s" }
        ];

        // Elementos DOM
        const startScreen = document.getElementById('hl-start-screen');
        const gameplay = document.getElementById('hl-gameplay');
        const gameOver = document.getElementById('hl-game-over');
        
        // Elementos Dinámicos
        const leftImg = document.getElementById('hl-img-1');
        const leftName = document.getElementById('hl-name-1');
        const leftVal = document.getElementById('hl-val-1');
        
        const rightImg = document.getElementById('hl-img-2');
        const rightName = document.getElementById('hl-name-2');
        const rightRef = document.getElementById('hl-ref-name');
        
        const roundDisp = document.getElementById('hl-round');
        const scoreDisp = document.getElementById('hl-score');

        let round = 0;
        let score = 0;
        let currentItem = null;
        let nextItem = null;
        const maxRounds = 5;

        // Botones
        document.getElementById('hl-start-btn').addEventListener('click', startGame);
        document.getElementById('hl-restart-btn').addEventListener('click', startGame);
        document.getElementById('btn-higher').addEventListener('click', () => makeGuess('higher'));
        document.getElementById('btn-lower').addEventListener('click', () => makeGuess('lower'));

        function startGame() {
            round = 1;
            score = 0;
            startScreen.classList.add('hidden');
            gameOver.classList.add('hidden');
            gameplay.classList.remove('hidden');
            
            // Elegir primer item al azar
            currentItem = hlData[Math.floor(Math.random() * hlData.length)];
            loadNextRound();
        }

        function loadNextRound() {
            // Actualizar UI Score
            scoreDisp.textContent = score;
            roundDisp.textContent = round;

            // Elegir siguiente item (diferente al actual)
            do {
                nextItem = hlData[Math.floor(Math.random() * hlData.length)];
            } while (nextItem.name === currentItem.name);

            // Renderizar Izquierda (Base)
            leftImg.src = currentItem.img;
            leftName.textContent = currentItem.name;
            leftVal.textContent = currentItem.val.toLocaleString();

            // Renderizar Derecha (Incógnita)
            rightImg.src = nextItem.img;
            rightName.textContent = nextItem.name;
            rightRef.textContent = currentItem.name;
        }

        function makeGuess(choice) {
            let isCorrect = false;
            
            if (choice === 'higher' && nextItem.val >= currentItem.val) isCorrect = true;
            else if (choice === 'lower' && nextItem.val <= currentItem.val) isCorrect = true;

            if (isCorrect) {
                score++;
                // Animación visual rápida (opcional)
                alert("¡CORRECTO! " + nextItem.name + " tiene " + nextItem.val.toLocaleString());
            } else {
                alert("FALLASTE... " + nextItem.name + " tiene " + nextItem.val.toLocaleString());
            }

            // Preparar siguiente turno
            round++;
            if (round > maxRounds) {
                endGame();
            } else {
                // El ítem de la derecha pasa a ser el de la izquierda
                currentItem = nextItem;
                loadNextRound();
            }
        }

        function endGame() {
            gameplay.classList.add('hidden');
            gameOver.classList.remove('hidden');
            document.getElementById('hl-final-score').textContent = score;
            
            let msg = "¡Buen intento!";
            if(score === 5) msg = "¡PERFECTO!";
            else if(score >= 3) msg = "¡Bien hecho!";
            else msg = "Más suerte la próxima...";
            
            document.getElementById('hl-result-msg').textContent = msg;
        }
    }
});