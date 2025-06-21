#!/bin/bash

# LeadFive Development Server Startup Script
echo "🚀 Starting LeadFive Development Server..."

# Kill any existing processes on port 5173
echo "📋 Cleaning up existing processes..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Navigate to project directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clear Vite cache
echo "🧹 Clearing Vite cache..."
rm -rf node_modules/.vite 2>/dev/null || true

# Start the development server
echo "🌐 Starting Vite development server..."
echo "📱 Access the app at: http://localhost:5173"
echo "🔧 Press Ctrl+C to stop the server"
echo ""

npm run dev
