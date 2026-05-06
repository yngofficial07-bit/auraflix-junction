export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { tmdb, season, episode } = req.query;

    if (!tmdb || !season || !episode) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        // vidsrc.to API endpoints
        const episodeUrl = `https://vidsrc.to/ajax/episode/info?tmdbId=${tmdb}&type=tv&season=${season}&episode=${episode}`;
        
        const episodeRes = await fetch(episodeUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://vidsrc.to/',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const episodeData = await episodeRes.json();

        if (!episodeData.result) {
            return res.status(404).json({ error: 'Episode not found' });
        }

        const episodeId = episodeData.result.id;
        const sourcesUrl = `https://vidsrc.to/ajax/episode/sources/${episodeId}`;
        
        const sourcesRes = await fetch(sourcesUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://vidsrc.to/',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const sourcesData = await sourcesRes.json();

        if (!sourcesData.result || sourcesData.result.length === 0) {
            return res.status(404).json({ error: 'No sources found' });
        }

        return res.status(200).json({
            success: true,
            sources: sourcesData.result
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
