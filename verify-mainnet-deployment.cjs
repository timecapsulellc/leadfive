const { ethers } = require("hardhat");
require("dotenv").config();

/**
 * 🔍 MAINNET DEPLOYMENT VERIFICATION
 * 
 * Verifies that the OrphiCrowdFund contract is properly deployed and secured
 */

async function main() {
    console.log("🔍 VERIFYING MAINNET DEPLOYMENT...");
    console.log("═".repeat(60));
    
    const contractAddress = "0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732";
    const expectedAdmin = "0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229";
    const deployerAddress = "0x7fACc01378034AB1dEaEd266a7f07E05C141606c";
    const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
    
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`👑 Expected Admin: ${expectedAdmin}`);
    console.log(`🔧 Deployer: ${deployerAddress}`);
    console.log(`💵 USDT Address: ${usdtAddress}`);
    
    // Connect to contract
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
    const contract = OrphiCrowdFund.attach(contractAddress);
    
    console.log("\n🔍 VERIFYING CONTRACT CONFIGURATION...");
    
    try {
        // Check USDT token address
        const contractUSDT = await contract.usdtToken();
        console.log(`💵 USDT Token: ${contractUSDT}`);
        console.log(`✅ USDT Match: ${contractUSDT.toLowerCase() === usdtAddress.toLowerCase()}`);
        
        // Check hardcoded admin wallet
        const trezorAdmin = await contract.TREZOR_ADMIN_WALLET();
        console.log(`🔐 Hardcoded Admin: ${trezorAdmin}`);
        console.log(`✅ Admin Match: ${trezorAdmin.toLowerCase() === expectedAdmin.toLowerCase()}`);
        
        // Check roles
        const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
        const TREASURY_ROLE = await contract.TREASURY_ROLE();
        const EMERGENCY_ROLE = await contract.EMERGENCY_ROLE();
        const POOL_MANAGER_ROLE = await contract.POOL_MANAGER_ROLE();
        
        console.log("\n🔑 CHECKING ROLE ASSIGNMENTS...");
        
        const hasDefaultAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, expectedAdmin);
        const hasTreasuryRole = await contract.hasRole(TREASURY_ROLE, expectedAdmin);
        const hasEmergencyRole = await contract.hasRole(EMERGENCY_ROLE, expectedAdmin);
        const hasPoolManagerRole = await contract.hasRole(POOL_MANAGER_ROLE, expectedAdmin);
        
        console.log(`✅ Default Admin Role: ${hasDefaultAdmin}`);
        console.log(`✅ Treasury Role: ${hasTreasuryRole}`);
        console.log(`✅ Emergency Role: ${hasEmergencyRole}`);
        console.log(`✅ Pool Manager Role: ${hasPoolManagerRole}`);
        
        // Check if deployer still has any admin rights (should be false for security)
        const deployerHasDefaultAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress);
        const deployerHasTreasury = await contract.hasRole(TREASURY_ROLE, deployerAddress);
        const deployerHasEmergency = await contract.hasRole(EMERGENCY_ROLE, deployerAddress);
        const deployerHasPoolManager = await contract.hasRole(POOL_MANAGER_ROLE, deployerAddress);
        
        console.log("\n🛡️ VERIFYING DEPLOYER PERMISSIONS (should all be false)...");
        console.log(`❌ Deployer Default Admin: ${deployerHasDefaultAdmin}`);
        console.log(`❌ Deployer Treasury: ${deployerHasTreasury}`);
        console.log(`❌ Deployer Emergency: ${deployerHasEmergency}`);
        console.log(`❌ Deployer Pool Manager: ${deployerHasPoolManager}`);
        
        // Check package amounts
        const packageAmounts = await contract.getPackageAmounts();
        console.log("\n📦 PACKAGE CONFIGURATION...");
        const expectedAmounts = [30000000, 50000000, 100000000, 200000000]; // 6 decimals
        
        for (let i = 0; i < packageAmounts.length; i++) {
            const amount = Number(packageAmounts[i]);
            const usdAmount = amount / 1000000;
            const isCorrect = amount === expectedAmounts[i];
            console.log(`   Package ${i + 1}: $${usdAmount} USDT ${isCorrect ? '✅' : '❌'}`);
        }
        
        // Check contract stats
        console.log("\n📊 CONTRACT STATISTICS...");
        const totalUsers = await contract.totalUsers();
        const totalVolume = await contract.totalVolume();
        console.log(`👥 Total Users: ${totalUsers}`);
        console.log(`💰 Total Volume: ${ethers.formatUnits(totalVolume, 6)} USDT`);
        
        // Check contract version
        const version = await contract.version();
        console.log(`📋 Version: ${version}`);
        
        // Security summary
        console.log("\n" + "═".repeat(60));
        console.log("🎯 SECURITY VERIFICATION SUMMARY");
        console.log("═".repeat(60));
        
        const allRolesCorrect = hasDefaultAdmin && hasTreasuryRole && hasEmergencyRole && hasPoolManagerRole;
        const deployerRevokedCompletely = !deployerHasDefaultAdmin && !deployerHasTreasury && !deployerHasEmergency && !deployerHasPoolManager;
        const configCorrect = contractUSDT.toLowerCase() === usdtAddress.toLowerCase() && 
                             trezorAdmin.toLowerCase() === expectedAdmin.toLowerCase();
        
        console.log(`✅ All Admin Roles Assigned to MetaMask: ${allRolesCorrect}`);
        console.log(`✅ Deployer Access Completely Revoked: ${deployerRevokedCompletely}`);
        console.log(`✅ Configuration Correct: ${configCorrect}`);
        
        if (allRolesCorrect && deployerRevokedCompletely && configCorrect) {
            console.log("\n🎉 DEPLOYMENT SUCCESSFULLY VERIFIED!");
            console.log("🔒 Contract is fully secured with MetaMask admin control");
            console.log("🚀 Ready for production use!");
        } else {
            console.log("\n⚠️  SECURITY ISSUES DETECTED!");
            console.log("🔧 Manual intervention may be required");
        }
        
        console.log("\n🔗 BSCScan Links:");
        console.log(`📄 Contract: https://bscscan.com/address/${contractAddress}`);
        console.log(`🔍 Implementation: https://bscscan.com/address/0x4CE48E3565E85cF74794C245463878672627fc1D`);
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
        
        // Try basic checks
        console.log("\n🔄 Attempting basic contract validation...");
        
        try {
            const code = await ethers.provider.getCode(contractAddress);
            if (code === "0x") {
                console.log("❌ No contract code found at address!");
            } else {
                console.log("✅ Contract code exists");
                console.log(`📏 Bytecode length: ${code.length} characters`);
            }
        } catch (basicError) {
            console.error("❌ Basic validation failed:", basicError.message);
        }
    }
}

// Execute verification
if (require.main === module) {
    main()
        .then(() => {
            console.log("\n✅ Verification completed!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n❌ Verification failed:", error.message);
            process.exit(1);
        });
}

module.exports = main;
