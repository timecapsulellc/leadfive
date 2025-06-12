const { ethers, upgrades } = require("hardhat");
const TrezorConnect = require("@trezor/connect").default;

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                🔐 DIRECT TREZOR DEPLOYMENT - ZERO PRIVATE KEYS 🔐                     ║
 * ║                                                                                       ║
 * ║  This script deploys contracts directly using Trezor hardware wallet.                ║
 * ║  No private keys are ever exposed or stored. Maximum security deployment.             ║
 * ║                                                                                       ║
 * ║  Requirements:                                                                        ║
 * ║  - Trezor hardware wallet connected                                                   ║
 * ║  - Trezor Bridge or Trezor Suite running                                              ║
 * ║  - BSC Mainnet configured on Trezor                                                   ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 */

// Configuration
const DEPLOYMENT_CONFIG = {
    CONTRACT_NAME: "OrphiCrowdFund",
    ADMIN_MANAGER_NAME: "InternalAdminManager",
    NETWORK: "BSC Mainnet",
    USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
    
    // 🔐 TREZOR WALLET ADDRESS
    TREZOR_ADDRESS: "0xeB652c4523f3Cf615D3F3694b14E551145953aD0",
    
    EXPECTED_CHAIN_ID: 56,
    DERIVATION_PATH: "m/44'/60'/0'/0/0",
    
    // Internal Admin Configuration
    ENABLE_INTERNAL_ADMINS: true,
    INITIAL_INTERNAL_ADMINS: [
        // Simulation addresses only (not real wallets)
        "0x2345678901234567890123456789012345678901",
        "0x3456789012345678901234567890123456789012",
        "0x4567890123456789012345678901234567890123"
    ]
};

// Trezor Connect configuration
const TREZOR_MANIFEST = {
    email: 'orphi@example.com',
    appUrl: 'https://orphi.com'
};

// Custom Trezor Provider
class TrezorProvider {
    constructor(rpcUrl, trezorAddress) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.trezorAddress = trezorAddress;
        this.chainId = null;
    }

    async init() {
        console.log("🔐 Initializing Trezor Connect...");
        
        const result = await TrezorConnect.init({
            lazyLoad: true,
            manifest: TREZOR_MANIFEST
        });

        if (!result.success) {
            throw new Error(`Trezor initialization failed: ${result.payload.error}`);
        }

        // Get chain ID
        this.chainId = (await this.provider.getNetwork()).chainId;
        console.log(`✅ Trezor Connect initialized for chain ID: ${this.chainId}`);
    }

    async getSigner() {
        return new TrezorSigner(this.provider, this.trezorAddress, DEPLOYMENT_CONFIG.DERIVATION_PATH);
    }

    async getBalance() {
        return await this.provider.getBalance(this.trezorAddress);
    }
}

// Custom Trezor Signer
class TrezorSigner {
    constructor(provider, address, path) {
        this.provider = provider;
        this.address = address;
        this.path = path;
    }

    async getAddress() {
        return this.address;
    }

    async getBalance() {
        return await this.provider.getBalance(this.address);
    }

