export default async function handler(req, res) {
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

        // Log full HTML so we can see structure
        console.log('=== FULL HTML START ===');
        console.log(html);
        console.log('=== FULL HTML END ===');

        if (html.includes('Just a moment') || html.includes('Checking your browser')) {
            return res.status(200).json({ success: true, embedUrl, type: 'cloudflare-blocked' });
        }

        // Try ALL possible patterns
        const patterns = [
            /data-id="([^"]+)"/,
            /data-hash="([^"]+)"/,
            /data-source="([^"]+)"/,
            /data-ep="([^"]+)"/,
            /"episode_id"\s*:\s*"([^"]+)"/,
            /episodeId\s*=\s*['"]([^'"]+)['"]/,
            /embed\/source\/([a-zA-Z0-9]+)/,
            /sources\/([a-zA-Z0-9]+)/
        ];

        let foundId = null;
        let foundPattern = null;
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match) {
                foundId = match[1];
                foundPattern = pattern.toString();
                console.log('Pattern matched:', foundPattern, '→', foundId);
                break;
            }
        }

        if (!foundId) {
            // Return a snippet of HTML so we can see structure
            const snippet = html.replace(/<script[\s\S]*?<\/script>/gi, '[SCRIPT]')
                                .replace(/<style[\s\S]*?<\/style>/gi, '[STYLE]')
                                .substring(0, 2000);
            console.log('No pattern matched. HTML snippet:', snippet);
            return res.status(200).json({ 
                success: true, 
                embedUrl, 
                type: 'no-id',
                htmlSnippet: snippet
            });
        }

        const sourcesRes = await fetch(
            `https://vidsrc.me/ajax/embed/episode/${foundId}/sources`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://vidsrc.me/',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }
        );

        const sourcesData = await sourcesRes.json();
        console.log('Sources response:', JSON.stringify(sourcesData));

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
