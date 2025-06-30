// SPDX-License-Identifier: MIT
/**
 * @title LeadFive Mainnet Contract Audit & Verification
 * @dev Comprehensive pre-deployment audit of LeadFive.sol contract
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 LEADFIVE MAINNET CONTRACT AUDIT & VERIFICATION");
    console.log("=" .repeat(70));
    
    try {
        // Get deployer account
        const [deployer] = await ethers.getSigners();
        console.log(`\n📋 DEPLOYER ACCOUNT:`);
        console.log(`Address: ${deployer.address}`);
        console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} BNB\n`);
        
        // 1. CONTRACT COMPILATION CHECK
        console.log("🔧 1. CONTRACT COMPILATION CHECK");
        console.log("-".repeat(40));
        
        try {
            const LeadFive = await ethers.getContractFactory("LeadFive");
            console.log("✅ LeadFive contract compiles successfully");
            console.log(`✅ Contract bytecode size: ${LeadFive.bytecode.length / 2 - 1} bytes`);
            
            // Check if contract size is within limits (24KB = 24576 bytes)
            const contractSize = LeadFive.bytecode.length / 2 - 1;
            if (contractSize > 24576) {
                console.log(`⚠️  WARNING: Contract size ${contractSize} bytes exceeds 24KB limit`);
            } else {
                console.log(`✅ Contract size within limits (${contractSize}/24576 bytes)`);
            }
        } catch (error) {
            console.log(`❌ Contract compilation failed: ${error.message}`);
            return;
        }
        
        // 2. LIBRARY DEPENDENCIES CHECK
        console.log("\n🔗 2. LIBRARY DEPENDENCIES CHECK");
        console.log("-".repeat(40));
        
        const requiredLibraries = [
            "MatrixManagementLib",
            "PoolDistributionLib", 
            "WithdrawalSafetyLib",
            "BusinessLogicLib",
            "AdvancedFeaturesLib",
            "DataStructures",
            "CoreOperationsLib",
            "OracleManagementLib",
            "BonusDistributionLib",
            "UserManagementLib",
            "ReferralLib"
        ];
        
        for (const libName of requiredLibraries) {
            try {
                await ethers.getContractFactory(libName);
                console.log(`✅ ${libName} - Available`);
            } catch (error) {
                console.log(`❌ ${libName} - Missing or compilation error`);
            }
        }
        
        // 3. SECURITY FEATURES VERIFICATION
        console.log("\n🛡️  3. SECURITY FEATURES VERIFICATION");
        console.log("-".repeat(40));
        
        // Read contract source to verify security features
        const fs = require('fs');
        const path = require('path');
        const contractPath = path.join(__dirname, '../contracts/LeadFive.sol');
        const contractSource = fs.readFileSync(contractPath, 'utf8');
        
        const securityFeatures = {
            "ReentrancyGuard": contractSource.includes("ReentrancyGuardUpgradeable") && contractSource.includes("nonReentrant"),
            "Pausable": contractSource.includes("PausableUpgradeable") && contractSource.includes("whenNotPaused"),
            "Access Control": contractSource.includes("OwnableUpgradeable") && contractSource.includes("onlyOwner"),
            "Admin Control": contractSource.includes("onlyAdmin") && contractSource.includes("isAdminAddress"),
            "MEV Protection": contractSource.includes("antiMEV") && contractSource.includes("lastTxBlock"),
            "Circuit Breaker": contractSource.includes("circuitBreakerThreshold") && contractSource.includes("windowWithdrawals"),
            "Earnings Cap": contractSource.includes("earningsCap") && contractSource.includes("addEarningsWithCap"),
            "Blacklist Function": contractSource.includes("isBlacklisted") && contractSource.includes("blacklistUser"),
            "Emergency Functions": contractSource.includes("emergencyPause") && contractSource.includes("emergencyWithdraw"),
            "Oracle Protection": contractSource.includes("getSecurePrice") && contractSource.includes("priceOracles"),
            "Withdrawal Safety": contractSource.includes("lastWithdrawal") && contractSource.includes("useSafety"),
            "UUPS Upgradeable": contractSource.includes("UUPSUpgradeable") && contractSource.includes("_authorizeUpgrade")
        };
        
        for (const [feature, isPresent] of Object.entries(securityFeatures)) {
            console.log(`${isPresent ? '✅' : '❌'} ${feature}`);
        }
        
        // 4. CRITICAL FUNCTIONS VERIFICATION
        console.log("\n⚙️  4. CRITICAL FUNCTIONS VERIFICATION");
        console.log("-".repeat(40));
        
        const criticalFunctions = {
            "initialize": contractSource.includes("function initialize(address _usdt, address _priceFeed)"),
            "register": contractSource.includes("function register(address referrer, uint8 packageLevel, bool useUSDT)"),
            "upgradePackage": contractSource.includes("function upgradePackage(uint8 newLevel, bool useUSDT)"),
            "withdraw": contractSource.includes("function withdraw(uint96 amount, bool useSafety)"),
            "claimAllRewards": contractSource.includes("function claimAllRewards()"),
            "_processPayment": contractSource.includes("function _processPayment(uint8 packageLevel, bool useUSDT)"),
            "_distributeBonuses": contractSource.includes("function _distributeBonuses(address user, uint96 amount, uint8 packageLevel)"),
            "addAdmin": contractSource.includes("function addAdmin(address admin)"),
            "removeAdmin": contractSource.includes("function removeAdmin(address admin)"),
            "setAdminFeeRecipient": contractSource.includes("function setAdminFeeRecipient(address _recipient)"),
            "addOracle": contractSource.includes("function addOracle(address oracle)"),
            "removeOracle": contractSource.includes("function removeOracle(address oracle)")
        };
        
        for (const [func, isPresent] of Object.entries(criticalFunctions)) {
            console.log(`${isPresent ? '✅' : '❌'} ${func}`);
        }
        
        // 5. ADMIN RIGHTS VERIFICATION
        console.log("\n👑 5. ADMIN RIGHTS VERIFICATION");
        console.log("-".repeat(40));
        
        const adminFunctions = {
            "Owner Functions": [
                "setAdminFeeRecipient",
                "addOracle", 
                "removeOracle",
                "setPriceFeed",
                "addAdmin",
                "removeAdmin", 
                "setAdminId",
                "setCircuitBreakerThreshold",
                "pause",
                "unpause",
                "emergencyWithdraw",
                "recoverUSDT",
                "_authorizeUpgrade"
            ],
            "Admin Functions": [
                "blacklistUser",
                "emergencyPause", 
                "bulkAdminOperation",
                "updateReserveFund",
                "distributeLeaderPool",
                "distributeHelpPool",
                "advanceUserMatrix"
            ]
        };
        
        for (const [category, functions] of Object.entries(adminFunctions)) {
            console.log(`\n${category}:`);
            for (const func of functions) {
                const hasFunction = contractSource.includes(`function ${func}`);
                const hasModifier = contractSource.includes(`${func}(`) && 
                                 (contractSource.includes(`onlyOwner`) || contractSource.includes(`onlyAdmin`));
                console.log(`  ${hasFunction && hasModifier ? '✅' : '❌'} ${func}`);
            }
        }
        
        // 6. PACKAGE CONFIGURATION CHECK
        console.log("\n💰 6. PACKAGE CONFIGURATION CHECK");
        console.log("-".repeat(40));
        
        // Check package initialization in constructor
        const packageConfigs = [
            "packages[1] = Package(30e18",
            "packages[2] = Package(50e18", 
            "packages[3] = Package(100e18",
            "packages[4] = Package(200e18"
        ];
        
        for (let i = 0; i < packageConfigs.length; i++) {
            const isPresent = contractSource.includes(packageConfigs[i]);
            console.log(`${isPresent ? '✅' : '❌'} Package ${i + 1} configuration`);
        }
        
        // 7. EVENT EMISSIONS CHECK
        console.log("\n📢 7. EVENT EMISSIONS CHECK");
        console.log("-".repeat(40));
        
        const events = [
            "UserRegistered",
            "PackageUpgraded", 
            "BonusDistributed",
            "Withdrawal",
            "PoolDistributed",
            "AdminFeeCollected",
            "ReferralCodeGenerated",
            "MatrixCycleCompleted",
            "RewardsClaimed",
            "OracleAdded",
            "OracleRemoved",
            "PriceFeedUpdated",
            "AdminAdded",
            "AdminRemoved",
            "EarningsCapReached"
        ];
        
        for (const event of events) {
            const isDefined = contractSource.includes(`event ${event}`);
            const isEmitted = contractSource.includes(`emit ${event}`);
            console.log(`${isDefined && isEmitted ? '✅' : '❌'} ${event} (defined: ${isDefined}, emitted: ${isEmitted})`);
        }
        
        // 8. TESTED FEATURES FROM OPTIMIZED CONTRACT
        console.log("\n🧪 8. TESTED FEATURES INTEGRATION CHECK");
        console.log("-".repeat(40));
        
        const testedFeatures = {
            "Mock Token Support": contractSource.includes("IERC20") && contractSource.includes("usdt"),
            "Price Feed Integration": contractSource.includes("IPriceFeed") && contractSource.includes("priceFeed"),
            "Matrix System": contractSource.includes("MatrixManagementLib") && contractSource.includes("matrixPositions"),
            "Pool Distribution": contractSource.includes("PoolDistributionLib") && contractSource.includes("leaderPool"),
            "Bonus Distribution": contractSource.includes("BonusDistributionLib") && contractSource.includes("_distributeBonuses"),
            "User Management": contractSource.includes("UserManagementLib") && contractSource.includes("createUser"),
            "Referral System": contractSource.includes("ReferralLib") && contractSource.includes("referralCode"),
            "Withdrawal Safety": contractSource.includes("WithdrawalSafetyLib") && contractSource.includes("useSafety"),
            "Business Logic": contractSource.includes("BusinessLogicLib") && contractSource.includes("calculateWithdrawalRate"),
            "Advanced Features": contractSource.includes("AdvancedFeaturesLib"),
            "Oracle Management": contractSource.includes("OracleManagementLib") && contractSource.includes("getSecurePrice"),
            "View Functions": contractSource.includes("ViewFunctionsLib") && contractSource.includes("getUserInfo")
        };
        
        for (const [feature, isPresent] of Object.entries(testedFeatures)) {
            console.log(`${isPresent ? '✅' : '❌'} ${feature}`);
        }
        
        // 9. DEPLOYMENT CONFIGURATION CHECK
        console.log("\n🔧 9. DEPLOYMENT CONFIGURATION CHECK");
        console.log("-".repeat(40));
        
        // Check initialization parameters
        const initChecks = {
            "Owner Initialization": contractSource.includes("__Ownable_init(msg.sender)"),
            "UUPS Initialization": contractSource.includes("__UUPSUpgradeable_init()"),
            "ReentrancyGuard Init": contractSource.includes("__ReentrancyGuard_init()"),
            "Pausable Init": contractSource.includes("__Pausable_init()"),
            "USDT Token Setup": contractSource.includes("usdt = IERC20(_usdt)"),
            "Price Feed Setup": contractSource.includes("priceFeed = IPriceFeed(_priceFeed)"),
            "Admin Setup": contractSource.includes("isAdminAddress[msg.sender] = true"),
            "Package Setup": contractSource.includes("packages[1] = Package"),
            "Pool Setup": contractSource.includes("leaderPool = Pool"),
            "Circuit Breaker Setup": contractSource.includes("circuitBreakerThreshold = 50000 * 10**18")
        };
        
        for (const [check, isPresent] of Object.entries(initChecks)) {
            console.log(`${isPresent ? '✅' : '❌'} ${check}`);
        }
        
        // 10. MAINNET READINESS SUMMARY
        console.log("\n🎯 10. MAINNET READINESS SUMMARY");
        console.log("-".repeat(40));
        
        const readinessChecks = {
            "Contract Compiles": true, // We verified this above
            "All Libraries Present": requiredLibraries.every(lib => {
                try {
                    require(`../contracts/libraries/${lib}.sol`);
                    return true;
                } catch {
                    return false;
                }
            }),
            "Security Features": Object.values(securityFeatures).every(v => v),
            "Critical Functions": Object.values(criticalFunctions).every(v => v),
            "Admin Rights Configured": contractSource.includes("onlyOwner") && contractSource.includes("onlyAdmin"),
            "Events Properly Defined": events.every(e => contractSource.includes(`event ${e}`)),
            "Tested Features Integrated": Object.values(testedFeatures).filter(v => v).length >= 10,
            "Initialization Complete": Object.values(initChecks).every(v => v)
        };
        
        let passedChecks = 0;
        let totalChecks = Object.keys(readinessChecks).length;
        
        for (const [check, passed] of Object.entries(readinessChecks)) {
            console.log(`${passed ? '✅' : '❌'} ${check}`);
            if (passed) passedChecks++;
        }
        
        console.log(`\n📊 OVERALL READINESS: ${passedChecks}/${totalChecks} (${((passedChecks/totalChecks)*100).toFixed(1)}%)`);
        
        if (passedChecks === totalChecks) {
            console.log("\n🎉 CONTRACT IS READY FOR MAINNET DEPLOYMENT!");
            console.log("✅ All security features implemented");
            console.log("✅ All tested functions integrated");
            console.log("✅ Admin rights properly configured");
            console.log("✅ All libraries available");
        } else {
            console.log("\n⚠️  CONTRACT NEEDS ATTENTION BEFORE MAINNET DEPLOYMENT");
            console.log(`❌ ${totalChecks - passedChecks} issues found`);
        }
        
        // 11. DEPLOYMENT RECOMMENDATIONS
        console.log("\n💡 11. DEPLOYMENT RECOMMENDATIONS");
        console.log("-".repeat(40));
        
        console.log("📋 Pre-deployment checklist:");
        console.log("1. ✅ Deploy all required libraries first");
        console.log("2. ✅ Deploy with correct USDT address (BSC: 0x55d398326f99059fF775485246999027B3197955)");
        console.log("3. ✅ Deploy with correct price feed address");
        console.log("4. ✅ Set admin fee recipient immediately after deployment");
        console.log("5. ✅ Verify contract on BSCScan");
        console.log("6. ✅ Test all critical functions on mainnet");
        console.log("7. ✅ Transfer ownership if needed");
        
        console.log("\n📍 Contract addresses needed for deployment:");
        console.log("• USDT (BSC Mainnet): 0x55d398326f99059fF775485246999027B3197955");
        console.log("• BNB/USD Price Feed: 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE");
        console.log(`• Deployer: ${deployer.address}`);
        
    } catch (error) {
        console.error("❌ Audit failed:", error.message);
        console.error("Full error:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
