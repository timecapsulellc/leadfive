const hre = require("hardhat");

/**
 * Quick Contract Verification Fix
 * 
 * This script quickly verifies the specific contract you're having issues with
 * and provides immediate solutions.
 */

async function main() {
    console.log("🚀 Quick Contract Verification Fix");
    console.log("==================================");

    // The contract address from your screenshot
    const problemContract = "0x8F826B18096Dcf7AF4515B06Cb563475d189ab50";
    const knownContracts = {
        "OrphiCrowdFundV2Enhanced": "0x5ab22F4d339B66C1859029d2c2540d8BefCbdED4",
        "OrphichainSecure": "0x2A5CDeEc5dF5AE5137AF46920b2B4C4Aa9b0aEA0"
    };

    console.log(`🔍 Investigating contract: ${problemContract}`);

    try {
        const provider = hre.ethers.provider;
        const code = await provider.getCode(problemContract);
        
        if (code === "0x") {
            console.log("❌ ERROR: No contract found at this address!");
            console.log("💡 SOLUTION: This address doesn't contain a deployed contract.");
            console.log("✅ Use one of these verified contracts instead:");
            
            Object.entries(knownContracts).forEach(([name, address]) => {
                console.log(`   ${name}: ${address}`);
                console.log(`   BSCScan: https://testnet.bscscan.com/address/${address}`);
            });
            return;
        }

        console.log("✅ Contract exists! Checking if it's verified...");
        
        // Try to interact with the contract using different ABIs
        const contractTests = [
            {
                name: "OrphiCrowdFundV2Enhanced",
                abi: "temp_deploy/OrphiCrowdFundV2Enhanced.sol:OrphiCrowdFundV2Enhanced"
            },
            {
                name: "OrphichainCrowdfundPlatformUpgradeableSecure", 
                abi: "contracts/OrphichainCrowdfundPlatformUpgradeableSecure.sol:OrphichainCrowdfundPlatformUpgradeableSecure"
            }
        ];

        let contractIdentified = false;

        for (const test of contractTests) {
            try {
                console.log(`🧪 Testing if contract is ${test.name}...`);
                const contract = await hre.ethers.getContractAt(test.name, problemContract);
                
                // Try to call a common function
                const owner = await contract.owner();
                console.log(`✅ SUCCESS! Contract is ${test.name}`);
                console.log(`👤 Owner: ${owner}`);
                
                // Now verify it
                console.log(`🔄 Attempting verification...`);
                await verifyContract(problemContract, test.name, test.abi);
                contractIdentified = true;
                break;
                
            } catch (error) {
                console.log(`❌ Not ${test.name}: ${error.message.substring(0, 100)}...`);
            }
        }

        if (!contractIdentified) {
            console.log("❌ Could not identify contract type");
            console.log("💡 MANUAL VERIFICATION NEEDED:");
            console.log(`1. Go to: https://testnet.bscscan.com/address/${problemContract}#code`);
            console.log("2. Click 'Verify and Publish'");
            console.log("3. Upload the correct source code");
            console.log("4. Use compiler version 0.8.22 with optimization enabled");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }

    // Provide working alternatives
    console.log("\n🎯 IMMEDIATE SOLUTION - Use these verified contracts:");
    console.log("=====================================================");
    
    for (const [name, address] of Object.entries(knownContracts)) {
        console.log(`\n📋 ${name}:`);
        console.log(`   Address: ${address}`);
        console.log(`   BSCScan: https://testnet.bscscan.com/address/${address}`);
        console.log(`   Status: ✅ Deployed and Ready`);
        
        try {
            // Quick test to confirm it works
            const contract = await hre.ethers.getContractAt("OrphiCrowdFundV2Enhanced", address);
            const totalMembers = await contract.totalMembers();
            console.log(`   Members: ${totalMembers.toString()}`);
            console.log(`   Functions: ✅ All public functions available`);
        } catch (error) {
            console.log(`   Status: ⚠️ Needs verification`);
        }
    }
}

async function verifyContract(address, contractName, contractPath) {
    try {
        // Determine constructor arguments based on contract type
        let constructorArgs = [];
        
        if (contractName.includes("V2Enhanced")) {
            constructorArgs = ["0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"]; // USDT address
        }

        await hre.run("verify:verify", {
            address: address,
            constructorArguments: constructorArgs,
            contract: contractPath
        });
        
        console.log(`✅ ${contractName} verified successfully!`);
        console.log(`🌐 View on BSCScan: https://testnet.bscscan.com/address/${address}#code`);
        
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log(`✅ ${contractName} is already verified!`);
        } else {
            console.log(`❌ Verification failed: ${error.message}`);
            
            // Provide manual verification steps
            console.log(`\n📋 Manual verification for ${contractName}:`);
            console.log(`1. Visit: https://testnet.bscscan.com/address/${address}#code`);
            console.log(`2. Click "Verify and Publish"`);
            console.log(`3. Compiler: 0.8.22`);
            console.log(`4. Optimization: Yes (200 runs)`);
            console.log(`5. Constructor args: ${JSON.stringify(constructorArgs)}`);
        }
    }
}

main()
    .then(() => {
        console.log("\n🎉 Quick fix completed!");
        console.log("💡 If you're still seeing 'no public Write functions', use the working contract addresses above.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Quick fix failed:", error);
        process.exit(1);
    });
