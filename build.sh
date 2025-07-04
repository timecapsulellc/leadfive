#!/bin/bash

# DigitalOcean Build Script
# This script ensures clean builds for DigitalOcean deployment

echo "🧹 Deep cleaning previous builds and cache..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf .vite
rm -rf vite.config.js.timestamp-*

echo "📦 Fresh install of dependencies..."
npm ci --production=false --prefer-offline=false

echo "🔍 Checking for build issues..."
node --version
npm --version

echo "🔨 Building for production..."
npm run build

echo "✅ Build complete! Checking output..."
ls -la dist/

echo "🎯 Verifying critical files exist..."
test -f dist/index.html && echo "✅ index.html exists" || echo "❌ index.html missing"
test -d dist/assets && echo "✅ assets directory exists" || echo "❌ assets directory missing"

echo "🚀 Build script completed successfully!"
echo "📅 Build timestamp: $(date)"
