const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("🔍 Checking BSC Mainnet Balance");
    console.log("================================");
    console.log("📋 Wallet Address:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    const balanceInBNB = ethers.formatEther(balance);
    
    console.log("💰 BNB Balance:", balanceInBNB, "BNB");
    
    if (parseFloat(balanceInBNB) < 0.1) {
        console.log("❌ Insufficient BNB balance for deployment!");
        console.log("💡 You need at least 0.1 BNB for deployment");
        process.exit(1);
    } else {
        console.log("✅ Sufficient balance for deployment");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
