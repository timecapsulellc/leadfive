const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Deploying LeadFivePhaseOne to BSC Testnet...");
    console.log("📅 Date:", new Date().toISOString());

    // Load environment
    require('dotenv').config();
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    
    if (!privateKey || privateKey.length !== 64) {
        console.log("❌ Invalid DEPLOYER_PRIVATE_KEY in .env file");
        console.log("💡 Expected: 64-character hex string (without 0x prefix)");
        return;
    }

    // Connect to BSC Testnet
    const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
    const wallet = new ethers.Wallet(`0x${privateKey}`, provider);
    
    console.log("👤 Deployer address:", wallet.address);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Deployer balance:", ethers.formatEther(balance), "BNB");

    if (balance < ethers.parseEther("0.1")) {
        console.log("❌ Insufficient BNB balance for deployment");
        console.log("💡 Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart");
        return;
    }

    try {
        console.log("\n📋 Step 1: Creating contract factory...");
        const LeadFivePhaseOne = await ethers.getContractFactory("LeadFivePhaseOne", wallet);
        console.log("✅ Contract factory created successfully");

        console.log("\n📋 Step 2: Preparing deployment parameters...");
        
        // BSC Testnet addresses
        const testnetUSDT = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet USDT
        const testnetOracle = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // Chainlink BNB/USD testnet
        
        console.log("💱 USDT Token:", testnetUSDT);
        console.log("🔮 Price Oracle:", testnetOracle);

        console.log("\n📋 Step 3: Deploying proxy contract...");
        
        const proxy = await upgrades.deployProxy(LeadFivePhaseOne, [
            testnetUSDT,
            testnetOracle
        ], {
            initializer: 'initialize',
            kind: 'uups'
        });
        
        console.log("⏳ Waiting for deployment...");
        await proxy.waitForDeployment();
        
        const proxyAddress = await proxy.getAddress();
        console.log("✅ Proxy deployed to:", proxyAddress);

        console.log("\n📋 Step 4: Initializing Phase One features...");
        try {
            const initTx = await proxy.initializePhaseOne();
            await initTx.wait();
            console.log("✅ Phase One initialization complete");
        } catch (error) {
            console.log("ℹ️ Phase One features already initialized or not available");
        }

        console.log("\n📋 Step 5: Verification checks...");
        
        // Verify deployment
        const owner = await proxy.owner();
        const usdtToken = await proxy.usdtToken();
        
        console.log("🔐 Contract owner:", owner);
        console.log("💲 USDT token address:", usdtToken);
        
        // Test basic function
        try {
            const packageDetails = await proxy.getPackageDetails(1);
            console.log("📦 Package 1 price:", ethers.formatEther(packageDetails[0]), "USDT");
        } catch (error) {
            console.log("ℹ️ Package details not accessible (may be expected)");
        }

        console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
        console.log("📋 Contract Address:", proxyAddress);
        console.log("🌐 BSCScan Testnet:", `https://testnet.bscscan.com/address/${proxyAddress}`);
        console.log("🔗 Network: BSC Testnet (Chain ID: 97)");
        
        // Save deployment info
        const fs = require('fs');
        const deploymentInfo = {
            network: "BSC Testnet",
            contractName: "LeadFivePhaseOne",
            contractAddress: proxyAddress,
            deployer: wallet.address,
            deployerBalance: ethers.formatEther(balance),
            timestamp: new Date().toISOString(),
            chainId: 97,
            explorer: `https://testnet.bscscan.com/address/${proxyAddress}`,
            usdtToken: testnetUSDT,
            priceOracle: testnetOracle,
            txHash: null // Will be updated if needed
        };
        
        fs.writeFileSync('leadfive-testnet-deployment.json', JSON.stringify(deploymentInfo, null, 2));
        console.log("💾 Deployment info saved to leadfive-testnet-deployment.json");

        console.log("\n📋 NEXT STEPS:");
        console.log("1. Verify contract on BSCScan");
        console.log("2. Test registration and basic functions");
        console.log("3. If successful, proceed with mainnet upgrade");
        
        return proxyAddress;
        
    } catch (error) {
        console.error("\n❌ Deployment failed:", error.message);
        
        if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
            console.log("\n💡 Possible solutions:");
            console.log("- Check if contract size is under 24KB limit");
            console.log("- Verify all imported contracts exist");
            console.log("- Check network connectivity");
        }
        
        if (error.message.includes('nonce')) {
            console.log("\n💡 Nonce issue detected. Try running the deployment again.");
        }
        
        throw error;
    }
}

main()
    .then((address) => {
        if (address) {
            console.log(`\n✅ Deployment completed successfully!`);
            console.log(`📋 Contract deployed at: ${address}`);
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Script failed:", error);
        process.exit(1);
    });
