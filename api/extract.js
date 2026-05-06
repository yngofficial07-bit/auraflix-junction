export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { tmdb, s, e } = req.query;
    if (!tmdb) return res.status(400).json({ error: "Missing params" });

    // vidsrc.me sabse iframe-friendly aur stable hai
    return res.status(200).json({
        success: true,
        embedUrl: `https://vidsrc.me/embed/tv?tmdb=${tmdb}&sea=${s}&epi=${e}`
    });
}
