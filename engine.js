const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; // Stranger Things (Example)

let currentS = 1;
let currentE = 1;
let currentServer = 'vidsrc'; // Default server

// 1. Episodes Load karne ka function
async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    const response = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
    const data = await response.json();
    
    const grid = document.getElementById('episode-grid');
    grid.innerHTML = ''; 

    data.episodes.forEach(epi => {
        const card = document.createElement('div');
        card.className = 'episode-card';
        // Agar ye episode chal raha hai toh badge dikhao
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
            loadEpisodes(currentS); // Refresh cards to show "PLAYING" badge
        };
        grid.appendChild(card);
    });
}

// 2. Server Switch karne ka function
function switchServer(serverType) {
    currentServer = serverType;
    
    // UI Update: Button highlight
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('onclick').includes(serverType)) {
            btn.classList.add('active');
        }
    });

    updatePlayer();
}

// 3. Player URL update karne ka main logic
function updatePlayer() {
    const player = document.getElementById('main-player');
    let url = "";

    if(currentServer === 'vidsrc') {
        url = `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&season=${currentS}&episode=${currentE}`;
    } else if(currentServer === 'vidlink') {
        url = `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}`;
    } else if(currentServer === 'moviesapi') {
        url = `https://moviesapi.club/tv/${TMDB_ID}-${currentS}-${currentE}`;
    } else if(currentServer === 'videasy') {
        url = `https://player.vidsrc.nl/embed/tv/${TMDB_ID}/${currentS}/${currentE}`;
    }
    
    player.src = url;
}

// Initial Load
loadEpisodes(1);
updatePlayer();
