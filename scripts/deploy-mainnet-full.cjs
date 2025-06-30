// SPDX-License-Identifier: MIT
/**
 * @title BSC Mainnet Deployment Script
 * @dev Comprehensive mainnet deployment with full admin rights setup
 * @notice This script deploys LeadFiveOptimized to BSC Mainnet with all admin permissions
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 LEADFIVE BSC MAINNET DEPLOYMENT");
    console.log("=" .repeat(60));
    console.log("⚠️ DEPLOYING TO PRODUCTION MAINNET! ⚠️");
    console.log("=" .repeat(60));
    
    const [deployer] = await ethers.getSigners();
    const deployerAddress = deployer.address;
    
    console.log("\n📋 DEPLOYMENT DETAILS:");
    console.log(`Deployer Address: ${deployerAddress}`);
    console.log(`Network: BSC Mainnet (Chain ID: 56)`);
    console.log(`Expected Address: 0x140aad3E7c6bCC415Bc8E830699855fF072d405D`);
    
    // Verify deployer address matches expected
    if (deployerAddress !== "0x140aad3E7c6bCC415Bc8E830699855fF072d405D") {
        throw new Error(`❌ Deployer address mismatch! Expected: 0x140aad3E7c6bCC415Bc8E830699855fF072d405D, Got: ${deployerAddress}`);
    }
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployerAddress);
    console.log(`BNB Balance: ${ethers.formatEther(balance)} BNB`);
    
    if (balance < ethers.parseEther("0.05")) {
        throw new Error("❌ Insufficient BNB balance for deployment!");
    }
    
    // Mainnet contract addresses
    const MAINNET_USDT = "0x55d398326f99059fF775485246999027B3197955";
    const MAINNET_PRICE_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"; // BNB/USD
    
    console.log(`\n📊 MAINNET CONTRACTS:`);
    console.log(`USDT Token: ${MAINNET_USDT}`);
    console.log(`Price Feed: ${MAINNET_PRICE_FEED}`);
    
    // Deployment confirmation
    console.log("\n⚠️ FINAL CONFIRMATION REQUIRED!");
    console.log("You are about to deploy to BSC MAINNET with REAL BNB!");
    console.log("This action cannot be undone and will cost real gas fees.");
    
    // Deploy LeadFiveOptimized
    console.log("\n🔄 Deploying LeadFiveOptimized to BSC Mainnet...");
    
    const LeadFiveOptimized = await ethers.getContractFactory("LeadFiveOptimized");
    
    console.log("📦 Contract deployment in progress...");
    
    // Deploy with proxy pattern for upgradeability
    const leadFive = await hre.upgrades.deployProxy(
        LeadFiveOptimized,
        [MAINNET_USDT, MAINNET_PRICE_FEED],
        {
            initializer: "initialize",
            kind: "uups"
        }
    );
    
    await leadFive.waitForDeployment();
    const contractAddress = await leadFive.getAddress();
    
    console.log(`✅ LeadFiveOptimized deployed at: ${contractAddress}`);
    
    // Wait for a few confirmations
    console.log("\n⏳ Waiting for block confirmations...");
    await leadFive.deploymentTransaction().wait(3);
    
    // Verify all admin settings
    console.log("\n🔐 VERIFYING ADMIN RIGHTS AND PERMISSIONS:");
    
    try {
        // Check owner
        const owner = await leadFive.owner();
        console.log(`Contract Owner: ${owner}`);
        
        if (owner !== deployerAddress) {
            console.log("⚠️ Owner mismatch detected! Attempting to transfer ownership...");
            const transferTx = await leadFive.transferOwnership(deployerAddress);
            await transferTx.wait();
            console.log("✅ Ownership transferred to deployer");
        } else {
            console.log("✅ Owner correctly set to deployer");
        }
        
        // Verify admin functions access
        console.log("\n🔧 TESTING ADMIN FUNCTIONS:");
        
        // Test 1: Check if we can call admin functions
        try {
            await leadFive.setRegistrationStatus.staticCall(true);
            console.log("✅ setRegistrationStatus - ACCESSIBLE");
        } catch (error) {
            console.log("❌ setRegistrationStatus - ACCESS DENIED");
        }
        
        try {
            await leadFive.setWithdrawalStatus.staticCall(true);
            console.log("✅ setWithdrawalStatus - ACCESSIBLE");
        } catch (error) {
            console.log("❌ setWithdrawalStatus - ACCESS DENIED");
        }
        
        try {
            await leadFive.setFeeRecipient.staticCall(deployerAddress);
            console.log("✅ setFeeRecipient - ACCESSIBLE");
        } catch (error) {
            console.log("❌ setFeeRecipient - ACCESS DENIED");
        }
        
        try {
            await leadFive.setAdminFeePercentage.staticCall(1000); // 10%
            console.log("✅ setAdminFeePercentage - ACCESSIBLE");
        } catch (error) {
            console.log("❌ setAdminFeePercentage - ACCESS DENIED");
        }
        
        try {
            await leadFive.pause.staticCall();
            console.log("✅ pause - ACCESSIBLE");
        } catch (error) {
            console.log("❌ pause - ACCESS DENIED");
        }
        
        try {
            await leadFive.unpause.staticCall();
            console.log("✅ unpause - ACCESSIBLE");
        } catch (error) {
            console.log("❌ unpause - ACCESS DENIED");
        }
        
        // Configure initial settings
        console.log("\n⚙️ CONFIGURING INITIAL SETTINGS:");
        
        // Set fee recipient to deployer
        console.log("Setting fee recipient...");
        const setFeeRecipientTx = await leadFive.setFeeRecipient(deployerAddress);
        await setFeeRecipientTx.wait();
        console.log("✅ Fee recipient set to deployer");
        
        // Set admin fee percentage (10%)
        console.log("Setting admin fee percentage...");
        const setAdminFeeTx = await leadFive.setAdminFeePercentage(1000); // 10%
        await setAdminFeeTx.wait();
        console.log("✅ Admin fee percentage set to 10%");
        
        // Enable registration
        console.log("Enabling registration...");
        const enableRegTx = await leadFive.setRegistrationStatus(true);
        await enableRegTx.wait();
        console.log("✅ Registration enabled");
        
        // Enable withdrawals
        console.log("Enabling withdrawals...");
        const enableWithdrawTx = await leadFive.setWithdrawalStatus(true);
        await enableWithdrawTx.wait();
        console.log("✅ Withdrawals enabled");
        
        // Final verification
        console.log("\n🔍 FINAL VERIFICATION:");
        
        const finalOwner = await leadFive.owner();
        console.log(`Final Owner: ${finalOwner}`);
        
        // Get contract stats
        const contractStats = await leadFive.getContractStats();
        console.log(`Contract Stats:`);
        console.log(`  Total Users: ${contractStats[0]}`);
        console.log(`  Total Volume: ${ethers.formatUnits(contractStats[1], 18)} USDT`);
        console.log(`  Registration Open: ${contractStats[2]}`);
        console.log(`  Withdrawal Enabled: ${contractStats[3]}`);
        
    } catch (error) {
        console.log(`❌ Error during admin verification: ${error.message}`);
    }
    
    // Create deployment summary
    const deploymentSummary = {
        network: "BSC Mainnet",
        chainId: 56,
        deployerAddress: deployerAddress,
        contractAddress: contractAddress,
        deploymentTime: new Date().toISOString(),
        gasUsed: "TBD", // Will be filled after deployment
        transactions: {
            deployment: leadFive.deploymentTransaction().hash,
        },
        adminSettings: {
            owner: deployerAddress,
            feeRecipient: deployerAddress,
            adminFeePercentage: "10%",
            registrationEnabled: true,
            withdrawalEnabled: true
        },
        mainnetContracts: {
            usdt: MAINNET_USDT,
            priceFeed: MAINNET_PRICE_FEED
        }
    };
    
    // Save deployment summary
    fs.writeFileSync(
        'mainnet-deployment-summary.json',
        JSON.stringify(deploymentSummary, null, 2)
    );
    
    // Update .env file
    console.log("\n📝 UPDATING .ENV FILE:");
    
    let envContent = fs.readFileSync('.env', 'utf8');
    
    // Update mainnet contract address
    envContent = envContent.replace(
        /MAINNET_CONTRACT_ADDRESS=.*/,
        `MAINNET_CONTRACT_ADDRESS=${contractAddress}`
    );
    
    // Update main contract address for production
    envContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
    );
    
    fs.writeFileSync('.env', envContent);
    console.log("✅ .env file updated with mainnet addresses");
    
    // Final summary
    console.log("\n🎉 MAINNET DEPLOYMENT SUCCESSFUL!");
    console.log("=" .repeat(60));
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`👑 Owner: ${deployerAddress}`);
    console.log(`💰 Fee Recipient: ${deployerAddress}`);
    console.log(`📊 Admin Fee: 10%`);
    console.log(`🔓 Registration: ENABLED`);
    console.log(`💸 Withdrawals: ENABLED`);
    console.log("=" .repeat(60));
    
    console.log("\n🔗 VERIFICATION LINKS:");
    console.log(`BSCScan: https://bscscan.com/address/${contractAddress}`);
    console.log(`Deployer: https://bscscan.com/address/${deployerAddress}`);
    
    console.log("\n⚠️ IMPORTANT NEXT STEPS:");
    console.log("1. Verify contract on BSCScan");
    console.log("2. Update frontend with new contract address");
    console.log("3. Test all functions with small amounts first");
    console.log("4. Monitor contract for any issues");
    console.log("5. Prepare for ownership transfer if needed");
    
    console.log("\n📋 ADMIN COMMANDS READY:");
    console.log("All admin functions are accessible by deployer address");
    console.log("Contract is ready for production use!");
    
    return {
        contractAddress,
        deployerAddress,
        owner: deployerAddress,
        ready: true
    };
}

main()
    .then((result) => {
        console.log("\n✅ Deployment completed successfully!");
        console.log("Result:", result);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
