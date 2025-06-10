#!/bin/bash

echo "🧹 Starting Orphi CrowdFund Project Cleanup..."
echo "This will free up space and improve VS Code performance"
echo ""

# Function to safely remove directories/files
safe_remove() {
    if [ -e "$1" ]; then
        echo "Removing: $1"
        rm -rf "$1"
    fi
}

# Function to get directory size
get_size() {
    if [ -d "$1" ]; then
        du -sh "$1" 2>/dev/null | cut -f1
    else
        echo "0B"
    fi
}

echo "📊 Current space usage:"
echo "node_modules: $(get_size node_modules)"
echo "standalone-v4ultra-enhanced: $(get_size standalone-v4ultra-enhanced)"
echo "artifacts-*: $(get_size artifacts*)"
echo "cache*: $(get_size cache*)"
echo ""

# 1. Clean npm/node modules (can be regenerated)
echo "🗑️  Cleaning Node.js artifacts..."
safe_remove node_modules
safe_remove package-lock.json

# 2. Clean build artifacts (can be regenerated)
echo "🗑️  Cleaning build artifacts..."
safe_remove artifacts
safe_remove artifacts-v4ultra
safe_remove artifacts-v4ultra-test
safe_remove build
safe_remove dist
safe_remove cache
safe_remove cache-mainnet
safe_remove cache-v4ultra
safe_remove cache-v4ultra-test
safe_remove v4ultra-test

# 3. Clean large standalone directories (duplicates)
echo "🗑️  Cleaning duplicate standalone directories..."
safe_remove standalone-v4ultra-enhanced
safe_remove standalone-v4ultra

# 4. Clean temporary and backup files
echo "🗑️  Cleaning temporary files..."
safe_remove temp_compilation_fix
safe_remove temp_deploy
safe_remove temp_disabled
safe_remove archive
safe_remove kyc-backup

# 5. Clean deployment artifacts and logs
echo "🗑️  Cleaning deployment artifacts..."
safe_remove deployments
safe_remove *.json | grep -E "(deployment|test-report|automated)"
rm -f *deployment*.json
rm -f *test-report*.json
rm -f *automated*.json
rm -f deployment-output.txt
rm -f dev-server.log
rm -f gas-report.txt

# 6. Clean duplicate/versioned files
echo "🗑️  Cleaning duplicate configuration files..."
safe_remove hardhat.v4ultra*.js
safe_remove hardhat.v4ultra*.config.js
safe_remove hardhat-v4ultra.config.js
safe_remove hardhat.standalone.config.js
safe_remove hardhat.minimal.config.js
safe_remove package.json.new
safe_remove vite.config.new.js

# 7. Clean test execution results and reports
echo "🗑️  Cleaning test reports..."
rm -f test-execution-results-*.md
rm -f expert-testing-report.json
rm -f enhanced-*.json
rm -f perfect-test-report-*.json
rm -f mainnet-verification-report-*.json
rm -f testnet-deployment-report-*.json
rm -f bsc-testnet-deployment-*.json
rm -f orphi-crowdfund-deployment-*.json

# 8. Clean HTML test files and demos
echo "🗑️  Cleaning HTML test files..."
rm -f *test*.html
rm -f *demo*.html
rm -f *preview*.html
rm -f diagnostic.html
rm -f bundle-stats.html

# 9. Clean duplicate environment files
echo "🗑️  Cleaning duplicate environment files..."
safe_remove .env.testnet.backup
safe_remove .env.mainnet.production

# 10. Clean VS Code and system files
echo "🗑️  Cleaning system files..."
find . -name ".DS_Store" -delete 2>/dev/null
find . -name "*.log" -delete 2>/dev/null

# 11. Clean duplicate source files
echo "🗑️  Cleaning duplicate source files..."
safe_remove src/App_*.jsx
safe_remove src/App-*.jsx
safe_remove src/*Test*.jsx
safe_remove src/Simple*.jsx
safe_remove src/Minimal*.jsx

echo ""
echo "✅ Cleanup completed!"
echo ""
echo "📊 Space freed up. To restore functionality:"
echo "1. Run: npm install"
echo "2. Run: npx hardhat compile (if needed)"
echo ""
echo "🚀 VS Code should now run much faster!"
