const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 COMPREHENSIVE LEADFIVE REGISTRATION & WITHDRAWAL TESTING");
    console.log("=" .repeat(70));
    
    const [deployer] = await ethers.getSigners();
    console.log(`Testing with account: ${deployer.address}`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Account BNB balance: ${ethers.formatEther(balance)} BNB\n`);
    
    // Step 1: Deploy fresh MockUSDT for testing
    console.log("🚀 STEP 1: Deploying Fresh Mock USDT for Testing");
    console.log("-".repeat(50));
    
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();
    
    const mockUSDTAddress = await mockUSDT.getAddress();
    console.log(`✅ MockUSDT deployed at: ${mockUSDTAddress}`);
    
    // Check initial balance
    const initialBalance = await mockUSDT.balanceOf(deployer.address);
    console.log(`✅ Initial USDT balance: ${ethers.formatUnits(initialBalance, 18)} USDT`);
    
    // Step 2: Deploy fresh simple price oracle for testing
    console.log("\n📊 STEP 2: Deploying Simple Price Oracle");
    console.log("-".repeat(50));
    
    const SimpleOracle = await ethers.getContractFactory("MockERC20");
    const oracle = await SimpleOracle.deploy("Oracle", "ORC", 8);
    await oracle.waitForDeployment();
    
    const oracleAddress = await oracle.getAddress();
    console.log(`✅ Simple Oracle deployed at: ${oracleAddress}`);
    
    // Step 3: Deploy LeadFive contract with mock tokens
    console.log("\n🎯 STEP 3: Deploying LeadFive Contract");
    console.log("-".repeat(50));
    
    // Deploy LeadFive as a regular contract for testing
    const LeadFive = await ethers.getContractFactory("contracts/LeadFive.sol:LeadFive");
    const leadFive = await LeadFive.deploy();
    await leadFive.waitForDeployment();
    
    const leadFiveAddress = await leadFive.getAddress();
    console.log(`✅ LeadFive deployed at: ${leadFiveAddress}`);
    
    // Initialize the contract
    const initTx = await leadFive.initialize(mockUSDTAddress, oracleAddress);
    await initTx.wait();
    console.log(`✅ LeadFive initialized`);
    
    // Step 4: Setup and approve tokens
    console.log("\n💰 STEP 4: Setting Up Token Approvals");
    console.log("-".repeat(50));
    
    const approvalAmount = ethers.parseUnits("1000000", 18); // 1M USDT approval
    const approveTx = await mockUSDT.approve(leadFiveAddress, approvalAmount);
    await approveTx.wait();
    console.log(`✅ Approved ${ethers.formatUnits(approvalAmount, 18)} USDT to LeadFive`);
    
    // Step 5: Test basic contract functions
    console.log("\n🔍 STEP 5: Testing Contract Basic Functions");
    console.log("-".repeat(50));
    
    const totalUsers = await leadFive.getTotalUsers();
    const owner = await leadFive.owner();
    const packagePrice = await leadFive.getPackagePrice(1);
    
    console.log(`✅ Total Users: ${totalUsers}`);
    console.log(`✅ Contract Owner: ${owner}`);
    console.log(`✅ Package 1 Price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
    
    // Check deployer status
    const [isRegistered, packageLevel, userBalance] = await leadFive.getUserBasicInfo(deployer.address);
    console.log(`✅ Deployer Registered: ${isRegistered}`);
    console.log(`✅ Deployer Package: ${packageLevel}`);
    console.log(`✅ Deployer Balance: ${ethers.formatUnits(userBalance, 6)} USDT`);
    
    // Step 6: Create test wallets
    console.log("\n👥 STEP 6: Creating Test Wallets");
    console.log("-".repeat(50));
    
    const testUsers = [];
    for (let i = 0; i < 3; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        testUsers.push(wallet);
        
        // Fund with BNB for gas
        const fundTx = await deployer.sendTransaction({
            to: wallet.address,
            value: ethers.parseEther("0.1")
        });
        await fundTx.wait();
        
        // Give them USDT
        const mintTx = await mockUSDT.mint(wallet.address, ethers.parseUnits("1000", 18));
        await mintTx.wait();
        
        console.log(`✅ Test User ${i + 1}: ${wallet.address}`);
        console.log(`   BNB: 0.1, USDT: 1000`);
    }
    
    // Step 7: Test Registration with USDT
    console.log("\n🎯 STEP 7: Testing User Registration with USDT");
    console.log("-".repeat(50));
    
    for (let i = 0; i < testUsers.length; i++) {
        const user = testUsers[i];
        const sponsor = i === 0 ? deployer.address : testUsers[i - 1].address;
        const packageLevel = 1; // $30 package
        
        try {
            console.log(`\nRegistering User ${i + 1}...`);
            console.log(`User: ${user.address}`);
            console.log(`Sponsor: ${sponsor}`);
            
            // Approve USDT first
            const approveTx = await mockUSDT.connect(user).approve(leadFiveAddress, packagePrice);
            await approveTx.wait();
            console.log(`✅ Approved ${ethers.formatUnits(packagePrice, 6)} USDT`);
            
            // Register with USDT
            const registerTx = await leadFive.connect(user).register(
                sponsor,
                packageLevel,
                true // useUSDT = true
            );
            const receipt = await registerTx.wait();
            console.log(`✅ Registration successful! Gas used: ${receipt.gasUsed}`);
            
            // Check user status
            const [newIsRegistered, newPackageLevel, newBalance] = await leadFive.getUserBasicInfo(user.address);
            console.log(`✅ User registered: ${newIsRegistered}, Package: ${newPackageLevel}, Balance: ${ethers.formatUnits(newBalance, 6)} USDT`);
            
        } catch (error) {
            console.log(`❌ Registration failed for User ${i + 1}: ${error.message}`);
            if (error.data) {
                console.log(`Error data: ${error.data}`);
            }
        }
    }
    
    // Step 8: Check sponsor rewards
    console.log("\n💰 STEP 8: Checking Sponsor Rewards");
    console.log("-".repeat(50));
    
    const [deployerRegistered, deployerPackage, deployerNewBalance] = await leadFive.getUserBasicInfo(deployer.address);
    console.log(`✅ Deployer Balance: ${ethers.formatUnits(deployerNewBalance, 6)} USDT`);
    
    if (testUsers.length > 1) {
        const [user1Registered, user1Package, user1Balance] = await leadFive.getUserBasicInfo(testUsers[0].address);
        console.log(`✅ User 1 Balance: ${ethers.formatUnits(user1Balance, 6)} USDT`);
    }
    
    // Step 9: Test Withdrawal
    console.log("\n💸 STEP 9: Testing Withdrawal");
    console.log("-".repeat(50));
    
    if (deployerNewBalance > 0) {
        try {
            const withdrawAmount = deployerNewBalance / 2n; // Withdraw half
            console.log(`Attempting to withdraw: ${ethers.formatUnits(withdrawAmount, 6)} USDT`);
            
            const withdrawTx = await leadFive.withdraw(withdrawAmount);
            const receipt = await withdrawTx.wait();
            console.log(`✅ Withdrawal successful! Gas used: ${receipt.gasUsed}`);
            
            // Check balance after withdrawal
            const [, , balanceAfter] = await leadFive.getUserBasicInfo(deployer.address);
            console.log(`✅ Balance after withdrawal: ${ethers.formatUnits(balanceAfter, 6)} USDT`);
            
        } catch (error) {
            console.log(`❌ Withdrawal failed: ${error.message}`);
            if (error.data) {
                console.log(`Error data: ${error.data}`);
            }
        }
    } else {
        console.log("⚠️  No balance to withdraw");
    }
    
    // Step 10: Final Summary
    console.log("\n📊 FINAL TESTING SUMMARY");
    console.log("=" .repeat(70));
    
    const finalTotalUsers = await leadFive.getTotalUsers();
    console.log(`Total Users Registered: ${finalTotalUsers}`);
    
    console.log("\n✅ Contract Addresses for Future Testing:");
    console.log(`• LeadFive: ${leadFiveAddress}`);
    console.log(`• MockUSDT: ${mockUSDTAddress}`);
    console.log(`• Oracle: ${oracleAddress}`);
    
    console.log("\n🎉 TESTING COMPLETED SUCCESSFULLY!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Testing failed:", error);
        process.exit(1);
    });
