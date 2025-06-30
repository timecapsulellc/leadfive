import { ethers } from 'ethers';

// Configuration
const CONTRACT_ADDRESS = '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569';
const BSC_RPC = 'https://bsc-dataseed.binance.org/';

// Contract ABI for reading functions
const CONTRACT_ABI = [
    'function packages(uint8) view returns (uint256 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus)',
    'function owner() view returns (address)',
    'function packagePrices(uint256) view returns (uint256)',
    'function getUserInfo(address) view returns (uint8, uint8, uint256, uint256, address)',
    'function isRegistered(address) view returns (bool)'
];

async function analyzeContract() {
    console.log('🔍 LEADFIVE CONTRACT ANALYSIS');
    console.log('============================\n');
    
    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    try {
        // Check if contract is deployed
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') {
            console.log('❌ Contract not found at this address!');
            return;
        }
        console.log('✅ Contract is deployed and active\n');
        
        // Check owner
        try {
            const owner = await contract.owner();
            console.log(`📋 Contract Owner: ${owner}`);
            console.log(`🔗 BSCScan: https://bscscan.com/address/${owner}\n`);
        } catch (error) {
            console.log('⚠️  Could not read owner (function may not exist)\n');
        }
        
        // Check package initialization status
        console.log('📦 PACKAGE INITIALIZATION STATUS:');
        console.log('=================================');
        
        let allInitialized = true;
        const currentBNBPrice = 270; // Approximate USD price
        
        for (let i = 0; i < 4; i++) {
            try {
                const pkg = await contract.packages(i);
                const priceInBNB = ethers.formatEther(pkg.price);
                const priceInUSD = parseFloat(priceInBNB) * currentBNBPrice;
                
                console.log(`\nPackage ${i + 1}:`);
                console.log(`  Price: ${priceInBNB} BNB (~$${priceInUSD.toFixed(0)})`);
                console.log(`  Direct Bonus: ${Number(pkg.directBonus) / 100}%`);
                console.log(`  Level Bonus: ${Number(pkg.levelBonus) / 100}%`);
                console.log(`  Upline Bonus: ${Number(pkg.uplineBonus) / 100}%`);
                console.log(`  Leader Bonus: ${Number(pkg.leaderBonus) / 100}%`);
                console.log(`  Help Bonus: ${Number(pkg.helpBonus) / 100}%`);
                console.log(`  Club Bonus: ${Number(pkg.clubBonus) / 100}%`);
                console.log(`  Status: ${pkg.price > 0 ? '✅ Initialized' : '❌ NOT Initialized'}`);
                
                if (pkg.price == 0) {
                    allInitialized = false;
                }
            } catch (error) {
                console.log(`  Package ${i + 1}: ❌ Error reading - ${error.message}`);
                allInitialized = false;
            }
        }
        
        console.log('\n' + '='.repeat(50));
        if (allInitialized) {
            console.log('🎉 ALL PACKAGES ARE PROPERLY INITIALIZED!');
            console.log('✅ Users can now register successfully');
        } else {
            console.log('⚠️  PACKAGES NEED INITIALIZATION!');
            console.log('❌ Registration will fail until packages are set up');
        }
        
        // Alternative method - check packagePrices array
        console.log('\n📋 ALTERNATIVE PRICE CHECK:');
        console.log('===========================');
        try {
            for (let i = 0; i < 4; i++) {
                const price = await contract.packagePrices(i);
                const priceInBNB = ethers.formatEther(price);
                console.log(`Package ${i + 1} Price: ${priceInBNB} BNB`);
            }
        } catch (error) {
            console.log('⚠️  packagePrices function not available');
        }
        
    } catch (error) {
        console.error('❌ Error analyzing contract:', error.message);
    }
}

// Run analysis
analyzeContract();
