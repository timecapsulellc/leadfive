const hre = require("hardhat");
const fs = require('fs');

/**
 * BSC Mainnet Contract Verification Script
 * 
 * This script investigates and verifies the mainnet contract at:
 * 0x8F826B18096Dcf7AF4515B06Cb563475d189ab50
 * 
 * Usage:
 * npx hardhat run scripts/verify-mainnet-contract.js --network bsc
 */

async function main() {
    console.log("🔍 BSC Mainnet Contract Verification Tool");
    console.log("==========================================");

    // The mainnet contract address from your BSCScan link
    const mainnetContract = "0x8F826B18096Dcf7AF4515B06Cb563475d189ab50";
    
    // BSC Mainnet USDT address
    const mainnetUSDT = "0x55d398326f99059fF775485246999027B3197955";
    
    console.log(`🎯 Target Contract: ${mainnetContract}`);
    console.log(`🌐 Network: BSC Mainnet (Chain ID: 56)`);
    console.log(`💰 USDT Token: ${mainnetUSDT}`);

    try {
        // Step 1: Verify contract exists
        console.log("\n📋 Step 1: Contract Investigation");
        console.log("==================================");
        
        const provider = hre.ethers.provider;
        const code = await provider.getCode(mainnetContract);
        
        if (code === "0x") {
            console.log("❌ ERROR: No contract found at this address!");
            return;
        }
        
        console.log("✅ Contract exists on BSC Mainnet");
        console.log(`📏 Bytecode length: ${code.length} characters`);

        // Step 2: Try to identify contract type
        console.log("\n🔍 Step 2: Contract Type Identification");
        console.log("=======================================");
        
        const contractTests = [
            {
                name: "OrphiCrowdFund",
                path: "contracts/OrphiCrowdFund.sol:OrphiCrowdFund",
                constructorArgs: [mainnetUSDT]
            },
            {
                name: "OrphiCrowdFundV2Enhanced",
                path: "temp_deploy/OrphiCrowdFundV2Enhanced.sol:OrphiCrowdFundV2Enhanced",
                constructorArgs: [mainnetUSDT]
            },
            {
                name: "OrphichainCrowdfundPlatformUpgradeableSecure",
                path: "contracts/OrphichainCrowdfundPlatformUpgradeableSecure.sol:OrphichainCrowdfundPlatformUpgradeableSecure",
                constructorArgs: []
            }
        ];

        let identifiedContract = null;

        for (const test of contractTests) {
            try {
                console.log(`🧪 Testing: ${test.name}...`);
                const contract = await hre.ethers.getContractAt(test.name, mainnetContract);
                
                // Try to call owner function
                const owner = await contract.owner();
                console.log(`✅ SUCCESS! Contract is ${test.name}`);
                console.log(`👤 Owner: ${owner}`);
                
                // Try to get more info
                try {
                    if (test.name.includes("V2Enhanced") || test.name === "OrphiCrowdFund") {
                        const totalMembers = await contract.totalMembers();
                        const usdtToken = await contract.usdtToken();
                        console.log(`👥 Total Members: ${totalMembers.toString()}`);
                        console.log(`💰 USDT Token: ${usdtToken}`);
                    }
                } catch (infoError) {
                    console.log(`⚠️ Could not get additional info: ${infoError.message}`);
                }
                
                identifiedContract = test;
                break;
                
            } catch (error) {
                console.log(`❌ Not ${test.name}: ${error.message.substring(0, 80)}...`);
            }
        }

        // Step 3: Attempt verification
        if (identifiedContract) {
            console.log("\n🚀 Step 3: Contract Verification");
            console.log("================================");
            
            await verifyContract(mainnetContract, identifiedContract);
        } else {
            console.log("\n❌ Could not identify contract type");
            console.log("💡 Manual verification required");
            await provideManualInstructions(mainnetContract);
        }

        // Step 4: Generate verification report
        await generateMainnetReport(mainnetContract, identifiedContract);

    } catch (error) {
        console.error("❌ Script failed:", error.message);
        console.log("\n🔧 Troubleshooting:");
        console.log("1. Ensure you're connected to BSC Mainnet");
        console.log("2. Check your RPC endpoint is working");
        console.log("3. Verify the contract address is correct");
    }
}

async function verifyContract(address, contractInfo) {
    try {
        console.log(`🔄 Attempting verification for ${contractInfo.name}...`);
        
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: contractInfo.constructorArgs,
            contract: contractInfo.path
        });
        
        console.log("✅ Contract verified successfully!");
        console.log(`🌐 View on BSCScan: https://bscscan.com/address/${address}#code`);
        
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract is already verified!");
            console.log(`🌐 View on BSCScan: https://bscscan.com/address/${address}#code`);
        } else if (error.message.includes("does not match")) {
            console.log("❌ Source code doesn't match deployed bytecode");
            console.log("💡 This suggests the contract was deployed with different source code");
            await tryAlternativeVerification(address, contractInfo);
        } else {
            console.log(`❌ Verification failed: ${error.message}`);
            await provideManualInstructions(address, contractInfo);
        }
    }
}

