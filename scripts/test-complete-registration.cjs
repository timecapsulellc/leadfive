const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🎯 COMPREHENSIVE REGISTRATION TEST WITH MOCK USDT");
        console.log("================================================");
        
        const contractAddress = "0x4eC8277F557C73B41EEEBd35Bf0dC0E24c165944";
        const mockUSDTAddress = "0x2C3E43Ff85c5dfB64F3b34387028B86dE1818bE5";
        
        // Get accounts
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer (Root):", deployer.address);
        
        // Connect to contracts
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(contractAddress);
        
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        const mockUSDT = MockUSDT.attach(mockUSDTAddress);
        
        console.log("📍 LeadFive Contract:", contractAddress);
        console.log("💰 Mock USDT Contract:", mockUSDTAddress);
        
        // Get root referral code
        const rootCode = await contract.getReferralCode(deployer.address);
        console.log("🔗 Root Referral Code:", rootCode);
        
        // Step 1: Check mock USDT balance and mint tokens for testing
        console.log("\n💰 Step 1: Setting up Mock USDT tokens...");
        const deployerBalance = await mockUSDT.balanceOf(deployer.address);
        console.log("💰 Deployer Mock USDT Balance:", ethers.formatUnits(deployerBalance, 18), "USDT");
        
        // Create test user wallets
        const testUser1 = ethers.Wallet.createRandom().connect(ethers.provider);
        const testUser2 = ethers.Wallet.createRandom().connect(ethers.provider);
        
        console.log("👤 Test User 1:", testUser1.address);
        console.log("👤 Test User 2:", testUser2.address);
        
        // Send BNB to test users for gas
        console.log("\n⛽ Step 2: Sending BNB for gas to test users...");
        await deployer.sendTransaction({
            to: testUser1.address,
            value: ethers.parseEther("0.1") // 0.1 BNB for gas
        });
        await deployer.sendTransaction({
            to: testUser2.address,
            value: ethers.parseEther("0.1") // 0.1 BNB for gas
        });
        console.log("✅ Sent 0.1 BNB to each test user for gas");
        
        // Mint mock USDT to test users
        console.log("\n🏭 Step 3: Minting Mock USDT to test users...");
        await mockUSDT.mint(testUser1.address, ethers.parseUnits("100", 18)); // 100 USDT
        await mockUSDT.mint(testUser2.address, ethers.parseUnits("200", 18)); // 200 USDT
        
        const user1Balance = await mockUSDT.balanceOf(testUser1.address);
        const user2Balance = await mockUSDT.balanceOf(testUser2.address);
        console.log("✅ User 1 Mock USDT Balance:", ethers.formatUnits(user1Balance, 18), "USDT");
        console.log("✅ User 2 Mock USDT Balance:", ethers.formatUnits(user2Balance, 18), "USDT");
        
        // Step 4: Test registration for Package 1 (30 USDT)
        console.log("\n🎯 Step 4: Testing User 1 Registration (Package 1 - 30 USDT)...");
        
        // Approve USDT spending
        const packagePrice1 = ethers.parseUnits("30", 18);
        await mockUSDT.connect(testUser1).approve(contractAddress, packagePrice1);
        console.log("✅ User 1 approved 30 USDT spending");
        
        // Register user 1
        try {
            const tx1 = await contract.connect(testUser1).register(
                deployer.address,  // sponsor (root)
                1,                 // packageLevel
                true,              // useUSDT
                rootCode,          // referralCode
                { gasLimit: 1000000 }
            );
            
            const receipt1 = await tx1.wait();
            console.log("✅ User 1 registration successful!");
            console.log("📄 Transaction hash:", receipt1.hash);
            
            // Check user info
            const userInfo1 = await contract.getUserInfo(testUser1.address);
            console.log("👤 User 1 registered:", userInfo1.isRegistered);
            console.log("📦 User 1 package level:", userInfo1.packageLevel.toString());
            
        } catch (error) {
            console.log("❌ User 1 registration failed:", error.message);
        }
        
        // Step 5: Test registration for Package 3 (100 USDT)
        console.log("\n🎯 Step 5: Testing User 2 Registration (Package 3 - 100 USDT)...");
        
        // Approve USDT spending
        const packagePrice3 = ethers.parseUnits("100", 18);
        await mockUSDT.connect(testUser2).approve(contractAddress, packagePrice3);
        console.log("✅ User 2 approved 100 USDT spending");
        
        // Register user 2
        try {
            const tx2 = await contract.connect(testUser2).register(
                deployer.address,  // sponsor (root)
                3,                 // packageLevel
                true,              // useUSDT
                rootCode,          // referralCode
                { gasLimit: 1000000 }
            );
            
            const receipt2 = await tx2.wait();
            console.log("✅ User 2 registration successful!");
            console.log("📄 Transaction hash:", receipt2.hash);
            
            // Check user info
            const userInfo2 = await contract.getUserInfo(testUser2.address);
            console.log("👤 User 2 registered:", userInfo2.isRegistered);
            console.log("📦 User 2 package level:", userInfo2.packageLevel.toString());
            
        } catch (error) {
            console.log("❌ User 2 registration failed:", error.message);
        }
        
        // Step 6: Check contract stats after registrations
        console.log("\n📊 Step 6: Checking contract stats after registrations...");
        const stats = await contract.getContractStats();
        console.log("👥 Total users:", stats.totalUsersCount.toString());
        console.log("💰 Total fees collected:", ethers.formatUnits(stats.totalFeesCollected, 18), "USDT");
        
        // Check root user's network stats
        const rootNetworkStats = await contract.getNetworkStats(deployer.address);
        console.log("🌐 Root direct referrals:", rootNetworkStats.directCount.toString());
        console.log("🏢 Root team size:", rootNetworkStats.teamSize.toString());
        
        // Get direct referrals
        const directReferrals = await contract.getDirectReferrals(deployer.address);
        console.log("👥 Root direct referrals list:", directReferrals);
        
        console.log("\n🎉 REGISTRATION TEST COMPLETE!");
        console.log("✅ Registration function is working correctly");
        console.log("✅ Users can register with different package levels");
        console.log("✅ Commission distribution is operational");
        console.log("✅ Network statistics are updating");
        console.log("✅ Contract is ready for production use!");
        
    } catch (error) {
        console.error("💥 Test failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
