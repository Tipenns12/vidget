# 🎬 VidGet — Video Downloader

Download video dari 1000+ platform dalam hitungan detik.
Mendukung: YouTube, Instagram, TikTok, Twitter/X, Facebook, Vimeo, Dailymotion, dan banyak lagi.

---

## 🚀 Cara Install & Menjalankan

### 1. Prasyarat (Prerequisites)

Pastikan sudah terinstall:
- **Node.js** v16+ → https://nodejs.org
- **Python** 3.8+ → https://python.org
- **yt-dlp** → tool backend download

Install yt-dlp:
```bash
pip install yt-dlp
# atau jika pip3:
pip3 install yt-dlp

# Pastikan yt-dlp bisa dijalankan:
yt-dlp --version
```

---

### 2. Install Dependensi Backend

```bash
cd backend
npm install
```

---

### 3. Jalankan Server

```bash
# Development (dengan auto-reload):
npm run dev

# Production:
npm start
```

Server akan berjalan di: **http://localhost:3000**

---

## 📁 Struktur Project

```
video-downloader/
├── backend/
│   ├── server.js         # Express API server
│   └── package.json
├── frontend/
│   ├── index.html        # Main HTML
│   ├── css/
│   │   └── style.css     # Dark mode premium CSS
│   └── js/
│       └── app.js        # Logic, bilingual, long-press paste
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/info` | Ambil info video (title, thumbnail, formats) |
| `GET`  | `/api/download` | Download/stream file |
| `POST` | `/api/batch` | Ambil info banyak URL sekaligus |
| `GET`  | `/api/health` | Cek status server & yt-dlp |

### Contoh Request

```bash
# Ambil info video
curl -X POST http://localhost:3000/api/info \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Download video (buka di browser)
http://localhost:3000/api/download?url=<URL>&type=video

# Download audio MP3
http://localhost:3000/api/download?url=<URL>&type=audio

# Download thumbnail
http://localhost:3000/api/download?url=<URL>&type=thumbnail
```

---

## ✨ Fitur

- 🎥 **Download MP4** — pilih kualitas 360p, 480p, 720p, 1080p+
- 🎵 **Download MP3** — ekstrak audio dalam kualitas terbaik
- 🖼️ **Download Thumbnail** — simpan thumbnail video
- 📋 **Batch Download** — analisis hingga 20 URL sekaligus
- 🌍 **Bilingual** — Bahasa Indonesia & English dengan tombol ganti bahasa
- 📱 **Responsive** — dioptimalkan untuk HP, tablet, dan desktop
- 👆 **Long-press Paste** — tekan & tahan di kolom URL untuk tempel dari clipboard
- 🌙 **Dark Mode** — tampilan gelap premium

---

## 🚢 Deploy ke Cloud

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login & deploy
railway login
cd backend
railway up
```

### Render

1. Push ke GitHub
2. Buat New Web Service di render.com
3. Set **Root Directory** ke `backend/`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`

### Environment Variables (opsional)

```
PORT=3000          # Port server (default: 3000)
```

---

## ⚠️ Catatan Penting

- Tool ini hanya untuk **penggunaan pribadi**
- Hormati **hak cipta** konten creator
- Beberapa platform mungkin membatasi download
- yt-dlp perlu di-update secara berkala: `pip install -U yt-dlp`

---

## 🔧 Update yt-dlp

```bash
pip install -U yt-dlp
```

---

## 📄 Lisensi

MIT License — Gunakan secara bertanggung jawab.
