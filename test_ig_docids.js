const axios = require('axios');
const qs = require('qs');

async function testIgDocIds(shortcode) {
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

  const docIds = [
    "8845758582119770",
    "10015901848480474",
    "25686022877685609",
    "17888485532247167",
    "7016335191778945",
    "23826011400335017"
  ];

  for (const docId of docIds) {
    console.log(`\nTesting doc_id: ${docId}`);
    try {
      const dataBody = qs.stringify({
        'variables': JSON.stringify({
          'shortcode': shortcode,
          'fetch_tagged_user_count': null,
          'hoisted_comment_id': null,
          'hoisted_reply_id': null
        }),
        'doc_id': docId
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

      const data = resGql.data?.data;
      if (data) {
        console.log(`🎉 SUCCESS with doc_id ${docId}! Keys:`, Object.keys(data));
        const media = data.xdt_shortcode_media || data.shortcode_media;
        if (media) {
          console.log('Video URL:', media.video_url || media.video_versions?.[0]?.url);
          console.log('Thumbnail:', media.display_url || media.display_resources?.[0]?.src);
        }
      } else {
        console.log(`Failed doc_id ${docId}:`, resGql.data?.errors?.[0]?.message || 'No data');
      }
    } catch(err) {
      console.log(`Error doc_id ${docId}:`, err.message);
    }
  }
}

testIgDocIds('C8xL_9vS_qM');
