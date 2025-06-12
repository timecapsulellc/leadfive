const TrezorConnect = require('@trezor/connect').default;
const { ethers } = require('ethers');
const fs = require('fs');

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                    🔐 DIRECT TREZOR DEPLOYMENT SCRIPT 🔐                              ║
 * ║                                                                                       ║
 * ║  This script deploys contracts directly using Trezor hardware wallet                 ║
 * ║  without exposing any private keys. Maximum security deployment.                      ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 */

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
let provider;
let trezorAddress;
let deployedContracts = {};

class TrezorDeployer {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(DEPLOYMENT_CONFIG.RPC_URL);
        this.initialized = false;
    }

    async initialize() {
        console.log("🔐 Initializing Trezor Connect...");
        
        try {
            await TrezorConnect.init({
                lazyLoad: true,
                manifest: {
                    email: 'orphi@example.com',
                    appUrl: 'https://orphi.com'
                },
                debug: false,
                popup: false
            });
            
            this.initialized = true;
            console.log("✅ Trezor Connect initialized");
            
            // Wait a moment for initialization to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error("❌ Trezor Connect initialization failed:", error.message);
            console.log("\n🔧 Troubleshooting:");
            console.log("1. Ensure Trezor Bridge is running");
            console.log("2. Check device connection");
            console.log("3. Try running: ./setup-trezor-connection.sh");
            throw error;
        }
    }

    async connectTrezor() {
        if (!this.initialized) {
            await this.initialize();
        }

        console.log("🔌 Connecting to Trezor device...");
        console.log("📱 Please look at your Trezor device and confirm the address display");
        console.log("⚠️  Make sure to press the RIGHT button on your Trezor to confirm");

        try {
            const result = await TrezorConnect.ethereumGetAddress({
                path: DEPLOYMENT_CONFIG.DERIVATION_PATH,
                showOnTrezor: true
            });

            if (!result.success) {
                console.error("❌ Trezor connection failed");
                console.log("🔧 Troubleshooting:");
                console.log("1. Device connected and unlocked?");
                console.log("2. Ethereum app enabled on device?");
                console.log("3. Trezor Bridge running?");
                console.log("4. Did you confirm on the device?");
                throw new Error(`Failed to connect Trezor: ${result.payload.error}`);
            }

            trezorAddress = result.payload.address;
            console.log(`✅ Trezor connected successfully!`);
            console.log(`📍 Address: ${trezorAddress}`);

            // Verify this is the expected address
            if (trezorAddress.toLowerCase() !== DEPLOYMENT_CONFIG.TREZOR_TARGET_ADDRESS.toLowerCase()) {
                console.log(`⚠️  WARNING: Connected address (${trezorAddress}) does not match expected address (${DEPLOYMENT_CONFIG.TREZOR_TARGET_ADDRESS})`);
                
                const readline = require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                
                const answer = await new Promise(resolve => {
                    readline.question('Do you want to continue with this address? (y/N): ', resolve);
                });
                readline.close();
                
                if (answer.toLowerCase() !== 'y') {
                    throw new Error('Deployment cancelled by user');
                }
            }

            // Check balance
            const balance = await this.provider.getBalance(trezorAddress);
            console.log(`💰 Trezor balance: ${ethers.formatEther(balance)} BNB`);
            
            const minBalance = ethers.parseEther("0.1");
            if (balance < minBalance) {
                throw new Error(`❌ Insufficient BNB! Need at least 0.1 BNB for deployment`);
            }

            return trezorAddress;

        } catch (error) {
            if (error.message.includes('Permissions not granted')) {
                console.log("❌ Permission denied - please approve the connection on your Trezor device");
            } else if (error.message.includes('Device disconnected')) {
                console.log("❌ Device disconnected - please reconnect your Trezor");
            }
            throw error;
        }
    }

    async getNextNonce() {
        const nonce = await this.provider.getTransactionCount(trezorAddress, 'latest');
        console.log(`📊 Current nonce: ${nonce}`);
        return nonce;
    }

    async estimateGas(txData) {
        try {
            const gasEstimate = await this.provider.estimateGas({
                from: trezorAddress,
                data: txData
            });
            console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
            return gasEstimate;
        } catch (error) {
            console.log(`⚠️  Gas estimation failed, using default: ${DEPLOYMENT_CONFIG.GAS_LIMIT}`);
            return DEPLOYMENT_CONFIG.GAS_LIMIT;
        }
    }

    async signAndBroadcastTransaction(txParams) {
        console.log("📝 Preparing transaction for Trezor signing...");
        console.log(`   To: ${txParams.to || '(Contract Creation)'}`);
        console.log(`   Gas Limit: ${txParams.gasLimit}`);
        console.log(`   Gas Price: ${ethers.formatUnits(txParams.gasPrice, 'gwei')} gwei`);
        console.log(`   Nonce: ${txParams.nonce}`);
        
        console.log("\n🔐 Please confirm transaction on your Trezor device...");

        const result = await TrezorConnect.ethereumSignTransaction({
            path: DEPLOYMENT_CONFIG.DERIVATION_PATH,
            transaction: {
                to: txParams.to || '',
                value: txParams.value || '0x0',
                data: txParams.data || '0x',
                gasLimit: `0x${txParams.gasLimit.toString(16)}`,
                gasPrice: `0x${txParams.gasPrice.toString(16)}`,
                nonce: `0x${txParams.nonce.toString(16)}`,
                chainId: DEPLOYMENT_CONFIG.CHAIN_ID
            }
        });

        if (!result.success) {
            throw new Error(`Transaction signing failed: ${result.payload.error}`);
        }

        console.log("✅ Transaction signed by Trezor");
        console.log("📡 Broadcasting transaction...");

        const txResponse = await this.provider.broadcastTransaction(result.payload.serializedTx);
        console.log(`📨 Transaction sent: ${txResponse.hash}`);

        console.log("⏳ Waiting for confirmation...");
        const receipt = await txResponse.wait(3); // Wait for 3 confirmations
        
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        return receipt;
    }

    async deployInternalAdminManager() {
        console.log("\n🏗️  DEPLOYING INTERNAL ADMIN MANAGER");
        console.log("═".repeat(50));

        // Load contract artifacts
        const AdminManagerArtifact = require('./artifacts/contracts/modules/InternalAdminManager.sol/InternalAdminManager.json');
        
        // Create contract factory
        const factory = new ethers.ContractFactory(
            AdminManagerArtifact.abi,
            AdminManagerArtifact.bytecode,
            this.provider
        );

        // Prepare constructor parameters
        const constructorArgs = [
            trezorAddress, // owner
            trezorAddress  // superAdmin
        ];

        console.log(`👤 Owner: ${constructorArgs[0]}`);
        console.log(`🔧 Super Admin: ${constructorArgs[1]}`);

        // Get deployment data
        const deploymentData = factory.interface.encodeDeploy(constructorArgs);
        const fullDeploymentData = AdminManagerArtifact.bytecode + deploymentData.slice(2);

        // Estimate gas
        const gasLimit = await this.estimateGas(fullDeploymentData);
        const nonce = await this.getNextNonce();

        // Deploy contract
        const receipt = await this.signAndBroadcastTransaction({
            data: fullDeploymentData,
            gasLimit: gasLimit,
            gasPrice: DEPLOYMENT_CONFIG.GAS_PRICE,
            nonce: nonce
        });

        const contractAddress = receipt.contractAddress;
        deployedContracts.internalAdminManager = contractAddress;

        console.log(`✅ InternalAdminManager deployed at: ${contractAddress}`);
        return contractAddress;
    }

    async deployOrphiCrowdFund() {
        console.log("\n🏗️  DEPLOYING ORPHI CROWDFUND");
        console.log("═".repeat(50));

        // Load contract artifacts
        const OrphiCrowdFundArtifact = require('./artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json');
        
        // Create contract factory
        const factory = new ethers.ContractFactory(
            OrphiCrowdFundArtifact.abi,
            OrphiCrowdFundArtifact.bytecode,
            this.provider
        );

        // Prepare constructor parameters
        const constructorArgs = [
            DEPLOYMENT_CONFIG.USDT_ADDRESS, // USDT token address
            trezorAddress,                  // treasury
            trezorAddress,                  // emergency
            trezorAddress                   // poolManager
        ];

        console.log(`💰 USDT Address: ${constructorArgs[0]}`);
        console.log(`🏦 Treasury: ${constructorArgs[1]}`);
        console.log(`🚨 Emergency: ${constructorArgs[2]}`);
        console.log(`🎱 Pool Manager: ${constructorArgs[3]}`);

        // Get deployment data
        const deploymentData = factory.interface.encodeDeploy(constructorArgs);
        const fullDeploymentData = OrphiCrowdFundArtifact.bytecode + deploymentData.slice(2);

        // Estimate gas
        const gasLimit = await this.estimateGas(fullDeploymentData);
        const nonce = await this.getNextNonce();

        // Deploy contract
        const receipt = await this.signAndBroadcastTransaction({
            data: fullDeploymentData,
            gasLimit: gasLimit,
            gasPrice: DEPLOYMENT_CONFIG.GAS_PRICE,
            nonce: nonce
        });

        const contractAddress = receipt.contractAddress;
        deployedContracts.orphiCrowdFund = contractAddress;

        console.log(`✅ OrphiCrowdFund deployed at: ${contractAddress}`);
        return contractAddress;
    }

    async configureContracts() {
        console.log("\n⚙️  CONFIGURING CONTRACT INTEGRATION");
        console.log("═".repeat(50));

        // Load contract ABIs
        const AdminManagerArtifact = require('./artifacts/contracts/modules/InternalAdminManager.sol/InternalAdminManager.json');
        const OrphiCrowdFundArtifact = require('./artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json');

        // Create contract instances
        const adminManager = new ethers.Contract(
            deployedContracts.internalAdminManager,
            AdminManagerArtifact.abi,
            this.provider
        );

        const orphiCrowdFund = new ethers.Contract(
            deployedContracts.orphiCrowdFund,
            OrphiCrowdFundArtifact.abi,
            this.provider
        );

        // 1. Link AdminManager to main contract
        console.log("🔗 Linking AdminManager to main contract...");
        const linkTxData = adminManager.interface.encodeFunctionData('updateOrphiContract', [deployedContracts.orphiCrowdFund]);
        
        let nonce = await this.getNextNonce();
        await this.signAndBroadcastTransaction({
            to: deployedContracts.internalAdminManager,
            data: linkTxData,
            gasLimit: 200000,
            gasPrice: DEPLOYMENT_CONFIG.GAS_PRICE,
            nonce: nonce
        });

        // 2. Initialize InternalAdminManager integration
        console.log("🔧 Initializing InternalAdminManager integration...");
        const initTxData = orphiCrowdFund.interface.encodeFunctionData('initializeInternalAdminManager', [
            deployedContracts.internalAdminManager,
            true // enable internal admins
        ]);

        nonce = await this.getNextNonce();
        await this.signAndBroadcastTransaction({
            to: deployedContracts.orphiCrowdFund,
            data: initTxData,
            gasLimit: 200000,
            gasPrice: DEPLOYMENT_CONFIG.GAS_PRICE,
            nonce: nonce
        });

        console.log("✅ Contract configuration completed");
    }

    async verifyOwnership() {
        console.log("\n🔍 VERIFYING OWNERSHIP");
        console.log("═".repeat(50));

        // Load contract ABIs
        const AdminManagerArtifact = require('./artifacts/contracts/modules/InternalAdminManager.sol/InternalAdminManager.json');
        const OrphiCrowdFundArtifact = require('./artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json');

        // Check AdminManager ownership
        const adminManager = new ethers.Contract(
            deployedContracts.internalAdminManager,
            AdminManagerArtifact.abi,
            this.provider
        );

        const adminOwner = await adminManager.owner();
        console.log(`🔐 InternalAdminManager owner: ${adminOwner}`);
        
        if (adminOwner.toLowerCase() === trezorAddress.toLowerCase()) {
            console.log("✅ InternalAdminManager ownership verified");
        } else {
            console.log("❌ InternalAdminManager ownership MISMATCH!");
        }

        // Check OrphiCrowdFund ownership
        const orphiCrowdFund = new ethers.Contract(
            deployedContracts.orphiCrowdFund,
            OrphiCrowdFundArtifact.abi,
            this.provider
        );

        const mainOwner = await orphiCrowdFund.owner();
        console.log(`🔐 OrphiCrowdFund owner: ${mainOwner}`);
        
        if (mainOwner.toLowerCase() === trezorAddress.toLowerCase()) {
            console.log("✅ OrphiCrowdFund ownership verified");
        } else {
            console.log("❌ OrphiCrowdFund ownership MISMATCH!");
        }

        return adminOwner.toLowerCase() === trezorAddress.toLowerCase() && 
               mainOwner.toLowerCase() === trezorAddress.toLowerCase();
    }

    async saveDeploymentResults() {
        const deploymentData = {
            timestamp: new Date().toISOString(),
            network: DEPLOYMENT_CONFIG.NETWORK,
            chainId: DEPLOYMENT_CONFIG.CHAIN_ID,
            deployerAddress: trezorAddress,
            securityModel: "DIRECT_TREZOR_DEPLOYMENT",
            contracts: deployedContracts,
            verified: true
        };

        const filename = `DIRECT_TREZOR_DEPLOYMENT_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
        console.log(`💾 Deployment results saved to: ${filename}`);
        
        return filename;
    }
}

async function main() {
    try {
        console.log("🔐 STARTING DIRECT TREZOR DEPLOYMENT");
        console.log("═".repeat(80));
        console.log("🛡️  MAXIMUM SECURITY: No private keys exposed");
        console.log("🔐 All transactions require Trezor confirmation");
        console.log("═".repeat(80));

        const deployer = new TrezorDeployer();
        
        // Step 1: Connect Trezor
        await deployer.connectTrezor();

        // Step 2: Deploy InternalAdminManager
        await deployer.deployInternalAdminManager();

        // Step 3: Deploy OrphiCrowdFund
        await deployer.deployOrphiCrowdFund();

        // Step 4: Configure contracts
        await deployer.configureContracts();

        // Step 5: Verify ownership
        const ownershipVerified = await deployer.verifyOwnership();

        // Step 6: Save results
        const resultsFile = await deployer.saveDeploymentResults();

        console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
        console.log("═".repeat(80));
        console.log(`📊 InternalAdminManager: ${deployedContracts.internalAdminManager}`);
        console.log(`📊 OrphiCrowdFund: ${deployedContracts.orphiCrowdFund}`);
        console.log(`🔐 Owner: ${trezorAddress} (Trezor)`);
        console.log(`✅ Ownership Verified: ${ownershipVerified ? 'YES' : 'NO'}`);
        console.log(`💾 Results: ${resultsFile}`);
        console.log("═".repeat(80));

        console.log("\n📋 NEXT STEPS:");
        console.log("1. Verify contracts on BSCScan");
        console.log("2. Update frontend with new contract addresses");
        console.log("3. Test admin functions with Trezor");
        console.log("4. Update documentation");

        // Cleanup
        TrezorConnect.dispose();

    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED:");
        console.error(error.message);
        console.error("\n🔍 Please check:");
        console.error("- Trezor device is connected and unlocked");
        console.error("- BSC network is accessible");
        console.error("- Sufficient BNB for gas fees");
        console.error("- Contract artifacts are compiled");
        
        // Cleanup on error
        try {
            TrezorConnect.dispose();
        } catch (e) {
            // Ignore cleanup errors
        }
        
        process.exit(1);
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { TrezorDeployer };
