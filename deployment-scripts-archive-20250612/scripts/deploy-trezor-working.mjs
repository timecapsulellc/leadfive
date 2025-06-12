import { ethers } from 'ethers';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                🔐 WORKING TREZOR DEPLOYMENT SCRIPT 🔐                                 ║
 * ║                                                                                       ║
 * ║  Simplified and working Trezor deployment with proper ethers v6 syntax               ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DEPLOYMENT_CONFIG = {
    NETWORK: "BSC Mainnet",
    RPC_URL: "https://bsc-dataseed.binance.org/",
    CHAIN_ID: 56,
    DERIVATION_PATH: "m/44'/60'/0'/0/0",
    TREZOR_TARGET_ADDRESS: "0xeB652c4523f3Cf615D3F3694b14E551145953aD0",
    USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
    GAS_LIMIT: 6000000,
    GAS_PRICE: ethers.parseUnits("5", "gwei")
};

// Global state
let TrezorConnect;
let provider;
let trezorAddress;
let deployedContracts = {};

async function initializeTrezorConnect() {
    console.log("🔐 Loading TrezorConnect...");
    
    try {
        // Dynamic import for TrezorConnect
        console.log("📦 Attempting dynamic import of @trezor/connect...");
        
        const trezorModule = await import('@trezor/connect');
        console.log("✅ TrezorConnect module loaded");
        
        // The correct structure is module.default.default for TrezorConnect
        if (trezorModule.default && trezorModule.default.default && typeof trezorModule.default.default.init === 'function') {
            TrezorConnect = trezorModule.default.default;
            console.log("✅ Using nested default export");
        } else if (trezorModule.default && typeof trezorModule.default.init === 'function') {
            TrezorConnect = trezorModule.default;
            console.log("✅ Using default export");
        } else if (typeof trezorModule.init === 'function') {
            TrezorConnect = trezorModule;
            console.log("✅ Using named exports");
        } else {
            throw new Error("TrezorConnect.init function not found in any export structure");
        }
        
        console.log("🚀 Initializing TrezorConnect...");
        const result = await TrezorConnect.init({
            lazyLoad: true,
            manifest: {
                email: 'orphi@example.com',
                appUrl: 'https://orphi.com'
            },
            connectSrc: 'https://connect.trezor.io/9/',
            popup: false,
            webusb: false,
            debug: false
        });
        
        if (!result.success) {
            throw new Error(`TrezorConnect initialization failed: ${result.payload?.error || 'Unknown error'}`);
        }
        
        console.log("✅ TrezorConnect initialized successfully");
        return true;
        
    } catch (error) {
        console.error("❌ TrezorConnect initialization failed:", error.message);
        console.log("\n🔧 Troubleshooting steps:");
        console.log("1. Ensure Trezor Bridge is running: https://suite.trezor.io/web/bridge/");
        console.log("2. Check if @trezor/connect is properly installed: npm ls @trezor/connect");
        console.log("3. Try reinstalling: npm uninstall @trezor/connect && npm install @trezor/connect");
        throw error;
    }
}

async function connectTrezor() {
    console.log("🔐 Connecting to Trezor device...");
    console.log("📱 Please confirm address display on your Trezor device");
    
    const result = await TrezorConnect.ethereumGetAddress({
        path: DEPLOYMENT_CONFIG.DERIVATION_PATH,
        showOnTrezor: true
    });
    
    if (!result.success) {
        throw new Error(`Failed to get address: ${result.payload?.error || 'Unknown error'}`);
    }
    
    trezorAddress = result.payload.address;
    console.log(`✅ Trezor address: ${trezorAddress}`);
    
    // Verify address matches expected
    if (trezorAddress.toLowerCase() !== DEPLOYMENT_CONFIG.TREZOR_TARGET_ADDRESS.toLowerCase()) {
        throw new Error(`Address mismatch! Expected: ${DEPLOYMENT_CONFIG.TREZOR_TARGET_ADDRESS}, Got: ${trezorAddress}`);
    }
    
    console.log("✅ Address verification passed");
    return trezorAddress;
}

async function checkBalance() {
    const balance = await provider.getBalance(trezorAddress);
    const balanceInBNB = ethers.formatEther(balance);
    
    console.log(`💰 Trezor wallet balance: ${balanceInBNB} BNB`);
    
    if (parseFloat(balanceInBNB) < 0.1) {
        throw new Error("❌ Insufficient balance! Need at least 0.1 BNB for deployment.");
    }
    
    return balanceInBNB;
}

