import hre from "hardhat";
import fs from 'fs';

const { ethers } = hre;

async function main() {
    console.log("🚀 DEPLOYING ORPHI CROWDFUND DEPLOYABLE VERSION");
    console.log("=" .repeat(80));
    
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
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
        usdtAddress: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // BSC Testnet USDT
    };
    
    console.log("\n📋 Deployment Configuration:");
    console.log(`   USDT Address: ${config.usdtAddress}`);
    console.log(`   Admin/Root: ${deployerAddress}`);
    
    try {
        // Deploy OrphiCrowdFundDeployable
        console.log("\n🏗️  Deploying OrphiCrowdFundDeployable...");
        
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundDeployable");
        
        // Get current gas price
        const feeData = await ethers.provider.getFeeData();
        console.log(`   Gas Price: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei`);
        
        // Deploy implementation contract (UUPS upgradeable - no constructor args)
        console.log("🚀 Starting implementation deployment...");
        const orphiImplementation = await OrphiCrowdFund.deploy({
            gasLimit: 6000000n, // Reduced gas limit for smaller contract
            gasPrice: feeData.gasPrice
        });

        console.log(`   Implementation Tx Hash: ${orphiImplementation.deploymentTransaction().hash}`);
        console.log("   ⏳ Waiting for implementation deployment...");

        await orphiImplementation.waitForDeployment();
        const implementationAddress = await orphiImplementation.getAddress();
        
        console.log(`   ✅ Implementation deployed at: ${implementationAddress}`);

        // Deploy proxy and initialize in one transaction
        console.log("🔗 Deploying proxy with initialization...");
        
        // Encode the initialize function call
        const initializeData = OrphiCrowdFund.interface.encodeFunctionData("initialize", []);
        
        // Deploy the proxy using our OrphiProxy wrapper
        const OrphiProxy = await ethers.getContractFactory("OrphiProxy");
        const proxy = await OrphiProxy.deploy(implementationAddress, initializeData, {
            gasLimit: 2000000n,
            gasPrice: feeData.gasPrice
        });

        console.log(`   Proxy Tx Hash: ${proxy.deploymentTransaction().hash}`);
        console.log("   ⏳ Waiting for proxy deployment and initialization...");

        await proxy.waitForDeployment();
        const contractAddress = await proxy.getAddress();

        // Get actual gas used from both transactions
        const implReceipt = await orphiImplementation.deploymentTransaction().wait();
        const proxyReceipt = await proxy.deploymentTransaction().wait();
        const totalGasUsed = implReceipt.gasUsed + proxyReceipt.gasUsed;
        const totalCost = totalGasUsed * feeData.gasPrice;

        // Create contract instance pointing to the proxy
        const orphiContract = OrphiCrowdFund.attach(contractAddress);
        
        console.log(`   ✅ Proxy deployed and initialized at: ${contractAddress}`);
        console.log(`   📋 Implementation at: ${implementationAddress}`);
        console.log(`   Gas Used: ${totalGasUsed.toString()}`);
        console.log(`   Total Cost: ${ethers.formatEther(totalCost)} BNB`);
        
        // Verify deployment
        console.log("\n🔍 Verifying deployment...");
        
        try {
            const owner = await orphiContract.owner();
            const version = await orphiContract.VERSION();
            
            console.log(`   Owner: ${owner}`);
            console.log(`   Version: ${version}`);
            
            // Set USDT token
            console.log("\n⚙️  Configuring USDT token...");
            const setUsdtTx = await orphiContract.setUSDTToken(config.usdtAddress);
            await setUsdtTx.wait();
            console.log(`   ✅ USDT token set to: ${config.usdtAddress}`);
            
            // Test package tier functionality
            console.log("\n📦 Validating Package Tiers (8-tier system):");
            const packageAmounts = await orphiContract.getPackageAmounts();
            console.log("   📈 Package Amounts:");
            for (let i = 0; i < packageAmounts.length; i++) {
                const amountUSD = ethers.formatUnits(packageAmounts[i], 6);
                console.log(`      Package ${i + 1}: $${amountUSD}`);
            }
            
        } catch (error) {
            console.log("   ⚠️  Some verification calls failed:", error.message);
        }
        
        // Save deployment info
        const deploymentInfo = {
            network: network.name,
            chainId: Number(network.chainId),
            contractName: "OrphiCrowdFundDeployable",
            contractAddress: contractAddress,
            implementationAddress: implementationAddress,
            deployerAddress: deployerAddress,
            usdtAddress: config.usdtAddress,
            implementationTxHash: orphiImplementation.deploymentTransaction().hash,
            proxyTxHash: proxy.deploymentTransaction().hash,
            implementationBlock: implReceipt.blockNumber,
            proxyBlock: proxyReceipt.blockNumber,
            timestamp: new Date().toISOString(),
            gasUsed: totalGasUsed.toString(),
            deploymentCost: ethers.formatEther(totalCost)
        };
        
        const deploymentFile = `deployment-deployable-${network.name}-${Date.now()}.json`;
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        
        console.log("\n📄 Deployment Summary:");
        console.log(`   Contract: OrphiCrowdFundDeployable`);
        console.log(`   Address: ${contractAddress}`);
        console.log(`   Network: ${network.name}`);
        console.log(`   Deployer: ${deployerAddress}`);
        console.log(`   Gas Used: ${totalGasUsed.toString()}`);
        console.log(`   Cost: ${ethers.formatEther(totalCost)} BNB`);
        console.log(`   Info saved to: ${deploymentFile}`);
        
        console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
        console.log(`🔗 BSC Testnet Explorer: https://testnet.bscscan.com/address/${contractAddress}`);
        
        console.log("\n📝 Next Steps:");
        console.log("   1. Verify contract on BSCScan");
        console.log("   2. Test user registration");
        console.log("   3. Test contribution functionality");
        console.log("   4. Plan upgrade to full version");
        
        return {
            contractAddress,
            deploymentInfo,
            contract: orphiContract
        };
        
    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED:");
        console.error(error);
        throw error;
    }
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

export default main;
