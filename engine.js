// ==========================================
// 🌌 INDIPLEX - THE ABYSSAL VOID v5.7 (Server Fixed)
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732';
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

// ==========================================
// ✨ VISUALS: Intro & 3D RGB
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
// 🛡️ PHANTOM WINDOW SHIELD (Existing Logic)
// ==========================================
(function phantomShield() {
    const fakeWindow = {
        closed: false,
        focus:  () => {},
        blur:   () => {},
        close:  function() { this.closed = true; },
        location: { href: '', assign: () => {}, replace: () => {} },
        document: { write: () => {}, close: () => {}, open: () => {} },
        postMessage: () => {},
        addEventListener: () => {},
        removeEventListener: () => {}
    };

    window.open = () => fakeWindow;

    document.addEventListener('click', (e) => {
        const el = e.target.closest('a[target="_blank"], a[target="blank"]');
        if (el) e.preventDefault();
    }, true);

    new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                const tag = node.tagName?.toLowerCase();
                const cls = ((node.className || '') + (node.id || '')).toLowerCase();
                if (
                    (tag === 'iframe' && node.id !== 'main-player') ||
                    (tag === 'div' && /pop|overlay-ad|ad-layer|advert/i.test(cls)) ||
                    (tag === 'a' && node.target === '_blank' && /casino|bet|adult|18\+/i.test(node.href || ''))
                ) {
                    node.remove();
                }
            });
        });
    }).observe(document.documentElement, { childList: true, subtree: true });

    setInterval(() => {
        document.querySelectorAll('iframe:not(#main-player)').forEach(el => el.remove());
    }, 2000);
})();

// ==========================================
// 🚀 PLAYER CORE (Updated Server Links)
// ==========================================
async function updatePlayer() {
    const player = document.getElementById('main-player');
    if (!player) return;

    player.removeAttribute('sandbox');
    player.src = 'about:blank';

    let finalUrl = '';

    // --- SERVER LOGIC START ---
    if (currentServer === 'vidsrc') {
        // Cloudnestra Extraction Logic
        const fallback = `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&sea=${currentS}&epi=${currentE}`;
        try {
            const res = await fetch(`/api/extract?tmdb=${TMDB_ID}&s=${currentS}&e=${currentE}`);
            const data = await res.json();
            finalUrl = (data.success && data.embedUrl) ? data.embedUrl : fallback;
        } catch {
            finalUrl = fallback;
        }
    } 
    else if (currentServer === 'vidlink') {
        finalUrl = `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}?primaryColor=6a0dad&autoplay=true`;
    } 
    else if (currentServer === 'moviesapi') {
        finalUrl = `https://moviesapi.to/tv/${TMDB_ID}/${currentS}/${currentE}`;
    } 
    else if (currentServer === 'videasy') {
        finalUrl = `https://videasy.me/embed/tv?tmdb=${TMDB_ID}&sea=${currentS}&epi=${currentE}`;
    } 
    else {
        finalUrl = `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&sea=${currentS}&epi=${currentE}`;
    }
    // --- SERVER LOGIC END ---

    player.src = finalUrl;
}

// ==========================================
// 📺 UI: Seasons & Episodes
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
                    ${epi.episode_number === currentE
                        ? '<div class="playing-tag">PLAYING</div>' : ''}
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

window.switchServer = (s) => {
    currentServer = s;
    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.server-btn[data-server="${s}"]`)?.classList.add('active');
    updatePlayer();
};

// ==========================================
// 🔥 BOOT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initVisuals();
    initSeasons();
    updatePlayer();
});
