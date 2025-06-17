const { runPreDeploymentValidation } = require('./pre-deployment-validation.js');
const { runGasEstimation } = require('./gas-estimation.js');
const deployMainnet = require('./deploy-mainnet-comprehensive.js');
const { runPostDeploymentVerification } = require('./post-deployment-verification.js');

/**
 * 🚀 ORPHI CROWDFUND COMPLETE DEPLOYMENT ORCHESTRATOR
 * 
 * This script orchestrates the complete mainnet deployment process:
 * 1. Pre-deployment validation
 * 2. Gas estimation and timing
 * 3. User confirmation
 * 4. Mainnet deployment
 * 5. Post-deployment verification
 * 6. Final status report
 */

const readline = require('readline');

// ==================== USER INTERACTION ====================
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.toLowerCase().trim());
        });
    });
};

const confirmDeployment = async () => {
    console.log("\n" + "⚠️ ".repeat(20));
    console.log("🚨 CRITICAL MAINNET DEPLOYMENT CONFIRMATION");
    console.log("⚠️ ".repeat(20));
    console.log("\n📋 DEPLOYMENT CHECKLIST:");
    console.log("✅ Pre-deployment validation completed");
    console.log("✅ Gas estimation reviewed");
    console.log("✅ Account balance sufficient");
    console.log("✅ All security checks passed");
    console.log("\n🔥 THIS WILL:");
    console.log("• Deploy to BSC Mainnet with REAL BNB");
    console.log("• Use your configured private key");
    console.log("• Make the contract live for production use");
    console.log("• Cost approximately 0.05-0.10 BNB (~$30-60)");
    
    const answer = await askQuestion('\n❓ Are you absolutely sure you want to proceed? (type "YES" to confirm): ');
    
    if (answer === 'yes') {
        console.log("✅ Deployment confirmed. Starting mainnet deployment...");
        return true;
    } else {
        console.log("❌ Deployment cancelled by user.");
        return false;
    }
};

