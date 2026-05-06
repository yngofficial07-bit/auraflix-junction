// ==========================================
// 🌌 INDIPLEX - THE ABYSSAL VOID v4.1 (FIXED)
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732';
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

// ==========================================
// ✨ VISUALS: Intro & 3D RGB (NEVER REMOVED)
// ==========================================
function initVisuals() {
    const intro = document.getElementById('intro-overlay');
    if(intro) {
        setTimeout(() => {
            intro.style.opacity = '0';
            setTimeout(() => intro.remove(), 1000);
        }, 2500);
    }
    // 3D Hover & RGB Logic
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.episode-card, .server-btn').forEach(card => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });
}

// ==========================================
// 🚀 PLAYER CORE: The "Black Screen" Killer
// ==========================================
async function updatePlayer() {
    const player = document.getElementById('main-player');
    if (!player) return;

    // Reset player state to avoid ghosting
    player.src = '';
    
    // Default URLs logic
    const urls = {
        vidsrc: `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&sea=${currentS}&epi=${currentE}`,
        vidlink: `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}`,
        vidsrccc: `https://vidsrc.cc/v2/embed/tv/${TMDB_ID}/${currentS}/${currentE}`
    };

    try {
        console.log("🛰️ Fetching from Ghost Protocol API...");
        const response = await fetch(`/api/extract?tmdb=${TMDB_ID}&s=${currentS}&e=${currentE}`);
        const data = await response.json();

        if (data.success && data.embedUrl) {
            console.log("🔥 Ghost Link Secured!");
            // Agar m3u8 mil raha hai toh player.html use karo, varna direct embed
            if (data.embedUrl.includes('.m3u8')) {
                player.src = `player.html?source=${encodeURIComponent(data.embedUrl)}`;
            } else {
                player.src = data.embedUrl;
            }
        } else {
            throw new Error("API Offline");
        }
    } catch (err) {
        console.warn("⚠️ API Error, using direct fallback.");
        // Fallback to standard servers if API fails
        player.src = urls[currentServer] || urls.vidsrc;
    }

    // Sandbox permissions update to allow video play
    player.setAttribute('sandbox', 'allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation');
}

// ==========================================
// 📺 UI & SEASONS (Ek Number Setup)
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
    } catch (err) { console.error("Season Engine Failed", err); }
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
                    <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path || ''}" onerror="this.src='https://via.placeholder.com/500x281?text=No+Image'">
                    <div class="epi-info">
                        <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                    </div>
                </div>
            </div>`).join('');
    } catch (err) { console.error("Episode Engine Failed", err); }
}

window.playEpisode = (num) => {
    currentE = num;
    updatePlayer();
    loadEpisodes(currentS);
};

// ==========================================
// 🛡️ INITIALIZE EVERYTHING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initVisuals();
    initSeasons();
    updatePlayer();
});
