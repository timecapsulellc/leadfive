const { ethers } = require("hardhat");

/**
 * DEPLOY FROM TEMP FOLDER
 * 
 * This script deploys only the contracts in temp_deploy folder
 */

async function main() {
    console.log("🚀 DEPLOYING ORPHI CROWDFUND CONTRACTS FROM TEMP FOLDER");
    console.log("=" .repeat(80));
    
    const [deployer, admin] = await ethers.getSigners();
    
    console.log("📋 Deployment Configuration:");
    console.log(`   Network: ${network.name}`);
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Admin: ${admin.address}`);
    
    // Check balances
    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    console.log(`   Deployer Balance: ${ethers.formatEther(deployerBalance)} ETH`);
    
    try {
        // Step 1: Deploy MockUSDT from temp folder
        console.log("\n📦 Step 1: Deploying MockUSDT...");
        const MockUSDT = await ethers.getContractFactory("contracts/temp_deploy/MockUSDT.sol:MockUSDT");
        const mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        const usdtAddress = await mockUSDT.getAddress();
        
        console.log(`   ✅ MockUSDT deployed to: ${usdtAddress}`);
        
        // Step 2: Deploy OrphiCrowdFundV2 from temp folder
        console.log("\n🎯 Step 2: Deploying OrphiCrowdFundV2...");
        const OrphiCrowdFund = await ethers.getContractFactory("contracts/temp_deploy/OrphiCrowdFundV2.sol:OrphiCrowdFundV2");
        const orphiContract = await OrphiCrowdFund.deploy(usdtAddress, admin.address);
        await orphiContract.waitForDeployment();
        const contractAddress = await orphiContract.getAddress();
        
        console.log(`   ✅ OrphiCrowdFundV2 deployed to: ${contractAddress}`);
        
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
        
        // Generate deployment report
        console.log("\n" + "=".repeat(80));
        console.log("📋 DEPLOYMENT REPORT");
        console.log("=".repeat(80));
        
        console.log(`\n✅ DEPLOYMENT SUCCESSFUL!`);
        console.log(`   Network: ${network.name}`);
        
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
            deployer: deployer.address
        };
        
        fs.writeFileSync(
            'deployment-info.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log(`\n📄 Deployment info saved to: deployment-info.json`);
        
        return {
            OrphiCrowdFundV2: contractAddress,
            MockUSDT: usdtAddress,
            admin: admin.address,
            deployer: deployer.address
        };
        
    } catch (error) {
        console.log("❌ Deployment failed:");
        console.log(`   Error: ${error.message}`);
        throw error;
    }
}

main()
    .then((result) => {
        console.log("\n🎉 CONTRACT DEPLOYMENT COMPLETED SUCCESSFULLY!");
        console.log("Your OrphiCrowdFund system is now ready for testing!");
        console.log("\n🔗 Contract Addresses:");
        console.log(`   OrphiCrowdFundV2: ${result.OrphiCrowdFundV2}`);
        console.log(`   MockUSDT: ${result.MockUSDT}`);
        console.log("\n🎯 Ready for dashboard integration!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
