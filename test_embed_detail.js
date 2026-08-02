const axios = require('axios');

async function testEmbedDetail(shortcode) {
  try {
    const url = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const html = res.data;

    // Search video_url (unescaped)
    const unescaped = html.replace(/\\u0026/g, '&').replace(/\\/g, '');

    const videoMatch = unescaped.match(/"video_url"\s*:\s*"([^"]+)"/) ||
                       unescaped.match(/video_url["']?\s*:\s*["']([^"']+)["']/);

    const displayMatch = unescaped.match(/"display_url"\s*:\s*"([^"]+)"/) ||
                         unescaped.match(/display_url["']?\s*:\s*["']([^"']+)["']/);

    const captionMatch = unescaped.match(/"caption"\s*:\s*\{"text"\s*:\s*"([^"]+)"\}/) ||
                         unescaped.match(/"text"\s*:\s*"([^"]+)"/);

    const usernameMatch = unescaped.match(/"username"\s*:\s*"([^"]+)"/);

    console.log('Video URL:', videoMatch ? videoMatch[1] : 'NOT FOUND');
    console.log('Display URL:', displayMatch ? displayMatch[1] : 'NOT FOUND');
    console.log('Caption:', captionMatch ? captionMatch[1].substring(0, 60) : 'NOT FOUND');
    console.log('Username:', usernameMatch ? usernameMatch[1] : 'NOT FOUND');

  } catch(e) {
    console.error('Error:', e.message);
  }
}

testEmbedDetail('DO5tIDME6t-');
