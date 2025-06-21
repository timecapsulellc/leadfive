#!/bin/bash

# Health Check Script for LeadFive Deployment
# Run this after deployment to verify everything works

echo "🏥 LeadFive Deployment Health Check"
echo "=================================="

# Check if dist directory and files exist
echo "📁 Checking build output..."
if [ -f "dist/index.html" ]; then
    echo "✅ index.html exists"
    echo "📊 File size: $(stat -f%z dist/index.html 2>/dev/null || stat -c%s dist/index.html 2>/dev/null || echo 'Unknown') bytes"
else
    echo "❌ index.html missing!"
    exit 1
fi

if [ -d "dist/assets" ]; then
    echo "✅ assets directory exists"
    echo "📊 Assets count: $(ls -1 dist/assets/ | wc -l)"
else
    echo "❌ assets directory missing!"
    exit 1
fi

# Check critical files
CRITICAL_FILES=(
    "dist/index.html"
    "static.json"
    ".do/app.yaml"
)

echo ""
echo "🔍 Checking critical files..."
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing!"
    fi
done

# Check environment configuration
echo ""
echo "🌍 Environment check..."
echo "✅ NODE_ENV: ${NODE_ENV:-'not set'}"
echo "✅ VITE_CONTRACT_ADDRESS: ${VITE_CONTRACT_ADDRESS:-'not set'}"
echo "✅ VITE_WEBSOCKET_URL: ${VITE_WEBSOCKET_URL:-'not set'}"

echo ""
echo "🎯 Build summary:"
echo "   Total dist size: $(du -sh dist 2>/dev/null | cut -f1 || echo 'Unknown')"
echo "   Build target: $(grep -o '"target": "[^"]*"' vite.config.js || echo 'Unknown')"

echo ""
echo "🚀 Deployment appears ready!"
echo "   Next: Push to GitHub to trigger DigitalOcean deployment"
