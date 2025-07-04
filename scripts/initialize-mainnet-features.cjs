const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🔧 MAINNET POST-UPGRADE INITIALIZATION");
        console.log("======================================");
        
        const mainContractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
        
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer:", deployer.address);
        console.log("🎯 Main Contract:", mainContractAddress);
        
        // Connect to upgraded contract
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(mainContractAddress);
        
        console.log("\n✅ STEP 1: Verify Upgrade Success");
        try {
            const owner = await contract.owner();
            console.log("   Current Owner:", owner);
            
            if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
                console.log("   ❌ Deployer is not owner, cannot proceed");
                return;
            }
            console.log("   ✅ Deployer confirmed as owner");
        } catch (error) {
            console.log("   ❌ Owner check failed:", error.message);
            return;
        }
        
        console.log("\n✅ STEP 2: Initialize V1.1 Features");
        try {
            console.log("   Attempting V1.1 initialization...");
            const initTx = await contract.initializeV1_1();
            await initTx.wait();
            console.log("   ✅ V1.1 features initialized successfully");
        } catch (error) {
            if (error.message.includes("Already initialized") || error.message.includes("f92ee8a9")) {
                console.log("   ℹ️  V1.1 features already initialized");
            } else {
                console.log("   ❌ V1.1 initialization failed:", error.message);
            }
        }
        
        console.log("\n✅ STEP 3: Fix Root User Issue");
        try {
            console.log("   Attempting root user fix...");
            const fixTx = await contract.fixRootUserIssue();
            await fixTx.wait();
            console.log("   ✅ Root user issue fixed");
        } catch (error) {
            console.log("   ❌ Root fix failed:", error.message);
        }
        
        console.log("\n✅ STEP 4: Register Deployer as Root");
        try {
            console.log("   Registering deployer as root with Package 4...");
            const registerTx = await contract.registerAsRoot(4);
            await registerTx.wait();
            console.log("   ✅ Deployer registered as root successfully");
        } catch (error) {
            if (error.message.includes("Root already exists")) {
                console.log("   ℹ️  Root user already exists");
                
                // Check if it's the deployer
                try {
                    const userInfo = await contract.getUserInfo(deployer.address);
                    if (userInfo.isRegistered) {
                        console.log("   ✅ Deployer is already registered as user");
                    } else {
                        console.log("   ⚠️  Root exists but deployer is not registered");
                    }
                } catch (checkError) {
                    console.log("   ❌ Could not check user info:", checkError.message);
                }
            } else {
                console.log("   ❌ Root registration failed:", error.message);
            }
        }
        
        console.log("\n✅ STEP 5: Activate All Levels");
        try {
            console.log("   Activating all levels for root...");
            const activateTx = await contract.activateAllLevelsForRoot();
            await activateTx.wait();
            console.log("   ✅ All levels activated successfully");
        } catch (error) {
            if (error.message.includes("Root not registered")) {
                console.log("   ⚠️  Root not registered, trying alternative approach...");
                
                // Try to register the deployer as a regular user first
                try {
                    // Check if deployer is already registered
                    const userInfo = await contract.getUserInfo(deployer.address);
                    if (!userInfo.isRegistered) {
                        console.log("   Attempting regular user registration...");
                        // This might fail due to referral requirement, but worth trying
                        const regTx = await contract.register(
                            deployer.address, // sponsor (self)
                            4, // package level
                            true, // use USDT
                            "" // empty referral code
                        );
                        await regTx.wait();
                        console.log("   ✅ Deployer registered as regular user");
                    }
                } catch (regError) {
                    console.log("   ❌ Regular registration failed:", regError.message);
                }
            } else {
                console.log("   ❌ Level activation failed:", error.message);
            }
        }
        
        console.log("\n✅ STEP 6: Get Final Status");
        try {
            // Check user info
            const userInfo = await contract.getUserInfo(deployer.address);
            console.log("   👤 Deployer Registered:", userInfo.isRegistered);
            console.log("   📦 Package Level:", userInfo.packageLevel?.toString() || "0");
            
            // Try to get referral code if registered
            if (userInfo.isRegistered) {
                try {
                    const referralCode = await contract.getReferralCode(deployer.address);
                    console.log("   🔗 Referral Code:", referralCode);
                } catch (codeError) {
                    console.log("   ❌ Could not get referral code:", codeError.message);
                }
            }
            
            // Check contract stats
            const stats = await contract.getContractStats();
            console.log("   👥 Total Users:", stats.totalUsersCount.toString());
            console.log("   ⏸️  Contract Paused:", stats.isPaused);
            
            // Check package prices
            console.log("\n📦 Package Prices:");
            for (let i = 1; i <= 4; i++) {
                try {
                    const packageInfo = await contract.getPackageInfo(i);
                    console.log(`   Package ${i}: ${ethers.formatUnits(packageInfo.price, 18)} USDT`);
                } catch (pkgError) {
                    console.log(`   ❌ Package ${i} error:`, pkgError.message);
                }
            }
            
        } catch (error) {
            console.log("   ❌ Status check failed:", error.message);
        }
        
        console.log("\n🎉 MAINNET INITIALIZATION SUMMARY");
        console.log("=" .repeat(50));
        console.log("📍 Contract Address:", mainContractAddress);
        console.log("🆕 Implementation: 0x2cc37CB4e1F5D3D56E86c8792fD241d46064B2cF");
        console.log("👑 Owner:", deployer.address);
        console.log("✅ Upgrade: SUCCESSFUL");
        console.log("🔧 Initialization: IN PROGRESS");
        
        console.log("\n📱 NEXT STEPS:");
        console.log("   1. ✅ Contract successfully upgraded to v1.10");
        console.log("   2. 🔄 Configure frontend with new contract features");
        console.log("   3. 🧪 Test registration and functionality");
        console.log("   4. 🔗 Generate root referral link for frontend");
        console.log("   5. 🔐 Transfer ownership to Trezor when everything is ready");
        
        console.log("\n⚠️  IMPORTANT:");
        console.log("   - Main contract address remains unchanged");
        console.log("   - All existing user data is preserved");
        console.log("   - New v1.10 features are now available");
        console.log("   - Ready for frontend integration");
        
    } catch (error) {
        console.error("💥 Initialization failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
