// ==========================================
// 🛡️ AURA-BRAVE STEALTH ENGINE (SAFE VERSION)
// ==========================================

const AD_PATTERNS = [
    /oundhertobeconsist/i, /frs2c/i, /v2006/i, /wiestunvote/i, 
    /painamour/i, /twasmerelyhers/i, /milvussorel/i, /havingwacks/i,
    /raklls/i, /casino/i, /crypto/i, /1xbet/i, /onclick/i, /popads/i
];

window.open = function() { return null; };

const neutralizeAds = () => {
    // 1. Sirf un cheezon ko dhoondo jo hamare structure ka hissa nahi hain
    document.querySelectorAll('iframe, div, ins, a').forEach(el => {
        // Safe Zones: Inhe kabhi mat hatana
        if (el.id === 'main-player' || 
            el.closest('#episode-grid') || 
            el.closest('.server-options') || 
            el.id === 'app') return;

        const content = (el.src || el.href || '').toLowerCase();
        
        // 2. Sirf Blacklisted Domains ko udao
        if (AD_PATTERNS.some(pattern => pattern.test(content))) {
            el.remove();
            return;
        }

        // 3. Invisible Overlays (Agar player ke upar koi 'fixed' div hai)
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' && parseInt(style.zIndex) > 100) {
            // Agar ye div poori screen cover kar raha hai toh hi udao
            if (el.offsetWidth > window.innerWidth * 0.8) {
                el.remove();
            }
        }
    });
};

setInterval(neutralizeAds, 1000); // 1 second gap for stability

// ==========================================
// 🎬 INDIPLEX CORE (TMDB, Servers, 3D/RGB)
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 

let currentS = 1;
let currentE = 1;
let currentServer = 'vidsrc';

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
        const data = await response.json();
        const grid = document.getElementById('episode-grid');
        if (!grid) return;
        
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
    if (player) player.src = urls[currentServer];
}

function switchServer(s) { 
    currentServer = s; 
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase().includes(s));
    });
    updatePlayer(); 
}

// Kickstart
document.addEventListener('DOMContentLoaded', () => {
    loadEpisodes(1);
    updatePlayer();
});