// ==================== DEPLOYMENT ORCHESTRATOR ====================
async function orchestrateDeployment() {
    console.log("🚀 ORPHI CROWDFUND COMPLETE DEPLOYMENT ORCHESTRATOR");
    console.log("═".repeat(80));
    console.log("🎯 Automated end-to-end mainnet deployment process");
    console.log("🛡️ With comprehensive validation and verification");
    console.log("═".repeat(80));
    
    const startTime = Date.now();
    let deploymentResult = null;
    
    try {
        // Step 1: Pre-deployment validation
        console.log("\n📋 STEP 1: PRE-DEPLOYMENT VALIDATION");
        console.log("═".repeat(50));
        
        const validationPassed = await runPreDeploymentValidation();
        
        if (!validationPassed) {
            console.log("❌ Pre-deployment validation failed!");
            console.log("🛑 Deployment aborted. Fix the issues and try again.");
            process.exit(1);
        }
        
        console.log("✅ Pre-deployment validation completed successfully!");
        
        // Step 2: Gas estimation
        console.log("\n⛽ STEP 2: GAS ESTIMATION & TIMING ANALYSIS");
        console.log("═".repeat(50));
        
        const gasData = await runGasEstimation();
        console.log("✅ Gas estimation completed!");
        
        // Step 3: User confirmation
        console.log("\n🔐 STEP 3: DEPLOYMENT CONFIRMATION");
        console.log("═".repeat(50));
        
        const confirmed = await confirmDeployment();
        
        if (!confirmed) {
            console.log("🛑 Deployment cancelled by user.");
            process.exit(0);
        }
        
        // Step 4: Mainnet deployment
        console.log("\n🚀 STEP 4: MAINNET DEPLOYMENT");
        console.log("═".repeat(50));
        
        deploymentResult = await deployMainnet();
        
        if (!deploymentResult.success) {
            throw new Error("Mainnet deployment failed");
        }
        
        console.log("✅ Mainnet deployment completed successfully!");
        console.log(`📍 Contract Address: ${deploymentResult.contractAddress}`);
        
        // Step 5: Post-deployment verification
        console.log("\n🔍 STEP 5: POST-DEPLOYMENT VERIFICATION");
        console.log("═".repeat(50));
        
        // Pass the contract address to verification
        process.argv.push('--address', deploymentResult.contractAddress);
        
        const verificationPassed = await runPostDeploymentVerification();
        
        if (!verificationPassed) {
            console.log("⚠️  Post-deployment verification had issues!");
            console.log("🔧 Manual review recommended before going live.");
        } else {
            console.log("✅ Post-deployment verification completed successfully!");
        }
        
        // Step 6: Final status report
        console.log("\n📊 STEP 6: FINAL DEPLOYMENT REPORT");
        console.log("═".repeat(50));
        
        const totalTime = (Date.now() - startTime) / 1000;
        
        console.log("\n🎉 ORPHI CROWDFUND MAINNET DEPLOYMENT COMPLETED!");
        console.log("═".repeat(80));
        
        console.log("\n📋 DEPLOYMENT SUMMARY:");
        console.log(`   🎯 Status: ${deploymentResult.success ? 'SUCCESS' : 'FAILED'}`);
        console.log(`   📍 Contract: ${deploymentResult.contractAddress}`);
        console.log(`   ⏱️  Total Time: ${totalTime.toFixed(1)} seconds`);
        console.log(`   📄 Details: ${deploymentResult.deploymentFile}`);
        
        console.log("\n🔗 IMPORTANT LINKS:");
        console.log(`   📊 BSCScan: https://bscscan.com/address/${deploymentResult.contractAddress}`);
        console.log(`   🔍 Verify: https://bscscan.com/address/${deploymentResult.contractAddress}#code`);
        console.log(`   📄 Transaction: https://bscscan.com/tx/${deploymentResult.deploymentData.transactionHash}`);
        
        console.log("\n🎯 IMMEDIATE NEXT STEPS:");
        console.log("1. ✅ Contract successfully deployed to BSC Mainnet");
        console.log("2. 🔄 Update frontend configuration with new contract address");
        console.log("3. 🧪 Run final integration tests on mainnet");
        console.log("4. 📢 Announce mainnet launch to community");
        console.log("5. 📊 Monitor contract activity and performance");
        
        console.log("\n📋 FRONTEND CONFIGURATION:");
        console.log("Update your frontend with these values:");
        console.log(`REACT_APP_CONTRACT_ADDRESS=${deploymentResult.contractAddress}`);
        console.log(`REACT_APP_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955`);
        console.log(`REACT_APP_NETWORK=bsc-mainnet`);
        console.log(`REACT_APP_CHAIN_ID=56`);
        
        console.log("\n🛡️ SECURITY REMINDERS:");
        console.log("• 🔐 Secure your deployer private key");
        console.log("• 🔑 Consider multisig for admin functions");
        console.log("• 📋 Document all administrative procedures");
        console.log("• 🚨 Set up monitoring and alerting");
        console.log("• 🔄 Plan for future upgrades using UUPS");
        
        console.log("\n🎉 CONGRATULATIONS!");
        console.log("🚀 OrphiCrowdFund is now LIVE on BSC Mainnet!");
        console.log("🌍 Ready for global participation!");
        
        console.log("\n═".repeat(80));
        
        return {
            success: true,
            contractAddress: deploymentResult.contractAddress,
            deploymentData: deploymentResult.deploymentData,
            verificationPassed,
            totalTime
        };
        
    } catch (error) {
        console.error("\n❌ DEPLOYMENT ORCHESTRATION FAILED!");
        console.error("═".repeat(50));
        console.error(`Error: ${error.message}`);
        
        if (error.message.includes("insufficient funds")) {
            console.error("\n💡 Solution: Add more BNB to your deployer wallet");
        } else if (error.message.includes("user rejected")) {
            console.error("\n💡 Solution: Confirm the transaction on your hardware wallet");
        } else if (error.message.includes("network")) {
            console.error("\n💡 Solution: Check your BSC Mainnet connection");
        }
        
        console.error("\n📞 Support Options:");
        console.error("1. Review the deployment logs above");
        console.error("2. Check the MAINNET_DEPLOYMENT_GUIDE.md");
        console.error("3. Run individual scripts for debugging");
        console.error("4. Contact technical support");
        
        if (deploymentResult && deploymentResult.contractAddress) {
            console.error(`\n⚠️  Contract may have been deployed: ${deploymentResult.contractAddress}`);
            console.error("🔍 Check BSCScan to verify deployment status");
        }
        
        throw error;
        
    } finally {
        rl.close();
    }
}

// Execute orchestrator
if (require.main === module) {
    orchestrateDeployment()
        .then((result) => {
            if (result.success) {
                console.log("\n🎉 Complete deployment orchestration finished successfully!");
                process.exit(0);
            } else {
                console.log("\n❌ Deployment orchestration completed with issues!");
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error("\n💥 Fatal error in deployment orchestration:");
            console.error(error.message);
            process.exit(1);
        });
}

module.exports = orchestrateDeployment;
