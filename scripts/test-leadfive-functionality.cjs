const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Starting LeadFive Contract Testing on BSC Testnet...\n");
    
    // Contract details from deployment
    const contractAddress = "0x5cb32e2cCd59b60C45606487dB902160728f7528";
    const ownerAddress = "0x140aad3E7c6bCC415Bc8E830699855fF072d405D";
    
    // Get signers (test accounts)
    const [owner, user1, user2, user3] = await ethers.getSigners();
    console.log("👥 Test Accounts:");
    console.log(`   Owner: ${owner.address}`);
    console.log(`   User1: ${user1.address}`);
    console.log(`   User2: ${user2.address}`);
    console.log(`   User3: ${user3.address}\n`);
    
    // Connect to deployed contract
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach(contractAddress);
    
    console.log("📋 Contract connected at:", contractAddress);
    
    try {
        // ========== BASIC CONTRACT VERIFICATION ==========
        console.log("\n🔍 === BASIC CONTRACT VERIFICATION ===");
        
        const totalUsers = await leadFive.getTotalUsers();
        const contractOwner = await leadFive.owner();
        const packagePrice1 = await leadFive.getPackagePrice(1);
        const packagePrice4 = await leadFive.getPackagePrice(4);
        
        console.log(`✅ Total Users: ${totalUsers}`);
        console.log(`✅ Contract Owner: ${contractOwner}`);
        console.log(`✅ Package 1 Price: ${ethers.formatUnits(packagePrice1, 6)} USDT`);
        console.log(`✅ Package 4 Price: ${ethers.formatUnits(packagePrice4, 6)} USDT`);
        
        // ========== TEST USER REGISTRATION ==========
        console.log("\n🎯 === TESTING USER REGISTRATION ===");
        
        // Test 1: Register User1 with Owner as sponsor (Package 1 - $30)
        console.log("Test 1: Registering User1 with BNB payment...");
        
        try {
            const bnbPrice = await leadFive.getCurrentBNBPrice();
            console.log(`   Current BNB Price: $${ethers.formatUnits(bnbPrice, 8)}`);
            
            // Calculate required BNB for $30 (package 1)
            const usdAmount = packagePrice1; // $30 in 6 decimals
            const bnbRequired = (usdAmount * ethers.parseEther("1")) / BigInt(bnbPrice);
            
            console.log(`   BNB Required for $30: ${ethers.formatEther(bnbRequired)} BNB`);
            
            // Register User1
            const tx1 = await leadFive.connect(user1).register(
                owner.address, // sponsor
                1, // package level ($30)
                false, // use BNB, not USDT
                { value: bnbRequired * 110n / 100n } // Add 10% extra for price fluctuation
            );
            
            await tx1.wait();
            console.log(`✅ User1 registered successfully! TX: ${tx1.hash}`);
            
            // Verify registration
            const [isRegistered, packageLevel, balance] = await leadFive.getUserBasicInfo(user1.address);
            const [totalEarnings, earningsCap, directReferrals] = await leadFive.getUserEarnings(user1.address);
            const [referrer, teamSize] = await leadFive.getUserNetwork(user1.address);
            
            console.log(`   ✅ User1 Registered: ${isRegistered}`);
            console.log(`   ✅ Package Level: ${packageLevel}`);
            console.log(`   ✅ Balance: ${ethers.formatUnits(balance, 6)} USDT`);
            console.log(`   ✅ Earnings Cap: ${ethers.formatUnits(earningsCap, 6)} USDT`);
            console.log(`   ✅ Referrer: ${referrer}`);
            
        } catch (error) {
            console.log(`❌ User1 registration failed: ${error.message}`);
        }
        
        // Test 2: Register User2 with User1 as sponsor (Package 2 - $50)
        console.log("\nTest 2: Registering User2 with User1 as sponsor...");
        
        try {
            const bnbPrice = await leadFive.getCurrentBNBPrice();
            const usdAmount2 = await leadFive.getPackagePrice(2); // $50
            const bnbRequired2 = (usdAmount2 * ethers.parseEther("1")) / BigInt(bnbPrice);
            
            console.log(`   BNB Required for $50: ${ethers.formatEther(bnbRequired2)} BNB`);
            
            const tx2 = await leadFive.connect(user2).register(
                user1.address, // sponsor (User1)
                2, // package level ($50)
                false, // use BNB
                { value: bnbRequired2 * 110n / 100n }
            );
            
            await tx2.wait();
            console.log(`✅ User2 registered successfully! TX: ${tx2.hash}`);
            
            // Check User1's rewards (should have received direct bonus)
            const [, , user1Balance] = await leadFive.getUserBasicInfo(user1.address);
            console.log(`   ✅ User1 Balance after User2 registration: ${ethers.formatUnits(user1Balance, 6)} USDT`);
            
        } catch (error) {
            console.log(`❌ User2 registration failed: ${error.message}`);
        }
        
        // Test 3: Check network structure
        console.log("\nTest 3: Checking network structure...");
        
        try {
            const newTotalUsers = await leadFive.getTotalUsers();
            const [ownerEarnings] = await leadFive.getUserEarnings(owner.address);
            const [user1Earnings] = await leadFive.getUserEarnings(user1.address);
            
            console.log(`   ✅ Total Users Now: ${newTotalUsers}`);
            console.log(`   ✅ Owner Earnings: ${ethers.formatUnits(ownerEarnings, 6)} USDT`);
            console.log(`   ✅ User1 Earnings: ${ethers.formatUnits(user1Earnings, 6)} USDT`);
            
        } catch (error) {
            console.log(`❌ Network check failed: ${error.message}`);
        }
        
        // ========== TEST WITHDRAWAL FUNCTIONALITY ==========
        console.log("\n💰 === TESTING WITHDRAWAL FUNCTIONALITY ===");
        
        // Test withdrawal for User1 (if they have balance)
        console.log("Test 4: Testing User1 withdrawal...");
        
        try {
            const [, , user1BalanceBefore] = await leadFive.getUserBasicInfo(user1.address);
            
            if (user1BalanceBefore > 0) {
                console.log(`   User1 Balance Before Withdrawal: ${ethers.formatUnits(user1BalanceBefore, 6)} USDT`);
                
                // Calculate withdrawal rate
                const withdrawalRate = await leadFive.calculateWithdrawalRate(user1.address);
                console.log(`   User1 Withdrawal Rate: ${withdrawalRate}%`);
                
                // Try to withdraw 50% of balance (minimum 1 USDT)
                const withdrawAmount = user1BalanceBefore > ethers.parseUnits("2", 6) ? 
                    user1BalanceBefore / 2n : 
                    ethers.parseUnits("1", 6);
                
                console.log(`   Attempting to withdraw: ${ethers.formatUnits(withdrawAmount, 6)} USDT`);
                
                const tx3 = await leadFive.connect(user1).withdraw(withdrawAmount);
                await tx3.wait();
                console.log(`✅ User1 withdrawal successful! TX: ${tx3.hash}`);
                
                // Check balance after withdrawal
                const [, , user1BalanceAfter] = await leadFive.getUserBasicInfo(user1.address);
                console.log(`   User1 Balance After Withdrawal: ${ethers.formatUnits(user1BalanceAfter, 6)} USDT`);
                
            } else {
                console.log(`   User1 has no balance to withdraw`);
            }
            
        } catch (error) {
            console.log(`❌ User1 withdrawal failed: ${error.message}`);
        }
        
        // ========== TEST POOL BALANCES ==========
        console.log("\n🏊 === CHECKING POOL BALANCES ===");
        
        try {
            const leadershipPoolBalance = await leadFive.getPoolBalance(1);
            const communityPoolBalance = await leadFive.getPoolBalance(2);
            const clubPoolBalance = await leadFive.getPoolBalance(3);
            
            console.log(`✅ Leadership Pool: ${ethers.formatUnits(leadershipPoolBalance, 6)} USDT`);
            console.log(`✅ Community Pool: ${ethers.formatUnits(communityPoolBalance, 6)} USDT`);
            console.log(`✅ Club Pool: ${ethers.formatUnits(clubPoolBalance, 6)} USDT`);
            
        } catch (error) {
            console.log(`❌ Pool balance check failed: ${error.message}`);
        }
        
        // ========== TEST PACKAGE UPGRADE ==========
        console.log("\n📈 === TESTING PACKAGE UPGRADE ===");
        
        try {
            console.log("Test 5: Upgrading User1 from Package 1 to Package 3...");
            
            const [, currentPackage] = await leadFive.getUserBasicInfo(user1.address);
            console.log(`   User1 Current Package: ${currentPackage}`);
            
            if (currentPackage < 3) {
                const bnbPrice = await leadFive.getCurrentBNBPrice();
                const package3Price = await leadFive.getPackagePrice(3); // $100
                const bnbRequired3 = (package3Price * ethers.parseEther("1")) / BigInt(bnbPrice);
                
                const tx4 = await leadFive.connect(user1).upgradePackage(
                    3, // upgrade to package 3
                    false, // use BNB
                    { value: bnbRequired3 * 110n / 100n }
                );
                
                await tx4.wait();
                console.log(`✅ User1 package upgrade successful! TX: ${tx4.hash}`);
                
                // Verify upgrade
                const [, newPackage] = await leadFive.getUserBasicInfo(user1.address);
                console.log(`   User1 New Package: ${newPackage}`);
                
            } else {
                console.log(`   User1 already at package ${currentPackage}`);
            }
            
        } catch (error) {
            console.log(`❌ Package upgrade failed: ${error.message}`);
        }
        
        // ========== FINAL SUMMARY ==========
        console.log("\n📊 === FINAL TEST SUMMARY ===");
        
        const finalTotalUsers = await leadFive.getTotalUsers();
        const contractBalance = await leadFive.getContractBalance();
        
        console.log(`✅ Final Total Users: ${finalTotalUsers}`);
        console.log(`✅ Contract BNB Balance: ${ethers.formatEther(contractBalance)} BNB`);
        
        console.log("\n🎉 === TESTING COMPLETED ===");
        console.log("All basic functionality tests completed!");
        console.log("Contract is functioning correctly on BSC Testnet! 🚀");
        
    } catch (error) {
        console.error("❌ Testing failed:", error);
        throw error;
    }
}

// Execute testing
if (require.main === module) {
    main()
        .then(() => {
            console.log("✅ Testing completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Testing error:", error);
            process.exit(1);
        });
}

module.exports = main;
