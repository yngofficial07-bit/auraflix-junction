// 1. BRAVE-STYLE DOMAIN FILTER
const BLACKLISTED_DOMAINS = [
    '1xbet', 'oundhertobeconsist', 'muralssouth', 'polosanitizertrusting', 
    'iwmbuzz', 'marketdeath', 'propush', 'onclick', 'popads', 'popcash'
];

// 2. NETWORK INTERCEPTOR
const killAds = () => {
    const allLinks = document.querySelectorAll('a, iframe, script');
    allLinks.forEach(el => {
        const url = el.src || el.href || '';
        const foundDomain = BLACKLISTED_DOMAINS.find(d => url.includes(d));
        if (foundDomain) {
            console.log(`🛡️ Aura Shield: Blocked ${foundDomain}`);
            el.remove();
        }
    });
};

// 3. THE "GHOST" LAYER KILLER (REPLACED VERSION)
const removeOverlays = () => {
    const children = document.body.children;
    for (let i = 0; i < children.length; i++) {
        const el = children[i];
        
        // App aur Player ko safe rakho
        if (el.id === 'app' || el.id === 'main-player' || el.contains(document.getElementById('main-player'))) {
            continue;
        }

        const style = window.getComputedStyle(el);
        if (style.position === 'absolute' || style.position === 'fixed') {
            // Sirf bade invisible layers ko hatao jo click rok rahe hain
            const isFullWidth = el.offsetWidth >= window.innerWidth * 0.9;
            if (parseInt(style.zIndex) > 50 && isFullWidth) {
                console.log("🛡️ Shield: Removed blocking ad-layer");
                el.remove();
            }
        }
    }
};

// 4. POP-UP HIJACKER (SMART VERSION)
window.open = function(url) {
    if (url && BLACKLISTED_DOMAINS.some(domain => url.includes(domain))) {
        console.log("🚫 Brave Mode: Pop-up blocked!");
        return null;
    }
    return null; 
};

// Scan timing
setInterval(() => {
    killAds();
    removeOverlays();
}, 500);

// ============================================================
// 🎬 TMDB & SERVER LOGIC
// ============================================================
const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
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
