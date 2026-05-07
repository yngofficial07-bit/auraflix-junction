export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    const { tmdb, s, e } = req.query;
    if (!tmdb) return res.status(400).json({ error: "Missing params" });

    const embedUrl = `https://vidsrc.me/embed/tv?tmdb=${tmdb}&sea=${s}&epi=${e}`;

    try {
        // Step 1: vidsrc.me ka HTML fetch karo
        const pageRes = await fetch(embedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://vidsrc.me/',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Cache-Control': 'no-cache'
            }
        });

        const html = await pageRes.text();

        // Cloudflare ne block kiya?
        if (html.includes('Just a moment') || html.includes('cf-browser-verification')) {
            return res.status(200).json({ success: true, embedUrl, type: 'fallback' });
        }

        // Step 2: Source ID nikalo HTML se
        const idMatch = html.match(/data-id="([^"]+)"/);
        if (!idMatch) {
            return res.status(200).json({ success: true, embedUrl, type: 'fallback' });
        }

        const sourceId = idMatch[1];

        // Step 3: Episode sources fetch karo
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
        if (!sourcesData.result || sourcesData.result.length === 0) {
            return res.status(200).json({ success: true, embedUrl, type: 'fallback' });
        }

        // Step 4: Pehla source ka URL nikalo
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
        const streamUrl = sourceData.result?.url;

        if (streamUrl) {
            return res.status(200).json({
                success: true,
                embedUrl: streamUrl,
                type: 'stream'
            });
        }

        return res.status(200).json({ success: true, embedUrl, type: 'fallback' });

    } catch (err) {
        return res.status(200).json({ success: true, embedUrl, type: 'error' });
    }
}
