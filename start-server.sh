#!/bin/bash

echo "🚀 LeadFive Emergency Server Starter"
echo "===================================="

# Navigate to the correct directory
cd "/Users/dadou/LEAD FIVE"

echo "📁 Current directory: $(pwd)"
echo ""

# Check if we have the necessary files
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in current directory"
    echo "Please make sure you're in the correct LeadFive project directory"
    exit 1
fi

echo "✅ Found package.json"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Dependencies ready"

# Kill any existing processes on common ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:5175 | xargs kill -9 2>/dev/null || echo "No process on 5175"
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process on 3000"
lsof -ti:8080 | xargs kill -9 2>/dev/null || echo "No process on 8080"

# Clear cache
echo "🧹 Clearing cache..."
rm -rf node_modules/.vite 2>/dev/null
rm -rf dist 2>/dev/null

echo ""
echo "🎯 Starting LeadFive development server..."
echo "Press Ctrl+C to stop the server"
echo ""

# Try to start the server on port 3000 (most likely to work)
npm run dev:3000

# If that fails, try the default port
if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️ Port 3000 failed, trying port 5175..."
    npm run dev
fi

# If that also fails, try direct vite
if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️ npm commands failed, trying direct vite..."
    ./node_modules/.bin/vite --host 0.0.0.0 --port 3000 --force
fi
