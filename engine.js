// ==============================================================================
// 💀 THE GOD-MODE KERNEL: ROOT-LEVEL ENGINE HIJACK
// ==============================================================================

(function() {
    console.log("⚡ KERNEL PANIC: Indiplex God-Mode Activated.");

    // 1. THE PHANTOM WINDOW (Ultimate Fake-Out)
    // Inka script check karta hai ki popup khula ya nahi. Hum use ek fake "Ghost" window denge.
    const originalOpen = window.open;
    window.open = new Proxy(originalOpen, {
        apply: function(target, thisArg, argumentsList) {
            console.log("🛡️ GOD-MODE: Ad Popup intercepted and neutralized ->", argumentsList[0]);
            // Fake window object returning success metrics so the player unlocks
            return {
                closed: false,
                focus: function() { console.log("Fake focus"); },
                blur: function() {},
                close: function() { this.closed = true; },
                postMessage: function() {},
                document: { readyState: 'complete', write: function() {}, close: function() {} }
            };
        }
    });

    // 2. PROTOTYPE HIJACKING (Event Sanitization)
    // Ye browser ke 'addEventListener' ko hijack karke ads wale clicks ko filter karega
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'click' || type === 'mouseup' || type === 'mousedown') {
            const safeListener = function(e) {
                // Agar event iframe ke bahar se aa raha hai aur suspicious hai, toh maar do
                if (e.target && !e.target.closest('#main-player') && e.isTrusted) {
                    const classId = (e.target.className || '') + (e.target.id || '');
                    if (/(ad|pop|overlay|click|sponsor)/i.test(classId)) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        return;
                    }
                }
                return listener.apply(this, arguments);
            };
            return originalAddEventListener.call(this, type, safeListener, options);
        }
        return originalAddEventListener.call(this, type, listener, options);
    };

    // 3. THE ANTIMATTER OBSERVER
    // DOM mein ghusne wale har naye kachre ko microsecond mein delete karna
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tag = node.tagName.toLowerCase();
                    const zIndex = window.getComputedStyle(node).zIndex;
                    // Nuke anything trying to overlap the player
                    if ((tag === 'div' || tag === 'iframe') && zIndex > 1000 && node.id !== 'main-player') {
                        node.style.setProperty('display', 'none', 'important');
                        node.remove();
                    }
                }
            });
        });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // 4. ANTI-ADBLOCK NEUTRALIZER
    window.adblocker = false;
    window.isAdBlockActive = false;
    Object.defineProperty(window, 'adblocker', { get: () => false, set: () => {} });
})();

// ==============================================================================
// 🎬 INDIPLEX CORE: THE ABYSSAL VOID (ZERO SKIPS, 100% VISUALS)
// ==============================================================================

const API_KEY = '51e8f6fa27967e18cd00a4e246cb4b6b';
const TMDB_ID = '66732'; 
let currentS = 1, currentE = 1, currentServer = 'vidsrc';

async function loadEpisodes(seasonNum) {
    currentS = seasonNum;
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${TMDB_ID}/season/${seasonNum}?api_key=${API_KEY}`);
        const data = await res.json();
        const grid = document.getElementById('episode-grid');
        if(!grid) return;
        
        grid.innerHTML = ''; 
        data.episodes.forEach(epi => {
            const card = document.createElement('div');
            // 💎 THE "EK NUMBER" EFFECTS: 3D Tilt & RGB Glow strictly preserved
            card.className = 'episode-card tilt-effect rgb-glow'; 
            
            card.innerHTML = `
                ${(epi.episode_number === currentE) ? '<div class="playing-tag">PLAYING</div>' : ''}
                <img class="epi-thumb" src="https://image.tmdb.org/t/p/w500${epi.still_path}">
                <div class="epi-info">
                    <div class="epi-title">E${epi.episode_number}: ${epi.name}</div>
                </div>`;
            
            // Core Navigation Logic
            card.onclick = (e) => {
                e.preventDefault();
                currentE = epi.episode_number;
                updatePlayer();
                loadEpisodes(currentS);
            };
            grid.appendChild(card);
        });
    } catch (e) { console.error("🚨 TMDB Core Error"); }
}

function updatePlayer() {
    const player = document.getElementById('main-player');
    const urls = {
        vidsrc: `https://vidsrc.me/embed/tv?tmdb=${TMDB_ID}&season=${currentS}&episode=${currentE}`,
        vidlink: `https://vidlink.pro/tv/${TMDB_ID}/${currentS}/${currentE}`,
        moviesapi: `https://moviesapi.club/tv/${TMDB_ID}-${currentS}-${currentE}`,
        videasy: `https://player.vidsrc.nl/embed/tv/${TMDB_ID}/${currentS}/${currentE}`
    };
    
    if (player) {
        player.src = urls[currentServer];
        
        // 🛡️ THE CHROMIUM ENGINE LOCK
        // Ye browser engine ko force karta hai ki iframe koi naya tab khol hi na sake (allow-popups MISSING hai)
        // Lekin baaki sab allow karta hai taaki video play ho.
        player.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
        
        // Auto-Focus for Immediate Keyboard Control (Space to Play/Pause)
        player.onload = () => {
            setTimeout(() => { player.focus(); }, 500);
        };
    }
}

function switchServer(s) { 
    currentServer = s; 
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase().includes(s));
    });
    updatePlayer(); 
}

document.addEventListener('DOMContentLoaded', () => {
    loadEpisodes(1);
    updatePlayer();
});

// ⚡ THE MASTER KEY: FORCE FOCUS LOOP
// Agar click block ho jaye, toh Spacebar/Arrows se control humesha active rahega
setInterval(() => {
    const player = document.getElementById('main-player');
    if(player && document.activeElement !== player) {
        // Keeps the player ready for keyboard commands
        player.focus();
    }
}, 2000);
