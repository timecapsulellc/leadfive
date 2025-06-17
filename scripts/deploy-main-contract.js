import hre from "hardhat";
import fs from 'fs';

const { ethers } = hre;

/**
 * DEPLOYMENT SCRIPT FOR MAIN ORPHI CROWDFUND CONTRACT
 * 
 * Deploys the OrphiCrowdFund contract (our recently refactored 8-tier version)
 * to BSC Testnet for testing and validation
 */

async function main() {
    console.log("🚀 DEPLOYING ORPHI CROWDFUND - 8-TIER VERSION");
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
        // BSC Testnet USDT address
        usdtAddress: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // BSC Testnet USDT
        
        // Admin addresses
        adminReserve: deployerAddress, // Use deployer as initial admin
        matrixRoot: deployerAddress,   // Use deployer as matrix root
    };
    
    console.log("\n📋 Deployment Configuration:");
    console.log(`   USDT Address: ${config.usdtAddress}`);
    console.log(`   Admin/Root: ${config.adminReserve}`);
    
    try {
        // Deploy OrphiCrowdFund
        console.log("\n🏗️  Deploying OrphiCrowdFund...");
        
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        
        // Estimate deployment gas
        console.log("⛽ Estimating deployment costs...");
        
        // Get current gas price
        const feeData = await ethers.provider.getFeeData();
        console.log(`   Gas Price: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei`);
         // Deploy implementation contract (UUPS upgradeable - no constructor args)
        console.log("🚀 Starting implementation deployment...");
        const orphiImplementation = await OrphiCrowdFund.deploy({
            gasLimit: 8000000n, // Generous gas limit for large contract
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
        
        // Deploy the proxy using OpenZeppelin's ERC1967Proxy
        const ERC1967Proxy = await ethers.getContractFactory("ERC1967Proxy");
        const proxy = await ERC1967Proxy.deploy(implementationAddress, initializeData, {
            gasLimit: 3000000n,
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
            const usdtToken = await orphiContract.usdtToken();
            const version = await orphiContract.VERSION();
            
            console.log(`   Owner: ${owner}`);
            console.log(`   USDT Token: ${usdtToken}`);
            console.log(`   Version: ${version}`);
            
            // Test package tier functionality (our 8-tier system)
            console.log("\n📦 Validating Package Tiers (8-tier system):");
            
            // Check if we can call package-related functions
            try {
                const packageAmounts = await orphiContract.getPackageAmounts();
                console.log("   📈 Package Amounts:");
                for (let i = 0; i < packageAmounts.length && i < 8; i++) {
                    const amountUSD = ethers.formatUnits(packageAmounts[i], 6);
                    console.log(`      Package ${i + 1}: $${amountUSD}`);
                }
            } catch (error) {
                console.log("   ⚠️  Package amounts not readable (might require initialization)");
            }
            
        } catch (error) {
            console.log("   ⚠️  Some verification calls failed (might be expected):", error.message);
        }
        
        // Save deployment info
        const deploymentInfo = {
            network: network.name,
            chainId: Number(network.chainId),
            contractName: "OrphiCrowdFund",
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
        
        const deploymentFile = `deployment-${network.name}-${Date.now()}.json`;
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        
        console.log("\n📄 Deployment Summary:");
        console.log(`   Contract: OrphiCrowdFund`);
        console.log(`   Address: ${contractAddress}`);
        console.log(`   Network: ${network.name}`);
        console.log(`   Deployer: ${deployerAddress}`);
        console.log(`   Gas Used: ${totalGasUsed.toString()}`);
        console.log(`   Cost: ${ethers.formatEther(totalCost)} BNB`);
        console.log(`   Info saved to: ${deploymentFile}`);
        
        console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
        console.log("\n📝 Next Steps:");
        console.log("   1. Verify contract on BSCScan");
        console.log("   2. Initialize admin roles");
        console.log("   3. Test basic functionality");
        console.log("   4. Register test users");
        
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
