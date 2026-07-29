// Función serverless para Vercel
// Obtiene datos del perfil público de TikTok scraping la página

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { user } = req.query;
  
  if (!user) {
    return res.status(400).json({ error: 'Falta el parámetro "user"' });
  }
  
  // Limpiar el nombre de usuario
  const username = user.replace('@', '').trim().toLowerCase();
  
  if (!username) {
    return res.status(400).json({ error: 'Usuario inválido' });
  }
  
  try {
    // Intentar obtener datos de TikTok
    const data = await scrapeTikTokProfile(username);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error scraping TikTok:', error.message);
    
    // Fallback: devolver datos mock si falla el scraping
    const fallback = generateFallbackData(username);
    return res.status(200).json({ ...fallback, _source: 'fallback' });
  }
}

async function scrapeTikTokProfile(username) {
  const url = `https://www.tiktok.com/@${username}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
    },
    timeout: 10000,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const html = await response.text();
  
  // Buscar el script con datos SIGI_STATE
  const sigiMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/);
  
  if (sigiMatch && sigiMatch[1]) {
    try {
      const jsonData = JSON.parse(sigiMatch[1]);
      const userData = jsonData?.__DEFAULT_SCOPE__?.webapp?.userDetail;
      
      if (userData) {
        const userInfo = userData.userInfo;
        const stats = userInfo.stats;
        const user = userInfo.user;
        
        return {
          username: '@' + user.uniqueId,
          nickname: user.nickname,
          avatar: user.avatarLarger || user.avatarMedium || user.avatarThumb,
          followers: stats.followerCount || 0,
          following: stats.followingCount || 0,
          likes: stats.heartCount || 0,
          videos: stats.videoCount || 0,
          bio: user.signature || '',
          verified: user.verified || false,
          _source: 'realtime'
        };
      }
    } catch (parseError) {
      console.error('Error parsing SIGI_STATE:', parseError.message);
    }
  }
  
  // Intentar con otro patrón de datos en el HTML
  const dataPropsMatch = html.match(/<script[^>]*>window\.__INITIAL_PROPS__\s*=\s*({[^<]+})<\/script>/);
  if (dataPropsMatch) {
    try {
      const propsData = JSON.parse(dataPropsMatch[1]);
      // Extraer datos del perfil desde aquí
      // La estructura puede variar
    } catch (e) {}
  }
  
  throw new Error('No se pudieron extraer datos del perfil');
}

function generateFallbackData(username) {
  // Datos de respaldo para que la UI siempre funcione
  const seed = username.charCodeAt(0) || 1;
  const followerBase = 1000 + (seed * 157) % 50000;
  
  return {
    username: '@' + username,
    nickname: username.charAt(0).toUpperCase() + username.slice(1),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    followers: followerBase,
    following: Math.floor(Math.random() * 2000) + 50,
    likes: followerBase * Math.floor(Math.random() * 30 + 10),
    videos: Math.floor(Math.random() * 100) + 5,
    bio: 'Usuario de TikTok',
    verified: false,
    _source: 'fallback'
  };
}