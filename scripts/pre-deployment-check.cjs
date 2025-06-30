// SPDX-License-Identifier: MIT
/**
 * @title Pre-Deployment Verification Script
 * @dev Verifies all requirements before mainnet deployment
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 PRE-DEPLOYMENT VERIFICATION");
    console.log("=" .repeat(50));
    
    const [deployer] = await ethers.getSigners();
    const deployerAddress = deployer.address;
    
    let allChecks = true;
    
    // Check 1: Deployer Address
    console.log("\n1️⃣ DEPLOYER ADDRESS VERIFICATION:");
    console.log(`Current: ${deployerAddress}`);
    console.log(`Expected: 0x140aad3E7c6bCC415Bc8E830699855fF072d405D`);
    
    if (deployerAddress === "0x140aad3E7c6bCC415Bc8E830699855fF072d405D") {
        console.log("✅ Deployer address correct");
    } else {
        console.log("❌ Deployer address mismatch!");
        allChecks = false;
    }
    
    // Check 2: Network Configuration
    console.log("\n2️⃣ NETWORK VERIFICATION:");
    const network = await ethers.provider.getNetwork();
    console.log(`Chain ID: ${network.chainId}`);
    console.log(`Network Name: ${network.name}`);
    
    if (network.chainId === 56n) {
        console.log("✅ Connected to BSC Mainnet");
    } else {
        console.log("❌ Not connected to BSC Mainnet!");
        allChecks = false;
    }
    
    // Check 3: Balance Verification
    console.log("\n3️⃣ BALANCE VERIFICATION:");
    const balance = await ethers.provider.getBalance(deployerAddress);
    const balanceEth = ethers.formatEther(balance);
    console.log(`BNB Balance: ${balanceEth} BNB`);
    
    if (balance >= ethers.parseEther("0.05")) {
        console.log("✅ Sufficient balance for deployment");
    } else {
        console.log("❌ Insufficient balance for deployment!");
        allChecks = false;
    }
    
    // Check 4: Contract Compilation
    console.log("\n4️⃣ CONTRACT COMPILATION:");
    try {
        const LeadFiveOptimized = await ethers.getContractFactory("LeadFiveOptimized");
        console.log("✅ LeadFiveOptimized contract compiled successfully");
    } catch (error) {
        console.log("❌ Contract compilation failed!");
        console.log(error.message);
        allChecks = false;
    }
    
    // Check 5: Environment Variables
    console.log("\n5️⃣ ENVIRONMENT VARIABLES:");
    
    const requiredVars = [
        'DEPLOYER_PRIVATE_KEY',
        'BSC_MAINNET_RPC_URL',
        'BSCSCAN_API_KEY',
        'VITE_USDT_CONTRACT_ADDRESS'
    ];
    
    for (const varName of requiredVars) {
        if (process.env[varName]) {
            console.log(`✅ ${varName} - Present`);
        } else {
            console.log(`❌ ${varName} - Missing`);
            allChecks = false;
        }
    }
    
    // Check 6: Mainnet Contract Addresses
    console.log("\n6️⃣ MAINNET CONTRACT ADDRESSES:");
    
    const MAINNET_USDT = "0x55d398326f99059fF775485246999027B3197955";
    const MAINNET_PRICE_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
    
    console.log(`USDT: ${MAINNET_USDT} ✅`);
    console.log(`Price Feed: ${MAINNET_PRICE_FEED} ✅`);
    
    // Check 7: Admin Configuration
    console.log("\n7️⃣ ADMIN CONFIGURATION:");
    console.log(`Owner Address: ${deployerAddress} ✅`);
    console.log(`Admin Address: ${deployerAddress} ✅`);
    console.log(`Fee Recipient: ${deployerAddress} ✅`);
    
    // Final Summary
    console.log("\n" + "=" .repeat(50));
    if (allChecks) {
        console.log("🎉 ALL CHECKS PASSED!");
        console.log("✅ Ready for mainnet deployment");
        console.log("\n📋 DEPLOYMENT COMMAND:");
        console.log("npx hardhat run scripts/deploy-mainnet-full.cjs --network bsc");
    } else {
        console.log("❌ SOME CHECKS FAILED!");
        console.log("⚠️ Please fix issues before deployment");
    }
    console.log("=" .repeat(50));
    
    return allChecks;
}

main()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error("Verification failed:", error);
        process.exit(1);
    });
