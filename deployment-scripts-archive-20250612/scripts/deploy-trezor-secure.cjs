const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║    🔐 SECURE TREZOR-ONLY DEPLOYMENT - NO PRIVATE KEYS STORED 🔐                      ║
 * ║                              🛡️ MAXIMUM SECURITY DEPLOYMENT 🛡️                        ║
 * ║                                                                                       ║
 * ║   • All transactions signed by Trezor hardware wallet                                ║
 * ║   • No private keys stored anywhere in the system                                    ║
 * ║   • All admin roles assigned directly to Trezor wallet                               ║
 * ║   • Zero trust, maximum security deployment model                                    ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 */

// Deployment Configuration - SECURE TREZOR-ONLY
const DEPLOYMENT_CONFIG = {
    CONTRACT_NAME: "OrphiCrowdFund",
    ADMIN_MANAGER_NAME: "InternalAdminManager",
    NETWORK: "BSC Mainnet",
    USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
    TREZOR_ADDRESS: "0xeB652c4523f3Cf615D3F3694b14E551145953aD0", // ⚠️ VERIFY THIS IS YOUR TREZOR ADDRESS
    EXPECTED_CHAIN_ID: 56,
    GAS_LIMIT: 5000000,
    GAS_PRICE: "5000000000", // 5 gwei
    MIN_BNB_BALANCE: "0.1",
    CONFIRMATION_BLOCKS: 3,
    
    // Internal Admin Configuration
    ENABLE_INTERNAL_ADMINS: true,
    INITIAL_INTERNAL_ADMINS: [
        // Add up to 21 simulation addresses (NOT real wallets)
        "0x2345678901234567890123456789012345678901",
        "0x3456789012345678901234567890123456789012",
        "0x4567890123456789012345678901234567890123",
        "0x5678901234567890123456789012345678901234"
    ]
};

// Security Validation
function validateTrezorAddress(deployer) {
    if (deployer.toLowerCase() !== DEPLOYMENT_CONFIG.TREZOR_ADDRESS.toLowerCase()) {
        console.log("❌ SECURITY WARNING: Deployer address mismatch!");
        console.log(`   Expected Trezor: ${DEPLOYMENT_CONFIG.TREZOR_ADDRESS}`);
        console.log(`   Current Deployer: ${deployer}`);
        console.log("   ⚠️  Ensure you're using the correct Trezor wallet!");
        throw new Error("SECURITY: Wrong wallet address - deployment aborted");
    }
    console.log("✅ Trezor wallet address verified");
}

// Utility Functions
function formatBNB(amount) {
    return ethers.formatEther(amount);
}

function formatGwei(amount) {
    return ethers.formatUnits(amount, "gwei");
}

async function waitForConfirmations(tx, confirmations = 3) {
    console.log(`⏳ Waiting for ${confirmations} confirmations...`);
    const receipt = await tx.wait(confirmations);
    console.log(`✅ Transaction confirmed: ${receipt.hash}`);
    return receipt;
}

function saveDeploymentInfo(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `SECURE_DEPLOYMENT_SUCCESS.json`;
    
    if (!fs.existsSync('deployments')) {
        fs.mkdirSync('deployments');
    }
    
    const filepath = `deployments/${filename}`;
    const deploymentData = {
        ...data,
        timestamp: new Date().toISOString(),
        network: DEPLOYMENT_CONFIG.NETWORK,
        security: "TREZOR_HARDWARE_WALLET_ONLY",
        deployerVerified: true
    };
    
    fs.writeFileSync(filepath, JSON.stringify(deploymentData, null, 2));
    fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2)); // Also save in root for script
    
    console.log(`💾 Deployment info saved to: ${filepath}`);
    return filepath;
}

