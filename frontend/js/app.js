/* ═══════════════════════════════════════════════════════════════════════════
   VidGet — App Logic (Bilingual ID/EN, Long-press paste, API calls)
═══════════════════════════════════════════════════════════════════════════ */

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  id: {
    badge_text:         'Gratis & Tanpa Batas',
    hero_title_1:       'Download Video',
    hero_title_2:       'dari Mana Saja',
    hero_subtitle:      'Dukung 1000+ situs: YouTube, Instagram, TikTok, Twitter, Facebook, Vimeo & lebih banyak lagi',
    placeholder:        'Tempel atau ketik URL video di sini...',
    btn_paste:          'Tempel',
    btn_analyze:        'Analisis',
    search_hint:        'Tekan & tahan di kolom URL untuk menempel dari clipboard (mobile)',
    more_sites:         '1000+ Lainnya',
    loading_text:       'Mengambil info video...',
    loading_sub:        'Ini mungkin butuh beberapa detik',
    btn_retry:          'Coba Lagi',
    tab_video:          'Video (MP4)',
    tab_audio:          'Audio (MP3)',
    tab_thumb:          'Thumbnail',
    label_select_quality: 'Pilih Kualitas:',
    btn_download_video: 'Download Video',
    btn_download_audio: 'Download MP3',
    btn_download_thumb: 'Download Thumbnail',
    audio_format:       'Format: MP3',
    audio_quality:      'Kualitas terbaik yang tersedia',
    btn_new:            'Download Lainnya',
    nav_batch:          'Batch',
    batch_tag:          'Batch Download',
    batch_title:        'Download Banyak Video Sekaligus',
    batch_subtitle:     'Tempel hingga 20 URL sekaligus, satu per baris',
    batch_placeholder:  'Tempel URL di sini, satu per baris...\nhttps://www.youtube.com/watch?v=...\nhttps://www.tiktok.com/...',
    btn_clear:          'Bersihkan',
    btn_batch_analyze:  'Analisis Semua',
    batch_results_label:'Hasil Batch:',
    features_title:     'Mengapa Pilih VidGet?',
    f1_title:           'Super Cepat',
    f1_desc:            'Download dalam hitungan detik tanpa antrian atau menunggu',
    f2_title:           'Aman & Privat',
    f2_desc:            'Tidak menyimpan riwayat atau data pribadi kamu',
    f3_title:           'Multi Format',
    f3_desc:            'MP4, MP3, dan Thumbnail — semua kualitas tersedia',
    f4_title:           'Mobile Friendly',
    f4_desc:            'Dioptimalkan untuk HP — tekan & tahan untuk tempel URL',
    f5_title:           '1000+ Platform',
    f5_desc:            'YouTube, Instagram, TikTok, Twitter, Vimeo, dan ratusan lainnya',
    f6_title:           'Batch Download',
    f6_desc:            'Download puluhan video sekaligus dengan fitur batch',
    footer_desc:        'Download video gratis dari 1000+ platform',
    footer_powered:     'Powered by yt-dlp',
    footer_disclaimer:  'Hanya untuk penggunaan pribadi. Hormati hak cipta konten creator.',
    toast_pasted:       'URL berhasil ditempel',
    toast_copied:       'URL disalin',
    toast_no_clipboard: 'Clipboard kosong atau tidak ada izin',
    toast_invalid_url:  'URL tidak valid',
    toast_download_start:'Download dimulai...',
    toast_error:        'Terjadi kesalahan',
    views:              'ditonton',
    likes:              'suka',
    no_video_format:    'Tidak ada format video tersedia',
    quality_label:      (h) => h ? `${h}p` : 'Auto',
  },
  en: {
    badge_text:         'Free & Unlimited',
    hero_title_1:       'Download Videos',
    hero_title_2:       'from Anywhere',
    hero_subtitle:      'Supports 1000+ sites: YouTube, Instagram, TikTok, Twitter, Facebook, Vimeo & many more',
    placeholder:        'Paste or type video URL here...',
    btn_paste:          'Paste',
    btn_analyze:        'Analyze',
    search_hint:        'Long-press the URL field to paste from clipboard (mobile)',
    more_sites:         '1000+ More',
    loading_text:       'Fetching video info...',
    loading_sub:        'This may take a few seconds',
    btn_retry:          'Try Again',
    tab_video:          'Video (MP4)',
    tab_audio:          'Audio (MP3)',
    tab_thumb:          'Thumbnail',
    label_select_quality: 'Select Quality:',
    btn_download_video: 'Download Video',
    btn_download_audio: 'Download MP3',
    btn_download_thumb: 'Download Thumbnail',
    audio_format:       'Format: MP3',
    audio_quality:      'Best available quality',
    btn_new:            'Download Another',
    nav_batch:          'Batch',
    batch_tag:          'Batch Download',
    batch_title:        'Download Multiple Videos at Once',
    batch_subtitle:     'Paste up to 20 URLs at once, one per line',
    batch_placeholder:  'Paste URLs here, one per line...\nhttps://www.youtube.com/watch?v=...\nhttps://www.tiktok.com/...',
    btn_clear:          'Clear',
    btn_batch_analyze:  'Analyze All',
    batch_results_label:'Batch Results:',
    features_title:     'Why Choose VidGet?',
    f1_title:           'Super Fast',
    f1_desc:            'Download in seconds without queues or waiting',
    f2_title:           'Safe & Private',
    f2_desc:            'We never store your history or personal data',
    f3_title:           'Multi Format',
    f3_desc:            'MP4, MP3, and Thumbnails — all qualities available',
    f4_title:           'Mobile Friendly',
    f4_desc:            'Optimized for phones — long-press to paste URL',
    f5_title:           '1000+ Platforms',
    f5_desc:            'YouTube, Instagram, TikTok, Twitter, Vimeo, and hundreds more',
    f6_title:           'Batch Download',
    f6_desc:            'Download dozens of videos at once with batch mode',
    footer_desc:        'Free video downloads from 1000+ platforms',
    footer_powered:     'Powered by yt-dlp',
    footer_disclaimer:  'For personal use only. Respect content creators\' copyrights.',
    toast_pasted:       'URL pasted successfully',
    toast_copied:       'URL copied',
    toast_no_clipboard: 'Clipboard empty or permission denied',
    toast_invalid_url:  'Invalid URL',
    toast_download_start:'Download started...',
    toast_error:        'An error occurred',
    views:              'views',
    likes:              'likes',
    no_video_format:    'No video formats available',
    quality_label:      (h) => h ? `${h}p` : 'Auto',
  }
};

