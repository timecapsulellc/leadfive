#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════════════════╗
# ║                🔐 TREZOR DEVICE SETUP AND CONNECTION TEST 🔐                          ║
# ║                                                                                       ║
# ║  This script helps set up your Trezor device and test the connection                 ║
# ║  before running the actual deployment.                                                ║
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
NC='\033[0m'

TREZOR_ADDRESS="0xeB652c4523f3Cf615D3F3694b14E551145953aD0"

print_header() {
    echo ""
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                🔐 TREZOR DEVICE SETUP AND CONNECTION TEST 🔐                          ║${NC}"
    echo -e "${PURPLE}║                                                                                       ║${NC}"
    echo -e "${PURPLE}║  Setting up your Trezor device for secure deployment                                 ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_trezor_bridge() {
    echo -e "${BLUE}🔍 Checking Trezor Bridge status...${NC}"
    
    if curl -s --connect-timeout 3 http://127.0.0.1:21325 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Trezor Bridge is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Trezor Bridge is not running${NC}"
        echo ""
        echo -e "${YELLOW}📋 To install and start Trezor Bridge:${NC}"
        echo "1. Download from: https://suite.trezor.io/web/"
        echo "2. Install Trezor Suite"
        echo "3. Connect your Trezor device"
        echo "4. Run Trezor Suite (this starts the bridge)"
        echo ""
        echo "Alternatively, download just Trezor Bridge from:"
        echo "https://wiki.trezor.io/Trezor_Bridge"
        echo ""
        return 1
    fi
}

check_wallet_balance() {
    echo -e "${BLUE}💰 Checking Trezor wallet balance...${NC}"
    
    # Use BSCScan API to check balance
    local balance_wei=$(curl -s "https://api.bscscan.com/api?module=account&action=balance&address=${TREZOR_ADDRESS}&tag=latest" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$balance_wei" ] && [ "$balance_wei" != "0" ]; then
        local balance_bnb=$(echo "scale=6; $balance_wei / 1000000000000000000" | bc -l 2>/dev/null || echo "0")
        echo -e "${GREEN}✅ Balance: ${balance_bnb} BNB${NC}"
        
        # Check if sufficient for deployment
        local min_balance="0.1"
        if (( $(echo "$balance_bnb >= $min_balance" | bc -l) )); then
            echo -e "${GREEN}✅ Sufficient balance for deployment${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Low balance - need at least 0.1 BNB for deployment${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ No BNB balance detected${NC}"
        echo ""
        echo -e "${YELLOW}📋 To fund your Trezor wallet:${NC}"
        echo "Send 0.1 BNB to: ${TREZOR_ADDRESS}"
        echo "Network: BSC Mainnet (BEP-20)"
        echo ""
        return 1
    fi
}

test_trezor_connection() {
    echo -e "${BLUE}🔌 Testing Trezor device connection...${NC}"
    echo ""
    echo -e "${YELLOW}📋 Please ensure:${NC}"
    echo "1. Trezor device is connected via USB"
    echo "2. Device is unlocked with PIN"
    echo "3. Ethereum app is enabled on device"
    echo "4. Trezor Suite or Bridge is running"
    echo ""
    
    # Create a simple Node.js test script
    cat > /tmp/trezor-test.js << 'EOF'
const TrezorConnect = require('@trezor/connect').default;

async function testTrezor() {
    try {
        console.log('🔐 Initializing Trezor Connect...');
        
        await TrezorConnect.init({
            lazyLoad: true,
            manifest: {
                email: 'orphi@example.com',
                appUrl: 'https://orphi.com'
            }
        });
        
        console.log('🔌 Attempting to connect to Trezor...');
        console.log('   Please confirm the address display on your Trezor device');
        
        const result = await TrezorConnect.ethereumGetAddress({
            path: "m/44'/60'/0'/0/0",
            showOnTrezor: true
        });
        
        if (result.success) {
            console.log(`✅ Trezor connected successfully!`);
            console.log(`📍 Address: ${result.payload.address}`);
            
            const expectedAddress = "0xeB652c4523f3Cf615D3F3694b14E551145953aD0";
            if (result.payload.address.toLowerCase() === expectedAddress.toLowerCase()) {
                console.log('✅ Address matches expected deployment address');
                process.exit(0);
            } else {
                console.log(`⚠️  Address mismatch!`);
                console.log(`   Expected: ${expectedAddress}`);
                console.log(`   Got:      ${result.payload.address}`);
                process.exit(1);
            }
        } else {
            console.log(`❌ Trezor connection failed: ${result.payload.error}`);
            process.exit(1);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

testTrezor();
EOF

    # Run the test
    if node /tmp/trezor-test.js; then
        echo -e "${GREEN}✅ Trezor connection test successful!${NC}"
        rm -f /tmp/trezor-test.js
        return 0
    else
        echo -e "${RED}❌ Trezor connection test failed${NC}"
        rm -f /tmp/trezor-test.js
        return 1
    fi
}

main() {
    print_header
    
    echo -e "${CYAN}🚀 Running Trezor setup and connection test...${NC}"
    echo ""
    
    # Step 1: Check Trezor Bridge
    if ! check_trezor_bridge; then
        echo ""
        echo -e "${RED}❌ Setup incomplete - Trezor Bridge not running${NC}"
        exit 1
    fi
    
    echo ""
    
    # Step 2: Check wallet balance
    if ! check_wallet_balance; then
        echo ""
        echo -e "${YELLOW}⚠️  Wallet funding required before deployment${NC}"
    fi
    
    echo ""
    
    # Step 3: Test Trezor connection
    if test_trezor_connection; then
        echo ""
        echo -e "${GREEN}🎉 TREZOR SETUP COMPLETE!${NC}"
        echo ""
        echo -e "${CYAN}✅ Your Trezor device is ready for deployment${NC}"
        echo -e "${CYAN}✅ Run deployment with: ./direct-trezor-launcher.sh${NC}"
        echo ""
    else
        echo ""
        echo -e "${RED}❌ Trezor setup incomplete${NC}"
        echo ""
        echo -e "${YELLOW}🔧 Troubleshooting steps:${NC}"
        echo "1. Ensure Trezor device is connected and unlocked"
        echo "2. Enable Ethereum app on Trezor device"
        echo "3. Make sure Trezor Suite is running"
        echo "4. Try disconnecting and reconnecting the device"
        echo "5. Restart Trezor Suite/Bridge"
        echo ""
        exit 1
    fi
}

# Run main function
main
