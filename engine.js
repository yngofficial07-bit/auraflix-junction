// ==========================================
// 🛡️ AURA-BRAVE STEALTH BYPASS ENGINE
// ==========================================

const BLACKLISTED_DOMAINS = [
    '1xbet', 'oundhertobeconsist', 'muralssouth', 'polosanitizertrusting', 
    'iwmbuzz', 'marketdeath', 'propush', 'onclick', 'popads', 'popcash',
    'pop', 'xtra', 'click', 'double', 'adsystem', 'syndication', 'doubleclick'
];

// 1. SMART CLICK-THROUGH (Click block nahi hoga)
document.addEventListener('mousedown', (e) => {
    const player = document.getElementById('main-player');
    const target = e.target;

    // Agar click player par nahi hai, aur target element poori screen cover kar raha hai (Ads ki nishani)
    if (player && target !== player && !player.contains(target)) {
        const style = window.getComputedStyle(target);
        if (style.position === 'absolute' || style.position === 'fixed') {
            if (parseInt(style.zIndex) > 10) {
                console.log("🛡️ Stealth: Ad layer detected. Bypassing...");
                
                // Magic Line: Click ko layer ke "aar-paar" bhejta hai
                target.style.pointerEvents = 'none'; 
                
                // Layer ko 100ms baad uda do taki user ko pata bhi na chale
                setTimeout(() => { if(target.parentNode) target.remove(); }, 100);
            }
        }
    }
}, true);

// 2. NETWORK & POP-UP KILLER
window.open = function() { return null; };

const auraClean = () => {
    // 1. Blacklisted domains ko udao
    document.querySelectorAll('iframe, script, a').forEach(el => {
        if (el.id === 'main-player') return;
        const src = el.src || el.href || '';
        if (BLACKLISTED_DOMAINS.some(d => src.toLowerCase().includes(d))) {
            el.remove();
        }
    });

    // 2. Player ki priority top par rakho
    const player = document.getElementById('main-player');
    if (player) {
        player.style.zIndex = "9999";
        player.style.position = "relative";
    }
};

// Har 400ms mein safai
setInterval(auraClean, 400);

// ==========================================
// 🎬 TMDB & SERVER LOGIC (INDIPLEX Core)
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; // Stranger Things example

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
            // 3D Hover & RGB Effects Intact (Ek Number!)
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

// Initial Start
loadEpisodes(1);
updatePlayer();
