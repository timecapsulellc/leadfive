const { ethers } = require('ethers');
const fs = require('fs');

// Import contract artifacts (compiled contracts)
const OrphiCrowdFundArtifact = require('./artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json');
const InternalAdminManagerArtifact = require('./artifacts/contracts/modules/InternalAdminManager.sol/InternalAdminManager.json');
const OrphiCommissionsArtifact = require('./artifacts/contracts/core/OrphiCommissions.sol/OrphiCommissions.json');

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                   🚀 MANUAL TREZOR DEPLOYMENT SCRIPT 🚀                              ║
 * ║                                                                                       ║
 * ║  This script generates the deployment transactions that you can                       ║
 * ║  sign manually using Trezor Suite or other tools.                                    ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 */

const DEPLOYMENT_CONFIG = {
    NETWORK: "BSC Mainnet",
    RPC_URL: "https://bsc-dataseed.binance.org/",
    CHAIN_ID: 56,
    TREZOR_ADDRESS: "0xeB652c4523f3Cf615D3F3694b14E551145953aD0",
    USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955"
};

async function generateDeploymentTransactions() {
    console.log("🔐 MANUAL TREZOR DEPLOYMENT TRANSACTION GENERATOR");
    console.log("=".repeat(60));
    console.log("");

    const provider = new ethers.JsonRpcProvider(DEPLOYMENT_CONFIG.RPC_URL);
    
    // Get current nonce and gas price
    const nonce = await provider.getTransactionCount(DEPLOYMENT_CONFIG.TREZOR_ADDRESS);
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    
    console.log(`📊 Deployment Parameters:`);
    console.log(`   Network: ${DEPLOYMENT_CONFIG.NETWORK}`);
    console.log(`   From: ${DEPLOYMENT_CONFIG.TREZOR_ADDRESS}`);
    console.log(`   Nonce: ${nonce}`);
    console.log(`   Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
    console.log("");

    // 1. Deploy InternalAdminManager
    console.log("📝 Transaction 1: Deploy InternalAdminManager");
    const adminManagerBytecode = InternalAdminManagerArtifact.bytecode;
    const adminManagerAbi = InternalAdminManagerArtifact.abi;
    
    const adminManagerFactory = new ethers.ContractFactory(adminManagerAbi, adminManagerBytecode, provider);
    const adminManagerDeployTx = await adminManagerFactory.getDeployTransaction();
    
    const tx1 = {
        to: null, // Contract creation
        value: "0x0",
        data: adminManagerDeployTx.data,
        gasLimit: "0x" + (2000000).toString(16), // 2M gas
        gasPrice: "0x" + gasPrice.toString(16),
        nonce: "0x" + nonce.toString(16),
        chainId: DEPLOYMENT_CONFIG.CHAIN_ID
    };

    console.log("   Raw Transaction Data:");
    console.log(`   ${JSON.stringify(tx1, null, 2)}`);
    console.log("");

    // 2. Deploy OrphiCommissions  
    console.log("📝 Transaction 2: Deploy OrphiCommissions");
    const commissionsBytecode = OrphiCommissionsArtifact.bytecode;
    const commissionsAbi = OrphiCommissionsArtifact.abi;
    
    const commissionsFactory = new ethers.ContractFactory(commissionsAbi, commissionsBytecode, provider);
    const commissionsDeployTx = await commissionsFactory.getDeployTransaction();
    
    const tx2 = {
        to: null,
        value: "0x0", 
        data: commissionsDeployTx.data,
        gasLimit: "0x" + (3000000).toString(16), // 3M gas
        gasPrice: "0x" + gasPrice.toString(16),
        nonce: "0x" + (nonce + 1).toString(16),
        chainId: DEPLOYMENT_CONFIG.CHAIN_ID
    };

    console.log("   Raw Transaction Data:");
    console.log(`   ${JSON.stringify(tx2, null, 2)}`);
    console.log("");

    // Calculate contract addresses
    const adminManagerAddress = ethers.getCreateAddress({
        from: DEPLOYMENT_CONFIG.TREZOR_ADDRESS,
        nonce: nonce
    });
    
    const commissionsAddress = ethers.getCreateAddress({
        from: DEPLOYMENT_CONFIG.TREZOR_ADDRESS,
        nonce: nonce + 1
    });

    console.log("🏗️  Predicted Contract Addresses:");
    console.log(`   InternalAdminManager: ${adminManagerAddress}`);
    console.log(`   OrphiCommissions: ${commissionsAddress}`);
    console.log("");

    // 3. Deploy OrphiCrowdFund (Proxy)
    console.log("📝 Transaction 3: Deploy OrphiCrowdFund");
    const crowdFundBytecode = OrphiCrowdFundArtifact.bytecode;
    const crowdFundAbi = OrphiCrowdFundArtifact.abi;
    
    const crowdFundFactory = new ethers.ContractFactory(crowdFundAbi, crowdFundBytecode, provider);
    
    // Initialize function call data
    const initData = crowdFundFactory.interface.encodeFunctionData("initialize", [
        DEPLOYMENT_CONFIG.TREZOR_ADDRESS, // owner
        DEPLOYMENT_CONFIG.USDT_ADDRESS,   // USDT address
        commissionsAddress,               // OrphiCommissions address
        adminManagerAddress               // InternalAdminManager address
    ]);
    
    const crowdFundDeployTx = await crowdFundFactory.getDeployTransaction();
    
    const tx3 = {
        to: null,
        value: "0x0",
        data: crowdFundDeployTx.data,
        gasLimit: "0x" + (4000000).toString(16), // 4M gas
        gasPrice: "0x" + gasPrice.toString(16), 
        nonce: "0x" + (nonce + 2).toString(16),
        chainId: DEPLOYMENT_CONFIG.CHAIN_ID
    };

    console.log("   Raw Transaction Data:");
    console.log(`   ${JSON.stringify(tx3, null, 2)}`);
    console.log("");

    const crowdFundAddress = ethers.getCreateAddress({
        from: DEPLOYMENT_CONFIG.TREZOR_ADDRESS,
        nonce: nonce + 2
    });

    // 4. Initialize OrphiCrowdFund
    console.log("📝 Transaction 4: Initialize OrphiCrowdFund");
    
    const tx4 = {
        to: crowdFundAddress,
        value: "0x0",
        data: initData,
        gasLimit: "0x" + (1000000).toString(16), // 1M gas
        gasPrice: "0x" + gasPrice.toString(16),
        nonce: "0x" + (nonce + 3).toString(16), 
        chainId: DEPLOYMENT_CONFIG.CHAIN_ID
    };

    console.log("   Raw Transaction Data:");
    console.log(`   ${JSON.stringify(tx4, null, 2)}`);
    console.log("");

    console.log("🎯 FINAL DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`📍 InternalAdminManager: ${adminManagerAddress}`);
    console.log(`📍 OrphiCommissions: ${commissionsAddress}`);  
    console.log(`📍 OrphiCrowdFund: ${crowdFundAddress}`);
    console.log("");
    console.log("📋 MANUAL DEPLOYMENT STEPS:");
    console.log("1. Copy each transaction data above");
    console.log("2. Use Trezor Suite to create and sign each transaction");
    console.log("3. Broadcast each transaction in order");
    console.log("4. Wait for confirmation before proceeding to next");
    console.log("");

    // Save to file for reference
    const deploymentData = {
        network: DEPLOYMENT_CONFIG.NETWORK,
        deployer: DEPLOYMENT_CONFIG.TREZOR_ADDRESS,
        transactions: [tx1, tx2, tx3, tx4],
        predictedAddresses: {
            internalAdminManager: adminManagerAddress,
            orphiCommissions: commissionsAddress,
            orphiCrowdFund: crowdFundAddress
        },
        gasEstimate: {
            total: "10000000", // 10M gas total
            totalCostBNB: ethers.formatEther(gasPrice * BigInt(10000000))
        }
    };

    fs.writeFileSync('trezor-deployment-transactions.json', JSON.stringify(deploymentData, null, 2));
    console.log("💾 Deployment data saved to: trezor-deployment-transactions.json");
}

generateDeploymentTransactions().catch(console.error);
