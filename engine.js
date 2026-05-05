// ==========================================
// 🛡️ INDIPLEX: NEURAL LINK BYPASS (V6)
// ==========================================

// 1. CREATE ISOLATED CONTROL PANEL (Ads can't touch this)
const createNeuralController = () => {
    const panel = document.createElement('div');
    panel.id = 'neural-panel';
    panel.style = `
        position: fixed; right: 20px; top: 50%; transform: translateY(-50%);
        width: 60px; background: rgba(0,0,0,0.9); border: 2px solid #00f7ff;
        border-radius: 30px; display: flex; flex-direction: column;
        align-items: center; gap: 20px; padding: 20px 0; z-index: 9999999;
        box-shadow: 0 0 20px #00f7ff;
    `;
    
    // Play/Pause Bypass (Direct Iframe Messaging)
    panel.innerHTML = `
        <div onclick="window.location.reload()" style="cursor:pointer; color:white; font-size:12px;">REFRESH</div>
        <div id="btn-vidsrc" class="neural-btn active" onclick="switchServer('vidsrc')">S1</div>
        <div id="btn-vidlink" class="neural-btn" onclick="switchServer('vidlink')">S2</div>
        <div id="btn-videasy" class="neural-btn" onclick="switchServer('videasy')">S3</div>
    `;
    document.body.appendChild(panel);
};

// 2. THE "CLEAN-SWEEP" SANDBOX
const aggressiveSanitize = () => {
    // Sirf hamare elements ko zinda rakho, baaki sabko "Pointer-Disabled" kar do
    const safeIDs = ['neural-panel', 'main-player', 'app', 'episode-grid'];
    
    document.querySelectorAll('*').forEach(el => {
        const isSafe = safeIDs.some(id => el.id === id || el.closest('#' + id));
        
        if (!isSafe) {
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed' || style.zIndex > 100) {
                el.style.pointerEvents = 'none'; // Click-through enabled
                el.style.opacity = '0'; // Invisible but present (prevents crash)
            }
        }
    });
};

setInterval(aggressiveSanitize, 500);

// ==========================================
// 🎬 INDIPLEX CORE: EVERYTHING PRESERVED
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
        card.className = 'episode-card tilt-effect rgb-glow'; // 3D/RGB Intact
        card.innerHTML = `
            ${(epi.episode_number === currentE) ? '<div class="playing-tag">PLAYING</div>' : ''}
            <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path}">
            <div class="epi-info"><div class="epi-title">E${epi.episode_number}</div></div>`;
        
        card.onclick = (e) => {
            e.stopPropagation();
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
    document.querySelectorAll('.neural-btn').forEach(b => b.classList.toggle('active', b.id.includes(s)));
    updatePlayer(); 
}

document.addEventListener('DOMContentLoaded', () => {
    createNeuralController();
    loadEpisodes(1);
    updatePlayer();
    console.log("⚡ Neural Link Active: High-Z Control Panel Deployed.");
});
