const { ethers } = require("hardhat");

async function main() {
    console.log("Testing connection...");
    
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, network.chainId.toString());
    
    const accounts = await ethers.getSigners();
    console.log("Account:", accounts[0].address);
    
    const balance = await ethers.provider.getBalance(accounts[0].address);
    console.log("Balance:", ethers.formatEther(balance));
}

main().catch(console.error);
