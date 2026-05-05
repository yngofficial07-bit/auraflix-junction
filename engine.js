// ==========================================
// 🛡️ OMNI-BYPASS: CLICK-THROUGH + SIPHON
// ==========================================

const bypassShield = () => {
    // 1. Sabhi possible ad-layers ko 'Click-Through' banao (Intact)
    const selectors = 'div, iframe, ins, section, a';
    document.querySelectorAll(selectors).forEach(el => {
        const isSafe = el.id === 'app' || 
                       el.id === 'main-player' || 
                       el.closest('#episode-grid') || 
                       el.closest('.server-options') ||
                       el.classList.contains('rgb-glow');

        if (!isSafe) {
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed' || style.position === 'absolute' || parseInt(style.zIndex) > 1) {
                el.style.pointerEvents = 'none'; 
                el.style.userSelect = 'none';
                el.style.opacity = '0'; 
            }
        }
    });

    // 2. EXTERNAL CONTROL BRIDGE (The Siphon)
    const player = document.getElementById('main-player');
    if (player) {
        player.style.pointerEvents = 'auto';
        player.style.zIndex = '100'; 
        
        // Anti-Popup Lock: Player ko bolenge ki wo popup na khole
        player.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin allow-presentation');
        
        // Faking User Activation: Kuch servers click mangte hain, hum fake signal bhejenge
        if (player.contentWindow) {
            player.contentWindow.userActivated = true;
        }
    }
};

// POPUP KILLER: Direct attack on popup generation
window.open = function() { 
    console.log("🛡️ Siphon: Popup request neutralized.");
    return { closed: true, focus: () => {}, close: () => {} }; 
};

setInterval(bypassShield, 100);

// ==========================================
// 🎬 INDIPLEX CORE: ALL FEATURES LOCKED
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
            // 💎 3D & RGB EFFECTS PRESERVED
            card.className = 'episode-card tilt-effect rgb-glow'; 
            
            card.innerHTML = `
                ${(epi.episode_number === currentE) ? '<div class="playing-tag">PLAYING</div>' : ''}
                <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path}">
                <div class="epi-info">
                    <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                </div>
            `;
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
        // Autocomplete focus for external controls
        player.focus();
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
