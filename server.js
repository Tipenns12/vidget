const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const qs = require('qs');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Serve frontend as static files (path dari root)
app.use(express.static(path.join(__dirname, 'frontend')));

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Helper to check if yt-dlp is installed (cached)
let _ytdlpInstalled = null;
let _ytdlpVersion = null;
async function checkYtDlp() {
  if (_ytdlpInstalled !== null) return _ytdlpInstalled;
  return new Promise((resolve) => {
    exec('yt-dlp --version', (err, stdout) => {
      _ytdlpInstalled = !err;
      _ytdlpVersion = stdout?.trim();
      resolve(_ytdlpInstalled);
    });
  });
}

// Base yt-dlp flags (lebih cepat, suppress warning)
const YTDLP_BASE_FLAGS = [
  '--no-warnings',
  '--js-runtimes', 'node',
  '--extractor-retries', '2',
  '--socket-timeout', '15',
  '--no-check-certificate',
].join(' ');

function sanitizeUrl(url) {
  return url.trim().replace(/"/g, '\\"');
}

function formatFileSize(bytes) {
  if (!bytes) return null;
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
}

function formatDuration(seconds) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Instagram Media Extractor (GraphQL) ──────────────────────────────────────
async function fetchInstagramMedia(url) {
  const match = url.match(/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  if (!match) throw new Error('URL Instagram tidak valid');
  const shortcode = match[1];

  const resHome = await axios.get('https://www.instagram.com/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    },
    timeout: 10000
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
    },
    timeout: 15000
  });

  const media = resGql.data?.data?.xdt_shortcode_media;
  if (!media) throw new Error('Media Instagram tidak ditemukan atau bersifat privat');

  const videoUrl = media.video_url || media.video_versions?.[0]?.url;
  const thumbUrl = media.display_url || media.display_resources?.[0]?.src;
  const captionNode = media.edge_media_to_caption?.edges?.[0]?.node?.text;
  const caption = captionNode ? captionNode.replace(/\n/g, ' ').trim() : 'Instagram Video';
  const uploader = media.owner?.username || 'instagram';

  const formats = [];
  if (videoUrl) {
    formats.push({
      format_id: 'ig_hd',
      ext: 'mp4',
      height: 720,
      width: 1280,
      fps: 30,
      filesize_str: 'HD Video',
      format_note: '720p HD'
    });
  }

  return {
    id: shortcode,
    title: caption.substring(0, 100),
    thumbnail: thumbUrl,
    duration: media.video_duration || 0,
    duration_string: media.video_duration ? formatDuration(media.video_duration) : null,
    uploader: '@' + uploader,
    view_count: media.video_view_count || null,
    platform: 'Instagram',
    video_formats: formats,
    direct_video_url: videoUrl,
    direct_thumb_url: thumbUrl
  };
}