// ─── State ────────────────────────────────────────────────────────────────────
let currentLang = localStorage.getItem('vidget_lang') || 'id';
let currentVideoInfo = null;
let selectedFormat = null;
let activeTab = 'video';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const t = (key, ...args) => {
  const val = TRANSLATIONS[currentLang][key];
  return typeof val === 'function' ? val(...args) : (val || key);
};

const el = (id) => document.getElementById(id);

function isValidUrl(str) {
  try {
    const url = new URL(str.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch { return false; }
}

function formatNumber(n) {
  if (!n) return null;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function formatDate(yyyymmdd) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return null;
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return new Date(`${y}-${m}-${d}`).toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ─── Toast Notifications ──────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  const container = el('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-dot"></div><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.25s ease forwards';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// ─── Language System ──────────────────────────────────────────────────────────
function applyTranslations() {
  // Update all [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (TRANSLATIONS[currentLang][key] && typeof TRANSLATIONS[currentLang][key] === 'string') {
      el.textContent = TRANSLATIONS[currentLang][key];
    }
  });

  // Update all [data-i18n-placeholder] elements
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (TRANSLATIONS[currentLang][key]) {
      el.placeholder = TRANSLATIONS[currentLang][key];
    }
  });

  // Update html lang
  document.documentElement.lang = currentLang;
}

