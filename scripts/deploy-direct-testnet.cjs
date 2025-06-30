const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Deploying LeadFive Phase One to BSC Testnet...");

    // Override network configuration
    const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
    
    require('dotenv').config();
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("Deployer:", wallet.address);

    // Get testnet balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "BNB");

    if (balance < ethers.parseEther("0.1")) {
        console.log("❌ Insufficient BNB balance for deployment");
        console.log("💡 Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart");
        return;
    }

    try {
        // Deploy new implementation
        console.log("\n📋 Deploying LeadFivePhaseOne implementation...");
        
        // Create contract factory with custom signer
        const LeadFivePhaseOne = await ethers.getContractFactory("LeadFivePhaseOne", wallet);
        
        // Deploy as new proxy for testing
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
        const owner = await proxy.owner();
        const usdtAddress = await proxy.usdtToken();
        
        console.log("Contract owner:", owner);
        console.log("USDT token:", usdtAddress);
        
        // Test basic functions
        console.log("\n🧪 Testing basic functions...");
        const packages = await proxy.getPackageDetails(1);
        console.log("Package 1 price:", ethers.formatEther(packages[0]), "USDT");
        
        console.log("\n🎉 Deployment successful!");
        console.log("📋 Contract Address:", proxyAddress);
        console.log("🌐 BSCScan Testnet:", `https://testnet.bscscan.com/address/${proxyAddress}`);
        
        // Save to file
        const fs = require('fs');
        const deploymentInfo = {
            network: "BSC Testnet",
            contractAddress: proxyAddress,
            deployer: wallet.address,
            timestamp: new Date().toISOString(),
            chainId: 97,
            explorer: `https://testnet.bscscan.com/address/${proxyAddress}`
        };
        
        fs.writeFileSync('testnet-deployment.json', JSON.stringify(deploymentInfo, null, 2));
        console.log("💾 Deployment info saved to testnet-deployment.json");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        if (error.data) {
            console.error("Error data:", error.data);
        }
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
