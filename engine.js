// 1. NUCLEAR AD-BLOCKER (Brave Engine Clone)
const blockAds = () => {
    // Ye list un domains ko target karti hai jo background mein popup kholte hain
    const adPatterns = ['pop', 'xtra', 'click', 'double', 'adsystem', 'propush', 'syndication'];
    
    document.querySelectorAll('iframe, script, a, div').forEach(el => {
        const source = el.src || el.href || el.id || el.className || '';
        if (adPatterns.some(pattern => source.toLowerCase().includes(pattern))) {
            // Agar element player nahi hai aur ad jaisa dikh raha hai, toh uda do
            if (el.id !== 'main-player') {
                el.remove();
            }
        }
    });
};

// Har 300ms mein scan karega (Pehle se tez)
setInterval(blockAds, 300);

// 2. THE CLICK-JACKER RADAR (Sabse Important)
// Ye har us invisible layer ko detect karega jo player ke upar banti hai click lene ke liye
document.addEventListener('mousedown', (e) => {
    const target = e.target;
    // Agar click player par nahi hai, par wo pure screen par faila hua hai (ads ki technique)
    if (target.id !== 'main-player' && (target.offsetWidth >= window.innerWidth * 0.5)) {
        console.log("🛡️ Shield: Invisible Ad-Layer neutralized!");
        target.style.pointerEvents = 'none'; // Click ko pass hone do
        target.remove(); // Layer uda do
    }
}, true);

// 3. POP-UP KILLER (No mercy)
window.open = function() { return null; };

// 4. TMDB & SERVER LOGIC (With 3D Hover/Animations kept intact)
const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; // Stranger Things
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    const response = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
    const data = await response.json();
    const grid = document.getElementById('episode-grid');
    grid.innerHTML = ''; 

    data.episodes.forEach(epi => {
        const card = document.createElement('div');
        // INDIPLEX project ke 3D/RGB elements intact rakhe hain
        card.className = 'episode-card tilt-effect rgb-glow'; 
        const playingBadge = (epi.episode_number === currentE) ? '<div class="playing-tag">PLAYING</div>' : '';
        
        card.innerHTML = `
            ${playingBadge}
            <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path}">
            <div class="epi-info">
                <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                <div class="epi-meta">${epi.runtime || '--'} min</div>
            </div>
        `;
        
        card.onclick = () => {
            currentE = epi.episode_number;
            updatePlayer();
            loadEpisodes(currentS); 
        };
        grid.appendChild(card);
    });
}

function updatePlayer() {
    const player = document.getElementById('main-player');
    const urls = {
        vidsrc: `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&season=${currentS}&episode=${currentE}`,
        vidlink: `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}`,
        moviesapi: `https://moviesapi.club/tv/${TMDB_ID}-${currentS}-${currentE}`
    };
    player.src = urls[currentServer];
}

function switchServer(s) { 
    currentServer = s; 
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.toLowerCase().includes(s)) btn.classList.add('active');
    });
    updatePlayer(); 
}

loadEpisodes(1);
updatePlayer();
