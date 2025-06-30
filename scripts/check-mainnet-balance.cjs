// scripts/check-mainnet-balance.cjs
// Check deployer balance on BSC Mainnet before deployment

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 CHECKING MAINNET DEPLOYMENT READINESS");
    console.log("=========================================");
    
    try {
        // Get deployer account
        const [deployer] = await ethers.getSigners();
        console.log(`Deployer Address: ${deployer.address}`);
        
        // Check BNB balance
        const balance = await ethers.provider.getBalance(deployer.address);
        const bnbBalance = ethers.formatEther(balance);
        console.log(`BNB Balance: ${bnbBalance} BNB`);
        
        // Calculate estimated deployment cost
        const estimatedGasCost = ethers.parseEther("0.05"); // ~0.05 BNB for deployment
        const hasEnoughBalance = balance >= estimatedGasCost;
        
        console.log(`\n💰 BALANCE CHECK:`);
        console.log(`Estimated deployment cost: ~0.05 BNB`);
        console.log(`Current balance: ${bnbBalance} BNB`);
        console.log(`Sufficient funds: ${hasEnoughBalance ? '✅ YES' : '❌ NO'}`);
        
        if (!hasEnoughBalance) {
            console.log(`\n⚠️ WARNING: Insufficient BNB for deployment!`);
            console.log(`Please add at least 0.05 BNB to ${deployer.address}`);
            console.log(`You can get BNB from exchanges like Binance, KuCoin, etc.`);
        } else {
            console.log(`\n✅ Ready for mainnet deployment!`);
        }
        
        // Check network details
        const network = await ethers.provider.getNetwork();
        console.log(`\n🌐 NETWORK DETAILS:`);
        console.log(`Chain ID: ${network.chainId}`);
        console.log(`Network Name: ${network.chainId === 56n ? 'BSC Mainnet' : 'Unknown'}`);
        
        if (network.chainId !== 56n) {
            console.log(`❌ ERROR: Not connected to BSC Mainnet (Chain ID: 56)`);
            console.log(`Current Chain ID: ${network.chainId}`);
        }
        
    } catch (error) {
        console.error("❌ Error checking balance:", error.message);
        if (error.message.includes("invalid address")) {
            console.log("Please check your DEPLOYER_PRIVATE_KEY in .env file");
        }
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
