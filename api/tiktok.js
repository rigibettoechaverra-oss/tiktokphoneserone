// api/tiktok.js - Proxy para tikwm.com
// Vercel funciona como intermediario para evitar CORS

module.exports = async function handler(req, res) {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Falta username' });

    try {
        const url = `https://www.tikwm.com/api/user/info?unique_id=${username}`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const json = await response.json();

        if (json?.data?.user && json?.data?.stats) {
            const user = json.data.user;
            const stats = json.data.stats;
            return res.status(200).json({
                username: user.uniqueId || username,
                display_name: user.nickname || '',
                avatar: user.avatarMedium || user.avatarThumb || '',
                followers: stats.follower_count || 0,
                following: stats.following_count || 0,
                likes: stats.heart_count || 0,
                videos: stats.video_count || 0,
                bio: user.signature || '',
                verified: user.verified || false,
                source: 'tikwm'
            });
        }

        return res.status(404).json({ error: 'Usuario no encontrado' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};