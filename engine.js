// ==========================================
// 🌌 INDIPLEX - THE ABYSSAL VOID v5.2 FINAL
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
// 🛡️ MAXIMUM AD SHIELD
// ==========================================
(function maxShield() {

    // 1. Phantom Window — player ko lagta hai popup khula, actually nahi khulta
    window.open = function(url) {
        return {
            closed: false,
            focus: () => {},
            blur: () => {},
            close: function() { this.closed = true; },
            location: { href: url || '', assign: () => {}, replace: () => {} },
            document: { write: () => {}, close: () => {}, open: () => {} },
            postMessage: () => {},
            addEventListener: () => {},
            removeEventListener: () => {}
        };
    };

    // 2. DOM Observer — bahar inject hone wale ad elements instant delete
    new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                const tag = node.tagName?.toLowerCase();
                const cls = (node.className || '') + (node.id || '');
                const src = node.src || node.href || '';
                const adPatterns = /pop|overlay|ad-|ads-|banner|promo|sponsor/i;

                if (
                    (tag === 'iframe' && node.id !== 'main-player') ||
                    (tag === 'div' && adPatterns.test(cls) && node.id !== 'main-player') ||
                    (tag === 'a' && /bet|casino|18\+|adult/i.test(src))
                ) {
                    node.remove();
                }
            });
        });
    }).observe(document.documentElement, { childList: true, subtree: true });

    // 3. Periodic cleanup — koi ad element bacha ho toh usse bhi hatao
    setInterval(() => {
        document.querySelectorAll(
            'iframe:not(#main-player), div[class*="pop-"], div[id*="pop-"], ' +
            'div[class*="overlay-ad"], div[class*="ad-overlay"]'
        ).forEach(el => el.remove());
    }, 1000);

})();

// ==========================================
// 🚀 PLAYER CORE — NO SANDBOX
// ==========================================
async function updatePlayer() {
    const player = document.getElementById('main-player');
    if (!player) return;

    player.removeAttribute('sandbox');
    player.src = '';

    const fallback = {
        vidsrc:   `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&sea=${currentS}&epi=${currentE}`,
        vidlink:  `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}?primaryColor=ffffff`,
        vidsrccc: `https://vidsrc.cc/v2/embed/tv/${TMDB_ID}/${currentS}/${currentE}`,
        videasy:  `https://player.vidsrc.nl/embed/tv/${TMDB_ID}/${currentS}/${currentE}`
    };

    try {
        const res  = await fetch(`/api/extract?tmdb=${TMDB_ID}&s=${currentS}&e=${currentE}`);
        const data = await res.json();
        if (data.success && data.embedUrl) {
            player.src = data.embedUrl;
        } else {
            throw new Error();
        }
    } catch {
        player.src = fallback[currentServer] || fallback.vidsrc;
    }
}

// ==========================================
// 📺 UI: Seasons & Episodes (INTACT)
// ==========================================
async function initSeasons() {
    const container = document.getElementById('season-chips');
    if (!container) return;
    try {
        const res  = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}?api_key=${API_KEY}`);
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
        const res  = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${num}?api_key=${API_KEY}`);
        const data = await res.json();
        const grid = document.getElementById('episode-grid');
        if (!grid) return;
        const countEl = document.getElementById('episode-count');
        if (countEl) countEl.textContent = `${data.episodes.length} episodes`;

        grid.innerHTML = data.episodes.map(epi => `
            <div class="episode-card" onclick="window.playEpisode(${epi.episode_number})">
                <div class="card-inner">
                    <div class="glow-layer"></div>
                    ${epi.episode_number === currentE ? '<div class="playing-tag">PLAYING</div>' : ''}
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
    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.server-btn[data-server="${s}"]`)?.classList.add('active');
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
