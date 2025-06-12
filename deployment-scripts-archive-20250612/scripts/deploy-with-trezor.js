/**
 * 🔐 SECURE TREZOR DEPLOYMENT SCRIPT
 * 
 * This script deploys the OrphiCrowdFund contract using a Trezor hardware wallet
 * for maximum security. The deployment uses your Trezor-derived address as the
 * initial owner, ensuring secure key management from the start.
 */

const { ethers, upgrades } = require("hardhat");
const readline = require('readline');

// Your Trezor wallet address (should be the deployer)
const TREZOR_ADDRESS = "0xeB652c4523f3Cf615D3F3694b14E551145953aD0";

// BSC Mainnet USDT address
const BSC_MAINNET_USDT = "0x55d398326f99059fF775485246999027B3197955";

// Security addresses (using your Trezor as initial admin)
const TREASURY_ADDRESS = TREZOR_ADDRESS;
const EMERGENCY_ADDRESS = TREZOR_ADDRESS;
const POOL_MANAGER_ADDRESS = TREZOR_ADDRESS;

function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

async function confirmDeployment(network, deployer) {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                           🔐 SECURE TREZOR DEPLOYMENT                                ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝

⚠️  IMPORTANT SECURITY NOTICE:
   This deployment will create a NEW secure contract to replace the compromised one.

📋 DEPLOYMENT DETAILS:
   • Network: ${network.toUpperCase()}
   • Deployer: ${deployer}
   • Expected Trezor: ${TREZOR_ADDRESS}
   • Treasury: ${TREASURY_ADDRESS}
   • Emergency: ${EMERGENCY_ADDRESS}
   • Pool Manager: ${POOL_MANAGER_ADDRESS}
   • USDT Token: ${BSC_MAINNET_USDT}

🔍 VERIFICATION CHECKLIST:
   ✅ Deployer address matches your Trezor address
   ✅ All admin addresses point to your secure Trezor wallet
   ✅ You have physical access to your Trezor device
   ✅ Your Trezor is connected and unlocked
   ✅ You have sufficient BNB for gas fees

⚡ WHAT WILL HAPPEN:
   1. Deploy new OrphiCrowdFund proxy contract
   2. Set your Trezor address as owner and all admin roles
   3. Initialize with secure parameters
   4. Verify contract on BSCScan
   5. Generate migration instructions
`);

    const rl = createInterface();
    
    return new Promise((resolve) => {
        rl.question('\n🚨 Type "DEPLOY" to confirm this secure deployment: ', (answer) => {
            rl.close();
            resolve(answer === 'DEPLOY');
        });
    });
}

async function verifyTrezorConnection(deployer) {
    console.log("\n🔍 Verifying Trezor connection...");
    
    if (deployer.toLowerCase() !== TREZOR_ADDRESS.toLowerCase()) {
        console.log(`
❌ ERROR: Address mismatch!
   Connected: ${deployer}
   Expected:  ${TREZOR_ADDRESS}

💡 SOLUTION:
   1. Make sure your Trezor is connected to MetaMask
   2. Select the correct account in MetaMask
   3. Ensure Hardhat is using the Trezor-derived account
        `);
        process.exit(1);
    }
    
    console.log("✅ Trezor address verified!");
}

async function deployNewSecureContract() {
    console.log("\n🚀 Starting Secure Trezor Deployment...");
    
    // Get deployer (should be Trezor-derived)
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    
    console.log(`\n📊 Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} BNB`);
    
    // Verify this is your Trezor address
    await verifyTrezorConnection(deployer.address);
    
    // Confirm deployment
    const confirmed = await confirmDeployment(network.name, deployer.address);
    if (!confirmed) {
        console.log("❌ Deployment cancelled by user.");
        process.exit(0);
    }
    
    console.log("\n🔨 Deploying new secure OrphiCrowdFund contract...");
    
    try {
        // Deploy the main contract
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        
        console.log("📄 Deploying proxy contract with initialization...");
        
        const contract = await upgrades.deployProxy(OrphiCrowdFund, [
            BSC_MAINNET_USDT,    // USDT token address
            TREASURY_ADDRESS,     // Treasury (your Trezor)
            EMERGENCY_ADDRESS,    // Emergency (your Trezor)
            POOL_MANAGER_ADDRESS  // Pool manager (your Trezor)
        ], {
            initializer: 'initialize',
            kind: 'uups'
        });
        
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        
        console.log(`\n✅ NEW SECURE CONTRACT DEPLOYED!`);
        console.log(`📍 Proxy Address: ${contractAddress}`);
        
        // Get implementation address
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
        console.log(`🔧 Implementation: ${implementationAddress}`);
        
        // Verify ownership
        const owner = await contract.owner();
        console.log(`👑 Owner: ${owner}`);
        
        if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.log("⚠️  WARNING: Owner does not match deployer!");
        } else {
            console.log("✅ Ownership verified!");
        }
        
        // Generate deployment report
        const deploymentInfo = {
            network: network.name,
            chainId: network.chainId.toString(),
            proxyAddress: contractAddress,
            implementationAddress: implementationAddress,
            owner: owner,
            deployer: deployer.address,
            treasury: TREASURY_ADDRESS,
            emergency: EMERGENCY_ADDRESS,
            poolManager: POOL_MANAGER_ADDRESS,
            usdtToken: BSC_MAINNET_USDT,
            deploymentTime: new Date().toISOString(),
            txHash: contract.deploymentTransaction()?.hash
        };
        
        // Save deployment info
        const fs = require('fs');
        fs.writeFileSync(
            'NEW_SECURE_DEPLOYMENT.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                         🎉 DEPLOYMENT SUCCESSFUL!                                    ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝

📍 NEW SECURE CONTRACT ADDRESS: ${contractAddress}

🔧 NEXT STEPS:
   1. ✅ Contract deployed with your Trezor as owner
   2. 🔍 Verify contract on BSCScan
   3. 📱 Update frontend to use new contract address
   4. 📢 Announce new contract to users
   5. 🛡️ Set up migration from old contract (if needed)

💾 Deployment details saved to: NEW_SECURE_DEPLOYMENT.json

🌐 View on BSCScan:
   • Contract: https://bscscan.com/address/${contractAddress}
   • Implementation: https://bscscan.com/address/${implementationAddress}

⚠️  IMPORTANT: 
   • Update your frontend config with the new address
   • Inform users about the new secure contract
   • Never use the compromised deployer wallet again
        `);
        
        return deploymentInfo;
        
    } catch (error) {
        console.error("\n❌ Deployment failed:", error.message);
        
        if (error.message.includes("user rejected")) {
            console.log("\n💡 User rejected transaction on Trezor device.");
            console.log("   Please confirm the transaction on your Trezor and try again.");
        }
        
        process.exit(1);
    }
}

// Deploy if this script is run directly
if (require.main === module) {
    deployNewSecureContract()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { deployNewSecureContract };
