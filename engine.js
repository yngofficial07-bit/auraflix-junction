// ==========================================
// 🛡️ AURA-BRAVE ULTIMATE SHIELD ENGINE
// ==========================================

const BLACKLISTED_DOMAINS = [
    '1xbet', 'oundhertobeconsist', 'muralssouth', 'polosanitizertrusting', 
    'iwmbuzz', 'marketdeath', 'propush', 'onclick', 'popads', 'popcash',
    'pop', 'xtra', 'click', 'double', 'adsystem', 'syndication', 'doubleclick'
];

// 1. THE ULTIMATE PRIORITY SHIELD (Player ko King banata hai)
const prioritizePlayer = () => {
    const player = document.getElementById('main-player');
    if (player) {
        player.style.zIndex = "999999"; 
        player.style.position = "relative";
        player.style.pointerEvents = "auto"; 
    }

    // Baaki high z-index layers ko niche dhakelo
    document.querySelectorAll('div, ins, iframe').forEach(el => {
        if (el.id !== 'main-player' && !el.contains(player)) {
            const style = window.getComputedStyle(el);
            if (parseInt(style.zIndex) > 1000) {
                el.style.zIndex = "1";
                el.style.display = "none"; 
            }
        }
    });
};

// 2. NUCLEAR CLICK PROTECTOR (Ghost Layers ko turant uda deta hai)
document.addEventListener('click', (e) => {
    const player = document.getElementById('main-player');
    if (player && !player.contains(e.target) && e.target.tagName !== 'BUTTON') {
        const style = window.getComputedStyle(e.target);
        if (style.position === 'absolute' || style.position === 'fixed') {
            console.log("🛡️ Shield: Invisible Ad Layer Neutralized!");
            e.preventDefault();
            e.stopPropagation();
            e.target.remove(); 
        }
    }
}, true);

// 3. BRAVE-STYLE POP-UP & NETWORK BLOCKER
window.open = function() { return null; };

const killAds = () => {
    document.querySelectorAll('iframe, script, a').forEach(el => {
        if (el.id === 'main-player') return;
        const src = el.src || el.href || '';
        if (BLACKLISTED_DOMAINS.some(d => src.toLowerCase().includes(d))) {
            el.remove();
        }
    });
};

// Har 300ms mein scan check
setInterval(() => {
    prioritizePlayer();
    killAds();
}, 300);

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
            // 3D Hover & RGB Animations Intact
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
        console.error("TMDB Load Error:", err);
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
}

// Start the Engine
loadEpisodes(1);
updatePlayer();
