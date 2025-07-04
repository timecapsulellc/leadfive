#!/bin/bash

echo "🚨 EMERGENCY CACHE CLEAR - Fixing FaMinimize Issue"
echo "================================================"

# Stop any running processes
pkill -f "vite" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Nuclear option - delete all cache
echo "💥 Deleting ALL caches..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
rm -rf node_modules/.cache

# Clear npm cache
npm cache clean --force

# Delete and recreate Vite deps
echo "🔧 Forcing Vite dependency rebuild..."
rm -rf node_modules/.vite/deps

echo "✅ Cache completely cleared!"
echo "🚀 Starting development server..."

# Start fresh
npm run dev
