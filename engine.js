// ==========================================
// 🎬 INDIPLEX ENGINE - INTERCEPTOR v3.5
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732';
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

// ==========================================
// 🛡️ ADVANCED AD-BLOCKER & POPUP HIJACK
// ==========================================
(function blockAds() {
    const AD_DOMAINS = [
        'googlesyndication', 'doubleclick', 'googleadservices',
        'adservice', 'amazon-adsystem', 'ads.', 'ad.', 'adserver',
        'popads', 'popcash', 'trafficjunky', 'exoclick', 'juicyads',
        'adsterra', 'propellerads', 'hilltopads', 'adcash',
        'valueimpression', 'revcontent', 'taboola', 'outbrain',
        'popunder', 'clickunder', 'go.oclasrv', 'adskeeper',
        'bidvertiser', 'adclick', 'onclick', 'onclickads',
        'sublimemedia', 'adnium', 'plugrush', 'trafficstars',
        'hilltopads', 'richpush', 'pushground', 'evadav',
        'dataprovider', 'mgid', 'content.ad', 'zedo',
        'ero-advertising', 'tubecorporate', 'trafficfactory'
    ];

    // Popup Hijack
    const _open = window.open.bind(window);
    window.open = function(url, ...args) {
        if (!url) return null;
        const isAd = AD_DOMAINS.some(d => url.includes(d));
        if (isAd) {
            console.log('🛡️ Ad blocked:', url);
            return { closed: false, focus: ()=>{}, close: ()=>{}, location: { href: '' } };
        }
        return _open(url, ...args);
    };

    // Fake click simulation - popup trigger block
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'IFRAME') {
            e.stopPropagation();
        }
    }, true);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                const src = node.src || node.href || '';
                const isAdNode = AD_DOMAINS.some(d => src.includes(d));
                const isAdClass = ['pop-under','overlay-ad','ad-container','ad-overlay']
                    .some(c => node.className && node.className.includes(c));
                if (isAdNode || isAdClass) {
                    node.remove();
                    console.log('🛡️ Ad element removed');
                }
            });
        });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
})();

// ==========================================
// 📺 PLAYER & M3U8 SNIFFER LOGIC
// ==========================================
async function updatePlayer() {
    const player = document.getElementById('main-player');
    if (!player) return;

    player.src = ''; // Flush old content

    // Hum Vidlink ko default banate hain kyunki wo m3u8 extract hone deta hai
    const urls = {
        vidsrc: `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&sea=${currentS}&epi=${currentE}`,
        vidlink: `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}?primaryColor=ffffff&autoplay=true`,
        vidsrccc: `https://vidsrc.cc/v2/embed/tv/${TMDB_ID}/${currentS}/${currentE}`
    };

    const targetUrl = urls[currentServer] || urls.vidsrc;
    
    // Yahan hum surgical extraction try karte hain
    try {
        const response = await fetch(`/api/extract?tmdb=${TMDB_ID}&s=${currentS}&e=${currentE}`);
        const data = await response.json();
        
        if (data.success && data.m3u8Url) {
            // Agar m3u8 mil gaya, toh apne clean player.html mein load karo
            player.src = `player.html?source=${encodeURIComponent(data.m3u8Url)}`;
        } else {
            // Fallback to direct embed if extraction fails
            player.src = targetUrl;
        }
    } catch (e) {
        player.src = targetUrl;
    }
}

// ==========================================
// SEASONS & EPISODES (Intact - No changes)
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
    } catch (error) { console.error('Season Error:', error); }
}

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
        const data = await res.json();
        const grid = document.getElementById('episode-grid');
        const countEl = document.getElementById('episode-count');
        if (!grid) return;
        if (countEl) countEl.textContent = `${data.episodes.length} episodes`;
        grid.innerHTML = '';
        data.episodes.forEach(epi => {
            const card = document.createElement('div');
            card.className = 'episode-card';
            const thumb = epi.still_path ? `https://image.tmdb.org/t/p/w500${epi.still_path}` : 'https://via.placeholder.com/500x281?text=No+Preview';
            card.innerHTML = `
                ${epi.episode_number === currentE ? '<div class="playing-tag">PLAYING</div>' : ''}
                <img class="epi-thumb" src="${thumb}" loading="lazy">
                <div class="epi-info">
                    <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                    <div class="epi-meta">${epi.runtime ? epi.runtime + ' min' : ''} ${epi.vote_average ? '⭐ ' + epi.vote_average.toFixed(1) : ''}</div>
                </div>`;
            card.onclick = () => {
                currentE = epi.episode_number;
                updatePlayer();
                loadEpisodes(currentS);
            };
            grid.appendChild(card);
        });
    } catch (e) { console.error('Episode Error:', e); }
}

function switchServer(s) {
    currentServer = s;
    document.querySelectorAll('.server-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.server-btn[data-server="${s}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    updatePlayer();
}

document.addEventListener('DOMContentLoaded', () => {
    initSeasons();
    updatePlayer();
});
