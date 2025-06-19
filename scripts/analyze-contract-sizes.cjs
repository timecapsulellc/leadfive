const fs = require('fs');
const path = require('path');

async function analyzeContractSizes() {
    console.log("📏 LEADFIVE CONTRACT SIZE ANALYSIS");
    console.log("=" * 60);

    const EIP170_LIMIT = 24576; // 24KB limit
    const artifactsPath = './artifacts/contracts';
    
    const contracts = [
        'LeadFiveModular.sol/LeadFiveModular.json',
        'LeadFive.sol/LeadFive.json',
        'libraries/CommissionLib.sol/CommissionLib.json',
        'libraries/MatrixLib.sol/MatrixLib.json',
        'libraries/PoolLib.sol/PoolLib.json',
        'OrphiCrowdFund.sol/OrphiCrowdFund.json'
    ];

    let totalSize = 0;
    const results = [];

    console.log("📊 CONTRACT SIZE BREAKDOWN:");
    console.log("-" * 60);

    for (const contractPath of contracts) {
        const fullPath = path.join(artifactsPath, contractPath);
        
        try {
            if (fs.existsSync(fullPath)) {
                const artifact = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                const bytecode = artifact.bytecode;
                const deployedBytecode = artifact.deployedBytecode;
                
                // Calculate sizes
                const bytecodeSize = bytecode ? (bytecode.length - 2) / 2 : 0; // Remove 0x prefix
                const deployedSize = deployedBytecode ? (deployedBytecode.length - 2) / 2 : 0;
                
                const contractName = path.basename(contractPath, '.json');
                const sizeKB = (deployedSize / 1024).toFixed(2);
                const percentage = ((deployedSize / EIP170_LIMIT) * 100).toFixed(1);
                
                console.log(`📦 ${contractName}:`);
                console.log(`   Deployed Size: ${deployedSize} bytes (${sizeKB} KB)`);
                console.log(`   EIP-170 Usage: ${percentage}%`);
                
                if (contractName.includes('LeadFive')) {
                    totalSize += deployedSize;
                }
                
                results.push({
                    name: contractName,
                    bytecodeSize,
                    deployedSize,
                    sizeKB: parseFloat(sizeKB),
                    percentage: parseFloat(percentage),
                    isMainContract: contractName.includes('LeadFive')
                });
                
                console.log("");
            } else {
                console.log(`⚠️  ${contractPath} not found`);
            }
        } catch (error) {
            console.log(`❌ Error analyzing ${contractPath}:`, error.message);
        }
    }

    console.log("=" * 60);
    console.log("📊 SUMMARY ANALYSIS:");
    console.log("=" * 60);

    // Find main contracts
    const mainContracts = results.filter(r => r.isMainContract);
    const libraries = results.filter(r => r.name.includes('Lib'));
    const legacy = results.filter(r => r.name.includes('Orphi'));

    console.log("🎯 MAIN CONTRACTS:");
    mainContracts.forEach(contract => {
        const status = contract.deployedSize < EIP170_LIMIT ? "✅ COMPLIANT" : "❌ TOO LARGE";
        console.log(`   ${contract.name}: ${contract.sizeKB} KB - ${status}`);
    });

    console.log("\n📚 LIBRARIES:");
    libraries.forEach(lib => {
        console.log(`   ${lib.name}: ${lib.sizeKB} KB`);
    });

    if (legacy.length > 0) {
        console.log("\n🗂️  LEGACY CONTRACTS:");
        legacy.forEach(leg => {
            console.log(`   ${leg.name}: ${leg.sizeKB} KB (Legacy - can be archived)`);
        });
    }

    // Calculate total for modular approach
    const modularTotal = results
        .filter(r => r.name === 'LeadFiveModular')
        .reduce((sum, r) => sum + r.deployedSize, 0);

    console.log("\n" + "=" * 60);
    console.log("🎯 EIP-170 COMPLIANCE ANALYSIS:");
    console.log("=" * 60);

    console.log(`📏 EIP-170 Limit: ${EIP170_LIMIT} bytes (24 KB)`);
    console.log(`📦 LeadFiveModular Size: ${modularTotal} bytes (${(modularTotal/1024).toFixed(2)} KB)`);
    console.log(`📊 Usage: ${((modularTotal/EIP170_LIMIT)*100).toFixed(1)}%`);
    console.log(`🔄 Remaining: ${EIP170_LIMIT - modularTotal} bytes (${((EIP170_LIMIT - modularTotal)/1024).toFixed(2)} KB)`);

    const complianceStatus = modularTotal < EIP170_LIMIT ? "✅ COMPLIANT" : "❌ EXCEEDS LIMIT";
    console.log(`🎯 Status: ${complianceStatus}`);

    if (modularTotal < EIP170_LIMIT) {
        const safetyBuffer = EIP170_LIMIT - modularTotal;
        if (safetyBuffer > 1000) {
            console.log("✅ Excellent! Contract has sufficient room for future enhancements");
        } else if (safetyBuffer > 500) {
            console.log("⚠️  Good, but approaching limit. Monitor future additions");
        } else {
            console.log("🚨 Close to limit! Prioritize size optimization");
        }
    }

    // Optimization recommendations
    console.log("\n" + "=" * 60);
    console.log("💡 OPTIMIZATION RECOMMENDATIONS:");
    console.log("=" * 60);

    if (modularTotal < EIP170_LIMIT - 2000) {
        console.log("✅ Contract size is optimal");
        console.log("✅ Room for additional features if needed");
        console.log("✅ Can add ASCII art banner safely");
    } else if (modularTotal < EIP170_LIMIT - 500) {
        console.log("⚠️  Contract size is acceptable");
        console.log("⚠️  Limited room for additions");
        console.log("⚠️  Skip ASCII art banner to maintain safety buffer");
    } else {
        console.log("🚨 Contract size optimization needed");
        console.log("🚨 Remove non-essential features");
        console.log("🚨 Consider further modularization");
    }

    // Legacy cleanup recommendations
    if (legacy.length > 0) {
        console.log("\n🧹 CLEANUP RECOMMENDATIONS:");
        console.log("✅ Archive legacy Orphi contracts");
        console.log("✅ Remove unused deployment scripts");
        console.log("✅ Clean up test files");
        console.log("✅ Update frontend to use only LeadFive contracts");
    }

    console.log("\n✅ CONTRACT SIZE ANALYSIS COMPLETE!");
    
    return {
        mainContracts,
        libraries,
        legacy,
        modularTotal,
        compliance: modularTotal < EIP170_LIMIT,
        safetyBuffer: EIP170_LIMIT - modularTotal
    };
}

analyzeContractSizes()
    .then((results) => {
        console.log("\n📄 Analysis complete. Results saved to memory.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Analysis failed:", error);
        process.exit(1);
    });
