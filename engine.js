// ==========================================
// 🛡️ AURA-BRAVE STEALTH ENGINE (ANTI-POPUP)
// ==========================================

const BLACKLISTED_DOMAINS = [
    '1xbet', 'oundhertobeconsist', 'muralssouth', 'polosanitizertrusting', 
    'iwmbuzz', 'marketdeath', 'propush', 'onclick', 'popads', 'popcash',
    'v2006', 'painamour', 'twasmeerelyhers', 'wiestunvote', 'raklls', 'syndication',
    'adservice', 'doubleclick', 'adnxs', 'trclmp', 'highperformancegate'
];

// 1. DYNAMIC Z-INDEX NEUTRALIZER
// Ye kisi bhi cheez ko player ke upar 'fixed' ya 'absolute' baithne nahi dega
const purgeAdLayers = () => {
    const player = document.getElementById('main-player');
    const app = document.getElementById('app');
    
    document.querySelectorAll('div, iframe, ins, section, a').forEach(el => {
        // Player, App aur Episode Grid ko mat chhedo
        if (el === player || (app && app.contains(el)) || el.id === 'main-player') return;

        const style = window.getComputedStyle(el);
        const isFixed = style.position === 'fixed' || style.position === 'absolute';
        
        // Agar koi element bahut high z-index par hai ya screen cover kar raha hai
        if (isFixed && (parseInt(style.zIndex) > 5 || el.offsetWidth >= window.innerWidth * 0.9)) {
            console.log("🛡️ Shield: Purged invisible ad overlay");
            el.remove();
        }
    });
};

// 2. AGGRESSIVE POPUP KILLER (Overwrites window.open)
window.open = function() { 
    console.log("🚫 Aura Shield: Blocked an attempted Popup/Redirect");
    return null; 
};

// 3. MUTATION OBSERVER (Real-time safai)
const observer = new MutationObserver(() => {
    purgeAdLayers();
    document.querySelectorAll('script, iframe').forEach(el => {
        if (el.id === 'main-player') return;
        const src = el.src || '';
        if (BLACKLISTED_DOMAINS.some(d => src.toLowerCase().includes(d))) {
            el.remove();
        }
    });
});
observer.observe(document.body, { childList: true, subtree: true });

// Har 500ms par ek backup scan
setInterval(purgeAdLayers, 500);

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
            // 3D Hover & RGB Effects
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
            };
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("TMDB Load Error");
    }
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
    }
}

function switchServer(s) { 
    currentServer = s; 
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.toLowerCase().includes(s)) btn.classList.add('active');
    });
    updatePlayer(); 
}

// Start the Engine
loadEpisodes(1);
updatePlayer();
