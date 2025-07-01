#!/bin/bash

# 🚀 Lead Five Production Build Script for Digital Ocean
# This script handles the build process for DigitalOcean App Platform

set -e

echo "🚀 Starting Lead Five build process..."

# Set production environment
export NODE_ENV=production
export VITE_APP_ENV=production

# Print build info
echo "📋 Build Information:"
echo "├── Node.js version: $(node --version)"
echo "├── npm version: $(npm --version)"
echo "├── Environment: $NODE_ENV"
echo "└── Lead Five Contract: $VITE_CONTRACT_ADDRESS"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build the application
echo "🔨 Building Lead Five application..."
npm run build

# Verify build output
echo "✅ Build verification:"
if [ -d "dist" ]; then
    echo "├── dist/ directory exists"
    echo "├── Files in dist/:"
    ls -la dist/ | head -10
    echo "└── Build size: $(du -sh dist/ | cut -f1)"
else
    echo "❌ dist/ directory not found!"
    exit 1
fi

echo "🎉 Lead Five build completed successfully!"
