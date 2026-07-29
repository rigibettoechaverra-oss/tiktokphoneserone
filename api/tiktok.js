// api/tiktok.js - Obtiene datos REALES de TikTok via tikwm.com
// Funciona comprobado: devuelve avatar, followers, following, likes reales

module.exports = async function handler(req, res) {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Falta username' });

    const user = username.replace('@', '').trim().toLowerCase();
    if (!user) return res.status(400).json({ error: 'Usuario inválido' });

    try {
        const response = await fetch(
            `https://www.tikwm.com/api/user/info?unique_id=${user}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );

        const json = await response.json();

        if (json?.data?.user && json?.data?.stats) {
            const u = json.data.user;
            const s = json.data.stats;
            return res.status(200).json({
                username: '@' + (u.uniqueId || user),
                display_name: u.nickname || user,
                avatar: u.avatarMedium || u.avatarLarger || u.avatarThumb || '',
                followers: s.followerCount || 0,
                following: s.followingCount || 0,
                likes: s.heartCount || 0,
                videos: s.videoCount || 0,
                bio: u.signature || '',
                verified: u.verified || false,
                source: 'tikwm'
            });
        }

        return res.status(404).json({ error: 'Usuario no encontrado en TikTok' });
    } catch (error) {
        return res.status(500).json({ error: 'Error: ' + error.message });
    }
};