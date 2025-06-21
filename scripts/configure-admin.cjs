const { ethers } = require("hardhat");
require('dotenv').config();

async function configureAdminSystem() {
    console.log("⚙️ LEADFIVE ADMIN SYSTEM CONFIGURATION");
    console.log("=" * 60);
    
    const contractAddress = "0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569";
    const trezorOwner = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    // Admin configuration
    const ADMIN_FEE_RECIPIENT = trezorOwner; // Use Trezor as fee recipient
    const ROOT_ADMIN = trezorOwner; // Root admin is the Trezor owner
    
    console.log("📋 CONFIGURATION PLAN:");
    console.log("- Contract:", contractAddress);
    console.log("- Root Admin:", ROOT_ADMIN);
    console.log("- Fee Recipient:", ADMIN_FEE_RECIPIENT);
    console.log("");
    
    // Contract ABI for configuration
    const contractAbi = [
        "function setAdminFeeRecipient(address _recipient) external",
        "function register(address referrer, uint8 packageLevel, bool useUSDT) external payable",
        "function getUserInfo(address) view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate, uint32 lastHelpPoolClaim, bool isEligibleForHelpPool, uint32 matrixPosition, uint8 matrixLevel, uint32 registrationTime, string referralCode, uint96 pendingRewards, uint32 lastWithdrawal, uint32 matrixCycles, uint8 leaderRank, uint96 leftLegVolume, uint96 rightLegVolume, uint32 fastStartExpiry, bool isActive))",
        "function adminFeeRecipient() view returns (address)",
        "function owner() view returns (address)"
    ];
    
    try {
        console.log("🔄 STEP 1: CONNECTING TO CONTRACT...");
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);
        
        // Check current state
        const currentOwner = await contract.owner();
        const currentFeeRecipient = await contract.adminFeeRecipient();
        const ownerInfo = await contract.getUserInfo(trezorOwner);
        
        console.log("✅ Current Owner:", currentOwner);
        console.log("✅ Current Fee Recipient:", currentFeeRecipient);
        console.log("✅ Owner Registered:", ownerInfo.isRegistered);
        console.log("");
        
        // Configuration instructions for Trezor user
        console.log("🎯 CONFIGURATION INSTRUCTIONS FOR TREZOR:");
        console.log("=" * 60);
        
        console.log("\n1️⃣ SET ADMIN FEE RECIPIENT:");
        console.log("   📋 Function: setAdminFeeRecipient");
        console.log("   📧 Address: " + ADMIN_FEE_RECIPIENT);
        console.log("   🔗 BSCScan: https://bscscan.com/address/" + contractAddress + "#writeContract");
        console.log("   💡 This will collect admin fees to your Trezor wallet");
        
        console.log("\n2️⃣ REGISTER ROOT ADMIN (Optional):");
        console.log("   📋 Function: register");
        console.log("   👤 Referrer: 0x0000000000000000000000000000000000000000 (zero address)");
        console.log("   📦 Package Level: 4 (highest package)");
        console.log("   💰 Use USDT: true");
        console.log("   💡 This registers the Trezor owner in the MLM system");
        
        console.log("\n3️⃣ FRONTEND CONFIGURATION:");
        console.log("   📁 Update .env with:");
        console.log("   VITE_CONTRACT_ADDRESS=" + contractAddress);
        console.log("   VITE_OWNER_ADDRESS=" + trezorOwner);
        console.log("   VITE_ADMIN_ADDRESS=" + trezorOwner);
        
        // Create frontend config file
        const frontendConfig = {
            contractAddress: contractAddress,
            ownerAddress: trezorOwner,
            adminAddress: trezorOwner,
            network: {
                chainId: 56,
                name: "BSC Mainnet",
                rpcUrl: "https://bsc-dataseed.binance.org/",
                explorerUrl: "https://bscscan.com"
            },
            contracts: {
                leadfive: contractAddress,
                usdt: "0x55d398326f99059fF775485246999027B3197955"
            },
            admin: {
                feeRecipient: ADMIN_FEE_RECIPIENT,
                rootAdmin: ROOT_ADMIN
            }
        };
        
        // Save configuration
        const fs = require('fs');
        fs.writeFileSync('frontend-config.json', JSON.stringify(frontendConfig, null, 2));
        console.log("\n✅ Frontend configuration saved to: frontend-config.json");
        
        console.log("\n🔄 NEXT STEPS:");
        console.log("1. Connect Trezor to BSCScan Write Contract interface");
        console.log("2. Execute setAdminFeeRecipient function");
        console.log("3. Optionally register root admin in MLM system");
        console.log("4. Update frontend with new configuration");
        console.log("5. Test all admin functions");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

configureAdminSystem().catch(console.error);
