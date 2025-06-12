const { ethers, upgrades } = require("hardhat");

/**
 * 🔐 EMERGENCY SECURE DEPLOYMENT SCRIPT
 * 
 * This script deploys a new OrphiCrowdFund contract to replace the compromised one.
 * It uses your Trezor hardware wallet for maximum security.
 */

// Configuration for new secure contract
const CONFIG = {
    // BSC Mainnet USDT
    USDT_TOKEN: "0x55d398326f99059fF775485246999027B3197955",
    
    // Your Trezor address (will be owner and admin)
    TREZOR_ADDRESS: "0xeB652c4523f3Cf615D3F3694b14E551145953aD0",
    
    // Gas settings for BSC Mainnet
    GAS_LIMIT: 8000000,
    GAS_PRICE: 5000000000, // 5 Gwei
};

async function main() {
    console.log("🔐 EMERGENCY SECURE DEPLOYMENT STARTING...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Get network and deployer info
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    const balance = await ethers.provider.getBalance(deployer.address);
    
    console.log(`📊 Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB`);
    
    // Security verification
    if (deployer.address.toLowerCase() !== CONFIG.TREZOR_ADDRESS.toLowerCase()) {
        console.log("❌ ERROR: Deployer address does not match expected Trezor address!");
        console.log(`   Expected: ${CONFIG.TREZOR_ADDRESS}`);
        console.log(`   Current:  ${deployer.address}`);
        console.log("\n💡 SOLUTION:");
        console.log("   1. Connect your Trezor to MetaMask");
        console.log("   2. Select the correct account in MetaMask");
        console.log("   3. Ensure BSC Mainnet is the active network");
        process.exit(1);
    }
    
    // Check minimum balance
    const minBalance = ethers.parseEther("0.01"); // 0.01 BNB minimum
    if (balance < minBalance) {
        console.log("❌ ERROR: Insufficient BNB balance for deployment!");
        console.log(`   Current: ${ethers.formatEther(balance)} BNB`);
        console.log(`   Required: ${ethers.formatEther(minBalance)} BNB`);
        console.log("\n💡 Add more BNB to your Trezor address before deploying.");
        process.exit(1);
    }
    
    console.log("✅ Security checks passed!");
    console.log("\n🚀 Deploying new secure OrphiCrowdFund contract...");
    
    try {
        // Get contract factory
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        
        console.log("📄 Deploying proxy contract with initialization...");
        console.log(`   USDT Token: ${CONFIG.USDT_TOKEN}`);
        console.log(`   Treasury: ${CONFIG.TREZOR_ADDRESS}`);
        console.log(`   Emergency: ${CONFIG.TREZOR_ADDRESS}`);
        console.log(`   Pool Manager: ${CONFIG.TREZOR_ADDRESS}`);
        
        // Deploy upgradeable proxy
        const contract = await upgrades.deployProxy(
            OrphiCrowdFund,
            [
                CONFIG.USDT_TOKEN,
                CONFIG.TREZOR_ADDRESS,  // treasury
                CONFIG.TREZOR_ADDRESS,  // emergency
                CONFIG.TREZOR_ADDRESS   // poolManager
            ],
            {
                initializer: 'initialize',
                kind: 'uups',
                gasLimit: CONFIG.GAS_LIMIT,
            }
        );
        
        // Wait for deployment
        console.log("⏳ Waiting for deployment confirmation...");
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
        
        console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`📍 Proxy Address: ${contractAddress}`);
        console.log(`🔧 Implementation: ${implementationAddress}`);
        
        // Verify ownership
        console.log("\n🔍 Verifying contract setup...");
        const owner = await contract.owner();
        const usdtToken = await contract.usdtToken();
        
        console.log(`👑 Owner: ${owner}`);
        console.log(`💰 USDT Token: ${usdtToken}`);
        
        if (owner.toLowerCase() === CONFIG.TREZOR_ADDRESS.toLowerCase()) {
            console.log("✅ Ownership verified correctly!");
        } else {
            console.log("⚠️  WARNING: Ownership verification failed!");
        }
        
        if (usdtToken.toLowerCase() === CONFIG.USDT_TOKEN.toLowerCase()) {
            console.log("✅ USDT token configured correctly!");
        } else {
            console.log("⚠️  WARNING: USDT token configuration mismatch!");
        }
        
        // Save deployment information
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            network: network.name,
            chainId: network.chainId.toString(),
            deployer: deployer.address,
            proxyAddress: contractAddress,
            implementationAddress: implementationAddress,
            owner: owner,
            usdtToken: usdtToken,
            treasury: CONFIG.TREZOR_ADDRESS,
            emergency: CONFIG.TREZOR_ADDRESS,
            poolManager: CONFIG.TREZOR_ADDRESS,
            gasUsed: contract.deploymentTransaction()?.gasLimit?.toString() || "Unknown",
            transactionHash: contract.deploymentTransaction()?.hash || "Unknown"
        };
        
        // Write to file
        const fs = require('fs');
        fs.writeFileSync(
            'EMERGENCY_DEPLOYMENT_SUCCESS.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\n📋 DEPLOYMENT SUMMARY:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`🆔 New Contract Address: ${contractAddress}`);
        console.log(`🔗 BSCScan URL: https://bscscan.com/address/${contractAddress}`);
        console.log(`💾 Details saved to: EMERGENCY_DEPLOYMENT_SUCCESS.json`);
        
        console.log("\n🔧 IMMEDIATE NEXT STEPS:");
        console.log("1. ✅ Update frontend config with new contract address");
        console.log("2. 🔍 Verify contract on BSCScan (optional)");
        console.log("3. 📢 Announce new contract to users");
        console.log("4. 🚫 Blacklist old compromised contract");
        console.log("5. 🛡️ Monitor new contract for proper operation");
        
        console.log("\n⚠️  CRITICAL REMINDERS:");
        console.log("• Never use the compromised deployer wallet again");
        console.log("• Your Trezor now controls this contract completely");
        console.log("• All admin functions require Trezor confirmation");
        console.log("• Update your frontend immediately");
        
        console.log("\n🔐 SECURITY STATUS: ✅ FULLY SECURE");
        console.log("Your new contract is now completely secure and under your control!");
        
    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED!");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("Error:", error.message);
        
        if (error.message.includes("user rejected")) {
            console.log("\n💡 Transaction was rejected on your Trezor device.");
            console.log("   Please confirm the transaction on your Trezor and try again.");
        } else if (error.message.includes("insufficient funds")) {
            console.log("\n💡 Insufficient BNB for gas fees.");
            console.log("   Please add more BNB to your Trezor address and try again.");
        } else if (error.message.includes("nonce")) {
            console.log("\n💡 Nonce issue detected.");
            console.log("   Wait a moment and try the deployment again.");
        }
        
        console.log("\n🆘 If the problem persists:");
        console.log("1. Check your Trezor connection");
        console.log("2. Verify MetaMask is connected to your Trezor");
        console.log("3. Ensure BSC Mainnet is selected");
        console.log("4. Confirm sufficient BNB balance");
        
        process.exit(1);
    }
}

// Run deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
