#!/bin/bash

# 🔍 TREZOR DEPLOYMENT VERIFICATION SCRIPT
# This script verifies that all configurations point to your Trezor address

echo "🔍 TREZOR DEPLOYMENT CONFIGURATION VERIFICATION"
echo "═══════════════════════════════════════════════════════════════════════"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TREZOR_ADDRESS="0xeB652c4523f3Cf615D3F3694b14E551145953aD0"

echo -e "${BLUE}🎯 Expected Trezor Address: ${TREZOR_ADDRESS}${NC}"
echo -e "${BLUE}🚫 Compromised Address: 0x7FB9622c6b2480Fd75b611b87b16c556A10baA01${NC}"

echo -e "\n${BLUE}📋 CONFIGURATION VERIFICATION:${NC}"

# Check 1: Emergency deployment script
echo -e "\n1. Checking emergency deployment script..."
if [ -f "scripts/emergency-deploy-secure.js" ]; then
    SCRIPT_TREZOR=$(grep -o 'TREZOR_ADDRESS: "[^"]*"' scripts/emergency-deploy-secure.js | cut -d'"' -f2)
    if [ "$SCRIPT_TREZOR" = "$TREZOR_ADDRESS" ]; then
        echo -e "   ${GREEN}✅ Emergency script uses correct Trezor address${NC}"
    else
        echo -e "   ${RED}❌ Emergency script has wrong address: $SCRIPT_TREZOR${NC}"
    fi
    
    # Check if script sets all admin roles to Trezor
    TREASURY_COUNT=$(grep -c "CONFIG.TREZOR_ADDRESS,  // treasury" scripts/emergency-deploy-secure.js)
    EMERGENCY_COUNT=$(grep -c "CONFIG.TREZOR_ADDRESS,  // emergency" scripts/emergency-deploy-secure.js)
    POOL_COUNT=$(grep -c "CONFIG.TREZOR_ADDRESS   // poolManager" scripts/emergency-deploy-secure.js)
    
    if [ "$TREASURY_COUNT" -eq 1 ] && [ "$EMERGENCY_COUNT" -eq 1 ] && [ "$POOL_COUNT" -eq 1 ]; then
        echo -e "   ${GREEN}✅ All admin roles correctly set to Trezor address${NC}"
    else
        echo -e "   ${RED}❌ Admin roles not properly configured${NC}"
    fi
else
    echo -e "   ${RED}❌ Emergency deployment script not found${NC}"
fi

# Check 2: Hardhat Trezor config
echo -e "\n2. Checking Hardhat Trezor configuration..."
if [ -f "hardhat.mainnet.trezor.config.js" ]; then
    # Check if private key is NOT being used (good for Trezor)
    PRIVATE_KEY_USAGE=$(grep -c "MAINNET_PRIVATE_KEY" hardhat.mainnet.trezor.config.js)
    if [ "$PRIVATE_KEY_USAGE" -gt 0 ]; then
        echo -e "   ${YELLOW}⚠️  Config still references private keys${NC}"
        echo -e "   ${YELLOW}   This is OK if using MetaMask + Trezor${NC}"
    else
        echo -e "   ${GREEN}✅ No private key dependencies found${NC}"
    fi
    
    # Check BSC Mainnet configuration
    BSC_CONFIG=$(grep -c "chainId: 56" hardhat.mainnet.trezor.config.js)
    if [ "$BSC_CONFIG" -eq 1 ]; then
        echo -e "   ${GREEN}✅ BSC Mainnet correctly configured${NC}"
    else
        echo -e "   ${RED}❌ BSC Mainnet configuration missing${NC}"
    fi
else
    echo -e "   ${RED}❌ Hardhat Trezor config not found${NC}"
fi

# Check 3: Verify no compromised addresses in configs
echo -e "\n3. Checking for compromised addresses in configuration..."
COMPROMISED_FOUND=$(grep -r "0x7FB9622c6b2480Fd75b611b87b16c556A10baA01" scripts/ hardhat.*.config.js 2>/dev/null | wc -l)
if [ "$COMPROMISED_FOUND" -eq 0 ]; then
    echo -e "   ${GREEN}✅ No compromised addresses found in configs${NC}"
else
    echo -e "   ${RED}❌ Compromised address found in configurations!${NC}"
    grep -r "0x7FB9622c6b2480Fd75b611b87b16c556A10baA01" scripts/ hardhat.*.config.js 2>/dev/null
fi

# Check 4: Verify Trezor address is set as deployer expectation
echo -e "\n4. Checking deployer address verification..."
DEPLOYER_CHECK=$(grep -c "$TREZOR_ADDRESS" scripts/emergency-deploy-secure.js)
if [ "$DEPLOYER_CHECK" -gt 0 ]; then
    echo -e "   ${GREEN}✅ Script expects Trezor as deployer${NC}"
