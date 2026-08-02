const axios = require('axios');
const qs = require('qs');
const crypto = require('crypto');

async function testIgGeneratedCookie(shortcode) {
  try {
    const randomCsrf = crypto.randomBytes(16).toString('hex');
    const randomMid = crypto.randomBytes(16).toString('hex');
    const cookieHeader = `csrftoken=${randomCsrf}; mid=${randomMid}`;

    console.log('Using generated CSRF:', randomCsrf);

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
      timeout: 15000
    });

    const media = resGql.data?.data?.xdt_shortcode_media;
    if (media) {
      console.log('🎉 SUCCESS WITH GENERATED COOKIE!');
      console.log('Title/Caption:', media.edge_media_to_caption?.edges[0]?.node?.text?.substring(0, 80));
      console.log('Is Video:', media.is_video);
      console.log('Video URL:', media.video_url ? media.video_url.substring(0, 100) : 'None');
      console.log('Display URL:', media.display_url ? media.display_url.substring(0, 100) : 'None');
    } else {
      console.log('No media returned:', resGql.data);
    }
  } catch (err) {
    console.error('ERROR:', err.response?.status, err.response?.data || err.message);
  }
}

testIgGeneratedCookie('DO5tIDME6t-');
