const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732";
    
    console.log("🔍 VERIFYING DEPLOYED CONTRACT");
    console.log("═".repeat(50));
    
    // Check if contract exists
    const code = await ethers.provider.getCode(contractAddress);
    console.log("Contract exists:", code !== "0x");
    console.log("Bytecode length:", code.length);
    
    // Try to get basic contract info
    try {
        // Try different contract interfaces
        const contracts = ["OrphiCrowdFund", "OrphiCrowdFundComplete", "OrphiCrowdFundMain"];
        
        for (const contractName of contracts) {
            try {
                console.log(`\n📋 Trying ${contractName} interface...`);
                const contract = await ethers.getContractAt(contractName, contractAddress);
                
                // Test basic functions
                try {
                    const usdtToken = await contract.usdtToken();
                    console.log(`✅ USDT Token: ${usdtToken}`);
                    
                    const totalUsers = await contract.totalUsers();
                    console.log(`✅ Total Users: ${totalUsers}`);
                    
                    console.log(`🎯 SUCCESS! Contract is ${contractName}`);
                    
                    // Get MetaMask admin info if available
                    try {
                        const adminWallet = await contract.TREZOR_ADMIN_WALLET();
                        console.log(`👑 Admin Wallet: ${adminWallet}`);
                    } catch (e) {
                        console.log("No TREZOR_ADMIN_WALLET found");
                    }
                    
                    break;
                } catch (err) {
                    console.log(`❌ Failed to call functions: ${err.message}`);
                }
            } catch (err) {
                console.log(`❌ Interface ${contractName} failed: ${err.message}`);
            }
        }
        
    } catch (error) {
        console.log("❌ Error:", error.message);
    }
    
    console.log("\n🔗 BSCScan:", `https://bscscan.com/address/${contractAddress}`);
}

main().catch(console.error);
