#!/bin/bash

# ============================================================================
# DEPLOYMENT SCRIPT CLEANUP & CONSOLIDATION
# ============================================================================
# This script archives 75+ scattered deployment files and replaces them
# with our unified deployment system.

echo "🗂️  ORPHI CROWDFUND - DEPLOYMENT CLEANUP"
echo "========================================"
echo "Consolidating 75+ deployment scripts into unified system..."

# Create archive directory
ARCHIVE_DIR="deployment-scripts-archive-$(date +%Y%m%d)"
mkdir -p "$ARCHIVE_DIR"

echo "📁 Created archive directory: $ARCHIVE_DIR"

# Files to archive (keep deploy.js as it's our new unified system)
DEPLOYMENT_FILES=(
    "deploy-fresh-trezor.cjs"
    "deploy-main-contract.js"
    "deploy-main-es.mjs"
    "deploy-mainnet-trezor.sh"
    "deploy-mainnet.sh"
    "deploy-orphi-mainnet.sh"
    "deploy-trezor-testnet.cjs"
    "deploy-trezor-testnet.sh"
    "alternative-trezor-deployment.sh"
    "fixed-trezor-deployment.sh"
    "immediate-trezor-deployment.js"
    "secure-deployment-launcher.sh"
    "setup-trezor-deployment.sh"
    "simple-trezor-deploy.js"
    "streamlined-trezor-deployment.mjs"
    "mainnet-deployment-ready.sh"
    "pre-deployment-checklist.sh"
    "post-deployment-checklist.sh"
    "test-deployment-readiness.sh"
    "test-deployment.js"
    "start-deployment-server.js"
    "estimate-deployment-gas.js"
    "hardhat.testnet-deploy.config.js"
)

SCRIPT_DEPLOYMENT_FILES=(
    "scripts/deploy-and-test-enhanced-v4ultra.js"
    "scripts/deploy-and-test-upgradeable.js"
    "scripts/deploy-basic-only.js"
    "scripts/deploy-bsc-testnet-production.js"
    "scripts/deploy-custom-address.js"
    "scripts/deploy-custom-mainnet.js"
    "scripts/deploy-direct-trezor.js"
    "scripts/deploy-enhanced-complete.js"
    "scripts/deploy-enhanced-only.js"
    "scripts/deploy-final-testnet.cjs"
    "scripts/deploy-final-testnet.js"
    "scripts/deploy-governance.js"
    "scripts/deploy-mainnet-production.js"
    "scripts/deploy-mainnet-trezor.js"
    "scripts/deploy-mainnet.js"
    "scripts/deploy-minimal-success.js"
    "scripts/deploy-modular.js"
    "scripts/deploy-orphi-crowdfund.js"
    "scripts/deploy-orphi-mainnet-trezor.js"
    "scripts/deploy-orphi-testnet.js"
    "scripts/deploy-orphichain-platform.js"
    "scripts/deploy-orphichain-upgradeable.js"
    "scripts/deploy-production-frontend.js"
    "scripts/deploy-pure-trezor.js"
    "scripts/deploy-pure-trezor.mjs"
    "scripts/deploy-secure-bsc-testnet.js"
    "scripts/deploy-secure-contract.js"
    "scripts/deploy-secure-with-internal-admins.cjs"
    "scripts/deploy-secure-with-internal-admins.js"
    "scripts/deploy-secure-with-trezor-transfer.cjs"
    "scripts/deploy-simple-testnet.cjs"
    "scripts/deploy-temp.js"
    "scripts/deploy-testnet-final.sh"
    "scripts/deploy-testnet-security.js"
    "scripts/deploy-trezor-bsc-mainnet.js"
    "scripts/deploy-trezor-esm-fixed.mjs"
    "scripts/deploy-trezor-secure.cjs"
    "scripts/deploy-trezor-working.mjs"
    "scripts/deploy-upgradeable-testnet.js"
    "scripts/deploy-v4ultra-complete.js"
    "scripts/deploy-v4ultra.js"
    "scripts/deploy-with-trezor-direct.js"
    "scripts/deploy-with-trezor.js"
    "scripts/deploy-working-contract.js"
    "scripts/deploy.js"
    "scripts/emergency-deploy-secure.js"
    "scripts/production-deploy.js"
    "scripts/simple-testnet-deploy.js"
    "scripts/trezor-deployment-guide.cjs"
)

