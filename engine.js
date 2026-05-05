// ==============================================================================
// 🛡️ THE PHANTASM BYPASS: THE ULTIMATE AD-TRAP BREAKER
// ==============================================================================

(function() {
    console.log("⚡ INDIPLEX: Phantasm Mode Engaged. Breaking Ad-Trap...");

    // 1. THE GHOST WINDOW (Billion IQ Fake-Out)
    // Hum window.open ko ek aise 'Proxy' se replace karenge jo 
    // Player ko hamesha "Success" ka signal bhejega.
    const windowHandler = {
        get: function(target, prop) {
            if (prop === 'closed') return false; // Player ko lagega window abhi bhi khuli hai
            return function() { return true; }; // Saare functions (focus/blur) ko success dikhao
        }
    };

    const fakeWindow = new Proxy({}, windowHandler);

    window.open = function() {
        console.log("🛡️ Phantasm: Intercepted ad-click. Sending fake 'Success' signal to player.");
        return fakeWindow; // Player ko lagega popup khul gaya, wo video chalayega
    };

    // 2. THE CLICK-THROUGH TUNNEL
    // Ye code ensure karega ki player ke upar koi bhi invisible ad-layer na rahe
    const clearPath = () => {
        const player = document.getElementById('main-player');
        if (!player) return;

        // Player ko sabse upar laao
        player.style.setProperty('z-index', '2147483647', 'important');
        player.style.setProperty('pointer-events', 'auto', 'important');

        // Baaki sab fixed kachra uda do jo click rok raha hai
        document.querySelectorAll('div, iframe, section').forEach(el => {
            if (el.id !== 'app' && el.id !== 'main-player' && !el.closest('#episode-grid')) {
                const s = window.getComputedStyle(el);
                if ((s.position === 'fixed' || s.position === 'absolute') && parseInt(s.zIndex) > 100) {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('pointer-events', 'none', 'important');
                }
            }
        });
    };

    setInterval(clearPath, 300);
})();

// ==============================================================================
// 🎬 INDIPLEX CORE: ZERO SKIPS (ALL FEATURES & ANIMATIONS)
// ==============================================================================

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
            
            // 💎 THE "EK NUMBER" STUFF: 3D Hover & RGB Glow intact
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
    } catch (e) { console.error("🚨 TMDB Loading Failed"); }
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
        // NO SANDBOX (Player khushi-khushi load hoga)
        player.removeAttribute('sandbox'); 
        player.src = urls[currentServer];
        
        // Auto-Focus for Immediate Keyboard Control
        player.onload = () => {
            setTimeout(() => { player.focus(); }, 1000);
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
