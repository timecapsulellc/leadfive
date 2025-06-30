const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 LeadFive Contract Ownership Status Check\n");

    // Contract addresses
    const PROXY_ADDRESS = "0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c";
    const TREZOR_ADDRESS = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    const DEPLOYER_ADDRESS = "0x140aad3E7c6bCC415Bc8E830699855fF072d405D";

    // Verify network
    const network = await ethers.provider.getNetwork();
    console.log("📡 Network:", network.name, "Chain ID:", network.chainId);
    
    if (network.chainId !== 56n) {
        console.log("❌ Error: Must be connected to BSC Mainnet (Chain ID: 56)");
        process.exit(1);
    }

    try {
        // Connect to contract (read-only)
        const contract = await ethers.getContractAt("LeadFive", PROXY_ADDRESS);
        
        // Get current owner
        const currentOwner = await contract.owner();
        console.log("\n🏠 Contract Information:");
        console.log("- Proxy Address:", PROXY_ADDRESS);
        console.log("- Current Owner:", currentOwner);
        
        // Check ownership status
        console.log("\n👤 Ownership Analysis:");
        if (currentOwner.toLowerCase() === DEPLOYER_ADDRESS.toLowerCase()) {
            console.log("✅ Current Owner: Deployer Wallet");
            console.log("📋 Status: Ready for transfer to Trezor");
        } else if (currentOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
            console.log("✅ Current Owner: Trezor Hardware Wallet");
            console.log("🔐 Status: Ownership already transferred - SECURE!");
        } else {
            console.log("⚠️ Current Owner: Unknown address");
            console.log("❓ Status: Unexpected ownership state");
        }
        
        // Check admin status
        console.log("\n🔑 Admin Status Check:");
        const isDeployerAdmin = await contract.isAdmin(DEPLOYER_ADDRESS);
        const isTrezorAdmin = await contract.isAdmin(TREZOR_ADDRESS);
        
        console.log("- Deployer is admin:", isDeployerAdmin ? "✅ Yes" : "❌ No");
        console.log("- Trezor is admin:", isTrezorAdmin ? "✅ Yes" : "❌ No");
        
        // Get basic contract info
        console.log("\n📊 Contract Details:");
        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        const paused = await contract.paused();
        
        console.log("- Name:", name);
        console.log("- Symbol:", symbol);
        console.log("- Total Supply:", ethers.formatEther(totalSupply), "LEAD");
        console.log("- Contract Status:", paused ? "⏸️ Paused" : "▶️ Active");
        
        // Contract verification
        console.log("\n🔗 Blockchain Links:");
        console.log("- BSCScan:", `https://bscscan.com/address/${PROXY_ADDRESS}`);
        console.log("- Write Contract:", `https://bscscan.com/address/${PROXY_ADDRESS}#writeContract`);
        
        console.log("\n📋 Next Steps:");
        if (currentOwner.toLowerCase() === DEPLOYER_ADDRESS.toLowerCase()) {
            console.log("1. Add your private key to .env file");
            console.log("2. Run: npx hardhat run transfer-ownership-to-trezor.cjs --network bsc");
            console.log("3. Verify transfer completion");
        } else if (currentOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
            console.log("✅ Ownership transfer complete!");
            console.log("1. Test Trezor access via BSCScan");
            console.log("2. Remove private key from .env file");
            console.log("3. Begin user onboarding and marketing");
        }
        
    } catch (error) {
        console.error("❌ Error checking contract status:", error.message);
        console.error("\nPossible issues:");
        console.error("- Network connectivity problem");
        console.error("- Contract address incorrect");
        console.error("- RPC endpoint issues");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    });