async function main() {
    try {
        console.log("🔐 STARTING SECURE TREZOR-ONLY DEPLOYMENT");
        console.log("═".repeat(80));
        console.log("⚠️  SECURITY NOTICE: NO PRIVATE KEYS STORED");
        console.log("⚠️  ALL TRANSACTIONS MUST BE CONFIRMED ON TREZOR DEVICE");
        console.log("═".repeat(80));
        
        const startTime = Date.now();
        
        // =============================================================================
        // NETWORK AND SECURITY VALIDATION
        // =============================================================================
        
        const network = await ethers.provider.getNetwork();
        console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
        
        if (Number(network.chainId) !== DEPLOYMENT_CONFIG.EXPECTED_CHAIN_ID) {
            throw new Error(`Wrong network! Expected ${DEPLOYMENT_CONFIG.EXPECTED_CHAIN_ID}, got ${network.chainId}`);
        }
        
        // Get deployer (should be Trezor)
        const [deployer] = await ethers.getSigners();
        console.log(`🔐 Deployer: ${deployer.address}`);
        
        // CRITICAL: Validate this is the correct Trezor address
        validateTrezorAddress(deployer.address);
        
        // Check balance
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log(`💰 Balance: ${formatBNB(balance)} BNB`);
        
        const minBalance = ethers.parseEther(DEPLOYMENT_CONFIG.MIN_BNB_BALANCE);
        if (balance < minBalance) {
            throw new Error(`❌ Insufficient BNB balance! Need at least ${DEPLOYMENT_CONFIG.MIN_BNB_BALANCE} BNB for deployment.`);
        }
        
        // =============================================================================
        // TREZOR DEPLOYMENT CONFIRMATION
        // =============================================================================
        
        console.log("\\n" + "-".repeat(50));
        console.log("🔐 TREZOR DEPLOYMENT CONFIGURATION");
        console.log("-".repeat(50));
        console.log(`Main Contract: ${DEPLOYMENT_CONFIG.CONTRACT_NAME}`);
        console.log(`Admin Manager: ${DEPLOYMENT_CONFIG.ADMIN_MANAGER_NAME}`);
        console.log(`USDT Address: ${DEPLOYMENT_CONFIG.USDT_ADDRESS}`);
        console.log(`Network: ${DEPLOYMENT_CONFIG.NETWORK}`);
        console.log(`Gas Limit: ${DEPLOYMENT_CONFIG.GAS_LIMIT.toLocaleString()}`);
        console.log(`Gas Price: ${formatGwei(DEPLOYMENT_CONFIG.GAS_PRICE)} gwei`);
        
        console.log("\\n🔐 TREZOR WALLET CONFIGURATION:");
        console.log(`   • Deployer: ${deployer.address} ✅ TREZOR`);
        console.log(`   • Owner: ${deployer.address} ✅ TREZOR`);
        console.log(`   • Treasury: ${deployer.address} ✅ TREZOR`);
        console.log(`   • Emergency: ${deployer.address} ✅ TREZOR`);
        console.log(`   • Pool Manager: ${deployer.address} ✅ TREZOR`);
        console.log(`   • ALL ROLES SECURED WITH TREZOR HARDWARE WALLET`);
        
        // =============================================================================
        // CONTRACT DEPLOYMENT - STEP 1: INTERNAL ADMIN MANAGER
        // =============================================================================
        
        console.log("\\n📦 STEP 1: Deploying InternalAdminManager...");
        console.log("⚠️  CONFIRM THE NEXT TRANSACTION ON YOUR TREZOR DEVICE");
        
        const InternalAdminManagerFactory = await ethers.getContractFactory(DEPLOYMENT_CONFIG.ADMIN_MANAGER_NAME);
        
        // Deploy with proxy
        const adminManager = await upgrades.deployProxy(
            InternalAdminManagerFactory,
            [
                deployer.address, // initialOwner (Trezor)
                deployer.address  // initialSuperAdmin (Trezor)
            ],
            {
                initializer: "initialize",
                kind: "uups"
            }
        );
        
        console.log("⏳ Waiting for InternalAdminManager deployment...");
        await adminManager.waitForDeployment();
        
        const adminManagerAddress = await adminManager.getAddress();
        console.log(`✅ InternalAdminManager deployed: ${adminManagerAddress}`);
        
        // =============================================================================
        // CONTRACT DEPLOYMENT - STEP 2: MAIN ORPHI CROWDFUND CONTRACT
        // =============================================================================
        
        console.log("\\n📦 STEP 2: Deploying OrphiCrowdFund...");
        console.log("⚠️  CONFIRM THE NEXT TRANSACTION ON YOUR TREZOR DEVICE");
        
        const OrphiCrowdFundFactory = await ethers.getContractFactory(DEPLOYMENT_CONFIG.CONTRACT_NAME);
        
        // Prepare initialization arguments - ALL ROLES = TREZOR ADDRESS
        const mainContractInitArgs = [
            DEPLOYMENT_CONFIG.USDT_ADDRESS,  // _usdtToken
            deployer.address,                // _treasuryAddress (Trezor)
            deployer.address,                // _emergencyAddress (Trezor)
            deployer.address                 // _poolManagerAddress (Trezor)
        ];
        
        console.log("\\n📋 Main Contract Initialization:");
        console.log(`   • USDT Token: ${mainContractInitArgs[0]}`);
        console.log(`   • Treasury: ${mainContractInitArgs[1]} ✅ TREZOR`);
        console.log(`   • Emergency: ${mainContractInitArgs[2]} ✅ TREZOR`);
        console.log(`   • Pool Manager: ${mainContractInitArgs[3]} ✅ TREZOR`);
        
        // Deploy with proxy
        const mainContract = await upgrades.deployProxy(
            OrphiCrowdFundFactory,
            mainContractInitArgs,
            {
                initializer: "initialize",
                kind: "uups"
            }
        );
        
        console.log("⏳ Waiting for OrphiCrowdFund deployment...");
        await mainContract.waitForDeployment();
        
        const mainContractAddress = await mainContract.getAddress();
        console.log(`✅ OrphiCrowdFund deployed: ${mainContractAddress}`);
        
        // =============================================================================
        // POST-DEPLOYMENT CONFIGURATION
        // =============================================================================
        
        console.log("\\n🔧 STEP 3: Configuring contracts...");
        console.log("⚠️  CONFIRM EACH TRANSACTION ON YOUR TREZOR DEVICE");
        
        // Link AdminManager to main contract
        console.log("📝 Linking AdminManager to main contract...");
        const linkTx = await adminManager.updateOrphiContract(mainContractAddress);
        await waitForConfirmations(linkTx);
        
        // Initialize internal admin integration
        console.log("🔗 Initializing InternalAdminManager integration...");
        const initTx = await mainContract.initializeInternalAdminManager(
            adminManagerAddress, 
            DEPLOYMENT_CONFIG.ENABLE_INTERNAL_ADMINS
        );
        await waitForConfirmations(initTx);
        
        // Initialize internal admins if enabled
        if (DEPLOYMENT_CONFIG.ENABLE_INTERNAL_ADMINS && DEPLOYMENT_CONFIG.INITIAL_INTERNAL_ADMINS.length > 0) {
            console.log("👥 Initializing internal admin addresses...");
            
            const validAdmins = DEPLOYMENT_CONFIG.INITIAL_INTERNAL_ADMINS.filter(addr => 
                ethers.isAddress(addr)
            );
            
            if (validAdmins.length > 0) {
                const addAdminsTx = await adminManager.bulkAddInternalAdmins(validAdmins);
                await waitForConfirmations(addAdminsTx);
                console.log(`✅ Added ${validAdmins.length} internal admin addresses`);
            }
        }
        
        // =============================================================================
        // DEPLOYMENT VERIFICATION
        // =============================================================================
        
        console.log("\\n🔍 STEP 4: Verifying deployment security...");
        
        // Verify ownership
        const owner = await mainContract.owner();
        const adminOwner = await adminManager.owner();
        
        console.log("\\n🔐 OWNERSHIP VERIFICATION:");
        console.log(`   • OrphiCrowdFund Owner: ${owner}`);
        console.log(`   • AdminManager Owner: ${adminOwner}`);
        console.log(`   • Expected (Trezor): ${deployer.address}`);
        
        if (owner.toLowerCase() !== deployer.address.toLowerCase() || 
            adminOwner.toLowerCase() !== deployer.address.toLowerCase()) {
            throw new Error("❌ SECURITY ERROR: Ownership not properly set to Trezor wallet!");
        }
        
        console.log("✅ ALL OWNERSHIP CORRECTLY SET TO TREZOR WALLET");
        
        // =============================================================================
        // SUCCESS AND CLEANUP
        // =============================================================================
        
        const deploymentTime = (Date.now() - startTime) / 1000;
        
        console.log("\\n" + "=".repeat(80));
        console.log("🎉 SECURE TREZOR DEPLOYMENT COMPLETED SUCCESSFULLY!");
        console.log("=".repeat(80));
        
        const deploymentInfo = {
            orphiCrowdFundAddress: mainContractAddress,
            internalAdminManagerAddress: adminManagerAddress,
            ownerAddress: deployer.address,
            network: DEPLOYMENT_CONFIG.NETWORK,
            chainId: Number(network.chainId),
            gasUsed: "Estimated ~" + (DEPLOYMENT_CONFIG.GAS_LIMIT * 2).toLocaleString(),
            deploymentTime: `${deploymentTime.toFixed(1)}s`,
            blockNumber: await ethers.provider.getBlockNumber(),
            securityLevel: "MAXIMUM - TREZOR HARDWARE WALLET ONLY"
        };
        
        console.log("\\n📊 DEPLOYMENT SUMMARY:");
        console.log(`   • OrphiCrowdFund: ${deploymentInfo.orphiCrowdFundAddress}`);
        console.log(`   • InternalAdminManager: ${deploymentInfo.internalAdminManagerAddress}`);
        console.log(`   • Owner (Trezor): ${deploymentInfo.ownerAddress}`);
        console.log(`   • Network: ${deploymentInfo.network}`);
        console.log(`   • Deployment Time: ${deploymentInfo.deploymentTime}`);
        console.log(`   • Security Level: ${deploymentInfo.securityLevel}`);
        
        console.log("\\n🔗 VERIFICATION LINKS:");
        console.log(`   • Main Contract: https://bscscan.com/address/${mainContractAddress}`);
        console.log(`   • Admin Manager: https://bscscan.com/address/${adminManagerAddress}`);
        
        // Save deployment info
        const deploymentFile = saveDeploymentInfo(deploymentInfo);
        
        console.log("\\n✅ NEXT STEPS:");
        console.log("   1. Update frontend with new contract addresses");
        console.log("   2. Verify contracts on BSCScan");
        console.log("   3. Test all functionality with Trezor wallet");
        console.log("   4. Deploy frontend with new configuration");
        
        console.log("\\n🔐 SECURITY CONFIRMATION:");
        console.log("   ✅ No private keys stored anywhere");
        console.log("   ✅ All admin rights with Trezor hardware wallet");
        console.log("   ✅ Zero compromise deployment model achieved");
        
        return deploymentInfo;
        
    } catch (error) {
        console.error("\\n❌ DEPLOYMENT FAILED:");
        console.error(error.message);
        
        if (error.message.includes("user rejected")) {
            console.error("\\n💡 USER REJECTED TRANSACTION:");
            console.error("   • Transaction was rejected on Trezor device");
            console.error("   • Please approve the transaction to continue");
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

module.exports = main;
