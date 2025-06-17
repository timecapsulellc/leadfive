const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Starting deployment...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "BNB");
    
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
    
    console.log("✅ Basic setup working");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
