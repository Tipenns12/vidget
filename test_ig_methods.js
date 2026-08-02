const axios = require('axios');
const { exec } = require('child_process');

const testUrl = 'https://www.instagram.com/reel/DO5tIDME6t-/';
const shortcode = 'DO5tIDME6t-';

async function testMethodA() {
  console.log('\n--- Method A: query_hash b3055315a546816000f5a7da42e86d09');
  try {
    const vars = JSON.stringify({ shortcode });
    const url = `https://www.instagram.com/graphql/query/?query_hash=b3055315a546816000f5a7da42e86d09&variables=${encodeURIComponent(vars)}`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-IG-App-ID': '936619743392459'
      }
    });
    const media = res.data?.data?.shortcode_media;
    if (media) {
      console.log('SUCCESS! Video URL:', media.video_url || media.video_versions?.[0]?.url);
      return true;
    }
    console.log('Failed, data keys:', Object.keys(res.data || {}));
  } catch(e) {
    console.log('Error:', e.message);
  }
  return false;
}

async function testMethodB() {
  console.log('\n--- Method B: __a=1&__d=dis with X-IG-App-ID');
  try {
    const url = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'X-IG-App-ID': '936619743392459',
        'Accept': '*/*'
      }
    });
    const item = res.data?.items?.[0] || res.data?.graphql?.shortcode_media;
    if (item) {
      console.log('SUCCESS! Video URL:', item.video_versions?.[0]?.url || item.video_url);
      return true;
    }
    console.log('Failed, res keys:', Object.keys(res.data || {}));
  } catch(e) {
    console.log('Error:', e.message);
  }
  return false;
}

async function testMethodC() {
  console.log('\n--- Method C: Embed Captioned Parsing');
  try {
    const url = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    const html = res.data;
    const match = html.match(/video_url\\":\\"([^"\\]+)/) || html.match(/"video_url"\s*:\s*"([^"]+)"/);
    if (match) {
      const videoUrl = match[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
      console.log('SUCCESS! Video URL:', videoUrl.substring(0, 100));
      return true;
    }
    console.log('Failed, video_url match null');
  } catch(e) {
    console.log('Error:', e.message);
  }
  return false;
}

async function testMethodD() {
  console.log('\n--- Method D: Public API Scraper (Instagram-Videos / Public Endpoint)');
  try {
    const url = `https://instagram-videos.vercel.app/api/video?url=${encodeURIComponent(testUrl)}`;
    const res = await axios.get(url, { timeout: 10000 });
    if (res.data && res.data.videoUrl) {
      console.log('SUCCESS! Video URL:', res.data.videoUrl.substring(0, 100));
      return true;
    }
    console.log('Failed:', res.data);
  } catch(e) {
    console.log('Error:', e.message);
  }
  return false;
}

async function main() {
  await testMethodA();
  await testMethodB();
  await testMethodC();
  await testMethodD();
}

main();
