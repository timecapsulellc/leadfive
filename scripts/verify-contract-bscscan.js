const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

/**
 * BSCScan Contract Verification Script
 * 
 * This script verifies deployed contracts on BSCScan to enable
 * proper interaction through the BSCScan interface.
 * 
 * Usage:
 * npx hardhat run scripts/verify-contract-bscscan.js --network bsc-testnet
 */

async function main() {
    console.log("🔍 BSCScan Contract Verification Tool");
    console.log("=====================================");

    // Contract addresses from your deployments
    const contracts = {
        "OrphiCrowdFundV2Enhanced": "0x5ab22F4d339B66C1859029d2c2540d8BefCbdED4",
        "OrphichainCrowdfundPlatformUpgradeableSecure": "0x2A5CDeEc5dF5AE5137AF46920b2B4C4Aa9b0aEA0",
        "UnknownContract": "0x8F826B18096Dcf7AF4515B06Cb563475d189ab50" // The one from your screenshot
    };

    const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";

    console.log("📋 Available contracts for verification:");
    Object.entries(contracts).forEach(([name, address]) => {
        console.log(`   ${name}: ${address}`);
    });

    // Verify OrphiCrowdFundV2Enhanced first
    console.log("\n🚀 Verifying OrphiCrowdFundV2Enhanced...");
    try {
        await hre.run("verify:verify", {
            address: contracts.OrphiCrowdFundV2Enhanced,
            constructorArguments: [usdtAddress],
            contract: "temp_deploy/OrphiCrowdFundV2Enhanced.sol:OrphiCrowdFundV2Enhanced"
        });
        console.log("✅ OrphiCrowdFundV2Enhanced verified successfully!");
    } catch (error) {
        console.log("❌ OrphiCrowdFundV2Enhanced verification failed:", error.message);
        
        // Try alternative verification
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract already verified!");
        } else {
            console.log("🔄 Trying alternative verification method...");
            await tryAlternativeVerification(contracts.OrphiCrowdFundV2Enhanced, "OrphiCrowdFundV2Enhanced", [usdtAddress]);
        }
    }

    // Verify the Upgradeable Secure contract
    console.log("\n🚀 Verifying OrphichainCrowdfundPlatformUpgradeableSecure...");
    try {
        await hre.run("verify:verify", {
            address: contracts.OrphichainCrowdfundPlatformUpgradeableSecure,
            constructorArguments: [],
            contract: "contracts/OrphichainCrowdfundPlatformUpgradeableSecure.sol:OrphichainCrowdfundPlatformUpgradeableSecure"
        });
        console.log("✅ OrphichainCrowdfundPlatformUpgradeableSecure verified successfully!");
    } catch (error) {
        console.log("❌ OrphichainCrowdfundPlatformUpgradeableSecure verification failed:", error.message);
        
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract already verified!");
        }
    }

    // Check the unknown contract
    console.log("\n🔍 Investigating unknown contract...");
    await investigateContract(contracts.UnknownContract);

    // Generate verification report
    await generateVerificationReport(contracts);

    console.log("\n🎉 Verification process completed!");
    console.log("\n📝 Next steps:");
    console.log("1. Check BSCScan for verified contracts");
    console.log("2. Test contract interactions on BSCScan");
    console.log("3. Update frontend with correct contract addresses");
}

async function tryAlternativeVerification(address, contractName, constructorArgs) {
    try {
        console.log(`🔄 Attempting alternative verification for ${contractName}...`);
        
        // Try with flattened contract
        const flattenedPath = `contracts/flattened/${contractName}.sol`;
        
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: constructorArgs,
            contract: `${flattenedPath}:${contractName}`
        });
        
        console.log(`✅ Alternative verification successful for ${contractName}!`);
    } catch (error) {
        console.log(`❌ Alternative verification also failed: ${error.message}`);
        
        // Provide manual verification instructions
        console.log(`\n📋 Manual verification instructions for ${contractName}:`);
        console.log(`1. Go to https://testnet.bscscan.com/address/${address}#code`);
        console.log(`2. Click "Verify and Publish"`);
        console.log(`3. Select "Solidity (Single file)"`);
        console.log(`4. Compiler version: 0.8.22`);
        console.log(`5. Optimization: Yes (200 runs)`);
        console.log(`6. Constructor arguments: ${JSON.stringify(constructorArgs)}`);
    }
}

async function investigateContract(address) {
    try {
        const provider = hre.ethers.provider;
        
        // Check if contract exists
        const code = await provider.getCode(address);
        if (code === "0x") {
            console.log(`❌ No contract found at address ${address}`);
            return;
        }
        
        console.log(`✅ Contract exists at ${address}`);
        console.log(`📏 Bytecode length: ${code.length} characters`);
        
        // Try to get contract info
        try {
            const contract = await hre.ethers.getContractAt("OrphiCrowdFundV2Enhanced", address);
            const owner = await contract.owner();
            console.log(`👤 Contract owner: ${owner}`);
            
            const usdtToken = await contract.usdtToken();
            console.log(`💰 USDT token: ${usdtToken}`);
            
            const totalMembers = await contract.totalMembers();
            console.log(`👥 Total members: ${totalMembers.toString()}`);
            
        } catch (error) {
            console.log(`❌ Could not read contract data: ${error.message}`);
            console.log("🔍 This suggests the contract has a different ABI");
        }
        
    } catch (error) {
        console.log(`❌ Error investigating contract: ${error.message}`);
    }
}

async function generateVerificationReport(contracts) {
    const report = {
        timestamp: new Date().toISOString(),
        network: hre.network.name,
        contracts: {},
        recommendations: []
    };

    for (const [name, address] of Object.entries(contracts)) {
        try {
            const provider = hre.ethers.provider;
            const code = await provider.getCode(address);
            
            report.contracts[name] = {
                address: address,
                exists: code !== "0x",
                bytecodeLength: code.length,
                bscscanUrl: `https://testnet.bscscan.com/address/${address}`,
                status: "needs_verification"
            };
        } catch (error) {
            report.contracts[name] = {
                address: address,
                exists: false,
                error: error.message,
                status: "error"
            };
        }
    }

    // Add recommendations
    report.recommendations = [
        "Verify all deployed contracts on BSCScan",
        "Test contract interactions through BSCScan interface",
        "Update frontend configuration with verified contract addresses",
        "Create comprehensive ABI documentation",
        "Set up automated verification in deployment scripts"
    ];

    // Save report
    const reportPath = `contract-verification-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Verification report saved to: ${reportPath}`);
}

// Function to create flattened contract for manual verification
async function createFlattenedContract(contractPath, outputPath) {
    try {
        console.log(`📄 Creating flattened contract for ${contractPath}...`);
        
        const flattened = await hre.run("flatten:get-flattened-sources", {
            files: [contractPath]
        });
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, flattened);
        console.log(`✅ Flattened contract saved to: ${outputPath}`);
        
    } catch (error) {
        console.log(`❌ Error creating flattened contract: ${error.message}`);
    }
}

// Helper function to verify with specific parameters
async function verifyWithParams(address, contractName, constructorArgs, contractPath) {
    try {
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: constructorArgs,
            contract: contractPath
        });
        return true;
    } catch (error) {
        console.log(`Verification failed: ${error.message}`);
        return false;
    }
}

// Run the main function
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Verification script failed:", error);
        process.exit(1);
    });
