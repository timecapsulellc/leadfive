#!/bin/bash

echo "🚀 Starting LeadFive MLM Dashboard..."
echo "🔧 Clearing cache and rebuilding..."

# Kill any existing processes
pkill -f "vite" 2>/dev/null || true
pkill -f "node.*5175" 2>/dev/null || true

# Clear caches
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# Start development server
echo "🌟 Starting development server on http://localhost:5175"
npm run dev --force
