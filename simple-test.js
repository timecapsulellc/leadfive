// Simple Contract Test
const { ethers } = require("hardhat");

async function testContract() {
    console.log("🔍 Simple Contract Test...\n");

    try {
        const [deployer] = await ethers.getSigners();
        console.log("Using account:", deployer.address);
        
        const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        console.log("Contract address:", contractAddress);
        
        // Load the ABI directly from the standalone-v4ultra directory
        const contractABI = require("./artifacts-v4ultra/standalone-v4ultra/OrphiCrowdFundV4UltraSecure.sol/OrphiCrowdFundV4UltraSecure.json").abi;
        
        // Connect using the ABI
        const contract = new ethers.Contract(contractAddress, contractABI, deployer);
        console.log("✅ Contract connected");
        
        // Test a simple view function
        const globalStats = await contract.getGlobalStats();
        console.log("✅ Global stats retrieved:");
        console.log(`  Users: ${globalStats[0]}`);
        console.log(`  Volume: ${ethers.formatUnits(globalStats[1], 6)} USDT`);
        console.log(`  Automation: ${globalStats[2]}`);
        console.log(`  Locked: ${globalStats[3]}`);
        
        // Test pool balances
        const poolBalances = await contract.getPoolBalances();
        console.log("✅ Pool balances retrieved:");
        console.log(`  Pools: [${poolBalances.map(b => ethers.formatUnits(b, 6)).join(", ")}]`);
        
        // Test registration
        const [, user1] = await ethers.getSigners();
        console.log("\nRegistering user:", user1.address);
        
        const tx = await contract.connect(user1).register(deployer.address, 1);
        await tx.wait();
        console.log("✅ User registered successfully");
        
        // Check user info
        const userInfo = await contract.getUserInfo(user1.address);
        console.log("✅ User info:");
        console.log(`  ID: ${userInfo.id}`);
        console.log(`  Team Size: ${userInfo.teamSize}`);
        console.log(`  Direct Count: ${userInfo.directCount}`);
        console.log(`  Package Tier: ${userInfo.packageTier}`);
        console.log(`  Total Earnings: ${ethers.formatUnits(userInfo.totalEarnings, 6)} USDT`);
        console.log(`  Withdrawable: ${ethers.formatUnits(userInfo.withdrawable, 6)} USDT`);
        console.log(`  Is Capped: ${userInfo.isCapped}`);
        console.log(`  Leader Rank: ${userInfo.leaderRank}`);
        console.log(`  Suspension Level: ${userInfo.suspensionLevel}`);
        
        // Final stats
        const finalStats = await contract.getGlobalStats();
        console.log("\n✅ Final stats:");
        console.log(`  Users: ${finalStats[0]}`);
        console.log(`  Volume: ${ethers.formatUnits(finalStats[1], 6)} USDT`);
        console.log(`  Automation: ${finalStats[2]}`);
        console.log(`  Locked: ${finalStats[3]}`);
        
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testContract();
