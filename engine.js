// ==========================================
// 🛡️ THE HIJACKER: EVENT INTERCEPTION TECH
// ==========================================

(function() {
    // 1. HIJACKING THE BROWSER'S EAR (addEventListener)
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'click' || type === 'mousedown' || type === 'mouseup') {
            const wrappedListener = function(e) {
                // Agar click kisi aisi jagah ho raha hai jo player nahi hai...
                // Aur wo click ad-related domains ya popups trigger kar raha hai...
                if (e.target && !e.target.closest('#main-player') && !e.target.closest('#episode-grid')) {
                    const isShady = /pop|click|ad|link/i.test(e.target.className + e.target.id);
                    if (isShady) {
                        console.log("🛡️ Hijacker: Neutralized a shady event.");
                        e.stopImmediatePropagation(); // Event ko yahi khatam karo
                        return;
                    }
                }
                // Agar sab theek hai, toh original function chalne do
                return listener.apply(this, arguments);
            };
            return originalAddEventListener.call(this, type, wrappedListener, options);
        }
        return originalAddEventListener.call(this, type, listener, options);
    };

    // 2. THE "FAKE-AD" FLAG (Bypassing Anti-Adblock)
    // Ye code player ko jhoot bolega ki "Haan, ad chal raha hai"
    window.canRunAds = true;
    window.isAdBlocked = false;
    window.adsAllowed = true;
})();

// ==========================================
// 🎬 INDIPLEX CORE (No Features Skipped)
// ==========================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
    const data = await res.json();
    const grid = document.getElementById('episode-grid');
    if(!grid) return;
    
    grid.innerHTML = ''; 
    data.episodes.forEach(epi => {
        const card = document.createElement('div');
        card.className = 'episode-card tilt-effect rgb-glow'; // 3D/RGB Effects
        card.innerHTML = `
            ${(epi.episode_number === currentE) ? '<div class="playing-tag">PLAYING</div>' : ''}
            <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path}">
            <div class="epi-info">
                <div class="epi-title">E${epi.episode_number}</div>
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
        videasy: `https://player.vidsrc.nl/embed/tv/${TMDB_ID}/${currentS}/${currentE}`
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

// Global Purge (Cleanup unwanted scripts)
setInterval(() => {
    document.querySelectorAll('script[src*="frs2c"], script[src*="wiestunvote"]').forEach(s => s.remove());
}, 2000);

document.addEventListener('DOMContentLoaded', () => {
    loadEpisodes(1);
    updatePlayer();
});
