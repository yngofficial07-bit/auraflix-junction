export default async function handler(req, res) {
    // 🛡️ Ye lines browser ko block karne se rokengi
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle Preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { tmdb, s, e } = req.query;
    if (!tmdb) return res.status(400).json({ error: "TMDB ID missing" });

    const vidlinkUrl = `https://vidlink.pro/tv/${tmdb}/${s}/${e}`;
    const vidsrcMeUrl = `https://vidsrc.me/embed/tv?tmdb=${tmdb}&sea=${s}&epi=${e}`;

    try {
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
