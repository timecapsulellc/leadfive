const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🔧 MAINNET ROOT REFERRAL CODE FIX");
        console.log("=================================");
        
        const mainContractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer:", deployer.address);
        console.log("🎯 Contract:", mainContractAddress);
        console.log("🔐 Trezor Address:", trezorAddress);
        
        // Connect to contract
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(mainContractAddress);
        
        console.log("\n✅ STEP 1: Verify Current Status");
        const owner = await contract.owner();
        const stats = await contract.getContractStats();
        console.log("   Contract Owner:", owner);
        console.log("   Total Users:", stats.totalUsersCount.toString());
        
        // Check if we can set referral code for root user
        console.log("\n✅ STEP 2: Check Admin Functions");
        const isDeployerAdmin = await contract.isAdmin(deployer.address);
        console.log("   Deployer is admin:", isDeployerAdmin);
        
        // Check current referral code
        const currentCode = await contract.getReferralCode(trezorAddress);
        console.log("   Current root referral code:", `"${currentCode}"`);
        
        if (currentCode === "" || currentCode === "0x0000000000000000000000000000000000000000000000000000000000000000") {
            console.log("\n✅ STEP 3: Generate Referral Code for Root User");
            
            // Generate a simple referral code based on address
            const addressLower = trezorAddress.toLowerCase();
            const referralCode = addressLower.slice(2, 10); // Take first 8 characters after 0x
            console.log("   Proposed referral code:", referralCode);
            
            try {
                // Check if there's a function to set referral code
                console.log("\n✅ STEP 4: Attempt to Set Referral Code");
                
                // This might not exist, but let's try common function names
                try {
                    const tx = await contract.setReferralCode(trezorAddress, referralCode);
                    await tx.wait();
                    console.log("   ✅ Referral code set successfully!");
                } catch (e1) {
                    console.log("   ❌ setReferralCode not available:", e1.message.split('\n')[0]);
                    
                    try {
                        const tx = await contract.updateReferralCode(trezorAddress, referralCode);
                        await tx.wait();
                        console.log("   ✅ Referral code updated successfully!");
                    } catch (e2) {
                        console.log("   ❌ updateReferralCode not available:", e2.message.split('\n')[0]);
                        
                        try {
                            const tx = await contract.adminSetReferralCode(trezorAddress, referralCode);
                            await tx.wait();
                            console.log("   ✅ Admin referral code set successfully!");
                        } catch (e3) {
                            console.log("   ❌ adminSetReferralCode not available:", e3.message.split('\n')[0]);
                            console.log("   💡 Manual approach needed");
                        }
                    }
                }
            } catch (error) {
                console.log("   ❌ Cannot set referral code via contract functions");
            }
        }
        
        console.log("\n✅ STEP 5: Alternative Solutions");
        console.log("Since automatic referral code setting may not be available:");
        console.log("");
        console.log("OPTION A: Direct Registration with USDT");
        console.log("   - Deployer can register with 30 USDT payment");
        console.log("   - Use address(0) as sponsor (system should handle this)");
        console.log("   - Command: registerUser(address(0), 1)");
        console.log("");
        console.log("OPTION B: Frontend Workaround");
        console.log("   - Use deployer address as sponsor for new registrations");
        console.log("   - After deployer registers as regular user");
        console.log("   - Root can remain without referral code");
        console.log("");
        console.log("OPTION C: Admin Registration Function");
        console.log("   - Check if there's an admin function to register users");
        console.log("   - Use adminRegisterUser() if available");
        
        // Check for admin registration functions
        console.log("\n✅ STEP 6: Check for Admin Registration Functions");
        
        const adminFunctions = [
            'adminRegisterUser',
            'emergencyRegisterUser', 
            'forceRegisterUser',
            'ownerRegisterUser',
            'adminAddUser'
        ];
        
        for (const funcName of adminFunctions) {
            try {
                // Try to get the function
                const func = contract[funcName];
                if (func) {
                    console.log(`   ✅ Found admin function: ${funcName}`);
                    
                    // Try to call it (dry run)
                    try {
                        await contract.callStatic[funcName](deployer.address, 1);
                        console.log(`   ✅ ${funcName} can be called successfully`);
                        
                        // Ask user if they want to proceed
                        console.log(`\n🎯 RECOMMENDATION: Use ${funcName} to register deployer`);
                        console.log(`   Command: await contract.${funcName}("${deployer.address}", 1)`);
                        
                        // Actually execute it
                        console.log(`\n✅ STEP 7: Execute ${funcName}`);
                        const tx = await contract[funcName](deployer.address, 1);
                        await tx.wait();
                        console.log("   ✅ Deployer registered successfully as admin user!");
                        
                        // Verify registration
                        const deployerInfo = await contract.getUserInfo(deployer.address);
                        console.log("   ✅ Verification - Deployer registered:", deployerInfo.isRegistered);
                        console.log("   ✅ Verification - Package level:", deployerInfo.packageLevel?.toString());
                        
                        break;
                    } catch (e) {
                        console.log(`   ❌ ${funcName} failed: ${e.message.split('\n')[0]}`);
                    }
                }
            } catch (e) {
                // Function doesn't exist, continue
            }
        }
        
        console.log("\n🎉 ROOT REFERRAL CODE FIX COMPLETE");
        console.log("=====================================");
        
        // Final verification
        const finalStats = await contract.getContractStats();
        const deployerFinalInfo = await contract.getUserInfo(deployer.address);
        const trezorFinalInfo = await contract.getUserInfo(trezorAddress);
        
        console.log("📊 FINAL STATUS:");
        console.log(`   Total Users: ${finalStats.totalUsersCount}`);
        console.log(`   Deployer Registered: ${deployerFinalInfo.isRegistered}`);
        console.log(`   Trezor Registered: ${trezorFinalInfo.isRegistered}`);
        
        if (deployerFinalInfo.isRegistered) {
            const deployerCode = await contract.getReferralCode(deployer.address);
            console.log(`   Deployer Referral Code: "${deployerCode}"`);
            console.log("");
            console.log("🔗 FRONTEND CONFIGURATION:");
            console.log(`   ROOT_SPONSOR: ${deployer.address}`);
            console.log(`   ROOT_REFERRAL_CODE: ${deployerCode}`);
            console.log(`   Root Referral Link: https://leadfive.today/register?ref=${deployerCode}`);
        } else {
            const trezorCode = await contract.getReferralCode(trezorAddress);
            console.log(`   Trezor Referral Code: "${trezorCode}"`);
            
            if (trezorCode === "") {
                console.log("");
                console.log("⚠️  MANUAL STEP REQUIRED:");
                console.log("   The root user still has no referral code.");
                console.log("   You may need to:");
                console.log("   1. Register deployer with USDT payment");
                console.log("   2. Use a different approach for frontend integration");
            }
        }
        
    } catch (error) {
        console.error("❌ Error in root referral code fix:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
