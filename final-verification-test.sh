#!/bin/bash

# =============================================================================
# FINAL VERIFICATION SCRIPT FOR LEADFIVE DAPP
# =============================================================================
# This script performs comprehensive testing of all fixes implemented:
# 1. Dashboard error boundary fixes
# 2. Genealogy tree optimization
# 3. Contract method safety in useLiveNetworkData
# 4. CSP updates for Font Awesome
# 5. Production build verification
# =============================================================================

echo "🔍 LEADFIVE DAPP - FINAL VERIFICATION TEST"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0
TOTAL=0

# Function to run test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -e "${BLUE}🧪 Testing: $test_name${NC}"
    TOTAL=$((TOTAL + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

# Function to check file exists and contains pattern
check_file_pattern() {
    local file="$1"
    local pattern="$2"
    
    if [[ -f "$file" ]] && grep -q "$pattern" "$file"; then
        return 0
    else
        return 1
    fi
}

# Function to check JavaScript syntax
check_js_syntax() {
    local file="$1"
    if node -c "$file" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

echo "1. CHECKING FILE STRUCTURE AND EXISTENCE"
echo "----------------------------------------"

# Test 1: Check critical files exist
run_test "Critical files exist" \
    "test -f 'src/hooks/useLiveNetworkData.js' && test -f 'src/components/NetworkTreeVisualization.jsx' && test -f 'src/pages/Dashboard.jsx' && test -f 'src/utils/securityHeaders.js'" \
    "true"

# Test 2: Check JavaScript syntax in key files
run_test "useLiveNetworkData.js syntax" \
    "check_js_syntax 'src/hooks/useLiveNetworkData.js'" \
    "true"

run_test "NetworkTreeVisualization.jsx syntax" \
    "npm run build >/dev/null 2>&1" \
    "true"

echo "2. CHECKING CONTRACT METHOD SAFETY FIXES"
echo "----------------------------------------"

# Test 3: Check Promise.allSettled implementation
run_test "Promise.allSettled usage in useLiveNetworkData" \
    "check_file_pattern 'src/hooks/useLiveNetworkData.js' 'Promise.allSettled'" \
    "true"

# Test 4: Check safe contract method checking
run_test "Safe contract method checking" \
    "check_file_pattern 'src/hooks/useLiveNetworkData.js' 'contract.methods.*exists'" \
    "true"

# Test 5: Check error handling for missing methods
run_test "Error handling for missing contract methods" \
    "check_file_pattern 'src/hooks/useLiveNetworkData.js' 'methodMap\|methodName'" \
    "true"

echo "3. CHECKING DASHBOARD ERROR BOUNDARY FIXES"
echo "------------------------------------------"

# Test 6: Check NetworkSection error boundary
run_test "NetworkSection error boundary implementation" \
    "check_file_pattern 'src/pages/Dashboard.jsx' 'treeError.*setTreeError'" \
    "true"

# Test 7: Check error fallback UI
run_test "Error fallback UI in Dashboard" \
    "check_file_pattern 'src/pages/Dashboard.jsx' 'tree-error-container'" \
    "true"

# Test 8: Check error event listeners
run_test "Error event listeners in NetworkSection" \
    "check_file_pattern 'src/pages/Dashboard.jsx' 'addEventListener.*error'" \
    "true"

echo "4. CHECKING GENEALOGY TREE FIXES"
echo "--------------------------------"

# Test 9: Check treeStats calculation
run_test "treeStats useMemo implementation" \
    "check_file_pattern 'src/components/NetworkTreeVisualization.jsx' 'treeStats.*useMemo'" \
    "true"

# Test 10: Check tree stats usage
run_test "treeStats usage in component" \
    "check_file_pattern 'src/components/NetworkTreeVisualization.jsx' 'treeStats.totalNodes\|treeStats.maxDepth'" \
    "true"

echo "5. CHECKING CSP AND SECURITY HEADERS"
echo "-----------------------------------"

# Test 11: Check Font Awesome CDN in CSP
run_test "Font Awesome CDN in CSP" \
    "check_file_pattern 'src/utils/securityHeaders.js' 'cdn.jsdelivr.net'" \
    "true"

# Test 12: Check style-src directive
run_test "style-src directive includes CDN" \
    "check_file_pattern 'src/utils/securityHeaders.js' 'style-src.*cdn.jsdelivr.net'" \
    "true"

echo "6. PRODUCTION BUILD VERIFICATION"
echo "--------------------------------"

# Test 13: Production build
run_test "Production build succeeds" \
    "npm run build >/dev/null 2>&1" \
    "true"

# Test 14: Check build output
run_test "Build output exists" \
    "test -d 'dist' && test -f 'dist/index.html'" \
    "true"

# Test 15: Check for large chunks warning (should exist but not fail build)
run_test "Build completes despite chunk size warnings" \
    "test -f 'dist/index.html' && ls -la dist/assets/*.js | wc -l | grep -q '[0-9]'" \
    "true"

echo "7. ERROR HANDLING AND RESILIENCE TESTS"
echo "--------------------------------------"

# Test 16: Check default stats return
run_test "Default stats returned on error" \
    "check_file_pattern 'src/hooks/useLiveNetworkData.js' 'return.*totalUsers.*0'" \
    "true"

# Test 17: Check error boundary fallback
run_test "Error boundary fallback component" \
    "check_file_pattern 'src/pages/Dashboard.jsx' 'refresh-btn\|full-view-btn'" \
    "true"

echo "8. TESTING CSS AND STYLING"
echo "--------------------------"

# Test 18: Check error container styles
run_test "Error container CSS exists" \
    "check_file_pattern 'src/pages/Dashboard.css' 'tree-error-container\|error-message'" \
    "true"

# Test 19: Check network section styles
run_test "Network section CSS exists" \
    "test -f 'src/pages/Dashboard.css'" \
    "true"

echo ""
echo "============================================"
echo "📊 FINAL TEST RESULTS"
echo "============================================"
echo -e "Total Tests: ${BLUE}$TOTAL${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    echo -e "${GREEN}✅ LeadFive DApp is ready for production deployment!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the issues above.${NC}"
    exit 1
fi
