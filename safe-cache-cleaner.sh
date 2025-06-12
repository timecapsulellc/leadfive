#!/bin/zsh

# ╔═══════════════════════════════════════════════════════════════════════════════════════╗
# ║                    🧹 SAFE CACHE CLEANER (DEPLOYMENT FRIENDLY) 🧹                    ║
# ║                                                                                       ║
# ║  Clears only safe-to-remove cache files, preserves deployment-critical files         ║
# ║                                                                                       ║
# ╚═══════════════════════════════════════════════════════════════════════════════════════╝

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    🧹 SAFE CACHE CLEANER (DEPLOYMENT FRIENDLY) 🧹                    ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════════════════╝${NC}"
echo

echo -e "${CYAN}📂 Cleaning safe cache files in: $(pwd)${NC}"
echo -e "${YELLOW}⚠️  Preserving deployment-critical files (artifacts, node_modules)${NC}"
echo

# Function to safely remove files/directories
safe_remove() {
    local path="$1"
    local description="$2"
    
    if [[ -e "$path" ]]; then
        echo -e "${YELLOW}🗑️  Removing $description...${NC}"
        rm -rf "$path"
        echo -e "${GREEN}✅ Removed: $path${NC}"
    else
        echo -e "${CYAN}ℹ️  Not found: $description${NC}"
    fi
}

# 1. Safe temporary files
echo -e "${BLUE}═══ Temporary Files (Safe) ═══${NC}"
safe_remove "tmp" "Temporary folder"
safe_remove ".tmp" "Hidden temporary folder"
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# 2. Log files
echo -e "${BLUE}═══ Log Files ═══${NC}"
find . -name "*.log" -not -path "./node_modules/*" -delete 2>/dev/null || true
safe_remove "logs" "Logs folder"

# 3. Test artifacts (safe to regenerate)
echo -e "${BLUE}═══ Test Artifacts ═══${NC}"
safe_remove "coverage" "Test coverage reports"
safe_remove ".nyc_output" "NYC test output"
safe_remove "test-results" "Test results"

# 4. Editor caches
echo -e "${BLUE}═══ Editor Caches ═══${NC}"
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true
find . -name "*~" -delete 2>/dev/null || true

# 5. OS-specific files
echo -e "${BLUE}═══ OS-Specific Files ═══${NC}"
find . -name "Thumbs.db" -delete 2>/dev/null || true
find . -name "ehthumbs.db" -delete 2>/dev/null || true
find . -name "Desktop.ini" -delete 2>/dev/null || true

# 6. Git cleanup (safe)
echo -e "${BLUE}═══ Git Cleanup ═══${NC}"
if [[ -d ".git" ]]; then
    echo -e "${YELLOW}🧹 Cleaning Git cache...${NC}"
    git gc --prune=now 2>/dev/null || echo -e "${YELLOW}⚠️  Git cleanup skipped${NC}"
    echo -e "${GREEN}✅ Git cleanup completed${NC}"
fi

echo
echo -e "${GREEN}✅ Safe cache cleanup completed!${NC}"
echo
echo -e "${CYAN}📊 What was cleaned:${NC}"
echo -e "   • Temporary files and logs"
echo -e "   • Test coverage reports"
echo -e "   • Editor swap files"
echo -e "   • OS-specific cache files"
echo -e "   • Git garbage collection"
echo
echo -e "${GREEN}✅ What was preserved:${NC}"
echo -e "   • Contract artifacts (needed for deployment)"
echo -e "   • Node modules (needed for TrezorConnect)"
echo -e "   • Hardhat cache (speeds up compilation)"
echo -e "   • All source code and configurations"
echo
echo -e "${PURPLE}🎉 Your deployment is safe to continue!${NC}"
echo
