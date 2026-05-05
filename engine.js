// ==========================================
// 🛡️ THE BLACK HOLE: ANTI-AD ARCHITECTURE
// ==========================================

(function() {
    // 1. NETWORK LEVEL BLOCKING (Request Interception)
    const AD_SHARK = [/oundhertobeconsist/i, /frs2c/i, /wiestunvote/i, /v2006/i, /proads/i, /onclick/i];
    
    const originalFetch = window.fetch;
    window.fetch = function(url, ...args) {
        if (typeof url === 'string' && AD_SHARK.some(p => p.test(url))) {
            return Promise.reject(new Error('Blocked by INDIPLEX Shield'));
        }
        return originalFetch(url, ...args);
    };

    // 2. PREVENT DYNAMIC SCRIPT INJECTION (The Root Cause)
    const originalAppendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function(el) {
        if (el.tagName === 'SCRIPT' || el.tagName === 'IFRAME') {
            const src = el.src || '';
            if (AD_SHARK.some(p => p.test(src))) {
                console.log("🚫 Intercepted Ad Injection:", src);
                return el; // Return without adding to DOM
            }
        }
        return originalAppendChild.apply(this, arguments);
    };

    // 3. GLOBAL POPUP EXTINCTION
    window.open = () => null;
    window.alert = () => null; // Some ads use annoying alerts
})();

// ==========================================
// 🎬 INDIPLEX CORE: EVERYTHING PRESERVED
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
            // 'Ek Number' Effects Intact: 3D Hover & RGB
            card.className = 'episode-card tilt-effect rgb-glow'; 
            
            card.innerHTML = `
                ${(epi.episode_number === currentE) ? '<div class="playing-tag">PLAYING</div>' : ''}
                <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path}">
                <div class="epi-info">
                    <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                </div>
            `;
            card.onclick = () => { currentE = epi.episode_number; updatePlayer(); loadEpisodes(currentS); };
            grid.appendChild(card);
        });
    } catch (e) { console.error("TMDB Load Error"); }
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

// 4. CLEAN-UP OBSERVER (Removing leftovers)
const cleanUp = () => {
    document.querySelectorAll('iframe:not(#main-player), .ad-container, [class*="pop"]').forEach(el => el.remove());
};
setInterval(cleanUp, 1000);

document.addEventListener('DOMContentLoaded', () => {
    loadEpisodes(1);
    updatePlayer();
});
