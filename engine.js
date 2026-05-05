// ==========================================
// 🛡️ AURA-BRAVE STEALTH ENGINE (ANTI-AD/POPUP)
// ==========================================

const AD_PATTERNS = [
    /oundhertobeconsist/i, /frs2c/i, /v2006/i, /wiestunvote/i, 
    /painamour/i, /twasmerelyhers/i, /milvussorel/i, /havingwacks/i,
    /raklls/i, /casino/i, /crypto/i, /1xbet/i, /onclick/i, /popads/i,
    /syndication/i, /doubleclick/i, /adservice/i
];

// 1. POPUP KILLER
window.open = function() { return null; };

// 2. DOMAIN & OVERLAY PURGE
const neutralizeAds = () => {
    const player = document.getElementById('main-player');
    const app = document.getElementById('app');

    document.querySelectorAll('a, iframe, div, ins, script').forEach(el => {
        if (el === player || el.id === 'main-player' || el.closest('#episode-grid') || (app && app.contains(el))) return;

        const content = (el.src || el.href || el.outerHTML || '').toLowerCase();
        
        // Target specific ad domains from your links
        if (AD_PATTERNS.some(pattern => pattern.test(content))) {
            el.remove();
        }

        // Auto-remove invisible blocking layers
        const style = window.getComputedStyle(el);
        if ((style.position === 'fixed' || style.position === 'absolute') && parseInt(style.zIndex) > 10) {
            el.style.pointerEvents = 'none'; 
            el.style.display = 'none';
            el.remove();
        }
    });
};

setInterval(neutralizeAds, 300);

// ==========================================
// 🎬 INDIPLEX CORE LOGIC (TMDB & SERVERS)
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 

let currentS = 1;
let currentE = 1;
let currentServer = 'vidsrc';

// 3. LOAD EPISODES (With 3D Hover & RGB Intact)
async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
        const data = await response.json();
        const grid = document.getElementById('episode-grid');
        grid.innerHTML = ''; 

        data.episodes.forEach(epi => {
            const card = document.createElement('div');
            // 'Ek Number' Effects: 3D Hover & RGB Glow
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

// 4. SERVER SWITCHER & PLAYER UPDATE
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

// Ye raha Server UI wala part jo skip ho gaya tha
function switchServer(s) { 
    currentServer = s; 
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.remove('active');
        // Match server name to button text
        if(btn.innerText.toLowerCase().includes(s)) {
            btn.classList.add('active');
        }
    });
    updatePlayer(); 
}

// Initialization
loadEpisodes(1);
updatePlayer();
