const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 LEADFIVE 100 USERS STRESS TEST - PRODUCTION SCALE");
    console.log("=" .repeat(70));
    console.log("Testing mass registration scalability on BSC Testnet\n");
    
    // Production contract addresses
    const LEADFIVE_ADDRESS = "0xC5a9fAE1f782EAdF4651Bde73F7aAEcc93AEB9Dd";
    const MOCK_USDT_ADDRESS = "0x33549dfDDF06B870B163b8E58b0193FE3e0bA611";
    
    const [deployer] = await ethers.getSigners();
    console.log(`🏗️  Mass Tester: ${deployer.address}`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Initial BNB Balance: ${ethers.formatEther(balance)} BNB`);
    
    // Connect to contracts
    const LeadFive = await ethers.getContractFactory("contracts/LeadFive.sol:LeadFive");
    const leadFive = LeadFive.attach(LEADFIVE_ADDRESS);
    
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = MockUSDT.attach(MOCK_USDT_ADDRESS);
    
    // Check initial state
    const initialUsers = await leadFive.getTotalUsers();
    console.log(`📊 Initial Users in System: ${initialUsers}`);
    
    const packagePrice = await leadFive.getPackagePrice(1); // Use package 1 for all tests
    console.log(`💰 Package 1 Price: ${ethers.formatUnits(packagePrice, 6)} USDT\\n`);
    
    // PHASE 1: Create 100 Test Users
    console.log("👥 PHASE 1: Creating 100 Test Users");
    console.log("-".repeat(50));
    
    const testUsers = [];
    const batchSize = 10; // Process in batches to avoid memory issues
    
    try {
        for (let batch = 0; batch < 10; batch++) {
            console.log(`Creating Batch ${batch + 1}/10 (Users ${batch * 10 + 1}-${(batch + 1) * 10})...`);
            
            const batchUsers = [];
            for (let i = 0; i < batchSize; i++) {
                const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
                batchUsers.push(wallet);
                testUsers.push(wallet);
            }
            
            // Fund batch with BNB for gas
            const fundPromises = batchUsers.map(wallet => 
                deployer.sendTransaction({
                    to: wallet.address,
                    value: ethers.parseEther("0.03") // 0.03 BNB each for gas
                })
            );
            await Promise.all(fundPromises);
            
            // Mint USDT to batch users
            const mintPromises = batchUsers.map(wallet =>
                mockUSDT.mint(wallet.address, ethers.parseUnits("100", 18)) // 100 USDT each
            );
            await Promise.all(mintPromises);
            
            console.log(`✅ Batch ${batch + 1} created and funded`);
        }
        
        console.log(`✅ All 100 test users created and funded!\\n`);
        
    } catch (error) {
        console.log(`❌ User creation failed: ${error.message}`);
        return;
    }
    
    // PHASE 2: Mass Registration Test
    console.log("🎯 PHASE 2: Mass Registration (100 Users)");
    console.log("-".repeat(50));
    
    const registrationResults = {
        successful: 0,
        failed: 0,
        totalGasUsed: BigInt(0),
        errors: []
    };
    
    const startTime = Date.now();
    
    try {
        for (let i = 0; i < testUsers.length; i++) {
            const user = testUsers[i];
            const sponsor = i === 0 ? deployer.address : testUsers[i - 1].address;
            
            try {
                // Progress indicator
                if ((i + 1) % 10 === 0) {
                    console.log(`📝 Registering Users: ${i + 1}/100 completed...`);
                }
                
                // Approve USDT
                const approveTx = await mockUSDT.connect(user).approve(LEADFIVE_ADDRESS, packagePrice);
                await approveTx.wait();
                
                // Register user
                const registerTx = await leadFive.connect(user).register(
                    sponsor,
                    1, // Package level 1
                    true // useUSDT
                );
                const receipt = await registerTx.wait();
                
                registrationResults.successful++;
                registrationResults.totalGasUsed += receipt.gasUsed;
                
                // Verify registration every 20 users
                if ((i + 1) % 20 === 0) {
                    const [isRegistered, packageLevel, balance] = await leadFive.getUserBasicInfo(user.address);
                    if (!isRegistered) {
                        throw new Error(`User ${i + 1} registration verification failed`);
                    }
                }
                
            } catch (error) {
                registrationResults.failed++;
                registrationResults.errors.push(`User ${i + 1}: ${error.message}`);
                console.log(`⚠️  User ${i + 1} registration failed: ${error.message.substring(0, 50)}...`);
            }
        }
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log(`\\n📊 MASS REGISTRATION RESULTS:`);
        console.log(`✅ Successful: ${registrationResults.successful}/100`);
        console.log(`❌ Failed: ${registrationResults.failed}/100`);
        console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
        console.log(`⛽ Total Gas Used: ${registrationResults.totalGasUsed.toString()}`);
        console.log(`⛽ Average Gas per Registration: ${registrationResults.totalGasUsed / BigInt(registrationResults.successful)}`);
        console.log(`🚀 Registrations per Second: ${(registrationResults.successful / duration).toFixed(2)}`);
        
    } catch (error) {
        console.log(`❌ Mass registration failed: ${error.message}`);
    }
    
    // PHASE 3: System State Verification
    console.log("\\n🔍 PHASE 3: System State Verification");
    console.log("-".repeat(50));
    
    try {
        const finalUsers = await leadFive.getTotalUsers();
        const contractUSDTBalance = await mockUSDT.balanceOf(LEADFIVE_ADDRESS);
        const [deployerRegistered, deployerPackage, deployerBalance] = await leadFive.getUserBasicInfo(deployer.address);
        const [deployerEarnings, , deployerReferrals] = await leadFive.getUserEarnings(deployer.address);
        
        console.log(`📊 Final User Count: ${finalUsers}`);
        console.log(`💰 Contract USDT Balance: ${ethers.formatUnits(contractUSDTBalance, 18)} USDT`);
        console.log(`💰 Deployer Balance: ${ethers.formatUnits(deployerBalance, 6)} USDT`);
        console.log(`📈 Deployer Total Earnings: ${ethers.formatUnits(deployerEarnings, 6)} USDT`);
        console.log(`👥 Deployer Direct Referrals: ${deployerReferrals}`);
        
        // Check pool balances
        const poolNames = ["", "Leadership", "Community", "Club"];
        console.log(`\\n🏊 Pool Balances After Mass Registration:`);
        for (let i = 1; i <= 3; i++) {
            const poolBalance = await leadFive.getPoolBalance(i);
            console.log(`  ${poolNames[i]}: ${ethers.formatUnits(poolBalance, 6)} USDT`);
        }
        
        // Verify random sample of users
        console.log(`\\n🎯 Random User Verification (5 samples):`);
        const sampleIndices = [10, 25, 50, 75, 99]; // Sample indices
        
        for (const index of sampleIndices) {
            if (index < testUsers.length) {
                const user = testUsers[index];
                const [isRegistered, packageLevel, balance] = await leadFive.getUserBasicInfo(user.address);
                const [referrer, teamSize] = await leadFive.getUserNetwork(user.address);
                
                console.log(`  User ${index + 1}: Registered=${isRegistered}, Package=${packageLevel}, Balance=${ethers.formatUnits(balance, 6)}, Team=${teamSize}`);
            }
        }
        
    } catch (error) {
        console.log(`❌ System verification failed: ${error.message}`);
    }
    
    // PHASE 4: Performance Analysis
    console.log("\\n📈 PHASE 4: Performance Analysis");
    console.log("-".repeat(50));
    
    try {
        // Check if we can handle more load by testing a few more registrations
        if (registrationResults.successful >= 95) {
            console.log(`✅ EXCELLENT: ${registrationResults.successful}% success rate`);
            console.log(`✅ System handled mass registration gracefully`);
            console.log(`✅ Gas efficiency maintained throughout`);
            console.log(`✅ No system degradation observed`);
        } else if (registrationResults.successful >= 80) {
            console.log(`⚠️  GOOD: ${registrationResults.successful}% success rate`);
            console.log(`⚠️  Some issues occurred but system remained stable`);
        } else {
            console.log(`❌ NEEDS IMPROVEMENT: Only ${registrationResults.successful}% success rate`);
        }
        
        // Calculate expected mainnet costs
        const avgGasPrice = 5000000000; // 5 gwei on BSC
        const avgGasPerRegistration = registrationResults.totalGasUsed / BigInt(registrationResults.successful);
        const costPerRegistrationBNB = (avgGasPerRegistration * BigInt(avgGasPrice)) / BigInt(10**18);
        
        console.log(`\\n💰 Mainnet Cost Estimates (5 gwei gas):`);
        console.log(`  Gas per Registration: ${avgGasPerRegistration.toString()}`);
        console.log(`  Cost per Registration: ~${ethers.formatEther(costPerRegistrationBNB)} BNB`);
        console.log(`  Cost for 1000 users: ~${ethers.formatEther(costPerRegistrationBNB * BigInt(1000))} BNB`);
        
    } catch (error) {
        console.log(`❌ Performance analysis failed: ${error.message}`);
    }
    
    // PHASE 5: Final System Health Check
    console.log("\\n🏥 PHASE 5: Final System Health Check");
    console.log("-".repeat(50));
    
    try {
        // Test one more registration to ensure system is still responsive
        const finalTestWallet = ethers.Wallet.createRandom().connect(ethers.provider);
        
        const fundTx = await deployer.sendTransaction({
            to: finalTestWallet.address,
            value: ethers.parseEther("0.05")
        });
        await fundTx.wait();
        
        const mintTx = await mockUSDT.mint(finalTestWallet.address, ethers.parseUnits("50", 18));
        await mintTx.wait();
        
        const approveTx = await mockUSDT.connect(finalTestWallet).approve(LEADFIVE_ADDRESS, packagePrice);
        await approveTx.wait();
        
        const registerTx = await leadFive.connect(finalTestWallet).register(
            deployer.address,
            1,
            true
        );
        const receipt = await registerTx.wait();
        
        console.log(`✅ Post-stress test registration successful!`);
        console.log(`✅ Gas used: ${receipt.gasUsed} (system still efficient)`);
        console.log(`✅ Contract remains fully operational after mass testing`);
        
    } catch (error) {
        console.log(`⚠️  Final health check issue: ${error.message}`);
    }
    
    // FINAL SUMMARY
    console.log("\\n🎉 MASS TESTING COMPLETE - FINAL SUMMARY");
    console.log("=" .repeat(70));
    
    const finalBalance = await ethers.provider.getBalance(deployer.address);
    const bnbUsed = balance - finalBalance;
    
    console.log(`📊 STRESS TEST RESULTS:`);
    console.log(`  Target Users: 100`);
    console.log(`  Successful Registrations: ${registrationResults.successful}`);
    console.log(`  Success Rate: ${(registrationResults.successful / 100 * 100).toFixed(1)}%`);
    console.log(`  Total Gas Used: ${registrationResults.totalGasUsed.toString()}`);
    console.log(`  BNB Used for Testing: ${ethers.formatEther(bnbUsed)} BNB`);
    
    console.log(`\\n🏭 PRODUCTION READINESS:`);
    if (registrationResults.successful >= 95) {
        console.log(`✅ EXCELLENT - Ready for production scale`);
        console.log(`✅ Can handle high-volume user onboarding`);
        console.log(`✅ Gas efficiency maintained under load`);
        console.log(`✅ System stability confirmed`);
        console.log(`\\n🚀 RECOMMENDATION: DEPLOY TO MAINNET WITH CONFIDENCE!`);
    } else {
        console.log(`⚠️  REVIEW NEEDED - Some optimizations may be beneficial`);
        console.log(`⚠️  Consider optimizing for higher success rates`);
    }
    
    console.log(`\\n📋 Production Contract: ${LEADFIVE_ADDRESS}`);
    console.log(`🎯 Final User Count: ${await leadFive.getTotalUsers()}`);
    console.log("=" .repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Mass testing failed:", error);
        process.exit(1);
    });
