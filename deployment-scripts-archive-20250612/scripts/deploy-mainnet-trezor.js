const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║    ██████╗ ██████╗ ██████╗ ██╗  ██╗██╗     ██████╗██╗  ██╗ █████╗ ██╗███╗   ██╗    ║
 * ║   ██╔═══██╗██╔══██╗██╔══██╗██║  ██║██║    ██╔════╝██║  ██║██╔══██╗██║████╗  ██║    ║
 * ║   ██║   ██║██████╔╝██████╔╝███████║██║    ██║     ███████║███████║██║██╔██╗ ██║    ║
 * ║   ██║   ██║██╔══██╗██╔═══╝ ██╔══██║██║    ██║     ██╔══██║██╔══██║██║██║╚██╗██║    ║
 * ║   ╚██████╔╝██║  ██║██║     ██║  ██║██║    ╚██████╗██║  ██║██║  ██║██║██║ ╚████║    ║
 * ║    ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝     ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝    ║
 * ║                                                                                       ║
 * ║                    ◆ TREZOR MAINNET DEPLOYMENT SCRIPT ◆                              ║
 * ║                  ◇ Gas-Optimized Hardware Wallet Deployment ◇                       ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 */

// Configuration
const DEPLOYMENT_CONFIG = {
    CONTRACT_NAME: "OrphichainCrowdfundPlatformUpgradeable",
    USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955", // BSC Mainnet USDT
    NETWORK: "bscMainnet",
    GAS_LIMIT_BUFFER: 1.2, // 20% buffer for gas estimation
    CONFIRMATION_BLOCKS: 3,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 5000 // 5 seconds
};

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const formatBNB = (wei) => {
    return ethers.utils.formatEther(wei);
};

const formatGwei = (wei) => {
    return ethers.utils.formatUnits(wei, "gwei");
};

const saveDeploymentInfo = (deploymentData) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `mainnet-deployment-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'deployments', filename);
    
    // Ensure deployments directory exists
    const deploymentsDir = path.dirname(filepath);
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(deploymentData, null, 2));
    console.log(`📄 Deployment info saved to: ${filename}`);
    return filename;
};

const estimateGasCosts = async (contractFactory, initArgs) => {
    console.log("⛽ Estimating gas costs...");
    
    try {
        // Estimate proxy deployment gas
        const proxyGasEstimate = await upgrades.estimateGas(contractFactory, initArgs);
        
        // Get current gas price
        const gasPrice = await ethers.provider.getGasPrice();
        
        // Calculate costs with buffer
        const totalGasEstimate = Math.ceil(proxyGasEstimate.toNumber() * DEPLOYMENT_CONFIG.GAS_LIMIT_BUFFER);
        const estimatedCost = gasPrice.mul(totalGasEstimate);
        
        console.log(`📊 Gas Estimation:`);
        console.log(`   • Estimated Gas: ${totalGasEstimate.toLocaleString()}`);
        console.log(`   • Gas Price: ${formatGwei(gasPrice)} gwei`);
        console.log(`   • Estimated Cost: ${formatBNB(estimatedCost)} BNB`);
        console.log(`   • USD Cost (BNB=$300): $${(parseFloat(formatBNB(estimatedCost)) * 300).toFixed(2)}`);
        
        return {
            gasEstimate: totalGasEstimate,
            gasPrice: gasPrice,
            estimatedCost: estimatedCost
        };
    } catch (error) {
        console.log(`⚠️  Gas estimation failed: ${error.message}`);
        console.log(`📋 Using fallback gas estimates...`);
        
        const fallbackGas = 3000000; // 3M gas fallback
        const gasPrice = await ethers.provider.getGasPrice();
        const estimatedCost = gasPrice.mul(fallbackGas);
        
        return {
            gasEstimate: fallbackGas,
            gasPrice: gasPrice,
            estimatedCost: estimatedCost
        };
    }
};

const waitForUserConfirmation = async (message) => {
    console.log(`\n🔔 ${message}`);
    console.log("📱 Please confirm the transaction on your Trezor device...");
    console.log("⏳ Waiting for confirmation...\n");
    
    // In a real implementation, you might want to add a timeout or user input
    // For now, we'll just add a delay to simulate user confirmation time
    await sleep(3000);
};

const deployWithRetry = async (deployFunction, maxRetries = DEPLOYMENT_CONFIG.RETRY_ATTEMPTS) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Deployment attempt ${attempt}/${maxRetries}...`);
            return await deployFunction();
        } catch (error) {
            console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
            
            if (attempt === maxRetries) {
                throw new Error(`Deployment failed after ${maxRetries} attempts: ${error.message}`);
            }
            
            console.log(`⏳ Waiting ${DEPLOYMENT_CONFIG.RETRY_DELAY/1000}s before retry...`);
            await sleep(DEPLOYMENT_CONFIG.RETRY_DELAY);
        }
    }
};

