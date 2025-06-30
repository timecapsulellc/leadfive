import { ethers } from 'ethers';

// Configuration
const CONTRACT_ADDRESS = '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569';
const BSC_RPC = 'https://bsc-dataseed.binance.org/';

// LeadFive Package Configuration (Based on Official PDF)
const PACKAGE_CONFIG = [
    {
        name: "Entry Level",
        title: "Web3 Starter",
        priceUSD: 30,
        priceBNB: "0.111", // $30 / $270 = 0.111 BNB
        directBonus: 4000,  // 40% in basis points (4000 = 40.00%)
        levelBonus: 1000,   // 10%
        uplineBonus: 1000,  // 10%
        leaderBonus: 1000,  // 10%
        helpBonus: 3000,    // 30%
        clubBonus: 0,       // 0%
        description: "Perfect for newcomers to Web3 and blockchain technology"
    },
    {
        name: "Standard",
        title: "Community Builder", 
        priceUSD: 50,
        priceBNB: "0.185", // $50 / $270 = 0.185 BNB
        directBonus: 4000,  // 40%
        levelBonus: 1000,   // 10%
        uplineBonus: 1000,  // 10%
        leaderBonus: 1000,  // 10%
        helpBonus: 3000,    // 30%
        clubBonus: 0,       // 0%
        description: "Ideal for active community builders and networkers"
    },
    {
        name: "Advanced",
        title: "DAO Contributor",
        priceUSD: 100,
        priceBNB: "0.370", // $100 / $270 = 0.370 BNB
        directBonus: 4000,  // 40%
        levelBonus: 1000,   // 10%
        uplineBonus: 1000,  // 10%
        leaderBonus: 1000,  // 10%
        helpBonus: 3000,    // 30%
        clubBonus: 0,       // 0%
        description: "For serious investors and DAO governance participants"
    },
    {
        name: "Premium",
        title: "Ecosystem Pioneer",
        priceUSD: 200,
        priceBNB: "0.741", // $200 / $270 = 0.741 BNB
        directBonus: 4000,  // 40%
        levelBonus: 1000,   // 10%
        uplineBonus: 1000,  // 10%
        leaderBonus: 1000,  // 10%
        helpBonus: 3000,    // 30%
        clubBonus: 0,       // 0%
        description: "Maximum benefits for ecosystem pioneers and leaders"
    }
];

function generateInitializationGuide() {
    console.log('🚀 LEADFIVE CONTRACT INITIALIZATION GUIDE');
    console.log('==========================================\n');
    
    console.log('📋 STEP 1: CONNECT TO BSCSCAN');
    console.log('==============================');
    console.log('1. Go to: https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#writeContract');
    console.log('2. Click "Connect to Web3" button');
    console.log('3. Connect your Trezor/MetaMask wallet');
    console.log('4. Make sure you are connected as the CONTRACT OWNER\n');
    
    console.log('📦 STEP 2: LOOK FOR INITIALIZATION FUNCTION');
    console.log('===========================================');
    console.log('Search for one of these functions in the Write Contract section:');
    console.log('- setPackageInfo(uint8,uint256,uint16,uint16,uint16,uint16,uint16,uint16)');
    console.log('- setPackage(uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)');
    console.log('- initializePackages()');
    console.log('- configurePackages()');
    console.log('- initialize()\n');
    
    console.log('💰 STEP 3: LEADFIVE PARTICIPATION LEVELS (FROM OFFICIAL PDF)');
    console.log('===========================================================');
    
    PACKAGE_CONFIG.forEach((pkg, index) => {
        const priceWei = ethers.parseEther(pkg.priceBNB);
        
        console.log(`\n${pkg.name} - ${pkg.title} (Index ${index}):`);
        console.log(`├─ Package ID: ${index}`);
        console.log(`├─ Price (wei): ${priceWei.toString()}`);
        console.log(`├─ Price (BNB): ${pkg.priceBNB}`);
        console.log(`├─ Price (USD): $${pkg.priceUSD}`);
        console.log(`├─ Description: ${pkg.description}`);
        console.log(`├─ Direct Bonus: ${pkg.directBonus} (${pkg.directBonus/100}%)`);
        console.log(`├─ Level Bonus: ${pkg.levelBonus} (${pkg.levelBonus/100}%)`);
        console.log(`├─ Upline Bonus: ${pkg.uplineBonus} (${pkg.uplineBonus/100}%)`);
        console.log(`├─ Leader Bonus: ${pkg.leaderBonus} (${pkg.leaderBonus/100}%)`);
        console.log(`├─ Help Bonus: ${pkg.helpBonus} (${pkg.helpBonus/100}%)`);
        console.log(`└─ Club Bonus: ${pkg.clubBonus} (${pkg.clubBonus/100}%)`);
    });
    
    console.log('\n🔧 STEP 4: INITIALIZATION METHODS');
    console.log('=================================');
    
    console.log('\nMETHOD A: Individual Package Setup (RECOMMENDED)');
    console.log('------------------------------------------------');
    console.log('If you have a setPackageInfo() function, call it 4 times with these EXACT values:\n');
    
    PACKAGE_CONFIG.forEach((pkg, index) => {
        const priceWei = ethers.parseEther(pkg.priceBNB);
        console.log(`Call ${index + 1}: setPackageInfo() - ${pkg.name} (${pkg.title})`);
        console.log(`packageId: ${index}`);
        console.log(`price: ${priceWei.toString()}`);
        console.log(`directBonus: ${pkg.directBonus}`);
        console.log(`levelBonus: ${pkg.levelBonus}`);
        console.log(`uplineBonus: ${pkg.uplineBonus}`);
        console.log(`leaderBonus: ${pkg.leaderBonus}`);
        console.log(`helpBonus: ${pkg.helpBonus}`);
        console.log(`clubBonus: ${pkg.clubBonus}`);
        console.log(''); // Empty line for readability
    });
    
    console.log('\n\nMETHOD B: Batch Initialization');
    console.log('------------------------------');
    console.log('If you have an array-based function, use these arrays:');
    
    const prices = PACKAGE_CONFIG.map(pkg => ethers.parseEther(pkg.priceBNB));
    const directBonuses = PACKAGE_CONFIG.map(pkg => pkg.directBonus);
    const levelBonuses = PACKAGE_CONFIG.map(pkg => pkg.levelBonus);
    
    console.log('\nPrices array (wei):');
    console.log(`[${prices.map(p => p.toString()).join(', ')}]`);
    
    console.log('\nDirect bonuses array:');
    console.log(`[${directBonuses.join(', ')}]`);
    
    console.log('\nLevel bonuses array:');
    console.log(`[${levelBonuses.join(', ')}]`);
    
    console.log('\n✅ STEP 5: VERIFICATION');
    console.log('======================');
    console.log('After initialization, run: node analyze-contract.js');
    console.log('This will verify all packages are properly set up.\n');
    
    console.log('⚠️  IMPORTANT NOTES:');
    console.log('===================');
    console.log('• You MUST be the contract owner to initialize');
    console.log('• Initialize ALL 4 packages before anyone can register'); 
    console.log('• Bonus values are in basis points (5000 = 50%)');
    console.log('• Prices are in wei (18 decimal places)');
    console.log('• Test with Package 1 registration after initialization');
    console.log('• Keep your Trezor connected throughout the process\n');
}

// Generate the guide
generateInitializationGuide();
