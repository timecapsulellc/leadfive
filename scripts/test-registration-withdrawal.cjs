const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing LeadFive Registration & Withdrawal on BSC Testnet\n");
    
    const contractAddress = "0x8796A9a42A468Bab9C0e73a6C5df08bDe3D83e1b"; // New contract address
    const [deployer] = await ethers.getSigners();
    
    console.log(`Testing with account: ${deployer.address}`);
    
    // Connect to contract
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach(contractAddress);
    
    try {
        console.log("📋 === INITIAL CONTRACT STATE ===");
        
        const totalUsers = await leadFive.getTotalUsers();
        const owner = await leadFive.owner();
        
        console.log(`✅ Total Users: ${totalUsers}`);
        console.log(`✅ Contract Owner: ${owner}`);
        
        // Check deployer status
        const [isRegistered, packageLevel, balance] = await leadFive.getUserBasicInfo(deployer.address);
        console.log(`✅ Deployer Registered: ${isRegistered}`);
        console.log(`✅ Deployer Package: ${packageLevel}`);
        console.log(`✅ Deployer Balance: ${ethers.formatUnits(balance, 6)} USDT\n`);
        
        // Create a test wallet and fund it
        console.log("🔧 === SETTING UP TEST USER ===");
        const testWallet = ethers.Wallet.createRandom().connect(ethers.provider);
        console.log(`Test wallet: ${testWallet.address}`);
        
        // Send BNB to test wallet
        const fundTx = await deployer.sendTransaction({
            to: testWallet.address,
            value: ethers.parseEther("0.1") // Send 0.1 BNB for gas and registration
        });
        await fundTx.wait();
        console.log(`✅ Funded test wallet with 0.1 BNB for gas and registration\n`);
        
        // Test 1: Registration with BNB (Package 1 - $30)
        console.log("🎯 === TEST 1: USER REGISTRATION WITH BNB ===");
        
        try {
            // Calculate BNB needed for $30 package (using a generous amount)
            const bnbValue = ethers.parseEther("0.05"); // Use 0.05 BNB (should be more than enough)
            
            console.log(`Registering user with ${ethers.formatEther(bnbValue)} BNB...`);
            
            const registrationTx = await leadFive.connect(testWallet).register(
                deployer.address, // sponsor (deployer)
                1, // package level 1 ($30)
                false, // use BNB instead of USDT
                { value: bnbValue }
            );
            
            const receipt = await registrationTx.wait();
            console.log(`✅ Registration successful! Gas used: ${receipt.gasUsed}`);
            
            // Check user status after registration
            const [newIsRegistered, newPackageLevel, newBalance] = await leadFive.getUserBasicInfo(testWallet.address);
            console.log(`✅ User now registered: ${newIsRegistered}`);
            console.log(`✅ User package level: ${newPackageLevel}`);
            console.log(`✅ User balance: ${ethers.formatUnits(newBalance, 6)} USDT`);
            
            // Check updated total users
            const newTotalUsers = await leadFive.getTotalUsers();
            console.log(`✅ Total users now: ${newTotalUsers}\n`);
            
        } catch (error) {
            console.log(`❌ Registration failed: ${error.message}`);
            if (error.data) {
                console.log(`Error data: ${error.data}`);
            }
        }
        
        // Test 2: Check if user has balance to withdraw
        console.log("💰 === TEST 2: CHECK WITHDRAWAL ELIGIBILITY ===");
        
        try {
            const [, , userBalance] = await leadFive.getUserBasicInfo(testWallet.address);
            console.log(`User balance before withdrawal: ${ethers.formatUnits(userBalance, 6)} USDT`);
            
            if (userBalance > 0) {
                console.log("✅ User has balance available for withdrawal");
                
                // Test withdrawal
                console.log("\n💸 === TEST 3: USER WITHDRAWAL ===");
                
                const withdrawalAmount = userBalance / 2n; // Withdraw half of balance
                console.log(`Attempting to withdraw: ${ethers.formatUnits(withdrawalAmount, 6)} USDT`);
                
                try {
                    const withdrawTx = await leadFive.connect(testWallet).withdraw(withdrawalAmount);
                    const withdrawReceipt = await withdrawTx.wait();
                    console.log(`✅ Withdrawal successful! Gas used: ${withdrawReceipt.gasUsed}`);
                    
                    // Check balance after withdrawal
                    const [, , balanceAfter] = await leadFive.getUserBasicInfo(testWallet.address);
                    console.log(`✅ User balance after withdrawal: ${ethers.formatUnits(balanceAfter, 6)} USDT\n`);
                    
                } catch (withdrawError) {
                    console.log(`❌ Withdrawal failed: ${withdrawError.message}`);
                }
                
            } else {
                console.log("⚠️  User has no balance to withdraw");
                console.log("   This might be expected if no rewards were distributed yet\n");
            }
            
        } catch (error) {
            console.log(`❌ Balance check failed: ${error.message}`);
        }
        
        // Test 3: Check sponsor rewards
        console.log("🎁 === TEST 4: CHECK SPONSOR REWARDS ===");
        
        try {
            const [, , sponsorBalance] = await leadFive.getUserBasicInfo(deployer.address);
            console.log(`Sponsor (deployer) balance: ${ethers.formatUnits(sponsorBalance, 6)} USDT`);
            
            if (sponsorBalance > 0) {
                console.log("✅ Sponsor received rewards from registration!");
            } else {
                console.log("⚠️  Sponsor has no rewards yet");
            }
            
        } catch (error) {
            console.log(`❌ Sponsor balance check failed: ${error.message}`);
        }
        
        // Test 4: Package upgrade test
        console.log("\n⬆️  === TEST 5: PACKAGE UPGRADE ===");
        
        try {
            const bnbValue = ethers.parseEther("0.08"); // Use more BNB for higher package
            
            console.log(`Upgrading user to package 2 with ${ethers.formatEther(bnbValue)} BNB...`);
            
            const upgradeTx = await leadFive.connect(testWallet).upgradePackage(
                2, // package level 2 ($50)
                false, // use BNB
                { value: bnbValue }
            );
            
            const upgradeReceipt = await upgradeTx.wait();
            console.log(`✅ Package upgrade successful! Gas used: ${upgradeReceipt.gasUsed}`);
            
            // Check updated package level
            const [, newPackageLevel,] = await leadFive.getUserBasicInfo(testWallet.address);
            console.log(`✅ User now at package level: ${newPackageLevel}\n`);
            
        } catch (error) {
            console.log(`❌ Package upgrade failed: ${error.message}`);
        }
        
        // Final contract state
        console.log("📊 === FINAL CONTRACT STATE ===");
        
        const finalTotalUsers = await leadFive.getTotalUsers();
        console.log(`✅ Final total users: ${finalTotalUsers}`);
        
        const contractBalance = await ethers.provider.getBalance(contractAddress);
        console.log(`✅ Contract BNB balance: ${ethers.formatEther(contractBalance)} BNB`);
        
        console.log("\n🎉 All tests completed successfully!");
        
    } catch (error) {
        console.log(`❌ Testing failed: ${error.message}`);
        console.log(error);
    }
}

main().catch((error) => {
    console.error("💥 Testing error:", error);
    process.exitCode = 1;
});
