// ==========================================
// 🌌 AURAFLIX — ENGINE v8.0
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
    const fake = {
        closed: false, focus:()=>{}, blur:()=>{},
        close: function(){ this.closed=true; },
        location:{href:'',assign:()=>{},replace:()=>{}},
        document:{write:()=>{},close:()=>{},open:()=>{}},
        postMessage:()=>{}, addEventListener:()=>{}, removeEventListener:()=>{}
    };
    window.open = () => fake;

    document.addEventListener('click', (e) => {
        const el = e.target.closest('a[target="_blank"]');
        if (el) e.preventDefault();
    }, true);

    new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                const tag = node.tagName?.toLowerCase();
                const cls = ((node.className||'')+(node.id||'')).toLowerCase();
                if ((tag==='iframe' && node.id!=='main-player') ||
                    (tag==='div' && /pop|overlay-ad|advert/i.test(cls))) {
                    node.remove();
                }
            });
        });
    }).observe(document.documentElement, {childList:true, subtree:true});

    setInterval(() => {
        document.querySelectorAll('iframe:not(#main-player)').forEach(el => el.remove());
    }, 2000);
})();

// ==========================================
// 🎬 WORKING SERVERS 2026
// ==========================================
function getServerUrl(server) {
    const isMovie = TYPE === 'movie';
    const urls = {
        vidsrc: isMovie
            ? `https://vidsrc.me/embed/movie?tmdb=${TMDB_ID}`
            : `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&sea=${currentS}&epi=${currentE}`,

        vidsrcto: isMovie
            ? `https://vidsrc.to/embed/movie/${TMDB_ID}`
            : `https://vidsrc.to/embed/tv/${TMDB_ID}/${currentS}/${currentE}`,

        twoembed: isMovie
            ? `https://www.2embed.stream/embed/movie/${TMDB_ID}`
            : `https://www.2embed.stream/embed/tv/${TMDB_ID}/${currentS}/${currentE}`,

        moviesapi: isMovie
            ? `https://moviesapi.club/movie/${TMDB_ID}`
            : `https://moviesapi.club/tv/${TMDB_ID}-${currentS}-${currentE}`,

        nontongo: isMovie
            ? `https://www.nontongo.win/embed/movie/${TMDB_ID}`
            : `https://www.nontongo.win/embed/tv/${TMDB_ID}/${currentS}/${currentE}`,
    };
    return urls[server] || urls.vidsrc;
}

// ==========================================
// 🚀 PLAYER
// ==========================================
async function updatePlayer() {
    const player = document.getElementById('main-player');
    const loader = document.getElementById('player-loader');
    if (!player) return;

    if (loader) loader.classList.add('show');
    player.removeAttribute('sandbox');
    player.src = 'about:blank';
    await new Promise(r => setTimeout(r, 120));
    player.src = getServerUrl(currentServer);

    setTimeout(() => {
        if (loader) loader.classList.remove('show');
    }, 3500);

    updateEpTag();
    updateNavButtons();

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('id', TMDB_ID);
    url.searchParams.set('type', TYPE);
    if (TYPE === 'tv') {
        url.searchParams.set('s', currentS);
        url.searchParams.set('e', currentE);
    }
    window.history.replaceState({}, '', url);
}

function updateEpTag() {
    const tag = document.getElementById('current-ep-tag');
    if (!tag) return;
    if (TYPE === 'tv') {
        tag.textContent = `S${String(currentS).padStart(2,'0')} · E${String(currentE).padStart(2,'0')}`;
        tag.style.display = '';
    } else {
        tag.style.display = 'none';
    }
}

function updateNavButtons() {
    const prev = document.getElementById('prev-ep-btn');
    const next = document.getElementById('next-ep-btn');
    if (!prev || !next) return;
    if (TYPE === 'movie') {
        document.getElementById('ep-nav-btns')?.style && (document.getElementById('ep-nav-btns').style.display = 'none');
        return;
    }
    prev.disabled = (currentS === 1 && currentE === 1);
    next.disabled = (currentS === totalSeasons && currentE === totalEpisodes);
}

// ==========================================
// ⏮ PREV / NEXT
// ==========================================
window.prevEpisode = async () => {
    if (currentE > 1) {
        currentE--;
    } else if (currentS > 1) {
        currentS--;
        try {
            const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${currentS}?api_key=${API_KEY}`);
            const d = await res.json();
            currentE = d.episodes?.length || 1;
            totalEpisodes = currentE;
        } catch { currentE = 1; }
        updateSeasonChips();
    }
    await loadEpisodes(currentS);
    updatePlayer();
};

window.nextEpisode = async () => {
    if (currentE < totalEpisodes) {
        currentE++;
    } else if (currentS < totalSeasons) {
        currentS++;
        currentE = 1;
        updateSeasonChips();
        await loadEpisodes(currentS);
    }
    updatePlayer();
    renderEpisodes(allEpisodesData);
};

// ==========================================
// 📋 SHOW INFO
// ==========================================
async function loadShowInfo() {
    try {
        const url = TYPE === 'movie'
            ? `https://api.themoviedb.org/3/movie/${TMDB_ID}?api_key=${API_KEY}`
            : `https://api.themoviedb.org/3/tv/${TMDB_ID}?api_key=${API_KEY}`;

        const res = await fetch(url);
        const d = await res.json();

        const title = d.title || d.name || 'Unknown';
        const year  = (d.release_date || d.first_air_date || '').substring(0, 4);
        const rating = d.vote_average ? d.vote_average.toFixed(1) : '';
        const poster = d.poster_path ? `https://image.tmdb.org/t/p/w200${d.poster_path}` : '';
        const overview = d.overview || '';

        // Title
        const titleEl = document.getElementById('show-title');
        if (titleEl) titleEl.textContent = title;

        const navTitle = document.getElementById('show-title-nav');
        if (navTitle) navTitle.textContent = title;

        document.title = `${title} — AuraFlix`;

        // Tags
        const rEl = document.getElementById('show-rating');
        if (rEl && rating) { rEl.textContent = `⭐ ${rating}`; }

        const yEl = document.getElementById('show-year');
        if (yEl && year) { yEl.textContent = year; }

        const tEl = document.getElementById('show-type');
        if (tEl) { tEl.textContent = TYPE === 'movie' ? '🎬 Movie' : '📺 Series'; }

        // Poster
        const pEl = document.getElementById('show-poster-mini');
        if (pEl && poster) {
            pEl.innerHTML = `<img src="${poster}" alt="${title}">`;
        }

        // Overview
        if (overview) {
            const box = document.getElementById('show-overview-box');
            const txt = document.getElementById('show-overview-text');
            if (box && txt) { txt.textContent = overview; box.style.display = 'block'; }
        }

        if (TYPE === 'tv') totalSeasons = d.number_of_seasons || 1;

    } catch (err) { console.error('Show info:', err); }
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
        const d = await res.json();
        totalSeasons = d.number_of_seasons || 1;
        const seasons = (d.seasons || []).filter(s => s.season_number !== 0);
        renderSeasonChips(seasons);
        await loadEpisodes(currentS);
    } catch(e) { console.error(e); }
}

