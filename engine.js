// ==========================================
// 🌌 AURAFLIX - PREMIUM ENGINE v8.0
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const urlParams = new URLSearchParams(window.location.search);
const TMDB_ID = urlParams.get('id') || '66732';
const TYPE = urlParams.get('type') || 'tv';

let currentS = parseInt(urlParams.get('s') || '1');
let currentE = parseInt(urlParams.get('e') || '1');
let currentServer = 'vidsrc';
let totalEpisodes = 0;
let totalSeasons = 0;
let allEpisodesData = [];

// ==========================================
// 🛡️ PHANTOM SHIELD
// ==========================================
(function phantomShield() {
    const fakeWindow = {
        closed: false, focus: () => {}, blur: () => {},
        close: function() { this.closed = true; },
        location: { href: '', assign: () => {}, replace: () => {} },
        document: { write: () => {}, close: () => {}, open: () => {} },
        postMessage: () => {}, addEventListener: () => {}, removeEventListener: () => {}
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
                    (tag === 'div' && /pop|overlay-ad|ad-layer|advert/i.test(cls))
                ) node.remove();
            });
        });
    }).observe(document.documentElement, { childList: true, subtree: true });

    setInterval(() => {
        document.querySelectorAll('iframe:not(#main-player)').forEach(el => el.remove());
    }, 2000);
})();

// ==========================================
// 🎬 SERVER URLs
// ==========================================
function getServerUrl(server) {
    const urls = {
        vidsrc: TYPE === 'movie'
            ? `https://vidsrc.me/embed/movie?tmdb=${TMDB_ID}`
            : `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&sea=${currentS}&epi=${currentE}`,
        vidsrccc2: TYPE === 'movie'
            ? `https://vidsrc.cc/v2/embed/movie/${TMDB_ID}`
            : `https://vidsrc.cc/v2/embed/tv/${TMDB_ID}/${currentS}/${currentE}`,
        twoembed: TYPE === 'movie'
            ? `https://www.2embed.stream/embed/movie/${TMDB_ID}`
            : `https://www.2embed.stream/embed/tv/${TMDB_ID}/${currentS}/${currentE}`,
        smashystream: TYPE === 'movie'
            ? `https://player.smashy.stream/movie/${TMDB_ID}`
            : `https://player.smashy.stream/tv/${TMDB_ID}?s=${currentS}&e=${currentE}`,
        autoembed: TYPE === 'movie'
            ? `https://autoembed.co/movie/tmdb/${TMDB_ID}`
            : `https://autoembed.co/tv/tmdb/${TMDB_ID}-${currentS}-${currentE}`,
    };
    return urls[server] || urls.vidsrc;
}

// ==========================================
// 🚀 PLAYER CORE
// ==========================================
async function updatePlayer() {
    const player = document.getElementById('main-player');
    const loader = document.getElementById('player-loader');
    if (!player) return;

    if (loader) loader.classList.add('show');

    player.removeAttribute('sandbox');
    player.src = 'about:blank';
    await new Promise(r => setTimeout(r, 100));

    player.src = getServerUrl(currentServer);

    // Hide loader after 3s
    setTimeout(() => {
        if (loader) loader.classList.remove('show');
    }, 3000);

    // Update ep tag
    updateEpTag();
    updateNavButtons();

    // Update URL without reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('id', TMDB_ID);
    newUrl.searchParams.set('type', TYPE);
    if (TYPE === 'tv') {
        newUrl.searchParams.set('s', currentS);
        newUrl.searchParams.set('e', currentE);
    }
    window.history.replaceState({}, '', newUrl);
}

function updateEpTag() {
    const tag = document.getElementById('current-ep-tag');
    if (!tag) return;
    if (TYPE === 'tv') {
        tag.textContent = `S${currentS} E${currentE}`;
        tag.style.display = '';
    } else {
        tag.style.display = 'none';
    }
}

