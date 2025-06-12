const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking BSC Testnet Account Balance");
    
    try {
        const [deployer] = await ethers.getSigners();
        console.log("👤 Account:", deployer.address);
        
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log("💰 Balance:", ethers.formatEther(balance), "BNB");
        
        if (balance == 0n) {
            console.log("\n❌ No BNB balance detected!");
            console.log("🔗 Get testnet BNB at: https://testnet.binance.org/faucet-smart");
            console.log("📍 Fund this address:", deployer.address);
        } else {
            console.log("✅ Account has sufficient balance for deployment");
        }
        
        // Check network
        const network = await ethers.provider.getNetwork();
        console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());
        
        // Check latest block
        const blockNumber = await ethers.provider.getBlockNumber();
        console.log("📦 Latest block:", blockNumber);
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main().catch(console.error);
