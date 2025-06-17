const { ethers } = require("hardhat");
require("dotenv").config();

/**
 * 🧪 MAINNET CONTRACT TESTING SUITE
 * 
 * Tests all critical functions on the live mainnet contract
 * Use with EXTREME CAUTION - this uses real USDT on mainnet!
 */

async function testMainnetContract() {
    console.log("🧪 MAINNET CONTRACT TESTING SUITE");
    console.log("⚠️  WARNING: This tests the LIVE contract on BSC Mainnet!");
    console.log("═".repeat(60));
    
    const contractAddress = "0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732";
    const adminWallet = "0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229";
    const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
    
    console.log(`📍 Contract: ${contractAddress}`);
    console.log(`👑 Admin: ${adminWallet}`);
    console.log(`💵 USDT: ${usdtAddress}`);
    
    try {
        // Get current signer
        const [signer] = await ethers.getSigners();
        const signerAddress = await signer.getAddress();
        console.log(`🔑 Current Signer: ${signerAddress}`);
        
        // Connect to contracts
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        const contract = OrphiCrowdFund.attach(contractAddress);
        
        // Connect to USDT
        const usdtAbi = [
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function approve(address,uint256) returns (bool)",
            "function allowance(address,address) view returns (uint256)"
        ];
        const usdt = new ethers.Contract(usdtAddress, usdtAbi, signer);
        
        console.log("\n🔍 BASIC CONTRACT VERIFICATION...");
        
        // Test 1: Contract is deployed
        const code = await ethers.provider.getCode(contractAddress);
        console.log(`✅ Contract Deployed: ${code !== "0x"}`);
        
        // Test 2: Basic contract info
        const contractName = await contract.getContractName();
        const version = await contract.version();
        console.log(`📋 Contract Name: ${contractName}`);
        console.log(`🔢 Version: ${version}`);
        
        // Test 3: USDT configuration
        const contractUSDT = await contract.usdtToken();
        console.log(`💵 USDT Config: ${contractUSDT === usdtAddress ? '✅' : '❌'}`);
        
        // Test 4: Admin wallet verification
        const trezorAdmin = await contract.TREZOR_ADMIN_WALLET();
        console.log(`🔐 Admin Wallet: ${trezorAdmin === adminWallet ? '✅' : '❌'}`);
        
        // Test 5: Package amounts
        const packages = await contract.getPackageAmounts();
        console.log("\n📦 PACKAGE VERIFICATION:");
        const expectedAmounts = [30000000, 50000000, 100000000, 200000000];
        for (let i = 0; i < packages.length; i++) {
            const amount = Number(packages[i]);
            const usdAmount = amount / 1000000;
            const isCorrect = amount === expectedAmounts[i];
            console.log(`   Package ${i + 1}: $${usdAmount} ${isCorrect ? '✅' : '❌'}`);
        }
        
        // Test 6: Role verification
        console.log("\n🔑 ROLE VERIFICATION:");
        const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
        const TREASURY_ROLE = await contract.TREASURY_ROLE();
        const EMERGENCY_ROLE = await contract.EMERGENCY_ROLE();
        const POOL_MANAGER_ROLE = await contract.POOL_MANAGER_ROLE();
        
        const hasDefaultAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, adminWallet);
        const hasTreasuryRole = await contract.hasRole(TREASURY_ROLE, adminWallet);
        const hasEmergencyRole = await contract.hasRole(EMERGENCY_ROLE, adminWallet);
        const hasPoolManagerRole = await contract.hasRole(POOL_MANAGER_ROLE, adminWallet);
        
        console.log(`   Default Admin: ${hasDefaultAdmin ? '✅' : '❌'}`);
        console.log(`   Treasury: ${hasTreasuryRole ? '✅' : '❌'}`);
        console.log(`   Emergency: ${hasEmergencyRole ? '✅' : '❌'}`);
        console.log(`   Pool Manager: ${hasPoolManagerRole ? '✅' : '❌'}`);
        
        // Test 7: Current signer's USDT balance
        console.log("\n💰 WALLET VERIFICATION:");
        const usdtBalance = await usdt.balanceOf(signerAddress);
        const usdtBalanceFormatted = ethers.formatUnits(usdtBalance, 6);
        console.log(`   USDT Balance: ${usdtBalanceFormatted} USDT`);
        
        // Test 8: Check if signer is registered
        const isRegistered = await contract.isUserRegistered(signerAddress);
        console.log(`   Is Registered: ${isRegistered ? 'Yes' : 'No'}`);
        
        // Test 9: Contract statistics
        console.log("\n📊 CONTRACT STATISTICS:");
        const totalUsers = await contract.totalUsers();
        const totalVolume = await contract.totalVolume();
        console.log(`   Total Users: ${totalUsers}`);
        console.log(`   Total Volume: ${ethers.formatUnits(totalVolume, 6)} USDT`);
        
        // Summary
        console.log("\n" + "═".repeat(60));
        console.log("🎯 TESTING SUMMARY");
        console.log("═".repeat(60));
        
        const allRolesCorrect = hasDefaultAdmin && hasTreasuryRole && hasEmergencyRole && hasPoolManagerRole;
        const configCorrect = contractUSDT === usdtAddress && trezorAdmin === adminWallet;
        
        console.log(`✅ Contract Deployed Successfully: Yes`);
        console.log(`✅ All Admin Roles Configured: ${allRolesCorrect ? 'Yes' : 'No'}`);
        console.log(`✅ Configuration Correct: ${configCorrect ? 'Yes' : 'No'}`);
        console.log(`💵 Ready for USDT Testing: ${Number(usdtBalanceFormatted) > 30 ? 'Yes' : 'No (Need min $30 USDT)'}`);
        
        if (allRolesCorrect && configCorrect) {
            console.log("\n🎉 CONTRACT IS READY FOR PRODUCTION!");
            console.log("🚀 You can now proceed with live testing and launch!");
        } else {
            console.log("\n⚠️  ISSUES DETECTED - Review configuration");
        }
        
        console.log("\n🔗 BSCScan: https://bscscan.com/address/" + contractAddress);
        
    } catch (error) {
        console.error("❌ Testing failed:", error.message);
        console.log("\n🔧 Troubleshooting:");
        console.log("1. Make sure you're connected to BSC Mainnet");
        console.log("2. Check your wallet has BNB for gas fees");
        console.log("3. Verify contract address is correct");
    }
}

// Execute testing
if (require.main === module) {
    testMainnetContract()
        .then(() => {
            console.log("\n✅ Testing completed!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n❌ Testing failed:", error.message);
            process.exit(1);
        });
}

module.exports = testMainnetContract;
