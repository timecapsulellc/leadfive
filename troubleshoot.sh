#!/bin/bash

echo "🔧 LeadFive Troubleshooting Script"
echo "=================================="
echo ""

# Function to test if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to test if a port is available
test_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        echo "❌ Port $port is in use"
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

echo "🔍 System Check:"
echo "Current directory: $(pwd)"
echo "User: $(whoami)"
echo ""

echo "🔍 Node.js Environment:"
if command_exists node; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found"
    echo "📥 Install from: https://nodejs.org/"
    exit 1
fi

if command_exists npm; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi
echo ""

echo "🔍 Project Files:"
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
else
    echo "❌ package.json not found - wrong directory?"
    exit 1
fi

if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
    echo "   Size: $(du -sh node_modules 2>/dev/null | cut -f1)"
else
    echo "❌ node_modules missing"
    echo "📦 Installing dependencies..."
    npm install
fi

if [ -d "src" ]; then
    echo "✅ src directory exists"
else
    echo "❌ src directory missing"
    exit 1
fi
echo ""

echo "🔍 Port Availability:"
test_port 5175
test_port 3000
test_port 8080
echo ""

echo "🧹 Cleanup:"
echo "Clearing Vite cache..."
rm -rf node_modules/.vite 2>/dev/null
rm -rf dist 2>/dev/null
echo "✅ Cache cleared"
echo ""

echo "🚀 Starting Options:"
echo "Choose your preferred method:"
echo ""
echo "1️⃣  Default port 5175:"
echo "   npm run dev"
echo ""
echo "2️⃣  Alternative port 3000:"
echo "   npm run dev:3000"
echo ""
echo "3️⃣  Alternative port 8080:"
echo "   npm run dev:8080"
echo ""
echo "4️⃣  Direct Vite (port 5175):"
echo "   ./node_modules/.bin/vite --host 0.0.0.0 --port 5175"
echo ""
echo "5️⃣  Direct Vite (port 3000):"
echo "   ./node_modules/.bin/vite --host 0.0.0.0 --port 3000"
echo ""

echo "🎯 Recommended: Try option 2 (port 3000) if 5175 has issues"
echo ""

read -p "Auto-start on port 3000? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting server on port 3000..."
    npm run dev:3000
fi
