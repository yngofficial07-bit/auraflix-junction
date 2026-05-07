export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    const { tmdb, s, e } = req.query;
    if (!tmdb) return res.status(400).json({ error: "Missing params" });

    const embedUrl = `https://vidsrc.me/embed/tv?tmdb=${tmdb}&sea=${s}&epi=${e}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://vidsrc.me/',
        'Cache-Control': 'no-cache'
    };

    try {
        // Step 1: Main page → data-iframe nikalo
        const pageRes = await fetch(embedUrl, { headers });
        const html = await pageRes.text();

        const dataIframeMatch = html.match(/data-iframe="([^"]+)"/);
        if (!dataIframeMatch) {
            return res.status(200).json({ success: true, embedUrl, type: 'no-iframe' });
        }

        const playerUrl = `https://vidsrc.me${dataIframeMatch[1]}`;

        // Step 2: Player page → cloudnestra URL nikalo
        const playerRes = await fetch(playerUrl, {
            headers: { ...headers, 'Referer': 'https://vidsrc.me/' }
        });
        const playerHtml = await playerRes.text();

        // cloudnestra iframe src nikalo
        const cloudnestraMatch = playerHtml.match(/src="(\/\/cloudnestra\.com\/rcp\/[^"]+)"/);
        if (!cloudnestraMatch) {
            return res.status(200).json({ success: true, embedUrl, type: 'no-cloudnestra' });
        }

        const cloudnestraUrl = 'https:' + cloudnestraMatch[1];
        console.log('Cloudnestra URL:', cloudnestraUrl);

        // Step 3: cloudnestra page fetch karo
        const cloudRes = await fetch(cloudnestraUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://vidsrc.me/',
                'Accept': 'text/html,application/xhtml+xml,*/*'
            }
        });
        const cloudHtml = await cloudRes.text();

        // m3u8 ya stream URL patterns
        const streamPatterns = [
            /["']([^"']+\.m3u8[^"']*)['"]/i,
            /file\s*:\s*["']([^"']+)['"]/i,
            /source\s*:\s*["']([^"']+)['"]/i,
            /"url"\s*:\s*"([^"]+)"/i
        ];

        let streamUrl = null;
        for (const pattern of streamPatterns) {
            const match = cloudHtml.match(pattern);
            if (match && match[1] && (match[1].includes('m3u8') || match[1].includes('http'))) {
                streamUrl = match[1];
                break;
            }
        }

        if (streamUrl) {
            return res.status(200).json({
                success: true,
                embedUrl: streamUrl,
                type: 'stream'
            });
        }

        // Agar m3u8 nahi mila, cloudnestra URL return karo (ye iframe-friendly ho sakta hai)
        return res.status(200).json({
            success: true,
            embedUrl: cloudnestraUrl,
            type: 'cloudnestra-embed',
            debug: cloudHtml.substring(0, 300)
        });

    } catch (err) {
        console.log('Error:', err.message);
        return res.status(200).json({ success: true, embedUrl, type: 'error', error: err.message });
    }
}
