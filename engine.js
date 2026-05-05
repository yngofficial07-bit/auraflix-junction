// ==========================================
// 🛡️ INDIPLEX: THE REMOTE CONTROL (V11)
// ==========================================

(function() {
    // 1. INVISIBLE SHIELD (Player ke upar hamara control)
    const setupRemote = () => {
        const player = document.getElementById('main-player');
        if (!player) return;

        // Hum player ke andar key-commands bhejenge
        // Zyada tar servers 'Space' for play/pause aur 'Arrows' for seeking support karte hain
        window.addEventListener('keydown', (e) => {
            const iframe = document.getElementById('main-player');
            if (!iframe) return;

            // Jab tu player area mein ho, tab ye keys seedha iframe ko milengi
            // Isse ads trigger nahi honge kyunki ye "Physical Click" nahi hai
            iframe.contentWindow.postMessage({
                'event': 'command',
                'func': e.key === ' ' ? 'playVideo' : '' 
            }, '*');
            
            // Sabse best tareeka: Focus shift karke physical keys bhejna
            iframe.focus();
        });
    };

    // 2. THE CLICK-THROUGH TUNNEL (Vidsrc/Vidlink Special)
    // Ye function har us popup generator ko kill karega jo click par banta hai
    const killPopupGenerator = () => {
        if (window.open !== null) {
            window.open = function() {
                console.log("🚫 Remote: Ad popup blocked while controlling player!");
                return { closed: true, focus: () => {}, close: () => {} };
            };
        }
    };

    // 3. FORCE PLAYER INTERACTION
    // Agar controls lock hain, toh ye unhe "Physical Force" se unlock karega
    const unlockControls = () => {
        const player = document.getElementById('main-player');
        if(player) {
            player.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');
            player.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin allow-presentation');
        }
    };

    setInterval(() => {
        killPopupGenerator();
        unlockControls();
    }, 1000);

    document.addEventListener('DOMContentLoaded', setupRemote);
})();

// ==========================================
// 🎬 INDIPLEX CORE (Keeping your T-shirt/YouTube goals & project intact)
// ==========================================
// - Bio strong, Physics numericals work in progress. Ryzen/RTX PC fan. 

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

// Baaki saara logic (loadEpisodes, updatePlayer) vahi 'Ek Number' wala rahega
// Bas player ka logic thoda upgrade kar diya hai

function updatePlayer() {
    const player = document.getElementById('main-player');
    if (!player) return;

    const urls = {
        vidsrc: `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&season=${currentS}&episode=${currentE}`,
        vidlink: `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}`,
        videasy: `https://player.vidsrc.nl/embed/tv/${TMDB_ID}/${currentS}/${currentE}`
    };
    
    player.src = urls[currentServer];
    // Focus player for immediate keyboard control
    player.onload = () => { player.focus(); };
}
