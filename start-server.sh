#!/bin/bash

# Script untuk start dev server dengan clean port
# Mengatasi error: EADDRINUSE (port already in use)

echo "🔍 Checking ports 5001 and 24678..."

# Kill process di port 5001
PORT_5001=$(lsof -ti:5001 2>/dev/null)
if [ ! -z "$PORT_5001" ]; then
  echo "⚠️  Port 5001 sedang digunakan (PID: $PORT_5001)"
  echo "🔄 Menghentikan process..."
  kill -9 $PORT_5001 2>/dev/null
  sleep 1
fi

# Kill process di port 24678 (WebSocket)
PORT_24678=$(lsof -ti:24678 2>/dev/null)
if [ ! -z "$PORT_24678" ]; then
  echo "⚠️  Port 24678 sedang digunakan (PID: $PORT_24678)"
  echo "🔄 Menghentikan process..."
  kill -9 $PORT_24678 2>/dev/null
  sleep 1
fi

# Kill semua node server.js yang masih running
echo "🔄 Membersihkan node server.js yang masih berjalan..."
pkill -f "node server.js" 2>/dev/null
sleep 2

# Verifikasi port sudah kosong
USED_PORTS=$(lsof -ti:5001 -ti:24678 2>/dev/null | wc -l)
if [ "$USED_PORTS" -eq "0" ]; then
  echo "✅ Port 5001 dan 24678 sudah kosong"
else
  echo "❌ Masih ada port yang digunakan, coba restart manual"
  exit 1
fi

# Start dev server
echo ""
echo "🚀 Starting EduPTN dev server..."
echo "📍 URL: http://localhost:5001"
echo "⌨️  Press Ctrl+C to stop"
echo ""

npm run dev
