#!/bin/bash
echo "🔧 Clearing npm cache..."
npm cache clean --force
echo "📦 Removing node_modules..."
rm -rf node_modules
echo "🔄 Reinstalling dependencies..."
npm install
echo "✅ Dependencies fixed!"
