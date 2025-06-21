const hre = require("hardhat");

async function main() {
    console.log("🔍 VERIFYING LEADFIVE CONTRACT ON BSC MAINNET");
    console.log("=" .repeat(60));

    // Your deployed contract address
    const CONTRACT_ADDRESS = "0x7FEEA22942407407801cCDA55a4392f25975D998";

    try {
        console.log("\n📋 Verification Details:");
        console.log(`   Contract Address: ${CONTRACT_ADDRESS}`);
        console.log(`   Network: BSC Mainnet`);
        console.log(`   Contract: LeadFiveModular`);

        // Verify the contract
        console.log("\n🚀 Starting Contract Verification...");
        
        await hre.run("verify:verify", {
            address: CONTRACT_ADDRESS,
            constructorArguments: [], // Add constructor args if any
            contract: "contracts/LeadFiveModular.sol:LeadFiveModular"
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
        } else if (error.message.includes("does not have bytecode")) {
            console.error("❌ Contract not found at this address");
        } else if (error.message.includes("Compilation failed")) {
            console.error("❌ Contract compilation failed during verification");
            console.error("💡 Try flattening the contract first");
        } else {
            console.error("❌ Error details:", error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
