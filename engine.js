// 1. BRAVE-STYLE REQUEST BLOCKER
const AD_BLOCK_LIST = [
    'popcash.net', 'propellerads.com', 'adsterra.com', 'doubleclick.net',
    'onclickads.net', 'exoclick.com', 'juicyads.com', 'daisyad.com'
];

const blockAds = () => {
    document.querySelectorAll('script, iframe, a').forEach(el => {
        const source = el.src || el.href || '';
        if (AD_BLOCK_LIST.some(adDomain => source.includes(adDomain))) {
            el.remove();
        }
    });
};
setInterval(blockAds, 500);

// 2. THE "POP-UP KILLER" (Sniper 2.0)
window.open = function() { 
    console.log("🚫 Sniper: Pop-up attempt blocked!");
    return null; 
};

// 3. TRANSPARENT OVERLAY NUKER
document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.id !== 'main-player' && (target.offsetWidth > window.innerWidth * 0.9)) {
        target.remove();
    }
}, true);

// 4. TMDB & SERVER LOGIC + ANIMATIONS
const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 

let currentS = 1;
let currentE = 1;
let currentServer = 'vidsrc'; 

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    const response = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
    const data = await response.json();
    const grid = document.getElementById('episode-grid');
    grid.innerHTML = ''; 

    data.episodes.forEach(epi => {
        const card = document.createElement('div');
        // RGB aur 3D Hover ke liye classes intact rakhi hain
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

function switchServer(serverType) {
    currentServer = serverType;
    // Server UI logic fix
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.toLowerCase().includes(serverType)) {
            btn.classList.add('active');
        }
    });
    updatePlayer();
}

function updatePlayer() {
    const player = document.getElementById('main-player');
    let url = "";
    if(currentServer === 'vidsrc') url = `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&season=${currentS}&episode=${currentE}`;
    else if(currentServer === 'vidlink') url = `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}`;
    else if(currentServer === 'moviesapi') url = `https://moviesapi.club/tv/${TMDB_ID}-${currentS}-${currentE}`;
    
    player.src = url;
}

// Initial Load
loadEpisodes(1);
updatePlayer();