async function loadContract(contractName) {
    const possiblePaths = [
        join(__dirname, '..', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`),
        join(__dirname, '..', 'artifacts', 'contracts', 'modules', `${contractName}.sol`, `${contractName}.json`),
        join(__dirname, '..', 'build', 'contracts', `${contractName}.json`),
        join(__dirname, '..', 'out', `${contractName}.sol`, `${contractName}.json`)
    ];
    
    for (const path of possiblePaths) {
        try {
            if (fs.existsSync(path)) {
                const contractJson = JSON.parse(fs.readFileSync(path, 'utf8'));
                console.log(`✅ Loaded ${contractName} from: ${path}`);
                return contractJson;
            }
        } catch (error) {
            continue;
        }
    }
    
    throw new Error(`Could not find compiled contract: ${contractName}`);
}

async function deployContract(contractName, constructorArgs = []) {
    console.log(`\n🚀 Deploying ${contractName}...`);
    
    const contractJson = await loadContract(contractName);
    const factory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode);
    
    // Prepare deployment transaction
    const deploymentData = factory.interface.encodeDeploy(constructorArgs);
    const nonce = await provider.getTransactionCount(trezorAddress, 'latest');
    
    const txData = {
        to: null, // Contract creation
        value: "0x0",
        gasLimit: ethers.toBeHex(DEPLOYMENT_CONFIG.GAS_LIMIT),
        gasPrice: ethers.toBeHex(DEPLOYMENT_CONFIG.GAS_PRICE),
        nonce: ethers.toBeHex(nonce),
        data: factory.bytecode + deploymentData.slice(2),
        chainId: DEPLOYMENT_CONFIG.CHAIN_ID
    };
    
    console.log("📋 Transaction details:");
    console.log(`   Nonce: ${nonce}`);
    console.log(`   Gas Limit: ${DEPLOYMENT_CONFIG.GAS_LIMIT}`);
    console.log(`   Gas Price: ${ethers.formatUnits(DEPLOYMENT_CONFIG.GAS_PRICE, 'gwei')} gwei`);
    
    console.log("🔐 Please confirm transaction on Trezor device...");
    const result = await TrezorConnect.ethereumSignTransaction({
        path: DEPLOYMENT_CONFIG.DERIVATION_PATH,
        transaction: txData
    });
    
    if (!result.success) {
        throw new Error(`Transaction signing failed: ${result.payload?.error || 'Unknown error'}`);
    }
    
    console.log("✅ Transaction signed successfully");
    console.log("📡 Broadcasting transaction...");
    
    // Broadcast the signed transaction
    const tx = ethers.Transaction.from({
        to: txData.to,
        value: txData.value,
        gasLimit: txData.gasLimit,
        gasPrice: txData.gasPrice,
        nonce: txData.nonce,
        data: txData.data,
        chainId: txData.chainId,
        signature: {
            r: "0x" + result.payload.r,
            s: "0x" + result.payload.s,
            v: parseInt(result.payload.v, 16)
        }
    });
    
    const txResponse = await provider.broadcastTransaction(tx.serialized);
    console.log(`🚀 Transaction hash: ${txResponse.hash}`);
    
    // Wait for confirmation
    console.log("⏳ Waiting for confirmation...");
    const receipt = await txResponse.wait(1);
    
    if (!receipt.contractAddress) {
        throw new Error("Contract deployment failed - no address returned");
    }
    
    console.log(`✅ ${contractName} deployed successfully!`);
    console.log(`📍 Contract address: ${receipt.contractAddress}`);
    console.log(`🔗 BSCScan: https://bscscan.com/address/${receipt.contractAddress}`);
    
    // Create contract instance
    const contract = new ethers.Contract(receipt.contractAddress, contractJson.abi, provider);
    
    deployedContracts[contractName] = {
        address: receipt.contractAddress,
        contract: contract,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
    };
    
    return contract;
}

async function verifyOwnership(contract, expectedOwner) {
    console.log("\n🔍 Verifying contract ownership...");
    
    try {
        const owner = await contract.owner();
        const isCorrect = owner.toLowerCase() === expectedOwner.toLowerCase();
        
        console.log(`📋 Contract owner: ${owner}`);
        console.log(`📋 Expected owner: ${expectedOwner}`);
        console.log(`${isCorrect ? '✅' : '❌'} Ownership verification: ${isCorrect ? 'PASSED' : 'FAILED'}`);
        
        return isCorrect;
    } catch (error) {
        console.error("❌ Failed to verify ownership:", error.message);
        return false;
    }
}

async function saveDeploymentInfo() {
    const deploymentInfo = {
        network: DEPLOYMENT_CONFIG.NETWORK,
        chainId: DEPLOYMENT_CONFIG.CHAIN_ID,
        deployer: trezorAddress,
        timestamp: new Date().toISOString(),
        contracts: deployedContracts,
        verified: true,
        securityLevel: "MAXIMUM",
        deploymentMethod: "DIRECT_TREZOR"
    };
    
    const filename = `deployment-${Date.now()}.json`;
    const filepath = join(__dirname, '..', 'deployments', filename);
    
    // Ensure deployments directory exists
    const deploymentsDir = dirname(filepath);
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${filepath}`);
    
    return filepath;
}

async function main() {
    console.log("╔═══════════════════════════════════════════════════════════════════════════════════════╗");
    console.log("║                🔐 WORKING TREZOR DEPLOYMENT 🔐                                       ║");
    console.log("╚═══════════════════════════════════════════════════════════════════════════════════════╝");
    
    try {
        // Initialize provider
        provider = new ethers.JsonRpcProvider(DEPLOYMENT_CONFIG.RPC_URL);
        console.log(`🌐 Connected to ${DEPLOYMENT_CONFIG.NETWORK}`);
        
        // Initialize TrezorConnect
        await initializeTrezorConnect();
        
        // Connect to Trezor
        await connectTrezor();
        
        // Check balance
        await checkBalance();
        
        console.log("\n🚀 Starting deployment process...");
        console.log("⚠️  IMPORTANT: Confirm each transaction on your Trezor device!");
        
        // Deploy InternalAdminManager
        const adminManager = await deployContract('InternalAdminManager');
        
        // Deploy OrphiCrowdFund
        const crowdFund = await deployContract('OrphiCrowdFund', [
            DEPLOYMENT_CONFIG.USDT_ADDRESS,
            trezorAddress, // Owner (Trezor address)
            adminManager.target
        ]);
        
        // Verify ownership
        const ownershipVerified = await verifyOwnership(crowdFund, trezorAddress);
        
        if (!ownershipVerified) {
            throw new Error("Ownership verification failed!");
        }
        
        // Save deployment information
        const deploymentFile = await saveDeploymentInfo();
        
        console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
        console.log("╔═══════════════════════════════════════════════════════════════════════════════════════╗");
        console.log("║                          📋 DEPLOYMENT SUMMARY 📋                                    ║");
        console.log("╠═══════════════════════════════════════════════════════════════════════════════════════╣");
        console.log(`║ Network: ${DEPLOYMENT_CONFIG.NETWORK.padEnd(73)} ║`);
        console.log(`║ Deployer: ${trezorAddress.padEnd(71)} ║`);
        console.log(`║ InternalAdminManager: ${deployedContracts.InternalAdminManager.address.padEnd(55)} ║`);
        console.log(`║ OrphiCrowdFund: ${deployedContracts.OrphiCrowdFund.address.padEnd(61)} ║`);
        console.log(`║ Deployment File: ${deploymentFile.split('/').pop().padEnd(65)} ║`);
        console.log("╚═══════════════════════════════════════════════════════════════════════════════════════╝");
        
        console.log("\n✅ SECURITY CHECKLIST:");
        console.log("✅ All contracts deployed with Trezor signature");
        console.log("✅ Contract ownership assigned to Trezor address");
        console.log("✅ No private keys exposed or stored");
        console.log("✅ Deployment information saved");
        
        console.log("\n📋 NEXT STEPS:");
        console.log("1. Verify contracts on BSCScan");
        console.log("2. Update frontend configuration");
        console.log("3. Run post-deployment security tests");
        console.log("4. Test admin functions with Trezor");
        
    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED:");
        console.error(error.message);
        
        if (error.message.includes('TrezorConnect')) {
            console.log("\n🔧 TrezorConnect troubleshooting:");
            console.log("1. Ensure Trezor Bridge is running");
            console.log("2. Check Trezor device connection");
            console.log("3. Try the web-based deployment interface");
        }
        
        process.exit(1);
    }
}

// Handle cleanup
process.on('SIGINT', () => {
    console.log('\n🛑 Deployment interrupted by user');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error.message);
    process.exit(1);
});

// Run the deployment
main().catch(console.error);
