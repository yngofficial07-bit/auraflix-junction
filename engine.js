// ==========================================
// 🌌 INDIPLEX - THE ABYSSAL VOID v4.0
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732';
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

// ==========================================
// ✨ INTRO & 3D RGB ANIMATIONS (INTACT)
// ==========================================
function initVisuals() {
    // Original Intro Logic
    const intro = document.getElementById('intro-overlay');
    if(intro) {
        setTimeout(() => {
            intro.style.opacity = '0';
            setTimeout(() => intro.remove(), 1000);
        }, 2500);
    }

    // 3D Hover Effect for Cards
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.episode-card, .server-btn');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (x > 0 && y > 0 && x < rect.width && y < rect.height) {
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        });
    });
}

// ==========================================
// 🛰️ STREAM SNATCHER ENGINE (V4.0 Logic)
// ==========================================
async function snatchStream(tmdb, s, e) {
    console.log("🕵️ Sniffing for master.m3u8...");
    try {
        const response = await fetch(`/api/extract?tmdb=${tmdb}&s=${s}&e=${e}`);
        const data = await response.json();
        if (data.success && data.embedUrl) return data.embedUrl;
    } catch (err) {
        console.warn("Snatcher fallback initiated.");
    }
    return null;
}

// ==========================================
// 🚀 PLAYER CORE (With Ad-Shield)
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

    const targetUrl = urls[currentServer] || urls.vidsrc;
    const snatched = await snatchStream(TMDB_ID, currentS, currentE);

    if (snatched && snatched.includes('.m3u8')) {
        player.src = `player.html?source=${encodeURIComponent(snatched)}`;
    } else {
        // Sandbox for Ad-Blocking while keeping original servers
        player.setAttribute('sandbox', 'allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation');
        player.src = targetUrl;
    }
}

// ==========================================
// 🛡️ CLICK & POPUP HIJACK
// ==========================================
(function injectShield() {
    window.open = function() { return { closed: true, focus: ()=>{}, close: ()=>{} }; };
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'IFRAME') e.stopPropagation();
    }, true);
})();

// ==========================================
// 📺 UI COMPONENTS (Seasons & Episodes)
// ==========================================
async function initSeasons() {
    const seasonContainer = document.getElementById('season-chips');
    if (!seasonContainer) return;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}?api_key=${API_KEY}`);
        const data = await response.json();
        seasonContainer.innerHTML = '';
        data.seasons.forEach(season => {
            if (season.season_number === 0) return;
            const chip = document.createElement('div');
            chip.className = `chip ${season.season_number === currentS ? 'active' : ''}`;
            chip.innerText = `Season ${season.season_number}`;
            chip.onclick = () => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentS = season.season_number;
                currentE = 1;
                loadEpisodes(currentS);
            };
            seasonContainer.appendChild(chip);
        });
        loadEpisodes(currentS);
    } catch (e) { console.error('UI Error:', e); }
}

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
        const data = await res.json();
        const grid = document.getElementById('episode-grid');
        if (!grid) return;
        grid.innerHTML = '';
        data.episodes.forEach(epi => {
            const card = document.createElement('div');
            card.className = 'episode-card';
            const thumb = epi.still_path ? `https://image.tmdb.org/t/p/w500${epi.still_path}` : 'https://via.placeholder.com/500x281?text=No+Preview';
            card.innerHTML = `
                ${epi.episode_number === currentE ? '<div class="playing-tag">PLAYING</div>' : ''}
                <div class="card-inner">
                    <img class="epi-thumb" src="${thumb}" loading="lazy">
                    <div class="epi-info">
                        <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                    </div>
                </div>`;
            card.onclick = () => {
                currentE = epi.episode_number;
                updatePlayer();
                loadEpisodes(currentS);
            };
            grid.appendChild(card);
        });
    } catch (e) { console.error('Load Error:', e); }
}

function switchServer(s) {
    currentServer = s;
    document.querySelectorAll('.server-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.server-btn[data-server="${s}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    updatePlayer();
}

// ==========================================
// 🔥 BOOT ENGINE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initVisuals();
    initSeasons();
    updatePlayer();
});
