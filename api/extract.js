export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    const { tmdb, s, e } = req.query;
    if (!tmdb) return res.status(400).json({ error: "Missing params" });

    const embedUrl = `https://vidsrc.me/embed/tv?tmdb=${tmdb}&sea=${s}&epi=${e}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://vidsrc.me/',
        'Cache-Control': 'no-cache'
    };

    try {
        // Step 1: Main page
        const pageRes = await fetch(embedUrl, { headers });
        const html = await pageRes.text();

        if (html.includes('Just a moment') || html.includes('Checking your browser')) {
            return res.status(200).json({ success: true, embedUrl, type: 'cf-blocked' });
        }

        const dataIframeMatch = html.match(/data-iframe="([^"]+)"/);
        if (!dataIframeMatch) {
            return res.status(200).json({ success: true, embedUrl, type: 'no-iframe' });
        }

        const playerUrl = `https://vidsrc.me${dataIframeMatch[1]}`;

        // Step 2: Player page
        const playerRes = await fetch(playerUrl, {
            headers: { ...headers, 'Referer': 'https://vidsrc.me/' }
        });
        const playerHtml = await playerRes.text();

        // Return FULL player HTML for analysis
        return res.status(200).json({
            success: true,
            playerUrl,
            fullHtml: playerHtml,
            type: 'debug'
        });

    } catch (err) {
        return res.status(200).json({ success: true, embedUrl, type: 'error', error: err.message });
    }
}
