// ==========================================
// 🛡️ INDIPLEX: MIRROR SHIELD PROTOCOL (V5)
// ==========================================

// 1. THE CCTV OBSERVER (Aggressive Detection)
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Agar element hai
                const isSafe = node.id === 'app' || node.id === 'main-player' || 
                               node.closest('#episode-grid') || node.closest('.server-options');
                
                // Agar ye hamara element nahi hai aur z-index high hai -> BLAST IT
                const style = window.getComputedStyle(node);
                if (!isSafe && (parseInt(style.zIndex) > 0 || style.position === 'fixed')) {
                    node.style.display = 'none';
                    node.remove();
                }
            }
        });
    });
});

// Start watching the whole website
observer.observe(document.body, { childList: true, subtree: true });

// 2. CLICK-JITSU: Event Interception
// Ye line player ke upar ki har invisible deewar ko bypass karegi
document.addEventListener('click', (e) => {
    const player = document.getElementById('main-player');
    if (player && !player.contains(e.target) && e.target.tagName !== 'BUTTON') {
        // Agar click player ke bahar kisi 'shady' cheez par hua toh use cancel karo
        const style = window.getComputedStyle(e.target);
        if (style.position === 'fixed' || style.zIndex > 10) {
            e.preventDefault();
            e.stopPropagation();
            console.log("🛡️ Shield: Blocked a ghost click!");
        }
    }
}, true);

// ==========================================
// 🎬 INDIPLEX CORE (All Features Verified)
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
    const data = await res.json();
    const grid = document.getElementById('episode-grid');
    grid.innerHTML = ''; 

    data.episodes.forEach(epi => {
        const card = document.createElement('div');
        card.className = 'episode-card tilt-effect rgb-glow'; // 3D & RGB INTACT
        card.innerHTML = `
            ${(epi.episode_number === currentE) ? '<div class="playing-tag">PLAYING</div>' : ''}
            <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path}">
            <div class="epi-info">
                <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
            </div>`;
        card.onclick = () => { currentE = epi.episode_number; updatePlayer(); loadEpisodes(currentS); };
        grid.appendChild(card);
    });
}

function updatePlayer() {
    const player = document.getElementById('main-player');
    const urls = {
        vidsrc: `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&season=${currentS}&episode=${currentE}`,
        vidlink: `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}`,
        moviesapi: `https://moviesapi.club/tv/${TMDB_ID}-${currentS}-${currentE}`,
        videasy: `https://player.vidsrc.nl/embed/tv/${TMDB_ID}/${currentS}/${currentE}` // SERVER OPTIONS INTACT
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

document.addEventListener('DOMContentLoaded', () => {
    loadEpisodes(1);
    updatePlayer();
});
