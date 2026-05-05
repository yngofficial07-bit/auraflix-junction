// ==========================================
// 🛡️ THE IMMUNE SYSTEM: UNIVERSAL AD-PURGE
// ==========================================

(function() {
    console.log("⚡ INDIPLEX: Immune System Active. Nuke-all protocol engaged.");

    // 1. NETWORK FILTER (Blocking the source)
    const adKeywords = ['proads', 'onclick', 'rhtads', 'mndsrv', 'popads', 'bit.ly', 'doubleclick'];
    
    const originalFetch = window.fetch;
    window.fetch = function() {
        if (adKeywords.some(keyword => arguments[0].includes(keyword))) {
            return Promise.reject(new Error("🛡️ Immune System: Ad Source Blocked"));
        }
        return originalFetch.apply(this, arguments);
    };

    // 2. THE SCRIPT PURGER (Deep Scan)
    const purgeScripts = () => {
        document.querySelectorAll('script').forEach(s => {
            // Agar script ka source suspicious hai, toh use udao
            if (s.src && adKeywords.some(kw => s.src.includes(kw))) {
                s.remove();
            }
        });
    };

    // 3. AGGRESSIVE LAYER NUKER (Refined)
    const layerNuker = () => {
        const player = document.getElementById('main-player');
        if (!player) return;

        // Player ko priority 1 par rakho
        player.style.setProperty('z-index', '2147483647', 'important');
        player.style.setProperty('pointer-events', 'auto', 'important');

        const elements = document.querySelectorAll('body > div, body > iframe');
        elements.forEach(el => {
            if (el.id !== 'app' && el.id !== 'main-player') {
                const z = window.getComputedStyle(el).zIndex;
                // Agar kuch bhi player ke upar aane ki koshish kare, udao
                if (parseInt(z) > 100 || el.style.position === 'fixed') {
                    el.style.display = 'none';
                    el.remove();
                }
            }
        });
    };

    // Har 100ms mein scan (Quantum Speed)
    setInterval(() => {
        layerNuker();
        purgeScripts();
    }, 100);

    // 4. POPUP VIRTUALIZATION
    window.open = () => ({ closed: false, focus: () => {}, close: () => {} });
})();

// ==========================================
// 🎬 INDIPLEX CORE: ABYSSAL VOID (NO SKIPS)
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
            // 💎 PRESERVING: 3D Hover & RGB Glow
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
        player.src = urls[currentServer];
        // Focus player for direct signals
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
