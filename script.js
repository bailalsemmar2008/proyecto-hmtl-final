/* script.js */
document.addEventListener('DOMContentLoaded', () => {
    const puzzleBoard = document.getElementById('puzzle-board');
    const statusMsg = document.getElementById('status-msg');
    
    // CONFIGURACIÓN
    const size = 3; 
    let pieces = [];

    // --- NUEVA LISTA DE IMÁGENES ---
    // Puedes añadir tantas como quieras. Intenta que sean cuadradas o se verán estiradas.
    // He usado imágenes de Unsplash de temática urbana/música/arte.
    const imageList = [
        'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c9a27e0a-52f7-4cec-a932-b6246308a58e/dfg6451-bf8a1a80-3af1-4485-a22a-ce68c40fdc9f.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9jOWEyN2UwYS01MmY3LTRjZWMtYTkzMi1iNjI0NjMwOGE1OGUvZGZnNjQ1MS1iZjhhMWE4MC0zYWYxLTQ0ODUtYTIyYS1jZTY4YzQwZmRjOWYuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.4GScQMOAjRf80dZnpzeuFH4cu0cqGf2NfRQjzndROEg', // IShowSpeed
        'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=600&auto=format&fit=crop', // Graffiti
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop', // Concierto
        'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=600&auto=format&fit=crop', // DJ
        'https://images.unsplash.com/photo-1508973379184-7517410fb0bc?q=80&w=600&auto=format&fit=crop'  // Vinilos
    ];
    
    initPuzzle();

    function initPuzzle() {
        pieces = [];
        puzzleBoard.innerHTML = ''; 

        // --- SELECCIÓN ALEATORIA DE IMAGEN ---
        // 1. Elegimos un índice al azar basado en la longitud de la lista
        const randomIndex = Math.floor(Math.random() * imageList.length);
        // 2. Guardamos la URL seleccionada
        const currentImageUrl = imageList[randomIndex];

        console.log("Imagen seleccionada para este juego:", currentImageUrl);

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

            // --- APLICAR LA IMAGEN ALEATORIA ---
            // Aplicamos la imagen seleccionada a esta pieza mediante JS
            div.style.backgroundImage = `url('${currentImageUrl}')`;

            // Cálculos de posición y tamaño (igual que antes)
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

    // --- LÓGICA DRAG & DROP ROBUSTA (No cambia nada aquí abajo) ---
    let dragSrcEl = null;
    // ... (MANTÉN TODO EL CÓDIGO RESTANTE DE LAS FUNCIONES DRAG/DROP Y EL REPRODUCTOR IGUAL QUE ANTES) ...
    
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
 
     // Funciones Móvil (Touch)
     let touchStartItem = null;
 
     function handleTouchStart(e) {
         e.preventDefault(); 
         touchStartItem = this;
         this.classList.add('dragging');
     }
 
     function handleTouchMove(e) {
         e.preventDefault();
     }
 
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
             if (parseInt(piece.dataset.value) !== index) {
                 isSolved = false;
             }
         });
 
         if (isSolved) {
             statusMsg.textContent = "¡SISTEMA DESBLOQUEADO!";
             statusMsg.style.color = "#1db954";
             
             puzzleBoard.style.border = "2px solid #fff";
             puzzleBoard.style.boxShadow = "0 0 30px #1db954";
 
             setTimeout(() => {
                 document.getElementById('puzzle-wrapper').classList.add('hidden');
                 document.getElementById('reward-wrapper').classList.remove('hidden');
                 loadSongs(); 
             }, 1000);
         }
     }
 
     // --- REPRODUCTOR ---
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