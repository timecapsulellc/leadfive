#!/usr/bin/env node
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deployer Address:', deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('Balance:', ethers.formatEther(balance), 'BNB');
    
    const requiredBalance = ethers.parseEther("0.1");
    console.log('Required Balance:', ethers.formatEther(requiredBalance), 'BNB');
    
    if (balance < requiredBalance) {
        console.log('❌ Insufficient balance for deployment');
        console.log('💡 Please send at least 0.1 BNB to the deployer address');
    } else {
        console.log('✅ Sufficient balance for deployment');
    }
}

main().catch(console.error);
