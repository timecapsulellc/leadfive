const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Simple LeadFive Phase One Deployment to BSC Testnet...");

    // Connect directly to BSC Testnet
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
        return;
    }

    try {
        // Deploy contract directly (non-proxy for simplicity)
        console.log("\n📋 Deploying LeadFivePhaseOne directly...");
        
        const LeadFivePhaseOne = await ethers.getContractFactory("LeadFivePhaseOne", wallet);
        
        // Mock oracle for testnet and USDT
        const testnetOracle = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";
        const testnetUSDT = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
        
        console.log("🔄 Deploying contract...");
        
        const contract = await LeadFivePhaseOne.deploy();
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        console.log("✅ Contract deployed to:", contractAddress);
        
        // Initialize the contract
        console.log("\n🔧 Initializing contract...");
        const initTx = await contract.initialize(testnetUSDT, testnetOracle);
        await initTx.wait();
        console.log("✅ Contract initialized");
        
        // Initialize Phase One features
        console.log("\n🔧 Initializing Phase One features...");
        const phaseInitTx = await contract.initializePhaseOne();
        await phaseInitTx.wait();
        console.log("✅ Phase One initialization complete");
        
        // Test basic functions
        console.log("\n🧪 Testing basic functions...");
        const owner = await contract.owner();
        const totalUsers = await contract.totalUsers();
        
        console.log("Contract owner:", owner);
        console.log("Total users:", totalUsers.toString());
        
        // Test package info
        const packageInfo = await contract.packages(1);
        console.log("Package 1 price:", ethers.formatEther(packageInfo[0]), "USDT");
        
        console.log("\n🎉 Deployment successful!");
        console.log("📋 Contract Address:", contractAddress);
        console.log("🌐 BSCScan Testnet:", `https://testnet.bscscan.com/address/${contractAddress}`);
        
        // Save deployment info
        const fs = require('fs');
        const deploymentInfo = {
            network: "BSC Testnet",
            contractAddress: contractAddress,
            deployer: wallet.address,
            timestamp: new Date().toISOString(),
            chainId: 97,
            explorer: `https://testnet.bscscan.com/address/${contractAddress}`,
            owner: owner,
            testnetUSDT: testnetUSDT,
            testnetOracle: testnetOracle
        };
        
        fs.writeFileSync('testnet-deployment-success.json', JSON.stringify(deploymentInfo, null, 2));
        console.log("💾 Deployment info saved to testnet-deployment-success.json");
        
        return contractAddress;
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        if (error.data) {
            console.error("Error data:", error.data);
        }
        throw error;
    }
}

main()
    .then((contractAddress) => {
        console.log("\n✅ DEPLOYMENT COMPLETE!");
        console.log("Contract Address:", contractAddress);
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
