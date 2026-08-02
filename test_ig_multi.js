const axios = require('axios');
const qs = require('qs');
const crypto = require('crypto');

async function getIgMedia(shortcode) {
  const randomCsrf = crypto.randomBytes(16).toString('hex');
  const randomMid = crypto.randomBytes(16).toString('hex');
  const cookieHeader = `csrftoken=${randomCsrf}; mid=${randomMid}`;

  const dataBody = qs.stringify({
    'variables': JSON.stringify({
      'shortcode': shortcode,
      'fetch_tagged_user_count': null,
      'hoisted_comment_id': null,
      'hoisted_reply_id': null
    }),
    'doc_id': '10015901848480474'
  });

  const resGql = await axios.post("https://www.instagram.com/graphql/query", dataBody, {
    headers: {
      'X-CSRFToken': randomCsrf,
      'Cookie': cookieHeader,
      'X-IG-App-ID': '936619743392459',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': `https://www.instagram.com/p/${shortcode}/`
    },
    timeout: 10000
  });

  return resGql.data?.data?.xdt_shortcode_media;
}

async function run() {
  const shortcodes = ['DO5tIDME6t-', 'C-7yL1wS2x_'];
  for (const sc of shortcodes) {
    try {
      console.log(`\nFetching shortcode: ${sc}...`);
      const media = await getIgMedia(sc);
      if (media) {
        console.log(`✅ [${sc}] SUCCESS! Is Video: ${media.is_video} | Video URL: ${media.video_url ? media.video_url.substring(0, 70) : 'None'}`);
      } else {
        console.log(`❌ [${sc}] Media null`);
      }
    } catch (e) {
      console.log(`❌ [${sc}] Error:`, e.message);
    }
  }
}

run();
