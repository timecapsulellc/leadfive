const { ethers } = require("hardhat");

async function checkTestnetBalance() {
    try {
        console.log("🔍 Checking BSC Testnet Balance");
        console.log("================================");
        
        // Get the deployer account
        const [deployer] = await ethers.getSigners();
        console.log("📋 Wallet Address:", deployer.address);
        
        // Check BNB balance
        const balance = await deployer.provider.getBalance(deployer.address);
        const balanceInBNB = ethers.formatEther(balance);
        console.log("💰 BNB Balance:", balanceInBNB, "BNB");
        
        // Check if sufficient for deployment and testing
        const requiredBNB = "0.1";
        const hasEnoughBNB = parseFloat(balanceInBNB) >= parseFloat(requiredBNB);
        
        if (hasEnoughBNB) {
            console.log("✅ Sufficient BNB balance for deployment and testing!");
        } else {
            console.log("❌ Insufficient BNB balance!");
            console.log("💡 You need at least", requiredBNB, "BNB for deployment and testing");
            console.log("🚰 Use the faucets listed in TESTNET_FUNDING_GUIDE.md");
        }
        
        // Check USDT balance if contract is deployed
        try {
            const usdtAddress = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684"; // BSC Testnet USDT
            const usdtABI = [
                "function balanceOf(address) view returns (uint256)",
                "function decimals() view returns (uint8)",
                "function symbol() view returns (string)"
            ];
            
            const usdtContract = new ethers.Contract(usdtAddress, usdtABI, deployer);
            const usdtBalance = await usdtContract.balanceOf(deployer.address);
            const decimals = await usdtContract.decimals();
            const symbol = await usdtContract.symbol();
            const usdtBalanceFormatted = ethers.formatUnits(usdtBalance, decimals);
            
            console.log("💵", symbol, "Balance:", usdtBalanceFormatted, symbol);
            
            if (parseFloat(usdtBalanceFormatted) >= 1000) {
                console.log("✅ Sufficient USDT balance for testing!");
            } else {
                console.log("❌ Insufficient USDT balance!");
                console.log("💡 You need at least 1000 USDT for comprehensive testing");
            }
            
        } catch (error) {
            console.log("⚠️  Could not check USDT balance:", error.message);
        }
        
        console.log("\n🔗 Funding Resources:");
        console.log("• BNB Faucet: https://testnet.binance.org/faucet-smart");
        console.log("• Alternative: https://faucet.quicknode.com/binance-smart-chain/bnb-testnet");
        console.log("• Your address:", deployer.address);
        
        return {
            address: deployer.address,
            bnbBalance: balanceInBNB,
            hasEnoughBNB,
            network: deployer.provider._network?.name || "bscTestnet"
        };
        
    } catch (error) {
        console.error("❌ Error checking balance:", error.message);
        throw error;
    }
}

if (require.main === module) {
    checkTestnetBalance()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { checkTestnetBalance };
