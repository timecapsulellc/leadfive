const hre = require("hardhat");

async function main() {
    console.log("🔍 DEBUG ROOT REFERRAL CODE");
    console.log("=============================");
    
    const [deployer] = await hre.ethers.getSigners();
    const contractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Contract: ${contractAddress}`);
    
    const LeadFive = await hre.ethers.getContractFactory("LeadFiveV1_10");
    const contract = LeadFive.attach(contractAddress);
    
    const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    console.log("\n📊 Checking Trezor Address Details:");
    
    // Check if registered using getUserInfo
    const trezorInfo = await contract.getUserInfo(trezorAddress);
    const isRegistered = trezorInfo.isRegistered;
    const packageLevel = trezorInfo.packageLevel;
    const referrer = trezorInfo.referrer;
    
    console.log(`Registered: ${isRegistered}`);
    console.log(`Package: ${packageLevel}`);
    console.log(`Referrer: ${referrer}`);
    console.log(`Registration Time: ${new Date(trezorInfo.registrationTime * 1000)}`);
    
    if (isRegistered) {
        // Try to get referral code
        try {
            const referralCode = await contract.getReferralCode(trezorAddress);
            console.log(`Referral Code: "${referralCode}"`);
        } catch (e) {
            console.log(`getReferralCode failed: ${e.message}`);
        }
        
        // Get other info
        console.log(`Total Earnings: ${trezorInfo.totalEarnings}`);
        console.log(`Direct Referrals: ${trezorInfo.directReferrals}`);
        console.log(`Team Size: ${trezorInfo.teamSize}`);
    }
    
    console.log("\n📋 Total Users and Contract Stats:");
    const stats = await contract.getContractStats();
    console.log(`Total Users: ${stats.totalUsersCount}`);
    console.log(`Contract Paused: ${stats.isPaused}`);
    
    // Check deployer vs Trezor
    console.log("\n👑 Checking User Status:");
    const deployerInfo = await contract.getUserInfo(deployer.address);
    console.log(`Deployer registered: ${deployerInfo.isRegistered}`);
    
    const trezorInfo2 = await contract.getUserInfo(trezorAddress);
    console.log(`Trezor registered: ${trezorInfo2.isRegistered}`);
    
    if (trezorInfo2.isRegistered) {
        console.log("✅ Trezor appears to be the root user");
        
        // Check if referral code issue is causing registration problems
        try {
            const trezorCode = await contract.getReferralCode(trezorAddress);
            if (trezorCode === "" || trezorCode === "0x0000000000000000000000000000000000000000000000000000000000000000") {
                console.log("⚠️  Root user has empty referral code!");
                console.log("💡 Solution: We need to either:");
                console.log("   1. Allow direct admin registration of deployer");
                console.log("   2. Set a referral code for the root user");
                console.log("   3. Register deployer with USDT payment (30 USDT for package 1)");
            } else {
                console.log(`✅ Root referral code: "${trezorCode}"`);
            }
        } catch (e) {
            console.log(`Error getting Trezor referral code: ${e.message}`);
        }
    }
    
    console.log("\n✅ Debug complete");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
