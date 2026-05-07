export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    const { tmdb, s, e } = req.query;
    if (!tmdb) return res.status(400).json({ error: "Missing params" });

    const embedUrl = `https://vidsrc.me/embed/tv?tmdb=${tmdb}&sea=${s}&epi=${e}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://vidsrc.me/',
        'Cache-Control': 'no-cache'
    };

    try {
        // Step 1: vidsrc.me → data-iframe nikalo
        const pageRes = await fetch(embedUrl, { headers });
        const html = await pageRes.text();

        const dataIframeMatch = html.match(/data-iframe="([^"]+)"/);
        if (!dataIframeMatch) {
            return res.status(200).json({ success: true, embedUrl, type: 'fallback' });
        }

        const playerUrl = `https://vidsrc.me${dataIframeMatch[1]}`;

        // Step 2: Player page → cloudnestra src nikalo
        const playerRes = await fetch(playerUrl, {
            headers: { ...headers, 'Referer': 'https://vidsrc.me/' }
        });
        const playerHtml = await playerRes.text();

        // cloudnestra iframe src extract karo
        const cloudMatch = playerHtml.match(/src="((?:https?:)?\/\/cloudnestra\.com\/rcp\/[^"]+)"/);
        if (!cloudMatch) {
            return res.status(200).json({ success: true, embedUrl, type: 'fallback' });
        }

        let cloudUrl = cloudMatch[1];
        if (cloudUrl.startsWith('//')) cloudUrl = 'https:' + cloudUrl;

        console.log('✅ Cloudnestra URL found:', cloudUrl.substring(0, 80));

        return res.status(200).json({
            success: true,
            embedUrl: cloudUrl,
            type: 'cloudnestra'
        });

    } catch (err) {
        console.log('Error:', err.message);
        return res.status(200).json({ success: true, embedUrl, type: 'error', error: err.message });
    }
}
