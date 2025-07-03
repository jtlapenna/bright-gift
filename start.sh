#!/bin/bash

echo "🚀 Starting BrightGift Puppeteer Server"
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "Files in directory: $(ls -la)"

# Check if Chromium is available
if command -v chromium-browser &> /dev/null; then
    echo "✅ Chromium found: $(which chromium-browser)"
else
    echo "⚠️  Chromium not found in PATH"
fi

# Check if required files exist
if [ -f "index.js" ]; then
    echo "✅ index.js found"
else
    echo "❌ index.js not found"
    exit 1
fi

if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json not found"
    exit 1
fi

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🔧 Starting server..."
node index.js 