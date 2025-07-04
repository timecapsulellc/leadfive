#!/bin/bash

echo "🔍 Terminal & Environment Diagnostic"
echo "=================================="
echo "Current Directory: $(pwd)"
echo "Shell: $SHELL"
echo "PATH: $PATH"
echo ""

echo "🔍 Checking Node.js..."
echo "which node: $(which node 2>/dev/null || echo 'NOT FOUND')"
echo "node --version: $(node --version 2>/dev/null || echo 'NOT AVAILABLE')"
echo "which npm: $(which npm 2>/dev/null || echo 'NOT FOUND')"
echo "npm --version: $(npm --version 2>/dev/null || echo 'NOT AVAILABLE')"
echo ""

echo "🔍 Checking Python..."
echo "which python3: $(which python3 2>/dev/null || echo 'NOT FOUND')"
echo "python3 --version: $(python3 --version 2>/dev/null || echo 'NOT AVAILABLE')"
echo ""

echo "🔍 Checking common Node.js locations..."
for path in /usr/local/bin/node /opt/homebrew/bin/node ~/.nvm/versions/node/*/bin/node /usr/bin/node; do
    if [ -f "$path" ]; then
        echo "Found Node.js at: $path"
        echo "Version: $($path --version 2>/dev/null || echo 'Cannot execute')"
    fi
done
echo ""

echo "🔍 Checking if we can start a simple HTTP server..."
if command -v python3 >/dev/null 2>&1; then
    echo "✅ Python3 available - starting simple server..."
    python3 -m http.server 5175 --directory . &
    SERVER_PID=$!
    sleep 2
    if lsof -i :5175 >/dev/null 2>&1; then
        echo "✅ Simple HTTP server started on http://localhost:5175"
        kill $SERVER_PID 2>/dev/null
    else
        echo "❌ Failed to start HTTP server"
    fi
else
    echo "❌ Python3 not available"
fi

echo ""
echo "🔍 Files in current directory:"
ls -la | head -10
echo ""

echo "🔍 Node modules status:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
    echo "Size: $(du -sh node_modules 2>/dev/null || echo 'Cannot measure')"
    if [ -d "node_modules/.bin" ]; then
        echo "✅ node_modules/.bin exists"
        echo "Executables: $(ls node_modules/.bin | wc -l 2>/dev/null || echo '0') files"
    else
        echo "❌ node_modules/.bin missing"
    fi
else
    echo "❌ node_modules directory missing"
fi
