const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 LeadFive Contract State Check on BSC Testnet\n");
    
    const contractAddress = "0x5cb32e2cCd59b60C45606487dB902160728f7528";
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`Connected with account: ${deployer.address}`);
    
    // Check account balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${ethers.formatEther(balance)} BNB\n`);
    
    // Connect to contract
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach(contractAddress);
    
    try {
        console.log("📋 === CONTRACT STATE VERIFICATION ===");
        
        // Basic contract info
        const totalUsers = await leadFive.getTotalUsers();
        const owner = await leadFive.owner();
        const isAdmin = await leadFive.isAdmin(deployer.address);
        
        console.log(`✅ Total Users: ${totalUsers}`);
        console.log(`✅ Contract Owner: ${owner}`);
        console.log(`✅ Deployer is Admin: ${isAdmin}`);
        
        // Package prices
        console.log("\n💰 Package Prices:");
        for (let i = 1; i <= 4; i++) {
            const price = await leadFive.getPackagePrice(i);
            console.log(`   Package ${i}: ${ethers.formatUnits(price, 6)} USDT`);
        }
        
        // Pool balances
        console.log("\n🏊 Pool Balances:");
        const leadershipPool = await leadFive.getPoolBalance(1);
        const communityPool = await leadFive.getPoolBalance(2);
        const clubPool = await leadFive.getPoolBalance(3);
        
        console.log(`   Leadership Pool: ${ethers.formatUnits(leadershipPool, 6)} USDT`);
        console.log(`   Community Pool: ${ethers.formatUnits(communityPool, 6)} USDT`);
        console.log(`   Club Pool: ${ethers.formatUnits(clubPool, 6)} USDT`);
        
        // Contract balances
        console.log("\n💳 Contract Balances:");
        const contractBnbBalance = await leadFive.getContractBalance();
        console.log(`   BNB Balance: ${ethers.formatEther(contractBnbBalance)} BNB`);
        
        // Oracle price
        try {
            const bnbPrice = await leadFive.getCurrentBNBPrice();
            console.log(`   Current BNB Price: $${ethers.formatUnits(bnbPrice, 8)}`);
        } catch (error) {
            console.log(`   BNB Price: Error fetching (${error.message})`);
        }
        
        // Deployer user info
        console.log("\n👤 Deployer User Info:");
        const [isRegistered, packageLevel, userBalance] = await leadFive.getUserBasicInfo(deployer.address);
        const [totalEarnings, earningsCap, directReferrals] = await leadFive.getUserEarnings(deployer.address);
        const [referrer, teamSize] = await leadFive.getUserNetwork(deployer.address);
        
        console.log(`   Registered: ${isRegistered}`);
        console.log(`   Package Level: ${packageLevel}`);
        console.log(`   Balance: ${ethers.formatUnits(userBalance, 6)} USDT`);
        console.log(`   Total Earnings: ${ethers.formatUnits(totalEarnings, 6)} USDT`);
        console.log(`   Earnings Cap: ${ethers.formatUnits(earningsCap || 0, 6)} USDT`);
        console.log(`   Direct Referrals: ${directReferrals}`);
        console.log(`   Team Size: ${teamSize}`);
        console.log(`   Referrer: ${referrer}`);
        
        console.log("\n✅ === CONTRACT STATE CHECK COMPLETED ===");
        
        // Now let's try a simple registration test
        console.log("\n🎯 === TESTING REGISTRATION FUNCTION ===");
        
        // Create a test wallet
        const testWallet = ethers.Wallet.createRandom().connect(ethers.provider);
        console.log(`Test wallet created: ${testWallet.address}`);
        
        // Send some BNB to test wallet for registration
        console.log("Sending BNB to test wallet...");
        
        const sendTx = await deployer.sendTransaction({
            to: testWallet.address,
            value: ethers.parseEther("0.05") // Send 0.05 BNB
        });
        await sendTx.wait();
        console.log(`✅ Sent 0.05 BNB to test wallet`);
        
        // Check if test wallet can register
        const testBalance = await ethers.provider.getBalance(testWallet.address);
        console.log(`Test wallet balance: ${ethers.formatEther(testBalance)} BNB`);
        
        // Try registration
        try {
            console.log("Attempting registration...");
            
            const regTx = await leadFive.connect(testWallet).register(
                deployer.address, // sponsor (deployer)
                1, // package level 1 ($30)
                false, // use BNB not USDT
                { 
                    value: ethers.parseEther("0.02"), // Use 0.02 BNB for registration
                    gasLimit: 500000 // Set explicit gas limit
                }
            );
            
            await regTx.wait();
            console.log(`✅ Registration successful! TX: ${regTx.hash}`);
            
            // Verify registration
            const [newUserRegistered, newUserPackage, newUserBalance] = await leadFive.getUserBasicInfo(testWallet.address);
            console.log(`   Test user registered: ${newUserRegistered}`);
            console.log(`   Test user package: ${newUserPackage}`);
            console.log(`   Test user balance: ${ethers.formatUnits(newUserBalance, 6)} USDT`);
            
            // Check if deployer received rewards
            const [, , deployerNewBalance] = await leadFive.getUserBasicInfo(deployer.address);
            console.log(`   Deployer new balance: ${ethers.formatUnits(deployerNewBalance, 6)} USDT`);
            
            // Check new total users
            const newTotalUsers = await leadFive.getTotalUsers();
            console.log(`   New total users: ${newTotalUsers}`);
            
        } catch (error) {
            console.log(`❌ Registration failed: ${error.message}`);
            
            // Let's check what the error might be
            if (error.message.includes("Invalid price feed")) {
                console.log("🔧 Trying to add a working oracle...");
                
                try {
                    // Try to add a BSC testnet price feed
                    const addOracleTx = await leadFive.addOracle("0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526");
                    await addOracleTx.wait();
                    console.log("✅ Oracle added successfully");
                    
                    // Try registration again
                    const regTx2 = await leadFive.connect(testWallet).register(
                        deployer.address,
                        1,
                        false,
                        { value: ethers.parseEther("0.02") }
                    );
                    await regTx2.wait();
                    console.log(`✅ Registration successful after oracle fix! TX: ${regTx2.hash}`);
                    
                } catch (oracleError) {
                    console.log(`❌ Oracle fix failed: ${oracleError.message}`);
                }
            }
        }
        
        console.log("\n🎉 === TESTING COMPLETED ===");
        
    } catch (error) {
        console.error("❌ Contract state check failed:", error);
        throw error;
    }
}

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
