// ==========================================
// 🌌 INDIPLEX - THE ABYSSAL VOID v5.1
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732';
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

// ==========================================
// ✨ VISUALS: Intro & 3D RGB (INTACT)
// ==========================================
function initVisuals() {
    const intro = document.getElementById('intro-overlay');
    if (intro) {
        setTimeout(() => {
            intro.style.opacity = '0';
            setTimeout(() => intro.remove(), 1000);
        }, 2500);
    }
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.episode-card, .server-btn, .chip').forEach(card => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });
}

// ==========================================
// 🛡️ PHANTOM WINDOW — The Real Ad Killer
// ==========================================
(function phantomShield() {
    // Robust fake window — player ko lagega popup khula, ad nahi khulega
    window.open = function(url) {
        console.log('🛡️ Ad popup intercepted:', url);
        return {
            closed: false,
            focus: () => {},
            blur: () => {},
            close: function() { this.closed = true; },
            location: {
                href: url || '',
                assign: () => {},
                replace: () => {}
            },
            document: { write: () => {}, close: () => {} },
            postMessage: () => {}
        };
    };

    // DOM observer — player ke bahar inject hone wale ad elements delete karo
    const observer = new MutationObserver(() => {
        document.querySelectorAll(
            'div[class*="overlay"], div[id*="pop"], iframe[id*="ad"], div[class*="ad-layer"]'
        ).forEach(el => {
            if (el.id !== 'main-player') el.remove();
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();

// ==========================================
// 🚀 PLAYER CORE (No Sandbox)
// ==========================================
async function updatePlayer() {
    const player = document.getElementById('main-player');
    if (!player) return;

    // Sandbox bilkul nahi — ye video break karta hai
    player.removeAttribute('sandbox');
    player.src = '';

    const fallbackUrls = {
        vidsrc: `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&sea=${currentS}&epi=${currentE}`,
        vidlink: `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}?primaryColor=ffffff`,
        vidsrccc: `https://vidsrc.cc/v2/embed/tv/${TMDB_ID}/${currentS}/${currentE}`,
        videasy: `https://player.vidsrc.nl/embed/tv/${TMDB_ID}/${currentS}/${currentE}`
    };

    try {
        const response = await fetch(
            `/api/extract?tmdb=${TMDB_ID}&s=${currentS}&e=${currentE}`
        );
        const data = await response.json();

        if (data.success && data.embedUrl) {
            player.src = data.embedUrl;
            console.log('✅ Stream loaded:', data.embedUrl);
        } else {
            throw new Error('API no data');
        }
    } catch (err) {
        console.warn('⚠️ API fallback:', currentServer);
        player.src = fallbackUrls[currentServer] || fallbackUrls.vidsrc;
    }
}

// ==========================================
// 📺 UI: Seasons & Episodes (INTACT)
// ==========================================
async function initSeasons() {
    const container = document.getElementById('season-chips');
    if (!container) return;
    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/tv/${TMDB_ID}?api_key=${API_KEY}`
        );
        const data = await res.json();
        container.innerHTML = data.seasons
            .filter(s => s.season_number !== 0)
            .map(s =>
                `<div class="chip ${s.season_number === currentS ? 'active' : ''}"
                      onclick="window.changeSeason(${s.season_number})">
                    Season ${s.season_number}
                 </div>`
            ).join('');
        loadEpisodes(currentS);
    } catch (err) { console.error(err); }
}

window.changeSeason = (num) => {
    currentS = num;
    currentE = 1;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.chip')[num - 1]?.classList.add('active');
    loadEpisodes(num);
    updatePlayer();
};

async function loadEpisodes(num) {
    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${num}?api_key=${API_KEY}`
        );
        const data = await res.json();
        const grid = document.getElementById('episode-grid');
        if (!grid) return;
        const countEl = document.getElementById('episode-count');
        if (countEl) countEl.textContent = `${data.episodes.length} episodes`;

        grid.innerHTML = data.episodes.map(epi => `
            <div class="episode-card" onclick="window.playEpisode(${epi.episode_number})">
                <div class="card-inner">
                    <div class="glow-layer"></div>
                    ${epi.episode_number === currentE
                        ? '<div class="playing-tag">PLAYING</div>'
                        : ''}
                    <img class="epi-thumb"
                         src="https://image.tmdb.org/t/p/w500${epi.still_path || ''}"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/500x281?text=No+Preview'">
                    <div class="epi-info">
                        <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                        <div class="epi-meta">
                            ${epi.runtime ? epi.runtime + ' min' : ''}
                            ${epi.vote_average ? '⭐ ' + epi.vote_average.toFixed(1) : ''}
                        </div>
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
    const btn = document.querySelector(`.server-btn[data-server="${s}"]`);
    if (btn) btn.classList.add('active');
    updatePlayer();
}

// ==========================================
// 🔥 BOOT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initVisuals();
    initSeasons();
    updatePlayer();
});