// ─── API: Get Video Info ───────────────────────────────────────────────────────
app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL wajib diisi' });

  const isInstalled = await checkYtDlp();
  if (!isInstalled) {
    return res.status(500).json({
      error: 'yt-dlp belum terinstall di server ini'
    });
  }

  if (url.includes('instagram.com')) {
    try {
      console.log(`[info] Fetching Instagram GraphQL for: ${url}`);
      const igData = await fetchInstagramMedia(url);
      return res.json(igData);
    } catch (igErr) {
      console.warn('[info] Instagram GraphQL failed, falling back to yt-dlp:', igErr.message);
    }
  }

  const safeUrl = sanitizeUrl(url);
  const command = `yt-dlp ${YTDLP_BASE_FLAGS} --dump-json --no-playlist "${safeUrl}"`;

  console.log(`[info] Fetching: ${url}`);
  const startTime = Date.now();

  exec(command, { maxBuffer: 20 * 1024 * 1024, timeout: 30000 }, (err, stdout, stderr) => {
    console.log(`[info] Done in ${((Date.now() - startTime)/1000).toFixed(1)}s`);
    if (err) {
      const errMsg = stderr || err.message || '';
      let friendlyErr = 'Gagal mengambil info video';
      if (errMsg.includes('Unsupported URL') || errMsg.includes('not supported')) {
        friendlyErr = 'URL tidak didukung atau tidak valid';
      } else if (errMsg.includes('Private') || errMsg.includes('private')) {
        friendlyErr = 'Video ini bersifat private';
      } else if (errMsg.includes('age') || errMsg.includes('Age')) {
        friendlyErr = 'Video terbatas usia (age-restricted)';
      } else if (errMsg.includes('unavailable') || errMsg.includes('Unavailable')) {
        friendlyErr = 'Video tidak tersedia';
      } else if (err.killed || errMsg.includes('timeout')) {
        friendlyErr = 'Timeout — coba lagi atau cek koneksi internet';
      }
      return res.status(500).json({ error: friendlyErr, details: errMsg.substring(0, 300) });
    }

    try {
      const info = JSON.parse(stdout);
      const allFormats = info.formats || [];

      const videoFormats = allFormats
        .filter(f => f.vcodec && f.vcodec !== 'none' && f.height)
        .map(f => {
          let sz = f.filesize || f.filesize_approx;
          // If DASH video-only, estimate filesize from bitrate & duration
          if (!sz && f.tbr && info.duration) {
            sz = Math.round((f.tbr * 1024 * info.duration) / 8);
          }
          // Add estimated audio stream size (~128kbps = 16KB/s) if stream is video-only
          if (sz && (!f.acodec || f.acodec === 'none') && info.duration) {
            sz += Math.round(16000 * info.duration);
          }
          return {
            format_id: f.format_id,
            ext: 'mp4',
            height: f.height,
            width: f.width,
            fps: f.fps,
            vcodec: f.vcodec,
            acodec: f.acodec,
            filesize: sz || null,
            filesize_str: formatFileSize(sz),
            format_note: f.format_note || `${f.height}p`,
            tbr: f.tbr,
            has_audio: f.acodec && f.acodec !== 'none'
          };
        })
        .sort((a, b) => (b.height || 0) - (a.height || 0))
        .filter((f, i, arr) => i === 0 || f.height !== arr[i - 1].height);

      const audioFormats = allFormats
        .filter(f => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'))
        .map(f => ({
          format_id: f.format_id,
          ext: f.ext,
          acodec: f.acodec,
          abr: f.abr,
          filesize: f.filesize || f.filesize_approx || null,
          filesize_str: formatFileSize(f.filesize || f.filesize_approx),
          format_note: f.format_note || `${f.abr || ''}kbps`
        }))
        .sort((a, b) => (b.abr || 0) - (a.abr || 0));

      const thumbnails = info.thumbnails || [];
      const bestThumb = thumbnails.length > 0
        ? thumbnails.sort((a, b) => (b.width || 0) - (a.width || 0))[0].url
        : info.thumbnail;

      res.json({
        id: info.id,
        title: info.title,
        thumbnail: bestThumb || info.thumbnail,
        duration: info.duration,
        duration_string: info.duration_string || formatDuration(info.duration),
        uploader: info.uploader || info.channel || info.creator,
        platform: info.extractor_key || info.extractor,
        platform_url: info.webpage_url,
        view_count: info.view_count,
        like_count: info.like_count,
        upload_date: info.upload_date,
        video_formats: videoFormats,
        audio_formats: audioFormats,
        has_video: videoFormats.length > 0,
        has_audio: audioFormats.length > 0
      });
    } catch (e) {
      res.status(500).json({ error: 'Gagal memproses info video', details: e.message });
    }
  });
});

