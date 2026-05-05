// ==========================================
// 🌌 INDIPLEX: THE PHANTOM PROTOCOL (V4)
// ==========================================

// 1. GHOST MODE: Har layer ko transparency dena
const applyGhostMode = () => {
    // Sabhi DIVs ko check karo
    document.querySelectorAll('div, section, ins, span').forEach(el => {
        // Hamare main elements ko chhod kar...
        if (el.id === 'app' || el.id === 'main-player' || el.closest('#episode-grid') || el.closest('.server-options')) {
            el.style.pointerEvents = 'auto'; // Inpar click hona chahiye
            return;
        }

        // Agar koi element fixed hai aur player ke upar hai, toh use "Hawa" bana do
        const s = window.getComputedStyle(el);
        if (s.position === 'fixed' || s.position === 'absolute') {
            el.style.pointerEvents = 'none'; // Click iske aar-paar nikal jayega
            el.style.background = 'transparent';
            el.style.zIndex = '-1'; // Isse peeche bhej do
        }
    });
};

// 2. THE CLICK-THROUGH TUNNEL
// Ye script har 500ms mein ensure karegi ki player hamesha accessible rahe
setInterval(applyGhostMode, 500);

// 3. AGGRESSIVE DOMAIN SINKHOLE
const SINKHOLE = ['oundhertobeconsist', 'frs2c', 'v2006', 'wiestunvote', 'casino', '1xbet'];
const destroyViruses = () => {
    document.querySelectorAll('iframe, script').forEach(el => {
        if (el.id === 'main-player') return;
        const src = el.src.toLowerCase();
        if (SINKHOLE.some(d => src.includes(d))) {
            el.remove();
        }
    });
};
setInterval(destroyViruses, 1000);

// ==========================================
// 🎬 INDIPLEX CORE: NO FEATURES SKIPPED
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 

let currentS = 1;
let currentE = 1;
let currentServer = 'vidsrc';

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
        const data = await res.json();
        const grid = document.getElementById('episode-grid');
        grid.innerHTML = ''; 

        data.episodes.forEach(epi => {
            const card = document.createElement('div');
            card.className = 'episode-card tilt-effect rgb-glow'; // 3D & RGB Intact
            const badge = (epi.episode_number === currentE) ? '<div class="playing-tag">PLAYING</div>' : '';
            
            card.innerHTML = `
                ${badge}
                <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path}">
                <div class="epi-info">
                    <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                    <div class="epi-meta">${epi.runtime || '--'} min</div>
                </div>
            `;
            card.onclick = () => { currentE = epi.episode_number; updatePlayer(); loadEpisodes(currentS); };
            grid.appendChild(card);
        });
    } catch (e) { console.error("TMDB Error"); }
}

function updatePlayer() {
    const player = document.getElementById('main-player');
    const urls = {
        vidsrc: `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&season=${currentS}&episode=${currentE}`,
        vidlink: `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}`,
        moviesapi: `https://moviesapi.club/tv/${TMDB_ID}-${currentS}-${currentE}`,
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

// Initial Launch
document.addEventListener('DOMContentLoaded', () => {
    loadEpisodes(1);
    updatePlayer();
    console.log("⚡ PHANTOM PROTOCOL ACTIVE: Click-through enabled.");
});
