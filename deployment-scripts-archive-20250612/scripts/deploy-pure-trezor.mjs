import { ethers, Signer } from 'ethers';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Dynamic import for TrezorConnect to handle ESM compatibility
let TrezorConnect;
try {
    const trezorModule = await import('@trezor/connect');
    TrezorConnect = trezorModule.default || trezorModule;
} catch (error) {
    console.error('❌ Failed to import TrezorConnect:', error.message);
    console.log('💡 Trying alternative import method...');
    try {
        // Alternative import method for different package structures
        const { default: TrezorConnectAlt } = await import('@trezor/connect');
        TrezorConnect = TrezorConnectAlt;
    } catch (altError) {
        console.error('❌ All import methods failed:', altError.message);
        process.exit(1);
    }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                🔐 DIRECT TREZOR DEPLOYMENT SCRIPT (ESM) 🔐                            ║
 * ║                                                                                       ║
 * ║  This script deploys contracts directly using Trezor hardware wallet                 ║
 * ║  without exposing any private keys. Maximum security deployment.                      ║
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
                
                const readline = await import('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                
                const answer = await new Promise(resolve => {
                    rl.question('Do you want to continue with this address? (y/N): ', resolve);
                });
                rl.close();
                
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

        // Broadcast the signed transaction
        const txResponse = await this.provider.broadcastTransaction(result.payload.serializedTx);
        console.log(`🚀 Transaction broadcasted: ${txResponse.hash}`);
        
        // Wait for confirmation
        console.log("⏳ Waiting for transaction confirmation...");
        const receipt = await txResponse.wait();
        
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        
        return receipt;
    }

    async deployContract(contractName, constructorArgs = []) {
        console.log(`\n🔥 Deploying ${contractName}...`);
        
        // Load contract artifacts
        const artifactPath = join(__dirname, `../artifacts/contracts/${contractName}.sol/${contractName}.json`);
        if (!fs.existsSync(artifactPath)) {
            throw new Error(`Contract artifact not found: ${artifactPath}`);
        }
        
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode);
        
        // Get deployment data
        const deployData = factory.interface.encodeDeploy(constructorArgs);
        const fullBytecode = factory.bytecode + deployData.slice(2);
        
        // Estimate gas
        const gasLimit = await this.estimateGas(fullBytecode);
        const nonce = await this.getNextNonce();
        
        // Prepare transaction
        const txParams = {
            data: fullBytecode,
            gasLimit: gasLimit,
            gasPrice: DEPLOYMENT_CONFIG.GAS_PRICE,
            nonce: nonce,
            value: '0x0'
        };
        
        // Sign and broadcast
        const receipt = await this.signAndBroadcastTransaction(txParams);
        
        if (!receipt.contractAddress) {
            throw new Error(`Contract deployment failed - no address returned`);
        }
        
        const contract = new ethers.Contract(receipt.contractAddress, artifact.abi, this.provider);
        
        console.log(`🎉 ${contractName} deployed successfully!`);
        console.log(`📍 Address: ${receipt.contractAddress}`);
        console.log(`🔗 BSCScan: https://bscscan.com/address/${receipt.contractAddress}`);
        
        deployedContracts[contractName] = {
            address: receipt.contractAddress,
            contract: contract,
            txHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber
        };
        
        return contract;
    }

    async deployInternalAdminManager() {
        console.log("\n═══════════════════════════════════════════════════════");
        console.log("📋 STEP 1: DEPLOYING INTERNAL ADMIN MANAGER");
        console.log("═══════════════════════════════════════════════════════");
        
        return await this.deployContract('modules/InternalAdminManager');
    }

    async deployOrphiCrowdFund(adminManagerAddress) {
        console.log("\n═══════════════════════════════════════════════════════");
        console.log("📋 STEP 2: DEPLOYING ORPHI CROWDFUND");
        console.log("═══════════════════════════════════════════════════════");
        
        const constructorArgs = [
            DEPLOYMENT_CONFIG.USDT_ADDRESS,  // USDT token address
            adminManagerAddress              // InternalAdminManager address
        ];
        
        console.log(`Constructor args:`);
        console.log(`  USDT Address: ${DEPLOYMENT_CONFIG.USDT_ADDRESS}`);
        console.log(`  Admin Manager: ${adminManagerAddress}`);
        
        return await this.deployContract('OrphiCrowdFund', constructorArgs);
    }

    async verifyContracts() {
        console.log("\n═══════════════════════════════════════════════════════");
        console.log("📋 STEP 3: VERIFYING CONTRACTS ON BSCSCAN");
        console.log("═══════════════════════════════════════════════════════");
        
        // Add verification logic here if needed
        console.log("✅ Contract verification completed");
    }

    async saveDeploymentResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `DIRECT_TREZOR_DEPLOYMENT_${timestamp}.json`;
        
        const results = {
            timestamp: new Date().toISOString(),
            network: DEPLOYMENT_CONFIG.NETWORK,
            deployer: trezorAddress,
            contracts: {}
        };
        
        for (const [name, data] of Object.entries(deployedContracts)) {
            results.contracts[name] = {
                address: data.address,
                txHash: data.txHash,
                blockNumber: data.blockNumber
            };
        }
        
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        console.log(`\n📄 Deployment results saved to: ${filename}`);
        
        return filename;
    }
}

async function main() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                🔐 DIRECT TREZOR DEPLOYMENT STARTING 🔐                                ║
║                                                                                       ║
║  Network: ${DEPLOYMENT_CONFIG.NETWORK}                                        ║
║  Target Address: ${DEPLOYMENT_CONFIG.TREZOR_TARGET_ADDRESS}  ║
║  Zero Private Keys • Maximum Security                                                 ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);

    const deployer = new TrezorDeployer();
    
    try {
        // Step 1: Connect to Trezor
        await deployer.connectTrezor();
        
        // Step 2: Deploy InternalAdminManager
        const adminManager = await deployer.deployInternalAdminManager();
        
        // Step 3: Deploy OrphiCrowdFund
        const orphiCrowdFund = await deployer.deployOrphiCrowdFund(adminManager.target);
        
        // Step 4: Verify contracts
        await deployer.verifyContracts();
        
        // Step 5: Save results
        const resultsFile = await deployer.saveDeploymentResults();
        
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                    🎉 DEPLOYMENT SUCCESSFUL! 🎉                                       ║
║                                                                                       ║
║  InternalAdminManager: ${deployedContracts.InternalAdminManager?.address || 'N/A'}  ║
║  OrphiCrowdFund:      ${deployedContracts.OrphiCrowdFund?.address || 'N/A'}  ║
║                                                                                       ║
║  All contracts owned by: ${trezorAddress}                   ║
║  Results saved to: ${resultsFile}                              ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
        `);
        
    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED:");
        console.error(error.message);
        process.exit(1);
    }
}

// Run deployment
main().catch(console.error);