// ─── API: Download Stream ──────────────────────────────────────────────────────
// ─── API: Download File ────────────────────────────────────────────────────────
app.get('/api/download', async (req, res) => {
  let { url, format_id, type, title } = req.query;
  if (!url) return res.status(400).send('URL is required');

  // Fast direct handling for Instagram
  if (url.includes('instagram.com')) {
    try {
      const igData = await fetchInstagramMedia(url);
      if (type === 'thumbnail' && igData.direct_thumb_url) {
        return res.redirect(igData.direct_thumb_url);
      }
      if (igData.direct_video_url) {
        if (type === 'audio') {
          url = igData.direct_video_url; // pass direct video stream URL to yt-dlp audio extractor
        } else {
          return res.redirect(igData.direct_video_url);
        }
      }
    } catch (igErr) {
      console.warn('[download] Instagram GraphQL download failed, falling back to yt-dlp:', igErr.message);
    }
  }

  const safeTitle = (title || 'video')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .trim()
    .substring(0, 100) || 'video';

  if (type === 'thumbnail') {
    exec(`yt-dlp ${YTDLP_BASE_FLAGS} --dump-json --no-playlist "${sanitizeUrl(url)}"`,
      { maxBuffer: 10 * 1024 * 1024, timeout: 20000 }, (err, stdout) => {
        if (err) return res.status(500).send('Failed');
        try {
          const info = JSON.parse(stdout);
          res.redirect(info.thumbnail);
        } catch (e) { res.status(500).send('Failed to get thumbnail'); }
      });
    return;
  }

  const tmpId = `vg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  if (type === 'audio') {
    const tmpFile = path.join(os.tmpdir(), `${tmpId}.mp3`);
    const cmd = `yt-dlp ${YTDLP_BASE_FLAGS} --extract-audio --audio-format mp3 --audio-quality 0 -o "${tmpFile}" "${sanitizeUrl(url)}"`;

    exec(cmd, { maxBuffer: 50 * 1024 * 1024, timeout: 180000 }, (err) => {
      if (err || !fs.existsSync(tmpFile)) {
        if (!res.headersSent) res.status(500).send('Download audio failed');
        return;
      }
      res.download(tmpFile, `${safeTitle}.mp3`, () => {
        fs.unlink(tmpFile, () => {});
      });
    });
  } else {
    // Video: select requested format + bestaudio, merge into compatible mp4
    const formatArg = format_id
      ? `${format_id}+bestaudio[ext=m4a]/bestaudio/${format_id}/best`
      : 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';

    const tmpFile = path.join(os.tmpdir(), `${tmpId}.mp4`);
    const cmd = `yt-dlp ${YTDLP_BASE_FLAGS} -f "${formatArg}" --merge-output-format mp4 -o "${tmpFile}" "${sanitizeUrl(url)}"`;

    exec(cmd, { maxBuffer: 50 * 1024 * 1024, timeout: 300000 }, (err) => {
      if (err || !fs.existsSync(tmpFile)) {
        if (!res.headersSent) res.status(500).send('Download video failed');
        return;
      }
      res.download(tmpFile, `${safeTitle}.mp4`, () => {
        fs.unlink(tmpFile, () => {});
      });
    });
  }
});

// ─── API: Batch Info ───────────────────────────────────────────────────────────
app.post('/api/batch', async (req, res) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Array URL wajib diisi' });
  }
  if (urls.length > 20) {
    return res.status(400).json({ error: 'Maksimal 20 URL per batch' });
  }

  const fetchInfo = (url) =>
    new Promise((resolve) => {
      const cmd = `yt-dlp ${YTDLP_BASE_FLAGS} --dump-json --no-playlist "${sanitizeUrl(url)}"`;
      exec(cmd, { maxBuffer: 10 * 1024 * 1024, timeout: 25000 }, (err, stdout, stderr) => {
        if (err) {
          resolve({ url, status: 'error', error: (stderr || err.message).substring(0, 100) });
        } else {
          try {
            const info = JSON.parse(stdout);
            resolve({
              url, status: 'success',
              id: info.id, title: info.title, thumbnail: info.thumbnail,
              duration_string: info.duration_string || formatDuration(info.duration),
              platform: info.extractor_key, uploader: info.uploader || info.channel
            });
          } catch (e) {
            resolve({ url, status: 'error', error: 'Parse error' });
          }
        }
      });
    });

  const results = [];
  for (let i = 0; i < urls.length; i += 3) {
    const batch = urls.slice(i, i + 3);
    const batchResults = await Promise.all(batch.map(fetchInfo));
    results.push(...batchResults);
  }
  res.json(results);
});

// ─── API: Health Check ─────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const ytdlpInstalled = await checkYtDlp();
  res.json({
    status: 'ok',
    yt_dlp: ytdlpInstalled,
    yt_dlp_version: _ytdlpVersion,
    timestamp: new Date().toISOString()
  });
});

// ─── Catch-all: Serve Frontend ─────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('  🎬 VidGet Server');
  console.log(`  🚀 Running at http://localhost:${PORT}`);
  console.log('  📦 Powered by yt-dlp');
  console.log('');
});
