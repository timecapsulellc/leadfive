const { ethers, upgrades } = require("hardhat");
const { LEADFIVE_PROXY_ADDRESS } = require("./contract-interaction-guide");

// UPGRADE GUIDE FOR LEADFIVE CONTRACT

async function checkUpgradeability() {
    console.log("🔍 Checking contract upgradeability...");
    
    const [signer] = await ethers.getSigners();
    
    // Check if we can read implementation
    try {
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(LEADFIVE_PROXY_ADDRESS);
        const adminAddress = await upgrades.erc1967.getAdminAddress(LEADFIVE_PROXY_ADDRESS);
        
        console.log("✅ Contract is upgradeable (UUPS Pattern)");
        console.log(`📍 Proxy Address: ${LEADFIVE_PROXY_ADDRESS}`);
        console.log(`📍 Current Implementation: ${implementationAddress}`);
        console.log(`📍 Admin Address: ${adminAddress}`);
        console.log(`👤 Current Signer: ${signer.address}`);
        
        return { implementationAddress, adminAddress, isUpgradeable: true };
    } catch (error) {
        console.error("❌ Contract might not be upgradeable or you lack permissions");
        console.error("Error:", error.message);
        return { isUpgradeable: false };
    }
}

async function validateNewImplementation(contractName = "LeadFive") {
    console.log(`🔍 Validating new implementation: ${contractName}`);
    
    try {
        const NewContract = await ethers.getContractFactory(contractName);
        console.log("✅ Contract compilation successful");
        
        // Check if it's upgrade-safe
        await upgrades.validateImplementation(NewContract);
        console.log("✅ Implementation is upgrade-safe");
        
        return { isValid: true, contractFactory: NewContract };
    } catch (error) {
        console.error("❌ Implementation validation failed:");
        console.error(error.message);
        return { isValid: false };
    }
}

async function prepareUpgrade(contractName = "LeadFive") {
    console.log("📦 Preparing new implementation deployment...");
    
    const validation = await validateNewImplementation(contractName);
    if (!validation.isValid) {
        return null;
    }
    
    try {
        console.log("🚀 Deploying new implementation...");
        const newImplementationAddress = await upgrades.prepareUpgrade(
            LEADFIVE_PROXY_ADDRESS,
            validation.contractFactory,
            { 
                kind: 'uups',
                timeout: 120000 // 2 minutes timeout
            }
        );
        
        console.log(`✅ New implementation deployed at: ${newImplementationAddress}`);
        console.log("⚠️  Implementation is ready but NOT yet active");
        console.log("💡 Next step: Call upgradeContract() to activate it");
        
        return newImplementationAddress;
    } catch (error) {
        console.error("❌ Failed to prepare upgrade:", error.message);
        return null;
    }
}

async function upgradeContract(newImplementationAddress) {
    console.log(`🔄 Upgrading LeadFive to new implementation...`);
    console.log(`New Implementation: ${newImplementationAddress}`);
    
    const [signer] = await ethers.getSigners();
    
    try {
        // Get current implementation for comparison
        const currentImpl = await upgrades.erc1967.getImplementationAddress(LEADFIVE_PROXY_ADDRESS);
        console.log(`Current Implementation: ${currentImpl}`);
        
        // Execute upgrade using OpenZeppelin's upgrade function
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const upgraded = await upgrades.upgradeProxy(LEADFIVE_PROXY_ADDRESS, LeadFive);
        
        console.log("⏳ Waiting for upgrade transaction confirmation...");
        await upgraded.waitForDeployment();
        
        // Verify upgrade
        const newImpl = await upgrades.erc1967.getImplementationAddress(LEADFIVE_PROXY_ADDRESS);
        console.log(`✅ Upgrade successful!`);
        console.log(`Previous Implementation: ${currentImpl}`);
        console.log(`New Implementation: ${newImpl}`);
        
        // Verify the contract still works
        const contract = await ethers.getContractAt("LeadFive", LEADFIVE_PROXY_ADDRESS);
        const totalUsers = await contract.getTotalUsers();
        console.log(`✅ Contract functional check: ${totalUsers} total users`);
        
        return { success: true, newImplementation: newImpl };
    } catch (error) {
        console.error("❌ Upgrade failed:", error.message);
        return { success: false, error: error.message };
    }
}

async function rollbackUpgrade(previousImplementationAddress) {
    console.log("🔙 Rolling back to previous implementation...");
    console.log(`Target Implementation: ${previousImplementationAddress}`);
    
    try {
        // This would require deploying the previous version again
        // and then upgrading to it
        console.log("⚠️  Rollback requires re-deployment of previous implementation");
        console.log("💡 Steps to rollback:");
        console.log("1. Redeploy the previous implementation");
        console.log("2. Call upgradeContract() with the previous implementation address");
        console.log("3. Verify the rollback was successful");
        
        return { success: false, message: "Manual rollback required" };
    } catch (error) {
        console.error("❌ Rollback failed:", error.message);
        return { success: false, error: error.message };
    }
}

