// api/tiktok.js - CommonJS compatible
// Integración con omkar.cloud para perfiles de TikTok

module.exports = async function handler(req, res) {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Falta username' });
    }

    try {
        const API_KEY = process.env.OMKAR_API_KEY;
        const url = `https://tiktok-scraper.omkar.cloud/tiktok/users/profile?handle=${username}`;

        const response = await fetch(url, {
            headers: { 'API-Key': API_KEY }
        });

        const data = await response.json();

        if (response.ok && data.user && data.stats) {
            return res.status(200).json({
                username: data.user.handle || username,
                avatar: data.user.avatar_medium_url || '',
                followers: data.stats.follower_count || 0,
                following: data.stats.following_count || 0,
                likes: data.stats.total_likes || 0,
                display_name: data.user.display_name || '',
                bio: data.user.bio || '',
                verified: data.user.is_verified || false,
                source: 'omkar'
            });
        }

        return res.status(404).json({ error: 'Usuario no encontrado', data: data });
    } catch (error) {
        return res.status(500).json({ error: 'Error interno: ' + error.message });
    }
};