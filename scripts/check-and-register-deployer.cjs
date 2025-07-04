const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("💰 CHECK DEPLOYER USDT BALANCE & REGISTER");
        console.log("==========================================");
        
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer:", deployer.address);
        
        // USDT contract on BSC Mainnet
        const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
        const usdtContract = await ethers.getContractAt("IERC20", usdtAddress);
        
        console.log("\n✅ STEP 1: Check USDT Balance");
        const balance = await usdtContract.balanceOf(deployer.address);
        console.log("   Deployer USDT balance:", ethers.formatUnits(balance, 18), "USDT");
        
        // Check BNB balance too
        const bnbBalance = await ethers.provider.getBalance(deployer.address);
        console.log("   Deployer BNB balance:", ethers.formatEther(bnbBalance), "BNB");
        
        // Get contract info
        const mainContractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(mainContractAddress);
        
        // Check package prices
        console.log("\n✅ STEP 2: Package Prices");
        for (let i = 1; i <= 4; i++) {
            const price = await contract.getPackagePrice(i);
            console.log(`   Package ${i}: ${ethers.formatUnits(price, 18)} USDT`);
        }
        
        // Check if deployer has enough for package 1
        const package1Price = await contract.getPackagePrice(1);
        const requiredAmount = package1Price;
        
        console.log("\n✅ STEP 3: Registration Feasibility");
        console.log(`   Required for Package 1: ${ethers.formatUnits(requiredAmount, 18)} USDT`);
        console.log(`   Available: ${ethers.formatUnits(balance, 18)} USDT`);
        console.log(`   Sufficient funds: ${balance >= requiredAmount ? "✅ YES" : "❌ NO"}`);
        
        if (balance >= requiredAmount) {
            console.log("\n✅ STEP 4: Proceed with Registration");
            
            // Since the root user has no referral code, we'll try to register without one
            // or use a direct registration approach
            
            try {
                console.log("   Checking current registration status...");
                const deployerInfo = await contract.getUserInfo(deployer.address);
                
                if (deployerInfo.isRegistered) {
                    console.log("   ✅ Deployer already registered!");
                    const code = await contract.getReferralCode(deployer.address);
                    console.log("   Referral code:", code);
                    return;
                }
                
                // Try registering with empty string or address(0)
                console.log("   Attempting registration with special root handling...");
                
                // Approve USDT first
                console.log("   Approving USDT...");
                const approveTx = await usdtContract.approve(mainContractAddress, requiredAmount);
                await approveTx.wait();
                console.log("   ✅ USDT approved");
                
                // Try different registration approaches
                const registrationMethods = [
                    // Method 1: Try with empty referral code
                    async () => {
                        console.log("   Trying registerUser with empty code...");
                        return await contract.registerUser("", 1);
                    },
                    // Method 2: Try with zero address as sponsor
                    async () => {
                        console.log("   Trying direct registration...");
                        return await contract.registerUser("0x0000000000000000000000000000000000000000", 1);
                    },
                    // Method 3: Try with any string that might work
                    async () => {
                        console.log("   Trying registerUser with 'ROOT' code...");
                        return await contract.registerUser("ROOT", 1);
                    }
                ];
                
                let success = false;
                for (const method of registrationMethods) {
                    try {
                        const tx = await method();
                        await tx.wait();
                        console.log("   ✅ Registration successful!");
                        success = true;
                        break;
                    } catch (error) {
                        console.log("   ❌ Method failed:", error.message.split('\n')[0]);
                    }
                }
                
                if (success) {
                    // Verify registration
                    const newInfo = await contract.getUserInfo(deployer.address);
                    console.log("   ✅ Verification - Deployer registered:", newInfo.isRegistered);
                    
                    const referralCode = await contract.getReferralCode(deployer.address);
                    console.log("   ✅ Deployer referral code:", referralCode);
                    
                    console.log("\n🎉 SUCCESS! Frontend Configuration:");
                    console.log(`   ROOT_SPONSOR: ${deployer.address}`);
                    console.log(`   ROOT_REFERRAL_CODE: ${referralCode}`);
                    console.log(`   Root Referral Link: https://leadfive.today/register?ref=${referralCode}`);
                } else {
                    console.log("\n❌ All registration methods failed");
                    console.log("💡 ALTERNATIVE SOLUTIONS:");
                    console.log("   1. Configure frontend to allow registration without referral");
                    console.log("   2. Use Trezor address as sponsor (even without referral code)");
                    console.log("   3. Add a contract function to set referral codes manually");
                }
                
            } catch (error) {
                console.log("   ❌ Registration error:", error.message);
            }
            
        } else {
            console.log("\n💰 INSUFFICIENT USDT - FUNDING SOLUTIONS:");
            console.log(`   Need: ${ethers.formatUnits(requiredAmount - balance, 18)} more USDT`);
            console.log("");
            console.log("   OPTIONS:");
            console.log("   1. Transfer USDT to deployer wallet from another account");
            console.log("   2. Buy USDT on BSC (PancakeSwap, Binance, etc.)");
            console.log("   3. Use a different approach for frontend integration");
            console.log("");
            console.log("   QUICK FUNDING:");
            console.log(`   Send ${ethers.formatUnits(requiredAmount, 18)} USDT to: ${deployer.address}`);
        }
        
        console.log("\n📊 CURRENT SYSTEM STATUS");
        console.log("========================");
        const stats = await contract.getContractStats();
        console.log(`Total Users: ${stats.totalUsersCount}`);
        
        const deployerFinalInfo = await contract.getUserInfo(deployer.address);
        console.log(`Deployer Registered: ${deployerFinalInfo.isRegistered}`);
        
        const trezorInfo = await contract.getUserInfo("0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29");
        console.log(`Trezor Registered: ${trezorInfo.isRegistered}`);
        
        if (deployerFinalInfo.isRegistered) {
            const deployerCode = await contract.getReferralCode(deployer.address);
            console.log(`Deployer Referral Code: "${deployerCode}"`);
        }
        
        const trezorCode = await contract.getReferralCode("0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29");
        console.log(`Trezor Referral Code: "${trezorCode}"`);
        
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
