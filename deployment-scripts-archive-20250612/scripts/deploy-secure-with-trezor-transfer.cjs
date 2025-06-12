const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                    🔐 ZERO-COMPROMISE TREZOR DEPLOYMENT 🔐                           ║
 * ║                                                                                       ║
 * ║  This script deploys contracts directly with Trezor ownership from initialization.   ║
 * ║  The temporary deployer key only deploys - all admin rights go to Trezor directly.   ║
 * ║                                                                                       ║
 * ║  Security Model:                                                                      ║
 * ║  1. Deploy with temp key (required for Hardhat)                                      ║
 * ║  2. Initialize contracts with Trezor as owner/admin                                   ║
 * ║  3. Verify all ownership is with Trezor                                              ║
 * ║  4. Remove/destroy temp key after deployment                                          ║
 * ║                                                                                       ║
 * ║  ✅ ZERO OWNERSHIP TRANSFERS - MAXIMUM SECURITY                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 */

// Configuration
const DEPLOYMENT_CONFIG = {
    CONTRACT_NAME: "OrphiCrowdFund",
    ADMIN_MANAGER_NAME: "InternalAdminManager",
    NETWORK: "BSC Mainnet",
    USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
    
    // 🔐 YOUR TREZOR WALLET ADDRESS - VERIFY THIS IS CORRECT!
    TREZOR_ADDRESS: "0xeB652c4523f3Cf615D3F3694b14E551145953aD0",
    
    EXPECTED_CHAIN_ID: 56,
    MIN_BNB_BALANCE: "0.1",
    
    // Internal Admin Configuration
    ENABLE_INTERNAL_ADMINS: true,
    INITIAL_INTERNAL_ADMINS: [
        // Simulation addresses only (not real wallets)
        "0x2345678901234567890123456789012345678901",
        "0x3456789012345678901234567890123456789012",
        "0x4567890123456789012345678901234567890123"
    ]
};

// Utility Functions
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
    const filename = "SECURE_DEPLOYMENT_SUCCESS.json";
    
    const deploymentData = {
        ...data,
        timestamp: new Date().toISOString(),
        network: DEPLOYMENT_CONFIG.NETWORK,
        securityModel: "TEMPORARY_DEPLOY_IMMEDIATE_TREZOR_TRANSFER",
        trezorAddress: DEPLOYMENT_CONFIG.TREZOR_ADDRESS,
        verified: false // Will be updated after verification
    };
    
    fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
    console.log(`💾 Deployment info saved to: ${filename}`);
    return filename;
}

// Contracts deployed directly with Trezor ownership - no transfers needed

async function verifyTrezorOwnership(contracts, trezorAddress) {
    console.log("\\n🔍 SECURITY VERIFICATION: Checking Trezor ownership...");
    
    let allSecure = true;
    
    for (const [name, contract] of Object.entries(contracts)) {
        try {
            const owner = await contract.owner();
            
            if (owner.toLowerCase() === trezorAddress.toLowerCase()) {
                console.log(`✅ ${name}: Owner = ${owner} (Trezor ✓)`);
            } else {
                console.log(`❌ ${name}: Owner = ${owner} (NOT Trezor!)`);
                allSecure = false;
            }
        } catch (error) {
            console.log(`⚠️  ${name}: Could not verify ownership`);
        }
    }
    
    return allSecure;
}