function toggleLanguage() {
  currentLang = currentLang === 'id' ? 'en' : 'id';
  localStorage.setItem('vidget_lang', currentLang);

  el('langFlag').textContent = currentLang === 'id' ? '🇮🇩' : '🇬🇧';
  el('langLabel').textContent = currentLang === 'id' ? 'ID' : 'EN';

  applyTranslations();

  // Re-render results if visible
  if (currentVideoInfo) renderResults(currentVideoInfo);
}

// ─── Long-Press Paste Logic ──────────────────────────────────────────────────
function setupLongPressPaste() {
  const urlInput = el('urlInput');
  let longPressTimer = null;
  const LONG_PRESS_MS = 500;

  const cancelLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  const triggerPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        urlInput.value = text.trim();
        urlInput.dispatchEvent(new Event('input'));
        showToast(t('toast_pasted'), 'success');
      } else {
        showToast(t('toast_no_clipboard'), 'error');
      }
    } catch {
      // Browser will show native context menu — that's fine
      showToast(t('toast_no_clipboard'), 'info');
    }
  };

  // Touch: long press
  urlInput.addEventListener('touchstart', () => {
    longPressTimer = setTimeout(triggerPaste, LONG_PRESS_MS);
  }, { passive: true });

  urlInput.addEventListener('touchend', cancelLongPress, { passive: true });
  urlInput.addEventListener('touchmove', cancelLongPress, { passive: true });
  urlInput.addEventListener('touchcancel', cancelLongPress, { passive: true });

  // Desktop: paste button click
  el('pasteBtn').addEventListener('click', async () => {
    await triggerPaste();
    urlInput.focus();
  });
}

// ─── URL Input Handler ────────────────────────────────────────────────────────
function setupUrlInput() {
  const urlInput = el('urlInput');
  const clearBtn = el('clearBtn');

  urlInput.addEventListener('input', () => {
    const hasValue = urlInput.value.trim().length > 0;
    clearBtn.classList.toggle('hidden', !hasValue);
  });

  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    clearBtn.classList.add('hidden');
    urlInput.focus();
  });

  // Handle paste from native context menu
  urlInput.addEventListener('paste', (e) => {
    setTimeout(() => {
      urlInput.dispatchEvent(new Event('input'));
    }, 50);
  });

  // Enter key to submit
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAnalyze();
    }
  });

  // Auto-detect pasted URLs and trim them
  urlInput.addEventListener('blur', () => {
    if (urlInput.value) urlInput.value = urlInput.value.trim();
  });
}

// ─── Tab Switching ────────────────────────────────────────────────────────────
function setupTabs() {
  const tabs = [
    { btn: el('tabVideo'),  content: el('contentVideo'),  key: 'video' },
    { btn: el('tabAudio'),  content: el('contentAudio'),  key: 'audio' },
    { btn: el('tabThumb'),  content: el('contentThumb'),  key: 'thumb' },
  ];

  tabs.forEach(({ btn, content, key }) => {
    btn.addEventListener('click', () => {
      activeTab = key;
      tabs.forEach(t => {
        t.btn.classList.toggle('active', t.key === key);
        t.btn.setAttribute('aria-selected', t.key === key);
        t.content.classList.toggle('hidden', t.key !== key);
      });
    });
  });
}

