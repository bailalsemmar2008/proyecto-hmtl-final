document.addEventListener('DOMContentLoaded', () => {
    // ELEMENTOS GLOBALES
    const puzzleWrapper = document.getElementById('puzzle-wrapper');
    const rewardWrapper = document.getElementById('reward-wrapper');
    const puzzleBoard = document.getElementById('puzzle-board');
    const statusMsg = document.getElementById('status-msg');

    // --- 1. CONTROL DE ACCESO ---
    const urlParams = new URLSearchParams(window.location.search);
    const isUnlocked = urlParams.get('unlocked');

    // Lista de imágenes para el puzzle
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

    if (isUnlocked === 'true') {
        unlockContent();
    } else {
        localStorage.removeItem('musicAccess');
        initPuzzle();
    }

    function unlockContent() {
        puzzleWrapper.classList.add('hidden');
        rewardWrapper.classList.remove('hidden');
        initMusicPlayer();
        initEmojiSystem();
        initHigherLowerGame();
    }

    // --- MÓDULO 1: PUZZLE ---
    function initPuzzle() {
        const size = 3;
        let pieces = [];
        puzzleBoard.innerHTML = '';
        const currentImageUrl = puzzleImages[Math.floor(Math.random() * puzzleImages.length)];

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
            addDragEvents(div);
            puzzleBoard.appendChild(div);
        });
    }

    // Funciones Drag & Drop
    let dragSrcEl = null;
    function addDragEvents(item) {
        item.addEventListener('dragstart', function(e) { dragSrcEl = this; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/html', this.innerHTML); this.classList.add('dragging'); });
        item.addEventListener('dragover', function(e) { if(e.preventDefault) e.preventDefault(); return false; });
        item.addEventListener('drop', function(e) { if(e.stopPropagation) e.stopPropagation(); if(dragSrcEl !== this) { swapPieces(dragSrcEl, this); checkWin(); } return false; });
        item.addEventListener('dragend', function() { this.classList.remove('dragging'); });
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

    // --- MÓDULO 2: EMOJIS (Corregido) ---
    function initEmojiSystem() {
        const emojiContainer = document.getElementById('emoji-grid');
        // AQUÍ ESTABA EL ERROR: He quitado "sneezing" y puesto 🤧
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
        let x = Math.random() * (window.innerWidth - 50);
        let y = Math.random() * (window.innerHeight - 50);
        let vx = (Math.random() - 0.5) * 10;
        let vy = (Math.random() - 0.5) * 10;
        el.style.left = x + 'px'; el.style.top = y + 'px';

        function animate() {
            x += vx; y += vy;
            if (x <= 0 || x >= window.innerWidth - 50) vx *= -1;
            if (y <= 0 || y >= window.innerHeight - 50) vy *= -1;
            el.style.left = x + 'px'; el.style.top = y + 'px';
            if (document.body.contains(el)) requestAnimationFrame(animate);
        }
        animate();
        setTimeout(() => el.remove(), 15000);
    }

    // --- MÓDULO 3: MÚSICA ---
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
                    audioPlayer.src = url; audioPlayer.play(); e.target.textContent = "II"; e.target.classList.add('playing'); currentBtn = e.target;
                }
            });
        });
    }

    // --- MÓDULO 4: HIGHER OR LOWER ---
    // --- JUEGO HIGHER OR LOWER (ARREGLADO) ---