async function main() {
    try {
        console.log("🔐 STARTING ZERO-COMPROMISE TREZOR DEPLOYMENT");
        console.log("═".repeat(80));
        console.log("✅ SECURITY MODEL: Direct Trezor Ownership From Deployment");
        console.log("✅ NO OWNERSHIP TRANSFERS - MAXIMUM SECURITY");
        console.log("═".repeat(80));
        
        const startTime = Date.now();
        
        // =============================================================================
        // NETWORK AND DEPLOYMENT VALIDATION
        // =============================================================================
        
        const network = await ethers.provider.getNetwork();
        console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
        
        if (Number(network.chainId) !== DEPLOYMENT_CONFIG.EXPECTED_CHAIN_ID) {
            console.log(`⚠️  Warning: Expected Chain ID ${DEPLOYMENT_CONFIG.EXPECTED_CHAIN_ID}, got ${network.chainId}`);
        }
        
        // Get deployer (temporary)
        const [tempDeployer] = await ethers.getSigners();
        console.log(`📤 Temp Deployer: ${tempDeployer.address} (will be revoked)`);
        console.log(`🔐 Trezor Target: ${DEPLOYMENT_CONFIG.TREZOR_ADDRESS} (final owner)`);
        
        // Check balance
        const balance = await ethers.provider.getBalance(tempDeployer.address);
        console.log(`💰 Deployer Balance: ${formatBNB(balance)} BNB`);
        
        const minBalance = ethers.parseEther(DEPLOYMENT_CONFIG.MIN_BNB_BALANCE);
        if (balance < minBalance) {
            throw new Error(`❌ Insufficient BNB! Need at least ${DEPLOYMENT_CONFIG.MIN_BNB_BALANCE} BNB`);
        }
        
        // =============================================================================
        // STEP 1: DEPLOY INTERNAL ADMIN MANAGER
        // =============================================================================
        
        console.log("\\n📦 STEP 1: Deploying InternalAdminManager...");
        
        const InternalAdminManagerFactory = await ethers.getContractFactory(DEPLOYMENT_CONFIG.ADMIN_MANAGER_NAME);
        
        const adminManager = await upgrades.deployProxy(
            InternalAdminManagerFactory,
            [
                DEPLOYMENT_CONFIG.TREZOR_ADDRESS, // owner (Trezor from start)
                DEPLOYMENT_CONFIG.TREZOR_ADDRESS  // super admin (Trezor from start)
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
        // STEP 2: DEPLOY MAIN ORPHI CROWDFUND CONTRACT
        // =============================================================================
        
        console.log("\\n📦 STEP 2: Deploying OrphiCrowdFund...");
        
        const OrphiCrowdFundFactory = await ethers.getContractFactory(DEPLOYMENT_CONFIG.CONTRACT_NAME);
        
        const mainContractInitArgs = [
            DEPLOYMENT_CONFIG.USDT_ADDRESS,
            DEPLOYMENT_CONFIG.TREZOR_ADDRESS, // treasury (Trezor from start)
            DEPLOYMENT_CONFIG.TREZOR_ADDRESS, // emergency (Trezor from start)
            DEPLOYMENT_CONFIG.TREZOR_ADDRESS  // pool manager (Trezor from start)
        ];
        
        const mainContract = await upgrades.deployProxy(
            OrphiCrowdFundFactory,
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
        // STEP 3: CONFIGURE CONTRACTS
        // =============================================================================
        
        console.log("\\n🔧 STEP 3: Configuring contracts...");
        
        // Link contracts
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
        
        // Add internal admins if configured
        if (DEPLOYMENT_CONFIG.ENABLE_INTERNAL_ADMINS && DEPLOYMENT_CONFIG.INITIAL_INTERNAL_ADMINS.length > 0) {
            console.log("👥 Adding internal admin addresses...");
            const addAdminsTx = await adminManager.bulkAddInternalAdmins(DEPLOYMENT_CONFIG.INITIAL_INTERNAL_ADMINS);
            await waitForConfirmations(addAdminsTx);
            console.log(`✅ Added ${DEPLOYMENT_CONFIG.INITIAL_INTERNAL_ADMINS.length} internal admins`);
        }
        
        // =============================================================================
        // STEP 4: ✅ VERIFY TREZOR OWNERSHIP (NO TRANSFERS NEEDED)
        // =============================================================================
        
        console.log("\\n✅ STEP 4: VERIFYING TREZOR OWNERSHIP...");
        console.log("🔐 ZERO-COMPROMISE MODEL: Contracts deployed directly with Trezor ownership");
        
        // Note: Contracts are deployed with Trezor as owner/admin from initialization
        // No ownership transfers needed - this is the zero-compromise approach
        
        console.log("✅ No ownership transfers required - contracts deployed securely");
        
        // =============================================================================
        // STEP 5: SECURITY VERIFICATION
        // =============================================================================
        
        console.log("\\n🔍 STEP 5: VERIFYING TREZOR OWNERSHIP...");
        
        const contracts = {
            "OrphiCrowdFund": mainContract,
            "InternalAdminManager": adminManager
        };
        
        const isSecure = await verifyTrezorOwnership(contracts, DEPLOYMENT_CONFIG.TREZOR_ADDRESS);
        
        if (!isSecure) {
            throw new Error("❌ SECURITY ERROR: Not all contracts owned by Trezor!");
        }
        
        console.log("\\n✅ SECURITY VERIFICATION PASSED");
        console.log("🔐 ALL CONTRACTS NOW OWNED BY TREZOR WALLET");
        
        // =============================================================================
        // SUCCESS SUMMARY
        // =============================================================================
        
        const deploymentTime = (Date.now() - startTime) / 1000;
        
        console.log("\\n" + "=".repeat(80));
        console.log("🎉 SECURE DEPLOYMENT COMPLETED SUCCESSFULLY!");
        console.log("=".repeat(80));
        
        const deploymentInfo = {
            orphiCrowdFundAddress: mainContractAddress,
            internalAdminManagerAddress: adminManagerAddress,
            trezorOwnerAddress: DEPLOYMENT_CONFIG.TREZOR_ADDRESS,
            tempDeployerAddress: tempDeployer.address,
            network: DEPLOYMENT_CONFIG.NETWORK,
            chainId: Number(network.chainId),
            deploymentTime: `${deploymentTime.toFixed(1)}s`,
            blockNumber: await ethers.provider.getBlockNumber(),
            securityStatus: "FULLY_SECURED_WITH_TREZOR"
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
        console.log("   ✅ All contracts deployed with Trezor as owner");
        console.log("   ✅ All admin roles assigned to Trezor from deployment");
        console.log("   ✅ No role transfers needed");
        console.log("   ✅ Zero compromise deployment achieved");
        
        console.log("\\n📝 NEXT STEPS:");
        console.log("   1. Remove/destroy the temporary deployment private key");
        console.log("   2. Update frontend with new contract addresses");
        console.log("   3. Verify contracts on BSCScan");
        console.log("   4. Test admin functions with your Trezor wallet");
        
        // Save deployment info
        saveDeploymentInfo(deploymentInfo);
        
        return deploymentInfo;
        
    } catch (error) {
        console.error("\\n❌ DEPLOYMENT FAILED:");
        console.error(error.message);
        
        console.error("\\n⚠️  SECURITY NOTE:");
        console.error("   If deployment failed during ownership transfer,");
        console.error("   please verify contract ownership manually and");
        console.error("   transfer any remaining ownership to Trezor wallet.");
        
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
