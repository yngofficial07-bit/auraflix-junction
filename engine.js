// ==========================================
// 🛡️ THE BIOS OVERRIDE: CLICK TUNNELING
// ==========================================

(function() {
    console.log("⚡ INDIPLEX: BIOS Override Active. Forcing Action Potential...");

    // 1. THE AD-SIMULATOR (Billion IQ Move)
    // Player ko lagega ki ad chal gaya, isliye wo video unlock kar dega
    const ghostWindow = {
        closed: false,
        focus: function() {},
        close: function() { this.closed = true; },
        location: { href: "" }
    };

    window.open = function() {
        console.log("🛡️ Override: Feeding fake click-success to player.");
        return ghostWindow; 
    };

    // 2. POINTER EVENT RECOVERY (High Frequency)
    // Har 50ms mein player ki clickable state ko "Reset" karega
    const forceInteraction = () => {
        const player = document.getElementById('main-player');
        if (!player) return;

        // Forcefully enable interaction on the iframe itself
        player.style.setProperty('pointer-events', 'auto', 'important');
        player.style.setProperty('user-select', 'none', 'important');
        player.setAttribute('tabindex', '0'); // For keyboard focus

        // Nuke any div that tries to sit on top of the player
        const bodyChildren = document.body.children;
        for (let i = 0; i < bodyChildren.length; i++) {
            const el = bodyChildren[i];
            if (el.id !== 'app' && el.id !== 'main-player' && !el.closest('#episode-grid')) {
                const z = window.getComputedStyle(el).zIndex;
                if (parseInt(z) > 5 || el.style.position === 'fixed') {
                    el.style.display = 'none';
                    el.style.pointerEvents = 'none';
                }
            }
        }
    };

    // Surgical speed (Physics style: High Frequency = Low Friction)
    setInterval(forceInteraction, 50);

})();

// ==========================================
// 🎬 INDIPLEX CORE: THE ABYSSAL VOID (100% FEATURES)
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
            // 💎 EK NUMBER: 3D Tilt & RGB Glow are NEVER removed
            card.className = 'episode-card tilt-effect rgb-glow'; 
            
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
    } catch (e) { console.error("🚨 BIOS: Interface Error"); }
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
        // Clear sandbox but keep essential permissions
        player.removeAttribute('sandbox'); 
        player.src = urls[currentServer];
        
        player.onload = () => {
            console.log("🎬 Stream Unlocked.");
            player.focus();
        };
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
