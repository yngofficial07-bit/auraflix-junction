// ==========================================
// 🛡️ THE QUANTUM BRIDGE: INVISIBLE LAYER NUKER
// ==========================================

(function() {
    console.log("⚡ INDIPLEX: Quantum Bridge Activated. Nuking invisible layers...");

    // 1. THE PHANTOM WINDOW (Popup Fake-Out)
    // Player ko lagega popup khul gaya, wo 'Play' unlock kar dega
    window.open = function() {
        console.log("🛡️ Bridge: Intercepted popup. Sending 'Success' to player.");
        return { closed: false, focus: () => {}, close: () => { this.closed = true; } };
    };

    // 2. THE LAYER NUKER (Billion IQ Move)
    // Ye function player ke upar ki har us cheez ko udayega jo click rok rahi hai
    const nukeInvisibleLayers = () => {
        const player = document.getElementById('main-player');
        if (!player) return;

        // Player ko physical priority do
        player.style.setProperty('z-index', '2147483647', 'important');
        player.style.setProperty('pointer-events', 'auto', 'important');
        player.style.setProperty('position', 'relative', 'important');

        // Sabhi divs ko scan karo jo player ke upar 'Fixed' ya 'Absolute' hain
        const allDivs = document.querySelectorAll('div, iframe, section, ins');
        allDivs.forEach(el => {
            if (el.id !== 'app' && el.id !== 'main-player' && !el.closest('#episode-grid')) {
                const style = window.getComputedStyle(el);
                const isOverlay = style.position === 'fixed' || style.position === 'absolute';
                const isHidden = style.opacity === '0' || style.backgroundColor === 'transparent' || style.visibility === 'hidden';
                
                // Agar wo element player ke upar hai aur invisible hai, toh wo pakka AD hai
                if (isOverlay && (parseInt(style.zIndex) > 100 || isHidden)) {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('pointer-events', 'none', 'important');
                    el.remove(); // Physically delete the ad-layer
                }
            }
        });
    };

    // Har 200ms mein deewar saaf karo
    setInterval(nukeInvisibleLayers, 200);
})();

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
            // 💎 EK NUMBER VISUALS: 3D Tilt & RGB Glow preserved
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
    } catch (e) { console.error("🚨 TMDB Error"); }
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
        player.removeAttribute('sandbox'); // Sandbox hataya taaki native speed mile
        player.src = urls[currentServer];
        
        // Signal Injection: Player ko keyboard command b bhejne ke liye focus rakho
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
