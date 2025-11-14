import express from 'express';

const router = express.Router();

// Proxy Dailymotion embed iframe
router.get('/proxy/dailymotion/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const queryString = req.url.split('?')[1] || '';
    
    // Construct Dailymotion embed URL
    const dailymotionUrl = `https://www.dailymotion.com/embed/video/${videoId}${queryString ? '?' + queryString : ''}`;
    
    console.log('Proxying Dailymotion video:', dailymotionUrl);
    
    // Fetch the embed page from Dailymotion
    const response = await fetch(dailymotionUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://maxsec.tech/',
        'Origin': 'https://maxsec.tech'
      }
    });

    if (!response.ok) {
      throw new Error(`Dailymotion returned ${response.status}`);
    }

    let html = await response.text();
    
    // Replace CDN URLs with our proxy
    const apiUrl = process.env.BACKEND_URL || 'https://mx-3xxg.onrender.com';
    html = html.replace(/https:\/\/static1\.dmcdn\.net/g, `${apiUrl}/api/video/cdn`);
    html = html.replace(/https:\/\/www\.dailymotion\.com/g, `${apiUrl}/api/video/dm`);
    html = html.replace(/https:\/\/geo\.dailymotion\.com/g, `${apiUrl}/api/video/geo`);
    html = html.replace(/https:\/\/pebed\.dm-event\.net/g, `${apiUrl}/api/video/events`);
    html = html.replace(/https:\/\/vendorlist\.dmcdn\.net/g, `${apiUrl}/api/video/vendorlist`);
    
    // Block third-party tracking/ads (return empty responses for these)
    html = html.replace(/https:\/\/securepubads\.g\.doubleclick\.net/g, `${apiUrl}/api/video/noop`);
    html = html.replace(/https:\/\/s0\.2mdn\.net/g, `${apiUrl}/api/video/noop`);
    html = html.replace(/https:\/\/pagead2\.googlesyndication\.com/g, `${apiUrl}/api/video/noop`);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.send(html);
  } catch (error) {
    console.error('Video proxy error:', error);
    res.status(500).json({ 
      message: 'Failed to proxy video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Proxy Dailymotion CDN resources (JS, CSS, etc)
router.get('/cdn/:folder/:filename', async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const targetUrl = `https://static1.dmcdn.net/${folder}/${filename}`;
    
    console.log('Proxying CDN resource:', targetUrl);
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://maxsec.tech/'
      }
    });

    if (!response.ok) {
      throw new Error(`CDN returned ${response.status}`);
    }

    // Forward content type
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    // Stream response
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('CDN proxy error:', error);
    res.status(500).json({ message: 'Failed to proxy CDN resource' });
  }
});

// Proxy other Dailymotion API endpoints
router.get('/dm/:path', async (req, res) => {
  try {
    const { path } = req.params;
    const queryString = req.url.split('?')[1] || '';
    const targetUrl = `https://www.dailymotion.com/${path}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://maxsec.tech/'
      }
    });

    if (!response.ok) {
      throw new Error(`Dailymotion returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('DM proxy error:', error);
    res.status(500).json({ message: 'Failed to proxy DM resource' });
  }
});

// Proxy geo endpoints
router.get('/geo/:path', async (req, res) => {
  try {
    const { path } = req.params;
    const queryString = req.url.split('?')[1] || '';
    const targetUrl = `https://geo.dailymotion.com/${path}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://maxsec.tech/'
      }
    });

    if (!response.ok) {
      throw new Error(`Geo API returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Geo proxy error:', error);
    res.status(500).json({ message: 'Failed to proxy geo resource' });
  }
});

export default router;
