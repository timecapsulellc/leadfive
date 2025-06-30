const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 LEADFIVE MAINNET READINESS CHECK");
    console.log("=" .repeat(70));
    
    let allChecksPass = true;
    
    console.log("\\n📋 PRE-DEPLOYMENT CHECKLIST");
    console.log("-".repeat(50));
    
    // Check 1: Network Configuration
    console.log("\\n1️⃣ Network Configuration");
    try {
        const network = await ethers.provider.getNetwork();
        if (network.chainId === 56n) {
            console.log("✅ Connected to BSC Mainnet (Chain ID: 56)");
        } else if (network.chainId === 97n) {
            console.log("⚠️  Connected to BSC Testnet (Chain ID: 97)");
            console.log("   Switch to mainnet network for production deployment");
        } else {
            console.log(`❌ Connected to wrong network (Chain ID: ${network.chainId})`);
            allChecksPass = false;
        }
    } catch (error) {
        console.log("❌ Network connection failed");
        allChecksPass = false;
    }
    
    // Check 2: Deployer Account
    console.log("\\n2️⃣ Deployer Account");
    try {
        const [deployer] = await ethers.getSigners();
        const balance = await ethers.provider.getBalance(deployer.address);
        const balanceInBNB = ethers.formatEther(balance);
        
        console.log(`✅ Deployer Address: ${deployer.address}`);
        console.log(`💰 BNB Balance: ${balanceInBNB} BNB`);
        
        if (parseFloat(balanceInBNB) >= 0.1) {
            console.log("✅ Sufficient BNB for deployment");
        } else {
            console.log("❌ Insufficient BNB. Need at least 0.1 BNB");
            allChecksPass = false;
        }
    } catch (error) {
        console.log("❌ Deployer account not accessible");
        allChecksPass = false;
    }
    
    // Check 3: Environment Variables
    console.log("\\n3️⃣ Environment Variables");
    const requiredEnvVars = [
        'DEPLOYER_PRIVATE_KEY',
        'BSC_MAINNET_RPC_URL',
        'BSCSCAN_API_KEY'
    ];
    
    let envVarsComplete = true;
    for (const envVar of requiredEnvVars) {
        if (process.env[envVar]) {
            console.log(`✅ ${envVar}: Configured`);
        } else {
            console.log(`❌ ${envVar}: Missing`);
            envVarsComplete = false;
            allChecksPass = false;
        }
    }
    
    if (envVarsComplete) {
        console.log("✅ All environment variables configured");
    }
    
    // Check 4: Contract Compilation
    console.log("\\n4️⃣ Contract Compilation");
    try {
        // Try to get contract factories to verify compilation
        await ethers.getContractFactory("contracts/LeadFive.sol:LeadFive");
        await ethers.getContractFactory("MockUSDT");
        await ethers.getContractFactory("MockWBNB");
        await ethers.getContractFactory("contracts/libraries/Errors.sol:Errors");
        await ethers.getContractFactory("contracts/libraries/CoreOptimized.sol:CoreOptimized");
        
        console.log("✅ All contracts compiled successfully");
        console.log("✅ Library dependencies resolved");
    } catch (error) {
        console.log("❌ Contract compilation failed");
        console.log(`   Error: ${error.message}`);
        allChecksPass = false;
    }
    
    // Check 5: Deployment Scripts
    console.log("\\n5️⃣ Deployment Scripts");
    const fs = require('fs');
    const requiredScripts = [
        'deploy-mainnet-production.cjs',
        'verify-mainnet-production.cjs',
        'verify-contracts-bscscan.cjs',
        'mainnet-production-manager.cjs'
    ];
    
    let scriptsAvailable = true;
    for (const script of requiredScripts) {
        if (fs.existsSync(script)) {
            console.log(`✅ ${script}: Available`);
        } else {
            console.log(`❌ ${script}: Missing`);
            scriptsAvailable = false;
            allChecksPass = false;
        }
    }
    
    if (scriptsAvailable) {
        console.log("✅ All deployment scripts ready");
    }
    
    // Check 6: Previous Testnet Success
    console.log("\\n6️⃣ Testnet Validation");
    try {
        if (fs.existsSync('./PRODUCTION_TESTING_FINAL_REPORT.md')) {
            console.log("✅ Testnet testing completed");
        } else {
            console.log("⚠️  No testnet testing report found");
        }
        
        if (fs.existsSync('./SCALABILITY_ANALYSIS_FINAL_REPORT.md')) {
            console.log("✅ Scalability analysis completed");
        } else {
            console.log("⚠️  No scalability analysis found");
        }
        
        if (fs.existsSync('./production-status.json')) {
            const status = JSON.parse(fs.readFileSync('./production-status.json', 'utf8'));
            if (status.mainnetReadiness.recommendation.includes("PROCEED")) {
                console.log("✅ Mainnet deployment recommended");
            } else {
                console.log("⚠️  Mainnet readiness needs review");
            }
        }
    } catch (error) {
        console.log("⚠️  Could not verify testnet results");
    }
    
    // Final Assessment
    console.log("\\n📊 READINESS ASSESSMENT");
    console.log("=" .repeat(70));
    
    if (allChecksPass) {
        console.log("🎉 ALL CHECKS PASSED - READY FOR MAINNET DEPLOYMENT!");
        console.log("\\n🚀 Next Steps:");
        console.log("1. Run: npx hardhat run deploy-mainnet-production.cjs --network bsc");
        console.log("2. Run: npx hardhat run verify-mainnet-production.cjs --network bsc");
        console.log("3. Run: npx hardhat run verify-contracts-bscscan.cjs --network bsc");
        console.log("\\n💡 Remember to start with controlled rollout (10-100 users)");
    } else {
        console.log("❌ SOME CHECKS FAILED - RESOLVE ISSUES BEFORE DEPLOYMENT");
        console.log("\\n🔧 Fix the issues above and run this check again");
    }
    
    console.log("=" .repeat(70));
    
    // Create readiness report
    const readinessReport = {
        timestamp: new Date().toISOString(),
        checksPerformed: 6,
        allChecksPassed: allChecksPass,
        readyForDeployment: allChecksPass,
        network: await ethers.provider.getNetwork().then(n => n.chainId.toString()),
        deployer: await ethers.getSigners().then(s => s[0].address).catch(() => "N/A"),
        nextSteps: allChecksPass ? [
            "Deploy to mainnet",
            "Verify deployment", 
            "Verify on BSCScan",
            "Start controlled rollout"
        ] : [
            "Fix failed checks",
            "Run readiness check again",
            "Proceed when all checks pass"
        ]
    };
    
    fs.writeFileSync(
        './mainnet-readiness-report.json',
        JSON.stringify(readinessReport, null, 2)
    );
    
    console.log("📋 Readiness report saved: mainnet-readiness-report.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Readiness check failed:", error);
        process.exit(1);
    });
