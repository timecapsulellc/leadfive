const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env.trezor" });

async function main() {
    console.log("🔍 Testing BSC Testnet Connection...");
    
    try {
        // Get network info
        const network = await ethers.provider.getNetwork();
        console.log(`✅ Connected to: ${network.name} (Chain ID: ${network.chainId})`);
        
        // Get deployer account
        const [deployer] = await ethers.getSigners();
        console.log(`👤 Deployer Address: ${deployer.address}`);
        
        // Check balance
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB`);
        
        // Get current block number
        const blockNumber = await ethers.provider.getBlockNumber();
        console.log(`📦 Current Block: ${blockNumber}`);
        
        console.log("✅ Network connection successful!");
        
    } catch (error) {
        console.error("❌ Network connection failed:");
        console.error(error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
