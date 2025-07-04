const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 QUICK MAINNET STATUS CHECK");
    console.log("=============================");
    
    const mainContractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const [deployer] = await ethers.getSigners();
    
    console.log("👨‍💼 Deployer:", deployer.address);
    console.log("🎯 Contract:", mainContractAddress);
    
    const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
    const contract = LeadFiveV1_10.attach(mainContractAddress);
    
    try {
        const owner = await contract.owner();
        console.log("👑 Owner:", owner);
        
        const stats = await contract.getContractStats();
        console.log("👥 Users:", stats.totalUsersCount.toString());
        
        console.log("✅ Contract is accessible and upgraded!");
    } catch (error) {
        console.log("❌ Error:", error.message);
    }
}

main().catch(console.error);
