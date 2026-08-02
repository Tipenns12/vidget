# ── Base image: Node.js slim ────────────────────────────────────────────────
FROM node:20-slim

# ── Install Python, pip, ffmpeg (untuk merge video+audio) ───────────────────
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Install yt-dlp versi terbaru langsung dari GitHub release ────────────────
# Pakai binary langsung (bukan pip) supaya lebih cepat update & tidak perlu python
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# ── Set working directory ────────────────────────────────────────────────────
WORKDIR /app

# ── Copy package files dulu (layer caching) ─────────────────────────────────
COPY package*.json ./

# ── Install Node.js dependencies ─────────────────────────────────────────────
RUN npm install --production

# ── Copy semua file project ──────────────────────────────────────────────────
COPY . .

# ── Copy startup script ──────────────────────────────────────────────────────
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

# ── Expose port ──────────────────────────────────────────────────────────────
EXPOSE 3000

# ── Start via startup script (updates yt-dlp then starts server) ─────────────
CMD ["/startup.sh"]
