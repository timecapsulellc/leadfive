const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("📊 LEADFIVE V1.10 - LIVE STATUS MONITOR");
        console.log("======================================");
        console.log(`⏰ ${new Date().toLocaleString()}\n`);
        
        const contractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
        const deployerAddress = "0xCeaEfDaDE5a0D574bFd5577665dC58d132995335";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        const [signer] = await ethers.getSigners();
        const contract = await ethers.getContractAt("LeadFiveV1_10", contractAddress);
        
        // Contract Status
        console.log("🔍 CONTRACT STATUS");
        console.log("-".repeat(30));
        const owner = await contract.owner();
        const stats = await contract.getContractStats();
        console.log(`Contract: ${contractAddress}`);
        console.log(`Owner: ${owner}`);
        console.log(`Total Users: ${stats.totalUsersCount}`);
        console.log(`Paused: ${stats.isPaused}`);
        
        // Balances
        console.log("\n💰 BALANCES");
        console.log("-".repeat(30));
        const contractBnb = await ethers.provider.getBalance(contractAddress);
        console.log(`Contract BNB: ${ethers.formatEther(contractBnb)} BNB`);
        
        const usdt = await ethers.getContractAt("IERC20", "0x55d398326f99059fF775485246999027B3197955");
        const contractUsdt = await usdt.balanceOf(contractAddress);
        console.log(`Contract USDT: ${ethers.formatUnits(contractUsdt, 18)} USDT`);
        
        // User Status
        console.log("\n👥 USER STATUS");
        console.log("-".repeat(30));
        
        // Trezor (Root)
        const trezorInfo = await contract.getUserInfo(trezorAddress);
        console.log(`Trezor (Root): ${trezorInfo.isRegistered ? "✅ Registered" : "❌ Not Registered"}`);
        if (trezorInfo.isRegistered) {
            console.log(`  Package: ${trezorInfo.packageLevel}`);
            console.log(`  Sponsor: ${trezorInfo.referrer}`);
            try {
                const trezorCode = await contract.getReferralCode(trezorAddress);
                console.log(`  Referral: "${trezorCode}" ${trezorCode === "" ? "(Empty - Normal)" : ""}`);
            } catch (e) {
                console.log(`  Referral: Error getting code`);
            }
        }
        
        // Deployer
        const deployerInfo = await contract.getUserInfo(deployerAddress);
        console.log(`Deployer: ${deployerInfo.isRegistered ? "✅ Registered" : "❌ Not Registered"}`);
        if (deployerInfo.isRegistered) {
            console.log(`  Package: ${deployerInfo.packageLevel}`);
            console.log(`  Sponsor: ${deployerInfo.referrer}`);
            const deployerCode = await contract.getReferralCode(deployerAddress);
            console.log(`  Referral: "${deployerCode}"`);
        }
        
        // Testing Info
        console.log("\n🔗 TESTING LINKS");
        console.log("-".repeat(30));
        if (deployerInfo.isRegistered) {
            const deployerCode = await contract.getReferralCode(deployerAddress);
            console.log(`Registration: https://leadfive.today/register?ref=${deployerCode}`);
        }
        console.log(`BSCScan: https://bscscan.com/address/${contractAddress}`);
        
        // Recent Activity (if we can detect it)
        console.log("\n📈 SYSTEM HEALTH");
        console.log("-".repeat(30));
        const totalUsers = parseInt(stats.totalUsersCount.toString());
        console.log(`Status: ${totalUsers >= 2 ? "✅ Operational" : "⚠️  Needs Attention"}`);
        console.log(`Ready for Testing: ${totalUsers >= 2 && !stats.isPaused ? "✅ Yes" : "❌ No"}`);
        console.log(`Ownership: ${owner === deployerAddress ? "✅ Deployer (Testing)" : "🔐 Transferred"}`);
        
        console.log("\n" + "=".repeat(50));
        console.log("🎯 QUICK STATUS SUMMARY");
        console.log("=".repeat(50));
        console.log(`Total Users: ${totalUsers}`);
        console.log(`Contract Owner: ${owner === deployerAddress ? "Deployer" : "Trezor"}`);
        console.log(`Testing Status: ${totalUsers >= 2 ? "Ready" : "Setup Needed"}`);
        console.log(`Last Updated: ${new Date().toLocaleString()}`);
        
    } catch (error) {
        console.error("❌ Error monitoring contract:", error.message);
        console.log("\n🔧 Troubleshooting:");
        console.log("1. Check network connection");
        console.log("2. Verify contract address");
        console.log("3. Ensure proper wallet connection");
    }
}

// Auto-refresh every 30 seconds if run with --watch flag
if (process.argv.includes('--watch')) {
    console.log("🔄 Auto-refresh mode enabled (every 30 seconds)");
    console.log("Press Ctrl+C to stop\n");
    
    const runPeriodically = () => {
        main().catch(console.error);
        setTimeout(runPeriodically, 30000);
    };
    
    runPeriodically();
} else {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
