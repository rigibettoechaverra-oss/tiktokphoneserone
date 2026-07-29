// api/tiktok.js - Scrapea tikvib.com para obtener datos reales de perfiles TikTok
// tikvib.com muestra fotos, seguidores, seguidos y likes de cualquier usuario

module.exports = async function handler(req, res) {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Falta username' });

    const user = username.replace('@', '').trim().toLowerCase();
    if (!user) return res.status(400).json({ error: 'Usuario inválido' });

    try {
        // Obtener la página del perfil en tikvib.com
        const response = await fetch(`https://www.tikvib.com/${user}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        if (!response.ok) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const html = await response.text();

        // Extraer los datos del JSON que tikvib incrusta en la página
        // Buscar patrones como: "followerCount":12345
        const followers = extraerNumero(html, /"followerCount"\s*:\s*(\d+)/);
        const following = extraerNumero(html, /"followingCount"\s*:\s*(\d+)/);
        const likes = extraerNumero(html, /"heartCount"\s*:\s*(\d+)/);
        const videos = extraerNumero(html, /"videoCount"\s*:\s*(\d+)/);

        // Extraer avatar
        const avatarMatch = html.match(/avatar(?:Larger|Medium|Thumb)"\s*:\s*"([^"]+)"/);
        const avatar = avatarMatch ? avatarMatch[1].replace(/\\u002F/g, '/').replace(/\\\//g, '/') : '';

        // Extraer nickname
        const nickMatch = html.match(/"nickname"\s*:\s*"([^"]+)"/);
        const nickname = nickMatch ? nickMatch[1] : user;

        // Extraer uniqueId
        const idMatch = html.match(/"uniqueId"\s*:\s*"([^"]+)"/);
        const uniqueId = idMatch ? idMatch[1] : user;

        // Extraer bio
        const bioMatch = html.match(/"signature"\s*:\s*"([^"]+)"/);
        const bio = bioMatch ? bioMatch[1] : '';

        // Extraer verified
        const verifiedMatch = html.match(/"verified"\s*:\s*(true|false)/);
        const verified = verifiedMatch ? verifiedMatch[1] === 'true' : false;

        return res.status(200).json({
            username: '@' + uniqueId,
            display_name: nickname,
            avatar: avatar,
            followers: followers,
            following: following,
            likes: likes,
            videos: videos,
            bio: bio,
            verified: verified,
            source: 'tikvib'
        });

    } catch (error) {
        return res.status(500).json({ error: 'Error: ' + error.message });
    }
};

function extraerNumero(html, regex) {
    const match = html.match(regex);
    return match ? parseInt(match[1]) || 0 : 0;
}