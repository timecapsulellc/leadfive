const hre = require("hardhat");
const { ethers } = require("hardhat");

async function checkNetwork() {
    try {
        const [signer] = await ethers.getSigners();
        const network = await signer.provider.getNetwork();
        
        console.log("Network Details:");
        console.log("- Name:", network.name);
        console.log("- Chain ID:", network.chainId.toString());
        console.log("- Signer Address:", signer.address);
        
        // Check if contract exists at the reported addresses
        const proxyAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const implAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        
        console.log("\nChecking contract deployments:");
        
        const proxyCode = await signer.provider.getCode(proxyAddress);
        const implCode = await signer.provider.getCode(implAddress);
        
        console.log("- Proxy bytecode length:", proxyCode.length);
        console.log("- Implementation bytecode length:", implCode.length);
        
        if (proxyCode === "0x") {
            console.log("❌ Proxy contract not found at", proxyAddress);
        } else {
            console.log("✅ Proxy contract found at", proxyAddress);
        }
        
        if (implCode === "0x") {
            console.log("❌ Implementation contract not found at", implAddress);
        } else {
            console.log("✅ Implementation contract found at", implAddress);
        }
        
    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkNetwork();
