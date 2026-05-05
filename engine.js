// ==========================================
// 🛡️ INDIPLEX: THE VIRTUAL BYPASS (V9)
// ==========================================

(function() {
    // 1. FAKE POPUP SIGNAL (The Master Key)
    // Hum window.open ko modify karenge taaki wo "Success" return kare par khule kuch nahi
    const originalOpen = window.open;
    window.open = function(url, target, features) {
        console.log("🛡️ Hijacked Popup Request to:", url);
        
        // Hum ek fake window object return karenge 
        // Taaki unka script crash na ho aur samjhe ki popup khul gaya
        return {
            closed: true,
            focus: function() {},
            blur: function() {},
            close: function() {}
        };
    };

    // 2. RE-ENABLE POINTER EVENTS (Hard Reset)
    // Player ke upar ki har cheez ko "Ghost" banao
    const forceClick = () => {
        const player = document.getElementById('main-player');
        if (player) {
            player.style.pointerEvents = 'auto';
            player.style.zIndex = '9999';
        }

        // Saari invisible layers ko disable karo jo click rok rahi hain
        document.querySelectorAll('div').forEach(div => {
            const style = window.getComputedStyle(div);
            if (style.position === 'fixed' && !div.id.includes('app')) {
                div.style.pointerEvents = 'none';
                div.style.zIndex = '-1';
            }
        });
    };
    setInterval(forceClick, 500);
})();

// ==========================================
// 🎬 INDIPLEX CORE (Preserving Everything)
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
    const data = await res.json();
    const grid = document.getElementById('episode-grid');
    if(!grid) return;
    
    grid.innerHTML = ''; 
    data.episodes.forEach(epi => {
        const card = document.createElement('div');
        card.className = 'episode-card tilt-effect rgb-glow'; // 3D/RGB Effects Intact
        card.innerHTML = `
            ${(epi.episode_number === currentE) ? '<div class="playing-tag">PLAYING</div>' : ''}
            <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path}">
            <div class="epi-info"><div class="epi-title">E${epi.episode_number}</div></div>`;
        
        card.onclick = () => {
            currentE = epi.episode_number;
            updatePlayer();
            loadEpisodes(currentS);
        };
        grid.appendChild(card);
    });
}

function updatePlayer() {
    const player = document.getElementById('main-player');
    const urls = {
        vidsrc: `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&season=${currentS}&episode=${currentE}`,
        vidlink: `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}`,
        videasy: `https://player.vidsrc.nl/embed/tv/${TMDB_ID}/${currentS}/${currentE}`
    };
    if (player) player.src = urls[currentServer];
}

function switchServer(s) { 
    currentServer = s; 
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase().includes(s));
    });
    updatePlayer(); 
}

document.addEventListener('DOMContentLoaded', () => {
    loadEpisodes(1);
    updatePlayer();
});
