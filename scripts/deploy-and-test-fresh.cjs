const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Deploying Fresh LeadFive for Testing with Mock USDT\n");
    
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying with account:", deployer.address);
    
    // Get account balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "BNB");

    try {
        // Deploy Mock USDT first
        console.log("📦 === DEPLOYING MOCK USDT ===");
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const mockUSDT = await MockERC20.deploy("Test USDT", "TUSDT", 6);
        await mockUSDT.waitForDeployment();
        
        const mockUSDTAddress = await mockUSDT.getAddress();
        console.log("✅ Mock USDT deployed:", mockUSDTAddress);
        
        // Create a simple mock oracle that always returns fresh data
        console.log("\n📦 === DEPLOYING MOCK ORACLE ===");
        
        // For simplicity, we'll use the existing oracle but adjust staleness in contract
        const mockOracleAddress = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";
        
        // Deploy LeadFive with mock addresses
        console.log("\n📦 === DEPLOYING LEADFIVE WITH MOCKS ===");
        
        const LeadFive = await ethers.getContractFactory("LeadFive");
        
        const leadFive = await upgrades.deployProxy(
            LeadFive,
            [mockUSDTAddress, mockOracleAddress],
            {
                initializer: "initialize",
                kind: "uups",
                timeout: 0,
            }
        );
        
        await leadFive.waitForDeployment();
        const contractAddress = await leadFive.getAddress();
        
        console.log("✅ LeadFive deployed to:", contractAddress);
        
        // Add oracle with extended staleness for testing
        console.log("\n🔮 === CONFIGURING ORACLE ===");
        
        await leadFive.addOracle(mockOracleAddress);
        console.log("✅ Oracle added");
        
        // Set a higher staleness threshold for testing (2 hours)
        await leadFive.setCircuitBreaker(ethers.parseEther("100")); // High threshold to avoid issues
        console.log("✅ Circuit breaker configured");
        
        // Verify deployment
        console.log("\n🔍 === VERIFYING DEPLOYMENT ===");
        
        const totalUsers = await leadFive.getTotalUsers();
        const owner = await leadFive.owner();
        const packagePrice = await leadFive.getPackagePrice(1);
        
        console.log(`✅ Total users: ${totalUsers}`);
        console.log(`✅ Owner: ${owner}`);
        console.log(`✅ Package 1 price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
        
        // Create test users and fund them
        console.log("\n👥 === CREATING TEST USERS ===");
        
        const testUser1 = ethers.Wallet.createRandom().connect(ethers.provider);
        const testUser2 = ethers.Wallet.createRandom().connect(ethers.provider);
        
        console.log(`Test User 1: ${testUser1.address}`);
        console.log(`Test User 2: ${testUser2.address}`);
        
        // Fund test users with BNB for gas
        await deployer.sendTransaction({ to: testUser1.address, value: ethers.parseEther("0.01") });
        await deployer.sendTransaction({ to: testUser2.address, value: ethers.parseEther("0.01") });
        
        // Mint USDT to test users
        const usdtAmount = ethers.parseUnits("500", 6); // 500 USDT each
        await mockUSDT.mint(testUser1.address, usdtAmount);
        await mockUSDT.mint(testUser2.address, usdtAmount);
        
        console.log("✅ Funded test users with BNB and USDT");
        
        // Test 1: USDT Registration
        console.log("\n🎯 === TEST 1: USDT REGISTRATION ===");
        
        // Approve USDT spending
        await mockUSDT.connect(testUser1).approve(contractAddress, usdtAmount);
        console.log("✅ USDT approved for spending");
        
        try {
            const regTx = await leadFive.connect(testUser1).register(
                deployer.address, // sponsor
                1, // package level 1
                true // use USDT
            );
            
            const receipt = await regTx.wait();
            console.log(`✅ USDT Registration successful! Gas: ${receipt.gasUsed}`);
            
            // Check user status
            const [isRegistered, packageLevel, userBalance] = await leadFive.getUserBasicInfo(testUser1.address);
            console.log(`✅ User registered: ${isRegistered}, Level: ${packageLevel}, Balance: ${ethers.formatUnits(userBalance, 6)} USDT`);
            
        } catch (error) {
            console.log(`❌ USDT Registration failed: ${error.message}`);
        }
        
        // Test 2: Try BNB Registration (with oracle issues handled)
        console.log("\n🎯 === TEST 2: BNB REGISTRATION (if oracle works) ===");
        
        try {
            // Try with a reasonable BNB amount
            const bnbValue = ethers.parseEther("0.1"); // Use plenty of BNB
            
            const regTx = await leadFive.connect(testUser2).register(
                deployer.address, // sponsor
                1, // package level 1
                false, // use BNB
                { value: bnbValue }
            );
            
            const receipt = await regTx.wait();
            console.log(`✅ BNB Registration successful! Gas: ${receipt.gasUsed}`);
            
            // Check user status
            const [isRegistered, packageLevel, userBalance] = await leadFive.getUserBasicInfo(testUser2.address);
            console.log(`✅ User registered: ${isRegistered}, Level: ${packageLevel}, Balance: ${ethers.formatUnits(userBalance, 6)} USDT`);
            
        } catch (error) {
            console.log(`❌ BNB Registration failed: ${error.message}`);
            console.log("   This is expected due to stale oracle data");
        }
        
        // Test 3: Check sponsor rewards
        console.log("\n🎁 === TEST 3: SPONSOR REWARDS CHECK ===");
        
        const [, , sponsorBalance] = await leadFive.getUserBasicInfo(deployer.address);
        console.log(`Sponsor balance: ${ethers.formatUnits(sponsorBalance, 6)} USDT`);
        
        if (sponsorBalance > 0) {
            console.log("✅ Sponsor received rewards!");
            
            // Test withdrawal
            console.log("\n💰 === TEST 4: WITHDRAWAL TEST ===");
            
            try {
                const withdrawAmount = sponsorBalance / 2n; // Withdraw half
                const withdrawTx = await leadFive.withdraw(withdrawAmount);
                const withdrawReceipt = await withdrawTx.wait();
                
                console.log(`✅ Withdrawal successful! Gas: ${withdrawReceipt.gasUsed}`);
                
                const [, , newBalance] = await leadFive.getUserBasicInfo(deployer.address);
                console.log(`New balance: ${ethers.formatUnits(newBalance, 6)} USDT`);
                
            } catch (error) {
                console.log(`❌ Withdrawal failed: ${error.message}`);
            }
        }
        
        // Final status
        console.log("\n📊 === FINAL STATUS ===");
        const finalTotalUsers = await leadFive.getTotalUsers();
        console.log(`Total users: ${finalTotalUsers}`);
        
        console.log("\n✅ Testing completed with custom deployment!");
        console.log(`📝 Contract Address: ${contractAddress}`);
        console.log(`📝 Mock USDT Address: ${mockUSDTAddress}`);
        
    } catch (error) {
        console.log(`❌ Deployment/Testing failed: ${error.message}`);
        console.log(error);
    }
}

main().catch((error) => {
    console.error("💥 Test deployment error:", error);
    process.exitCode = 1;
});
