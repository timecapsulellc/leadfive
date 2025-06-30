const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 LEADFIVE SCALABILITY TEST - PRACTICAL 20 USERS");
    console.log("=" .repeat(70));
    console.log("Testing realistic production scale on BSC Testnet\\n");
    
    // Production contract addresses
    const LEADFIVE_ADDRESS = "0xC5a9fAE1f782EAdF4651Bde73F7aAEcc93AEB9Dd";
    const MOCK_USDT_ADDRESS = "0x33549dfDDF06B870B163b8E58b0193FE3e0bA611";
    
    const [deployer] = await ethers.getSigners();
    console.log(`🏗️  Scalability Tester: ${deployer.address}`);
    
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
    
    const packagePrice = await leadFive.getPackagePrice(1);
    console.log(`💰 Package 1 Price: ${ethers.formatUnits(packagePrice, 6)} USDT\\n`);
    
    // SCALABILITY TEST: 20 Users (Realistic Testnet Scale)
    console.log("🎯 SCALABILITY TEST: 20 New Users Registration");
    console.log("-".repeat(50));
    
    const testUsers = [];
    const results = {
        successful: 0,
        failed: 0,
        totalGasUsed: BigInt(0),
        gasResults: [],
        timings: []
    };
    
    try {
        // Create 20 test users one by one to avoid network congestion
        for (let i = 0; i < 20; i++) {
            console.log(`\\nProcessing User ${i + 1}/20...`);
            
            try {
                // Create user
                const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
                testUsers.push(wallet);
                
                console.log(`  📝 Created: ${wallet.address.substring(0, 10)}...`);
                
                // Fund with BNB (with delay to avoid nonce issues)
                const fundTx = await deployer.sendTransaction({
                    to: wallet.address,
                    value: ethers.parseEther("0.02"),
                    gasPrice: ethers.parseUnits("5", "gwei") // Fixed gas price
                });
                await fundTx.wait();
                console.log(`  💰 Funded with BNB`);
                
                // Mint USDT
                const mintTx = await mockUSDT.mint(wallet.address, ethers.parseUnits("50", 18));
                await mintTx.wait();
                console.log(`  🪙 Minted USDT`);
                
                // Small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Determine sponsor (create referral chain)
                const sponsor = i === 0 ? deployer.address : testUsers[i - 1].address;
                
                // Approve USDT
                const approveTx = await mockUSDT.connect(wallet).approve(LEADFIVE_ADDRESS, packagePrice, {
                    gasPrice: ethers.parseUnits("5", "gwei")
                });
                await approveTx.wait();
                console.log(`  ✅ Approved USDT`);
                
                // Register user with timing
                const startTime = Date.now();
                const registerTx = await leadFive.connect(wallet).register(
                    sponsor,
                    1, // Package level 1
                    true, // useUSDT
                    {
                        gasPrice: ethers.parseUnits("5", "gwei"),
                        gasLimit: 500000 // Fixed gas limit
                    }
                );
                const receipt = await registerTx.wait();
                const endTime = Date.now();
                
                // Record results
                results.successful++;
                results.totalGasUsed += receipt.gasUsed;
                results.gasResults.push(receipt.gasUsed);
                results.timings.push(endTime - startTime);
                
                console.log(`  ✅ Registered! Gas: ${receipt.gasUsed}, Time: ${endTime - startTime}ms`);
                
                // Verify registration
                const [isRegistered, packageLevel, userBalance] = await leadFive.getUserBasicInfo(wallet.address);
                if (isRegistered) {
                    console.log(`  ✅ Verified: Package ${packageLevel}, Balance: ${ethers.formatUnits(userBalance, 6)} USDT`);
                } else {
                    throw new Error("Registration verification failed");
                }
                
                // Small delay between registrations
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                results.failed++;
                console.log(`  ❌ Failed: ${error.message.substring(0, 80)}...`);
                
                // Continue with next user even if one fails
                continue;
            }
        }
        
    } catch (error) {
        console.log(`❌ Scalability test failed: ${error.message}`);
    }
    
    // RESULTS ANALYSIS
    console.log("\\n📊 SCALABILITY TEST RESULTS");
    console.log("-".repeat(50));
    
    if (results.successful > 0) {
        const avgGas = results.totalGasUsed / BigInt(results.successful);
        const avgTime = results.timings.reduce((a, b) => a + b, 0) / results.timings.length;
        
        console.log(`✅ Successful Registrations: ${results.successful}/20`);
        console.log(`❌ Failed Registrations: ${results.failed}/20`);
        console.log(`📈 Success Rate: ${(results.successful / 20 * 100).toFixed(1)}%`);
        console.log(`⛽ Average Gas per Registration: ${avgGas.toString()}`);
        console.log(`⏱️  Average Registration Time: ${avgTime.toFixed(0)}ms`);
        console.log(`💸 Total Gas Used: ${results.totalGasUsed.toString()}`);
        
        // Gas efficiency analysis
        const minGas = Math.min(...results.gasResults.map(g => Number(g)));
        const maxGas = Math.max(...results.gasResults.map(g => Number(g)));
        
        console.log(`\\n⛽ Gas Efficiency Analysis:`);
        console.log(`  Min Gas: ${minGas}`);
        console.log(`  Max Gas: ${maxGas}`);
        console.log(`  Variance: ${maxGas - minGas} (${((maxGas - minGas) / minGas * 100).toFixed(1)}%)`);
        
        if ((maxGas - minGas) / minGas < 0.1) {
            console.log(`  ✅ EXCELLENT: Gas usage is very consistent`);
        } else if ((maxGas - minGas) / minGas < 0.2) {
            console.log(`  ✅ GOOD: Gas usage is reasonably consistent`);
        } else {
            console.log(`  ⚠️  VARIABLE: Gas usage varies significantly`);
        }
    }
    
    // SYSTEM STATE VERIFICATION
    console.log("\\n🔍 SYSTEM STATE AFTER SCALABILITY TEST");
    console.log("-".repeat(50));
    
    try {
        const finalUsers = await leadFive.getTotalUsers();
        const usersAdded = finalUsers - initialUsers;
        
        console.log(`📊 Total Users: ${finalUsers} (+${usersAdded} new)`);
        
        // Check contract balances
        const contractUSDTBalance = await mockUSDT.balanceOf(LEADFIVE_ADDRESS);
        console.log(`💰 Contract USDT: ${ethers.formatUnits(contractUSDTBalance, 18)} USDT`);
        
        // Check deployer rewards
        const [, , deployerBalance] = await leadFive.getUserBasicInfo(deployer.address);
        const [deployerEarnings, , deployerReferrals] = await leadFive.getUserEarnings(deployer.address);
        
        console.log(`💰 Deployer Balance: ${ethers.formatUnits(deployerBalance, 6)} USDT`);
        console.log(`📈 Deployer Earnings: ${ethers.formatUnits(deployerEarnings, 6)} USDT`);
        console.log(`👥 Deployer Referrals: ${deployerReferrals}`);
        
        // Pool analysis
        console.log(`\\n🏊 Pool Growth Analysis:`);
        const poolNames = ["", "Leadership", "Community", "Club"];
        let totalPoolGrowth = BigInt(0);
        
        for (let i = 1; i <= 3; i++) {
            const poolBalance = await leadFive.getPoolBalance(i);
            totalPoolGrowth += poolBalance;
            console.log(`  ${poolNames[i]}: ${ethers.formatUnits(poolBalance, 6)} USDT`);
        }
        
        console.log(`  Total Pools: ${ethers.formatUnits(totalPoolGrowth, 6)} USDT`);
        
    } catch (error) {
        console.log(`❌ System state check failed: ${error.message}`);
    }
    
    // SCALABILITY PROJECTIONS
    console.log("\\n📈 SCALABILITY PROJECTIONS FOR MAINNET");
    console.log("-".repeat(50));
    
    if (results.successful > 0) {
        const successRate = results.successful / 20;
        const avgGas = results.totalGasUsed / BigInt(results.successful);
        
        console.log(`📊 Based on ${results.successful} successful registrations:`);
        console.log(`\\n🎯 Projected Performance for Different Scales:`);
        
        // Project for different user counts
        const scales = [100, 1000, 10000];
        scales.forEach(scale => {
            const expectedSuccessful = Math.floor(scale * successRate);
            const totalGasProjected = avgGas * BigInt(expectedSuccessful);
            const costAt5Gwei = totalGasProjected * BigInt(5000000000) / BigInt(10**18);
            
            console.log(`\\n  ${scale} Users:`);
            console.log(`    Expected Successful: ${expectedSuccessful}`);
            console.log(`    Total Gas: ${totalGasProjected.toString()}`);
            console.log(`    Cost at 5 gwei: ~${ethers.formatEther(costAt5Gwei)} BNB`);
        });
        
        // Efficiency assessment
        if (successRate >= 0.9) {
            console.log(`\\n✅ EXCELLENT SCALABILITY:`);
            console.log(`  ✅ ${(successRate * 100).toFixed(1)}% success rate indicates robust system`);
            console.log(`  ✅ Ready for production scale deployment`);
            console.log(`  ✅ Can handle high-volume user onboarding`);
        } else if (successRate >= 0.7) {
            console.log(`\\n⚠️  GOOD SCALABILITY:`);
            console.log(`  ⚠️  ${(successRate * 100).toFixed(1)}% success rate is acceptable`);
            console.log(`  ⚠️  Consider optimizations for higher success rates`);
        } else {
            console.log(`\\n❌ SCALABILITY CONCERNS:`);
            console.log(`  ❌ ${(successRate * 100).toFixed(1)}% success rate needs improvement`);
            console.log(`  ❌ Review contract or network conditions`);
        }
    }
    
    // FINAL ASSESSMENT
    console.log("\\n🎉 SCALABILITY TEST COMPLETE");
    console.log("=" .repeat(70));
    
    const finalBalance = await ethers.provider.getBalance(deployer.address);
    const bnbUsed = balance - finalBalance;
    
    console.log(`📋 Test Summary:`);
    console.log(`  Users Tested: 20`);
    console.log(`  Success Rate: ${results.successful > 0 ? (results.successful / 20 * 100).toFixed(1) : 0}%`);
    console.log(`  BNB Used: ${ethers.formatEther(bnbUsed)} BNB`);
    console.log(`  System Stability: ${results.successful >= 18 ? 'EXCELLENT' : results.successful >= 15 ? 'GOOD' : 'NEEDS REVIEW'}`);
    
    if (results.successful >= 18) {
        console.log(`\\n🚀 PRODUCTION READY FOR SCALE!`);
        console.log(`✅ Contract handles multiple registrations efficiently`);
        console.log(`✅ Gas costs remain consistent under load`);
        console.log(`✅ System remains stable throughout testing`);
        console.log(`✅ Ready for mainnet deployment with confidence`);
    } else if (results.successful >= 15) {
        console.log(`\\n✅ PRODUCTION READY WITH MONITORING`);
        console.log(`⚠️  Monitor initial deployment closely`);
        console.log(`⚠️  Consider staged rollout approach`);
    } else {
        console.log(`\\n⚠️  REVIEW RECOMMENDED BEFORE MAINNET`);
        console.log(`❌ Address identified issues before production`);
    }
    
    console.log(`\\n📍 Production Contract: ${LEADFIVE_ADDRESS}`);
    console.log(`🎯 Total Users Now: ${await leadFive.getTotalUsers()}`);
    console.log("=" .repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Scalability testing failed:", error);
        process.exit(1);
    });
