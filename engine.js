// ==========================================
// 🧠 THE GHOST-TOUCH PROTOCOL: AD-LAYER BYPASS
// ==========================================

(function() {
    console.log("⚡ INDIPLEX: Ghost-Touch Protocol Active.");

    // 1. THE AD-FEEDER (Seducing the Player)
    // Hum window.open ko hijack karke player ko wo "Stimulus" denge jo use chahiye
    const ghostWindow = {
        closed: false,
        focus: () => {},
        close: function() { this.closed = true; },
        location: { href: "" }
    };

    window.open = function(url) {
        console.log("🛡️ Ghost-Touch: Intercepted ad-request. Feeding fake success.");
        // Player ko lagega ad khul gaya, isliye wo play-lock hata dega
        return ghostWindow; 
    };

    // 2. THE CLICK TUNNEL (The "Billion IQ" Part)
    // Hum player ke upar ek invisible "Shield" rakhenge
    const setupShield = () => {
        const playerContainer = document.querySelector('.player-container'); // Tera container class
        if (!playerContainer || document.getElementById('click-shield')) return;

        const shield = document.createElement('div');
        shield.id = 'click-shield';
        shield.style = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            z-index: 2147483647; cursor: pointer; background: transparent;
        `;

        // Jab user is shield par click karega...
        shield.onclick = function(e) {
            console.log("🎯 Shield: Tunneling click to player core...");
            
            // Step A: Fake the popup signal
            window.open("about:blank");

            // Step B: Temporarily disable the shield to let the real click hit the video
            shield.style.pointerEvents = 'none';
            
            // Step C: Automatically bring the shield back after 500ms to block the next ad
            setTimeout(() => {
                shield.style.pointerEvents = 'auto';
            }, 500);
        };

        playerContainer.appendChild(shield);
    };

    setInterval(setupShield, 1000);

    // 3. AGGRESSIVE SCRIPT PURGE
    const nukeAds = () => {
        const badSelectors = ['iframe[src*="ads"]', 'div[class*="ad-"]', 'div[id*="ad-"]', '.pop-under', '.overlay-ads'];
        badSelectors.forEach(s => {
            document.querySelectorAll(s).forEach(el => el.remove());
        });
    };
    setInterval(nukeAds, 500);
})();

// ==========================================
// 🎬 INDIPLEX CORE: THE ABYSSAL VOID (NO SKIPS)
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
            // 💎 "Ek Number" Swag: 3D Tilt & RGB Glow strictly intact
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
    } catch (e) { console.error("🚨 Neural Error"); }
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
        player.removeAttribute('sandbox'); // Removed for native interaction
        player.src = urls[currentServer];
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
