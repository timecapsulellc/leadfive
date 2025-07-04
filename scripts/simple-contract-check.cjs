const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🔍 SIMPLE CONTRACT CHECK");
        console.log("========================");
        
        const contractAddress = "0x4eC8277F557C73B41EEEBd35Bf0dC0E24c165944";
        
        // Just check if contract exists
        const provider = ethers.provider;
        const code = await provider.getCode(contractAddress);
        
        if (code === '0x') {
            console.log("❌ No contract deployed at this address");
            return;
        }
        
        console.log("✅ Contract exists at:", contractAddress);
        console.log("📏 Contract size:", code.length, "bytes");
        
        // Try to get contract instance
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(contractAddress);
        
        // Simple owner check
        console.log("👑 Checking owner...");
        const owner = await contract.owner();
        console.log("👑 Contract owner:", owner);
        
        console.log("\n✅ Contract is deployed and accessible!");
        
        // Update .env
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(__dirname, '..', '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        if (envContent.includes('TESTNET_CONTRACT_ADDRESS=')) {
            envContent = envContent.replace(/TESTNET_CONTRACT_ADDRESS=.*/g, `TESTNET_CONTRACT_ADDRESS=${contractAddress}`);
        } else {
            envContent += `\nTESTNET_CONTRACT_ADDRESS=${contractAddress}`;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log("📝 Updated .env with contract address");
        
    } catch (error) {
        console.error("💥 Error:", error.message);
    }
}

main();