// ─── Analyze Video ─────────────────────────────────────────────────────────────
async function handleAnalyze() {
  const urlInput = el('urlInput');
  const url = urlInput.value.trim();

  if (!url) {
    urlInput.focus();
    return;
  }

  if (!isValidUrl(url)) {
    showToast(t('toast_invalid_url'), 'error');
    urlInput.focus();
    return;
  }

  // UI: show loading with animated messages
  setLoading(true);
  showSection('loading');
  // Scroll ke loading section supaya user melihat spinner
  el('loadingSection').scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Animated loading messages
  const loadingMessages = currentLang === 'id'
    ? ['Menghubungi server...', 'Mengambil info video...', 'Memproses data...', 'Hampir selesai...']
    : ['Connecting to server...', 'Fetching video info...', 'Processing data...', 'Almost done...'];

  const loadingTextEl = el('loadingSection').querySelector('[data-i18n="loading_text"]');
  const loadingSubEl  = el('loadingSection').querySelector('[data-i18n="loading_sub"]');
  let msgIdx = 0;
  let elapsedSecs = 0;

  const msgInterval = setInterval(() => {
    elapsedSecs++;
    if (loadingTextEl) loadingTextEl.textContent = loadingMessages[Math.min(msgIdx++, loadingMessages.length - 1)];
    if (loadingSubEl)  loadingSubEl.textContent  = `${elapsedSecs}s...`;
  }, 2500);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    const res = await fetch('/api/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || t('toast_error'));
    }

    currentVideoInfo = { ...data, url };
    renderResults(data);
    showSection('results');

    // Smooth scroll to results
    el('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    const msg = err.name === 'AbortError'
      ? (currentLang === 'id' ? 'Timeout — server terlalu lama merespons' : 'Timeout — server took too long')
      : (err.message || t('toast_error'));
    showError(msg);
    showSection('results');
  } finally {
    clearInterval(msgInterval);
    setLoading(false);
  }
}


// ─── Render Results ────────────────────────────────────────────────────────────
function renderResults(info) {
  el('errorCard').classList.add('hidden');
  el('resultCard').classList.remove('hidden');

  // Thumbnail
  const thumb = info.thumbnail || '';
  el('thumbImg').src = thumb;
  el('thumbImg').alt = info.title || 'Video thumbnail';
  el('thumbPreviewLarge').src = thumb;

  // Duration
  const dur = el('thumbDuration');
  dur.textContent = info.duration_string || '';
  dur.style.display = info.duration_string ? 'block' : 'none';

  // Platform
  const plat = el('thumbPlatform');
  plat.textContent = info.platform || '';
  plat.style.display = info.platform ? 'block' : 'none';

  // Meta
  el('resultTitle').textContent = info.title || '(No title)';
  el('resultUploader').textContent = info.uploader || '';

  // Stats
  const stats = el('resultStats');
  stats.innerHTML = '';
  if (info.view_count) {
    const b = document.createElement('span');
    b.className = 'stat-badge';
    b.textContent = `${formatNumber(info.view_count)} ${t('views')}`;
    stats.appendChild(b);
  }
  if (info.like_count) {
    const b = document.createElement('span');
    b.className = 'stat-badge';
    b.textContent = `${formatNumber(info.like_count)} ${t('likes')}`;
    stats.appendChild(b);
  }
  if (info.upload_date) {
    const b = document.createElement('span');
    b.className = 'stat-badge';
    b.textContent = formatDate(info.upload_date) || '';
    if (b.textContent) stats.appendChild(b);
  }

  // Quality grid
  renderQualityGrid(info.video_formats || []);

  // Reset to video tab
  el('tabVideo').click();
}

