#!/bin/sh
# startup.sh — Auto-update yt-dlp then start the Node server

echo "⬆️  Updating yt-dlp to latest version..."
yt-dlp -U 2>&1 || echo "⚠️  yt-dlp update failed (non-critical, using installed version)"

echo "✅  yt-dlp version: $(yt-dlp --version)"
echo "🚀  Starting VidGet server..."

exec node /app/server.js
