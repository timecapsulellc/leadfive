// QUICK REFERENCE FOR LEADFIVE MAINNET DEPLOYMENT

const MAINNET_ADDRESSES = {
    // Core Contracts
    LEADFIVE_PROXY: "0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c",      // Main contract
    LEADFIVE_IMPLEMENTATION: "0xc58620dd8fD9d244453e421E700c2D3FCFB595b4", // Logic
    
    // Token Contracts
    USDT: "0x55d398326f99059fF775485246999027B3197955",                   // Real BSC USDT
    
    // Admin Addresses
    DEPLOYER: "0x140aad3E7c6bCC415Bc8E830699855fF072d405D",              // Owner/Admin
    PLATFORM_FEE_RECIPIENT: "0x140aad3E7c6bCC415Bc8E830699855fF072d405D", // Fee recipient
    
    // Other
    PLACEHOLDER_ORACLE: "0x1E95943b022dde7Ce7e0F54ced25599e0c6D8b9b"     // Temporary oracle
};

const PACKAGE_PRICES = {
    1: 30,   // $30 USDT
    2: 50,   // $50 USDT
    3: 100,  // $100 USDT
    4: 200   // $200 USDT
};

const COMMISSION_STRUCTURE = {
    DIRECT_BONUS: "40%",           // To direct sponsor
    LEVEL_BONUS: "10%",            // Distributed across 10 levels
    REFERRER_CHAIN: "10%",         // To 30 participants
    LEADERSHIP_POOL: "10%",        // Leadership pool
    COMMUNITY_POOL: "10%",         // Community/Help pool
    CLUB_POOL: "10-25%",          // Club pool (varies by package)
    PLATFORM_FEE: "5%",           // On withdrawals only
};

const WITHDRAWAL_RATES = {
    DEFAULT: "70%",                // 0-4 direct referrals
    INTERMEDIATE: "75%",           // 5-19 direct referrals
    ADVANCED: "80%"               // 20+ direct referrals
};

const SECURITY_FEATURES = {
    EARNINGS_CAP: "4x investment",
    CIRCUIT_BREAKER: "10 BNB",
    DAILY_WITHDRAWAL_LIMIT: "1000 USDT",
    ANTI_MEV: true,
    REENTRANCY_GUARD: true,
    PAUSABLE: true,
    UPGRADEABLE: true
};

// BSCScan Links
const BSCSCAN_LINKS = {
    PROXY: `https://bscscan.com/address/${MAINNET_ADDRESSES.LEADFIVE_PROXY}`,
    IMPLEMENTATION: `https://bscscan.com/address/${MAINNET_ADDRESSES.LEADFIVE_IMPLEMENTATION}#code`,
    USDT: `https://bscscan.com/token/${MAINNET_ADDRESSES.USDT}`
};

// Network Configuration
const NETWORK_CONFIG = {
    CHAIN_ID: 56,
    NETWORK_NAME: "BSC Mainnet",
    RPC_URL: "https://bsc-dataseed.binance.org/",
    EXPLORER: "https://bscscan.com",
    CURRENCY: {
        NAME: "BNB",
        SYMBOL: "BNB",
        DECIMALS: 18
    }
};

// Gas Configuration
const GAS_CONFIG = {
    REGISTER_USER: "~300,000 gas",
    WITHDRAW: "~150,000 gas",
    UPGRADE_PACKAGE: "~250,000 gas",
    ADMIN_FUNCTIONS: "~100,000 gas",
    CURRENT_GAS_PRICE: "5 gwei (typical)"
};

// Export everything
module.exports = {
    MAINNET_ADDRESSES,
    PACKAGE_PRICES,
    COMMISSION_STRUCTURE,
    WITHDRAWAL_RATES,
    SECURITY_FEATURES,
    BSCSCAN_LINKS,
    NETWORK_CONFIG,
    GAS_CONFIG
};

