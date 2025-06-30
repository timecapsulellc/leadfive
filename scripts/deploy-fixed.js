const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 DEPLOYING LEADFIVE FIXED CONTRACT");
    console.log("===================================\n");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`💰 Deploying from account: ${deployer.address}`);
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log(`💳 Account balance: ${ethers.utils.formatEther(balance)} BNB\n`);
    
    if (balance.lt(ethers.utils.parseEther("0.1"))) {
        console.log("⚠️  WARNING: Low balance. Consider adding more BNB for deployment.");
    }

    // Deploy the contract
    console.log("🔧 Deploying LeadFiveFixed contract...");
    const LeadFiveFixed = await ethers.getContractFactory("LeadFiveFixed");
    
    // Estimate gas
    const deployTx = LeadFiveFixed.getDeployTransaction();
    const estimatedGas = await ethers.provider.estimateGas(deployTx);
    console.log(`⛽ Estimated gas: ${estimatedGas.toString()}`);
    
    const contract = await LeadFiveFixed.deploy({
        gasLimit: estimatedGas.mul(120).div(100) // Add 20% buffer
    });

    console.log(`📤 Deployment transaction: ${contract.deployTransaction.hash}`);
    console.log("⏳ Waiting for deployment confirmation...");

    await contract.deployed();

    console.log(`✅ LeadFiveFixed deployed to: ${contract.address}`);
    console.log(`🏗️  Transaction: ${contract.deployTransaction.hash}`);
    console.log(`⛽ Gas used: ${contract.deployTransaction.gasLimit?.toString()}\n`);

    // Verify deployment
    console.log("🔍 VERIFYING DEPLOYMENT");
    console.log("=======================");
    
    const owner = await contract.owner();
    const adminWallet = await contract.adminWallet();
    const feeRecipient = await contract.feeRecipient();
    
    console.log(`👑 Contract Owner: ${owner}`);
    console.log(`🏦 Admin Wallet: ${adminWallet}`);
    console.log(`💰 Fee Recipient: ${feeRecipient}`);
    
    // Verify package prices
    console.log("\n📦 PACKAGE VERIFICATION");
    console.log("=======================");
    
    for (let i = 1; i <= 4; i++) {
        const packageInfo = await contract.getPackageInfo(i);
        const priceInBNB = ethers.utils.formatEther(packageInfo.price);
        const priceInUSD = (parseFloat(priceInBNB) * 270).toFixed(0); // Approximate USD
        
        console.log(`Package ${i}:`);
        console.log(`  Price: ${priceInBNB} BNB (~$${priceInUSD})`);
        console.log(`  Direct Bonus: ${packageInfo.directBonus / 100}%`);
        console.log(`  Level Bonus: ${packageInfo.levelBonus / 100}%`);
        console.log(`  Upline Bonus: ${packageInfo.uplineBonus / 100}%`);
        console.log(`  Leader Bonus: ${packageInfo.leaderBonus / 100}%`);
        console.log(`  Help Bonus: ${packageInfo.helpBonus / 100}%`);
        console.log(`  Club Bonus: ${packageInfo.clubBonus / 100}%`);
        console.log(`  Total Commission: ${(packageInfo.directBonus + packageInfo.levelBonus + packageInfo.uplineBonus + packageInfo.leaderBonus + packageInfo.helpBonus + packageInfo.clubBonus) / 100}%`);
        console.log("");
    }

    // Contract stats
    const stats = await contract.getContractStats();
    console.log("📊 CONTRACT STATISTICS");
    console.log("=====================");
    console.log(`Total Users: ${stats._totalUsers}`);
    console.log(`Total Earnings: ${ethers.utils.formatEther(stats._totalEarnings)} BNB`);
    console.log(`Contract Balance: ${ethers.utils.formatEther(stats._contractBalance)} BNB\n`);

    console.log("🎯 NEXT STEPS:");
    console.log("==============");
    console.log("1. ✅ Contract deployed successfully");
    console.log("2. 🔄 Update .env with new contract address");
    console.log("3. 👑 Register deployer as ROOT user");
    console.log("4. 🔐 Transfer ownership to Trezor wallet");
    console.log("5. 🚀 Launch platform\n");

    console.log("🔗 DEPLOYMENT SUMMARY:");
    console.log("======================");
    console.log(`Contract Address: ${contract.address}`);
    console.log(`Network: ${hre.network.name}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Block Number: ${contract.deployTransaction.blockNumber || 'Pending'}`);
    
    // Save deployment info
    const deploymentInfo = {
        contractAddress: contract.address,
        deployer: deployer.address,
        network: hre.network.name,
        transactionHash: contract.deployTransaction.hash,
        blockNumber: contract.deployTransaction.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: contract.deployTransaction.gasLimit?.toString(),
        packages: []
    };
    
    // Add package info
    for (let i = 1; i <= 4; i++) {
        const packageInfo = await contract.getPackageInfo(i);
        deploymentInfo.packages.push({
            id: i,
            price: packageInfo.price.toString(),
            priceInBNB: ethers.utils.formatEther(packageInfo.price),
            directBonus: packageInfo.directBonus,
            levelBonus: packageInfo.levelBonus,
            uplineBonus: packageInfo.uplineBonus,
            leaderBonus: packageInfo.leaderBonus,
            helpBonus: packageInfo.helpBonus,
            clubBonus: packageInfo.clubBonus
        });
    }
    
    // Write deployment info to file
    const fs = require('fs');
    fs.writeFileSync(
        'deployment-info.json', 
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment info saved to deployment-info.json");
    
    if (hre.network.name === 'bsc') {
        console.log("\n🔍 ETHERSCAN VERIFICATION:");
        console.log("=========================");
        console.log("Run this command to verify on BSCScan:");
        console.log(`npx hardhat verify --network bsc ${contract.address}`);
    }
    
    console.log("\n🎉 DEPLOYMENT COMPLETE! 🎉");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