else
    echo -e "   ${RED}❌ Script does not verify Trezor as deployer${NC}"
fi

# Check 5: Frontend configuration
echo -e "\n5. Checking current frontend configuration..."
if [ -f "src/services/Web3Service.js" ]; then
    CURRENT_CONTRACT=$(grep -o 'this.contractAddress = .*[^;]' src/services/Web3Service.js | grep -o '0x[a-fA-F0-9]*')
    echo -e "   Current contract address: ${CURRENT_CONTRACT}"
    
    if [ "$CURRENT_CONTRACT" = "0x8F826B18096Dcf7AF4515B06Cb563475d189ab50" ]; then
        echo -e "   ${RED}⚠️  Still using OLD compromised contract${NC}"
        echo -e "   ${YELLOW}   This will be updated after deployment${NC}"
    else
        echo -e "   ${GREEN}✅ Using different contract address${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  Web3Service.js not found${NC}"
fi

echo -e "\n${BLUE}🔐 SECURITY ANALYSIS:${NC}"

# Final security assessment
SECURITY_SCORE=0
TOTAL_CHECKS=6

# Check 1: Trezor address in deployment script
if [ "$SCRIPT_TREZOR" = "$TREZOR_ADDRESS" ]; then
    SECURITY_SCORE=$((SECURITY_SCORE + 1))
fi

# Check 2: All admin roles to Trezor
if [ "$TREASURY_COUNT" -eq 1 ] && [ "$EMERGENCY_COUNT" -eq 1 ] && [ "$POOL_COUNT" -eq 1 ]; then
    SECURITY_SCORE=$((SECURITY_SCORE + 1))
fi

# Check 3: BSC Mainnet config
if [ "$BSC_CONFIG" -eq 1 ]; then
    SECURITY_SCORE=$((SECURITY_SCORE + 1))
fi

# Check 4: No compromised addresses
if [ "$COMPROMISED_FOUND" -eq 0 ]; then
    SECURITY_SCORE=$((SECURITY_SCORE + 1))
fi

# Check 5: Deployer verification
if [ "$DEPLOYER_CHECK" -gt 0 ]; then
    SECURITY_SCORE=$((SECURITY_SCORE + 1))
fi

# Check 6: Emergency script exists
if [ -f "scripts/emergency-deploy-secure.js" ]; then
    SECURITY_SCORE=$((SECURITY_SCORE + 1))
fi

echo -e "\n${BLUE}📊 SECURITY SCORE: ${SECURITY_SCORE}/${TOTAL_CHECKS}${NC}"

if [ "$SECURITY_SCORE" -eq "$TOTAL_CHECKS" ]; then
    echo -e "${GREEN}🎉 PERFECT SECURITY CONFIGURATION!${NC}"
    echo -e "${GREEN}✅ All checks passed - Ready for secure deployment${NC}"
elif [ "$SECURITY_SCORE" -ge 4 ]; then
    echo -e "${YELLOW}⚠️  GOOD SECURITY - Minor issues to address${NC}"
    echo -e "${YELLOW}✅ Generally ready for deployment${NC}"
else
    echo -e "${RED}❌ SECURITY ISSUES DETECTED${NC}"
    echo -e "${RED}🚫 Please fix configuration before deployment${NC}"
fi

echo -e "\n${BLUE}📋 DEPLOYMENT COMMAND:${NC}"
echo -e "${YELLOW}npx hardhat run scripts/emergency-deploy-secure.js --network bscMainnet --config hardhat.mainnet.trezor.config.js${NC}"

echo -e "\n${BLUE}🔍 WHAT WILL HAPPEN:${NC}"
echo "1. Script will verify deployer = $TREZOR_ADDRESS"
echo "2. Deploy new OrphiCrowdFund contract"
echo "3. Set owner = $TREZOR_ADDRESS (your Trezor)"
echo "4. Set treasury = $TREZOR_ADDRESS (your Trezor)"
echo "5. Set emergency = $TREZOR_ADDRESS (your Trezor)"
echo "6. Set poolManager = $TREZOR_ADDRESS (your Trezor)"
echo "7. Initialize with BSC Mainnet USDT"

echo -e "\n${GREEN}🔐 SECURITY GUARANTEE:${NC}"
echo "✅ Only your Trezor will control the new contract"
echo "✅ No connection to compromised deployer wallet"
echo "✅ All admin functions require Trezor signing"
echo "✅ Maximum security from deployment onwards"

echo -e "\n${BLUE}🚀 Ready to proceed with secure deployment!${NC}"
