// scripts/check-wallet-funded.cjs
const { ethers } = require("ethers");

async function checkWalletFunded() {
    console.log("💰 Checking Wallet Funding Status");
    console.log("=" .repeat(50));
    
    const RPC_URL = "https://bsc-testnet-rpc.publicnode.com";
    // Get private key from .env
    require("dotenv").config();
    const DEPLOYMENT_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
    
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(DEPLOYMENT_PRIVATE_KEY, provider);
        
        console.log("📍 Wallet Address:", wallet.address);
        console.log("🌐 Network: BSC Testnet");
        
        const balance = await wallet.provider.getBalance(wallet.address);
        const balanceInBNB = ethers.formatEther(balance);
        
        console.log("💰 Current Balance:", balanceInBNB, "BNB");
        
        const minimumRequired = 0.05; // Minimum BNB needed for deployment
        
        if (parseFloat(balanceInBNB) >= minimumRequired) {
            console.log("✅ Wallet is sufficiently funded for deployment!");
            console.log("🚀 Ready to deploy. Run:");
            console.log("   npx hardhat run scripts/deploy-testnet-complete.cjs --network bscTestnet");
            return true;
        } else {
            console.log("❌ Insufficient funds for deployment");
            console.log(`⚠️  Need at least ${minimumRequired} BNB, have ${balanceInBNB} BNB`);
            console.log("💡 Fund your wallet:");
            console.log("   1. Go to: https://testnet.bnbchain.org/faucet-smart");
            console.log("   2. Enter address:", wallet.address);
            console.log("   3. Request 0.1 BNB");
            console.log("   4. Wait for confirmation");
            console.log("   5. Run this script again to check");
            return false;
        }
        
    } catch (error) {
        console.error("❌ Error checking wallet:", error.message);
        return false;
    }
}

if (require.main === module) {
    checkWalletFunded()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = checkWalletFunded;
