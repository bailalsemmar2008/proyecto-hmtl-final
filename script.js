document.addEventListener('DOMContentLoaded', () => {
    const puzzleBoard = document.getElementById('puzzle-board');
    const puzzleWrapper = document.getElementById('puzzle-wrapper'); 
    const rewardWrapper = document.getElementById('reward-wrapper'); 
    const statusMsg = document.getElementById('status-msg');
    
    // CONFIGURACIÓN
    const size = 3; 
    let pieces = [];

    // --- 1. LÓGICA CORREGIDA: USAR URL EN VEZ DE MEMORIA ---
    // Esto hace que si recargas la página normal (F5), te salga el puzzle.
    // Pero si vienes del Snake con el código especial, te deje pasar.
    const urlParams = new URLSearchParams(window.location.search);
    const isUnlocked = urlParams.get('unlocked');

    // --- LISTA DE IMÁGENES PERSONALIZADA ---
    const imageList = [ 
        'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c9a27e0a-52f7-4cec-a932-b6246308a58e/dfg6451-bf8a1a80-3af1-4485-a22a-ce68c40fdc9f.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9jOWEyN2UwYS01MmY3LTRjZWMtYTkzMi1iNjI0NjMwOGE1OGUvZGZnNjQ1MS1iZjhhMWE4MC0zYWYxLTQ0ODUtYTIyYS1jZTY4YzQwZmRjOWYuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.4GScQMOAjRf80dZnpzeuFH4cu0cqGf2NfRQjzndROEg', // IShowSpeed 
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa6h11UfK0kutO4Y97kJ4iwb3yDjn1H-SNAA&s', // Manzana gato 
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTulYq9zMObsZf-ZKa3PFvJUyw5NQcSicZQPQ&s', // TotЯ 
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDKpVo_NEQ875K0ZEpFNAlme6r780XGtT8Zg&s', // Eduardo 
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbwOGolbycEAqRi2LSV_rL_0KslOpkukRpFQ&s',  // Freddy Sexy 
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxkrggw9rn6fAlFXP65XSVm5lTeeMl-5kmrQ&s', // La Falete Con Máscara 
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-5oQiwIaJDM53rFmzFLUF6YDRjBt5SK-R1g&s', // El Rincon De Mario 
        'https://m.media-amazon.com/images/I/51uHWNxp6AL._SX354_SY354_BL0_QL100__UXNaN_FMjpg_QL85_.jpg', //Jose Nogales 
        'https://images.genius.com/318a0bc7dfe22d4329f244e933fa0a2e.900x900x1.jpg', //La Ruth Empodera' 
        'https://i.ytimg.com/vi/nD_7YPIeyw8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDDIApb7uA-gD9NvY8hyMFwjN9u8g' //AlexGamer Capitán América 
    ]; 

    if (isUnlocked === 'true') {
        // Vienes del Snake -> Muestras canciones
        console.log("Acceso concedido desde Snake.");
        unlockContent();
    } else {
        // Entras normal -> Muestras puzzle
        // LIMPIAMOS MEMORIA ANTIGUA POR SI ACASO
        localStorage.removeItem('musicAccess');
        initPuzzle();
    }

    // Función auxiliar para mostrar contenido
    function unlockContent() {
        puzzleWrapper.classList.add('hidden');
        rewardWrapper.classList.remove('hidden');
        loadSongs();
    }

    // --- 2. FUNCIONES DEL PUZZLE ---
    function initPuzzle() {
        pieces = [];
        puzzleBoard.innerHTML = ''; 

        // Elegir imagen al azar
        const randomIndex = Math.floor(Math.random() * imageList.length);
        const currentImageUrl = imageList[randomIndex];

        for (let i = 0; i < size * size; i++) {
            pieces.push(i);
        }

        pieces.sort(() => Math.random() - 0.5);

        pieces.forEach((val, index) => {
            const div = document.createElement('div');
            div.classList.add('puzzle-piece');
            div.setAttribute('draggable', 'true');
            div.dataset.index = index; 
            div.dataset.value = val;   

            div.style.backgroundImage = `url('${currentImageUrl}')`;

            const col = val % size;
            const row = Math.floor(val / size);
            const xPercent = (col / (size - 1)) * 100;
            const yPercent = (row / (size - 1)) * 100;

            div.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
            div.style.backgroundSize = `${size * 100}% ${size * 100}%`;

            addDragEvents(div);
            puzzleBoard.appendChild(div);
        });
    }

    // --- 3. LÓGICA DRAG & DROP ---
    let dragSrcEl = null;

    function addDragEvents(item) {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('touchstart', handleTouchStart, {passive: false});
        item.addEventListener('touchmove', handleTouchMove, {passive: false});
        item.addEventListener('touchend', handleTouchEnd);
    }

    function handleDragStart(e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
        this.classList.add('dragging');
    }
    function handleDragOver(e) { if (e.preventDefault) e.preventDefault(); return false; }
    function handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (dragSrcEl !== this) {
            swapPieces(dragSrcEl, this);
            checkWin();
        }
        return false;
    }
    function handleDragEnd(e) { this.classList.remove('dragging'); }
    let touchStartItem = null;
    function handleTouchStart(e) {
        e.preventDefault(); 
        touchStartItem = this;
        this.classList.add('dragging');
    }
    function handleTouchMove(e) { e.preventDefault(); }
    function handleTouchEnd(e) {
        e.preventDefault();
        this.classList.remove('dragging');
        const touch = e.changedTouches[0];
        this.style.display = 'none'; 
        let targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        this.style.display = 'block';
        if (targetElement && !targetElement.classList.contains('puzzle-piece')) {
            targetElement = targetElement.closest('.puzzle-piece');
        }
        if (targetElement && targetElement.classList.contains('puzzle-piece') && targetElement !== touchStartItem) {
            swapPieces(touchStartItem, targetElement);
            checkWin();
        }
    }

    function swapPieces(item1, item2) {
        const tempBgPos = item1.style.backgroundPosition;
        item1.style.backgroundPosition = item2.style.backgroundPosition;
        item2.style.backgroundPosition = tempBgPos;
        const tempVal = item1.dataset.value;
        item1.dataset.value = item2.dataset.value;
        item2.dataset.value = tempVal;
    }

    function checkWin() {
        const currentPieces = document.querySelectorAll('.puzzle-piece');
        let isSolved = true;
        currentPieces.forEach((piece, index) => {
            if (parseInt(piece.dataset.value) !== index) isSolved = false;
        });

        if (isSolved) {
            statusMsg.textContent = "¡SISTEMA DESBLOQUEADO!";
            statusMsg.style.color = "#1db954";
            
            // YA NO GUARDAMOS EN LOCALSTORAGE
            // Simplemente mostramos el contenido
            
            puzzleBoard.style.border = "2px solid #fff";
            puzzleBoard.style.boxShadow = "0 0 30px #1db954";

            setTimeout(() => {
                unlockContent();
            }, 1000);
        }
    }

    // --- 4. REPRODUCTOR (CON TUS CANCIONES) ---
    function loadSongs() {
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
                <div class="song-info">
                    <span class="song-title">${song.title}</span>
                    <span class="song-artist">${song.artist}</span>
                </div>
                <button class="play-btn" data-url="${song.url}">▶</button>
            `;
            container.appendChild(div);
        });

        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', togglePlay);
        });
    }

    const audioPlayer = document.getElementById('audio-player');
    let currentBtn = null;
    audioPlayer.addEventListener('ended', () => {
        if (currentBtn) {
            currentBtn.textContent = "▶";
            currentBtn.classList.remove('playing');
            currentBtn = null;
        }
    });

    function togglePlay(e) {
        const btn = e.target;
        const url = btn.dataset.url;
        if (currentBtn === btn) {
            if (audioPlayer.paused) {
                audioPlayer.play();
                btn.textContent = "II";
                btn.classList.add('playing');
            } else {
                audioPlayer.pause();
                btn.textContent = "▶";
                btn.classList.remove('playing');
            }
        } else {
            if (currentBtn) {
                currentBtn.textContent = "▶";
                currentBtn.classList.remove('playing');
            }
            audioPlayer.src = url;
            audioPlayer.play();
            btn.textContent = "II";
            btn.classList.add('playing');
            currentBtn = btn;
        }
    }
});