function renderQualityGrid(formats) {
  const grid = el('qualityGrid');
  grid.innerHTML = '';
  selectedFormat = null;

  if (formats.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-3);font-size:0.85rem">${t('no_video_format')}</p>`;
    return;
  }

  formats.forEach((fmt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quality-btn' + (idx === 0 ? ' selected' : '');
    btn.setAttribute('data-format-id', fmt.format_id);
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', idx === 0 ? 'true' : 'false');

    const label = t('quality_label', fmt.height);
    const size = fmt.filesize_str || '';
    const fps = fmt.fps && fmt.fps > 30 ? `${fmt.fps}fps` : '';

    btn.innerHTML = `
      <span class="q-label">${label}</span>
      <span class="q-size">${[fmt.ext?.toUpperCase(), fps, size].filter(Boolean).join(' · ')}</span>
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

    if (idx === 0) selectedFormat = fmt;
    grid.appendChild(btn);
  });
}

// ─── Download Handlers ─────────────────────────────────────────────────────────
function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast(t('toast_download_start'), 'success');
}

function buildDownloadUrl(type, formatId) {
  if (!currentVideoInfo) return null;
  const params = new URLSearchParams({
    url: currentVideoInfo.url,
    type,
    title: currentVideoInfo.title || 'video',
    ...(formatId && { format_id: formatId })
  });
  return `/api/download?${params.toString()}`;
}

function setupDownloadButtons() {
  el('downloadVideoBtn').addEventListener('click', () => {
    const fmt = selectedFormat;
    const dlUrl = buildDownloadUrl('video', fmt?.format_id);
    if (dlUrl) triggerDownload(dlUrl, `${currentVideoInfo.title || 'video'}.mp4`);
  });

  el('downloadAudioBtn').addEventListener('click', () => {
    const dlUrl = buildDownloadUrl('audio');
    if (dlUrl) triggerDownload(dlUrl, `${currentVideoInfo.title || 'audio'}.mp3`);
  });

  el('downloadThumbBtn').addEventListener('click', () => {
    if (!currentVideoInfo?.thumbnail) return;
    // Direct link to thumbnail
    const a = document.createElement('a');
    a.href = `/api/download?${new URLSearchParams({ url: currentVideoInfo.url, type: 'thumbnail', title: currentVideoInfo.title })}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(t('toast_download_start'), 'success');
  });

  el('newDownloadBtn').addEventListener('click', () => {
    currentVideoInfo = null;
    selectedFormat = null;
    el('urlInput').value = '';
    el('clearBtn').classList.add('hidden');
    showSection('hero');
    el('heroSection').scrollIntoView({ behavior: 'smooth' });
    el('urlInput').focus();
  });

  el('retryBtn').addEventListener('click', () => {
    showSection('hero');
    el('urlInput').focus();
  });
}

// ─── Show / Hide Sections ──────────────────────────────────────────────────────
function showSection(section) {
  const hero    = el('heroSection');
  const loading = el('loadingSection');
  const results = el('resultsSection');

  // Hide all
  hero.classList.add('hidden');
  loading.classList.add('hidden');
  results.classList.add('hidden');

  // Show target
  if (section === 'hero')    hero.classList.remove('hidden');
  if (section === 'loading') loading.classList.remove('hidden');
  if (section === 'results') results.classList.remove('hidden');
}

function showError(message) {
  el('errorCard').classList.remove('hidden');
  el('resultCard').classList.add('hidden');
  el('errorMsg').textContent = message;
}

function setLoading(loading) {
  const btn = el('analyzeBtn');
  const btnLoader = el('btnLoader');
  const btnIcon = btn.querySelector('.btn-icon');

  if (loading) {
    btn.disabled = true;
    btnLoader.classList.remove('hidden');
    if (btnIcon) btnIcon.classList.add('hidden');
  } else {
    btn.disabled = false;
    btnLoader.classList.add('hidden');
    if (btnIcon) btnIcon.classList.remove('hidden');
  }
}

// ─── Batch Download ───────────────────────────────────────────────────────────
function setupBatch() {
  const batchInput = el('batchInput');
  const batchCount = el('batchCount');

  // Count URLs as user types
  batchInput.addEventListener('input', () => {
    const urls = parseBatchUrls(batchInput.value);
    batchCount.textContent = `${urls.length} URL${urls.length !== 1 ? 's' : ''}`;
  });

  el('batchClearBtn').addEventListener('click', () => {
    batchInput.value = '';
    batchCount.textContent = '0 URLs';
    el('batchResults').classList.add('hidden');
  });

  el('batchAnalyzeBtn').addEventListener('click', handleBatchAnalyze);

  // Nav button scrolls to batch section
  el('batchNavBtn').addEventListener('click', () => {
    el('batchSection').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => batchInput.focus(), 400);
  });
}

function parseBatchUrls(text) {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && isValidUrl(l));
}