function renderSeasonChips(seasons) {
    const c = document.getElementById('season-chips');
    if (!c) return;
    c.innerHTML = seasons.map(s => `
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
        const d = await res.json();
        const eps = d.episodes || [];
        totalEpisodes = eps.length;
        allEpisodesData = eps;

        const cEl = document.getElementById('episode-count');
        if (cEl) cEl.textContent = `${eps.length} eps`;

        renderEpisodes(eps);
        updateNavButtons();
    } catch(e) { console.error(e); }
}

function renderEpisodes(episodes) {
    const grid = document.getElementById('episode-grid');
    if (!grid) return;

    grid.innerHTML = episodes.map(epi => {
        const playing = epi.episode_number === currentE;
        const thumb = epi.still_path
            ? `https://image.tmdb.org/t/p/w300${epi.still_path}`
            : `https://via.placeholder.com/300x169/0d0d18/5a5548?text=EP+${epi.episode_number}`;
        const runtime = epi.runtime ? `${epi.runtime}m` : '';
        const rating  = epi.vote_average ? `⭐ ${epi.vote_average.toFixed(1)}` : '';

        return `
        <div class="episode-card ${playing ? 'playing' : ''}"
             onclick="window.playEpisode(${epi.episode_number})">
            <div class="epi-thumb-wrap">
                <img class="epi-thumb" src="${thumb}" loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x169/0d0d18/5a5548?text=No+Preview'">
                <div class="epi-play-overlay">
                    <div class="epi-play-btn">
                        <svg width="10" height="12" viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z"/></svg>
                    </div>
                </div>
                ${playing ? '<span class="playing-tag">▶ NOW PLAYING</span>' : ''}
            </div>
            <div class="epi-info">
                <span class="epi-num">EPISODE ${epi.episode_number}</span>
                <span class="epi-title">${epi.name || `Episode ${epi.episode_number}`}</span>
                <span class="epi-meta">
                    ${runtime ? `<span>${runtime}</span>` : ''}
                    ${rating  ? `<span>${rating}</span>`  : ''}
                </span>
            </div>
        </div>`;
    }).join('');

    // Auto scroll to playing
    setTimeout(() => {
        const playing = grid.querySelector('.playing');
        if (playing) playing.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
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
let searchTimer = null;

document.getElementById('search-input')?.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    const dd = document.getElementById('search-results');
    clearTimeout(searchTimer);

    if (q.length < 2) {
        dd.classList.remove('show');
        dd.innerHTML = '';
        return;
    }

    dd.classList.add('show');
    dd.innerHTML = '<div class="s-loading">Searching...</div>';
    searchTimer = setTimeout(() => doSearch(q), 350);
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
    const dd = document.getElementById('search-results');
    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
        );
        const d = await res.json();
        const items = (d.results || [])
            .filter(i => (i.media_type === 'tv' || i.media_type === 'movie') && i.poster_path)
            .slice(0, 8);

        if (!items.length) {
            dd.innerHTML = '<div class="s-empty">No results found 😔</div>';
            return;
        }

        dd.innerHTML = items.map(item => {
            const title = item.title || item.name || 'Unknown';
            const year  = (item.release_date || item.first_air_date || '').substring(0, 4);
            const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : '';
            return `
            <div class="s-result" onclick="goToPlayer(${item.id}, '${item.media_type}')">
                <img src="https://image.tmdb.org/t/p/w92${item.poster_path}"
                     onerror="this.src='https://via.placeholder.com/44x64/0d0d18/5a5548?text=?'"
                     alt="${title}">
                <div class="s-result-info">
                    <div class="s-result-title">${title}</div>
                    <div class="s-result-meta">${year}${rating ? ' · ' + rating : ''}</div>
                </div>
                <span class="s-badge ${item.media_type}">${item.media_type === 'tv' ? 'TV' : 'Movie'}</span>
            </div>`;
        }).join('');
    } catch {
        dd.innerHTML = '<div class="s-empty">Something went wrong 😕</div>';
    }
}

window.goToPlayer = (id, type) => {
    window.location.href = `index.html?id=${id}&type=${type}`;
};

// ==========================================
// 🔥 BOOT
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadShowInfo();
    if (TYPE === 'tv') {
        await initSeasons();
    } else {
        const col = document.getElementById('episodes-column');
        if (col) col.style.display = 'none';
    }
    updateEpTag();
    updatePlayer();
});
