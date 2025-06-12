const { ethers, upgrades } = require("hardhat");

/**
 * @title Orphichain Crowdfund Platform Upgradeable Deployment Script
 * @dev Deploys the upgradeable version using OpenZeppelin's UUPS proxy pattern
 * 
 * This script:
 * 1. Deploys the implementation contract
 * 2. Deploys the proxy contract with initialization
 * 3. Sets up all administrative roles
 * 4. Verifies the deployment
 * 5. Saves deployment information
 */

async function main() {
    console.log("🚀 Starting Orphichain Crowdfund Platform Upgradeable Deployment...\n");

    // Get deployment configuration
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deployment Configuration:");
    console.log("├─ Deployer address:", deployer.address);
    console.log("├─ Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    
    // Network configuration
    const network = await ethers.provider.getNetwork();
    console.log("├─ Network:", network.name);
    console.log("├─ Chain ID:", network.chainId.toString());
    
    // Administrative addresses (provided by user)
    const TREASURY_ADDRESS = "0xE0Ea180812e05AE1B257D212C01FC4E45865EBd4";
    const EMERGENCY_ADDRESS = "0xDB54f3f8F42e0165a15A33736550790BB0662Ac6";
    const POOL_MANAGER_ADDRESS = "0x7379AF7f3efC8Ab3F8dA57EA917fB5C29B12bBB7";
    
    // USDT token addresses for different networks
    const USDT_ADDRESSES = {
        1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",     // Ethereum Mainnet
        56: "0x55d398326f99059fF775485246999027B3197955",    // BSC Mainnet
        97: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",    // BSC Testnet
        11155111: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06", // Sepolia Testnet
        31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3"   // Hardhat Local (Mock)
    };
    
    const usdtAddress = USDT_ADDRESSES[network.chainId.toString()] || USDT_ADDRESSES[31337];
    
    console.log("├─ USDT Token:", usdtAddress);
    console.log("├─ Treasury Address:", TREASURY_ADDRESS);
    console.log("├─ Emergency Address:", EMERGENCY_ADDRESS);
    console.log("└─ Pool Manager Address:", POOL_MANAGER_ADDRESS);
    console.log();

    try {
        // Step 1: Deploy the upgradeable contract
        console.log("📦 Step 1: Deploying Upgradeable Contract...");
        
        const OrphichainPlatformUpgradeable = await ethers.getContractFactory("OrphichainCrowdfundPlatformUpgradeable");
        
        console.log("├─ Deploying implementation and proxy...");
        const orphichainPlatform = await upgrades.deployProxy(
            OrphichainPlatformUpgradeable,
            [
                usdtAddress,
                TREASURY_ADDRESS,
                EMERGENCY_ADDRESS,
                POOL_MANAGER_ADDRESS
            ],
            {
                initializer: 'initialize',
                kind: 'uups'
            }
        );
        
        await orphichainPlatform.waitForDeployment();
        const proxyAddress = await orphichainPlatform.getAddress();
        
        console.log("├─ Proxy deployed to:", proxyAddress);
        
        // Get implementation address
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log("├─ Implementation deployed to:", implementationAddress);
        console.log("└─ Contract deployment successful! ✅\n");

        // Step 2: Verify deployment
        console.log("🔍 Step 2: Verifying Deployment...");
        
        // Check contract version
        const version = await orphichainPlatform.version();
        console.log("├─ Contract version:", version);
        
        // Check administrative addresses
        const [treasury, emergency, poolManager] = await orphichainPlatform.getAdministrativeAddresses();
        console.log("├─ Treasury address:", treasury);
        console.log("├─ Emergency address:", emergency);
        console.log("├─ Pool manager address:", poolManager);
        
        // Check USDT token
        const usdtToken = await orphichainPlatform.usdtToken();
        console.log("├─ USDT token:", usdtToken);
        
        // Check package amounts
        const packageAmounts = await orphichainPlatform.getPackageAmounts();
        console.log("├─ Package amounts:", packageAmounts.map(amount => ethers.formatUnits(amount, 6) + " USDT"));
        
        // Check platform fee rate
        const feeRate = await orphichainPlatform.platformFeeRate();
        console.log("├─ Platform fee rate:", (Number(feeRate) / 100).toString() + "%");
        
        // Check roles
        const DEFAULT_ADMIN_ROLE = await orphichainPlatform.DEFAULT_ADMIN_ROLE();
        const TREASURY_ROLE = await orphichainPlatform.TREASURY_ROLE();
        const EMERGENCY_ROLE = await orphichainPlatform.EMERGENCY_ROLE();
        const POOL_MANAGER_ROLE = await orphichainPlatform.POOL_MANAGER_ROLE();
        const UPGRADER_ROLE = await orphichainPlatform.UPGRADER_ROLE();
        
        console.log("├─ Admin role assigned:", await orphichainPlatform.hasRole(DEFAULT_ADMIN_ROLE, deployer.address));
        console.log("├─ Treasury role assigned:", await orphichainPlatform.hasRole(TREASURY_ROLE, TREASURY_ADDRESS));
        console.log("├─ Emergency role assigned:", await orphichainPlatform.hasRole(EMERGENCY_ROLE, EMERGENCY_ADDRESS));
        console.log("├─ Pool manager role assigned:", await orphichainPlatform.hasRole(POOL_MANAGER_ROLE, POOL_MANAGER_ADDRESS));
        console.log("├─ Upgrader role assigned:", await orphichainPlatform.hasRole(UPGRADER_ROLE, deployer.address));
        console.log("└─ Verification complete! ✅\n");

        // Step 3: Save deployment information
        console.log("💾 Step 3: Saving Deployment Information...");
        
        const deploymentInfo = {
            network: network.name,
            chainId: network.chainId.toString(),
            timestamp: new Date().toISOString(),
            deployer: deployer.address,
            contracts: {
                proxy: proxyAddress,
                implementation: implementationAddress,
                usdtToken: usdtAddress
            },
            administrativeAddresses: {
                treasury: TREASURY_ADDRESS,
                emergency: EMERGENCY_ADDRESS,
                poolManager: POOL_MANAGER_ADDRESS
            },
            configuration: {
                packageAmounts: packageAmounts.map(amount => ethers.formatUnits(amount, 6)),
                platformFeeRate: (Number(feeRate) / 100).toString() + "%",
                version: version
            },
            roles: {
                admin: deployer.address,
                treasury: TREASURY_ADDRESS,
                emergency: EMERGENCY_ADDRESS,
                poolManager: POOL_MANAGER_ADDRESS,
                upgrader: deployer.address
            },
            gasUsed: {
                // Will be filled by transaction receipts
            }
        };

        // Save to file
        const fs = require('fs');
        const deploymentFileName = `deployment-upgradeable-${network.name}-${Date.now()}.json`;
        fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentInfo, null, 2));
        console.log("├─ Deployment info saved to:", deploymentFileName);
        console.log("└─ Information saved! ✅\n");

        // Step 4: Display summary
        console.log("📊 Deployment Summary:");
        console.log("┌─────────────────────────────────────────────────────────────────┐");
        console.log("│                    DEPLOYMENT SUCCESSFUL! 🎉                   │");
        console.log("├─────────────────────────────────────────────────────────────────┤");
        console.log(`│ Proxy Address:        ${proxyAddress}     │`);
        console.log(`│ Implementation:       ${implementationAddress}     │`);
        console.log(`│ Network:              ${network.name.padEnd(43)} │`);
        console.log(`│ Version:              ${version.padEnd(43)} │`);
        console.log("├─────────────────────────────────────────────────────────────────┤");
        console.log("│ Administrative Addresses:                                      │");
        console.log(`│ Treasury:             ${TREASURY_ADDRESS}     │`);
        console.log(`│ Emergency:            ${EMERGENCY_ADDRESS}     │`);
        console.log(`│ Pool Manager:         ${POOL_MANAGER_ADDRESS}     │`);
        console.log("├─────────────────────────────────────────────────────────────────┤");
        console.log("│ Features:                                                       │");
        console.log("│ ✅ Upgradeable (UUPS Proxy)                                    │");
        console.log("│ ✅ Role-based Access Control                                   │");
        console.log("│ ✅ Pausable Functionality                                      │");
        console.log("│ ✅ Platform Fee Collection                                     │");
        console.log("│ ✅ Multi-tier Package System                                   │");
        console.log("│ ✅ Binary Matrix Placement                                     │");
        console.log("│ ✅ Commission & Pool Systems                                   │");
        console.log("└─────────────────────────────────────────────────────────────────┘");
        console.log();

        // Step 5: Next steps
        console.log("🔄 Next Steps:");
        console.log("1. Verify contract on block explorer (if on public network)");
        console.log("2. Test basic functionality with small transactions");
        console.log("3. Set up monitoring and analytics");
        console.log("4. Configure frontend to use the new proxy address");
        console.log("5. Plan user migration from existing contracts (if applicable)");
        console.log();

        // Step 6: Important notes
        console.log("⚠️  Important Notes:");
        console.log("• Always use the PROXY address for interactions, not the implementation");
        console.log("• Keep the deployer private key secure (has upgrade rights)");
        console.log("• Test upgrades on testnet before mainnet");
        console.log("• Administrative addresses have been configured with provided addresses");
        console.log("• Platform fee is set to 2.5% (can be adjusted by owner)");
        console.log();

        return {
            proxy: proxyAddress,
            implementation: implementationAddress,
            deploymentInfo
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// Handle script execution
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("💥 Fatal error:", error);
            process.exit(1);
        });
}

module.exports = main;
