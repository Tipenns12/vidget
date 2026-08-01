const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');
const path = require('path');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Serve frontend as static files
app.use(express.static(path.join(__dirname, '../frontend')));

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

// Base yt-dlp flags untuk semua command (lebih cepat)
const YTDLP_BASE_FLAGS = [
  '--no-warnings',          // suppress WARNING ke stderr agar tidak lambat
  '--js-runtimes', 'node', // gunakan Node.js sebagai JS runtime (sudah ada di sistem)
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

// ─── API: Get Video Info ───────────────────────────────────────────────────────
app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL wajib diisi', error_en: 'URL is required' });

  const isInstalled = await checkYtDlp();
  if (!isInstalled) {
    return res.status(500).json({
      error: 'yt-dlp belum terinstall. Jalankan: pip install yt-dlp',
      error_en: 'yt-dlp not installed. Run: pip install yt-dlp'
    });
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
      }
      return res.status(500).json({ error: friendlyErr, details: errMsg.substring(0, 300) });
    }

    try {
      const info = JSON.parse(stdout);

      // Filter dan sort format video
      const allFormats = info.formats || [];

      const videoFormats = allFormats
        .filter(f => f.vcodec && f.vcodec !== 'none' && f.height)
        .map(f => ({
          format_id: f.format_id,
          ext: f.ext || 'mp4',
          height: f.height,
          width: f.width,
          fps: f.fps,
          vcodec: f.vcodec,
          acodec: f.acodec,
          filesize: f.filesize || f.filesize_approx || null,
          filesize_str: formatFileSize(f.filesize || f.filesize_approx),
          format_note: f.format_note || `${f.height}p`,
          tbr: f.tbr,
          has_audio: f.acodec && f.acodec !== 'none'
        }))
        .sort((a, b) => (b.height || 0) - (a.height || 0))
        .filter((f, i, arr) => i === 0 || f.height !== arr[i - 1].height); // deduplicate by height

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

      // Get best thumbnail
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

function formatDuration(seconds) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── API: Download Stream ──────────────────────────────────────────────────────
app.get('/api/download', async (req, res) => {
  const { url, format_id, type, title } = req.query;
  if (!url) return res.status(400).send('URL is required');

  const safeTitle = (title || 'video')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .trim()
    .substring(0, 100) || 'video';

  let args = [];
  let contentType = 'application/octet-stream';
  let filename = safeTitle;

  if (type === 'audio') {
    args = [
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '-o', '-',
      url
    ];
    contentType = 'audio/mpeg';
    filename = `${safeTitle}.mp3`;
  } else if (type === 'thumbnail') {
    exec(`yt-dlp ${YTDLP_BASE_FLAGS} --dump-json --no-playlist "${sanitizeUrl(url)}"`, { maxBuffer: 10 * 1024 * 1024, timeout: 20000 }, (err, stdout) => {
      if (err) return res.status(500).send('Failed');
      try {
        const info = JSON.parse(stdout);
        res.redirect(info.thumbnail);
      } catch (e) {
        res.status(500).send('Failed to get thumbnail');
      }
    });
    return;
  } else {
    const formatArg = format_id
      ? `${format_id}+bestaudio[ext=m4a]/bestaudio/${format_id}`
      : 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
    args = [
      '-f', formatArg,
      '--merge-output-format', 'mp4',
      '-o', '-',
      url
    ];
    contentType = 'video/mp4';
    filename = `${safeTitle}.mp4`;
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

  const ytdlp = spawn('yt-dlp', args);

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on('data', (data) => {
    process.stderr.write(`[yt-dlp] ${data}`);
  });

  ytdlp.on('error', (err) => {
    console.error('yt-dlp spawn error:', err);
    if (!res.headersSent) res.status(500).send('Download failed');
  });

  req.on('close', () => ytdlp.kill('SIGTERM'));
  res.on('error', () => ytdlp.kill('SIGTERM'));
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
              url,
              status: 'success',
              id: info.id,
              title: info.title,
              thumbnail: info.thumbnail,
              duration_string: info.duration_string || formatDuration(info.duration),
              platform: info.extractor_key,
              uploader: info.uploader || info.channel
            });
          } catch (e) {
            resolve({ url, status: 'error', error: 'Parse error' });
          }
        }
      });
    });

  // Process 3 at a time to avoid overload
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
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('  🎬 Video Downloader Server');
  console.log(`  🚀 Running at http://localhost:${PORT}`);
  console.log('  📦 Powered by yt-dlp');
  console.log('');
});
