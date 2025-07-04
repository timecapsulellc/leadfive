const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("💰 REGISTER DEPLOYER WITH USDT");
        console.log("===============================");
        
        const mainContractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
        const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer:", deployer.address);
        console.log("🎯 Contract:", mainContractAddress);
        console.log("💵 USDT Contract:", usdtAddress);
        console.log("🔐 Root User (Trezor):", trezorAddress);
        
        // Connect to contracts
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(mainContractAddress);
        
        const usdt = await ethers.getContractAt("IERC20", usdtAddress);
        
        console.log("\n✅ STEP 1: Check USDT Balance");
        const deployerUsdtBalance = await usdt.balanceOf(deployer.address);
        const usdtDecimals = 18; // USDT on BSC has 18 decimals
        const balanceInUsdt = ethers.formatUnits(deployerUsdtBalance, usdtDecimals);
        console.log(`   Deployer USDT Balance: ${balanceInUsdt} USDT`);
        
        if (parseFloat(balanceInUsdt) < 30) {
            console.log("   ❌ Insufficient USDT balance. Need at least 30 USDT for Package 1");
            return;
        }
        
        console.log("\n✅ STEP 2: Check Current Registration Status");
        const deployerInfo = await contract.getUserInfo(deployer.address);
        console.log(`   Deployer Registered: ${deployerInfo.isRegistered}`);
        
        if (deployerInfo.isRegistered) {
            console.log("   ✅ Deployer is already registered!");
            const referralCode = await contract.getReferralCode(deployer.address);
            console.log(`   🔗 Deployer Referral Code: "${referralCode}"`);
            console.log(`   📱 Frontend Referral Link: https://leadfive.today/register?ref=${referralCode}`);
            return;
        }
        
        console.log("\n✅ STEP 3: Get Root User Referral Code");
        const trezorInfo = await contract.getUserInfo(trezorAddress);
        console.log(`   Trezor Registered: ${trezorInfo.isRegistered}`);
        
        if (!trezorInfo.isRegistered) {
            console.log("   ❌ Root user (Trezor) is not registered!");
            return;
        }
        
        const rootReferralCode = await contract.getReferralCode(trezorAddress);
        console.log(`   🔗 Root Referral Code: "${rootReferralCode}"`);
        
        // If root has no referral code, we'll try using address directly
        let sponsorCode = rootReferralCode;
        if (!sponsorCode || sponsorCode === "") {
            console.log("   ⚠️  Root has no referral code, will try using address directly");
            sponsorCode = trezorAddress; // Use address as fallback
        }
        
        console.log("\n✅ STEP 4: Check USDT Allowance");
        const packagePrice = ethers.parseUnits("30", usdtDecimals); // 30 USDT for Package 1
        const currentAllowance = await usdt.allowance(deployer.address, mainContractAddress);
        console.log(`   Current Allowance: ${ethers.formatUnits(currentAllowance, usdtDecimals)} USDT`);
        console.log(`   Required: ${ethers.formatUnits(packagePrice, usdtDecimals)} USDT`);
        
        if (currentAllowance < packagePrice) {
            console.log("   📝 Approving USDT spending...");
            const approveTx = await usdt.approve(mainContractAddress, packagePrice);
            console.log(`   Approval TX: ${approveTx.hash}`);
            await approveTx.wait();
            console.log("   ✅ USDT approved successfully");
        } else {
            console.log("   ✅ USDT already approved");
        }
        
        console.log("\n✅ STEP 5: Register Deployer");
        console.log(`   Registering with sponsor: ${sponsorCode}`);
        console.log("   Package Level: 1 (30 USDT)");
        
        try {
            console.log("   Method: Direct registration with sponsor address");
            console.log("   Parameters: sponsor, packageLevel=1, useUSDT=true, referralCode=''");
            
            registerTx = await contract.register(
                trezorAddress,  // sponsor
                1,              // packageLevel  
                true,           // useUSDT
                ""              // referralCode (empty since root has none)
            );
            
            console.log(`   Registration TX: ${registerTx.hash}`);
            console.log("   ⏳ Waiting for confirmation...");
            
            const receipt = await registerTx.wait();
            console.log("   ✅ Registration successful!");
            console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
            
        } catch (error) {
            console.log(`   ❌ Registration failed: ${error.message}`);
            console.log("\n🔧 Troubleshooting:");
            console.log("   - Check if root user has proper referral code");
            console.log("   - Verify USDT approval and balance");
            console.log("   - Try different registration method");
            return;
        }
        
        console.log("\n✅ STEP 6: Verify Registration and Get Referral Code");
        const newDeployerInfo = await contract.getUserInfo(deployer.address);
        console.log(`   Deployer Now Registered: ${newDeployerInfo.isRegistered}`);
        console.log(`   Package Level: ${newDeployerInfo.packageLevel}`);
        console.log(`   Referrer: ${newDeployerInfo.referrer}`);
        
        if (newDeployerInfo.isRegistered) {
            const deployerReferralCode = await contract.getReferralCode(deployer.address);
            console.log(`   🔗 New Deployer Referral Code: "${deployerReferralCode}"`);
            
            // Update stats
            const stats = await contract.getContractStats();
            console.log(`   Total Users Now: ${stats.totalUsersCount}`);
            
            console.log("\n🎉 REGISTRATION COMPLETE!");
            console.log("========================");
            console.log("📱 FRONTEND CONFIGURATION:");
            console.log(`   Contract: ${mainContractAddress}`);
            console.log(`   Deployer Address: ${deployer.address}`);
            console.log(`   Deployer Referral Code: ${deployerReferralCode}`);
            console.log(`   Root Address: ${trezorAddress}`);
            console.log(`   Root Referral Code: ${rootReferralCode || "None"}`);
            console.log("\n🔗 REFERRAL LINKS:");
            console.log(`   Deployer Link: https://leadfive.today/register?ref=${deployerReferralCode}`);
            if (rootReferralCode) {
                console.log(`   Root Link: https://leadfive.today/register?ref=${rootReferralCode}`);
            }
            
            console.log("\n✅ READY FOR FRONTEND INTEGRATION!");
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
        console.log("\n🔧 Troubleshooting:");
        console.log("1. Ensure you have 30+ USDT in deployer wallet");
        console.log("2. Check that root user (Trezor) is properly registered");
        console.log("3. Verify network connection and gas funds");
        console.log("4. Try running the script again");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
