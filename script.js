document.addEventListener('DOMContentLoaded', () => {
    const puzzleBoard = document.getElementById('puzzle-board');
    const statusMsg = document.getElementById('status-msg');
    
    // CONFIGURACIÓN
    const size = 3; 
    let pieces = [];
    
    initPuzzle();

    function initPuzzle() {
        pieces = [];
        puzzleBoard.innerHTML = ''; 

        for (let i = 0; i < size * size; i++) {
            pieces.push(i);
        }

        // Barajar
        pieces.sort(() => Math.random() - 0.5);

        pieces.forEach((val, index) => {
            const div = document.createElement('div');
            div.classList.add('puzzle-piece');
            div.setAttribute('draggable', 'true');
            div.dataset.index = index; 
            div.dataset.value = val;   

            // --- CORRECCIÓN MATEMÁTICA DEL CORTE ---
            
            // 1. Calculamos fila y columna de la parte de la imagen que queremos mostrar
            const col = val % size;
            const row = Math.floor(val / size);
            
            // 2. Calculamos el porcentaje exacto de posición
            // Fórmula: (posición / (total_piezas - 1)) * 100
            const xPercent = (col / (size - 1)) * 100;
            const yPercent = (row / (size - 1)) * 100;

            div.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
            
            // 3. ¡IMPORTANTE! Forzamos el tamaño para que coincida con la cuadrícula
            // Si es 3x3, la imagen debe ser un 300% del tamaño de la pieza
            div.style.backgroundSize = `${size * 100}% ${size * 100}%`;

            addDragEvents(div);
            puzzleBoard.appendChild(div);
        });
    }

    // --- LÓGICA DRAG & DROP ROBUSTA ---
    let dragSrcEl = null;

    function addDragEvents(item) {
        // PC
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);

        // MÓVIL (Touch)
        item.addEventListener('touchstart', handleTouchStart, {passive: false});
        item.addEventListener('touchmove', handleTouchMove, {passive: false});
        item.addEventListener('touchend', handleTouchEnd);
    }

    // Funciones PC
    function handleDragStart(e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
        this.classList.add('dragging');
    }

    function handleDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        return false;
    }

    function handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (dragSrcEl !== this) {
            swapPieces(dragSrcEl, this);
            checkWin();
        }
        return false;
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
    }

    // Funciones Móvil (CORREGIDAS)
    let touchStartItem = null;

    function handleTouchStart(e) {
        e.preventDefault(); 
        touchStartItem = this;
        this.classList.add('dragging');
    }

    function handleTouchMove(e) {
        e.preventDefault();
        // Aquí podrías mover un elemento fantasma si quisieras más efectos visuales
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        this.classList.remove('dragging');
        
        const touch = e.changedTouches[0];
        
        // TRUCO: Ocultamos momentáneamente la pieza que soltamos
        // para que 'elementFromPoint' detecte lo que hay DEBAJO
        this.style.display = 'none';
        
        let targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Volvemos a mostrar la pieza inmediatamente
        this.style.display = 'block';

        // Buscamos si soltamos encima de una pieza válida
        if (targetElement && !targetElement.classList.contains('puzzle-piece')) {
            targetElement = targetElement.closest('.puzzle-piece');
        }

        if (targetElement && targetElement.classList.contains('puzzle-piece') && targetElement !== touchStartItem) {
            swapPieces(touchStartItem, targetElement);
            checkWin();
        }
    }

    function swapPieces(item1, item2) {
        // Intercambiamos solo los estilos visuales y los datos
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
            if (parseInt(piece.dataset.value) !== index) {
                isSolved = false;
            }
        });

        if (isSolved) {
            statusMsg.textContent = "¡SISTEMA DESBLOQUEADO!";
            statusMsg.style.color = "#1db954";
            
            // Animación visual de éxito
            puzzleBoard.style.border = "2px solid #fff";
            puzzleBoard.style.boxShadow = "0 0 30px #1db954";

            setTimeout(() => {
                document.getElementById('puzzle-wrapper').classList.add('hidden');
                document.getElementById('reward-wrapper').classList.remove('hidden');
                loadSongs(); 
            }, 1000);
        }
    }

    // --- REPRODUCTOR (Igual que antes) ---
    async function loadSongs() {
        const container = document.getElementById('player-container');
        let songsData = [];

        try {
            const response = await fetch('songs.json');
            if (!response.ok) throw new Error("Error JSON");
            songsData = await response.json();
        } catch (error) {
            console.warn("Usando respaldo.");
            songsData = [
                { title: "Rincón", artist: "Milo J", url: "https://files.catbox.moe/k2r8d1.mp3" }, 
                { title: "XO Tour Llif3", artist: "Lil Uzi Vert", url: "https://files.catbox.moe/k2r8d1.mp3" },
                { title: "Pelele", artist: "Morad", url: "https://files.catbox.moe/k2r8d1.mp3" },
                { title: "FE!N", artist: "Travis Scott", url: "https://files.catbox.moe/k2r8d1.mp3" }
            ];
        }

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

    function togglePlay(e) {
        const btn = e.target;
        const url = btn.dataset.url;

        if (currentBtn === btn && !audioPlayer.paused) {
            audioPlayer.pause();
            btn.textContent = "▶";
            btn.classList.remove('playing');
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