// ==========================================
// 🛡️ AURA-BRAVE GLASS SHIELD ENGINE
// ==========================================

const BLACKLISTED_DOMAINS = [
    '1xbet', 'oundhertobeconsist', 'muralssouth', 'polosanitizertrusting', 
    'iwmbuzz', 'marketdeath', 'propush', 'onclick', 'popads', 'popcash',
    'pop', 'xtra', 'click', 'double', 'adsystem', 'syndication', 'doubleclick'
];

// 1. DYNAMIC CSS INJECTOR (Shield & Animations ke liye)
const style = document.createElement('style');
style.textContent = `
    .glass-shield {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        z-index: 2000000;
        background: transparent;
        cursor: pointer;
    }
    #main-player {
        z-index: 10;
        position: relative;
    }
`;
document.head.appendChild(style);

// 2. THE GLASS SHIELD LOGIC
// Ye player par hone wale pehle 'khatarnak' click ko block karega
const applyGlassShield = () => {
    const playerContainer = document.querySelector('.video-container') || document.body;
    const existingShield = document.querySelector('.glass-shield');
    
    if (!existingShield) {
        const shield = document.createElement('div');
        shield.className = 'glass-shield';
        
        shield.addEventListener('click', (e) => {
            console.log("🛡️ Shield: First click intercepted & neutralized!");
            e.preventDefault();
            e.stopPropagation();
            shield.remove(); // Pehla click "kha" kar shield hat jayegi
        }, true);

        playerContainer.style.position = 'relative';
        playerContainer.appendChild(shield);
    }
};

// 3. MUTATION OBSERVER (Ads aate hi unhe "mote" marna)
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
                const source = node.src || node.href || node.id || node.className || '';
                const isAd = BLACKLISTED_DOMAINS.some(d => source.toLowerCase().includes(d));
                
                // Agar koi bada div player ke upar aa raha hai
                const style = window.getComputedStyle(node);
                const isOverlay = (style.position === 'absolute' || style.position === 'fixed') && parseInt(style.zIndex) > 100;

                if (isAd || (isOverlay && node.id !== 'app' && node.id !== 'main-player')) {
                    node.remove();
                    console.log("🛡️ Shield: Auto-removed ad element");
                }
            }
        });
    });
});

observer.observe(document.body, { childList: true, subtree: true });

// 4. BRAVE-STYLE POP-UP KILLER
window.open = function() { return null; };

// Har 500ms mein shield check karo
setInterval(applyGlassShield, 500);

// ==========================================
// 🎬 TMDB & SERVER LOGIC (INDIPLEX Core)
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; // Stranger Things

let currentS = 1;
let currentE = 1;
let currentServer = 'vidsrc';

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
        const data = await response.json();
        const grid = document.getElementById('episode-grid');
        grid.innerHTML = ''; 

        data.episodes.forEach(epi => {
            const card = document.createElement('div');
            // Keep 3D/RGB Animations intact
            card.className = 'episode-card tilt-effect rgb-glow'; 
            const playingBadge = (epi.episode_number === currentE) ? '<div class="playing-tag">PLAYING</div>' : '';
            
            card.innerHTML = `
                ${playingBadge}
                <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path}">
                <div class="epi-info">
                    <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                    <div class="epi-meta">${epi.runtime || '--'} min</div>
                </div>
            `;
            
            card.onclick = () => {
                currentE = epi.episode_number;
                updatePlayer();
                loadEpisodes(currentS); 
                applyGlassShield(); // Har naye episode par shield wapas lagao
            };
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading episodes:", err);
    }
}

function updatePlayer() {
    const player = document.getElementById('main-player');
    const urls = {
        vidsrc: `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&season=${currentS}&episode=${currentE}`,
        vidlink: `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}`,
        moviesapi: `https://moviesapi.club/tv/${TMDB_ID}-${currentS}-${currentE}`
    };
    if (player) player.src = urls[currentServer];
}

function switchServer(s) { 
    currentServer = s; 
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.toLowerCase().includes(s)) btn.classList.add('active');
    });
    updatePlayer(); 
    applyGlassShield(); // Server change par bhi shield lagao
}

// Start the engine
loadEpisodes(1);
updatePlayer();