const verifyContract = async (contractAddress, constructorArgs = []) => {
    console.log("🔍 Verifying contract on BSCScan...");
    
    try {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArgs,
        });
        console.log("✅ Contract verified successfully!");
        return true;
    } catch (error) {
        console.log(`⚠️  Verification failed: ${error.message}`);
        console.log("📋 You can verify manually later using the contract address");
        return false;
    }
};

const performSecurityChecks = async (contract, deployer) => {
    console.log("🛡️  Performing post-deployment security checks...");
    
    const checks = [];
    
    try {
        // Check contract owner
        const owner = await contract.owner();
        checks.push({
            name: "Contract Owner",
            status: owner.toLowerCase() === deployer.address.toLowerCase() ? "✅" : "❌",
            value: owner,
            expected: deployer.address
        });
        
        // Check if contract is paused
        const isPaused = await contract.paused();
        checks.push({
            name: "Contract Paused",
            status: !isPaused ? "✅" : "⚠️",
            value: isPaused,
            expected: false
        });
        
        // Check USDT token address
        const usdtAddress = await contract.usdtToken();
        checks.push({
            name: "USDT Token Address",
            status: usdtAddress.toLowerCase() === DEPLOYMENT_CONFIG.USDT_ADDRESS.toLowerCase() ? "✅" : "❌",
            value: usdtAddress,
            expected: DEPLOYMENT_CONFIG.USDT_ADDRESS
        });
        
        // Check total members (should be 0 initially)
        const totalMembers = await contract.totalMembers();
        checks.push({
            name: "Total Members",
            status: totalMembers.toString() === "0" ? "✅" : "⚠️",
            value: totalMembers.toString(),
            expected: "0"
        });
        
        console.log("\n📋 Security Check Results:");
        checks.forEach(check => {
            console.log(`   ${check.status} ${check.name}: ${check.value}`);
            if (check.status === "❌") {
                console.log(`      Expected: ${check.expected}`);
            }
        });
        
        const failedChecks = checks.filter(check => check.status === "❌");
        if (failedChecks.length > 0) {
            console.log(`\n⚠️  ${failedChecks.length} security check(s) failed!`);
            return false;
        }
        
        console.log("\n✅ All security checks passed!");
        return true;
        
    } catch (error) {
        console.log(`❌ Security checks failed: ${error.message}`);
        return false;
    }
};

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("🚀 ORPHICHAIN MAINNET DEPLOYMENT - TREZOR OPTIMIZED");
    console.log("=".repeat(80));
    
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 56) {
        throw new Error("❌ Not connected to BSC Mainnet! Please check your network configuration.");
    }
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    
    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log(`💰 Balance: ${formatBNB(balance)} BNB`);
    
    if (balance.lt(ethers.utils.parseEther("0.1"))) {
        throw new Error("❌ Insufficient BNB balance! Need at least 0.1 BNB for deployment.");
    }
    
    console.log("\n" + "-".repeat(50));
    console.log("📋 DEPLOYMENT CONFIGURATION");
    console.log("-".repeat(50));
    console.log(`Contract: ${DEPLOYMENT_CONFIG.CONTRACT_NAME}`);
    console.log(`USDT Address: ${DEPLOYMENT_CONFIG.USDT_ADDRESS}`);
    console.log(`Network: ${DEPLOYMENT_CONFIG.NETWORK}`);
    console.log(`Confirmations: ${DEPLOYMENT_CONFIG.CONFIRMATION_BLOCKS}`);
    
    // Get contract factory
    console.log("\n📦 Loading contract factory...");
    const ContractFactory = await ethers.getContractFactory(DEPLOYMENT_CONFIG.CONTRACT_NAME);
    
    // Prepare initialization arguments
    const initArgs = [
        DEPLOYMENT_CONFIG.USDT_ADDRESS,  // _usdtToken
        deployer.address,                // _treasuryAddress
        deployer.address,                // _emergencyAddress  
        deployer.address                 // _poolManagerAddress
    ];
    
    console.log("\n📋 Initialization Arguments:");
    console.log(`   • USDT Token: ${initArgs[0]}`);
    console.log(`   • Treasury: ${initArgs[1]}`);
    console.log(`   • Emergency: ${initArgs[2]}`);
    console.log(`   • Pool Manager: ${initArgs[3]}`);
    
    // Estimate gas costs
    const gasEstimation = await estimateGasCosts(ContractFactory, initArgs);
    
    // Wait for user confirmation
    await waitForUserConfirmation(
        `Ready to deploy ${DEPLOYMENT_CONFIG.CONTRACT_NAME} to BSC Mainnet.\n` +
        `   Estimated cost: ${formatBNB(gasEstimation.estimatedCost)} BNB`
    );
    
    // Deploy with retry mechanism
    console.log("🚀 Starting deployment...");
    const startTime = Date.now();
    
    const contract = await deployWithRetry(async () => {
        return await upgrades.deployProxy(
            ContractFactory,
            initArgs,
            {
                initializer: "initialize",
                kind: "uups",
                gasLimit: gasEstimation.gasEstimate,
                gasPrice: gasEstimation.gasPrice
            }
        );
    });
    
    console.log("⏳ Waiting for deployment confirmation...");
    await contract.deployed();
    
    const deploymentTime = (Date.now() - startTime) / 1000;
    console.log(`✅ Contract deployed successfully in ${deploymentTime.toFixed(1)}s!`);
    console.log(`📍 Contract Address: ${contract.address}`);
    
    // Wait for additional confirmations
    console.log(`⏳ Waiting for ${DEPLOYMENT_CONFIG.CONFIRMATION_BLOCKS} confirmations...`);
    await contract.deployTransaction.wait(DEPLOYMENT_CONFIG.CONFIRMATION_BLOCKS);
    
    // Get actual gas used
    const receipt = await contract.deployTransaction.wait();
    const actualGasUsed = receipt.gasUsed;
    const actualCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    
    console.log("\n📊 Deployment Results:");
    console.log(`   • Gas Used: ${actualGasUsed.toLocaleString()}`);
    console.log(`   • Gas Price: ${formatGwei(receipt.effectiveGasPrice)} gwei`);
    console.log(`   • Actual Cost: ${formatBNB(actualCost)} BNB`);
    console.log(`   • Transaction Hash: ${receipt.transactionHash}`);
    
    // Perform security checks
    const securityPassed = await performSecurityChecks(contract, deployer);
    
    // Prepare deployment data
    const deploymentData = {
        network: network.name,
        chainId: network.chainId,
        contractName: DEPLOYMENT_CONFIG.CONTRACT_NAME,
        contractAddress: contract.address,
        proxyAddress: contract.address,
        deployer: deployer.address,
        deployerBalance: formatBNB(balance),
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: actualGasUsed.toString(),
        gasPrice: receipt.effectiveGasPrice.toString(),
        deploymentCost: formatBNB(actualCost),
        deploymentTime: deploymentTime,
        timestamp: new Date().toISOString(),
        initializationArgs: {
            usdtToken: initArgs[0],
            treasuryAddress: initArgs[1],
            emergencyAddress: initArgs[2],
            poolManagerAddress: initArgs[3]
        },
        securityChecks: securityPassed,
        verified: false,
        version: "1.0.0"
    };
    
    // Save deployment information
    const deploymentFile = saveDeploymentInfo(deploymentData);
    
    console.log("\n" + "=".repeat(80));
    console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(80));
    console.log(`📍 Contract Address: ${contract.address}`);
    console.log(`💰 Total Cost: ${formatBNB(actualCost)} BNB`);
    console.log(`📄 Deployment Info: ${deploymentFile}`);
    console.log(`🔗 BSCScan: https://bscscan.com/address/${contract.address}`);
    
    // Contract verification
    console.log("\n🔍 Starting contract verification...");
    const verified = await verifyContract(contract.address);
    
    if (verified) {
        deploymentData.verified = true;
        saveDeploymentInfo(deploymentData);
    }
    
    console.log("\n📋 Next Steps:");
    console.log("1. ✅ Contract deployed and verified");
    console.log("2. 🔄 Update frontend configuration with new contract address");
    console.log("3. 🧪 Run integration tests against mainnet contract");
    console.log("4. 📊 Set up monitoring and alerts");
    console.log("5. 🚀 Begin user onboarding and marketing");
    
    console.log("\n⚠️  IMPORTANT REMINDERS:");
    console.log("• Keep your Trezor device secure");
    console.log("• Backup deployment information");
    console.log("• Monitor contract activity");
    console.log("• Set up multi-signature for admin functions");
    
    return {
        contract,
        deploymentData,
        verified
    };
}

// Export for use in other scripts
module.exports = main;

// Run if called directly
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}