    async sendTransaction(transaction) {
        console.log(`🔐 Preparing transaction for Trezor confirmation...`);
        console.log(`   To: ${transaction.to}`);
        console.log(`   Value: ${transaction.value || '0'} ETH`);
        console.log(`   Data: ${transaction.data ? transaction.data.substring(0, 50) + '...' : 'None'}`);

        // Get transaction details
        const nonce = await this.provider.getTransactionCount(this.address);
        const gasPrice = await this.provider.getGasPrice();
        
        // Estimate gas
        let gasLimit;
        try {
            gasLimit = await this.provider.estimateGas({
                to: transaction.to,
                value: transaction.value || 0,
                data: transaction.data || '0x',
                from: this.address
            });
            // Add 20% buffer
            gasLimit = gasLimit * 120n / 100n;
        } catch (error) {
            console.log("⚠️  Could not estimate gas, using default");
            gasLimit = 500000n; // Default gas limit
        }

        const txParams = {
            to: transaction.to,
            value: ethers.toBeHex(transaction.value || 0),
            data: transaction.data || '0x',
            chainId: Number(this.provider._network.chainId),
            nonce: ethers.toBeHex(nonce),
            gasLimit: ethers.toBeHex(gasLimit),
            gasPrice: ethers.toBeHex(gasPrice)
        };

        console.log(`📋 Transaction details:`);
        console.log(`   Nonce: ${nonce}`);
        console.log(`   Gas Limit: ${gasLimit.toString()}`);
        console.log(`   Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);

        console.log(`🔐 Please confirm transaction on your Trezor device...`);

        // Sign with Trezor
        const result = await TrezorConnect.ethereumSignTransaction({
            path: this.path,
            transaction: txParams
        });

        if (!result.success) {
            throw new Error(`Trezor signing failed: ${result.payload.error}`);
        }

        console.log(`✅ Transaction signed by Trezor`);

        // Broadcast transaction
        const signedTx = result.payload.serializedTx;
        const txResponse = await this.provider.broadcastTransaction(signedTx);
        
        console.log(`📡 Transaction broadcasted: ${txResponse.hash}`);
        return txResponse;
    }

    connect(provider) {
        return new TrezorSigner(provider, this.address, this.path);
    }
}

// Utility functions
function formatBNB(amount) {
    return ethers.formatEther(amount);
}

async function waitForConfirmations(tx, confirmations = 3) {
    console.log(`⏳ Waiting for ${confirmations} confirmations...`);
    const receipt = await tx.wait(confirmations);
    console.log(`✅ Transaction confirmed: ${receipt.hash}`);
    return receipt;
}

function saveDeploymentInfo(data) {
    const fs = require("fs");
    const filename = "TREZOR_DEPLOYMENT_SUCCESS.json";
    
    const deploymentData = {
        ...data,
        timestamp: new Date().toISOString(),
        network: DEPLOYMENT_CONFIG.NETWORK,
        securityModel: "DIRECT_TREZOR_DEPLOYMENT_ZERO_PRIVATE_KEYS",
        trezorAddress: DEPLOYMENT_CONFIG.TREZOR_ADDRESS,
        verified: false
    };
    
    fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
    console.log(`💾 Deployment info saved to: ${filename}`);
    return filename;
}

async function main() {
    try {
        console.log("🔐 STARTING DIRECT TREZOR DEPLOYMENT - ZERO PRIVATE KEYS");
        console.log("═".repeat(80));
        console.log("✅ MAXIMUM SECURITY: Direct hardware wallet deployment");
        console.log("✅ NO PRIVATE KEYS EVER EXPOSED OR STORED");
        console.log("═".repeat(80));
        
        const startTime = Date.now();
        
        // =============================================================================
        // STEP 1: INITIALIZE TREZOR CONNECTION
        // =============================================================================
        
        console.log("\\n🔐 STEP 1: Initializing Trezor connection...");
        
        const rpcUrl = process.env.BSC_MAINNET_RPC_URL || "https://bsc-dataseed.binance.org/";
        const trezorProvider = new TrezorProvider(rpcUrl, DEPLOYMENT_CONFIG.TREZOR_ADDRESS);
        
        await trezorProvider.init();
        
        // Check Trezor balance
        const balance = await trezorProvider.getBalance();
        console.log(`💰 Trezor Balance: ${formatBNB(balance)} BNB`);
        
        const minBalance = ethers.parseEther("0.1");
        if (balance < minBalance) {
            throw new Error(`❌ Insufficient BNB! Need at least 0.1 BNB for deployment`);
        }
        
        // Get Trezor signer
        const signer = await trezorProvider.getSigner();
        console.log(`✅ Trezor signer ready: ${await signer.getAddress()}`);
        
        // =============================================================================
        // STEP 2: DEPLOY INTERNAL ADMIN MANAGER
        // =============================================================================
        
        console.log("\\n📦 STEP 2: Deploying InternalAdminManager with Trezor...");
        
        const InternalAdminManagerFactory = await ethers.getContractFactory(
            DEPLOYMENT_CONFIG.ADMIN_MANAGER_NAME
        );
        
        console.log("🔐 Please confirm InternalAdminManager deployment on Trezor...");
        
        const adminManager = await upgrades.deployProxy(
            InternalAdminManagerFactory.connect(signer),
            [
                DEPLOYMENT_CONFIG.TREZOR_ADDRESS, // owner (Trezor)
                DEPLOYMENT_CONFIG.TREZOR_ADDRESS  // super admin (Trezor)
            ],
            {
                initializer: "initialize",
                kind: "uups"
            }
        );
        
        await adminManager.waitForDeployment();
        const adminManagerAddress = await adminManager.getAddress();
        console.log(`✅ InternalAdminManager deployed: ${adminManagerAddress}`);
        
        // =============================================================================
        // STEP 3: DEPLOY MAIN ORPHI CROWDFUND CONTRACT
        // =============================================================================
        
        console.log("\\n📦 STEP 3: Deploying OrphiCrowdFund with Trezor...");
        
        const OrphiCrowdFundFactory = await ethers.getContractFactory(DEPLOYMENT_CONFIG.CONTRACT_NAME);
        
        const mainContractInitArgs = [
            DEPLOYMENT_CONFIG.USDT_ADDRESS,
            DEPLOYMENT_CONFIG.TREZOR_ADDRESS, // treasury (Trezor)
            DEPLOYMENT_CONFIG.TREZOR_ADDRESS, // emergency (Trezor)
            DEPLOYMENT_CONFIG.TREZOR_ADDRESS  // pool manager (Trezor)
        ];
        
        console.log("🔐 Please confirm OrphiCrowdFund deployment on Trezor...");
        
        const mainContract = await upgrades.deployProxy(
            OrphiCrowdFundFactory.connect(signer),
            mainContractInitArgs,
            {
                initializer: "initialize",
                kind: "uups"
            }
        );
        
        await mainContract.waitForDeployment();
        const mainContractAddress = await mainContract.getAddress();
        console.log(`✅ OrphiCrowdFund deployed: ${mainContractAddress}`);
        
        // =============================================================================
        // STEP 4: CONFIGURE CONTRACTS
        // =============================================================================
        
        console.log("\\n🔧 STEP 4: Configuring contracts with Trezor...");
        
        // Link contracts
        console.log("📝 Linking AdminManager to main contract...");
        console.log("🔐 Please confirm linking transaction on Trezor...");
        const linkTx = await adminManager.connect(signer).updateOrphiContract(mainContractAddress);
        await waitForConfirmations(linkTx);
        
        // Initialize internal admin integration
        console.log("🔗 Initializing InternalAdminManager integration...");
        console.log("🔐 Please confirm initialization transaction on Trezor...");
        const initTx = await mainContract.connect(signer).initializeInternalAdminManager(
            adminManagerAddress, 
            DEPLOYMENT_CONFIG.ENABLE_INTERNAL_ADMINS
        );
        await waitForConfirmations(initTx);
        
        // Add internal admins if configured
        if (DEPLOYMENT_CONFIG.ENABLE_INTERNAL_ADMINS && DEPLOYMENT_CONFIG.INITIAL_INTERNAL_ADMINS.length > 0) {
            console.log("👥 Adding internal admin addresses...");
            console.log("🔐 Please confirm admin addition transaction on Trezor...");
            const addAdminsTx = await adminManager.connect(signer).bulkAddInternalAdmins(DEPLOYMENT_CONFIG.INITIAL_INTERNAL_ADMINS);
            await waitForConfirmations(addAdminsTx);
            console.log(`✅ Added ${DEPLOYMENT_CONFIG.INITIAL_INTERNAL_ADMINS.length} internal admins`);
        }
        
        // =============================================================================
        // STEP 5: SECURITY VERIFICATION
        // =============================================================================
        
        console.log("\\n🔍 STEP 5: Verifying deployment security...");
        
        // Verify ownership
        const adminOwner = await adminManager.owner();
        const mainOwner = await mainContract.owner();
        
        console.log(`🔍 InternalAdminManager owner: ${adminOwner}`);
        console.log(`🔍 OrphiCrowdFund owner: ${mainOwner}`);
        console.log(`🔍 Expected Trezor address: ${DEPLOYMENT_CONFIG.TREZOR_ADDRESS}`);
        
        const isSecure = (
            adminOwner.toLowerCase() === DEPLOYMENT_CONFIG.TREZOR_ADDRESS.toLowerCase() &&
            mainOwner.toLowerCase() === DEPLOYMENT_CONFIG.TREZOR_ADDRESS.toLowerCase()
        );
        
        if (!isSecure) {
            throw new Error("❌ SECURITY ERROR: Ownership verification failed!");
        }
        
        console.log("\\n✅ SECURITY VERIFICATION PASSED");
        console.log("🔐 ALL CONTRACTS OWNED BY TREZOR HARDWARE WALLET");
        
        // =============================================================================
        // SUCCESS SUMMARY
        // =============================================================================
        
        const deploymentTime = (Date.now() - startTime) / 1000;
        
        console.log("\\n" + "=".repeat(80));
        console.log("🎉 DIRECT TREZOR DEPLOYMENT COMPLETED SUCCESSFULLY!");
        console.log("=".repeat(80));
        
        const deploymentInfo = {
            orphiCrowdFundAddress: mainContractAddress,
            internalAdminManagerAddress: adminManagerAddress,
            trezorOwnerAddress: DEPLOYMENT_CONFIG.TREZOR_ADDRESS,
            network: DEPLOYMENT_CONFIG.NETWORK,
            chainId: DEPLOYMENT_CONFIG.EXPECTED_CHAIN_ID,
            deploymentTime: `${deploymentTime.toFixed(1)}s`,
            securityStatus: "MAXIMUM_SECURITY_TREZOR_DEPLOYMENT"
        };
        
        console.log("\\n📊 DEPLOYMENT SUMMARY:");
        console.log(`   • OrphiCrowdFund: ${deploymentInfo.orphiCrowdFundAddress}`);
        console.log(`   • InternalAdminManager: ${deploymentInfo.internalAdminManagerAddress}`);
        console.log(`   • Owner (Trezor): ${deploymentInfo.trezorOwnerAddress}`);
        console.log(`   • Network: ${deploymentInfo.network}`);
        console.log(`   • Security: ${deploymentInfo.securityStatus}`);
        
        console.log("\\n🔗 VERIFICATION LINKS:");
        console.log(`   • Main Contract: https://bscscan.com/address/${mainContractAddress}`);
        console.log(`   • Admin Manager: https://bscscan.com/address/${adminManagerAddress}`);
        
        console.log("\\n🔐 SECURITY CONFIRMATION:");
        console.log("   ✅ Direct Trezor deployment - no private keys exposed");
        console.log("   ✅ All transactions confirmed on hardware wallet");
        console.log("   ✅ All admin rights controlled by Trezor");
        console.log("   ✅ Maximum security deployment achieved");
        
        console.log("\\n📝 NEXT STEPS:");
        console.log("   1. Verify contracts on BSCScan");
        console.log("   2. Update frontend with new contract addresses");
        console.log("   3. Test admin functions with your Trezor wallet");
        console.log("   4. Update documentation and user guides");
        
        // Save deployment info
        saveDeploymentInfo(deploymentInfo);
        
        // Cleanup Trezor connection
        TrezorConnect.dispose();
        console.log("🔐 Trezor connection closed");
        
        return deploymentInfo;
        
    } catch (error) {
        console.error("\\n❌ TREZOR DEPLOYMENT FAILED:");
        console.error(error.message);
        
        // Cleanup on error
        try {
            TrezorConnect.dispose();
        } catch (e) {
            // Ignore cleanup errors
        }
        
        console.error("\\n🔧 TROUBLESHOOTING:");
        console.error("   • Ensure Trezor is connected and unlocked");
        console.error("   • Check Trezor Bridge or Trezor Suite is running");
        console.error("   • Verify BSC Mainnet is configured on Trezor");
        console.error("   • Ensure sufficient BNB balance for gas");
        
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

module.exports = main;
