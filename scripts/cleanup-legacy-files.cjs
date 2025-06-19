const fs = require('fs');
const path = require('path');

async function cleanupLegacyFiles() {
    console.log("🧹 LEADFIVE LEGACY FILES CLEANUP");
    console.log("=" * 60);

    const archiveDir = './archive/legacy-orphi-cleanup';
    
    // Create archive directory if it doesn't exist
    if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
        console.log("📁 Created archive directory:", archiveDir);
    }

    // Legacy files to archive
    const legacyFiles = [
        // Legacy contracts
        'contracts/OrphiCrowdFund.sol',
        'contracts/OrphiProxy.sol',
        'contracts/CommissionLib.sol',
        'contracts/CoreLogic.sol',
        'contracts/InternalAdminManager.sol',
        'contracts/MatrixPlacementLib.sol',
        'contracts/PoolDistribution.sol',
        'contracts/SecurityLibrary.sol',
        
        // Legacy scripts
        'scripts/deploy-orphi-testnet.cjs',
        'scripts/deploy.js',
        
        // Legacy frontend
        'src/contracts.js',
        
        // Legacy tests
        'test/OrphiCrowdFund-CompPlan.test.cjs',
        'test/OrphiCrowdFund-CompPlanViewFunctions.test.cjs',
        'test/OrphiCrowdFund-LeaderRanks.test.cjs',
        'test/OrphiCrowdFund-MatrixGenealogy.test.cjs',
        'test/OrphiCrowdFund-PoolDistributions.test.cjs',
        'test/OrphiCrowdFund-UpgradeTimelock.test.cjs',
        'test/OrphiCrowdFund-WithdrawReinvestCap.test.cjs'
    ];

    let archivedCount = 0;
    let notFoundCount = 0;

    console.log("📦 ARCHIVING LEGACY FILES:");
    console.log("-" * 60);

    for (const filePath of legacyFiles) {
        try {
            if (fs.existsSync(filePath)) {
                const fileName = path.basename(filePath);
                const archivePath = path.join(archiveDir, fileName);
                
                // Copy file to archive
                fs.copyFileSync(filePath, archivePath);
                console.log(`✅ Archived: ${filePath} → ${archivePath}`);
                
                // Remove original file
                fs.unlinkSync(filePath);
                console.log(`🗑️  Removed: ${filePath}`);
                
                archivedCount++;
            } else {
                console.log(`⚠️  Not found: ${filePath}`);
                notFoundCount++;
            }
        } catch (error) {
            console.log(`❌ Error processing ${filePath}:`, error.message);
        }
    }

    // Clean up empty directories
    const dirsToCheck = [
        'contracts/core',
        'contracts/facets',
        'contracts/interfaces',
        'contracts/mocks',
        'contracts/modules'
    ];

    console.log("\n📁 CLEANING EMPTY DIRECTORIES:");
    console.log("-" * 60);

    for (const dirPath of dirsToCheck) {
        try {
            if (fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath);
                if (files.length === 0) {
                    fs.rmdirSync(dirPath);
                    console.log(`🗑️  Removed empty directory: ${dirPath}`);
                } else {
                    console.log(`📁 Directory not empty: ${dirPath} (${files.length} files)`);
                }
            } else {
                console.log(`⚠️  Directory not found: ${dirPath}`);
            }
        } catch (error) {
            console.log(`❌ Error checking directory ${dirPath}:`, error.message);
        }
    }

    // Update .gitignore to exclude archived files
    console.log("\n📝 UPDATING .GITIGNORE:");
    console.log("-" * 60);

    const gitignorePath = './.gitignore';
    let gitignoreContent = '';
    
    if (fs.existsSync(gitignorePath)) {
        gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    const archiveEntry = '\n# Legacy Orphi files archive\narchive/legacy-orphi-cleanup/\n';
    
    if (!gitignoreContent.includes('archive/legacy-orphi-cleanup/')) {
        gitignoreContent += archiveEntry;
        fs.writeFileSync(gitignorePath, gitignoreContent);
        console.log("✅ Updated .gitignore to exclude archived files");
    } else {
        console.log("ℹ️  .gitignore already excludes archived files");
    }

    // Generate cleanup summary
    const cleanupSummary = {
        timestamp: new Date().toISOString(),
        archivedFiles: archivedCount,
        notFoundFiles: notFoundCount,
        archiveLocation: archiveDir,
        activeContracts: [
            'contracts/LeadFiveModular.sol',
            'contracts/LeadFive.sol',
            'contracts/libraries/CommissionLib.sol',
            'contracts/libraries/MatrixLib.sol',
            'contracts/libraries/PoolLib.sol'
        ],
        activeScripts: [
            'scripts/deploy-leadfive.cjs',
            'scripts/deploy-leadfive-testnet.cjs',
            'scripts/test-testnet-deployment.cjs',
            'scripts/analyze-contract-sizes.cjs'
        ],
        activeFrontend: [
            'src/contracts-leadfive.js',
            'src/App.jsx',
            'src/components/LeadFiveApp.jsx'
        ],
        activeTests: [
            'test/ComprehensiveFeatureAudit.test.cjs',
            'test/CriticalFixes.test.cjs',
            'test/CompensationPlanCompliance.test.cjs'
        ]
    };

    fs.writeFileSync(
        path.join(archiveDir, 'cleanup-summary.json'),
        JSON.stringify(cleanupSummary, null, 2)
    );

    console.log("\n" + "=" * 60);
    console.log("🎉 CLEANUP SUMMARY");
    console.log("=" * 60);

    console.log(`✅ Files archived: ${archivedCount}`);
    console.log(`⚠️  Files not found: ${notFoundCount}`);
    console.log(`📁 Archive location: ${archiveDir}`);
    console.log(`📄 Summary saved: ${path.join(archiveDir, 'cleanup-summary.json')}`);

    console.log("\n🎯 ACTIVE LEADFIVE COMPONENTS:");
    console.log("📦 Contracts:");
    cleanupSummary.activeContracts.forEach(contract => {
        console.log(`   ✅ ${contract}`);
    });

    console.log("🔧 Scripts:");
    cleanupSummary.activeScripts.forEach(script => {
        console.log(`   ✅ ${script}`);
    });

    console.log("🌐 Frontend:");
    cleanupSummary.activeFrontend.forEach(frontend => {
        console.log(`   ✅ ${frontend}`);
    });

    console.log("🧪 Tests:");
    cleanupSummary.activeTests.forEach(test => {
        console.log(`   ✅ ${test}`);
    });

    console.log("\n✅ LEGACY FILES CLEANUP COMPLETE!");
    console.log("🎯 Repository is now clean and focused on LeadFive components");
    
    return cleanupSummary;
}

cleanupLegacyFiles()
    .then((summary) => {
        console.log("\n📄 Cleanup complete. Summary saved to archive.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Cleanup failed:", error);
        process.exit(1);
    });
