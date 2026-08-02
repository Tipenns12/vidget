const axios = require('axios');

async function testRawRegexEmbed(shortcode) {
  try {
    const url = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const html = res.data;

    // Match raw video_url in embed HTML
    const vMatch = html.match(/video_url\\":\\"([^"\\]+)/) || html.match(/"video_url"\s*:\s*"([^"]+)"/);
    const dMatch = html.match(/display_url\\":\\"([^"\\]+)/) || html.match(/"display_url"\s*:\s*"([^"]+)"/);
    const cMatch = html.match(/caption\\":\\"([^"\\]+)/) || html.match(/"caption"\s*:\s*\{"text"\s*:\s*"([^"]+)"\}/);
    const uMatch = html.match(/username\\":\\"([^"\\]+)/) || html.match(/"username"\s*:\s*"([^"]+)"/);

    const videoUrl  = vMatch ? vMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '') : null;
    const displayUrl = dMatch ? dMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '') : null;
    const caption   = cMatch ? cMatch[1].replace(/\\n/g, ' ').substring(0, 100) : 'Instagram Video';
    const username  = uMatch ? uMatch[1] : 'instagram';

    console.log('Video URL:', videoUrl);
    console.log('Display URL:', displayUrl);
    console.log('Caption:', caption);
    console.log('Username:', username);

  } catch(e) {
    console.error('Error:', e.message);
  }
}

testRawRegexEmbed('DO5tIDME6t-');
