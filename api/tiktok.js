// api/tiktok.js
// Integración con la API de omkar.cloud para obtener perfiles de TikTok

export default async function handler(req, res) {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ 
            error: 'Falta el nombre de usuario. Ejemplo: /api/tiktok?username=marvel' 
        });
    }

    try {
        const API_KEY = process.env.OMKAR_API_KEY;

        const response = await fetch(
            `https://tiktok-scraper.omkar.cloud/tiktok/users/profile?handle=${username}`,
            {
                headers: {
                    'API-Key': API_KEY
                }
            }
        );

        const data = await response.json();

        if (response.ok && data.user && data.stats) {
            const profileData = {
                username: data.user.handle || username,
                avatar: data.user.avatar_medium_url || '',
                followers: data.stats.follower_count || 0,
                following: data.stats.following_count || 0,
                likes: data.stats.total_likes || 0,
                display_name: data.user.display_name || '',
                bio: data.user.bio || '',
                verified: data.user.is_verified || false
            };

            res.status(200).json(profileData);
        } else {
            const errorMsg = data.message || 'Usuario no encontrado o error en la API';
            res.status(404).json({ error: errorMsg });
        }

    } catch (error) {
        console.error('Error en la API de omkar.cloud:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al buscar el usuario' 
        });
    }
}