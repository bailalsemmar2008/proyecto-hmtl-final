document.addEventListener('DOMContentLoaded', () => {
    const puzzleBoard = document.getElementById('puzzle-board');
    const statusMsg = document.getElementById('status-msg');
    
    // Configuración del Puzzle (3x3)
    const size = 3; 
    let pieces = [];
    
    // Inicializar Puzzle
    initPuzzle();

    function initPuzzle() {
        // Crear las 9 piezas con su posición correcta
        for (let i = 0; i < size * size; i++) {
            pieces.push(i);
        }

        // Barajar las piezas aleatoriamente
        pieces.sort(() => Math.random() - 0.5);

        // Renderizar en el DOM
        pieces.forEach((val, index) => {
            const div = document.createElement('div');
            div.classList.add('puzzle-piece');
            div.setAttribute('draggable', 'true');
            div.dataset.index = index; // Posición actual en el DOM
            div.dataset.value = val;   // Valor real de la pieza (0 a 8)

            // Calcular posición del background para que forme la imagen
            // val % size = columna (x)
            // Math.floor(val / size) = fila (y)
            const x = (val % size) * 100;
            const y = Math.floor(val / size) * 100;
            div.style.backgroundPosition = `-${x}px -${y}px`;

            // Eventos Drag & Drop
            addDragEvents(div);
            puzzleBoard.appendChild(div);
        });
    }

    // Lógica Drag & Drop
    let dragSrcEl = null;

    function addDragEvents(item) {
        item.addEventListener('dragstart', function(e) {
            dragSrcEl = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
            this.classList.add('dragging');
        });

        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });

        item.addEventListener('dragover', function(e) {
            if (e.preventDefault) e.preventDefault();
            return false;
        });

        item.addEventListener('dragenter', function() {
            this.classList.add('over');
        });

        item.addEventListener('dragleave', function() {
            this.classList.remove('over');
        });

        item.addEventListener('drop', function(e) {
            if (e.stopPropagation) e.stopPropagation();

            if (dragSrcEl !== this) {
                // Intercambiar estilos de fondo (la imagen visible)
                const tempBg = this.style.backgroundPosition;
                this.style.backgroundPosition = dragSrcEl.style.backgroundPosition;
                dragSrcEl.style.backgroundPosition = tempBg;

                // Intercambiar valores de datos para lógica de ganar
                const tempVal = this.dataset.value;
                this.dataset.value = dragSrcEl.dataset.value;
                dragSrcEl.dataset.value = tempVal;

                checkWin();
            }
            return false;
        });
    }

    function checkWin() {
        const currentPieces = document.querySelectorAll('.puzzle-piece');
        let isSolved = true;

        currentPieces.forEach((piece, index) => {
            // Si el valor de la pieza no coincide con su índice, no está resuelto
            if (parseInt(piece.dataset.value) !== index) {
                isSolved = false;
            }
        });

        if (isSolved) {
            statusMsg.textContent = "¡CORRECTO! Accediendo a la base de datos...";
            statusMsg.style.color = "#1db954";
            
            setTimeout(() => {
                document.getElementById('puzzle-wrapper').classList.add('hidden');
                document.getElementById('reward-wrapper').classList.remove('hidden');
                loadSongs(); // Cargar canciones
            }, 1500);
        }
    }

    // --- LÓGICA DEL REPRODUCTOR Y BASE DE DATOS ---

    async function loadSongs() {
        const container = document.getElementById('player-container');
        let songsData = [];

        try {
            // Intentar cargar desde el archivo JSON
            const response = await fetch('songs.json');
            if (!response.ok) throw new Error("No se pudo cargar JSON local");
            songsData = await response.json();
        } catch (error) {
            console.warn("No se pudo leer songs.json (probablemente por CORS local). Usando datos de respaldo.");
            // Datos de respaldo por si falla la carga local sin servidor
            songsData = [
                { title: "Rara Vez", artist: "Milo J, Taiu", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
                { title: "20 Min", artist: "Lil Uzi Vert", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
                { title: "Lo Que Tiene", artist: "Morad, Beny Jr, Rvfv", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
                { title: "goosebumps", artist: "Travis Scott", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
                { title: "All The Stars", artist: "Kendrick Lamar, SZA", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
                { title: "See You Again", artist: "Tyler, The Creator", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" }
            ];
        }

        // Renderizar lista
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

        // Añadir funcionalidad a los botones
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', togglePlay);
        });
    }

    const audioPlayer = document.getElementById('audio-player');
    let currentBtn = null;

    function togglePlay(e) {
        const btn = e.target;
        const url = btn.dataset.url;

        // Si pulsamos el mismo botón que ya suena
        if (currentBtn === btn && !audioPlayer.paused) {
            audioPlayer.pause();
            btn.textContent = "▶";
            btn.classList.remove('playing');
        } else {
            // Si pulsamos otro botón, resetear el anterior
            if (currentBtn) {
                currentBtn.textContent = "▶";
                currentBtn.classList.remove('playing');
            }
            
            // Reproducir nuevo
            audioPlayer.src = url;
            audioPlayer.play();
            btn.textContent = "II"; // Símbolo de pausa
            btn.classList.add('playing');
            currentBtn = btn;
        }
    }
});