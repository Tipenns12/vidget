/* ═══════════════════════════════════════════════════════════════════════════
   VidGet — app.js  (v2)
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
    loading_text:       'Mengambil info video...',
    tab_video:          '🎬 Video',
    tab_audio:          '🎵 Audio',
    tab_thumb:          '🖼️ Thumbnail',
    quality_label:      'Pilih Kualitas:',
    audio_info:         'Format MP3, kualitas terbaik',
    btn_download_video: 'Download Video (MP4)',
    btn_download_audio: 'Download Audio (MP3)',
    btn_download_thumb: 'Download Thumbnail',
    btn_new:            '← Download Video Lain',
    btn_retry:          'Coba Lagi',
    error_title:        'Gagal mengambil video',
    features_title:     'Kenapa VidGet?',
    feat1_title: 'Super Cepat',        feat1_desc: 'Analisis video dalam hitungan detik.',
    feat2_title: '1000+ Platform',     feat2_desc: 'YouTube, TikTok, Instagram, Twitter, Facebook, dan ribuan lainnya.',
    feat3_title: 'Ramah Mobile',       feat3_desc: 'Tempel link dari HP dengan sekali ketuk. Desain mobile-first.',
    feat4_title: 'Pilih Kualitas',     feat4_desc: 'Dari 360p hingga 4K. Download MP4 atau ekstrak audio MP3.',
    howto_title: 'Cara Menggunakan',
    step1_title: 'Salin Link',         step1_desc: 'Buka video di aplikasi atau browser, lalu salin linknya.',
    step2_title: 'Tempel & Analisis',  step2_desc: 'Tempel link di kolom di atas. Analisis otomatis dimulai.',
    step3_title: 'Download',           step3_desc: 'Pilih kualitas yang diinginkan lalu klik tombol Download.',
    toast_copied:       '✓ URL ditempel dari clipboard',
    toast_clipboard_err:'Akses clipboard diblokir. Ketik URL secara manual.',
    toast_invalid:      '⚠ URL tidak valid',
    toast_dl_start:     '⬇ Download dimulai...',
    toast_no_format:    'Tidak ada format video tersedia',
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
    loading_text:       'Fetching video info...',
    tab_video:          '🎬 Video',
    tab_audio:          '🎵 Audio',
    tab_thumb:          '🖼️ Thumbnail',
    quality_label:      'Select Quality:',
    audio_info:         'MP3 format, best quality',
    btn_download_video: 'Download Video (MP4)',
    btn_download_audio: 'Download Audio (MP3)',
    btn_download_thumb: 'Download Thumbnail',
    btn_new:            '← Download Another',
    btn_retry:          'Try Again',
    error_title:        'Failed to fetch video',
    features_title:     'Why VidGet?',
    feat1_title: 'Super Fast',         feat1_desc: 'Video analysis in seconds.',
    feat2_title: '1000+ Platforms',    feat2_desc: 'YouTube, TikTok, Instagram, Twitter, Facebook, and thousands more.',
    feat3_title: 'Mobile Friendly',    feat3_desc: 'Paste link from phone with one tap. Mobile-first design.',
    feat4_title: 'Choose Quality',     feat4_desc: 'From 360p to 4K. Download MP4 or extract MP3 audio.',
    howto_title: 'How to Use',
    step1_title: 'Copy Link',          step1_desc: 'Open a video in the app or browser, then copy the link.',
    step2_title: 'Paste & Analyze',    step2_desc: 'Paste the link above. Analysis starts automatically.',
    step3_title: 'Download',           step3_desc: 'Choose quality and click the Download button.',
    toast_copied:       '✓ URL pasted from clipboard',
    toast_clipboard_err:'Clipboard access blocked. Type URL manually.',
    toast_invalid:      '⚠ Invalid URL',
    toast_dl_start:     '⬇ Download starting...',
    toast_no_format:    'No video formats available',
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
let currentVideoInfo = null;
let selectedFormat   = null;
let activeTab        = 'video';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const el  = (id) => document.getElementById(id);
const t   = (key) => LANG[currentLang][key] || key;

function isValidUrl(str) {
  try {
    const u = new URL(str.trim());
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
    el('themeIcon').textContent = '🌙'; // show moon = switch to dark
  } else {
    html.removeAttribute('data-theme');
    el('themeIcon').textContent = '☀️'; // show sun = switch to light
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
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (LANG[currentLang][key]) el.textContent = LANG[currentLang][key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (LANG[currentLang][key]) el.placeholder = LANG[currentLang][key];
  });
  el('langFlag').textContent  = currentLang === 'id' ? '🇮🇩' : '🇬🇧';
  el('langLabel').textContent = currentLang === 'id' ? 'ID' : 'EN';
}

function toggleLang() {
  currentLang = currentLang === 'id' ? 'en' : 'id';
  localStorage.setItem('vg_lang', currentLang);
  applyLang();
  if (currentVideoInfo) renderResults(currentVideoInfo);
}

// ─── Section Control ──────────────────────────────────────────────────────────
function showSection(name) {
  const hero    = el('heroSection');
  const loading = el('loadingSection');
  const results = el('resultsSection');
  // hide all
  hero.classList.add('hidden');
  loading.classList.add('hidden');
  results.classList.add('hidden');
  // show target
  if (name === 'hero')    hero.classList.remove('hidden');
  if (name === 'loading') loading.classList.remove('hidden');
  if (name === 'results') results.classList.remove('hidden');
}

// ─── Analyze ──────────────────────────────────────────────────────────────────
async function handleAnalyze() {
  const input = el('urlInput');
  const url   = input.value.trim();

  if (!url) { input.focus(); return; }
  if (!isValidUrl(url)) {
    showToast(t('toast_invalid'), 'error');
    input.focus();
    return;
  }

  // Show loading
  showSection('loading');
  el('loadingSection').scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Animated loading messages
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
    const tOut = setTimeout(() => ctrl.abort(), 40000);

    const res  = await fetch('/api/info', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ url }),
      signal:  ctrl.signal,
    });
    clearTimeout(tOut);

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('err_generic'));

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

  // Thumbnail
  const thumb = info.thumbnail || '';
  el('thumbImg').src      = thumb;
  el('thumbPreview').src  = thumb;
  el('thumbImg').alt      = info.title || 'Thumbnail';

  // Duration
  const dur = el('durationBadge');
  dur.textContent = info.duration_string || '';
  dur.style.display = info.duration_string ? 'block' : 'none';

  // Platform
  el('platformBadge').textContent = info.platform || '';

  // Title
  el('videoTitle').textContent = info.title || 'Video';

  // Stats
  const stats = [];
  if (info.uploader)   stats.push('👤 ' + info.uploader);
  if (info.view_count) stats.push('👁 ' + formatNum(info.view_count));
  el('videoStats').textContent = stats.join('  ·  ');

  // Quality grid
  renderQualityGrid(info.video_formats || []);

  // Reset to video tab
  switchTab('video');
}

function showError(msg) {
  el('errorCard').classList.remove('hidden');
  el('resultCard').classList.add('hidden');
  el('errorMsg').textContent = msg;
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

// ─── Downloads ────────────────────────────────────────────────────────────────
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
  return '/api/download?' + p.toString();
}

// ─── Paste & Input ────────────────────────────────────────────────────────────
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && isValidUrl(text.trim())) {
      el('urlInput').value = text.trim();
      updateClearBtn();
      showToast(t('toast_copied'), 'success');
      // auto-analyze immediately after paste
      setTimeout(handleAnalyze, 200);
    } else if (text) {
      el('urlInput').value = text.trim();
      updateClearBtn();
      showToast(t('toast_copied'));
    }
  } catch {
    showToast(t('toast_clipboard_err'), 'error');
  }
}

function updateClearBtn() {
  const val = el('urlInput').value.trim();
  el('clearBtn').classList.toggle('hidden', !val);
}

// Long-press paste support
function setupLongPress() {
  const input  = el('urlInput');
  let   timer  = null;
  input.addEventListener('touchstart', () => { timer = setTimeout(pasteFromClipboard, 600); }, { passive: true });
  input.addEventListener('touchend',   () => clearTimeout(timer));
  input.addEventListener('touchmove',  () => clearTimeout(timer));
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

  // Theme toggle
  el('themeToggle').addEventListener('click', toggleTheme);

  // Language toggle
  el('langToggle').addEventListener('click', toggleLang);

  // URL Input
  const input = el('urlInput');

  input.addEventListener('input', updateClearBtn);

  // Auto-analyze on paste (Ctrl+V or right-click paste)
  input.addEventListener('paste', () => {
    setTimeout(() => {
      updateClearBtn();
      const val = input.value.trim();
      if (val && isValidUrl(val)) {
        setTimeout(handleAnalyze, 300);
      }
    }, 50);
  });

  // Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAnalyze(); }
  });

  // Paste button
  el('pasteBtn').addEventListener('click', pasteFromClipboard);

  // Clear button
  el('clearBtn').addEventListener('click', () => {
    input.value = '';
    updateClearBtn();
    input.focus();
  });

  // Analyze button
  el('analyzeBtn').addEventListener('click', handleAnalyze);

  // Tabs
  el('tabVideo').addEventListener('click', () => switchTab('video'));
  el('tabAudio').addEventListener('click', () => switchTab('audio'));
  el('tabThumb').addEventListener('click', () => switchTab('thumb'));

  // Download buttons
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

  // New download / retry
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

  // Long press paste (mobile)
  setupLongPress();

  // Back to top
  setupBackToTop();
}

document.addEventListener('DOMContentLoaded', init);
