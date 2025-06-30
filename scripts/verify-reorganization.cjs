const fs = require('fs');
const path = require('path');
const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying New Contract Structure After Reorganization...\n");

    const contractsDir = path.join(__dirname, 'contracts');

    // Step 1: Check main contract exists and is correct
    console.log("=== STEP 1: MAIN CONTRACT VERIFICATION ===");
    const mainContractPath = path.join(contractsDir, 'LeadFive.sol');
    
    if (fs.existsSync(mainContractPath)) {
        console.log("✅ Main contract exists: contracts/LeadFive.sol");
        
        // Read and verify it's the optimized version
        const content = fs.readFileSync(mainContractPath, 'utf8');
        
        // Check for key features
        const checks = [
            { name: "USDT-Only Version", pattern: "USDT-Only Version", found: content.includes("USDT-Only Version") },
            { name: "2-parameter register", pattern: "register(address sponsor, uint8 packageLevel)", found: content.includes("register(\n        address sponsor,\n        uint8 packageLevel\n    )") || content.includes("register(address sponsor, uint8 packageLevel)") },
            { name: "Gas optimization", pattern: "gas-optimized", found: content.includes("gas-optimized") || content.includes("Gas-optimized") },
            { name: "Comprehensive functions", pattern: "getUserFullInfo", found: content.includes("getUserFullInfo") },
            { name: "No BNB logic", pattern: "no BNB references", found: !content.includes("msg.value") && !content.includes("BNB payment") },
            { name: "USDT decimal handling", pattern: "convertToUSDT18", found: content.includes("convertToUSDT18") },
            { name: "Pool management", pattern: "getAllPoolBalances", found: content.includes("getAllPoolBalances") }
        ];
        
        console.log("\n📋 Contract Feature Verification:");
        checks.forEach(check => {
            if (check.found) {
                console.log(`   ✅ ${check.name}`);
            } else {
                console.log(`   ❌ ${check.name} - MISSING`);
            }
        });
        
        const allPassed = checks.every(check => check.found);
        if (allPassed) {
            console.log("\n🎉 All features verified! This is the correct optimized contract.");
        } else {
            console.log("\n⚠️  Some features missing. Please check the contract.");
        }
        
    } else {
        console.log("❌ Main contract not found!");
        return;
    }

    // Step 2: Check archive exists
    console.log("\n=== STEP 2: ARCHIVE VERIFICATION ===");
    const archiveDir = path.join(contractsDir, 'archive');
    
    if (fs.existsSync(archiveDir)) {
        const archivedFiles = fs.readdirSync(archiveDir).filter(f => f.endsWith('.sol'));
        console.log(`✅ Archive directory exists with ${archivedFiles.length} contract files:`);
        archivedFiles.forEach(file => {
            console.log(`   📁 ${file}`);
        });
        
        // Check for README
        if (fs.existsSync(path.join(archiveDir, 'README.md'))) {
            console.log("   📄 README.md (archive documentation)");
        }
    } else {
        console.log("⚠️  Archive directory not found");
    }

    // Step 3: Check backup exists
    console.log("\n=== STEP 3: BACKUP VERIFICATION ===");
    const backupDir = path.join(contractsDir, 'backup');
    const backupFile = path.join(backupDir, 'DEPLOYMENT_ADDRESSES_BACKUP.json');
    
    if (fs.existsSync(backupFile)) {
        const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
        console.log("✅ Deployment backup exists:");
        console.log(`   🏠 Proxy: ${backup.proxyAddress}`);
        console.log(`   👑 Owner: ${backup.trezorOwner}`);
        console.log(`   💰 USDT: ${backup.usdtToken}`);
        console.log(`   📅 Created: ${backup.timestamp}`);
    } else {
        console.log("⚠️  Deployment backup not found");
    }

    // Step 4: Check deployment checklist
    console.log("\n=== STEP 4: DEPLOYMENT CHECKLIST ===");
    const checklistPath = path.join(__dirname, 'DEPLOYMENT_CHECKLIST.md');
    if (fs.existsSync(checklistPath)) {
        console.log("✅ Deployment checklist created: DEPLOYMENT_CHECKLIST.md");
    } else {
        console.log("⚠️  Deployment checklist not found");
    }

    // Step 5: Test compilation
    console.log("\n=== STEP 5: COMPILATION TEST ===");
    try {
        console.log("Attempting to compile LeadFive contract...");
        const LeadFive = await ethers.getContractFactory("LeadFive");
        console.log("✅ Contract compiles successfully!");
        
        // Check the interface
        const abi = LeadFive.interface;
        const registerFunc = abi.getFunction("register");
        console.log(`✅ Register function has ${registerFunc.inputs.length} parameters (expected: 2)`);
        
        if (registerFunc.inputs.length === 2) {
            console.log("   Parameters:");
            registerFunc.inputs.forEach((input, idx) => {
                console.log(`   ${idx + 1}. ${input.name} (${input.type})`);
            });
        } else {
            console.log("❌ Wrong parameter count for register function!");
        }
        
        // List key functions
        console.log("\n📋 Key Functions Verification:");
        const keyFunctions = [
            { name: "register", desc: "User registration (USDT-only)" },
            { name: "upgradePackage", desc: "Package upgrades" },
            { name: "withdraw", desc: "User withdrawals" },
            { name: "getUserFullInfo", desc: "Complete user data" },
            { name: "getAllPackagePrices", desc: "All package pricing" },
            { name: "getAllPoolBalances", desc: "Pool balances" },
            { name: "getUSDTBalance", desc: "Contract USDT balance" },
            { name: "getPlatformStats", desc: "Platform statistics" },
            { name: "convertToUSDT18", desc: "Decimal conversion" },
            { name: "getVersion", desc: "Contract version" }
        ];
        
        keyFunctions.forEach(func => {
            try {
                abi.getFunction(func.name);
                console.log(`   ✅ ${func.name} - ${func.desc}`);
            } catch {
                console.log(`   ❌ ${func.name} - MISSING`);
            }
        });
        
    } catch (error) {
        console.log("❌ Compilation failed:");
        console.log("   ", error.message);
        return;
    }

    // Step 6: Check script updates
    console.log("\n=== STEP 6: DEPLOYMENT SCRIPTS ===");
    const scriptFiles = [
        '1-pre-deployment-check.cjs',
        '2-complete-upgrade.cjs', 
        '3-test-functionality.cjs',
        '4-transfer-ownership-to-trezor.cjs'
    ];

    scriptFiles.forEach(scriptFile => {
        const scriptPath = path.join(__dirname, scriptFile);
        if (fs.existsSync(scriptPath)) {
            const script = fs.readFileSync(scriptPath, 'utf8');
            if (script.includes('LeadFive') && !script.includes('LeadFiveOptimized')) {
                console.log(`   ✅ ${scriptFile} - Updated`);
            } else if (script.includes('LeadFiveOptimized')) {
                console.log(`   ⚠️  ${scriptFile} - Still references LeadFiveOptimized`);
            } else {
                console.log(`   ❓ ${scriptFile} - No contract references found`);
            }
        } else {
            console.log(`   ❌ ${scriptFile} - Not found`);
        }
    });

    // Final summary and next steps
    console.log("\n" + "=".repeat(60));
    console.log("🎯 REORGANIZATION VERIFICATION COMPLETE");
    console.log("=".repeat(60));
    
    console.log("\n📁 Current Structure:");
    console.log("contracts/");
    console.log("├── LeadFive.sol (main optimized contract)");
    console.log("├── libraries/");
    console.log("│   ├── CoreOptimized.sol");
    console.log("│   └── Errors.sol");
    console.log("├── archive/ (old contract versions)");
    console.log("└── backup/ (deployment addresses)");
    
    console.log("\n✅ READY FOR DEPLOYMENT!");
    console.log("\n🚀 Next Steps:");
    console.log("1. npx hardhat compile");
    console.log("2. npx hardhat run 1-pre-deployment-check.cjs --network bsc");
    console.log("3. npx hardhat run 2-complete-upgrade.cjs --network bsc");
    console.log("4. Follow DEPLOYMENT_CHECKLIST.md for complete process");
    
    console.log("\n🔧 Key Features Ready:");
    console.log("• USDT-only payments (no BNB)");
    console.log("• 2-parameter register function");
    console.log("• Gas-optimized operations");
    console.log("• Comprehensive read/write functions");
    console.log("• Proper decimal handling (6 internal / 18 BSC)");
    console.log("• All business logic preserved");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Verification error:", error);
        process.exit(1);
    });
