require('dotenv').config();
const { ethers } = require('hardhat');

async function checkBSCUSDTDetails() {
    console.log('🔍 CHECKING BSC USDT CONTRACT DETAILS');
    console.log('='.repeat(50));
    
    try {
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const bscUsdtAddress = "0x55d398326f99059fF775485246999027B3197955";
        
        // Standard ERC20 ABI for basic info
        const erc20ABI = [
            'function decimals() view returns (uint8)',
            'function symbol() view returns (string)',
            'function name() view returns (string)',
            'function totalSupply() view returns (uint256)'
        ];
        
        const usdtContract = new ethers.Contract(bscUsdtAddress, erc20ABI, provider);
        
        console.log(`BSC USDT Address: ${bscUsdtAddress}`);
        
        const [decimals, symbol, name] = await Promise.all([
            usdtContract.decimals(),
            usdtContract.symbol(),
            usdtContract.name()
        ]);
        
        console.log(`Name: ${name}`);
        console.log(`Symbol: ${symbol}`);
        console.log(`Decimals: ${decimals}`);
        
        console.log('\n🔧 DECIMAL CONVERSION ANALYSIS:');
        console.log(`BSC USDT uses ${decimals} decimals`);
        console.log(`Our contract expects 6 decimals internally`);
        console.log(`Conversion needed: ${decimals === 18 ? '18 to 6 decimal conversion required' : 'No conversion needed'}`);
        
        if (decimals === 18) {
            console.log('\n📝 REQUIRED FIXES:');
            console.log('1. Update contract initialization to handle 18-decimal USDT');
            console.log('2. Fix _processUSDTPayment to work with 18-decimal amounts');
            console.log('3. Update withdrawal function for proper decimal conversion');
            console.log('4. Test all conversion functions');
        }
        
        // Test conversion examples
        console.log('\n🧮 CONVERSION EXAMPLES:');
        const packagePrices = [30, 50, 100, 200]; // Package prices in USDT
        
        packagePrices.forEach((price, index) => {
            const price6Decimal = BigInt(price * 10**6); // Internal 6-decimal format
            const price18Decimal = BigInt(price) * BigInt(10**18); // BSC USDT 18-decimal format
            
            console.log(`Package ${index + 1} ($${price} USDT):`);
            console.log(`  - Internal (6 decimal): ${price6Decimal.toString()}`);
            console.log(`  - BSC USDT (18 decimal): ${price18Decimal.toString()}`);
            console.log(`  - Conversion factor: ${price18Decimal / price6Decimal}x`);
        });
        
    } catch (error) {
        console.error('❌ Error checking BSC USDT:', error.message);
    }
}

checkBSCUSDTDetails()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
