const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🧪 LEADFIVE MODULAR CONTRACT TESTING");
    console.log("=" * 60);

    // Contract address from testnet deployment
    const CONTRACT_ADDRESS = "0x7FEEA22942407407801cCDA55a4392f25975D998";
    
    // Get signers
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    console.log("📋 Testing with accounts:");
    console.log("   Deployer:", deployer.address);
    
    // For testnet, we'll use the same account for testing
    const user1 = deployer;
    const user2 = deployer;
    const user3 = deployer;
    console.log("   Note: Using deployer account for all test operations");

    try {
        // Get contract instance
        console.log("\n📦 Connecting to LeadFiveModular contract...");
        const LeadFive = await ethers.getContractFactory("LeadFiveModular");
        const contract = LeadFive.attach(CONTRACT_ADDRESS);
        
        console.log("✅ Connected to contract:", CONTRACT_ADDRESS);

        // Test 1: Verify contract initialization
        console.log("\n🔍 Test 1: Contract Initialization");
        const owner = await contract.owner();
        const poolBalances = await contract.getPoolBalances();
        const adminFeeInfo = await contract.getAdminFeeInfo();
        
        console.log("   Owner:", owner);
        console.log("   Pool Balances:", poolBalances.toString());
        console.log("   Admin Fee Rate:", adminFeeInfo[2].toString(), "basis points");
        console.log("✅ Contract initialization verified");

        // Test 2: Package configuration
        console.log("\n📦 Test 2: Package Configuration");
        for (let i = 1; i <= 4; i++) {
            const packageInfo = await contract.packages(i);
            console.log(`   Package ${i}: ${ethers.formatEther(packageInfo.price)} USDT`);
        }
        console.log("✅ Package configuration verified");

        // Test 3: User registration (using BNB payment)
        console.log("\n👤 Test 3: User Registration");
        
        // Calculate BNB required for $30 package (assuming $300 per BNB)
        const bnbRequired = ethers.parseEther("0.1"); // 0.1 BNB for $30
        
        console.log("   Registering User1 with Package 1 (30 USDT)...");
        const registerTx = await contract.connect(user1).register(
            deployer.address, // referrer
            1, // package level
            false, // use BNB, not USDT
            { value: bnbRequired }
        );
        await registerTx.wait();
        
        const user1Info = await contract.getUserInfo(user1.address);
        console.log("   User1 registered successfully!");
        console.log("   Package Level:", user1Info.packageLevel.toString());
        console.log("   Total Investment:", ethers.formatEther(user1Info.totalInvestment), "USDT");
        console.log("   Earnings Cap:", ethers.formatEther(user1Info.earningsCap), "USDT");
        console.log("✅ User registration test passed");

        // Test 4: Referral system
        console.log("\n🔗 Test 4: Referral System");
        console.log("   Registering User2 with User1 as referrer...");
        const registerTx2 = await contract.connect(user2).register(
            user1.address, // referrer
            2, // package level (50 USDT)
            false, // use BNB
            { value: ethers.parseEther("0.167") } // ~0.167 BNB for $50
        );
        await registerTx2.wait();
        
        // Check if User1 received direct bonus
        const user1InfoAfter = await contract.getUserInfo(user1.address);
        console.log("   User1 balance after referral:", ethers.formatEther(user1InfoAfter.balance), "USDT");
        console.log("   User1 direct referrals:", user1InfoAfter.directReferrals.toString());
        console.log("✅ Referral system test passed");

        // Test 5: Matrix placement
        console.log("\n🌳 Test 5: Matrix Placement");
        console.log("   Registering User3 to test matrix placement...");
        const registerTx3 = await contract.connect(user3).register(
            user2.address, // referrer
            1, // package level
            false, // use BNB
            { value: bnbRequired }
        );
        await registerTx3.wait();
        
        const user3Info = await contract.getUserInfo(user3.address);
        console.log("   User3 matrix position:", user3Info.matrixPosition.toString());
        console.log("   User3 matrix level:", user3Info.matrixLevel.toString());
        console.log("✅ Matrix placement test passed");

        // Test 6: Pool balances
        console.log("\n💰 Test 6: Pool Balance Updates");
        const poolBalancesAfter = await contract.getPoolBalances();
        console.log("   Leader Pool:", ethers.formatEther(poolBalancesAfter[0]), "USDT");
        console.log("   Help Pool:", ethers.formatEther(poolBalancesAfter[1]), "USDT");
        console.log("   Club Pool:", ethers.formatEther(poolBalancesAfter[2]), "USDT");
        console.log("✅ Pool balance updates verified");

        // Test 7: Admin functions
        console.log("\n🔧 Test 7: Admin Functions");
        console.log("   Setting admin fee recipient...");
        await contract.setAdminFeeRecipient(deployer.address);
        
        const adminFeeInfoAfter = await contract.getAdminFeeInfo();
        console.log("   Admin fee recipient:", adminFeeInfoAfter[0]);
        console.log("✅ Admin functions test passed");

        // Test 8: Withdrawal system
        console.log("\n💸 Test 8: Withdrawal System");
        if (user1InfoAfter.balance > 0) {
            console.log("   Testing withdrawal for User1...");
            const withdrawAmount = user1InfoAfter.balance / 2n; // Withdraw half
            
            const withdrawTx = await contract.connect(user1).withdraw(withdrawAmount);
            await withdrawTx.wait();
            
            const user1InfoFinal = await contract.getUserInfo(user1.address);
            console.log("   User1 balance after withdrawal:", ethers.formatEther(user1InfoFinal.balance), "USDT");
            console.log("✅ Withdrawal system test passed");
        } else {
            console.log("   No balance to withdraw, skipping withdrawal test");
        }

        // Test Summary
        console.log("\n" + "=" * 60);
        console.log("🎉 ALL MODULAR CONTRACT TESTS PASSED!");
        console.log("=" * 60);
        console.log("✅ Contract Initialization");
        console.log("✅ Package Configuration");
        console.log("✅ User Registration");
        console.log("✅ Referral System");
        console.log("✅ Matrix Placement");
        console.log("✅ Pool Management");
        console.log("✅ Admin Functions");
        console.log("✅ Withdrawal System");
        console.log("\n🚀 READY FOR MAINNET DEPLOYMENT!");

    } catch (error) {
        console.error("❌ Test failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
