const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Simple Registration Test for LeadFive Contract\n");
    
    const contractAddress = "0x5cb32e2cCd59b60C45606487dB902160728f7528";
    const [owner, user1] = await ethers.getSigners();
    
    console.log(`Testing with Owner: ${owner.address}`);
    console.log(`Testing with User1: ${user1.address}\n`);
    
    // Connect to contract
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach(contractAddress);
    
    try {
        // Check initial state
        console.log("📋 Initial Contract State:");
        const totalUsers = await leadFive.getTotalUsers();
        const packagePrice = await leadFive.getPackagePrice(1);
        console.log(`   Total Users: ${totalUsers}`);
        console.log(`   Package 1 Price: ${ethers.formatUnits(packagePrice, 6)} USDT\n`);
        
        // Check if User1 is already registered
        const [isRegistered] = await leadFive.getUserBasicInfo(user1.address);
        
        if (isRegistered) {
            console.log("✅ User1 is already registered!");
            
            // Show user details
            const [, packageLevel, balance] = await leadFive.getUserBasicInfo(user1.address);
            const [totalEarnings, earningsCap, directReferrals] = await leadFive.getUserEarnings(user1.address);
            
            console.log(`   Package Level: ${packageLevel}`);
            console.log(`   Balance: ${ethers.formatUnits(balance, 6)} USDT`);
            console.log(`   Total Earnings: ${ethers.formatUnits(totalEarnings, 6)} USDT`);
            console.log(`   Earnings Cap: ${ethers.formatUnits(earningsCap, 6)} USDT`);
            console.log(`   Direct Referrals: ${directReferrals}`);
            
            // Test withdrawal if user has balance
            if (balance > 0) {
                console.log(`\n💰 Testing Withdrawal...`);
                const withdrawalRate = await leadFive.calculateWithdrawalRate(user1.address);
                console.log(`   Withdrawal Rate: ${withdrawalRate}%`);
                
                const withdrawAmount = balance > ethers.parseUnits("2", 6) ? 
                    ethers.parseUnits("1", 6) : balance / 2n;
                
                console.log(`   Attempting to withdraw: ${ethers.formatUnits(withdrawAmount, 6)} USDT`);
                
                try {
                    const tx = await leadFive.connect(user1).withdraw(withdrawAmount);
                    await tx.wait();
                    console.log(`✅ Withdrawal successful! TX: ${tx.hash}`);
                    
                    const [, , newBalance] = await leadFive.getUserBasicInfo(user1.address);
                    console.log(`   New Balance: ${ethers.formatUnits(newBalance, 6)} USDT`);
                } catch (error) {
                    console.log(`❌ Withdrawal failed: ${error.message}`);
                }
            }
            
        } else {
            console.log("🎯 Registering User1...");
            
            // Get BNB price for calculation
            try {
                const bnbPrice = await leadFive.getCurrentBNBPrice();
                console.log(`   Current BNB Price: $${ethers.formatUnits(bnbPrice, 8)}`);
                
                // Calculate BNB needed for $30 package
                const bnbRequired = (packagePrice * ethers.parseEther("1")) / BigInt(bnbPrice);
                console.log(`   BNB Required: ${ethers.formatEther(bnbRequired)} BNB`);
                
                // Register with extra BNB for gas and price fluctuation
                const tx = await leadFive.connect(user1).register(
                    owner.address, // sponsor
                    1, // package level
                    false, // use BNB
                    { value: bnbRequired * 120n / 100n } // 20% extra
                );
                
                await tx.wait();
                console.log(`✅ Registration successful! TX: ${tx.hash}`);
                
                // Verify registration
                const [regConfirmed, packageLevel, balance] = await leadFive.getUserBasicInfo(user1.address);
                console.log(`   Registered: ${regConfirmed}`);
                console.log(`   Package Level: ${packageLevel}`);
                console.log(`   Initial Balance: ${ethers.formatUnits(balance, 6)} USDT`);
                
            } catch (error) {
                console.log(`❌ Registration failed: ${error.message}`);
                
                // Try with a simpler approach - using more BNB
                console.log("🔄 Trying with more BNB...");
                try {
                    const tx = await leadFive.connect(user1).register(
                        owner.address,
                        1,
                        false,
                        { value: ethers.parseEther("0.1") } // Use 0.1 BNB
                    );
                    await tx.wait();
                    console.log(`✅ Registration successful with 0.1 BNB! TX: ${tx.hash}`);
                } catch (err2) {
                    console.log(`❌ Second attempt failed: ${err2.message}`);
                }
            }
        }
        
        // Final state check
        console.log("\n📊 Final State:");
        const finalUsers = await leadFive.getTotalUsers();
        console.log(`   Total Users: ${finalUsers}`);
        
    } catch (error) {
        console.error("❌ Test failed:", error);
        throw error;
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = main;
