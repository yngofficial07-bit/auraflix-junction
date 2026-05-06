export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { tmdb, season, episode } = req.query;

    if (!tmdb || !season || !episode) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        // Step 1: vidsrc.to se embed page fetch karo
        const embedUrl = `https://vidsrc.to/embed/tv/${tmdb}/${season}/${episode}`;
        
        const embedRes = await fetch(embedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://vidsrc.to/',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        });

        const html = await embedRes.text();

        // Step 2: Source ID extract karo
        const srcIdMatch = html.match(/data-src="([^"]+)"/);
        if (!srcIdMatch) {
            return res.status(404).json({ error: 'Source not found' });
        }

        const srcId = srcIdMatch[1];

        // Step 3: Actual source URL fetch karo
        const sourceUrl = `https://vidsrc.to/ajax/embed/episode/${srcId}/sources`;
        const sourceRes = await fetch(sourceUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://vidsrc.to/',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const sourceData = await sourceRes.json();

        if (!sourceData.result || sourceData.result.length === 0) {
            return res.status(404).json({ error: 'No sources found' });
        }

        // Step 4: Pehla source lo
        const firstSource = sourceData.result[0];
        const playerUrl = `https://vidsrc.to/ajax/embed/source/${firstSource.id}`;

        const playerRes = await fetch(playerUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://vidsrc.to/',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const playerData = await playerRes.json();

        if (!playerData.result || !playerData.result.url) {
            return res.status(404).json({ error: 'Player URL not found' });
        }

        // Step 5: m3u8 URL return karo
        return res.status(200).json({
            success: true,
            streamUrl: playerData.result.url,
            type: 'hls'
        });

    } catch (error) {
        console.error('Stream fetch error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
