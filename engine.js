// ==============================================================================
// 💀 KERNEL BYPASS: UNCHAINED MODE (NO SANDBOX)
// ==============================================================================

(function() {
    console.log("⚡ INDIPLEX: Unchained Mode Active. Sandbox removed.");

    // 1. THE PHANTOM WINDOW (Top-Level Popup Block)
    const originalOpen = window.open;
    window.open = new Proxy(originalOpen, {
        apply: function(target, thisArg, argumentsList) {
            console.log("🛡️ Neutralized Top-Level Popup ->", argumentsList[0]);
            return {
                closed: false,
                focus: function() {},
                blur: function() {},
                close: function() { this.closed = true; },
                postMessage: function() {}
            };
        }
    });

    // 2. DOM SURVEILLANCE (Nuking overlapping ad layers on our page)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tag = node.tagName.toLowerCase();
                    const zIndex = window.getComputedStyle(node).zIndex;
                    
                    if ((tag === 'div' || tag === 'iframe') && zIndex > 1000 && node.id !== 'main-player') {
                        node.style.setProperty('display', 'none', 'important');
                        node.style.setProperty('pointer-events', 'none', 'important');
                        node.remove();
                    }
                }
            });
        });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // 3. FAKE ANTI-ADBLOCK SIGNALS
    window.adblocker = false;
    window.isAdBlockActive = false;
})();

// ==============================================================================
// 🎬 INDIPLEX CORE: 100% VISUALS & FEATURES (ZERO SKIPS)
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
            
            // 💎 ALL ANIMATIONS PRESERVED (Tilt & RGB)
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
    } catch (e) { console.error("🚨 TMDB Core Error"); }
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
        // ❌ NO SANDBOX: Let the player load natively so it doesn't throw errors
        player.removeAttribute('sandbox'); 
        player.src = urls[currentServer];
        
        // Auto-Focus for Keyboard Control
        player.onload = () => {
            setTimeout(() => { player.focus(); }, 800);
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

// ⚡ FORCE FOCUS LOOP (The Keyboard Bypass)
setInterval(() => {
    const player = document.getElementById('main-player');
    if(player && document.activeElement !== player) {
        player.focus();
    }
}, 2000);
