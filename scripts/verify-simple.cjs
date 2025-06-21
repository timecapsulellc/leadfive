const hre = require("hardhat");

async function main() {
    console.log("🔍 VERIFYING LEADFIVE CONTRACT ON BSC MAINNET");
    console.log("=".repeat(60));

    // Your deployed contract address
    const CONTRACT_ADDRESS = "0x7FEEA22942407407801cCDA55a4392f25975D998";

    try {
        console.log("\n📋 Verification Details:");
        console.log(`   Contract Address: ${CONTRACT_ADDRESS}`);
        console.log(`   Network: BSC Mainnet`);
        console.log(`   Contract: LeadFiveModular`);

        // Verify the contract (no constructor args needed for UUPS proxy)
        console.log("\n🚀 Starting Contract Verification...");
        
        await hre.run("verify:verify", {
            address: CONTRACT_ADDRESS,
            constructorArguments: [], // UUPS proxy has no constructor args
        });

        console.log("✅ Contract verified successfully!");
        console.log("\n🎉 VERIFICATION COMPLETE!");
        console.log(`🔗 View on BSCScan: https://bscscan.com/address/${CONTRACT_ADDRESS}`);
        console.log(`🔗 Write Contract: https://bscscan.com/address/${CONTRACT_ADDRESS}#writeContract`);

    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:");
        
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract is already verified on BSCScan!");
            console.log(`🔗 View on BSCScan: https://bscscan.com/address/${CONTRACT_ADDRESS}`);
        } else if (error.message.includes("BSCSCAN_API_KEY")) {
            console.error("❌ Missing BSCScan API Key");
            console.error("💡 Please add BSCSCAN_API_KEY to your .env file");
            console.error("💡 Get API key from: https://bscscan.com/apis");
        } else {
            console.error("❌ Error details:", error.message);
            console.error("\n💡 Troubleshooting:");
            console.error("1. Ensure BSCSCAN_API_KEY is set in .env");
            console.error("2. Check network connection");
            console.error("3. Verify contract address is correct");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
