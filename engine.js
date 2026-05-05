const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; // Stranger Things example

async function loadEpisodes(seasonNum) {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
    const data = await response.json();
    
    const grid = document.getElementById('episode-grid');
    grid.innerHTML = ''; // Clear purane episodes

    data.episodes.forEach(epi => {
        const card = document.createElement('div');
        card.className = 'episode-card';
        card.innerHTML = `
            <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path}">
            <div class="epi-info">
                <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                <div class="epi-meta">${epi.runtime || '--'} min</div>
            </div>
        `;
        
        card.onclick = () => playVideo(seasonNum, epi.episode_number);
        grid.appendChild(card);
    });
}

function playVideo(s, e) {
    // Cineb (VidSrc) Mechanism
    const playerUrl = `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&season=${s}&episode=${e}`;
    document.getElementById('main-player').src = playerUrl;
}

// Start with Season 1
loadEpisodes(1);
