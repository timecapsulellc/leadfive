const { ethers } = require("ethers");

async function testContract() {
    console.log("\n🔍 TESTING DEPLOYED CONTRACT ON BSC TESTNET");
    console.log("═".repeat(50));
    
    // BSC Testnet RPC
    const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
    
    // Contract address
    const contractAddress = "0x6fA993A33AA860A79E15ae44AC9390465c5f02aC";
    
    // Simple ABI for testing basic functions
    const abi = [
        "function contractName() view returns (string)",
        "function version() view returns (string)",
        "function usdtToken() view returns (address)",
        "function totalUsers() view returns (uint256)",
        "function getPackageAmounts() view returns (uint256[5])",
        "function TREZOR_ADMIN_WALLET() view returns (address)",
        "function paused() view returns (bool)"
    ];
    
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    try {
        console.log("📍 Contract Address:", contractAddress);
        
        // Test basic contract info
        const contractName = await contract.contractName();
        console.log("📄 Contract Name:", contractName);
        
        const version = await contract.version();
        console.log("🏷️  Version:", version);
        
        const usdtToken = await contract.usdtToken();
        console.log("💵 USDT Token:", usdtToken);
        
        const totalUsers = await contract.totalUsers();
        console.log("👥 Total Users:", totalUsers.toString());
        
        const packageAmounts = await contract.getPackageAmounts();
        console.log("💰 Package Amounts (USDT):", packageAmounts.map(n => ethers.formatUnits(n, 6)));
        
        const trezorAdmin = await contract.TREZOR_ADMIN_WALLET();
        console.log("🔐 Trezor Admin:", trezorAdmin);
        
        const isPaused = await contract.paused();
        console.log("⏸️  Paused:", isPaused);
        
        console.log("\n✅ CONTRACT VERIFICATION SUCCESSFUL!");
        console.log("🚀 Contract is deployed and accessible on BSC Testnet");
        console.log("🌐 BSCScan Link: https://testnet.bscscan.com/address/" + contractAddress);
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
    }
}

testContract().catch(console.error);
