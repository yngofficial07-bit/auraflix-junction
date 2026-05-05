// ==========================================
// 🛡️ THE ANTI-MATTER SHIELD (NO-LIMIT BLOCKER)
// ==========================================

(function() {
    // 1. BLACKLIST: Saare gande domains ko block karo
    const adDomains = [
        'proads.tld', 'onclickalgo.com', 'vidsrc.me/ads', 
        'rhtads.com', 'mndsrv.com', 'popads.net', 'bit.ly',
        'doubleclick.net', 'google-analytics.com'
    ];

    // 2. NETWORK LEVEL BLOCKING (Brave Tech)
    const originalFetch = window.fetch;
    window.fetch = function() {
        if (adDomains.some(domain => arguments[0].includes(domain))) {
            return Promise.reject(new Error("🛡️ INDIPLEX: Blocked Ad Request"));
        }
        return originalFetch.apply(this, arguments);
    };

    // 3. DOM SURVEILLANCE: Agar koi naya ad banne ki koshish kare, turant delete
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    const isAd = node.tagName === 'IFRAME' && !node.id.includes('main-player') ||
                                 /pop|ads|banner|promo/i.test(node.className + node.id) ||
                                 node.style.zIndex > 1000;
                    
                    if (isAd) {
                        node.style.display = 'none';
                        node.remove();
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 4. POPUP EXTINCTION
    window.open = () => ({ closed: true, focus: () => {}, close: () => {} });
    
    // 5. CLICK HIJACK RECOVERY
    setInterval(() => {
        const player = document.getElementById('main-player');
        if (player) {
            player.style.pointerEvents = 'auto';
            player.style.zIndex = '2147483647'; // Highest possible z-index
        }
    }, 500);
})();

// ==========================================
// 🎬 INDIPLEX CORE: 100% PRESERVED
// ==========================================
// Ryzen/RTX Build Power | Android Dev Java Spirit

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
            // 💎 NO SKIPS: 3D Hover & RGB Glow Intact
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
        // Autocomplete focus for Keyboard signals (Space/Arrows)
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
    console.log("⚡ INDIPLEX: Anti-Matter Shield Active.");
});