async function tryAlternativeVerification(address, contractInfo) {
    console.log("\n🔄 Trying alternative verification methods...");
    
    // Try with different contract versions
    const alternatives = [
        "contracts/OrphiCrowdFundV2.sol:OrphiCrowdFundV2Enhanced",
        "contracts/OrphiCrowdFund.sol:OrphiCrowdFund",
        "contracts/OrphichainCrowdfundPlatform.sol:OrphichainCrowdfundPlatform"
    ];

    for (const altPath of alternatives) {
        try {
            console.log(`🧪 Trying: ${altPath}...`);
            await hre.run("verify:verify", {
                address: address,
                constructorArguments: contractInfo.constructorArgs,
                contract: altPath
            });
            console.log(`✅ Success with ${altPath}!`);
            return;
        } catch (error) {
            console.log(`❌ Failed: ${altPath}`);
        }
    }
    
    console.log("❌ All alternative verification methods failed");
}

async function provideManualInstructions(address, contractInfo = null) {
    console.log("\n📋 Manual Verification Instructions");
    console.log("===================================");
    console.log(`1. Go to: https://bscscan.com/address/${address}#code`);
    console.log("2. Click 'Verify and Publish'");
    console.log("3. Select 'Solidity (Single file)'");
    console.log("4. Compiler Type: Solidity (Single file)");
    console.log("5. Compiler Version: v0.8.22+commit.4fc1097e");
    console.log("6. Open Source License Type: MIT");
    console.log("7. Optimization: Yes");
    console.log("8. Runs: 200");
    
    if (contractInfo) {
        console.log(`9. Constructor Arguments: ${JSON.stringify(contractInfo.constructorArgs)}`);
        console.log(`10. Upload source file: ${contractInfo.path}`);
    } else {
        console.log("9. Constructor Arguments: [Check deployment transaction]");
        console.log("10. Upload the correct source file from your contracts folder");
    }
    
    console.log("\n💡 Source Code Options:");
    console.log("- temp_deploy/OrphiCrowdFundV2Enhanced.sol");
    console.log("- contracts/OrphiCrowdFund.sol");
    console.log("- contracts/OrphichainCrowdfundPlatform.sol");
}

async function generateMainnetReport(address, contractInfo) {
    const report = {
        timestamp: new Date().toISOString(),
        network: "BSC Mainnet",
        chainId: 56,
        contractAddress: address,
        bscscanUrl: `https://bscscan.com/address/${address}`,
        writeContractUrl: `https://bscscan.com/address/${address}#writeContract`,
        identifiedAs: contractInfo ? contractInfo.name : "Unknown",
        verificationStatus: "Pending",
        recommendations: [
            "Complete contract verification on BSCScan",
            "Test all write functions after verification",
            "Update frontend to use mainnet contract address",
            "Ensure proper access controls are in place",
            "Monitor contract for any unusual activity"
        ],
        mainnetConfiguration: {
            usdtAddress: "0x55d398326f99059fF775485246999027B3197955",
            chainId: 56,
            rpcUrl: "https://bsc-dataseed.binance.org/",
            blockExplorer: "https://bscscan.com"
        }
    };

    const reportPath = `mainnet-verification-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Report saved: ${reportPath}`);
    console.log("\n🎯 Next Steps:");
    console.log("1. Complete verification using manual instructions above");
    console.log("2. Test contract functions on BSCScan");
    console.log("3. Update your frontend configuration");
    console.log("4. Monitor contract activity");
}

// Helper function to create flattened contract for verification
async function createFlattenedContract() {
    try {
        console.log("\n📄 Creating flattened contract files...");
        
        const contracts = [
            "temp_deploy/OrphiCrowdFundV2Enhanced.sol",
            "contracts/OrphiCrowdFund.sol",
            "contracts/OrphichainCrowdfundPlatform.sol"
        ];

        for (const contractPath of contracts) {
            try {
                const flattened = await hre.run("flatten:get-flattened-sources", {
                    files: [contractPath]
                });
                
                const outputPath = `flattened-${contractPath.split('/').pop()}`;
                fs.writeFileSync(outputPath, flattened);
                console.log(`✅ Created: ${outputPath}`);
            } catch (error) {
                console.log(`❌ Failed to flatten ${contractPath}: ${error.message}`);
            }
        }
    } catch (error) {
        console.log(`❌ Flattening failed: ${error.message}`);
    }
}

main()
    .then(() => {
        console.log("\n🎉 Mainnet verification process completed!");
        console.log("💡 If verification failed, use the manual instructions provided above.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Mainnet verification failed:", error);
        process.exit(1);
    });
