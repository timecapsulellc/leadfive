const { ethers } = require("hardhat");
const fs = require('fs');

/**
 * PROFESSIONAL BSC TESTNET DEPLOYMENT SCRIPT
 * 
 * This script deploys the OrphiCrowdFundV2Enhanced contract to BSC Testnet
 * with proper configuration for production testing
 */

async function main() {
    console.log("🚀 ORPHI CROWDFUND - BSC TESTNET DEPLOYMENT");
    console.log("=" .repeat(80));
    
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 97n) {
        throw new Error("❌ This script is for BSC Testnet only (Chain ID: 97)");
    }
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const deployerBalance = await ethers.provider.getBalance(deployerAddress);
    
    console.log(`👤 Deployer: ${deployerAddress}`);
    console.log(`💰 Balance: ${ethers.formatEther(deployerBalance)} BNB`);
    
    if (deployerBalance < ethers.parseEther("0.1")) {
        throw new Error("❌ Insufficient BNB balance. Need at least 0.1 BNB for deployment");
    }
    
    // Configuration
    const config = {
        // BSC Testnet USDT address
        usdtAddress: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
        
        // Admin addresses from .env
        adminReserve: "0x658C37b88d211EEFd9a684237a20D5268B4A2e72",
        matrixRoot: "0x658C37b88d211EEFd9a684237a20D5268B4A2e72",
        
        // Test wallet addresses
        testWallets: [
            "0xE0Ea180812e05AE1B257D212C01FC4E45865EBd4",
            "0xDB54f3f8F42e0165a15A33736550790BB0662Ac6",
            "0x7379AF7f3efC8Ab3F8dA57EA917fB5C29B12bBB7"
        ]
    };
    
    console.log("\n📋 Deployment Configuration:");
    console.log(`   USDT Address: ${config.usdtAddress}`);
    console.log(`   Admin Reserve: ${config.adminReserve}`);
    console.log(`   Matrix Root: ${config.matrixRoot}`);
    console.log(`   Test Wallets: ${config.testWallets.length} configured`);
    
    // Estimate gas costs
    console.log("\n⛽ Estimating deployment costs...");
    
    try {
        // Deploy OrphiCrowdFundV2Enhanced
        console.log("\n🏗️  Deploying OrphiCrowdFundV2Enhanced...");
        
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundV2Enhanced");
        
        // Estimate deployment gas
        const deploymentData = OrphiCrowdFund.getDeployTransaction(config.usdtAddress);
        const gasEstimate = await ethers.provider.estimateGas(deploymentData);
        const gasPrice = await ethers.provider.getFeeData();
        
        const estimatedCost = gasEstimate * gasPrice.gasPrice;
        console.log(`   Estimated Gas: ${gasEstimate.toString()}`);
        console.log(`   Gas Price: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} gwei`);
        console.log(`   Estimated Cost: ${ethers.formatEther(estimatedCost)} BNB`);
        
        // Deploy with gas optimization
        const orphiContract = await OrphiCrowdFund.deploy(config.usdtAddress, {
            gasLimit: 6000000n, // Use sufficient gas limit
            gasPrice: gasPrice.gasPrice
        });
        
        console.log(`   Transaction Hash: ${orphiContract.deploymentTransaction().hash}`);
        console.log("   ⏳ Waiting for deployment confirmation...");
        
        await orphiContract.waitForDeployment();
        const contractAddress = await orphiContract.getAddress();
        
        console.log(`   ✅ Contract deployed at: ${contractAddress}`);
        
        // Verify deployment
        console.log("\n🔍 Verifying deployment...");
        
        const packageAmounts = await orphiContract.getPackageAmounts();
        const owner = await orphiContract.owner();
        const usdtToken = await orphiContract.usdtToken();
        
        console.log(`   Owner: ${owner}`);
        console.log(`   USDT Token: ${usdtToken}`);
        console.log(`   Package 1: $${ethers.formatUnits(packageAmounts[0], 6)}`);
        console.log(`   Package 2: $${ethers.formatUnits(packageAmounts[1], 6)}`);
        console.log(`   Package 3: $${ethers.formatUnits(packageAmounts[2], 6)}`);
        console.log(`   Package 4: $${ethers.formatUnits(packageAmounts[3], 6)}`);
        
        // Test basic functionality
        console.log("\n🧪 Testing basic functionality...");
        
        try {
            // Test package price retrieval
            const package1Price = await orphiContract.getPackagePrice(1);
            console.log(`   ✅ Package price retrieval: $${ethers.formatUnits(package1Price, 6)}`);
            
            // Test rank requirements
            const [teamSize, volume] = await orphiContract.getRankRequirements(1);
            console.log(`   ✅ Rank requirements: ${teamSize} team, $${ethers.formatUnits(volume, 6)} volume`);
            
            console.log("   ✅ All basic functions working");
            
        } catch (error) {
            console.log(`   ⚠️  Basic function test failed: ${error.message}`);
        }
        
        // Calculate actual deployment cost
        const receipt = await orphiContract.deploymentTransaction().wait();
        const actualCost = receipt.gasUsed * receipt.gasPrice;
        
        console.log("\n💰 Deployment Summary:");
        console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`   Gas Price: ${ethers.formatUnits(receipt.gasPrice, "gwei")} gwei`);
        console.log(`   Total Cost: ${ethers.formatEther(actualCost)} BNB`);
        
        // Save deployment info
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            network: "BSC Testnet",
            chainId: 97,
            deployer: deployerAddress,
            deployerBalance: ethers.formatEther(deployerBalance),
            contracts: {
                OrphiCrowdFundV2Enhanced: {
                    address: contractAddress,
                    transactionHash: orphiContract.deploymentTransaction().hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    gasPrice: receipt.gasPrice.toString(),
                    deploymentCost: ethers.formatEther(actualCost)
                }
            },
            configuration: config,
            verification: {
                owner: owner,
                usdtToken: usdtToken,
                packageAmounts: packageAmounts.map(amount => ethers.formatUnits(amount, 6))
            },
            testingInfo: {
                testWallets: config.testWallets,
                readyForTesting: true,
                nextSteps: [
                    "Fund test wallets with testnet BNB",
                    "Get testnet USDT from faucet",
                    "Test user registration flow",
                    "Test commission calculations",
                    "Test withdrawal system"
                ]
            }
        };
        
        // Save to file
        const filename = `bsc-testnet-deployment-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
        
        console.log("\n📄 Deployment info saved to:", filename);
        
        // Update .env file
        console.log("\n🔧 Updating .env file...");
        
        let envContent = fs.readFileSync('.env', 'utf8');
        envContent = envContent.replace(
            /REACT_APP_CONTRACT_ADDRESS=.*/,
            `REACT_APP_CONTRACT_ADDRESS=${contractAddress}`
        );
        fs.writeFileSync('.env', envContent);
        
        console.log("   ✅ .env file updated with contract address");
        
        // Generate testing guide
        console.log("\n📋 TESTNET TESTING GUIDE:");
        console.log("=" .repeat(80));
        
        console.log("\n🎯 IMMEDIATE NEXT STEPS:");
        console.log("1. Add BSC Testnet to MetaMask:");
        console.log("   - Network Name: BSC Testnet");
        console.log("   - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545");
        console.log("   - Chain ID: 97");
        console.log("   - Currency Symbol: BNB");
        console.log("   - Block Explorer: https://testnet.bscscan.com");
        
        console.log("\n2. Fund Test Wallets:");
        console.log("   - Get testnet BNB from: https://testnet.binance.org/faucet-smart");
        console.log("   - Get testnet USDT from contract: 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd");
        
        console.log("\n3. Test User Registration:");
        console.log(`   - Contract: ${contractAddress}`);
        console.log(`   - USDT: ${config.usdtAddress}`);
        console.log("   - Package prices: $30, $50, $100, $200");
        
        console.log("\n4. Verify on BSCScan:");
        console.log(`   - https://testnet.bscscan.com/address/${contractAddress}`);
        
        console.log("\n🎉 BSC TESTNET DEPLOYMENT COMPLETED SUCCESSFULLY!");
        console.log("🚀 Your OrphiCrowdFund system is ready for testnet testing!");
        
        return {
            contractAddress,
            deploymentCost: ethers.formatEther(actualCost),
            transactionHash: orphiContract.deploymentTransaction().hash,
            success: true
        };
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        
        // Save error info
        const errorInfo = {
            timestamp: new Date().toISOString(),
            network: "BSC Testnet",
            deployer: deployerAddress,
            error: error.message,
            stack: error.stack
        };
        
        fs.writeFileSync(`deployment-error-${Date.now()}.json`, JSON.stringify(errorInfo, null, 2));
        
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then((result) => {
            console.log("\n✅ Deployment script completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Deployment script failed:", error.message);
            process.exit(1);
        });
}

module.exports = main;
