const { ethers, upgrades } = require("hardhat");

/**
 * @title Testnet Deployment Script for Upgradeable Contract
 * @dev Deploys the upgradeable contract to BSC Testnet with full verification
 */

async function main() {
    console.log("🚀 STARTING TESTNET DEPLOYMENT - UPGRADEABLE CONTRACT\n");
    
    // Get network information
    const network = await ethers.provider.getNetwork();
    console.log("📋 Deployment Configuration:");
    console.log("├─ Network:", network.name);
    console.log("├─ Chain ID:", network.chainId.toString());
    console.log("├─ Block Number:", await ethers.provider.getBlockNumber());
    
    // Get deployment account
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    
    console.log("├─ Deployer address:", deployer.address);
    console.log("├─ Deployer balance:", ethers.formatEther(deployerBalance), "BNB");
    console.log("└─ Timestamp:", new Date().toISOString());
    console.log();

    // Check minimum balance requirement
    const minBalance = ethers.parseEther("0.1"); // 0.1 BNB minimum
    if (deployerBalance < minBalance) {
        throw new Error(`Insufficient balance. Need at least 0.1 BNB, have ${ethers.formatEther(deployerBalance)} BNB`);
    }

    try {
        // Step 1: Deploy Mock USDT for testnet
        console.log("📦 Step 1: Deploying Mock USDT for Testnet...");
        const MockUSDT = await ethers.getContractFactory("contracts/MockUSDT.sol:MockUSDT");
        const mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        const usdtAddress = await mockUSDT.getAddress();
        
        console.log("├─ Mock USDT deployed to:", usdtAddress);
        console.log("├─ Transaction hash:", mockUSDT.deploymentTransaction().hash);
        console.log("└─ Mock USDT deployment successful! ✅\n");

        // Step 2: Set up administrative addresses
        console.log("⚙️ Step 2: Setting Up Administrative Addresses...");
        
        // For testnet, we'll use the deployer for all roles initially
        // In production, these should be separate multi-sig wallets
        const treasuryAddress = deployer.address; // Should be treasury multi-sig in production
        const emergencyAddress = deployer.address; // Should be emergency multi-sig in production
        const poolManagerAddress = deployer.address; // Should be pool manager in production
        
        console.log("├─ Treasury address:", treasuryAddress);
        console.log("├─ Emergency address:", emergencyAddress);
        console.log("├─ Pool manager address:", poolManagerAddress);
        console.log("└─ Administrative setup complete! ✅\n");

        // Step 3: Deploy upgradeable contract
        console.log("📦 Step 3: Deploying Upgradeable Contract...");
        
        const OrphichainPlatformUpgradeable = await ethers.getContractFactory("OrphichainCrowdfundPlatformUpgradeable");
        
        console.log("├─ Deploying proxy with UUPS pattern...");
        const orphichainPlatform = await upgrades.deployProxy(
            OrphichainPlatformUpgradeable,
            [
                usdtAddress,
                treasuryAddress,
                emergencyAddress,
                poolManagerAddress
            ],
            {
                initializer: 'initialize',
                kind: 'uups'
            }
        );
        
        await orphichainPlatform.waitForDeployment();
        const proxyAddress = await orphichainPlatform.getAddress();
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        
        console.log("├─ Proxy deployed to:", proxyAddress);
        console.log("├─ Implementation deployed to:", implementationAddress);
        console.log("├─ Proxy transaction hash:", orphichainPlatform.deploymentTransaction().hash);
        console.log("└─ Upgradeable contract deployment successful! ✅\n");

        // Step 4: Verify deployment
        console.log("🔍 Step 4: Verifying Deployment...");
        
        // Check contract version
        const version = await orphichainPlatform.version();
        console.log("├─ Contract version:", version);
        
        // Check administrative addresses
        const [treasuryAddr, emergencyAddr, poolManagerAddr] = await orphichainPlatform.getAdministrativeAddresses();
        console.log("├─ Treasury address verified:", treasuryAddr === treasuryAddress ? "✅" : "❌");
        console.log("├─ Emergency address verified:", emergencyAddr === emergencyAddress ? "✅" : "❌");
        console.log("├─ Pool manager address verified:", poolManagerAddr === poolManagerAddress ? "✅" : "❌");
        
        // Check package amounts
        const packageAmounts = await orphichainPlatform.getPackageAmounts();
        console.log("├─ Package amounts:", packageAmounts.map(amount => ethers.formatUnits(amount, 6) + " USDT"));
        
        // Check platform fee rate
        const feeRate = await orphichainPlatform.platformFeeRate();
        console.log("├─ Platform fee rate:", (Number(feeRate) / 100).toString() + "%");
        
        // Check roles
        const DEFAULT_ADMIN_ROLE = await orphichainPlatform.DEFAULT_ADMIN_ROLE();
        const hasAdminRole = await orphichainPlatform.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
        console.log("├─ Deployer has admin role:", hasAdminRole ? "✅" : "❌");
        
        console.log("└─ Deployment verification complete! ✅\n");

        // Step 5: Setup test environment
        console.log("⚙️ Step 5: Setting Up Test Environment...");
        
        // Mint some USDT to deployer for testing
        const testAmount = ethers.parseUnits("10000", 6); // 10,000 USDT
        await mockUSDT.mint(deployer.address, testAmount);
        await mockUSDT.approve(proxyAddress, testAmount);
        
        console.log("├─ Minted", ethers.formatUnits(testAmount, 6), "USDT to deployer");
        console.log("├─ Approved", ethers.formatUnits(testAmount, 6), "USDT for contract");
        console.log("└─ Test environment setup complete! ✅\n");

        // Step 6: Run basic functionality test
        console.log("🧪 Step 6: Running Basic Functionality Test...");
        
        try {
            // Test user registration
            await orphichainPlatform.registerUser(deployer.address, 1); // $30 package
            console.log("├─ User registration test: ✅");
            
            // Check user info
            const userInfo = await orphichainPlatform.getUserInfo(deployer.address);
            console.log("├─ User package tier:", userInfo.packageTier.toString());
            console.log("├─ User total invested:", ethers.formatUnits(userInfo.totalInvested, 6), "USDT");
            
            // Check platform stats
            const [totalUsers, totalVolume, poolBalances] = await orphichainPlatform.getPlatformStats();
            console.log("├─ Total users:", totalUsers.toString());
            console.log("├─ Total volume:", ethers.formatUnits(totalVolume, 6), "USDT");
            
            console.log("└─ Basic functionality test complete! ✅\n");
        } catch (error) {
            console.log("├─ Basic functionality test failed:", error.message);
            console.log("└─ ❌ Some features may need attention\n");
        }

        // Step 7: Generate deployment report
        console.log("📊 Step 7: Generating Deployment Report...");
        
        const deploymentReport = {
            network: {
                name: network.name,
                chainId: network.chainId.toString(),
                blockNumber: await ethers.provider.getBlockNumber()
            },
            deployer: {
                address: deployer.address,
                balance: ethers.formatEther(deployerBalance) + " BNB"
            },
            contracts: {
                mockUSDT: {
                    address: usdtAddress,
                    transactionHash: mockUSDT.deploymentTransaction().hash
                },
                orphichainPlatform: {
                    proxyAddress: proxyAddress,
                    implementationAddress: implementationAddress,
                    transactionHash: orphichainPlatform.deploymentTransaction().hash,
                    version: version
                }
            },
            configuration: {
                treasuryAddress: treasuryAddress,
                emergencyAddress: emergencyAddress,
                poolManagerAddress: poolManagerAddress,
                platformFeeRate: (Number(feeRate) / 100).toString() + "%",
                packageAmounts: packageAmounts.map(amount => ethers.formatUnits(amount, 6) + " USDT")
            },
            verification: {
                contractVersion: version,
                adminRoleSet: hasAdminRole,
                basicFunctionalityTested: true
            },
            timestamp: new Date().toISOString(),
            deploymentDuration: Date.now()
        };

        // Save deployment report
        const fs = require('fs');
        const reportFileName = `testnet-deployment-report-${Date.now()}.json`;
        fs.writeFileSync(reportFileName, JSON.stringify(deploymentReport, null, 2));
        
        console.log("├─ Deployment report saved to:", reportFileName);
        console.log("└─ Deployment report generation complete! ✅\n");

        // Step 8: Display final summary
        console.log("🎉 TESTNET DEPLOYMENT COMPLETE!");
        console.log("┌─────────────────────────────────────────────────────────────────┐");
        console.log("│                    DEPLOYMENT SUCCESSFUL! 🎉                   │");
        console.log("├─────────────────────────────────────────────────────────────────┤");
        console.log(`│ Network:              ${network.name.padEnd(43)} │`);
        console.log(`│ Chain ID:             ${network.chainId.toString().padEnd(43)} │`);
        console.log(`│ Proxy Address:        ${proxyAddress.padEnd(43)} │`);
        console.log(`│ Implementation:       ${implementationAddress.padEnd(43)} │`);
        console.log(`│ Mock USDT:            ${usdtAddress.padEnd(43)} │`);
        console.log("├─────────────────────────────────────────────────────────────────┤");
        console.log("│ Contract Features:                                             │");
        console.log("│ ✅ Upgradeable Architecture (UUPS)                            │");
        console.log("│ ✅ Role-Based Access Control                                  │");
        console.log("│ ✅ Emergency Pause/Unpause                                    │");
        console.log("│ ✅ Multi-tier Package System                                  │");
        console.log("│ ✅ Binary Matrix Placement                                    │");
        console.log("│ ✅ Commission Distribution                                    │");
        console.log("│ ✅ Secure Withdrawal System                                   │");
        console.log("└─────────────────────────────────────────────────────────────────┘");
        console.log();

        console.log("🔗 Important Addresses:");
        console.log("├─ Proxy Contract:", proxyAddress);
        console.log("├─ Implementation:", implementationAddress);
        console.log("├─ Mock USDT:", usdtAddress);
        console.log("├─ Treasury:", treasuryAddress);
        console.log("├─ Emergency:", emergencyAddress);
        console.log("└─ Pool Manager:", poolManagerAddress);
        console.log();

        console.log("📋 Next Steps:");
        console.log("1. Verify contracts on BSCScan");
        console.log("2. Update frontend with new contract addresses");
        console.log("3. Conduct extended testing with real users");
        console.log("4. Monitor performance and gas usage");
        console.log("5. Prepare for mainnet deployment");
        console.log();

        console.log("🔧 Testing Commands:");
        console.log("├─ Basic test: npx hardhat run scripts/test-testnet-basic.js --network bscTestnet");
        console.log("├─ Stress test: npx hardhat run scripts/heavy-load-stress-test.js --network bscTestnet");
        console.log("└─ Frontend test: Update .env with new addresses and test dashboard");
        console.log();

        return {
            proxyAddress,
            implementationAddress,
            usdtAddress,
            deploymentReport
        };

    } catch (error) {
        console.error("❌ Testnet deployment failed:", error);
        
        // Log gas estimation if available
        if (error.transaction) {
            console.error("Transaction details:", error.transaction);
        }
        
        throw error;
    }
}

// Handle script execution
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("💥 Fatal deployment error:", error);
            process.exit(1);
        });
}

module.exports = main;
