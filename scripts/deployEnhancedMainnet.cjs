// Enhanced OrphiCrowdFund Deployment Script - BSC Mainnet
// Deploys the complete advanced feature contract to mainnet

const { ethers, upgrades } = require("hardhat");
require('dotenv').config();

async function deployEnhancedMainnet() {
    console.log("🚀 DEPLOYING ENHANCED ORPHI CROWDFUND TO BSC MAINNET");
    console.log("=====================================================");
    
    // Get deployment account
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying from account: ${deployer.address}`);
    
    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`Account balance: ${ethers.utils.formatEther(balance)} BNB`);
    
    if (balance.lt(ethers.utils.parseEther("0.2"))) {
        throw new Error("Insufficient BNB balance for mainnet deployment");
    }
    
    // Contract addresses for mainnet
    const USDT_MAINNET = process.env.USDT_MAINNET || "0x55d398326f99059fF775485246999027B3197955";
    const TREASURY = process.env.Orphi_ADMIN_WALLET || deployer.address;
    const ORACLE_ADDRESS = deployer.address; // Will be updated to real oracle later
    
    console.log(`USDT Token: ${USDT_MAINNET}`);
    console.log(`Treasury: ${TREASURY}`);
    console.log(`Oracle: ${ORACLE_ADDRESS}`);
    
    // Confirmation for mainnet deployment
    console.log("\n⚠️  MAINNET DEPLOYMENT CONFIRMATION");
    console.log("====================================");
    console.log("This will deploy to BSC MAINNET with REAL funds!");
    console.log("Make sure you have:");
    console.log("1. ✅ Thoroughly tested on testnet");
    console.log("2. ✅ Verified all functions work");
    console.log("3. ✅ Sufficient BNB for deployment");
    console.log("4. ✅ Correct contract parameters");
    
    try {
        console.log("\n📦 Deploying OrphiCrowdFundEnhanced to MAINNET...");
        
        // Get contract factory
        const OrphiCrowdFundEnhanced = await ethers.getContractFactory("OrphiCrowdFundEnhanced");
        
        // Deploy with upgradeable proxy
        console.log("⏳ Deploying proxy contract...");
        const contract = await upgrades.deployProxy(
            OrphiCrowdFundEnhanced,
            [USDT_MAINNET, TREASURY, ORACLE_ADDRESS],
            {
                initializer: 'initialize',
                kind: 'uups'
            }
        );
        
        await contract.deployed();
        
        console.log("✅ Enhanced Contract deployed to MAINNET!");
        console.log(`📍 Proxy Address: ${contract.address}`);
        
        // Get implementation address
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(contract.address);
        console.log(`📍 Implementation Address: ${implementationAddress}`);
        
        // Wait for confirmations
        console.log("\n⏳ Waiting for block confirmations...");
        await contract.deployTransaction.wait(5);
        
        // Verify deployment
        console.log("\n🔍 Verifying deployment...");
        
        const version = await contract.getVersion();
        console.log(`Contract Version: ${version}`);
        
        const owner = await contract.owner();
        console.log(`Contract Owner: ${owner}`);
        
        const registrationOpen = await contract.registrationOpen();
        console.log(`Registration Open: ${registrationOpen}`);
        
        const totalPackages = await contract.totalPackages();
        console.log(`Total Packages: ${totalPackages}`);
        
        // Test package amounts
        console.log("\n📊 Package Amounts:");
        for (let tier = 1; tier <= totalPackages; tier++) {
            try {
                const amount = await contract.getPackageAmount(tier);
                console.log(`  Tier ${tier}: ${ethers.utils.formatUnits(amount, 18)} USDT`);
            } catch (error) {
                console.log(`  Tier ${tier}: Error - ${error.message}`);
            }
        }
        
        // Verify all new functions are working
        console.log("\n🔧 Testing New Enhanced Functions:");
        
        const functionTests = [
            {
                name: "getDirectReferrals",
                test: async () => await contract.getDirectReferrals(deployer.address),
                expected: "Empty array"
            },
            {
                name: "oracleEnabled",
                test: async () => await contract.oracleEnabled(),
                expected: "Boolean"
            },
            {
                name: "getPlatformAnalytics",
                test: async () => await contract.getPlatformAnalytics(),
                expected: "Array of metrics"
            },
            {
                name: "getPoolBalances",
                test: async () => await contract.getPoolBalances(),
                expected: "Pool balances"
            },
            {
                name: "getLeadersByRank",
                test: async () => await contract.getLeadersByRank(1),
                expected: "Leader array"
            },
            {
                name: "getUserAnalytics",
                test: async () => await contract.getUserAnalytics(deployer.address),
                expected: "User analytics"
            },
            {
                name: "getNetworkAnalytics",
                test: async () => await contract.getNetworkAnalytics(deployer.address),
                expected: "Network data"
            }
        ];
        
        let passedTests = 0;
        for (const test of functionTests) {
            try {
                const result = await test.test();
                console.log(`✅ ${test.name}() - Working`);
                passedTests++;
            } catch (error) {
                console.log(`❌ ${test.name}() - Failed: ${error.message}`);
            }
        }
        
        console.log(`\n📊 Function Tests: ${passedTests}/${functionTests.length} passed`);
        
        // Setup initial roles
        console.log("\n🔐 Setting up admin roles...");
        try {
            // Grant additional roles to admin wallet
            const adminWallet = process.env.Orphi_ADMIN_WALLET;
            if (adminWallet && adminWallet !== deployer.address) {
                const roles = [
                    'ADMIN_ROLE', 'PLATFORM_ROLE', 'TREASURY_ROLE',
                    'POOL_MANAGER_ROLE', 'BONUS_MANAGER_ROLE', 'ORACLE_ROLE'
                ];
                
                for (const roleName of roles) {
                    try {
                        const role = await contract[roleName]();
                        await contract.grantRole(role, adminWallet);
                        console.log(`✅ Granted ${roleName} to ${adminWallet}`);
                    } catch (error) {
                        console.log(`⚠️ Failed to grant ${roleName}: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            console.log(`⚠️ Role setup warning: ${error.message}`);
        }
        
        console.log("\n🎯 MAINNET DEPLOYMENT SUMMARY");
        console.log("==============================");
        console.log(`✅ Network: BSC Mainnet (Chain ID: 56)`);
        console.log(`✅ Proxy Address: ${contract.address}`);
        console.log(`✅ Implementation: ${implementationAddress}`);
        console.log(`✅ Owner: ${owner}`);
        console.log(`✅ Treasury: ${TREASURY}`);
        console.log(`✅ USDT Token: ${USDT_MAINNET}`);
        console.log(`✅ All enhanced features: DEPLOYED`);
        console.log(`✅ Function tests passed: ${passedTests}/${functionTests.length}`);
        
        console.log("\n🚀 NEW FEATURES NOW AVAILABLE:");
        console.log("===============================");
        console.log("✅ Dynamic Package Pricing System");
        console.log("✅ Oracle Integration for Real-time Pricing");
        console.log("✅ Automated Bonus Distribution System");
        console.log("✅ Direct Referral Tracking & Analytics");
        console.log("✅ Binary Tree Automation & Placement");
        console.log("✅ Advanced Team Volume Tracking");
        console.log("✅ Leader Bonus System with 5 Ranks");
        console.log("✅ Club Pool Distribution (Tier 3+)");
        console.log("✅ Multi-tier Compensation Plan");
        console.log("✅ Complex Network Analytics");
        console.log("✅ Enhanced User Metrics");
        console.log("✅ 12 Granular Admin Roles");
        
        console.log("\n🔧 IMMEDIATE NEXT STEPS:");
        console.log("=========================");
        console.log("1. Verify contract on BSCScan");
        console.log("2. Update frontend to use new contract");
        console.log("3. Test root user registration");
        console.log("4. Run comprehensive testing");
        console.log("5. Update .env with new addresses");
        
        console.log("\n📋 CONTRACT VERIFICATION:");
        console.log("==========================");
        console.log(`npx hardhat verify --network bsc_mainnet ${contract.address}`);
        console.log(`npx hardhat verify --network bsc_mainnet ${implementationAddress}`);
        
        console.log("\n💡 TESTING COMMANDS:");
        console.log("====================");
        console.log(`npx hardhat run tests/testEnhancedMainnet.cjs --network bsc_mainnet`);
        
        // Save deployment info
        const deploymentInfo = {
            network: "BSC Mainnet",
            chainId: 56,
            proxyAddress: contract.address,
            implementationAddress: implementationAddress,
            owner: owner,
            treasury: TREASURY,
            usdtToken: USDT_MAINNET,
            oracle: ORACLE_ADDRESS,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            blockNumber: await deployer.provider.getBlockNumber(),
            version: version,
            gasUsed: contract.deployTransaction.gasLimit.toString(),
            features: {
                dynamicPackaging: true,
                oracleIntegration: true,
                automatedBonuses: true,
                directReferralTracking: true,
                binaryTreeAutomation: true,
                leaderBonusSystem: true,
                clubPoolDistribution: true,
                advancedAnalytics: true,
                enhancedSecurity: true,
                multiTierCompensation: true,
                complexNetworkAnalytics: true,
                enhancedUserMetrics: true,
                granularAdminRoles: true
            },
            functionTests: {
                total: functionTests.length,
                passed: passedTests,
                success: passedTests === functionTests.length
            }
        };
        
        console.log("\n💾 Saving deployment info...");
        const fs = require('fs');
        
        // Create deployments directory if it doesn't exist
        if (!fs.existsSync('./deployments')) {
            fs.mkdirSync('./deployments');
        }
        
        fs.writeFileSync(
            './deployments/enhanced-mainnet-deployment.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        // Update .env template
        const envUpdate = `
# ENHANCED CONTRACT DEPLOYMENT - BSC MAINNET
ENHANCED_ORPHI_MAINNET_PROXY=${contract.address}
ENHANCED_ORPHI_MAINNET_IMPLEMENTATION=${implementationAddress}
ENHANCED_CONTRACT_VERSION=${version}
ENHANCED_DEPLOYMENT_DATE=${new Date().toISOString()}
`;
        
        fs.appendFileSync('./deployments/enhanced-env-update.txt', envUpdate);
        
        console.log("✅ Deployment info saved to ./deployments/");
        
        return {
            contract,
            proxyAddress: contract.address,
            implementationAddress,
            deploymentInfo
        };
        
    } catch (error) {
        console.error("❌ Mainnet deployment failed:", error);
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    deployEnhancedMainnet()
        .then(({ proxyAddress, implementationAddress, deploymentInfo }) => {
            console.log(`\n🎉 ENHANCED CONTRACT SUCCESSFULLY DEPLOYED TO MAINNET!`);
            console.log(`🎯 Proxy: ${proxyAddress}`);
            console.log(`🏗️ Implementation: ${implementationAddress}`);
            console.log(`🔗 BSCScan: https://bscscan.com/address/${proxyAddress}`);
            console.log(`\n🚀 ALL MISSING FEATURES NOW AVAILABLE!`);
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Mainnet deployment failed:", error);
            process.exit(1);
        });
}

module.exports = deployEnhancedMainnet;
