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

# ── Install yt-dlp ──────────────────────────────────────────────────────────
RUN pip3 install yt-dlp --break-system-packages

# ── Set working directory ────────────────────────────────────────────────────
WORKDIR /app

# ── Copy package files dulu (layer caching) ─────────────────────────────────
COPY package*.json ./

# ── Install Node.js dependencies ─────────────────────────────────────────────
RUN npm install --production

# ── Copy semua file project ──────────────────────────────────────────────────
COPY . .

# ── Expose port ──────────────────────────────────────────────────────────────
EXPOSE 3000

# ── Start server ─────────────────────────────────────────────────────────────
CMD ["node", "server.js"]
