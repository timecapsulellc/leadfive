const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Deploying LeadFive Phase One to BSC Testnet...");

    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    // Get testnet balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "BNB");

    if (balance < ethers.parseEther("0.1")) {
        console.log("❌ Insufficient BNB balance for deployment");
        console.log("💡 Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart");
        return;
    }

    try {
        // Deploy new implementation
        console.log("\n📋 Deploying LeadFivePhaseOne implementation...");
        const LeadFivePhaseOne = await ethers.getContractFactory("LeadFivePhaseOne");
        
        // Deploy as new proxy for testing (not upgrade)
        console.log("🔄 Deploying new proxy for testing...");
        
        // Mock oracle for testnet (Chainlink BNB/USD testnet)
        const testnetOracle = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";
        const testnetUSDT = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet USDT
        
        const proxy = await upgrades.deployProxy(LeadFivePhaseOne, [
            testnetUSDT,
            testnetOracle
        ], {
            initializer: 'initialize'
        });
        
        await proxy.waitForDeployment();
        const proxyAddress = await proxy.getAddress();
        
        console.log("✅ Proxy deployed to:", proxyAddress);
        
        // Initialize Phase One features
        console.log("\n🔧 Initializing Phase One features...");
        const initTx = await proxy.initializePhaseOne();
        await initTx.wait();
        
        console.log("✅ Phase One initialization complete");
        
        // Verify deployment
        console.log("\n🔍 Verifying deployment...");
        const totalUsers = await proxy.totalUsers();
        const nextPosition = await proxy.nextPositionId();
        
        console.log("Total users:", totalUsers.toString());
        console.log("Next position ID:", nextPosition.toString());
        
        // Get pool info
        const poolInfo = await proxy.getPoolInfo();
        console.log("\n💰 Pool Information:");
        console.log("Leadership Pool:", ethers.formatEther(poolInfo[0]), "USDT");
        console.log("Community Pool:", ethers.formatEther(poolInfo[1]), "USDT");
        console.log("Club Pool:", ethers.formatEther(poolInfo[2]), "USDT");
        console.log("Algorithmic Pool:", ethers.formatEther(poolInfo[3]), "USDT");
        
        console.log("\n🎯 TESTNET DEPLOYMENT SUMMARY:");
        console.log("=====================================");
        console.log("Network: BSC Testnet");
        console.log("Proxy Address:", proxyAddress);
        console.log("Deployer:", deployer.address);
        console.log("Contract: LeadFivePhaseOne");
        console.log("Status: ✅ Ready for testing");
        console.log("=====================================");
        
        console.log("\n📝 Save this information for testing:");
        console.log(`export TESTNET_PROXY_ADDRESS="${proxyAddress}"`);
        
        // Create .env update suggestion
        console.log("\n💡 Add to your .env file:");
        console.log(`TESTNET_PROXY_ADDRESS=${proxyAddress}`);
        console.log(`TESTNET_IMPLEMENTATION_ADDRESS=${await upgrades.erc1967.getImplementationAddress(proxyAddress)}`);
        
        return {
            proxy: proxyAddress,
            implementation: await upgrades.erc1967.getImplementationAddress(proxyAddress)
        };
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
