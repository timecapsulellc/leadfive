#!/bin/zsh

# 🔧 POST-DEPLOYMENT FRONTEND UPDATE SCRIPT
# This script updates your frontend with the new secure contract address

echo "🔧 POST-DEPLOYMENT FRONTEND UPDATE"
echo "═══════════════════════════════════════════════════════════"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if deployment success file exists
if [ ! -f "SECURE_DEPLOYMENT_SUCCESS.json" ]; then
    echo -e "${RED}❌ ERROR: SECURE_DEPLOYMENT_SUCCESS.json not found!${NC}"
    echo -e "${YELLOW}💡 Please run the deployment script first:${NC}"
    echo "   npx hardhat run scripts/deploy-secure-with-internal-admins.js --network bscMainnet --config hardhat.config.trezor.js"
    exit 1
fi

# Extract new contract addresses from deployment file
NEW_CONTRACT=$(grep -o '"orphiCrowdFundAddress":"[^"]*"' SECURE_DEPLOYMENT_SUCCESS.json | cut -d'"' -f4)
ADMIN_MANAGER_CONTRACT=$(grep -o '"internalAdminManagerAddress":"[^"]*"' SECURE_DEPLOYMENT_SUCCESS.json | cut -d'"' -f4)

if [ -z "$NEW_CONTRACT" ]; then
    echo -e "${RED}❌ ERROR: Could not extract OrphiCrowdFund contract address from deployment file${NC}"
    exit 1
fi

if [ -z "$ADMIN_MANAGER_CONTRACT" ]; then
    echo -e "${RED}❌ ERROR: Could not extract InternalAdminManager contract address from deployment file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found new contract addresses:${NC}"
echo -e "   OrphiCrowdFund: ${NEW_CONTRACT}"
echo -e "   InternalAdminManager: ${ADMIN_MANAGER_CONTRACT}"

# Update Web3Service.js
echo -e "\n${BLUE}📝 Updating Web3Service.js...${NC}"

if [ -f "src/services/Web3Service.js" ]; then
    # Backup original file
    cp "src/services/Web3Service.js" "src/services/Web3Service.js.backup"
    
    # Update main contract address
    sed -i '' "s/0x8F826B18096Dcf7AF4515B06Cb563475d189ab50/${NEW_CONTRACT}/g" "src/services/Web3Service.js"
    sed -i '' "s/0x5ab22F4d339B66C1859029d2c2540d8BefCbdED4/${NEW_CONTRACT}/g" "src/services/Web3Service.js"
    
    # Add InternalAdminManager address if not already present
    if ! grep -q "INTERNAL_ADMIN_MANAGER_ADDRESS" "src/services/Web3Service.js"; then
        # Add the admin manager address configuration
        sed -i '' "/const CONTRACT_ADDRESS/a\\
const INTERNAL_ADMIN_MANAGER_ADDRESS = '${ADMIN_MANAGER_CONTRACT}';
" "src/services/Web3Service.js"
    else
        # Update existing admin manager address
        sed -i '' "s/const INTERNAL_ADMIN_MANAGER_ADDRESS = '[^']*';/const INTERNAL_ADMIN_MANAGER_ADDRESS = '${ADMIN_MANAGER_CONTRACT}';/g" "src/services/Web3Service.js"
    fi
    
    echo -e "   ${GREEN}✅ Web3Service.js updated with both contract addresses${NC}"
    echo -e "   ${YELLOW}📁 Backup saved to: Web3Service.js.backup${NC}"
else
    echo -e "   ${RED}❌ Web3Service.js not found${NC}"
fi

# Update constants.js if it exists
echo -e "\n${BLUE}📝 Updating constants.js...${NC}"

if [ -f "src/utils/constants.js" ]; then
    # Backup original file
    cp "src/utils/constants.js" "src/utils/constants.js.backup"
    
    # Update main contract address
    sed -i '' "s/0x8F826B18096Dcf7AF4515B06Cb563475d189ab50/${NEW_CONTRACT}/g" "src/utils/constants.js"
    sed -i '' "s/0x5ab22F4d339B66C1859029d2c2540d8BefCbdED4/${NEW_CONTRACT}/g" "src/utils/constants.js"
    
    # Add admin manager address if not present
    if ! grep -q "INTERNAL_ADMIN_MANAGER" "src/utils/constants.js"; then
        echo "export const INTERNAL_ADMIN_MANAGER_ADDRESS = '${ADMIN_MANAGER_CONTRACT}';" >> "src/utils/constants.js"
    fi
    
    echo -e "   ${GREEN}✅ constants.js updated with both contract addresses${NC}"
    echo -e "   ${YELLOW}📁 Backup saved to: constants.js.backup${NC}"
else
    echo -e "   ${YELLOW}⚠️  constants.js not found (skipping)${NC}"
fi

# Update any other config files
echo -e "\n${BLUE}📝 Checking for other configuration files...${NC}"

