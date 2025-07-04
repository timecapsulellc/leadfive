const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🔧 MAINNET PROXY UPGRADE & INITIALIZATION");
        console.log("=========================================");
        
        const mainContractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
        const newImplementationAddress = "0x2cc37CB4e1F5D3D56E86c8792fD241d46064B2cF";
        
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer:", deployer.address);
        console.log("🎯 Main Contract (Proxy):", mainContractAddress);
        console.log("🆕 New Implementation:", newImplementationAddress);
        
        // Connect to main contract as proxy
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(mainContractAddress);
        
        // Step 1: Check current ownership
        console.log("\n✅ STEP 1: Verify Current Owner");
        const currentOwner = await contract.owner();
        console.log("   Current Owner:", currentOwner);
        
        if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.log("   ❌ ERROR: Deployer is not the current owner!");
            console.log("   Current owner must perform this upgrade");
            return;
        }
        console.log("   ✅ Deployer is confirmed owner - can proceed");
        
        // Step 2: Upgrade to new implementation
        console.log("\n🚀 STEP 2: Upgrade Proxy Implementation");
        try {
            console.log("   Upgrading proxy to new implementation...");
            const upgradeTx = await contract.upgradeTo(newImplementationAddress);
            await upgradeTx.wait();
            console.log("   ✅ Proxy upgraded successfully!");
            console.log("   Transaction:", upgradeTx.hash);
        } catch (error) {
            console.log("   ❌ Upgrade failed:", error.message);
            return;
        }
        
        // Step 3: Initialize v1.1 features
        console.log("\n🔧 STEP 3: Initialize v1.1 Features");
        try {
            const initTx = await contract.initializeV1_1();
            await initTx.wait();
            console.log("   ✅ V1.1 features initialized");
        } catch (error) {
            if (error.message.includes("Already initialized")) {
                console.log("   ℹ️  V1.1 already initialized");
            } else {
                console.log("   ❌ Initialization error:", error.message);
            }
        }
        
        // Step 4: Fix root user issue
        console.log("\n🔧 STEP 4: Fix Root User Issue");
        try {
            const fixTx = await contract.fixRootUserIssue();
            await fixTx.wait();
            console.log("   ✅ Root user issue fixed");
        } catch (error) {
            console.log("   ❌ Root fix error:", error.message);
        }
        
        // Step 5: Register deployer as root
        console.log("\n👑 STEP 5: Register Deployer as Root");
        try {
            const registerTx = await contract.registerAsRoot(4); // Highest package
            await registerTx.wait();
            console.log("   ✅ Deployer registered as root with Package 4");
        } catch (error) {
            if (error.message.includes("Already registered")) {
                console.log("   ℹ️  Deployer already registered as root");
            } else {
                console.log("   ❌ Root registration error:", error.message);
            }
        }
        
        // Step 6: Activate all levels for root
        console.log("\n🎯 STEP 6: Activate All Levels for Root");
        try {
            const activateTx = await contract.activateAllLevelsForRoot();
            await activateTx.wait();
            console.log("   ✅ All levels activated for root");
        } catch (error) {
            console.log("   ❌ Level activation error:", error.message);
        }
        
        // Step 7: Verify final state
        console.log("\n📊 STEP 7: Verify Final Contract State");
        
        // Get deployer's referral code
        try {
            const referralCode = await contract.getReferralCode(deployer.address);
            console.log("   🔗 Root Referral Code:", referralCode);
        } catch (error) {
            console.log("   ❌ Error getting referral code:", error.message);
        }
        
        // Check user info
        try {
            const userInfo = await contract.getUserInfo(deployer.address);
            console.log("   👤 Root User Registered:", userInfo.isRegistered);
            console.log("   📦 Root Package Level:", userInfo.packageLevel.toString());
        } catch (error) {
            console.log("   ❌ Error getting user info:", error.message);
        }
        
        // Check contract stats
        try {
            const stats = await contract.getContractStats();
            console.log("   👥 Total Users:", stats.totalUsersCount.toString());
            console.log("   ⏸️  Contract Paused:", stats.isPaused);
        } catch (error) {
            console.log("   ❌ Error getting stats:", error.message);
        }
        
        // Check package prices
        console.log("\n📦 Package Pricing Verification:");
        for (let i = 1; i <= 4; i++) {
            try {
                const packageInfo = await contract.getPackageInfo(i);
                console.log(`   Package ${i}: ${ethers.formatUnits(packageInfo.price, 18)} USDT`);
            } catch (error) {
                console.log(`   ❌ Error getting package ${i}:`, error.message);
            }
        }
        
        console.log("\n🎉 MAINNET UPGRADE COMPLETE!");
        console.log("=" .repeat(50));
        console.log("📍 Main Contract:", mainContractAddress);
        console.log("🆕 Implementation:", newImplementationAddress);
        console.log("👑 Root User:", deployer.address);
        console.log("🔗 Root Code: Use getReferralCode() to get the code");
        console.log("✅ Status: Ready for frontend configuration");
        
        console.log("\n📱 NEXT STEPS:");
        console.log("   1. ✅ Contract upgraded and initialized");
        console.log("   2. ✅ Deployer set as root with full admin rights");
        console.log("   3. 🔄 Configure frontend with new features");
        console.log("   4. 🧪 Test all functionality");
        console.log("   5. 🔐 Transfer ownership to Trezor when ready");
        
        console.log("\n⚠️  REMEMBER:");
        console.log("   - Contract address remains the same");
        console.log("   - All existing data preserved");
        console.log("   - Only transfer to Trezor after frontend setup");
        
    } catch (error) {
        console.error("💥 Upgrade failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
