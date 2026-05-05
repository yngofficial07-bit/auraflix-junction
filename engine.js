// ==========================================
// 🛡️ OMNI-BYPASS: CLICK-THROUGH (NO SANDBOX)
// ==========================================

const bypassShield = () => {
    // 1. Ad-layers ko transparent aur click-through banao
    const selectors = 'div, iframe, ins, section, a';
    document.querySelectorAll(selectors).forEach(el => {
        const isSafe = el.id === 'app' || el.id === 'main-player' || 
                       el.closest('#episode-grid') || el.closest('.server-options') ||
                       el.classList.contains('rgb-glow');

        if (!isSafe) {
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed' || style.position === 'absolute' || parseInt(style.zIndex) > 1) {
                el.style.pointerEvents = 'none'; 
                el.style.opacity = '0'; 
            }
        }
    });

    // 2. Player settings (Removed Sandbox for full compatibility)
    const player = document.getElementById('main-player');
    if (player) {
        player.style.pointerEvents = 'auto';
        player.style.zIndex = '100';
    }
};

// POPUP LOCKER: Popup requests ko yahi neutralize karo
window.open = function() { 
    console.log("🚫 Popup Attempted & Blocked");
    return { closed: true, focus: () => {}, close: () => {} }; 
};

setInterval(bypassShield, 100);

// ==========================================
// 🎬 INDIPLEX CORE: NO FEATURES SKIPPED
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
        const data = await res.json();
        const grid = document.getElementById('episode-grid');
        if(!grid) return;
        
        grid.innerHTML = ''; 
        data.episodes.forEach(epi => {
            const card = document.createElement('div');
            card.className = 'episode-card tilt-effect rgb-glow'; // 💎 Animations Intact
            
            card.innerHTML = `
                ${(epi.episode_number === currentE) ? '<div class="playing-tag">PLAYING</div>' : ''}
                <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path}">
                <div class="epi-info">
                    <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                </div>`;
            
            card.onclick = (e) => {
                e.preventDefault();
                currentE = epi.episode_number;
                updatePlayer();
                loadEpisodes(currentS);
            };
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
    
    if (player) {
        player.src = urls[currentServer];
        // Focus player for Keyboard signals
        player.onload = () => { player.focus(); };
    }
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
