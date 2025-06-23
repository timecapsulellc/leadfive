#!/bin/bash

echo "🧹 Clearing LeadFive Development Cache..."
echo "========================================"

# Kill any running development servers
echo "🔪 Stopping development servers..."
pkill -f "vite" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Clear Node modules cache
echo "📦 Clearing node_modules cache..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Clear npm cache
echo "🗑️ Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Clear any build artifacts
echo "🏗️ Clearing build artifacts..."
rm -rf dist 2>/dev/null || true
rm -rf build 2>/dev/null || true

# Clear logs
echo "📝 Clearing logs..."
rm -f *.log 2>/dev/null || true

echo ""
echo "✅ Cache cleared successfully!"
echo ""
echo "🚀 Starting fresh development server..."
echo "   Open your browser and go to:"
echo "   http://localhost:5173/clear-cache.html"
echo "   to clear browser cache, then navigate to:"
echo "   http://localhost:5173"
echo ""

# Start the development server
npm run dev