function updateNavButtons() {
    const prevBtn = document.getElementById('prev-ep-btn');
    const nextBtn = document.getElementById('next-ep-btn');
    if (!prevBtn || !nextBtn) return;

    if (TYPE === 'movie') {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    prevBtn.disabled = (currentS === 1 && currentE === 1);
    nextBtn.disabled = (currentS === totalSeasons && currentE === totalEpisodes);
}

// ==========================================
// ⏮️ PREV / NEXT EPISODE
// ==========================================
window.prevEpisode = async function() {
    if (currentE > 1) {
        currentE--;
        updatePlayer();
        loadEpisodes(currentS);
    } else if (currentS > 1) {
        currentS--;
        // Load prev season last episode
        try {
            const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${currentS}?api_key=${API_KEY}`);
            const data = await res.json();
            currentE = data.episodes?.length || 1;
            totalEpisodes = currentE;
        } catch { currentE = 1; }
        updatePlayer();
        loadEpisodes(currentS);
        updateSeasonChips();
    }
};

window.nextEpisode = async function() {
    if (currentE < totalEpisodes) {
        currentE++;
        updatePlayer();
        loadEpisodes(currentS);
    } else if (currentS < totalSeasons) {
        currentS++;
        currentE = 1;
        updatePlayer();
        loadEpisodes(currentS);
        updateSeasonChips();
    }
};

// ==========================================
// 📺 SHOW INFO
// ==========================================
async function loadShowInfo() {
    try {
        const endpoint = TYPE === 'movie'
            ? `https://api.themoviedb.org/3/movie/${TMDB_ID}?api_key=${API_KEY}`
            : `https://api.themoviedb.org/3/tv/${TMDB_ID}?api_key=${API_KEY}`;

        const res = await fetch(endpoint);
        const data = await res.json();

        const title = data.title || data.name || 'Unknown';
        const year = (data.release_date || data.first_air_date || '').substring(0, 4);
        const rating = data.vote_average ? data.vote_average.toFixed(1) : '';
        const poster = data.poster_path ? `https://image.tmdb.org/t/p/w200${data.poster_path}` : '';
        const overview = data.overview || '';

        // Title
        const titleEl = document.getElementById('show-title');
        if (titleEl) titleEl.textContent = title;

        // Nav title
        const navTitle = document.getElementById('show-title-nav');
        if (navTitle) navTitle.textContent = title;

        // Page title
        document.title = `${title} — AuraFlix`;

        // Tags
        const ratingEl = document.getElementById('show-rating');
        if (ratingEl && rating) ratingEl.textContent = `⭐ ${rating}`;

        const yearEl = document.getElementById('show-year');
        if (yearEl && year) yearEl.textContent = year;

        const typeEl = document.getElementById('show-type');
        if (typeEl) typeEl.textContent = TYPE === 'movie' ? '🎬 Movie' : '📺 TV Show';

        // Poster mini
        const posterEl = document.getElementById('show-poster-mini');
        if (posterEl && poster) {
            posterEl.innerHTML = `<img src="${poster}" alt="${title}">`;
        }

        // Overview
        if (overview) {
            const box = document.getElementById('show-overview-box');
            const text = document.getElementById('show-overview-text');
            if (box && text) {
                text.textContent = overview;
                box.style.display = 'block';
            }
        }

        // Total seasons
        if (TYPE === 'tv') {
            totalSeasons = data.number_of_seasons || 1;
        }

    } catch (err) {
        console.error('Show info error:', err);
    }
}

// ==========================================
// 📺 SEASONS & EPISODES
// ==========================================
async function initSeasons() {
    if (TYPE === 'movie') {
        const col = document.getElementById('episodes-column');
        if (col) col.style.display = 'none';
        return;
    }

    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}?api_key=${API_KEY}`);
        const data = await res.json();
        totalSeasons = data.number_of_seasons || 1;
        const seasons = (data.seasons || []).filter(s => s.season_number !== 0);
        renderSeasonChips(seasons);
        await loadEpisodes(currentS);
    } catch (err) { console.error(err); }
}

function renderSeasonChips(seasons) {
    const container = document.getElementById('season-chips');
    if (!container) return;
    container.innerHTML = seasons.map(s => `
        <button class="s-season-chip ${s.season_number === currentS ? 'active' : ''}"
                onclick="window.changeSeason(${s.season_number})">
            S${s.season_number}
        </button>
    `).join('');
}

function updateSeasonChips() {
    document.querySelectorAll('.s-season-chip').forEach((chip, i) => {
        chip.classList.toggle('active', i + 1 === currentS);
    });
}

window.changeSeason = async (num) => {
    currentS = num;
    currentE = 1;
    updateSeasonChips();
    await loadEpisodes(num);
    updatePlayer();
};

async function loadEpisodes(num) {
    if (TYPE === 'movie') return;
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${num}?api_key=${API_KEY}`);
        const data = await res.json();
        const episodes = data.episodes || [];
        totalEpisodes = episodes.length;
        allEpisodesData = episodes;

        const countEl = document.getElementById('episode-count');
        if (countEl) countEl.textContent = `${episodes.length} eps`;

        renderEpisodes(episodes);
        updateNavButtons();
    } catch (err) { console.error(err); }
}

