const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Starting LeadFive Contract Documentation Cleanup Upgrade to v1.2.0...\n");

    // Verify we're on the correct network
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
    
    if (network.chainId !== 56n) {
        console.log("❌ Error: This script must be run on BSC Mainnet (Chain ID: 56)");
        console.log("Please run: npx hardhat run upgrade-contract-v1.2.0.cjs --network bsc");
        process.exit(1);
    }

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "BNB\n");

    // Current proxy address on BSC Mainnet
    const PROXY_ADDRESS = "0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c";
    
    console.log("📋 Upgrade Details:");
    console.log("- Proxy Address:", PROXY_ADDRESS);
    console.log("- Network: BSC Mainnet");
    console.log("- Upgrade Type: Documentation Cleanup");
    console.log("- New Version: 1.2.0");
    console.log("- Changes: Removed development comments and audit references\n");

    try {
        // Get the LeadFive contract factory
        const LeadFive = await ethers.getContractFactory("LeadFive");
        
        console.log("⏳ Deploying new implementation contract...");
        
        // Deploy new implementation and upgrade proxy
        const upgradedContract = await upgrades.upgradeProxy(PROXY_ADDRESS, LeadFive);
        await upgradedContract.waitForDeployment();
        
        // Get the new implementation address
        const newImplementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
        
        console.log("✅ Contract upgraded successfully!");
        console.log("\n📊 Upgrade Results:");
        console.log("- Proxy Address (unchanged):", PROXY_ADDRESS);
        console.log("- New Implementation:", newImplementationAddress);
        console.log("- Status: UPGRADED TO v1.2.0");
        
        // Verify the upgrade was successful
        console.log("\n🔍 Verifying upgrade...");
        const contract = await ethers.getContractAt("LeadFive", PROXY_ADDRESS);
        
        // Test a simple view function to ensure contract is working
        const totalUsers = await contract.getTotalUsers();
        console.log("- Total Users (verification):", totalUsers.toString());
        console.log("- Contract Status: OPERATIONAL");
        
        // Save upgrade summary
        const upgradeData = {
            upgradeDate: new Date().toISOString(),
            network: "BSC Mainnet",
            proxyAddress: PROXY_ADDRESS,
            oldImplementation: "0xc58620dd8fD9d244453e421E700c2D3FCFB595b4", // Previous implementation
            newImplementation: newImplementationAddress,
            version: "1.2.0",
            upgradeType: "Documentation Cleanup",
            changes: [
                "Removed development comments and audit references",
                "Cleaned up internal code documentation",
                "Maintained professional appearance for BSCScan",
                "Version bump to 1.2.0"
            ],
            gasUsed: "~500K gas (estimated)",
            status: "SUCCESS"
        };
        
        // Write upgrade summary to file
        const fs = require('fs');
        fs.writeFileSync('contract-upgrade-v1.2.0-summary.json', JSON.stringify(upgradeData, null, 2));
        
        console.log("\n📄 Upgrade summary saved to: contract-upgrade-v1.2.0-summary.json");
        console.log("\n🎉 UPGRADE COMPLETE!");
        console.log("Your LeadFive contract is now running v1.2.0 with cleaned documentation.");
        console.log("All development references and audit comments have been removed.");
        console.log("The contract now has a professional, production-ready appearance.");
        
    } catch (error) {
        console.error("❌ Upgrade failed:", error.message);
        console.error("\nFull error:", error);
        process.exit(1);
    }
}

// Error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    });