// Quick display function
function displayQuickReference() {
    console.log("🚀 LEADFIVE MAINNET QUICK REFERENCE");
    console.log("=" .repeat(50));
    
    console.log("\n📍 MAIN CONTRACT ADDRESSES:");
    console.log(`Proxy (Main): ${MAINNET_ADDRESSES.LEADFIVE_PROXY}`);
    console.log(`Implementation: ${MAINNET_ADDRESSES.LEADFIVE_IMPLEMENTATION}`);
    console.log(`USDT Token: ${MAINNET_ADDRESSES.USDT}`);
    console.log(`Owner/Admin: ${MAINNET_ADDRESSES.DEPLOYER}`);
    
    console.log("\n💰 PACKAGE PRICES:");
    Object.entries(PACKAGE_PRICES).forEach(([level, price]) => {
        console.log(`├─ Level ${level}: $${price} USDT`);
    });
    
    console.log("\n📊 COMMISSION RATES:");
    Object.entries(COMMISSION_STRUCTURE).forEach(([type, rate]) => {
        console.log(`├─ ${type.replace(/_/g, ' ')}: ${rate}`);
    });
    
    console.log("\n💸 WITHDRAWAL RATES:");
    Object.entries(WITHDRAWAL_RATES).forEach(([tier, rate]) => {
        console.log(`├─ ${tier}: ${rate}`);
    });
    
    console.log("\n🔐 SECURITY FEATURES:");
    Object.entries(SECURITY_FEATURES).forEach(([feature, value]) => {
        const status = typeof value === 'boolean' ? (value ? '✅' : '❌') : value;
        console.log(`├─ ${feature.replace(/_/g, ' ')}: ${status}`);
    });
    
    console.log("\n🔗 IMPORTANT LINKS:");
    console.log(`├─ Contract: ${BSCSCAN_LINKS.PROXY}`);
    console.log(`├─ Source Code: ${BSCSCAN_LINKS.IMPLEMENTATION}`);
    console.log(`└─ USDT Token: ${BSCSCAN_LINKS.USDT}`);
    
    console.log("\n⛽ GAS ESTIMATES:");
    Object.entries(GAS_CONFIG).forEach(([action, estimate]) => {
        console.log(`├─ ${action.replace(/_/g, ' ')}: ${estimate}`);
    });
    
    console.log("\n🌐 NETWORK INFO:");
    console.log(`├─ Chain ID: ${NETWORK_CONFIG.CHAIN_ID}`);
    console.log(`├─ Network: ${NETWORK_CONFIG.NETWORK_NAME}`);
    console.log(`├─ RPC: ${NETWORK_CONFIG.RPC_URL}`);
    console.log(`└─ Explorer: ${NETWORK_CONFIG.EXPLORER}`);
    
    console.log("\n💡 QUICK COMMANDS:");
    console.log("├─ Check Status: npx hardhat run deployment-restoration/contract-interaction-guide.js --network bsc status");
    console.log("├─ Check User: npx hardhat run deployment-restoration/contract-interaction-guide.js --network bsc user <address>");
    console.log("├─ Emergency Pause: npx hardhat run deployment-restoration/emergency-procedures.js --network bsc pause");
    console.log("└─ Upgrade Check: npx hardhat run deployment-restoration/upgrade-guide.js --network bsc check");
}

// Function to generate frontend config
function generateFrontendConfig() {
    return {
        contract: {
            address: MAINNET_ADDRESSES.LEADFIVE_PROXY,
            abi: "Use implementation contract ABI",
            network: NETWORK_CONFIG.CHAIN_ID
        },
        tokens: {
            usdt: MAINNET_ADDRESSES.USDT
        },
        packages: PACKAGE_PRICES,
        commission: COMMISSION_STRUCTURE,
        withdrawalRates: WITHDRAWAL_RATES,
        links: BSCSCAN_LINKS
    };
}

// Function to generate Web3 connection config
function generateWeb3Config() {
    return {
        chainId: `0x${NETWORK_CONFIG.CHAIN_ID.toString(16)}`, // Hex format
        chainName: NETWORK_CONFIG.NETWORK_NAME,
        nativeCurrency: NETWORK_CONFIG.CURRENCY,
        rpcUrls: [NETWORK_CONFIG.RPC_URL],
        blockExplorerUrls: [NETWORK_CONFIG.EXPLORER]
    };
}

if (require.main === module) {
    displayQuickReference();
    
    console.log("\n📱 FRONTEND CONFIG:");
    console.log(JSON.stringify(generateFrontendConfig(), null, 2));
    
    console.log("\n🌐 WEB3 CONFIG:");
    console.log(JSON.stringify(generateWeb3Config(), null, 2));
}

module.exports.displayQuickReference = displayQuickReference;
module.exports.generateFrontendConfig = generateFrontendConfig;
module.exports.generateWeb3Config = generateWeb3Config;
