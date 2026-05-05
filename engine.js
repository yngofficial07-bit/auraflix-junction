// ==========================================
// 🛡️ INDIPLEX DOMAIN-TARGETED SHIELD
// ==========================================

// Saare links jo tune bheje unka nichod (Pattern Matching)
const AD_PATTERNS = [
    /oundhertobeconsist/i, /frs2c/i, /v2006/i, /wiestunvote/i, 
    /painamour/i, /twasmerelyhers/i, /milvussorel/i, /havingwacks/i,
    /raklls/i, /casino/i, /crypto/i, /1xbet/i, /onclick/i, /popads/i
];

// 1. GLOBAL NETWORK INTERCEPTOR (Popups ka baap)
window.open = function(url) {
    console.log("🚫 Aura Shield: Blocked redirect to ->", url);
    return null; 
};

// 2. ACTIVE ELEMENT DESTRUCTION (Jo tune video mein dikhaya)
const neutralizeAds = () => {
    const player = document.getElementById('main-player');
    
    // Sabhi elements check karo jo player ke bahar hain
    document.querySelectorAll('a, iframe, div, ins, script').forEach(el => {
        if (el === player || el.id === 'main-player' || el.closest('#episode-grid')) return;

        const content = (el.src || el.href || el.outerHTML || '').toLowerCase();
        
        // Agar element hamari blacklist se match hota hai
        if (AD_PATTERNS.some(pattern => pattern.test(content))) {
            console.log("🛡️ Shield: Neutralized ad domain element");
            el.remove();
        }

        // Invisible layers jo click chura rahi hain
        const style = window.getComputedStyle(el);
        if ((style.position === 'fixed' || style.position === 'absolute') && parseInt(style.zIndex) > 10) {
            if (!el.contains(player)) {
                el.style.pointerEvents = 'none'; // Click ko aar-paar jaane do
                el.style.display = 'none';
                el.remove();
            }
        }
    });
};

// 3. REAL-TIME PROTECTION (Har 300ms mein scan)
setInterval(neutralizeAds, 300);

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
