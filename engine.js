// ==========================================
// 🧠 THE NEURAL BYPASS: ZERO FRICTION
// ==========================================

(function() {
    console.log("⚡ INDIPLEX: Neural Bypass Engaged. Clearing the Synaptic Cleft...");

    // 1. THE STEALTH OPENER
    // Player ko lagega usne popup khola, par hum use "Invisible" kar denge
    const originalOpen = window.open;
    window.open = function(url, target, features) {
        console.log("🛡️ Intercepted Ad-Click to:", url);
        // Hum ek dummy object return karenge taaki player crash na ho
        return { 
            closed: false, 
            focus: () => {}, 
            close: () => { this.closed = true; },
            location: { href: url }
        };
    };

    // 2. SURGICAL LAYER NUKER (Mutation Observer)
    // Ye 'setInterval' se 10x fast aur "Smart" hai
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Check if it's an Element
                    const style = window.getComputedStyle(node);
                    const isFixed = style.position === 'fixed' || style.position === 'absolute';
                    
                    // Agar koi div player ke upar 'Fixed' hokar baitha hai, toh wo Virus hai
                    if (isFixed && node.id !== 'main-player' && !node.closest('#episode-grid')) {
                        node.style.setProperty('display', 'none', 'important');
                        node.style.setProperty('pointer-events', 'none', 'important');
                        node.remove(); 
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 3. POINTER-EVENT TUNNEL
    // Forcefully ensure player is clickable
    const fixPlayer = () => {
        const p = document.getElementById('main-player');
        if(p) {
            p.style.pointerEvents = 'auto';
            p.style.zIndex = '10';
        }
    };
    setInterval(fixPlayer, 500);
})();

// ==========================================
// 🎬 INDIPLEX CORE: ALL FEATURES INTACT
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

// Never skip animations or code elements
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
            // 💎 "Ek Number" Effects: 3D Hover/RGB strictly kept
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
    } catch (e) { console.error("🚨 Neural Link Error"); }
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
        // Ensure player is ready for interaction
        player.onload = () => { 
            player.focus(); 
            console.log("🎬 Video Stream Ready.");
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
