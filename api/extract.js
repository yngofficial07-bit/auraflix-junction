export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { tmdb, s, e } = req.query;

    if (!tmdb) return res.status(400).json({ error: "TMDB ID missing" });

    // 🎯 Target: vidsrc.to bypass logic
    const targetUrl = `https://vidsrc.to/embed/tv/${tmdb}/${s}/${e}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://vidsrc.to/',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const html = await response.text();
        
        // 🧪 Biology Logic: Extracting the "DNA" (Source ID) from HTML
        const frameIdMatch = html.match(/data-id="(.*?)"/);
        if (!frameIdMatch) throw new Error("Cell Membrane Breach Failed: ID not found");

        const frameId = frameIdMatch[1];
        
        // Note: Real world resolvers use complex decryption here. 
        // For now, we provide the clean source data back to frontend.
        res.status(200).json({
            success: true,
            sourceId: frameId,
            embedUrl: targetUrl
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
