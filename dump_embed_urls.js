const axios = require('axios');

async function dumpAllUrlsFromEmbed(shortcode) {
  try {
    const url = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      }
    });

    const html = res.data;
    console.log('HTML Length:', html.length);

    // Search for any URL starting with http in the HTML
    const allUrls = html.match(/https?:\\\/\\\/[^\s"'\\]+/gi) || html.match(/https?:\/\/[^\s"']+/gi) || [];
    console.log('Total URLs found:', allUrls.length);

    const cdnUrls = allUrls
      .map(u => u.replace(/\\u0026/g, '&').replace(/\\/g, ''))
      .filter(u => u.includes('cdninstagram') || u.includes('fbcdn'));

    console.log('CDN URLs found:', cdnUrls.length);
    cdnUrls.forEach((u, i) => console.log(`#${i}:`, u.substring(0, 150)));

  } catch(e) {
    console.error('Error:', e.message);
  }
}

dumpAllUrlsFromEmbed('DO5tIDME6t-');
