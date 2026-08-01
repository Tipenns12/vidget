const axios = require('axios');
const qs = require('qs');

async function testIgMediaActive(shortcode) {
  try {
    const resHome = await axios.get('https://www.instagram.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      }
    });

    const cookies = resHome.headers['set-cookie'] || [];
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    const csrfMatch = cookieHeader.match(/csrftoken=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

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
        'X-CSRFToken': csrfToken,
        'Cookie': cookieHeader,
        'X-IG-App-ID': '936619743392459',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': `https://www.instagram.com/p/${shortcode}/`
      }
    });

    const media = resGql.data?.data?.xdt_shortcode_media;
    if (media) {
      console.log('🎉 SUCCESS!');
      console.log('Title/Caption:', media.edge_media_to_caption?.edges[0]?.node?.text?.substring(0, 80));
      console.log('Is Video:', media.is_video);
      console.log('Video URL:', media.video_url);
      console.log('Display URL (Thumb):', media.display_url);
      console.log('Owner:', media.owner?.username);
    } else {
      console.log('Raw GQL Response:', JSON.stringify(resGql.data).substring(0, 500));
    }
  } catch(err) {
    console.error('ERROR:', err.message);
  }
}

testIgMediaActive('DO5tIDME6t-');
