/// 1. BRAVE-STYLE DOMAIN FILTER
const BLACKLISTED_DOMAINS = [
    '1xbet', 'oundhertobeconsist', 'muralssouth', 'polosanitizertrusting', 
    'iwmbuzz', 'marketdeath', 'propush', 'onclick', 'popads', 'popcash'
];

// 2. NETWORK INTERCEPTOR
const killAds = () => {
    const allLinks = document.querySelectorAll('a, iframe, script');
    allLinks.forEach(el => {
        const url = el.src || el.href || '';
        // FIX: domain ko check karne ka sahi tarika
        const foundDomain = BLACKLISTED_DOMAINS.find(d => url.includes(d));
        if (foundDomain) {
            console.log(`🛡️ Aura Shield: Blocked ${foundDomain}`);
            el.remove();
        }
    });
};

// 3. THE "GHOST" LAYER KILLER
const removeOverlays = () => {
    // Apne HTML mein check kar ki player ka container div class 'video-container' hai ya nahi
    const playerContainer = document.querySelector('.video-container'); 
    if (!playerContainer) return;

    const children = document.body.children;
    for (let i = 0; i < children.length; i++) {
        const el = children[i];
        const style = window.getComputedStyle(el);
        // Player aur Main App ko chhod kar baaki high z-index layers ko hatao
        if (el.id !== 'app' && el.id !== 'main-player' && style.position === 'absolute' && parseInt(style.zIndex) > 10) {
            el.remove();
        }
    }
};

// 4. POP-UP HIJACKER
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
// IS LINE KE NICHE TERA PURANA TMDB & SERVER LOGIC RAKHNA
// ============================================================
// 4. TMDB & SERVER LOGIC (With 3D Hover/Animations kept intact)
const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; // Stranger Things
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    const response = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
    const data = await response.json();
    const grid = document.getElementById('episode-grid');
    grid.innerHTML = ''; 

    data.episodes.forEach(epi => {
        const card = document.createElement('div');
        // INDIPLEX project ke 3D/RGB elements intact rakhe hain
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
    player.src = urls[currentServer];
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
