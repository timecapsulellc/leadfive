const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🔍 CHECKING USDT SETUP AND TESTING REGISTRATION");
        console.log("===============================================");
        
        const contractAddress = "0x4eC8277F557C73B41EEEBd35Bf0dC0E24c165944";
        const testnetUSDTAddress = "0x00175c710A7448920934eF830f2F22D6370E0642"; // BSC Testnet USDT
        
        // Get accounts
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer:", deployer.address);
        
        // Connect to contract
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(contractAddress);
        
        // Connect to USDT contract
        const usdtABI = [
            "function balanceOf(address) view returns (uint256)",
            "function approve(address, uint256) returns (bool)",
            "function allowance(address, address) view returns (uint256)",
            "function transfer(address, uint256) returns (bool)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)"
        ];
        
        const usdtContract = new ethers.Contract(testnetUSDTAddress, usdtABI, deployer);
        
        console.log("📍 LeadFive Contract:", contractAddress);
        console.log("💰 USDT Contract:", testnetUSDTAddress);
        
        // Check USDT details
        try {
            const symbol = await usdtContract.symbol();
            const decimals = await usdtContract.decimals();
            console.log("🪙 USDT Symbol:", symbol);
            console.log("🪙 USDT Decimals:", decimals);
        } catch (error) {
            console.log("❌ Error getting USDT details:", error.message);
        }
        
        // Check deployer's USDT balance
        try {
            const balance = await usdtContract.balanceOf(deployer.address);
            console.log("💰 Deployer USDT Balance:", ethers.formatUnits(balance, 18), "USDT");
            
            if (balance === 0n) {
                console.log("\n🚨 DEPLOYER HAS NO USDT TOKENS!");
                console.log("📋 To test registration, you need testnet USDT tokens.");
                console.log("🔗 Get testnet USDT from: https://testnet.binance.org/faucet-smart");
                console.log("   Or use a BSC testnet faucet that provides USDT");
            }
        } catch (error) {
            console.log("❌ Error checking USDT balance:", error.message);
        }
        
        // Check allowance
        try {
            const allowance = await usdtContract.allowance(deployer.address, contractAddress);
            console.log("✅ Current USDT allowance:", ethers.formatUnits(allowance, 18), "USDT");
        } catch (error) {
            console.log("❌ Error checking allowance:", error.message);
        }
        
        // Get package prices for reference
        console.log("\n📦 PACKAGE PRICES FOR REGISTRATION:");
        for (let i = 1; i <= 4; i++) {
            const packageInfo = await contract.getPackageInfo(i);
            console.log(`   Package ${i}: ${ethers.formatUnits(packageInfo.price, 18)} USDT`);
        }
        
        // Get root referral code
        const rootCode = await contract.getReferralCode(deployer.address);
        console.log("\n🔗 Root Referral Code:", rootCode);
        
        // Check if we can test with a different account
        console.log("\n🧪 REGISTRATION TEST SETUP:");
        console.log("   To test registration, we need:");
        console.log("   1. A user account with USDT tokens");
        console.log("   2. USDT approval to the contract");
        console.log("   3. Call register(referralCode, packageLevel)");
        
        // Try to simulate registration with current account (will fail due to already registered)
        console.log("\n🎯 TESTING REGISTRATION FUNCTION:");
        try {
            // This should fail because deployer is already registered as root
            const tx = await contract.register(rootCode, 1, { gasLimit: 500000 });
            console.log("❌ Registration succeeded when it should have failed (already registered)");
        } catch (error) {
            if (error.message.includes("Already registered") || error.message.includes("User already exists")) {
                console.log("✅ Registration correctly rejected - deployer already registered");
            } else {
                console.log("❌ Registration failed with unexpected error:", error.message);
            }
        }
        
        console.log("\n📋 NEXT STEPS TO TEST REGISTRATION:");
        console.log("   1. Get testnet USDT tokens for a new test account");
        console.log("   2. Create a new test account with private key");
        console.log("   3. Send USDT to test account");
        console.log("   4. Approve USDT spending");
        console.log("   5. Test registration with different package levels");
        
        console.log("\n🎯 WOULD YOU LIKE TO:");
        console.log("   A. Create a mock USDT contract for testing?");
        console.log("   B. Get real testnet USDT and test with new accounts?");
        console.log("   C. Proceed to mainnet deployment without registration testing?");
        
    } catch (error) {
        console.error("💥 Test failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
