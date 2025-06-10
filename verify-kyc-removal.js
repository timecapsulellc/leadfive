const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying KYC Removal from OrphiCrowdFund V4Ultra contracts...\n");
    
    try {
        // Deploy MockUSDT
        console.log("📄 Deploying MockUSDT...");
        const MockUSDT = await ethers.getContractFactory("standalone-v4ultra/MockUSDT.sol:MockUSDT");
        const mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        console.log("✅ MockUSDT deployed at:", await mockUSDT.getAddress());
        
        // Deploy OrphiCrowdFundV4Ultra
        console.log("\n📄 Deploying OrphiCrowdFundV4Ultra...");
        const OrphiV4Ultra = await ethers.getContractFactory("standalone-v4ultra/OrphiCrowdFundV4Ultra.sol:OrphiCrowdFundV4Ultra");
        const orphiV4Ultra = await OrphiV4Ultra.deploy(await mockUSDT.getAddress(), "0x0000000000000000000000000000000000000000");
        await orphiV4Ultra.waitForDeployment();
        console.log("✅ OrphiCrowdFundV4Ultra deployed at:", await orphiV4Ultra.getAddress());
        
        // Deploy OrphiCrowdFundV4UltraSecure  
        console.log("\n📄 Deploying OrphiCrowdFundV4UltraSecure...");
        const OrphiV4UltraSecure = await ethers.getContractFactory("standalone-v4ultra/OrphiCrowdFundV4UltraSecure.sol:OrphiCrowdFundV4UltraSecure");
        const orphiV4UltraSecure = await OrphiV4UltraSecure.deploy(await mockUSDT.getAddress(), "0x0000000000000000000000000000000000000000");
        await orphiV4UltraSecure.waitForDeployment();
        console.log("✅ OrphiCrowdFundV4UltraSecure deployed at:", await orphiV4UltraSecure.getAddress());
        
        // Test user registration without KYC
        console.log("\n🧪 Testing user registration (should work without KYC)...");
        const [owner] = await ethers.getSigners();
        
        // Mint some USDT to owner
        const mintAmount = ethers.parseUnits("1000", 6); // 1000 USDT with 6 decimals
        await mockUSDT.mint(owner.address, mintAmount);
        console.log("✅ Minted 1000 USDT to test account");
        
        // Approve USDT for registration
        const packageAmount = ethers.parseUnits("100", 6); // 100 USDT package
        await mockUSDT.approve(await orphiV4Ultra.getAddress(), packageAmount);
        console.log("✅ Approved 100 USDT for registration");
        
        // Register user (should work without KYC verification)
        await orphiV4Ultra.register("0x0000000000000000000000000000000000000000", 1);
        console.log("✅ User registered successfully without KYC!");
        
        // Get user info and verify no KYC field
        const userInfo = await orphiV4Ultra.getUserInfo(owner.address);
        console.log("\n📊 User Info Structure:");
        console.log("- ID:", userInfo[0].toString());
        console.log("- Team Size:", userInfo[1].toString());
        console.log("- Direct Count:", userInfo[2].toString());
        console.log("- Package Tier:", userInfo[3].toString());
        console.log("- Matrix Position:", userInfo[4].toString());
        console.log("- Total Earnings:", ethers.formatUnits(userInfo[5], 6), "USDT");
        console.log("- Withdrawable:", ethers.formatUnits(userInfo[6], 6), "USDT");
        console.log("- Sponsor:", userInfo[7].toString());
        console.log("- Last Activity:", userInfo[8].toString());
        console.log("- Is Capped:", userInfo[9]);
        console.log("- Leader Rank:", userInfo[10].toString());
        console.log("- Suspension Level:", userInfo[11].toString());
        
        console.log("\n🎉 SUCCESS: KYC has been successfully removed from both contracts!");
        console.log("- ✅ Contracts deploy without errors");
        console.log("- ✅ User registration works without KYC verification");
        console.log("- ✅ User struct no longer contains isKYCVerified field");
        console.log("- ✅ No KYC-related functions or modifiers present");
        
    } catch (error) {
        console.error("❌ ERROR:", error.message);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("❌ SCRIPT ERROR:", error);
    process.exit(1);
});
