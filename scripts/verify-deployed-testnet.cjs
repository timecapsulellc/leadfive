const { ethers, upgrades } = require("hardhat");

async function main() {
    try {
        console.log("🔍 VERIFYING DEPLOYED LEADFIVE V1.10 ON BSC TESTNET");
        console.log("============================================================");
        
        const contractAddress = "0x4eC8277F557C73B41EEEBd35Bf0dC0E24c165944";
        
        // Get the contract factory
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        
        // Connect to the deployed contract
        const contract = LeadFiveV1_10.attach(contractAddress);
        
        console.log("📍 Contract address:", contractAddress);
        
        // Get implementation address
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
        console.log("🔧 Implementation address:", implementationAddress);
        
        // Check initial state
        const stats = await contract.getContractStats();
        const owner = await contract.owner();
        console.log("👥 Total users:", stats.totalUsers.toString());
        console.log("💰 Total volume:", ethers.formatUnits(stats.totalVolume, 18), "USDT");
        console.log("👑 Contract owner:", owner);
        
        // Test package prices
        console.log("\n📦 Package prices:");
        for (let i = 1; i <= 4; i++) {
            const packageInfo = await contract.getPackageInfo(i);
            console.log(`   Package ${i}: ${ethers.formatUnits(packageInfo.price, 18)} USDT`);
        }
        
        // Test pool info
        console.log("\n🏊 Pool information:");
        for (let i = 1; i <= 4; i++) {
            const poolInfo = await contract.getPoolInfo(i);
            console.log(`   Pool ${i}: Total Reward: ${ethers.formatUnits(poolInfo.totalReward, 18)} USDT`);
        }
        
        console.log("\n✅ Contract verification complete!");
        console.log("\n📋 Contract is ready for:");
        console.log("   - User registration");
        console.log("   - Package purchases");
        console.log("   - Commission distribution");
        console.log("   - Admin functions");
        
        // Update .env file with contract address
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(__dirname, '..', '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Update or add testnet contract address
        if (envContent.includes('TESTNET_CONTRACT_ADDRESS=')) {
            envContent = envContent.replace(/TESTNET_CONTRACT_ADDRESS=.*/g, `TESTNET_CONTRACT_ADDRESS=${contractAddress}`);
        } else {
            envContent += `\nTESTNET_CONTRACT_ADDRESS=${contractAddress}`;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log("📝 Updated .env with testnet contract address");
        
    } catch (error) {
        console.error("💥 Verification failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
