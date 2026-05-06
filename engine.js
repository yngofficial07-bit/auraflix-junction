// ==========================================
// 🌌 INDIPLEX - THE ABYSSAL VOID v4.2
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732';
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

// ==========================================
// ✨ CORE VISUALS: Intro & 3D RGB (INTACT)
// ==========================================
function initVisuals() {
    // 🎬 Original Intro (2.5s Stay)
    const intro = document.getElementById('intro-overlay');
    if(intro) {
        setTimeout(() => {
            intro.style.opacity = '0';
            setTimeout(() => intro.remove(), 1000);
        }, 2500);
    }

    // 🌈 3D Hover & RGB Animation Logic
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.episode-card, .server-btn, .chip');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// ==========================================
// 🛰️ GHOST PROTOCOL: Stream Snatching
// ==========================================
async function updatePlayer() {
    const player = document.getElementById('main-player');
    if (!player) return;

    player.src = ''; 
    const urls = {
        vidsrc: `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&sea=${currentS}&epi=${currentE}`,
        vidlink: `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}?primaryColor=ffffff`,
        vidsrccc: `https://vidsrc.cc/v2/embed/tv/${TMDB_ID}/${currentS}/${currentE}`
    };

    try {
        const response = await fetch(`/api/extract?tmdb=${TMDB_ID}&s=${currentS}&e=${currentE}`);
        const data = await response.json();

        if (data.success && data.embedUrl) {
            if (data.embedUrl.includes('.m3u8')) {
                player.src = `player.html?source=${encodeURIComponent(data.embedUrl)}`;
            } else {
                player.src = data.embedUrl;
            }
        } else { throw new Error(); }
    } catch (err) {
        // Safe Fallback to standard servers
        player.src = urls[currentServer] || urls.vidsrc;
    }

    // 🛡️ Anti-Ad Sandbox
    player.setAttribute('sandbox', 'allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation');
}

// ==========================================
// 🛡️ SECURITY LAYER: Popup Hijack
// ==========================================
(function injectShield() {
    window.open = function() { return { closed: true, focus: ()=>{}, close: ()=>{} }; };
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'IFRAME') e.stopPropagation();
    }, true);
})();

// ==========================================
// 📺 UI ENGINE: Seasons & Episodes
// ==========================================
async function initSeasons() {
    const container = document.getElementById('season-chips');
    if (!container) return;
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}?api_key=${API_KEY}`);
        const data = await res.json();
        container.innerHTML = data.seasons
            .filter(s => s.season_number !== 0)
            .map(s => `<div class="chip ${s.season_number === currentS ? 'active' : ''}" onclick="window.changeSeason(${s.season_number})">Season ${s.season_number}</div>`)
            .join('');
        loadEpisodes(currentS);
    } catch (err) { console.error(err); }
}

window.changeSeason = (num) => {
    currentS = num;
    currentE = 1;
    initSeasons();
};

async function loadEpisodes(num) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${num}?api_key=${API_KEY}`);
        const data = await res.json();
        const grid = document.getElementById('episode-grid');
        if (!grid) return;
        grid.innerHTML = data.episodes.map(epi => `
            <div class="episode-card" onclick="window.playEpisode(${epi.episode_number})">
                <div class="card-inner">
                    <div class="glow-layer"></div>
                    <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path || ''}" loading="lazy">
                    <div class="epi-info">
                        <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                    </div>
                </div>
            </div>`).join('');
    } catch (err) { console.error(err); }
}

window.playEpisode = (num) => {
    currentE = num;
    updatePlayer();
    loadEpisodes(currentS);
};

function switchServer(s) {
    currentServer = s;
    document.querySelectorAll('.server-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.server-btn[data-server="${s}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    updatePlayer();
}

// ==========================================
// 🔥 BOOT SYSTEM
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initVisuals();
    initSeasons();
    updatePlayer();
});
