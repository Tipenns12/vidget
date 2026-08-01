const axios = require('axios');
const qs = require('qs');

async function testIgFixed(url) {
  try {
    const split_url = url.split("/");
    const post_tags = ["p", "reel", "tv", "reels"];
    const index_shortcode = split_url.findIndex(item => post_tags.includes(item)) + 1;
    const shortcode = split_url[index_shortcode].split("?")[0];

    console.log('Shortcode:', shortcode);

    // 1. Get CSRF Token & Cookies
    const resHome = await axios.get('https://www.instagram.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      }
    });

    const cookies = resHome.headers['set-cookie'] || [];
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    const csrfMatch = cookieHeader.match(/csrftoken=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    console.log('CSRF Token:', csrfToken);
    console.log('Cookie Header:', cookieHeader);

    // 2. Query GraphQL with document_id
    const BASE_URL = "https://www.instagram.com/graphql/query";
    const INSTAGRAM_DOCUMENT_ID = "9510064595728286";

    const dataBody = qs.stringify({
      'variables': JSON.stringify({
        'shortcode': shortcode,
        'fetch_tagged_user_count': null,
        'hoisted_comment_id': null,
        'hoisted_reply_id': null
      }),
      'doc_id': INSTAGRAM_DOCUMENT_ID
    });

    const resGql = await axios.post(BASE_URL, dataBody, {
      headers: {
        'X-CSRFToken': csrfToken,
        'Cookie': cookieHeader,
        'X-IG-App-ID': '936619743392459',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': `https://www.instagram.com/p/${shortcode}/`
      }
    });

    console.log('GraphQL Response Keys:', Object.keys(resGql.data));
    const media = resGql.data.data?.xdt_shortcode_media;
    if (media) {
      console.log('🎉 SUCCESS!');
      console.log('Title/Caption:', media.edge_media_to_caption?.edges[0]?.node?.text?.substring(0, 60));
      console.log('Is Video:', media.is_video);
      console.log('Video URL:', media.video_url);
      console.log('Display URL (Thumb):', media.display_url);
    } else {
      console.log('No xdt_shortcode_media in data:', resGql.data);
    }
  } catch (err) {
    console.error('FAILED:', err.response?.status, err.response?.data || err.message);
  }
}

testIgFixed('https://www.instagram.com/reel/C8xL_9vS_qM/');
