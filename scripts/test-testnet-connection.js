const { ethers } = require("hardhat");

/**
 * TEST TESTNET CONNECTION
 * 
 * This script tests the basic testnet connection and deploys a simple contract
 */

async function main() {
    console.log("🌐 TESTING BSC TESTNET CONNECTION");
    console.log("=" .repeat(80));
    
    const [deployer] = await ethers.getSigners();
    
    console.log("📋 Network Information:");
    console.log(`   Network: ${network.name}`);
    console.log(`   Chain ID: ${network.config.chainId}`);
    console.log(`   Deployer: ${deployer.address}`);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`   Balance: ${ethers.formatEther(balance)} BNB`);
    
    if (balance < ethers.parseEther("0.01")) {
        console.log("❌ Insufficient balance for testing");
        return;
    }
    
    console.log("✅ Network connection successful!");
    console.log("✅ Sufficient balance available!");
    
    // Test transaction - deploy MockUSDT
    console.log("\n📦 Testing contract deployment...");
    
    try {
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        console.log("   Contract factory created ✅");
        
        const mockUSDT = await MockUSDT.deploy();
        console.log("   Deployment transaction sent ✅");
        
        await mockUSDT.waitForDeployment();
        const address = await mockUSDT.getAddress();
        console.log(`   MockUSDT deployed to: ${address} ✅`);
        
        // Test contract interaction
        const name = await mockUSDT.name();
        const symbol = await mockUSDT.symbol();
        const decimals = await mockUSDT.decimals();
        
        console.log(`   Token Name: ${name} ✅`);
        console.log(`   Token Symbol: ${symbol} ✅`);
        console.log(`   Token Decimals: ${decimals} ✅`);
        
        console.log("\n🎉 TESTNET CONNECTION TEST SUCCESSFUL!");
        console.log("   Ready to deploy main contracts!");
        
        return {
            network: network.name,
            chainId: network.config.chainId,
            deployer: deployer.address,
            mockUSDT: address,
            status: "SUCCESS"
        };
        
    } catch (error) {
        console.log("❌ Contract deployment failed:");
        console.log(`   Error: ${error.message}`);
        return {
            status: "FAILED",
            error: error.message
        };
    }
}

main()
    .then((result) => {
        if (result.status === "SUCCESS") {
            console.log("\n✅ Testnet is ready for full deployment!");
        } else {
            console.log("\n❌ Testnet connection test failed");
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
