export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { tmdb, s, e } = req.query;

    if (!tmdb) return res.status(400).json({ error: "TMDB ID missing" });

    // 🎯 Target 1: Vidlink (Current favorite for ad-free devs)
    const vidlinkUrl = `https://vidlink.pro/tv/${tmdb}/${s}/${e}`;
    
    // 🎯 Target 2: Vidsrc.me (Older but gold)
    const vidsrcMeUrl = `https://vidsrc.me/embed/tv?tmdb=${tmdb}&sea=${s}&epi=${e}`;

    try {
        // Hum Vidlink ko as a primary source use karenge kyunki wo 
        // Vercel se jaldi block nahi hota.
        const response = await fetch(vidlinkUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Referer': 'https://vidlink.pro/',
            }
        });

        // Agar Vidlink load ho gaya, toh hum seedha uske embed ko use karenge
        // kyunki wo bohot clean hai.
        res.status(200).json({
            success: true,
            provider: "vidlink",
            embedUrl: vidlinkUrl,
            fallbackUrl: vidsrcMeUrl
        });

    } catch (error) {
        res.status(500).json({ error: "Ghost Protocol compromised: " + error.message });
    }
}