async function getUpgradeHistory() {
    console.log("📜 Getting upgrade history...");
    
    try {
        const currentImpl = await upgrades.erc1967.getImplementationAddress(LEADFIVE_PROXY_ADDRESS);
        const adminAddress = await upgrades.erc1967.getAdminAddress(LEADFIVE_PROXY_ADDRESS);
        
        console.log("📊 Upgrade History:");
        console.log(`├─ Proxy Address: ${LEADFIVE_PROXY_ADDRESS}`);
        console.log(`├─ Current Implementation: ${currentImpl}`);
        console.log(`├─ Admin Address: ${adminAddress}`);
        console.log(`└─ Upgrade Pattern: UUPS (Universal Upgradeable Proxy Standard)`);
        
        // Note: To get full history, you'd need to parse events from the blockchain
        console.log("\n💡 To see full upgrade history, check 'Upgraded' events on BSCScan:");
        console.log(`   https://bscscan.com/address/${LEADFIVE_PROXY_ADDRESS}#events`);
        
        return { currentImpl, adminAddress };
    } catch (error) {
        console.error("❌ Failed to get upgrade history:", error.message);
        return null;
    }
}

async function simulateUpgrade(contractName = "LeadFive") {
    console.log("🧪 Simulating upgrade process...");
    
    // 1. Check upgradeability
    const upgradeCheck = await checkUpgradeability();
    if (!upgradeCheck.isUpgradeable) {
        console.log("❌ Cannot proceed with upgrade simulation");
        return;
    }
    
    // 2. Validate new implementation
    const validation = await validateNewImplementation(contractName);
    if (!validation.isValid) {
        console.log("❌ New implementation is not valid");
        return;
    }
    
    console.log("✅ Upgrade simulation successful");
    console.log("📋 Upgrade would proceed as follows:");
    console.log("1. ✅ Contract is upgradeable");
    console.log("2. ✅ New implementation is valid");
    console.log("3. 🔄 Deploy new implementation");
    console.log("4. 🔄 Update proxy to point to new implementation");
    console.log("5. ✅ Verify upgrade success");
    
    console.log("\n💡 To execute actual upgrade:");
    console.log("   npx hardhat run deployment-restoration/upgrade-guide.js --network bsc upgrade");
}

// CLI interface
async function main() {
    const action = process.argv[2];
    const param = process.argv[3];
    
    try {
        switch(action) {
            case 'check':
                await checkUpgradeability();
                break;
            case 'validate':
                const contractName = param || "LeadFive";
                await validateNewImplementation(contractName);
                break;
            case 'prepare':
                const prepareContract = param || "LeadFive";
                const newImpl = await prepareUpgrade(prepareContract);
                if (newImpl) {
                    console.log(`\n💡 Next step: npx hardhat run upgrade-guide.js --network bsc execute ${newImpl}`);
                }
                break;
            case 'execute':
                if (!param) {
                    console.error("Usage: node upgrade-guide.js execute <newImplementationAddress>");
                    break;
                }
                await upgradeContract(param);
                break;
            case 'upgrade':
                // Full upgrade process
                const impl = await prepareUpgrade();
                if (impl) {
                    await upgradeContract(impl);
                }
                break;
            case 'rollback':
                if (!param) {
                    console.error("Usage: node upgrade-guide.js rollback <previousImplementationAddress>");
                    break;
                }
                await rollbackUpgrade(param);
                break;
            case 'history':
                await getUpgradeHistory();
                break;
            case 'simulate':
                const simContract = param || "LeadFive";
                await simulateUpgrade(simContract);
                break;
            default:
                console.log("LEADFIVE CONTRACT UPGRADE GUIDE");
                console.log("=============================");
                console.log("Available commands:");
                console.log("  check                    - Check if contract is upgradeable");
                console.log("  validate [contract]      - Validate new implementation");
                console.log("  prepare [contract]       - Deploy new implementation");
                console.log("  execute <address>        - Execute upgrade to new implementation");
                console.log("  upgrade                  - Full upgrade process (prepare + execute)");
                console.log("  rollback <address>       - Rollback to previous implementation");
                console.log("  history                  - Show upgrade history");
                console.log("  simulate [contract]      - Simulate upgrade process");
                console.log("\nExample:");
                console.log("  npx hardhat run deployment-restoration/upgrade-guide.js --network bsc check");
                console.log("  npx hardhat run deployment-restoration/upgrade-guide.js --network bsc upgrade");
        }
    } catch (error) {
        console.error("❌ Upgrade operation failed:", error.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    checkUpgradeability,
    validateNewImplementation,
    prepareUpgrade,
    upgradeContract,
    rollbackUpgrade,
    getUpgradeHistory,
    simulateUpgrade
};