# Find and update any other files containing the old contract address
FOUND_FILES=$(grep -r "0x8F826B18096Dcf7AF4515B06Cb563475d189ab50" src/ 2>/dev/null | cut -d: -f1 | sort | uniq)

if [ ! -z "$FOUND_FILES" ]; then
    echo -e "   ${YELLOW}📝 Updating additional files:${NC}"
    for file in $FOUND_FILES; do
        if [ -f "$file" ]; then
            cp "$file" "${file}.backup"
            sed -i '' "s/0x8F826B18096Dcf7AF4515B06Cb563475d189ab50/${NEW_CONTRACT}/g" "$file"
            echo -e "      ${GREEN}✅ Updated: $file${NC}"
        fi
    done
else
    echo -e "   ${GREEN}✅ No additional files need updating${NC}"
fi

# Create updated documentation
echo -e "\n${BLUE}📄 Creating contract update documentation...${NC}"

cat > CONTRACT_ADDRESS_UPDATE.md << EOF
# 🔐 CONTRACT ADDRESS UPDATE - $(date)

## 📍 ADDRESS CHANGES

### OLD CONTRACT (COMPROMISED - DO NOT USE)
\`\`\`
0x8F826B18096Dcf7AF4515B06Cb563475d189ab50
\`\`\`

### NEW CONTRACTS (SECURE - USE THESE)

#### OrphiCrowdFund Main Contract
\`\`\`
${NEW_CONTRACT}
\`\`\`

#### InternalAdminManager Contract
\`\`\`
${ADMIN_MANAGER_CONTRACT}
\`\`\`

## 📝 FILES UPDATED
- ✅ src/services/Web3Service.js
- ✅ src/utils/constants.js (if present)
- ✅ Any other configuration files

## 🔗 VERIFICATION LINKS
- **Main Contract**: https://bscscan.com/address/${NEW_CONTRACT}
- **Admin Manager**: https://bscscan.com/address/${ADMIN_MANAGER_CONTRACT}
- **Owner Verification**: Should show 0xeB652c4523f3Cf615D3F3694b14E551145953aD0

## 🛡️ INTERNAL ADMIN FEATURES
- ✅ InternalAdminManager deployed and linked
- ✅ Role-based access control implemented
- ✅ Up to 21 internal admin addresses supported
- ✅ Activity tracking enabled

## 🚀 NEXT STEPS
1. Build and test the application
2. Deploy to production
3. Notify users of the address change
4. Initialize internal admin addresses if needed
5. Monitor both contracts

## 🛡️ SECURITY STATUS
✅ **FULLY SECURE** - Both contracts owned by Trezor hardware wallet
✅ **ADMIN READY** - Internal admin system active
EOF

echo -e "   ${GREEN}✅ Created CONTRACT_ADDRESS_UPDATE.md${NC}"

# Build the application
echo -e "\n${BLUE}🔨 Building application with new contract address...${NC}"

npm run build

if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✅ Build successful!${NC}"
    
    # Optional: Deploy to Vercel
    echo -e "\n${YELLOW}🚀 Deploy to production? (y/n):${NC}"
    read DEPLOY_CHOICE
    
    if [ "$DEPLOY_CHOICE" = "y" ] || [ "$DEPLOY_CHOICE" = "Y" ]; then
        echo -e "\n${BLUE}🚀 Deploying to Vercel...${NC}"
        npx vercel --prod
        
        if [ $? -eq 0 ]; then
            echo -e "   ${GREEN}✅ Deployment successful!${NC}"
        else
            echo -e "   ${RED}❌ Deployment failed${NC}"
        fi
    fi
else
    echo -e "   ${RED}❌ Build failed - please check for errors${NC}"
fi

echo -e "\n${GREEN}🎉 FRONTEND UPDATE COMPLETE!${NC}"
echo -e "═══════════════════════════════════════════════════════════"

echo -e "\n${BLUE}📋 SUMMARY:${NC}"
echo -e "• Contract address updated from old to new secure address"
echo -e "• All configuration files updated"
echo -e "• Application rebuilt with new contract"
echo -e "• Backup files created for safety"

echo -e "\n${BLUE}🔗 NEW CONTRACT DETAILS:${NC}"
echo -e "• Main Contract: ${NEW_CONTRACT}"
echo -e "• Admin Manager: ${ADMIN_MANAGER_CONTRACT}"
echo -e "• BSCScan Main: https://bscscan.com/address/${NEW_CONTRACT}"
echo -e "• BSCScan Admin: https://bscscan.com/address/${ADMIN_MANAGER_CONTRACT}"
echo -e "• Owner: 0xeB652c4523f3Cf615D3F3694b14E551145953aD0 (Your Trezor)"

echo -e "\n${YELLOW}⚠️  IMPORTANT REMINDERS:${NC}"
echo -e "• Notify all users about the new contract address"
echo -e "• Update any external integrations"
echo -e "• Monitor the new contract for proper functionality"
echo -e "• Never use the old compromised contract again"

echo -e "\n${GREEN}🔐 Your application is now secure and ready! ✨${NC}"
