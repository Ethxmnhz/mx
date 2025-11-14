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

export default router;
