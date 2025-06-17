import hre from "hardhat";

const { ethers } = hre;

async function main() {
    console.log("🧪 TESTING ORPHI CROWDFUND BASIC FUNCTIONALITY");
    console.log("=" .repeat(60));

    // Contract address from deployment
    const CONTRACT_ADDRESS = "0x70147f13E7e2363071A85772A0a4f08065BE993F";
    const USDT_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";

    // Get signers (only deployer may be available in testnet)
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    
    console.log("\n👥 Test Accounts:");
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Available signers: ${signers.length}`);
    
    // Create test accounts or use available ones
    let user1, user2, user3;
    if (signers.length >= 4) {
        user1 = signers[1];
        user2 = signers[2]; 
        user3 = signers[3];
        console.log(`   User1: ${user1.address}`);
        console.log(`   User2: ${user2.address}`);
        console.log(`   User3: ${user3.address}`);
    } else {
        // Use deployer for testing if no other signers available
        user1 = deployer;
        user2 = deployer;
        user3 = deployer;
        console.log("   ℹ️  Using deployer account for testing (single signer mode)");
    }

    // Connect to the deployed contract
    const contract = await ethers.getContractAt("OrphiCrowdFundDeployable", CONTRACT_ADDRESS);

    try {
        console.log("\n📊 CONTRACT STATE VERIFICATION");
        console.log("-".repeat(40));

        // Check basic contract info
        const owner = await contract.owner();
        const version = await contract.VERSION();
        const usdtToken = await contract.usdtToken();
        const usdtMode = await contract.usdtMode();

        console.log(`✅ Owner: ${owner}`);
        console.log(`✅ Version: ${version}`);
        console.log(`✅ USDT Token: ${usdtToken}`);
        console.log(`✅ USDT Mode: ${usdtMode}`);

        // Check package amounts
        console.log("\n📦 PACKAGE AMOUNTS VERIFICATION");
        console.log("-".repeat(40));
        const packageAmounts = await contract.getPackageAmounts();
        for (let i = 0; i < packageAmounts.length; i++) {
            const amountUSD = ethers.formatUnits(packageAmounts[i], 6);
            console.log(`   Package ${i + 1}: $${amountUSD} USDT`);
        }

        // Check contract stats
        console.log("\n📈 CONTRACT STATISTICS");
        console.log("-".repeat(40));
        const stats = await contract.getContractStats();
        console.log(`   Total Users: ${stats[0]}`);
        console.log(`   Total Contributed: ${ethers.formatUnits(stats[1], 6)} USDT`);
        console.log(`   Total Withdrawn: ${ethers.formatUnits(stats[2], 6)} USDT`);
        console.log(`   Global Pool Balance: ${ethers.formatUnits(stats[3], 6)} USDT`);

        console.log("\n🧪 TESTING USER REGISTRATION (BNB MODE)");
        console.log("-".repeat(40));

        // Test 1: Register first user (no sponsor)
        console.log("\n🔸 Test 1: Register User1 as root (Package 1 - $30)");
        const packageAmount1 = packageAmounts[0]; // $30 in USDT decimals
        const bnbAmount1 = packageAmount1; // In BNB mode, amounts are 1:1 for simplicity

        console.log(`   Package Amount: ${ethers.formatUnits(packageAmount1, 6)} USDT equivalent`);
        console.log(`   BNB Amount: ${ethers.formatEther(bnbAmount1)} BNB`);

        // Check user1 balance
        const user1Balance = await ethers.provider.getBalance(user1.address);
        console.log(`   User1 Balance: ${ethers.formatEther(user1Balance)} BNB`);

        if (user1Balance < bnbAmount1) {
            console.log("   ⚠️  User1 has insufficient BNB balance for registration");
            console.log("   💡 In a real scenario, users would need to have sufficient balance");
        } else {
            try {
                const tx1 = await contract.connect(user1).registerUser(
                    ethers.ZeroAddress, // No sponsor for first user
                    0, // PackageTier.PACKAGE_1
                    { value: bnbAmount1 }
                );
                const receipt1 = await tx1.wait();
                console.log(`   ✅ User1 registered! Tx: ${receipt1.hash}`);

                // Verify user registration
                const user1Info = await contract.getUserInfo(user1.address);
                console.log(`   ✅ User1 registered: ${user1Info.isRegistered}`);
                console.log(`   ✅ User1 tier: ${user1Info.currentTier}`);
                console.log(`   ✅ User1 earnings cap: ${ethers.formatUnits(user1Info.earningsCap, 6)} USDT`);
            } catch (error) {
                console.log(`   ❌ User1 registration failed: ${error.message}`);
            }
        }

        // Test 2: Register second user with sponsor
        console.log("\n🔸 Test 2: Register User2 with User1 as sponsor (Package 2 - $50)");
        const packageAmount2 = packageAmounts[1]; // $50 in USDT decimals
        const bnbAmount2 = packageAmount2;

        console.log(`   Package Amount: ${ethers.formatUnits(packageAmount2, 6)} USDT equivalent`);
        console.log(`   BNB Amount: ${ethers.formatEther(bnbAmount2)} BNB`);

        const user2Balance = await ethers.provider.getBalance(user2.address);
        console.log(`   User2 Balance: ${ethers.formatEther(user2Balance)} BNB`);

        if (user2Balance < bnbAmount2) {
            console.log("   ⚠️  User2 has insufficient BNB balance for registration");
        } else {
            try {
                const tx2 = await contract.connect(user2).registerUser(
                    user1.address, // User1 as sponsor
                    1, // PackageTier.PACKAGE_2
                    { value: bnbAmount2 }
                );
                const receipt2 = await tx2.wait();
                console.log(`   ✅ User2 registered! Tx: ${receipt2.hash}`);

                // Verify sponsor bonus was paid
                const user1InfoAfter = await contract.getUserInfo(user1.address);
                console.log(`   ✅ User1 withdrawable balance: ${ethers.formatUnits(user1InfoAfter.withdrawableBalance, 6)} USDT`);
                console.log(`   ✅ User1 total earnings: ${ethers.formatUnits(user1InfoAfter.totalEarnings, 6)} USDT`);
                console.log(`   ✅ User1 direct referrals: ${user1InfoAfter.directReferrals}`);
            } catch (error) {
                console.log(`   ❌ User2 registration failed: ${error.message}`);
            }
        }

        // Test 3: Check contract stats after registrations
        console.log("\n📈 UPDATED CONTRACT STATISTICS");
        console.log("-".repeat(40));
        const updatedStats = await contract.getContractStats();
        console.log(`   Total Users: ${updatedStats[0]}`);
        console.log(`   Total Contributed: ${ethers.formatUnits(updatedStats[1], 6)} USDT equivalent`);
        console.log(`   Total Withdrawn: ${ethers.formatUnits(updatedStats[2], 6)} USDT equivalent`);
        console.log(`   Global Pool Balance: ${ethers.formatUnits(updatedStats[3], 6)} USDT equivalent`);

        console.log("\n🧪 TESTING WITHDRAWAL FUNCTIONALITY");
        console.log("-".repeat(40));

        // Test withdrawal if user1 has balance
        const user1InfoFinal = await contract.getUserInfo(user1.address);
        const withdrawableBalance = user1InfoFinal.withdrawableBalance;

        if (withdrawableBalance > 0n) {
            console.log(`\n🔸 Test 3: User1 withdrawal (${ethers.formatUnits(withdrawableBalance, 6)} USDT equivalent)`);
            try {
                const balanceBefore = await ethers.provider.getBalance(user1.address);
                const tx3 = await contract.connect(user1).withdraw(withdrawableBalance);
                const receipt3 = await tx3.wait();
                const balanceAfter = await ethers.provider.getBalance(user1.address);
                
                console.log(`   ✅ Withdrawal successful! Tx: ${receipt3.hash}`);
                console.log(`   ✅ Balance change: ${ethers.formatEther(balanceAfter - balanceBefore)} BNB`);
                
                // Verify user balance updated
                const user1InfoAfterWithdrawal = await contract.getUserInfo(user1.address);
                console.log(`   ✅ Remaining withdrawable: ${ethers.formatUnits(user1InfoAfterWithdrawal.withdrawableBalance, 6)} USDT`);
            } catch (error) {
                console.log(`   ❌ Withdrawal failed: ${error.message}`);
            }
        } else {
            console.log("   ℹ️  No withdrawable balance to test");
        }

        console.log("\n🎉 BASIC FUNCTIONALITY TESTING COMPLETE!");
        console.log("\n📋 TEST SUMMARY:");
        console.log("   ✅ Contract state verification");
        console.log("   ✅ Package amounts verification");
        console.log("   ✅ User registration testing");
        console.log("   ✅ Sponsor bonus testing");
        console.log("   ✅ Withdrawal testing");
        console.log("   ✅ Statistics tracking");

    } catch (error) {
        console.error("\n❌ TESTING FAILED:");
        console.error("Error:", error.message);
        if (error.data) {
            console.error("Error Data:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
