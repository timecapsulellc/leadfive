const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🔄 UPGRADING CONTRACT WITH CORRECT NAME...");
    console.log("═".repeat(60));
    
    const proxyAddress = "0x8ff99355F5eE1567F83B6001FFC4d52F52C1f5f4";
    const adminAddress = process.env.METAMASK_ADMIN_WALLET;
    
    console.log("📍 Proxy Address:", proxyAddress);
    console.log("👑 Admin Address:", adminAddress);
    
    // Deploy new implementation with correct name
    console.log("\n🚀 Deploying new implementation with correct name...");
    
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundCorrectName");
    
    const newImplementation = await upgrades.upgradeProxy(proxyAddress, OrphiCrowdFund);
    
    console.log("✅ Contract upgraded successfully!");
    console.log("📍 Proxy Address:", await newImplementation.getAddress());
    
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("📍 New Implementation:", implementationAddress);
    
    console.log("\n🔍 Verifying new implementation...");
    
    try {
        await run("verify:verify", {
            address: implementationAddress,
            constructorArguments: [],
            contract: "contracts/OrphiCrowdFundCorrectName.sol:OrphiCrowdFundCorrectName"
        });
        
        console.log("✅ Implementation verified on BSCScan!");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ Implementation already verified!");
        } else {
            console.log("❌ Verification failed:", error.message);
        }
    }
    
    console.log("\n🎉 UPGRADE COMPLETE!");
    console.log("📱 Contract will now show as 'OrphiCrowdFund' on BSCScan");
    console.log("🔗 View: https://bscscan.com/address/" + proxyAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
