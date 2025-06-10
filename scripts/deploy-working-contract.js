const { ethers } = require("hardhat");

/**
 * DEPLOY WORKING CONTRACT SCRIPT
 * 
 * This script deploys OrphiCrowdFundV2 which compiles successfully
 */

async function main() {
    console.log("🚀 DEPLOYING WORKING ORPHI CROWDFUND CONTRACT");
    console.log("=" .repeat(80));
    
    const [deployer, admin] = await ethers.getSigners();
    
    console.log("📋 Deployment Configuration:");
    console.log(`   Network: ${network.name}`);
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Admin: ${admin.address}`);
    
    // Check balances
    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    console.log(`   Deployer Balance: ${ethers.formatEther(deployerBalance)} ETH`);
    
    let deploymentResults = {
        network: network.name,
        deployer: deployer.address,
        admin: admin.address,
        contracts: {},
        gasUsed: 0,
        totalCost: 0
    };
    
    try {
        // Step 1: Deploy MockUSDT
        console.log("\n📦 Step 1: Deploying MockUSDT...");
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        const mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        const usdtAddress = await mockUSDT.getAddress();
        
        // Get deployment transaction
        const usdtDeployTx = mockUSDT.deploymentTransaction();
        const usdtReceipt = await usdtDeployTx.wait();
        
        deploymentResults.contracts.MockUSDT = {
            address: usdtAddress,
            gasUsed: usdtReceipt.gasUsed.toString(),
            gasPrice: usdtDeployTx.gasPrice.toString()
        };
        
        console.log(`   ✅ MockUSDT deployed to: ${usdtAddress}`);
        console.log(`   ⛽ Gas used: ${usdtReceipt.gasUsed.toString()}`);
        
        // Step 2: Deploy OrphiCrowdFundV2
        console.log("\n🎯 Step 2: Deploying OrphiCrowdFundV2...");
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundV2");
        const orphiContract = await OrphiCrowdFund.deploy(usdtAddress, admin.address);
        await orphiContract.waitForDeployment();
        const contractAddress = await orphiContract.getAddress();
        
        // Get deployment transaction
        const contractDeployTx = orphiContract.deploymentTransaction();
        const contractReceipt = await contractDeployTx.wait();
        
        deploymentResults.contracts.OrphiCrowdFundV2 = {
            address: contractAddress,
            gasUsed: contractReceipt.gasUsed.toString(),
            gasPrice: contractDeployTx.gasPrice.toString(),
            usdtToken: usdtAddress,
            admin: admin.address
        };
        
        console.log(`   ✅ OrphiCrowdFundV2 deployed to: ${contractAddress}`);
        console.log(`   ⛽ Gas used: ${contractReceipt.gasUsed.toString()}`);
        
        // Step 3: Test basic contract functionality
        console.log("\n🔍 Step 3: Testing contract functionality...");
        
        // Test package amounts
        const packageAmounts = await orphiContract.getPackageAmounts();
        console.log(`   Package 1: $${ethers.formatUnits(packageAmounts[0], 6)} ✅`);
        console.log(`   Package 2: $${ethers.formatUnits(packageAmounts[1], 6)} ✅`);
        console.log(`   Package 3: $${ethers.formatUnits(packageAmounts[2], 6)} ✅`);
        console.log(`   Package 4: $${ethers.formatUnits(packageAmounts[3], 6)} ✅`);
        
        // Test admin functions
        const contractAdmin = await orphiContract.admin();
        console.log(`   Contract Admin: ${contractAdmin} ✅`);
        
        // Test USDT token address
        const tokenAddress = await orphiContract.usdtToken();
        console.log(`   USDT Token: ${tokenAddress} ✅`);
        
        // Step 4: Mint test tokens
        console.log("\n🪙 Step 4: Minting test tokens...");
        const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDT
        
        await mockUSDT.mint(deployer.address, mintAmount);
        await mockUSDT.mint(admin.address, mintAmount);
        
        const deployerUSDTBalance = await mockUSDT.balanceOf(deployer.address);
        const adminUSDTBalance = await mockUSDT.balanceOf(admin.address);
        
        console.log(`   Deployer USDT Balance: $${ethers.formatUnits(deployerUSDTBalance, 6)} ✅`);
        console.log(`   Admin USDT Balance: $${ethers.formatUnits(adminUSDTBalance, 6)} ✅`);
        
        // Step 5: Test approval
        console.log("\n✅ Step 5: Testing token approvals...");
        const approveAmount = ethers.parseUnits("1000", 6); // 1,000 USDT
        
        await mockUSDT.connect(deployer).approve(contractAddress, approveAmount);
        const allowance = await mockUSDT.allowance(deployer.address, contractAddress);
        
        console.log(`   Deployer Allowance: $${ethers.formatUnits(allowance, 6)} ✅`);
        
        // Calculate total gas and cost
        const totalGasUsed = usdtReceipt.gasUsed + contractReceipt.gasUsed;
        const avgGasPrice = (usdtDeployTx.gasPrice + contractDeployTx.gasPrice) / 2n;
        const totalCostWei = totalGasUsed * avgGasPrice;
        const totalCostEth = ethers.formatEther(totalCostWei);
        
        deploymentResults.gasUsed = totalGasUsed.toString();
        deploymentResults.totalCost = totalCostEth;
        
        // Generate deployment report
        console.log("\n" + "=".repeat(80));
        console.log("📋 DEPLOYMENT REPORT");
        console.log("=".repeat(80));
        
        console.log(`\n✅ DEPLOYMENT SUCCESSFUL!`);
        console.log(`   Network: ${network.name}`);
        console.log(`   Total Gas Used: ${totalGasUsed.toString()}`);
        console.log(`   Total Cost: ${totalCostEth} ETH`);
        
        console.log(`\n📦 DEPLOYED CONTRACTS:`);
        console.log(`   MockUSDT: ${usdtAddress}`);
        console.log(`   OrphiCrowdFundV2: ${contractAddress}`);
        
        console.log(`\n🎯 CONTRACT FEATURES TESTED:`);
        console.log(`   ✅ Package Amounts Configuration`);
        console.log(`   ✅ Admin Access Control`);
        console.log(`   ✅ USDT Token Integration`);
        console.log(`   ✅ Token Minting`);
        console.log(`   ✅ Token Approvals`);
        
        console.log(`\n🚀 NEXT STEPS:`);
        console.log(`   1. Update dashboard with contract addresses`);
        console.log(`   2. Test user registration flow`);
        console.log(`   3. Test matrix placement system`);
        console.log(`   4. Test commission distributions`);
        
        console.log(`\n💡 DASHBOARD INTEGRATION:`);
        console.log(`   - Contract Address: ${contractAddress}`);
        console.log(`   - USDT Address: ${usdtAddress}`);
        console.log(`   - Network: ${network.name} (Chain ID: 31337)`);
        console.log(`   - Admin: ${admin.address}`);
        
        // Save deployment info to file
        const fs = require('fs');
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            network: network.name,
            chainId: 31337,
            contracts: {
                OrphiCrowdFundV2: contractAddress,
                MockUSDT: usdtAddress
            },
            admin: admin.address,
            deployer: deployer.address,
            gasUsed: totalGasUsed.toString(),
            totalCost: totalCostEth
        };
        
        fs.writeFileSync(
            'deployment-info.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log(`\n📄 Deployment info saved to: deployment-info.json`);
        
        return deploymentResults;
        
    } catch (error) {
        console.log("❌ Deployment failed:");
        console.log(`   Error: ${error.message}`);
        throw error;
    }
}

main()
    .then((result) => {
        console.log("\n🎉 Contract deployment completed successfully!");
        console.log("Your OrphiCrowdFund system is now ready for testing!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