async function handleBatchAnalyze() {
  const batchInput = el('batchInput');
  const urls = parseBatchUrls(batchInput.value);

  if (urls.length === 0) {
    showToast(t('toast_invalid_url'), 'error');
    return;
  }

  if (urls.length > 20) {
    showToast('Maksimal 20 URL per batch', 'error');
    return;
  }

  const btn = el('batchAnalyzeBtn');
  btn.disabled = true;

  // Show loading state for each
  el('batchResults').classList.remove('hidden');
  const list = el('batchList');
  list.innerHTML = '';
  el('batchResultCount').textContent = `${urls.length} URL`;

  urls.forEach((url) => {
    const item = createBatchItemLoading(url);
    list.appendChild(item);
  });

  try {
    const res = await fetch('/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls })
    });

    const results = await res.json();
    renderBatchResults(results);
  } catch (err) {
    showToast(t('toast_error'), 'error');
  } finally {
    btn.disabled = false;
  }
}

function createBatchItemLoading(url) {
  const div = document.createElement('div');
  div.className = 'batch-item';
  div.dataset.url = url;
  div.innerHTML = `
    <div class="batch-item-status loading"></div>
    <div class="batch-item-info">
      <div class="batch-item-title">${url}</div>
    </div>
  `;
  return div;
}

function renderBatchResults(results) {
  const list = el('batchList');
  list.innerHTML = '';

  results.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'batch-item';

    if (item.status === 'success') {
      const dlParams = new URLSearchParams({
        url: item.url,
        type: 'video',
        title: item.title || 'video'
      });

      div.innerHTML = `
        <div class="batch-item-status success"></div>
        ${item.thumbnail ? `<img class="batch-item-thumb" src="${item.thumbnail}" alt="${item.title}" loading="lazy" />` : ''}
        <div class="batch-item-info">
          <div class="batch-item-title" title="${item.title || ''}">${item.title || item.url}</div>
          <div class="batch-item-meta">
            ${item.platform ? `<span class="batch-meta-tag">${item.platform}</span>` : ''}
            ${item.duration_string ? `<span class="batch-meta-tag">${item.duration_string}</span>` : ''}
            ${item.uploader ? `<span class="batch-meta-tag">${item.uploader}</span>` : ''}
          </div>
        </div>
        <div class="batch-item-actions">
          <a class="batch-dl-btn" href="/api/download?${dlParams}" target="_blank">⬇ MP4</a>
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="batch-item-status error"></div>
        <div class="batch-item-info">
          <div class="batch-item-title">${item.url || 'Unknown URL'}</div>
          <div class="batch-item-error">${item.error || 'Gagal mengambil info'}</div>
        </div>
      `;
    }

    list.appendChild(div);
  });
}

// ─── Header scroll effect ──────────────────────────────────────────────────────
function setupHeaderScroll() {
  const header = el('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 10);
    lastScroll = y;
  }, { passive: true });
}

// ─── Health Check ─────────────────────────────────────────────────────────────
async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (!data.yt_dlp) {
      showToast('⚠ yt-dlp belum terinstall — download tidak akan berfungsi', 'error', 6000);
    }
  } catch {
    // Server not reachable — likely dev with no backend, ignore
  }
}

// ─── Keyboard Shortcuts ────────────────────────────────────────────────────────
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K → focus URL input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      el('urlInput').focus();
      el('urlInput').select();
    }
  });
}

// ─── Analyze button handler ────────────────────────────────────────────────────
function setupAnalyzeBtn() {
  el('analyzeBtn').addEventListener('click', handleAnalyze);
  el('langToggle').addEventListener('click', toggleLanguage);
  el('logoLink').addEventListener('click', (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      el('heroSection').scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  // Apply saved language
  el('langFlag').textContent = currentLang === 'id' ? '🇮🇩' : '🇬🇧';
  el('langLabel').textContent = currentLang === 'id' ? 'ID' : 'EN';
  applyTranslations();

  // Setup all components
  setupLongPressPaste();
  setupUrlInput();
  setupTabs();
  setupDownloadButtons();
  setupBatch();
  setupHeaderScroll();
  setupAnalyzeBtn();
  setupKeyboardShortcuts();

  // Check yt-dlp is installed
  checkHealth();
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
