// scripts/test-direct-connection.cjs
const { ethers } = require("ethers");

async function testDirectConnection() {
    console.log("🔍 Testing Direct BSC Testnet Connection");
    console.log("=" .repeat(50));
    
    const RPC_URLS = [
        "https://data-seed-prebsc-1-s1.binance.org:8545/",
        "https://data-seed-prebsc-2-s1.binance.org:8545/",
        "https://bsc-testnet.blockpi.network/v1/rpc/public",
        "https://bsc-testnet-rpc.publicnode.com"
    ];
    
    // Get private key from .env
    require("dotenv").config();
    const DEPLOYMENT_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
    
    for (let i = 0; i < RPC_URLS.length; i++) {
        const rpcUrl = RPC_URLS[i];
        console.log(`\n🌐 Testing RPC ${i + 1}: ${rpcUrl}`);
        
        try {
            // Create provider with timeout
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            
            // Test basic connection
            const network = await Promise.race([
                provider.getNetwork(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
            ]);
            
            console.log("✅ Connected to chain ID:", network.chainId.toString());
            
            // Create wallet
            const wallet = new ethers.Wallet(DEPLOYMENT_PRIVATE_KEY, provider);
            console.log("✅ Wallet address:", wallet.address);
            
            // Check balance
            const balance = await wallet.provider.getBalance(wallet.address);
            const balanceInBNB = ethers.formatEther(balance);
            console.log("💰 Balance:", balanceInBNB, "BNB");
            
            if (parseFloat(balanceInBNB) === 0) {
                console.log("⚠️  Zero balance! Fund this wallet:");
                console.log("   Address:", wallet.address);
                console.log("   Faucet: https://testnet.bnbchain.org/faucet-smart");
            } else {
                console.log("✅ This RPC is working and wallet has funds!");
                return { rpcUrl, wallet, balance: balanceInBNB };
            }
            
        } catch (error) {
            console.log("❌ Failed:", error.message);
        }
    }
    
    console.log("\n📝 Summary:");
    console.log("- Test multiple RPC endpoints");
    console.log("- Fund wallet with testnet BNB if needed");
    console.log("- Use working RPC for deployment");
}

if (require.main === module) {
    testDirectConnection()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = testDirectConnection;
