import hre from "hardhat";

async function main() {
    console.log("🔍 VERIFYING ORPHI CROWDFUND ON BSCSCAN");
    console.log("=" .repeat(60));

    // Contract addresses from deployment
    const PROXY_ADDRESS = "0x70147f13E7e2363071A85772A0a4f08065BE993F";
    const IMPLEMENTATION_ADDRESS = "0x55a4355F729A400A2C4d47aC696F460D8bD7D085";

    try {
        console.log("\n📋 Verification Details:");
        console.log(`   Proxy Address: ${PROXY_ADDRESS}`);
        console.log(`   Implementation: ${IMPLEMENTATION_ADDRESS}`);
        console.log(`   Network: BSC Testnet`);

        // Verify the implementation contract
        console.log("\n🚀 Verifying Implementation Contract...");
        
        await hre.run("verify:verify", {
            address: IMPLEMENTATION_ADDRESS,
            constructorArguments: [], // No constructor arguments for UUPS implementation
            contract: "contracts/OrphiCrowdFundDeployable.sol:OrphiCrowdFundDeployable"
        });

        console.log("✅ Implementation contract verified!");

        // Verify the proxy contract
        console.log("\n🔗 Verifying Proxy Contract...");
        
        // Get the initialization data
        const OrphiCrowdFund = await hre.ethers.getContractFactory("OrphiCrowdFundDeployable");
        const initializeData = OrphiCrowdFund.interface.encodeFunctionData("initialize", []);
        
        await hre.run("verify:verify", {
            address: PROXY_ADDRESS,
            constructorArguments: [IMPLEMENTATION_ADDRESS, initializeData],
            contract: "contracts/OrphiProxy.sol:OrphiProxy"
        });

        console.log("✅ Proxy contract verified!");

        console.log("\n🎉 VERIFICATION COMPLETE!");
        console.log(`🔗 View on BSCScan: https://testnet.bscscan.com/address/${PROXY_ADDRESS}`);
        console.log(`🔗 Implementation: https://testnet.bscscan.com/address/${IMPLEMENTATION_ADDRESS}`);

    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:");
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract is already verified on BSCScan!");
        } else {
            console.error("Error:", error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