# Archive root deployment files
echo "📦 Archiving root deployment files..."
for file in "${DEPLOYMENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_DIR/"
        echo "   Archived: $file"
    fi
done

# Archive scripts deployment files
echo "📦 Archiving scripts deployment files..."
mkdir -p "$ARCHIVE_DIR/scripts"
for file in "${SCRIPT_DEPLOYMENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_DIR/scripts/"
        echo "   Archived: $file"
    fi
done

# Archive HTML deployment interfaces
echo "📦 Archiving HTML deployment interfaces..."
HTML_FILES=(
    "direct-trezor-deployment.html"
    "direct-trezor-deployment-interface.html"
    "trezor-deployment-interface.html"
)

for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_DIR/"
        echo "   Archived: $file"
    fi
done

# Create deployments directory for organized results
mkdir -p deployments

# Create summary of what was archived
cat > "$ARCHIVE_DIR/ARCHIVED_FILES_SUMMARY.md" << EOF
# Archived Deployment Files Summary

**Date:** $(date)
**Total Files Archived:** $(find "$ARCHIVE_DIR" -type f | wc -l | xargs)

## What Was Replaced

All these scattered deployment scripts have been replaced with a single, unified deployment system:

\`\`\`bash
# New unified deployment commands:
npm run deploy testnet                 # Deploy to BSC Testnet
npm run deploy testnet --trezor        # Deploy to Testnet with Trezor
npm run deploy mainnet                 # Deploy to BSC Mainnet  
npm run deploy mainnet --trezor        # Deploy to Mainnet with Trezor
npm run deploy --check ADDRESS        # Check existing deployment
npm run deploy --estimate NETWORK     # Estimate gas costs
\`\`\`

## Benefits of New System

1. **Single Entry Point** - No more confusion about which script to use
2. **Consistent Interface** - Same commands for all deployments
3. **Better Security** - Trezor integration built-in
4. **Comprehensive Logging** - Professional deployment reports
5. **Gas Estimation** - Built-in cost calculation
6. **Error Handling** - Robust retry and validation
7. **Maintainable** - One file to maintain instead of 75+

## Archived File Categories

- **Root Deployment Scripts:** $(ls -1 $ARCHIVE_DIR/*.{js,cjs,mjs,sh} 2>/dev/null | wc -l | xargs) files
- **Scripts Directory:** $(ls -1 $ARCHIVE_DIR/scripts/*.{js,cjs,mjs,sh} 2>/dev/null | wc -l | xargs) files  
- **HTML Interfaces:** $(ls -1 $ARCHIVE_DIR/*.html 2>/dev/null | wc -l | xargs) files

## Migration Complete

The new unified deployment system (deploy.js) provides all functionality 
that was previously scattered across these files, with improved security,
better error handling, and professional-grade deployment management.
EOF

echo ""
echo "✅ CLEANUP COMPLETE!"
echo "========================================"
echo "📊 Summary:"
echo "   • Archived $(find "$ARCHIVE_DIR" -type f | wc -l | xargs) deployment files"
echo "   • Created unified deployment system: deploy.js"
echo "   • Updated package.json with new commands"
echo ""
echo "🚀 NEW DEPLOYMENT COMMANDS:"
echo "   npm run deploy testnet"
echo "   npm run deploy testnet --trezor"
echo "   npm run deploy mainnet"
echo "   npm run deploy mainnet --trezor"
echo "   npm run deploy --check ADDRESS"
echo "   npm run deploy --estimate NETWORK"
echo ""
echo "📁 Archive location: $ARCHIVE_DIR"
echo "📋 See $ARCHIVE_DIR/ARCHIVED_FILES_SUMMARY.md for details"
echo ""
echo "⚡ Ready for clean, professional deployments!"
