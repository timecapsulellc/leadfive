const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🔧 MAINNET ROOT SETUP FIX - DEPLOYER REGISTRATION");
        console.log("==================================================");
        
        const mainContractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer:", deployer.address);
        console.log("🎯 Contract:", mainContractAddress);
        console.log("🔐 Trezor Address:", trezorAddress);
        
        // Connect to contract
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(mainContractAddress);
        
        console.log("\n✅ STEP 1: Current Status Check");
        const owner = await contract.owner();
        const stats = await contract.getContractStats();
        console.log("   Contract Owner:", owner);
        console.log("   Total Users:", stats.totalUsersCount.toString());
        console.log("   Contract Paused:", stats.isPaused);
        
        // Verify we're the owner
        if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.log("❌ ERROR: Deployer is not the contract owner!");
            console.log("   Current owner:", owner);
            console.log("   Deployer:", deployer.address);
            process.exit(1);
        }
        
        console.log("\n✅ STEP 2: Check Current Registration Status");
        const deployerInfo = await contract.getUserInfo(deployer.address);
        const trezorInfo = await contract.getUserInfo(trezorAddress);
        
        console.log("   Deployer registered:", deployerInfo.isRegistered);
        console.log("   Trezor registered:", trezorInfo.isRegistered);
        
        if (deployerInfo.isRegistered) {
            console.log("   ✅ Deployer already registered!");
            const deployerCode = await contract.getReferralCode(deployer.address);
            console.log("   Deployer referral code:", `"${deployerCode}"`);
            
            if (deployerCode) {
                console.log("\n🎉 SUCCESS: Deployer is already registered with referral code!");
                console.log("🔗 Frontend Configuration:");
                console.log(`   ROOT_SPONSOR: ${deployer.address}`);
                console.log(`   ROOT_REFERRAL_CODE: ${deployerCode}`);
                console.log(`   Root Referral Link: https://leadfive.today/register?ref=${deployerCode}`);
                return;
            }
        }
        
        console.log("\n✅ STEP 3: Available Admin Functions");
        console.log("   Since registerAsRoot requires totalUsers == 0 and we have 1 user,");
        console.log("   we'll use alternative approaches...");
        
        // Check if we can register using the root user's referral code
        if (trezorInfo.isRegistered) {
            const trezorCode = await contract.getReferralCode(trezorAddress);
            console.log("   Trezor referral code:", `"${trezorCode}"`);
            
            if (trezorCode && trezorCode !== "") {
                console.log("\n✅ STEP 4: Register Deployer Using Root Referral Code");
                try {
                    // First, approve USDT for registration (30 USDT for package 1)
                    const packagePrice = await contract.getPackagePrice(1);
                    console.log("   Package 1 price:", packagePrice.toString(), "USDT");
                    
                    // Get USDT contract
                    const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
                    const usdtContract = await ethers.getContractAt("IERC20", usdtAddress);
                    
                    // Check deployer USDT balance
                    const deployerBalance = await usdtContract.balanceOf(deployer.address);
                    console.log("   Deployer USDT balance:", ethers.formatUnits(deployerBalance, 18));
                    
                    if (deployerBalance >= packagePrice) {
                        console.log("   ✅ Sufficient USDT balance");
                        
                        // Approve USDT
                        console.log("   Approving USDT...");
                        const approveTx = await usdtContract.approve(mainContractAddress, packagePrice);
                        await approveTx.wait();
                        console.log("   ✅ USDT approved");
                        
                        // Register user
                        console.log("   Registering deployer...");
                        const registerTx = await contract.registerUser(trezorCode, 1);
                        await registerTx.wait();
                        console.log("   ✅ Deployer registered successfully!");
                        
                        // Verify registration
                        const newDeployerInfo = await contract.getUserInfo(deployer.address);
                        console.log("   ✅ Verification - Deployer registered:", newDeployerInfo.isRegistered);
                        
                        const deployerReferralCode = await contract.getReferralCode(deployer.address);
                        console.log("   ✅ Deployer referral code:", deployerReferralCode);
                        
                        console.log("\n🎉 SUCCESS: Deployer registered with USDT payment!");
                        console.log("🔗 Frontend Configuration:");
                        console.log(`   ROOT_SPONSOR: ${deployer.address}`);
                        console.log(`   ROOT_REFERRAL_CODE: ${deployerReferralCode}`);
                        console.log(`   Root Referral Link: https://leadfive.today/register?ref=${deployerReferralCode}`);
                        
                    } else {
                        console.log("   ❌ Insufficient USDT balance for registration");
                        console.log("   Required:", ethers.formatUnits(packagePrice, 18), "USDT");
                        console.log("   Available:", ethers.formatUnits(deployerBalance, 18), "USDT");
                        console.log("\n💡 SOLUTION: Add USDT to deployer wallet or use alternative approach");
                    }
                    
                } catch (error) {
                    console.log("   ❌ Registration with USDT failed:", error.message.split('\n')[0]);
                }
            } else {
                console.log("   ❌ Root user has no referral code");
            }
        }
        
        console.log("\n✅ STEP 5: Alternative Approach - Manual Admin Setup");
        console.log("   Since the current setup has complications, here are options:");
        console.log("");
        console.log("   OPTION A: Use Trezor as Root Sponsor");
        console.log("     - Configure frontend to use Trezor address as sponsor");
        console.log("     - Even without referral code, it can act as sponsor");
        console.log("     - Frontend: ROOT_SPONSOR = 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29");
        console.log("");
        console.log("   OPTION B: Fix Root Referral Code");
        console.log("     - Add a function to set referral code for existing users");
        console.log("     - This would require a contract upgrade");
        console.log("");
        console.log("   OPTION C: Register Deployer with USDT");
        console.log("     - Send 30 USDT to deployer wallet");
        console.log("     - Register deployer under root/any valid user");
        console.log("     - Use deployer for frontend integration");
        
        // Try to fix the root referral code issue
        console.log("\n✅ STEP 6: Try Root User Fix Function");
        try {
            const fixTx = await contract.fixRootUserIssue();
            await fixTx.wait();
            console.log("   ✅ Root user issue fix executed");
            
            // Check if this helped
            const newTrezorCode = await contract.getReferralCode(trezorAddress);
            console.log("   New Trezor referral code:", `"${newTrezorCode}"`);
            
        } catch (error) {
            console.log("   ❌ Root user fix failed:", error.message.split('\n')[0]);
        }
        
        console.log("\n📊 FINAL STATUS");
        console.log("================");
        const finalStats = await contract.getContractStats();
        const finalDeployerInfo = await contract.getUserInfo(deployer.address);
        const finalTrezorInfo = await contract.getUserInfo(trezorAddress);
        
        console.log("Contract Status:");
        console.log(`   Total Users: ${finalStats.totalUsersCount}`);
        console.log(`   Deployer Registered: ${finalDeployerInfo.isRegistered}`);
        console.log(`   Trezor Registered: ${finalTrezorInfo.isRegistered}`);
        
        if (finalDeployerInfo.isRegistered) {
            const deployerCode = await contract.getReferralCode(deployer.address);
            console.log(`   Deployer Referral Code: "${deployerCode}"`);
        }
        
        const trezorFinalCode = await contract.getReferralCode(trezorAddress);
        console.log(`   Trezor Referral Code: "${trezorFinalCode}"`);
        
        console.log("\n🎯 RECOMMENDATION FOR FRONTEND:");
        if (finalDeployerInfo.isRegistered) {
            console.log("   Use deployer as root sponsor");
        } else if (trezorFinalCode && trezorFinalCode !== "") {
            console.log("   Use Trezor as root sponsor");
        } else {
            console.log("   Configure frontend to handle registration without referral code");
            console.log("   Or manually add USDT to deployer for registration");
        }
        
    } catch (error) {
        console.error("❌ Error in root setup fix:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
