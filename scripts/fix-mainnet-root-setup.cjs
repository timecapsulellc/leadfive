const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🔧 MAINNET ROOT USER SETUP - PROPER INITIALIZATION");
        console.log("==================================================");
        
        const mainContractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
        
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer:", deployer.address);
        console.log("🎯 Contract:", mainContractAddress);
        
        // Connect to contract
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(mainContractAddress);
        
        console.log("\n✅ STEP 1: Verify Owner Status");
        const owner = await contract.owner();
        console.log("   Contract Owner:", owner);
        
        if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.log("   ❌ Deployer is not owner, cannot proceed");
            return;
        }
        console.log("   ✅ Deployer confirmed as owner");
        
        console.log("\n✅ STEP 2: Check Current Root Status");
        try {
            const userInfo = await contract.getUserInfo(deployer.address);
            console.log("   Deployer registered:", userInfo.isRegistered);
            console.log("   Package level:", userInfo.packageLevel?.toString() || "0");
            
            if (userInfo.isRegistered) {
                console.log("   ✅ Deployer already registered, checking referral code...");
                try {
                    const referralCode = await contract.getReferralCode(deployer.address);
                    console.log("   🔗 Current referral code:", referralCode);
                    
                    console.log("\n🎉 ROOT USER ALREADY SETUP!");
                    console.log("📍 Contract Address:", mainContractAddress);
                    console.log("👑 Root User:", deployer.address);
                    console.log("🔗 Root Referral Code:", referralCode);
                    console.log("📦 Package Level:", userInfo.packageLevel?.toString());
                    
                    return;
                } catch (codeError) {
                    console.log("   ❌ Error getting referral code:", codeError.message);
                }
            }
        } catch (error) {
            console.log("   ❌ Error checking user info:", error.message);
        }
        
        console.log("\n✅ STEP 3: Initialize V1.1 Features (if needed)");
        try {
            const initTx = await contract.initializeV1_1();
            await initTx.wait();
            console.log("   ✅ V1.1 features initialized");
        } catch (error) {
            if (error.message.includes("Already initialized") || error.message.includes("f92ee8a9")) {
                console.log("   ℹ️  V1.1 features already initialized");
            } else {
                console.log("   ❌ V1.1 initialization failed:", error.message);
            }
        }
        
        console.log("\n✅ STEP 4: Fix Root User Issue");
        try {
            const fixTx = await contract.fixRootUserIssue();
            await fixTx.wait();
            console.log("   ✅ Root user issue fixed");
        } catch (error) {
            console.log("   ⚠️  Root fix error (might be normal):", error.message);
        }
        
        console.log("\n✅ STEP 5: Register Deployer as Root (Admin Function)");
        try {
            console.log("   Attempting registerAsRoot(4)...");
            const registerTx = await contract.registerAsRoot(4);
            await registerTx.wait();
            console.log("   ✅ Deployer registered as root with Package 4");
        } catch (error) {
            if (error.message.includes("Root already exists")) {
                console.log("   ℹ️  Root already exists, checking who it is...");
                
                // Find out who the root is
                try {
                    const stats = await contract.getContractStats();
                    console.log("   Total users in system:", stats.totalUsersCount.toString());
                    
                    // If there's 1 user, it might be the root
                    if (stats.totalUsersCount.toString() === "1") {
                        console.log("   ℹ️  There's 1 user in system, likely the root");
                    }
                } catch (statsError) {
                    console.log("   ❌ Could not get stats:", statsError.message);
                }
            } else {
                console.log("   ❌ Root registration failed:", error.message);
            }
        }
        
        console.log("\n✅ STEP 6: Activate All Levels for Root");
        try {
            console.log("   Attempting activateAllLevelsForRoot()...");
            const activateTx = await contract.activateAllLevelsForRoot();
            await activateTx.wait();
            console.log("   ✅ All levels activated for root");
        } catch (error) {
            console.log("   ❌ Level activation failed:", error.message);
            
            // Try alternative: check if deployer needs manual registration
            if (error.message.includes("Root not registered")) {
                console.log("   🔧 Trying alternative registration approach...");
                
                // Try to set the deployer as root manually using admin functions
                try {
                    // Check if there are any admin functions to manually set root
                    console.log("   Checking available admin functions...");
                    
                    // Get total users to understand current state
                    const stats = await contract.getContractStats();
                    console.log("   Current total users:", stats.totalUsersCount.toString());
                    
                } catch (altError) {
                    console.log("   ❌ Alternative approach failed:", altError.message);
                }
            }
        }
        
        console.log("\n✅ STEP 7: Final Status Check");
        try {
            // Check final user status
            const userInfo = await contract.getUserInfo(deployer.address);
            console.log("   👤 Deployer registered:", userInfo.isRegistered);
            console.log("   📦 Package level:", userInfo.packageLevel?.toString() || "0");
            
            // Get referral code if available
            if (userInfo.isRegistered) {
                try {
                    const referralCode = await contract.getReferralCode(deployer.address);
                    console.log("   🔗 Referral code:", referralCode);
                } catch (codeError) {
                    console.log("   ❌ Could not get referral code:", codeError.message);
                }
            }
            
            // Check contract stats
            const stats = await contract.getContractStats();
            console.log("   👥 Total users:", stats.totalUsersCount.toString());
            console.log("   ⏸️  Contract paused:", stats.isPaused);
            
            // Verify package system
            console.log("\n📦 Package System Verification:");
            for (let i = 1; i <= 4; i++) {
                try {
                    const packageInfo = await contract.getPackageInfo(i);
                    console.log(`   Package ${i}: ${ethers.formatUnits(packageInfo.price, 18)} USDT`);
                } catch (pkgError) {
                    console.log(`   ❌ Package ${i} error:`, pkgError.message);
                }
            }
            
        } catch (error) {
            console.log("   ❌ Final status check failed:", error.message);
        }
        
        console.log("\n🎯 SETUP SUMMARY");
        console.log("=" .repeat(50));
        console.log("📍 Main Contract:", mainContractAddress);
        console.log("🆕 Implementation: 0x2cc37CB4e1F5D3D56E86c8792fD241d46064B2cF");
        console.log("👑 Owner/Deployer:", deployer.address);
        console.log("✅ Upgrade Status: COMPLETE");
        console.log("🔧 Root Setup: IN PROGRESS");
        
        console.log("\n📱 NEXT ACTIONS:");
        console.log("   1. ✅ Contract successfully upgraded");
        console.log("   2. 🔧 Complete root user setup if needed");
        console.log("   3. 🎯 Update frontend configuration");
        console.log("   4. 🔗 Generate proper referral link");
        console.log("   5. 🧪 Test all functionality");
        console.log("   6. 🔐 Transfer to Trezor when ready");
        
        console.log("\n💡 ROOT USER ISSUE RESOLUTION:");
        console.log("   If root setup is incomplete, the deployer can:");
        console.log("   1. Use admin functions to manually configure");
        console.log("   2. Set up initial user structure");
        console.log("   3. Generate proper referral codes");
        console.log("   4. Test registration flow with real users");
        
    } catch (error) {
        console.error("💥 Setup failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
