/* ═══════════════════════════════════════════════════════════════════════════
   VidGet — app.js  (v3 - Full Features: PWA, Categories, QR, Copy Link, Legal)
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

// Apply theme early (before DOMContentLoaded) to prevent flash
(function() {
  const saved = localStorage.getItem('vg_theme') || 'dark';
  if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
})();

// ─── Translations ─────────────────────────────────────────────────────────────
const LANG = {
  id: {
    badge:              '✨ Gratis & Tanpa Batas',
    hero_title:         'Download Video dari Mana Saja',
    hero_sub:           'YouTube, TikTok, Instagram, Twitter, Facebook, dan 1000+ platform lainnya',
    input_placeholder:  'Tempel link video di sini...',
    btn_paste:          'Tempel',
    btn_analyze:        'Download',
    btn_install_app:    'Install App',
    cat_all:            'Semua Video',
    loading_text:       'Mengambil info video...',
    tab_video:          '🎬 Video',
    tab_audio:          '🎵 Audio',
    tab_thumb:          '🖼️ Thumbnail',
    quality_label:      'Pilih Kualitas:',
    audio_info:         'Format MP3, kualitas terbaik',
    btn_download_video: 'Download Video (MP4)',
    btn_download_audio: 'Download Audio (MP3)',
    btn_download_thumb: 'Download Thumbnail',
    btn_copy_link:      'Salin Link',
    btn_new:            '← Download Video Lain',
    btn_retry:          'Coba Lagi',
    error_title:        'Gagal mengambil video',
    features_title:     'Kenapa VidGet?',
    feat1_title: 'Super Cepat',        feat1_desc: 'Analisis video dalam hitungan detik.',
    feat2_title: '1000+ Platform',     feat2_desc: 'YouTube, TikTok, Instagram, Twitter, Facebook, dan ribuan lainnya.',
    feat3_title: 'Ramah Mobile & PWA', feat3_desc: 'Bisa di-install sebagai aplikasi HP. Tempel link dengan sekali ketuk.',
    feat4_title: 'Kualitas HD & No WM',feat4_desc: 'Dari 360p hingga 4K. Mendukung TikTok tanpa watermark.',
    howto_title: 'Cara Menggunakan',
    step1_title: 'Salin Link',         step1_desc: 'Buka video di aplikasi atau browser, lalu salin linknya.',
    step2_title: 'Tempel & Analisis',  step2_desc: 'Tempel link di kolom di atas. Analisis otomatis dimulai.',
    step3_title: 'Download',           step3_desc: 'Pilih kualitas yang diinginkan lalu klik tombol Download.',
    toast_copied:       '✓ URL ditempel dari clipboard',
    toast_link_copied:  '✓ Link download direct disalin!',
    toast_clipboard_err:'Akses clipboard diblokir. Ketik URL secara manual.',
    toast_invalid:      '⚠ URL tidak valid',
    toast_dl_start:     '⬇ Download dimulai...',
    toast_no_format:    'Tidak ada format video tersedia',
    link_privacy:       'Kebijakan Privasi',
    link_terms:         'Syarat & Ketentuan',
    link_contact:       'Kontak Kami',
    msg_connecting:     'Menghubungi server...',
    msg_fetching:       'Mengambil info video...',
    msg_processing:     'Memproses data...',
    msg_almost:         'Hampir selesai...',
    err_timeout:        'Timeout — server terlalu lama merespons. Coba lagi.',
    err_generic:        'Terjadi kesalahan. Coba lagi.',
  },
  en: {
    badge:              '✨ Free & Unlimited',
    hero_title:         'Download Video from Anywhere',
    hero_sub:           'YouTube, TikTok, Instagram, Twitter, Facebook, and 1000+ platforms',
    input_placeholder:  'Paste video link here...',
    btn_paste:          'Paste',
    btn_analyze:        'Download',
    btn_install_app:    'Install App',
    cat_all:            'All Videos',
    loading_text:       'Fetching video info...',
    tab_video:          '🎬 Video',
    tab_audio:          '🎵 Audio',
    tab_thumb:          '🖼️ Thumbnail',
    quality_label:      'Select Quality:',
    audio_info:         'MP3 format, best quality',
    btn_download_video: 'Download Video (MP4)',
    btn_download_audio: 'Download Audio (MP3)',
    btn_download_thumb: 'Download Thumbnail',
    btn_copy_link:      'Copy Link',
    btn_new:            '← Download Another',
    btn_retry:          'Try Again',
    error_title:        'Failed to fetch video',
    features_title:     'Why VidGet?',
    feat1_title: 'Super Fast',         feat1_desc: 'Video analysis in seconds.',
    feat2_title: '1000+ Platforms',    feat2_desc: 'YouTube, TikTok, Instagram, Twitter, Facebook, and thousands more.',
    feat3_title: 'Mobile & PWA Ready', feat3_desc: 'Installable as a phone app. Paste link with one tap.',
    feat4_title: 'HD Quality & No WM', feat4_desc: 'From 360p to 4K. Supports TikTok without watermark.',
    howto_title: 'How to Use',
    step1_title: 'Copy Link',          step1_desc: 'Open a video in the app or browser, then copy the link.',
    step2_title: 'Paste & Analyze',    step2_desc: 'Paste the link above. Analysis starts automatically.',
    step3_title: 'Download',           step3_desc: 'Choose quality and click the Download button.',
    toast_copied:       '✓ URL pasted from clipboard',
    toast_link_copied:  '✓ Direct download link copied!',
    toast_clipboard_err:'Clipboard access blocked. Type URL manually.',
    toast_invalid:      '⚠ Invalid URL',
    toast_dl_start:     '⬇ Download starting...',
    toast_no_format:    'No video formats available',
    link_privacy:       'Privacy Policy',
    link_terms:         'Terms of Service',
    link_contact:       'Contact Us',
    msg_connecting:     'Connecting to server...',
    msg_fetching:       'Fetching video info...',
    msg_processing:     'Processing data...',
    msg_almost:         'Almost done...',
    err_timeout:        'Timeout — server took too long. Try again.',
    err_generic:        'Something went wrong. Try again.',
  }
};

// ─── State ────────────────────────────────────────────────────────────────────
let currentLang      = localStorage.getItem('vg_lang') || 'id';
let currentTheme     = localStorage.getItem('vg_theme') || 'dark';
let currentCategory  = 'all';
let currentVideoInfo = null;
let selectedFormat   = null;
let activeTab        = 'video';
let deferredInstallPrompt = null;

// ─── Category Configurations ──────────────────────────────────────────────────
const CATEGORIES = {
  all: {
    badge: '✨ Gratis & Tanpa Batas',
    title_id: 'Download Video dari Mana Saja',
    title_en: 'Download Video from Anywhere',
    sub_id: 'YouTube, TikTok, Instagram, Twitter, Facebook, dan 1000+ platform lainnya',
    sub_en: 'YouTube, TikTok, Instagram, Twitter, Facebook, and 1000+ platforms',
    placeholder_id: 'Tempel link video di sini...',
    placeholder_en: 'Paste video link here...'
  },
  youtube: {
    badge: '▶️ YouTube Downloader',
    title_id: 'Download Video & MP3 YouTube',
    title_en: 'Download YouTube Video & MP3',
    sub_id: 'Unduh video YouTube Shorts, 1080p, 4K, dan konversi ke MP3 berkualitas tinggi',
    sub_en: 'Download YouTube Shorts, 1080p, 4K videos, and convert to high quality MP3',
    placeholder_id: 'Tempel link YouTube di sini (cth: https://youtube.com/watch?...)...',
    placeholder_en: 'Paste YouTube link here...'
  },
  tiktok: {
    badge: '🎵 TikTok Downloader (No Watermark)',
    title_id: 'Download Video TikTok Tanpa Watermark',
    title_en: 'Download TikTok Video Without Watermark',
    sub_id: 'Simpan video TikTok tanpa logo watermark, cepat, gratis, dan dalam kualitas HD',
    sub_en: 'Save TikTok videos without watermark logo, fast, free, and in HD quality',
    placeholder_id: 'Tempel link TikTok di sini (cth: https://tiktok.com/@user/video/...)...',
    placeholder_en: 'Paste TikTok link here...'
  },
  instagram: {
    badge: '📸 Instagram Downloader',
    title_id: 'Download Video & Reels Instagram',
    title_en: 'Download Instagram Video & Reels',
    sub_id: 'Download Instagram Reels, Video Feed, dan Story secara gratis dan anonim',
    sub_en: 'Download Instagram Reels, Feed Videos, and Stories for free and anonymously',
    placeholder_id: 'Tempel link Instagram di sini (cth: https://instagram.com/reel/...)...',
    placeholder_en: 'Paste Instagram link here...'
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const el = (id) => document.getElementById(id);
const t  = (key) => LANG[currentLang][key] || key;

function extractUrl(str) {
  if (!str) return '';
  const match = str.match(/https?:\/\/[^\s"']+/i);
  return match ? match[0].trim() : str.trim();
}

function isValidUrl(str) {
  try {
    const clean = extractUrl(str);
    const u = new URL(clean);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

function formatNum(n) {
  if (!n) return null;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg, type = '') {
  const toast = el('toast');
  toast.textContent = msg;
  toast.className   = 'toast' + (type ? ' ' + type : '');
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Theme ────────────────────────────────────────────────────────────────────
function applyTheme() {
  const html = document.documentElement;
  if (currentTheme === 'light') {
    html.setAttribute('data-theme', 'light');
    el('themeIcon').textContent = '🌙';
  } else {
    html.removeAttribute('data-theme');
    el('themeIcon').textContent = '☀️';
  }
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('vg_theme', currentTheme);
  applyTheme();
}

// ─── Language ─────────────────────────────────────────────────────────────────
function applyLang() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (LANG[currentLang][key]) element.textContent = LANG[currentLang][key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (LANG[currentLang][key]) element.placeholder = LANG[currentLang][key];
  });
  el('langFlag').textContent  = currentLang === 'id' ? '🇮🇩' : '🇬🇧';
  el('langLabel').textContent = currentLang === 'id' ? 'ID' : 'EN';
  applyCategory(currentCategory);
}

function toggleLang() {
  currentLang = currentLang === 'id' ? 'en' : 'id';
  localStorage.setItem('vg_lang', currentLang);
  applyLang();
  if (currentVideoInfo) renderResults(currentVideoInfo);
}

// ─── Category Selection ───────────────────────────────────────────────────────
function applyCategory(catKey) {
  currentCategory = catKey;
  const cfg = CATEGORIES[catKey] || CATEGORIES.all;

  el('heroBadge').textContent = cfg.badge;
  el('heroTitle').textContent = currentLang === 'id' ? cfg.title_id : cfg.title_en;
  el('heroSub').textContent   = currentLang === 'id' ? cfg.sub_id   : cfg.sub_en;
  el('urlInput').placeholder  = currentLang === 'id' ? cfg.placeholder_id : cfg.placeholder_en;

  document.querySelectorAll('.cat-btn').forEach(btn => {
    const active = btn.getAttribute('data-cat') === catKey;
    btn.classList.toggle('active', active);
  });
}

// ─── Section Control ──────────────────────────────────────────────────────────
function showSection(name) {
  const hero    = el('heroSection');
  const loading = el('loadingSection');
  const results = el('resultsSection');
  hero.classList.add('hidden');
  loading.classList.add('hidden');
  results.classList.add('hidden');
  if (name === 'hero')    hero.classList.remove('hidden');
  if (name === 'loading') loading.classList.remove('hidden');
  if (name === 'results') results.classList.remove('hidden');
}

// ─── Analyze ──────────────────────────────────────────────────────────────────
async function handleAnalyze() {
  const input = el('urlInput');
  let raw = input.value.trim();

  if (!raw) { input.focus(); return; }

  const url = extractUrl(raw);
  if (url) input.value = url; // Clean the input field to show only the URL

  if (!url || !isValidUrl(url)) {
    showToast(t('toast_invalid'), 'error');
    input.focus();
    return;
  }

  showSection('loading');
  el('loadingSection').scrollIntoView({ behavior: 'smooth', block: 'center' });

  const msgs = [t('msg_connecting'), t('msg_fetching'), t('msg_processing'), t('msg_almost')];
  let msgIdx = 0, secs = 0;
  const msgEl   = el('loadingMsg');
  const timerEl = el('loadingTimer');
  msgEl.textContent   = msgs[0];
  timerEl.textContent = '0s';
  const interval = setInterval(() => {
    secs++;
    timerEl.textContent = secs + 's';
    msgEl.textContent   = msgs[Math.min(Math.floor(secs / 4), msgs.length - 1)];
  }, 1000);

  try {
    const ctrl = new AbortController();
    const tOut = setTimeout(() => ctrl.abort(), 45000);

    const res  = await fetch('/api/info', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ url }),
      signal:  ctrl.signal,
    });
    clearTimeout(tOut);

    const data = await res.json();

    if (!res.ok) {
      // Instagram-specific: show detail message and auto-retry once
      if (data.retry && url.includes('instagram.com')) {
        showToast('⏳ Instagram sibuk, mencoba lagi...', 'info');
        await new Promise(r => setTimeout(r, 1500));
        const res2 = await fetch('/api/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const data2 = await res2.json();
        if (res2.ok) {
          currentVideoInfo = { ...data2, url };
          renderResults(data2);
          showSection('results');
          el('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        showError(data2.error || data.error || t('err_generic'), data2.details || data.details);
        showSection('results');
        return;
      }
      throw new Error(data.error || t('err_generic'));
    }

    currentVideoInfo = { ...data, url };
    renderResults(data);
    showSection('results');
    el('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    const msg = err.name === 'AbortError' ? t('err_timeout') : (err.message || t('err_generic'));
    showError(msg);
    showSection('results');
  } finally {
    clearInterval(interval);
  }
}

// ─── Render Results ───────────────────────────────────────────────────────────
function renderResults(info) {
  el('errorCard').classList.add('hidden');
  el('resultCard').classList.remove('hidden');

  const thumb = info.thumbnail || '';
  el('thumbImg').src     = thumb;
  el('thumbPreview').src = thumb;
  el('thumbImg').alt     = info.title || 'Thumbnail';

  const dur = el('durationBadge');
  dur.textContent = info.duration_string || '';
  dur.style.display = info.duration_string ? 'block' : 'none';

  // Platform & TikTok No-WM badge
  const platform = info.platform || '';
  el('platformBadge').textContent = platform;

  const isTikTok = platform.toLowerCase().includes('tiktok') || (info.url && info.url.includes('tiktok'));
  if (isTikTok) {
    el('nowmBadge').classList.remove('hidden');
  } else {
    el('nowmBadge').classList.add('hidden');
  }

  // Title & Stats
  el('videoTitle').textContent = info.title || 'Video';
  const stats = [];
  if (info.uploader)   stats.push('👤 ' + info.uploader);
  if (info.view_count) stats.push('👁 ' + formatNum(info.view_count));
  el('videoStats').textContent = stats.join('  ·  ');

  // Quality grid
  renderQualityGrid(info.video_formats || []);

  // Hide QR box initially
  el('qrBox').classList.add('hidden');

  switchTab('video');
}

function showError(msg, detail) {
  el('errorCard').classList.remove('hidden');
  el('resultCard').classList.add('hidden');
  el('errorMsg').textContent = msg;
  // Show detail if available
  let detailEl = document.getElementById('errorDetail');
  if (!detailEl) {
    detailEl = document.createElement('p');
    detailEl.id = 'errorDetail';
    detailEl.style.cssText = 'color:var(--text2);font-size:0.82rem;margin-top:6px;';
    el('errorMsg').after(detailEl);
  }
  detailEl.textContent = detail || '';
  detailEl.style.display = detail ? 'block' : 'none';
}

function renderQualityGrid(formats) {
  const grid = el('qualityGrid');
  grid.innerHTML = '';
  selectedFormat = null;

  if (!formats.length) {
    grid.innerHTML = `<p style="color:var(--text2);font-size:0.85rem">${t('toast_no_format')}</p>`;
    return;
  }

  formats.forEach((fmt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quality-btn' + (i === 0 ? ' selected' : '');
    btn.setAttribute('data-fid', fmt.format_id);
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', i === 0 ? 'true' : 'false');
    btn.innerHTML = `
      <span>${fmt.height}p${fmt.fps > 30 ? ' ' + fmt.fps + 'fps' : ''}</span>
      <span class="q-size">${[fmt.ext?.toUpperCase(), fmt.filesize_str].filter(Boolean).join(' · ')}</span>
    `;
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.quality-btn').forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');
      selectedFormat = fmt;
    });
    if (i === 0) selectedFormat = fmt;
    grid.appendChild(btn);
  });
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function switchTab(name) {
  activeTab = name;
  ['video', 'audio', 'thumb'].forEach(k => {
    const tab     = el('tab' + k.charAt(0).toUpperCase() + k.slice(1));
    const content = el('content' + k.charAt(0).toUpperCase() + k.slice(1));
    const active  = k === name;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    content.classList.toggle('hidden', !active);
  });
}

// ─── Downloads & Actions ──────────────────────────────────────────────────────
function triggerDownload(url) {
  const a = document.createElement('a');
  a.href   = url;
  a.target = '_blank';
  a.rel    = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast(t('toast_dl_start'), 'success');
}

function buildDlUrl(type, formatId) {
  if (!currentVideoInfo?.url) return null;
  const p = new URLSearchParams({ url: currentVideoInfo.url, type, title: currentVideoInfo.title || 'video' });
  if (formatId) p.set('format_id', formatId);
  // For Instagram: pass cached CDN URL directly to avoid re-fetching (CDN URLs expire quickly)
  if (type === 'video' && currentVideoInfo.direct_video_url) {
    p.set('video_src', currentVideoInfo.direct_video_url);
  }
  if (type === 'thumbnail' && currentVideoInfo.direct_thumb_url) {
    p.set('video_src', currentVideoInfo.direct_thumb_url);
  }
  return '/api/download?' + p.toString();
}

function copyDirectLink() {
  const dlUrl = buildDlUrl('video', selectedFormat?.format_id);
  if (!dlUrl) return;
  const fullUrl = window.location.origin + dlUrl;
  navigator.clipboard.writeText(fullUrl).then(() => {
    showToast(t('toast_link_copied'), 'success');
  }).catch(() => {
    showToast(fullUrl);
  });
}

function toggleQrCode() {
  const qrBox = el('qrBox');
  if (!qrBox.classList.contains('hidden')) {
    qrBox.classList.add('hidden');
    return;
  }
  const dlUrl = buildDlUrl('video', selectedFormat?.format_id);
  if (!dlUrl) return;
  const fullUrl = encodeURIComponent(window.location.origin + dlUrl);
  el('qrImg').src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${fullUrl}`;
  qrBox.classList.remove('hidden');
  qrBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── Paste & Input ────────────────────────────────────────────────────────────
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    const cleanUrl = extractUrl(text);
    if (cleanUrl && isValidUrl(cleanUrl)) {
      el('urlInput').value = cleanUrl;
      updateClearBtn();
      showToast(t('toast_copied'), 'success');
      setTimeout(handleAnalyze, 150);
    } else if (text) {
      el('urlInput').value = text.trim();
      updateClearBtn();
      showToast(t('toast_invalid'), 'error');
    }
  } catch {
    showToast(t('toast_clipboard_err'), 'error');
  }
}

function updateClearBtn() {
  const val = el('urlInput').value.trim();
  el('clearBtn').classList.toggle('hidden', !val);
}

function setupLongPress() {
  const input  = el('urlInput');
  let   timer  = null;
  input.addEventListener('touchstart', () => { timer = setTimeout(pasteFromClipboard, 600); }, { passive: true });
  input.addEventListener('touchend',   () => clearTimeout(timer));
  input.addEventListener('touchmove',  () => clearTimeout(timer));
}

// ─── PWA Installer ───────────────────────────────────────────────────────────
function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    el('pwaInstallBtn').classList.remove('hidden');
  });

  el('pwaInstallBtn').addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      el('pwaInstallBtn').classList.add('hidden');
    }
    deferredInstallPrompt = null;
  });
}

// ─── Legal Modal ──────────────────────────────────────────────────────────────
const LEGAL_CONTENT = {
  privacy: {
    title_id: 'Kebijakan Privasi', title_en: 'Privacy Policy',
    body_id: `
      <h4>1. Pengumpulan Informasi</h4>
      <p>VidGet tidak menyimpan data pribadi pengguna. URL video yang dimasukkan hanya diproses secara instan di memori server untuk pengunduhan file.</p>
      <h4>2. Cookie & Penyimpanan Lokal</h4>
      <p>Kami hanya menggunakan LocalStorage browser untuk menyimpan preferensi tema (gelap/terang) dan bahasa (Indonesia/Inggris) Anda.</p>
      <h4>3. Keamanan Data</h4>
      <p>Koneksi ke VidGet dilindungi oleh enkripsi SSL/TLS standar industri.</p>
    `,
    body_en: `
      <h4>1. Information Collection</h4>
      <p>VidGet does not collect personal user data. Video URLs entered are only processed instantly in server memory for file download.</p>
      <h4>2. Cookies & Local Storage</h4>
      <p>We only use browser LocalStorage to save your theme preference (dark/light) and language (Indonesian/English).</p>
      <h4>3. Data Security</h4>
      <p>Connections to VidGet are secured using industry-standard SSL/TLS encryption.</p>
    `
  },
  terms: {
    title_id: 'Syarat & Ketentuan', title_en: 'Terms of Service',
    body_id: `
      <h4>1. Ketentuan Penggunaan</h4>
      <p>Layanan VidGet disediakan secara gratis untuk penggunaan pribadi. Pengguna bertanggung jawab penuh atas materi video yang diunduh.</p>
      <h4>2. Hak Cipta</h4>
      <p>VidGet menghormati hak cipta pemilik konten. Jangan mengunduh atau mendistribusikan konten yang dilindungi hak cipta tanpa izin.</p>
      <h4>3. Penafian</h4>
      <p>VidGet tidak berafiliasi dengan YouTube, TikTok, Instagram, Facebook, atau platform pihak ketiga manapun.</p>
    `,
    body_en: `
      <h4>1. Terms of Use</h4>
      <p>VidGet service is provided free for personal use. Users are solely responsible for downloaded media content.</p>
      <h4>2. Copyright</h4>
      <p>VidGet respects copyright laws. Please do not download or distribute copyrighted content without authorization.</p>
      <h4>3. Disclaimer</h4>
      <p>VidGet is not affiliated with YouTube, TikTok, Instagram, Facebook, or any third-party platform.</p>
    `
  },
  contact: {
    title_id: 'Kontak Kami', title_en: 'Contact Us',
    body_id: `
      <h4>Hubungi Tim VidGet</h4>
      <p>Jika Anda memiliki pertanyaan, saran, atau laporan bug, silakan hubungi kami di:</p>
      <p>📧 Email: <strong>support@vidget.app</strong></p>
      <p>⚡ Respon cepat dalam 24 jam kerja.</p>
    `,
    body_en: `
      <h4>Contact VidGet Team</h4>
      <p>If you have questions, feedback, or bug reports, please reach out to us at:</p>
      <p>📧 Email: <strong>support@vidget.app</strong></p>
      <p>⚡ Fast response within 24 business hours.</p>
    `
  }
};

function openLegalModal(key) {
  const cfg = LEGAL_CONTENT[key];
  if (!cfg) return;
  el('modalTitle').textContent = currentLang === 'id' ? cfg.title_id : cfg.title_en;
  el('modalBody').innerHTML   = currentLang === 'id' ? cfg.body_id  : cfg.body_en;
  el('legalModal').classList.remove('hidden');
}

function closeLegalModal() {
  el('legalModal').classList.add('hidden');
}

// ─── Back to Top ──────────────────────────────────────────────────────────────
function setupBackToTop() {
  const btn = el('backToTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  applyLang();
  applyTheme();
  showSection('hero');

  // Controls
  el('themeToggle').addEventListener('click', toggleTheme);
  el('langToggle').addEventListener('click', toggleLang);

  // Category buttons
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      applyCategory(cat);
    });
  });

  // URL Input
  const input = el('urlInput');
  input.addEventListener('input', updateClearBtn);
  input.addEventListener('paste', (e) => {
    const pastedText = e.clipboardData ? e.clipboardData.getData('text') : '';
    setTimeout(() => {
      const val = input.value.trim() || pastedText.trim();
      const cleanUrl = extractUrl(val);
      if (cleanUrl) input.value = cleanUrl;
      updateClearBtn();
      if (cleanUrl && isValidUrl(cleanUrl)) {
        setTimeout(handleAnalyze, 150);
      }
    }, 60);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAnalyze(); }
  });

  el('pasteBtn').addEventListener('click', pasteFromClipboard);
  el('clearBtn').addEventListener('click', () => {
    input.value = '';
    updateClearBtn();
    input.focus();
  });
  el('analyzeBtn').addEventListener('click', handleAnalyze);

  // Tabs
  el('tabVideo').addEventListener('click', () => switchTab('video'));
  el('tabAudio').addEventListener('click', () => switchTab('audio'));
  el('tabThumb').addEventListener('click', () => switchTab('thumb'));

  // Download & Actions
  el('downloadVideoBtn').addEventListener('click', () => {
    const url = buildDlUrl('video', selectedFormat?.format_id);
    if (url) triggerDownload(url);
  });
  el('downloadAudioBtn').addEventListener('click', () => {
    const url = buildDlUrl('audio');
    if (url) triggerDownload(url);
  });
  el('downloadThumbBtn').addEventListener('click', () => {
    const url = buildDlUrl('thumbnail');
    if (url) triggerDownload(url);
  });

  el('copyLinkBtn').addEventListener('click', copyDirectLink);
  el('qrBtn').addEventListener('click', toggleQrCode);

  // New download & Retry
  el('newDownloadBtn').addEventListener('click', () => {
    currentVideoInfo = null;
    selectedFormat   = null;
    input.value      = '';
    updateClearBtn();
    showSection('hero');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => input.focus(), 400);
  });
  el('retryBtn').addEventListener('click', () => {
    showSection('hero');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => input.focus(), 400);
  });

  // Legal Modal
  el('linkPrivacy').addEventListener('click', (e) => { e.preventDefault(); openLegalModal('privacy'); });
  el('linkTerms').addEventListener('click',   (e) => { e.preventDefault(); openLegalModal('terms'); });
  el('linkContact').addEventListener('click', (e) => { e.preventDefault(); openLegalModal('contact'); });
  el('modalClose').addEventListener('click', closeLegalModal);
  el('legalModal').addEventListener('click', (e) => {
    if (e.target === el('legalModal')) closeLegalModal();
  });

  setupLongPress();
  setupPWA();
  setupBackToTop();
}

document.addEventListener('DOMContentLoaded', init);
