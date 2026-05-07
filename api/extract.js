export default async function handler(req, res) {
    // No cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    const { tmdb, s, e } = req.query;
    if (!tmdb) return res.status(400).json({ error: "Missing params" });

    const embedUrl = `https://vidsrc.me/embed/tv?tmdb=${tmdb}&sea=${s}&epi=${e}`;

    try {
        const pageRes = await fetch(embedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://vidsrc.me/',
                'Cache-Control': 'no-cache'
            }
        });

        const html = await pageRes.text();
        
        // Log first 500 chars for debugging
        console.log('HTML preview:', html.substring(0, 500));

        if (html.includes('Just a moment') || html.includes('cf-browser-verification') || html.includes('Checking your browser')) {
            console.log('Cloudflare blocked');
            return res.status(200).json({ success: true, embedUrl, type: 'cloudflare-blocked' });
        }

        const idMatch = html.match(/data-id="([^"]+)"/);
        if (!idMatch) {
            console.log('No data-id found');
            return res.status(200).json({ success: true, embedUrl, type: 'no-id' });
        }

        const sourceId = idMatch[1];
        console.log('Source ID:', sourceId);

        const sourcesRes = await fetch(
            `https://vidsrc.me/ajax/embed/episode/${sourceId}/sources`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://vidsrc.me/',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }
        );

        const sourcesData = await sourcesRes.json();
        console.log('Sources:', JSON.stringify(sourcesData));

        if (!sourcesData.result || sourcesData.result.length === 0) {
            return res.status(200).json({ success: true, embedUrl, type: 'no-sources' });
        }

        const firstSource = sourcesData.result[0];
        const sourceRes = await fetch(
            `https://vidsrc.me/ajax/embed/source/${firstSource.id}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://vidsrc.me/',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }
        );

        const sourceData = await sourceRes.json();
        console.log('Source data:', JSON.stringify(sourceData));

        const streamUrl = sourceData.result?.url;

        if (streamUrl) {
            return res.status(200).json({ success: true, embedUrl: streamUrl, type: 'stream' });
        }

        return res.status(200).json({ success: true, embedUrl, type: 'no-stream-url' });

    } catch (err) {
        console.log('Error:', err.message);
        return res.status(200).json({ success: true, embedUrl, type: 'error', error: err.message });
    }
}
