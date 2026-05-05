let clickCount = 0;
const shield = document.getElementById('ad-shield');

// 1. MANUAL SHIELD LOGIC (Invisible Wall)
if (shield) {
    shield.onclick = function() {
        clickCount++;
        console.log(`AuraFlix Shield: Click ${clickCount} captured!`);
        if (clickCount >= 2) {
            shield.classList.add('hidden'); // 2 clicks ke baad rasta saaf
            console.log("Shield Disabled. Enjoy the show!");
        }
    };
}

// 2. AD NUKER (Background Script Cleaning)
const adNuker = new MutationObserver(() => {
    const forbiddenPatterns = ['doubleclick', 'adsystem', 'popcash', 'onclickads', 'propush', 'script.js'];
    document.querySelectorAll('iframe, script').forEach(el => {
        const src = el.src || '';
        if (forbiddenPatterns.some(pattern => src.includes(pattern))) {
            el.remove();
            console.log("AuraFlix Shield: Ad Blocked!");
        }
    });
});
adNuker.observe(document.body, { childList: true, subtree: true });

// 3. SMART SNIPER (Pop-up Terminator)
window.open = (function(origOpen) {
    return function(url, name, features) {
        const newWin = origOpen.apply(window, arguments);
        if (newWin) {
            setTimeout(() => {
                newWin.close(); // Khulte hi khatam
                window.focus(); // Wapas focus apni site par
            }, 100); 
        }
        return newWin;
    };
})(window.open);

// 4. SANDBOXING (REMOVED FOR PLAYBACK)
const playerIframe = document.getElementById('main-player');
if (playerIframe) {
   // Humne sandbox hata diya hai taaki "Disable Sandbox" wala error na aaye
   playerIframe.removeAttribute('sandbox'); 
   console.log("AuraFlix Shield: Sandbox removed for smooth playback.");
}

// --- TMDB CONFIG & STREAMING LOGIC ---
const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; // Stranger Things (Example)

let currentS = 1;
let currentE = 1;
let currentServer = 'vidsrc'; 

// Function: Load Episodes from TMDB
async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    const response = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
    const data = await response.json();
    
    const grid = document.getElementById('episode-grid');
    grid.innerHTML = ''; 

    data.episodes.forEach(epi => {
        const card = document.createElement('div');
        card.className = 'episode-card';
        // 'PLAYING' badge agar current episode hai
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
            loadEpisodes(currentS); // Refresh UI to show new playing badge
        };
        grid.appendChild(card);
    });
}

// Function: Switch Servers
function switchServer(serverType) {
    currentServer = serverType;
    
    // UI Update: Active class switch
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.remove('active');
        // Match button by its onclick function string
        if(btn.outerHTML.includes(serverType)) {
            btn.classList.add('active');
        }
    });

    updatePlayer();
}

// Function: Update Player Iframe URL
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

// --- INITIAL KICKSTART ---
loadEpisodes(1);
updatePlayer();
