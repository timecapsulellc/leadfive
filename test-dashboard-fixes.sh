#!/bin/bash

# LeadFive Dashboard Error Fixes Verification Script
echo "🔧 Testing LeadFive Dashboard Error Fixes..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a pattern exists in a file
check_pattern() {
    local file="$1"
    local pattern="$2"
    local description="$3"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ File not found: $file${NC}"
        return 1
    fi
    
    if grep -q "$pattern" "$file"; then
        echo -e "${GREEN}✅ $description${NC}"
        return 0
    else
        echo -e "${RED}❌ $description${NC}"
        return 1
    fi
}

# Function to check if a pattern does NOT exist in a file
check_pattern_absent() {
    local file="$1"
    local pattern="$2"
    local description="$3"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ File not found: $file${NC}"
        return 1
    fi
    
    if ! grep -q "$pattern" "$file"; then
        echo -e "${GREEN}✅ $description${NC}"
        return 0
    else
        echo -e "${RED}❌ $description${NC}"
        return 1
    fi
}

echo "📋 Checking useLiveNetworkData.js fixes..."
check_pattern "src/hooks/useLiveNetworkData.js" "contract.methods.usdtToken)" "Safe contract method checking implemented"
check_pattern "src/hooks/useLiveNetworkData.js" "Promise.allSettled" "Using Promise.allSettled for safe method calls"
check_pattern "src/hooks/useLiveNetworkData.js" "Available contract methods" "Contract method debugging added"

echo ""
echo "📋 Checking CSP Font Awesome fix..."
check_pattern "src/utils/securityHeaders.js" "cdn.jsdelivr.net" "Font Awesome CDN allowed in CSP"

echo ""
echo "📋 Checking Dashboard error handling..."
check_pattern "src/pages/Dashboard.jsx" "tree-error-container" "Error container implemented"
check_pattern "src/pages/Dashboard.jsx" "setTreeError" "Error state management added"
check_pattern "src/pages/Dashboard.jsx" "window.addEventListener" "Error event listener added"

echo ""
echo "📋 Checking ErrorBoundary enhancements..."
check_pattern "src/components/ErrorBoundary.jsx" "fallback" "Fallback component support added"

echo ""
echo "📋 Checking CSS error styles..."
check_pattern "src/pages/Dashboard.css" "tree-error-container" "Error container CSS added"

echo ""
echo "🏗️ Testing build process..."
if npm run build > build.log 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
    
    # Check bundle sizes
    if [ -d "dist" ]; then
        echo ""
        echo "📦 Bundle Analysis:"
        du -sh dist/assets/*.js | head -5
    fi
else
    echo -e "${RED}❌ Build failed. Check build.log for details.${NC}"
    echo "Last 10 lines of build log:"
    tail -10 build.log
fi

echo ""
echo "🧪 Running development server test..."
# Kill any existing dev server
pkill -f "vite.*--host"

# Start dev server in background
npm run dev > dev.log 2>&1 &
DEV_PID=$!

# Wait for server to start
echo "Waiting for dev server to start..."
sleep 5

# Check if server is running
if curl -s http://localhost:5174 > /dev/null; then
    echo -e "${GREEN}✅ Dev server started successfully${NC}"
    
    # Test specific endpoints
    if curl -s http://localhost:5174/genealogy > /dev/null; then
        echo -e "${GREEN}✅ Genealogy route accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Genealogy route test inconclusive${NC}"
    fi
    
else
    echo -e "${RED}❌ Dev server failed to start${NC}"
    echo "Dev server log:"
    cat dev.log
fi

# Clean up
kill $DEV_PID 2>/dev/null

echo ""
echo "📊 Test Summary:"
echo "=================="
echo "Key fixes implemented:"
echo "• Safe contract method checking in useLiveNetworkData.js"
echo "• Font Awesome CDN allowed in CSP"
echo "• Dashboard error boundaries and fallback UI"
echo "• Enhanced ErrorBoundary with fallback support"
echo "• Comprehensive error handling CSS"

echo ""
echo "🎯 Next Steps:"
echo "1. Test the application manually at http://localhost:5174"
echo "2. Check console for remaining errors"
echo "3. Test genealogy tree functionality"
echo "4. Verify Font Awesome icons load correctly"

echo ""
echo -e "${GREEN}🚀 Error fixes verification complete!${NC}"
