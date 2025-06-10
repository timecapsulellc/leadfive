const { run } = require("hardhat");

/**
 * BSC TESTNET CONTRACT VERIFICATION SCRIPT
 * 
 * This script verifies the deployed contract on BSCScan Testnet
 */

async function main() {
    console.log("🔍 VERIFYING CONTRACT ON BSC TESTNET");
    console.log("=" .repeat(60));
    
    const contractAddress = "0x5ab22F4d339B66C1859029d2c2540d8BefCbdED4";
    const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
    
    console.log(`📋 Contract Address: ${contractAddress}`);
    console.log(`📋 Constructor Args: ${usdtAddress}`);
    
    try {
        console.log("\n🚀 Starting verification...");
        
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: [usdtAddress],
            contract: "temp_deploy/OrphiCrowdFundV2Enhanced.sol:OrphiCrowdFundV2Enhanced"
        });
        
        console.log("✅ Contract verified successfully!");
        console.log(`🌐 View on BSCScan: https://testnet.bscscan.com/address/${contractAddress}#code`);
        
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract is already verified!");
            console.log(`🌐 View on BSCScan: https://testnet.bscscan.com/address/${contractAddress}#code`);
        } else {
            console.error("❌ Verification failed:", error.message);
            throw error;
        }
    }
}

if (require.main === module) {
    main()
        .then(() => {
            console.log("\n✅ Verification completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Verification failed:", error);
            process.exit(1);
        });
}

module.exports = main;