function renderEpisodes(episodes) {
    const grid = document.getElementById('episode-grid');
    if (!grid) return;

    grid.innerHTML = episodes.map(epi => {
        const isPlaying = epi.episode_number === currentE;
        const thumb = epi.still_path
            ? `https://image.tmdb.org/t/p/w300${epi.still_path}`
            : 'https://via.placeholder.com/300x169?text=No+Preview';
        const runtime = epi.runtime ? `${epi.runtime}m` : '';
        const rating = epi.vote_average ? `⭐ ${epi.vote_average.toFixed(1)}` : '';

        return `
            <div class="episode-card ${isPlaying ? 'playing' : ''}"
                 onclick="window.playEpisode(${epi.episode_number})">
                <div class="epi-thumb-wrap">
                    <img class="epi-thumb" src="${thumb}"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/300x169?text=No+Preview'">
                    <div class="epi-play-overlay">
                        <div class="epi-play-icon">
                            <svg width="10" height="12" viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z"/></svg>
                        </div>
                    </div>
                    ${isPlaying ? '<span class="playing-tag">▶ Playing</span>' : ''}
                </div>
                <div class="epi-info">
                    <span class="epi-num">EP ${epi.episode_number}</span>
                    <span class="epi-title">${epi.name || `Episode ${epi.episode_number}`}</span>
                    <span class="epi-meta">
                        ${runtime ? `<span>${runtime}</span>` : ''}
                        ${rating ? `<span>${rating}</span>` : ''}
                    </span>
                </div>
            </div>
        `;
    }).join('');

    // Scroll to playing episode
    setTimeout(() => {
        const playing = grid.querySelector('.playing');
        if (playing) playing.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

window.playEpisode = (num) => {
    currentE = num;
    updatePlayer();
    renderEpisodes(allEpisodesData);
};

function switchServer(s) {
    currentServer = s;
    document.querySelectorAll('.s-chip').forEach(b => b.classList.remove('active'));
    document.querySelector(`.s-chip[data-server="${s}"]`)?.classList.add('active');
    updatePlayer();
}

// ==========================================
// 🔍 SEARCH
// ==========================================
let searchTimeout = null;

document.getElementById('search-input')?.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    const dropdown = document.getElementById('search-results');
    clearTimeout(searchTimeout);

    if (query.length < 2) {
        dropdown.classList.remove('show');
        dropdown.innerHTML = '';
        return;
    }

    dropdown.classList.add('show');
    dropdown.innerHTML = '<div class="s-loading">Searching...</div>';

    searchTimeout = setTimeout(() => doSearch(query), 350);
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
        document.getElementById('search-results')?.classList.remove('show');
    }
});

document.getElementById('search-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('search-results')?.classList.remove('show');
        e.target.blur();
    }
});

async function doSearch(query) {
    const dropdown = document.getElementById('search-results');
    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
        );
        const data = await res.json();

        const filtered = (data.results || [])
            .filter(i => (i.media_type === 'tv' || i.media_type === 'movie') && i.poster_path)
            .slice(0, 8);

        if (!filtered.length) {
            dropdown.innerHTML = '<div class="s-empty">No results found 😔</div>';
            return;
        }

        dropdown.innerHTML = filtered.map(item => {
            const title = item.title || item.name || 'Unknown';
            const year = (item.release_date || item.first_air_date || '').substring(0, 4);
            const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : '';
            const type = item.media_type;

            return `
                <div class="s-result" onclick="goToPlayer(${item.id}, '${type}')">
                    <img src="https://image.tmdb.org/t/p/w92${item.poster_path}"
                         onerror="this.src='https://via.placeholder.com/42x62?text=?'"
                         alt="${title}">
                    <div class="s-result-info">
                        <div class="s-result-title">${title}</div>
                        <div class="s-result-meta">${year} ${rating}</div>
                    </div>
                    <span class="s-badge ${type}">${type === 'tv' ? 'TV' : 'Movie'}</span>
                </div>
            `;
        }).join('');

    } catch {
        dropdown.innerHTML = '<div class="s-empty">Something went wrong 😕</div>';
    }
}

window.goToPlayer = (id, type) => {
    window.location.href = `index.html?id=${id}&type=${type}`;
};

// ==========================================
// 🔥 BOOT
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Load show info
    await loadShowInfo();

    // Init seasons / player
    if (TYPE === 'tv') {
        await initSeasons();
    } else {
        const col = document.getElementById('episodes-column');
        if (col) col.style.display = 'none';
    }

    // Update ep tag
    updateEpTag();

    // Load player
    updatePlayer();
});
