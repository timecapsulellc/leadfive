// Test Dashboard Integration
// Register users and test data display in dashboard

const { ethers } = require("hardhat");

async function main() {
    console.log("🎯 Testing Dashboard Integration...\n");

    try {
        // Contract addresses
        const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const mockUSDTAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        
        // Get signers
        const [deployer, user1, user2, user3] = await ethers.getSigners();
        
        console.log("📋 Test Setup:");
        console.log(`Contract: ${contractAddress}`);
        console.log(`MockUSDT: ${mockUSDTAddress}`);
        console.log(`Admin: ${deployer.address}`);
        console.log(`User1: ${user1.address}`);
        console.log(`User2: ${user2.address}`);
        console.log(`User3: ${user3.address}\n`);

        // Connect to contract
        const contract = await ethers.getContractAt("OrphiCrowdFundV4UltraSecure", contractAddress, deployer);
        
        console.log("✅ Connected to contract");
        
        // Test basic contract functions
        console.log("\n🔍 Testing Contract Functions:");
        
        // Get global stats
        try {
            const globalStats = await contract.getGlobalStats();
            console.log(`Global Stats: Users=${globalStats[0]}, Volume=${ethers.formatUnits(globalStats[1], 6)}, Automation=${globalStats[2]}, Locked=${ethers.formatUnits(globalStats[3], 6)}`);
        } catch (error) {
            console.log("❌ getGlobalStats failed:", error.message);
        }
        
        // Get pool balances
        try {
            const poolBalances = await contract.getPoolBalances();
            console.log(`Pool Balances: [${poolBalances.map(b => ethers.formatUnits(b, 6)).join(", ")}]`);
        } catch (error) {
            console.log("❌ getPoolBalances failed:", error.message);
        }
        
        // Register test users
        console.log("\n👥 Registering Test Users:");
        
        try {
            // Register user1 with admin as sponsor, tier 1
            const tx1 = await contract.connect(user1).register(deployer.address, 1);
            await tx1.wait();
            console.log("✅ User1 registered");
            
            // Register user2 with user1 as sponsor, tier 2
            const tx2 = await contract.connect(user2).register(user1.address, 2);
            await tx2.wait();
            console.log("✅ User2 registered");
            
            // Register user3 with user2 as sponsor, tier 3
            const tx3 = await contract.connect(user3).register(user2.address, 3);
            await tx3.wait();
            console.log("✅ User3 registered");
            
        } catch (error) {
            console.log("❌ User registration failed:", error.message);
        }
        
        // Check user info
        console.log("\n📊 User Information:");
        
        for (const [name, user] of [["User1", user1], ["User2", user2], ["User3", user3]]) {
            try {
                const userInfo = await contract.getUserInfo(user.address);
                console.log(`${name}: Sponsor=${userInfo[0]}, Tier=${userInfo[1]}, Status=${userInfo[2]}, Referrals=${userInfo[3]}`);
            } catch (error) {
                console.log(`❌ ${name} info failed:`, error.message);
            }
        }
        
        // Final global stats
        console.log("\n📈 Final Global Stats:");
        try {
            const finalStats = await contract.getGlobalStats();
            console.log(`Users: ${finalStats[0]}`);
            console.log(`Volume: ${ethers.formatUnits(finalStats[1], 6)} USDT`);
            console.log(`Automation: ${finalStats[2]}`);
            console.log(`Locked: ${ethers.formatUnits(finalStats[3], 6)} USDT`);
        } catch (error) {
            console.log("❌ Final stats failed:", error.message);
        }
        
        console.log("\n🎉 Dashboard Integration Test Complete!");
        console.log("💡 Dashboard should now display live data at: http://localhost:5181");
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
