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
        // Step 1: Main page fetch
        const pageRes = await fetch(embedUrl, { headers });
        const html = await pageRes.text();

        if (html.includes('Just a moment') || html.includes('Checking your browser')) {
            return res.status(200).json({ success: true, embedUrl, type: 'cf-blocked' });
        }

        // Step 2: data-iframe extract karo (ye hai actual player URL)
        const dataIframeMatch = html.match(/data-iframe="([^"]+)"/);
        if (!dataIframeMatch) {
            console.log('No data-iframe found');
            return res.status(200).json({ success: true, embedUrl, type: 'no-iframe' });
        }

        const playerPath = dataIframeMatch[1];
        const playerUrl = `https://vidsrc.me${playerPath}`;
        console.log('Player URL:', playerUrl);

        // Step 3: Actual player page fetch karo
        const playerRes = await fetch(playerUrl, {
            headers: {
                ...headers,
                'Referer': 'https://vidsrc.me/'
            }
        });
        const playerHtml = await playerRes.text();
        console.log('Player HTML (first 1000):', playerHtml.substring(0, 1000));

        // Step 4: Stream URL patterns try karo
        const streamPatterns = [
            /file\s*:\s*["']([^"']+\.m3u8[^"']*)['"]/i,
            /src\s*:\s*["']([^"']+\.m3u8[^"']*)['"]/i,
            /source\s*:\s*["']([^"']+\.m3u8[^"']*)['"]/i,
            /"url"\s*:\s*"([^"]+\.m3u8[^"]*)"/i,
            /https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i
        ];

        let streamUrl = null;
        for (const pattern of streamPatterns) {
            const match = playerHtml.match(pattern);
            if (match) {
                streamUrl = match[1] || match[0];
                console.log('Stream found:', streamUrl);
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

        // Step 5: Agar m3u8 nahi mila, player URL hi return karo
        console.log('No stream in player HTML, returning player URL');
        return res.status(200).json({
            success: true,
            embedUrl: playerUrl,
            playerHtmlSnippet: playerHtml.substring(0, 500),
            type: 'player-url'
        });

    } catch (err) {
        console.log('Error:', err.message);
        return res.status(200).json({ success: true, embedUrl, type: 'error', error: err.message });
    }
}