function initHigherLowerGame() {
    // Datos de ejemplo
    const data = [
        { name: "Travis Scott", val: 55000000, img: "https://www.revolt.tv/article/media_13a2079ea88d5ac7100866266ec0c5c99ac09c66a.jpeg?width=800&format=jpeg&optimize=high" },
        { name: "JVKE", val: 8000000, img: "https://i1.sndcdn.com/avatars-sfHFlQVvFa8XyvG9-4rGoPw-t1080x1080.jpg" },
        { name: "Milo J", val: 18000000, img: "https://assets.primaverasound.com/psweb/4kxvnrk83h42rn0iew7y_1687778518705.jpeg" },
        { name: "Taylor Swift", val: 100000000, img: "https://cadenaser.com/resizer/v2/7JUV5CYVLBAYDEE7CN2L2JHMZ4.jpg?auth=b6e509a3e92778edb5161ef558005f266aec6f5304ea07b5cdc2e4b3e14c3c61&quality=70&width=650&height=487&smart=true" },
        { name: "Bad Bunny", val: 65000000, img: "https://images.ecestaticos.com/n-ZevVttrcC3F6SMdmxNbbuOWws=/0x27:1199x700/1200x1200/filters:fill(white):format(jpg)/f.elconfidencial.com%2Foriginal%2Fd27%2Fbba%2F3a8%2Fd27bba3a8af9ab17991362798f0f7488.jpg" }
    ];

    // Referencias al DOM (usamos IDs únicos para no fallar)
    const menuLayer = document.getElementById('hl-menu-layer');
    const endLayer = document.getElementById('hl-end-layer');
    const gameLayer = document.getElementById('hl-gameplay-layer');
    
    // Botones principales
    const btnPlay = document.getElementById('hl-btn-play');
    const btnRetry = document.getElementById('hl-btn-retry');
    const btnHigher = document.getElementById('btn-higher');
    const btnLower = document.getElementById('btn-lower');

    // Elementos de UI
    const img1 = document.getElementById('hl-img-1');
    const name1 = document.getElementById('hl-name-1');
    const val1 = document.getElementById('hl-val-1');
    
    const img2 = document.getElementById('hl-img-2');
    const name2 = document.getElementById('hl-name-2');
    
    const scoreDisplay = document.getElementById('hl-current-score');
    const finalScoreDisplay = document.getElementById('hl-final-score');

    let currentItem, nextItem, score = 0;

    // --- EVENT LISTENERS ---
    // Usamos onclick directo para asegurar compatibilidad móvil
    if(btnPlay) btnPlay.onclick = startGame;
    if(btnRetry) btnRetry.onclick = startGame;
    
    if(btnHigher) btnHigher.onclick = function() { checkGuess(true); };
    if(btnLower) btnLower.onclick = function() { checkGuess(false); };

    function startGame() {
        score = 0;
        updateScore();
        
        // Ocultar menús, mostrar juego
        menuLayer.classList.remove('active'); menuLayer.classList.add('hidden');
        endLayer.classList.remove('active'); endLayer.classList.add('hidden');
        gameLayer.classList.remove('hidden');

        // Primer item
        currentItem = data[Math.floor(Math.random() * data.length)];
        loadNextRound();
    }

    function loadNextRound() {
        // Elegir siguiente distinto al actual
        do {
            nextItem = data[Math.floor(Math.random() * data.length)];
        } while (nextItem.name === currentItem.name);

        // Renderizar Izquierda (Base)
        img1.src = currentItem.img;
        name1.innerText = currentItem.name;
        val1.innerText = currentItem.val.toLocaleString();

        // Renderizar Derecha (Incógnita)
        img2.src = nextItem.img;
        name2.innerText = nextItem.name;
    }

    function checkGuess(isHigher) {
        // Lógica de ganar/perder
        let correct = false;
        if (isHigher && nextItem.val >= currentItem.val) correct = true;
        if (!isHigher && nextItem.val <= currentItem.val) correct = true;

        if (correct) {
            score++;
            updateScore();
            alert(`¡CORRECTO!\n${nextItem.name} tiene ${nextItem.val.toLocaleString()}`);
            
            // Pasar el siguiente al actual
            currentItem = nextItem;
            loadNextRound();
        } else {
            alert(`FALLASTE.\n${nextItem.name} tenía ${nextItem.val.toLocaleString()}`);
            gameOver();
        }
    }

    function gameOver() {
        gameLayer.classList.add('hidden');
        endLayer.classList.remove('hidden'); endLayer.classList.add('active');
        finalScoreDisplay.innerText = score;
    }

    function updateScore() {
        if(scoreDisplay) scoreDisplay.innerText = score;
    }
}

// IMPORTANTE: Llamar a esta función cuando se desbloquee el contenido
// Busca en tu script donde tienes "unlockContent" y añade esta línea:
// initHigherLowerGame();
});