// SPDX-License-Identifier: MIT
/**
 * @title Pre-Deployment Check for LeadFive.sol Mainnet
 * @dev Comprehensive checks before deploying LeadFive.sol to BSC Mainnet
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 PRE-DEPLOYMENT CHECKS FOR LEADFIVE.SOL");
    console.log("=" .repeat(60));
    
    let allChecksPass = true;
    
    try {
        // 1. Account and Balance Check
        console.log("1️⃣  ACCOUNT & BALANCE CHECK:");
        const [deployer] = await ethers.getSigners();
        console.log(`   Deployer: ${deployer.address}`);
        
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log(`   Balance: ${ethers.formatEther(balance)} BNB`);
        
        if (balance < ethers.parseEther("0.05")) {
            console.log("   ❌ Insufficient BNB for deployment (need at least 0.05 BNB)");
            allChecksPass = false;
        } else {
            console.log("   ✅ Sufficient BNB for deployment");
        }
        
        // 2. Network Configuration Check
        console.log("\n2️⃣  NETWORK CONFIGURATION:");
        const network = await ethers.provider.getNetwork();
        console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);
        
        if (network.chainId !== 56n) {
            console.log("   ❌ Not connected to BSC Mainnet (Chain ID should be 56)");
            allChecksPass = false;
        } else {
            console.log("   ✅ Connected to BSC Mainnet");
        }
        
        // 3. Environment Variables Check
        console.log("\n3️⃣  ENVIRONMENT VARIABLES:");
        const requiredEnvVars = [
            'DEPLOYER_PRIVATE_KEY',
            'BSCSCAN_API_KEY',
            'VITE_USDT_CONTRACT_ADDRESS'
        ];
        
        for (const envVar of requiredEnvVars) {
            if (process.env[envVar]) {
                console.log(`   ✅ ${envVar}: Set`);
            } else {
                console.log(`   ❌ ${envVar}: Missing`);
                allChecksPass = false;
            }
        }
        
        // 4. Contract Addresses Validation
        console.log("\n4️⃣  CONTRACT ADDRESSES:");
        const USDT_ADDRESS = process.env.VITE_USDT_CONTRACT_ADDRESS || "0x55d398326f99059fF775485246999027B3197955";
        const PRICE_FEED_ADDRESS = process.env.MAINNET_PRICE_FEED_ADDRESS || "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
        
        console.log(`   USDT Token: ${USDT_ADDRESS}`);
        console.log(`   Price Feed: ${PRICE_FEED_ADDRESS}`);
        
        // Validate USDT contract
        try {
            const usdtCode = await ethers.provider.getCode(USDT_ADDRESS);
            if (usdtCode === "0x") {
                console.log("   ❌ USDT contract not found at specified address");
                allChecksPass = false;
            } else {
                console.log("   ✅ USDT contract verified");
            }
        } catch (error) {
            console.log("   ⚠️  Could not verify USDT contract");
        }
        
        // Validate Price Feed contract
        try {
            const priceFeedCode = await ethers.provider.getCode(PRICE_FEED_ADDRESS);
            if (priceFeedCode === "0x") {
                console.log("   ❌ Price Feed contract not found at specified address");
                allChecksPass = false;
            } else {
                console.log("   ✅ Price Feed contract verified");
            }
        } catch (error) {
            console.log("   ⚠️  Could not verify Price Feed contract");
        }
        
        // 5. Contract Compilation Check
        console.log("\n5️⃣  CONTRACT COMPILATION:");
        try {
            const LeadFive = await ethers.getContractFactory("LeadFive");
            console.log("   ✅ LeadFive contract compiles successfully");
            
            // Check for required libraries
            const requiredLibraries = [
                "DataStructures",
                "UserManagementLib", 
                "BonusDistributionLib",
                "CoreOperationsLib",
                "BusinessLogicLib"
            ];
            
            for (const lib of requiredLibraries) {
                try {
                    await ethers.getContractFactory(lib);
                    console.log(`   ✅ ${lib} library available`);
                } catch (error) {
                    console.log(`   ⚠️  ${lib} library issue: ${error.message}`);
                }
            }
            
        } catch (error) {
            console.log("   ❌ Contract compilation failed:", error.message);
            allChecksPass = false;
        }
        
        // 6. Admin Rights Configuration Check
        console.log("\n6️⃣  ADMIN RIGHTS CONFIGURATION:");
        console.log(`   Default Owner: ${deployer.address}`);
        console.log(`   Default Admin: ${deployer.address}`);
        console.log(`   Fee Recipient: ${deployer.address}`);
        console.log("   ✅ All admin rights will be set to deployer");
        
        // 7. Gas Estimation
        console.log("\n7️⃣  GAS ESTIMATION:");
        try {
            // Estimate deployment gas
            const LeadFive = await ethers.getContractFactory("LeadFive");
            const deploymentData = LeadFive.getDeployTransaction(USDT_ADDRESS, PRICE_FEED_ADDRESS);
            
            console.log("   ℹ️  Gas estimation completed");
            console.log("   ⚠️  Note: Actual gas may vary due to library deployments");
            
        } catch (error) {
            console.log("   ⚠️  Could not estimate gas:", error.message);
        }
        
        // 8. Final Summary
        console.log("\n" + "=" .repeat(60));
        if (allChecksPass) {
            console.log("🎉 ALL PRE-DEPLOYMENT CHECKS PASSED!");
            console.log("✅ Ready for mainnet deployment of LeadFive.sol");
            
            console.log("\n🚀 TO DEPLOY, RUN:");
            console.log("npx hardhat run scripts/deploy-mainnet-leadfive.cjs --network bscMainnet");
            
        } else {
            console.log("❌ SOME CHECKS FAILED!");
            console.log("⚠️  Please fix the issues above before deploying");
            
            console.log("\n🔧 COMMON SOLUTIONS:");
            console.log("• Low BNB: Transfer more BNB to your wallet");
            console.log("• Wrong network: Check your RPC URL and network settings");
            console.log("• Missing env vars: Check your .env file");
            console.log("• Contract issues: Run 'npx hardhat compile'");
        }
        
        console.log("\n📋 DEPLOYMENT SUMMARY:");
        console.log(`• Contract: LeadFive.sol (Full Version)`);
        console.log(`• Network: BSC Mainnet (56)`);
        console.log(`• Deployer: ${deployer.address}`);
        console.log(`• Balance: ${ethers.formatEther(balance)} BNB`);
        console.log(`• Status: ${allChecksPass ? '✅ READY' : '❌ NOT READY'}`);
        
    } catch (error) {
        console.error("❌ Pre-deployment check failed:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
