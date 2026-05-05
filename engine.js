// 1. BLACKLISTED DOMAINS
const BLACKLISTED_DOMAINS = [
    '1xbet', 'oundhertobeconsist', 'muralssouth', 'polosanitizertrusting', 
    'iwmbuzz', 'marketdeath', 'propush', 'onclick', 'popads', 'popcash', 'syndication'
];

// 2. AURA CLICK-RADAR (Sabse Powerful)
// Ye har us invisible layer ko detect karega jo click rok rahi hai
document.addEventListener('mousedown', (e) => {
    const target = e.target;
    const player = document.getElementById('main-player');

    // Agar click player par nahi hai, par layer poori screen cover kar rahi hai
    if (target !== player && (target.offsetWidth >= window.innerWidth * 0.5)) {
        console.log("🛡️ Shield: Blocking Ghost Layer detected!");
        
        // Trick: Click ko layer ke "aar-paar" jaane do (Pointer Events None)
        target.style.pointerEvents = 'none'; 
        
        // Aur us layer ko uda do
        setTimeout(() => {
            if (target && target.parentNode) target.remove();
        }, 100);
    }
}, true);

// 3. THE ELEMENT KILLER
const killAds = () => {
    document.querySelectorAll('iframe, script, a, div').forEach(el => {
        if (el.id === 'main-player') return;
        const source = el.src || el.href || el.id || el.className || '';
        if (BLACKLISTED_DOMAINS.some(domain => source.toLowerCase().includes(domain))) {
            el.remove();
        }
    });
};

// 4. SMART OVERLAY REMOVER
const removeOverlays = () => {
    const children = document.body.children;
    for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (el.id === 'app' || el.id === 'main-player' || el.contains(document.getElementById('main-player'))) continue;

        const style = window.getComputedStyle(el);
        if (style.position === 'absolute' || style.position === 'fixed') {
            if (parseInt(style.zIndex) > 10) {
                el.remove();
            }
        }
    }
};

// Brave Style Pop-up Blocker
window.open = function() { return null; };

// Har 400ms mein scan
setInterval(() => {
    killAds();
    removeOverlays();
}, 400);

// ==========================================
// 🎬 TMDB & SERVER LOGIC (NEET Aspirant's Core)
// ==========================================
const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
        const data = await response.json();
        const grid = document.getElementById('episode-grid');
        grid.innerHTML = ''; 

        data.episodes.forEach(epi => {
            const card = document.createElement('div');
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
    } catch(e) { console.log("TMDB Error"); }
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

loadEpisodes(1);
updatePlayer();
