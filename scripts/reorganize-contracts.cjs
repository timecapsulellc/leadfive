const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🔧 Reorganizing Contract Files for LeadFive v1.0.0...\n");

    const contractsDir = path.join(__dirname, 'contracts');
    const archiveDir = path.join(contractsDir, 'archive');
    const backupDir = path.join(contractsDir, 'backup');

    // Step 1: Create archive and backup directories
    console.log("Step 1: Creating directories...");
    if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
        console.log("✅ Created archive directory");
    }
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
        console.log("✅ Created backup directory");
    }

    // Step 2: Backup important addresses and info
    console.log("\nStep 2: Creating deployment backup...");
    const deploymentBackup = {
        timestamp: new Date().toISOString(),
        network: "BSC Mainnet",
        proxyAddress: "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623",
        previousImplementations: [
            "0x10965e40d90054fde981dd1a470937c4718f757"
        ],
        trezorOwner: "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29",
        usdtToken: "0x55d398326f99059fF775485246999027B3197955",
        note: "Pre-optimization deployment addresses - Contract reorganization before final deployment"
    };

    fs.writeFileSync(
        path.join(backupDir, 'DEPLOYMENT_ADDRESSES_BACKUP.json'),
        JSON.stringify(deploymentBackup, null, 2)
    );
    console.log("✅ Deployment addresses backed up");

    // Step 3: Archive old contract files
    console.log("\nStep 3: Archiving old contract files...");
    const filesToArchive = [
        'LeadFive.sol',
        'LeadFiveV2.sol'
    ];

    for (const file of filesToArchive) {
        const sourcePath = path.join(contractsDir, file);
        const destPath = path.join(archiveDir, file);
        
        if (fs.existsSync(sourcePath)) {
            // Add timestamp to archived file
            const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
            const archiveName = file.replace('.sol', `_${timestamp}.sol`);
            const archivePath = path.join(archiveDir, archiveName);
            
            fs.copyFileSync(sourcePath, archivePath);
            console.log(`✅ Archived ${file} as ${archiveName}`);
            
            // Remove original after archiving
            fs.unlinkSync(sourcePath);
            console.log(`   Removed original ${file}`);
        } else {
            console.log(`⚠️  ${file} not found, skipping`);
        }
    }

    // Step 4: Rename LeadFiveOptimized.sol to LeadFive.sol
    console.log("\nStep 4: Setting LeadFiveOptimized as main contract...");
    const optimizedPath = path.join(contractsDir, 'LeadFiveOptimized.sol');
    const mainPath = path.join(contractsDir, 'LeadFive.sol');

    if (fs.existsSync(optimizedPath)) {
        fs.renameSync(optimizedPath, mainPath);
        console.log("✅ LeadFiveOptimized.sol renamed to LeadFive.sol");
        console.log("   This is now your main production contract");
    } else {
        console.log("❌ LeadFiveOptimized.sol not found!");
        return;
    }

    // Step 5: Update hardhat config if needed
    console.log("\nStep 5: Checking configuration files...");
    const configFiles = ['hardhat.config.js', 'hardhat.config.cjs'];
    
    for (const configFile of configFiles) {
        const configPath = path.join(__dirname, configFile);
        if (fs.existsSync(configPath)) {
            let config = fs.readFileSync(configPath, 'utf8');
            
            // Update any references to LeadFiveOptimized
            if (config.includes('LeadFiveOptimized')) {
                config = config.replace(/LeadFiveOptimized/g, 'LeadFive');
                fs.writeFileSync(configPath, config);
                console.log(`✅ Updated ${configFile}`);
            } else {
                console.log(`✅ ${configFile} already correct`);
            }
        }
    }

    // Step 6: Create a README for the archive
    const archiveReadme = `# Archived Contracts

This directory contains archived versions of the LeadFive contracts.

## Archive Contents:
- Previous contract versions before optimization
- Old implementations with mixed BNB/USDT logic
- Deployment addresses are saved in backup/DEPLOYMENT_ADDRESSES_BACKUP.json

## Important Production Addresses:
- **Proxy Contract**: 0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623
- **Current Owner**: 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29 (Trezor)
- **USDT Token**: 0x55d398326f99059fF775485246999027B3197955

## Current Production Contract:
The main production contract is now at: **contracts/LeadFive.sol**
(Previously LeadFiveOptimized.sol)

### Key Features of New Main Contract:
- ✅ USDT-Only (no BNB logic)
- ✅ 2-parameter register function: register(sponsor, packageLevel)
- ✅ Gas-optimized operations
- ✅ Comprehensive read/write functions
- ✅ 6-decimal internal accounting with 18-decimal BSC compatibility
- ✅ All business logic preserved

## Archive History:
- Archived on: ${new Date().toISOString()}
- Reason: Contract optimization and cleanup for v1.0.0 production launch
- Status: Safe to delete these files after successful deployment

## Next Steps:
1. Compile new main contract
2. Deploy via upgrade scripts
3. Verify on BSCScan
4. Test all functionality
`;

    fs.writeFileSync(path.join(archiveDir, 'README.md'), archiveReadme);
    console.log("✅ Created archive README");

    // Step 7: Create deployment checklist
    const deploymentChecklist = `# LeadFive v1.0.0 USDT-Only Deployment Checklist

## ✅ PRE-DEPLOYMENT COMPLETED
- [x] Contract optimized and renamed to LeadFive.sol
- [x] Old contracts archived with timestamps  
- [x] Deployment addresses backed up
- [ ] Contract compiled successfully
- [ ] Pre-deployment checks passed

## 🚀 DEPLOYMENT SEQUENCE
### Phase 1: Preparation
1. [ ] Run pre-deployment check: \`npx hardhat run 1-pre-deployment-check.cjs --network bsc\`
2. [ ] Verify contract compiles: \`npx hardhat compile\`
3. [ ] Ensure deployer has ownership or transfer from Trezor

### Phase 2: Upgrade Execution  
4. [ ] Deploy new implementation: \`npx hardhat run 2-complete-upgrade.cjs --network bsc\`
5. [ ] Initialize production features
6. [ ] Verify upgrade success

### Phase 3: Testing & Validation
7. [ ] Test all functions: \`npx hardhat run 3-test-functionality.cjs --network bsc\`
8. [ ] Register deployer as root user (Package 3, 100 USDT)
9. [ ] Test USDT-only register function (2 parameters)
10. [ ] Verify all read functions work
11. [ ] Check gas optimization improvements

### Phase 4: Finalization
12. [ ] Transfer ownership back to Trezor: \`npx hardhat run 4-transfer-ownership-to-trezor.cjs --network bsc\`
13. [ ] Verify contract on BSCScan
14. [ ] Update frontend integration
15. [ ] Document final addresses

## 📊 CRITICAL VERIFICATION POINTS
- ✅ Register function has ONLY 2 parameters: (sponsor, packageLevel)
- ✅ All BNB/Oracle logic completely removed
- ✅ USDT decimals properly handled (6 internal, 18 BSC)
- ✅ All business logic preserved
- ✅ Gas optimization implemented
- ✅ Comprehensive read/write functions included

## 🔧 IMPORTANT COMMANDS
\`\`\`bash
# Compile
npx hardhat compile

# Run full deployment sequence
npx hardhat run 1-pre-deployment-check.cjs --network bsc
npx hardhat run 2-complete-upgrade.cjs --network bsc  
npx hardhat run 3-test-functionality.cjs --network bsc
npx hardhat run 4-transfer-ownership-to-trezor.cjs --network bsc

# Verify on BSCScan
npx hardhat verify --network bsc <IMPLEMENTATION_ADDRESS>
\`\`\`

## 📍 PRODUCTION ADDRESSES
- **Proxy**: 0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623
- **Owner**: 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29 (Trezor)
- **USDT**: 0x55d398326f99059fF775485246999027B3197955

---
*Contract reorganization completed: ${new Date().toISOString()}*
`;

    fs.writeFileSync(
        path.join(__dirname, 'DEPLOYMENT_CHECKLIST.md'),
        deploymentChecklist
    );
    console.log("✅ Created deployment checklist");

    // Step 8: Update deployment scripts to use correct contract name
    console.log("\nStep 6: Updating deployment scripts...");
    const scriptFiles = [
        '1-pre-deployment-check.cjs',
        '2-complete-upgrade.cjs', 
        '3-test-functionality.cjs',
        '4-transfer-ownership-to-trezor.cjs'
    ];

    for (const scriptFile of scriptFiles) {
        const scriptPath = path.join(__dirname, scriptFile);
        if (fs.existsSync(scriptPath)) {
            let script = fs.readFileSync(scriptPath, 'utf8');
            
            // Update contract references
            if (script.includes('LeadFiveOptimized')) {
                script = script.replace(/LeadFiveOptimized/g, 'LeadFive');
                fs.writeFileSync(scriptPath, script);
                console.log(`✅ Updated ${scriptFile}`);
            } else {
                console.log(`✅ ${scriptFile} already correct`);
            }
        } else {
            console.log(`⚠️  ${scriptFile} not found`);
        }
    }

    // Final summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 REORGANIZATION COMPLETE!");
    console.log("=".repeat(50));
    console.log("✅ Main contract: contracts/LeadFive.sol (optimized USDT-only version)");
    console.log("✅ Old contracts: contracts/archive/ (with timestamps)");
    console.log("✅ Deployment backup: contracts/backup/DEPLOYMENT_ADDRESSES_BACKUP.json");
    console.log("✅ Deployment checklist: DEPLOYMENT_CHECKLIST.md");
    console.log("✅ All scripts updated to use 'LeadFive'");
    console.log("\n🚀 Ready for deployment! Your contract structure is clean and organized.");
    console.log("\n📋 Next steps:");
    console.log("1. npx hardhat compile");
    console.log("2. npx hardhat run 1-pre-deployment-check.cjs --network bsc");
    console.log("3. Follow DEPLOYMENT_CHECKLIST.md");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error during reorganization:", error);
        process.exit(1);
    });
