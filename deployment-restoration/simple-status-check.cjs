const { ethers } = require("hardhat");

async function checkDeploymentStatus() {
    console.log("🔍 LEADFIVE MAINNET STATUS CHECK");
    console.log("=" .repeat(50));
    console.log(`📅 Check Date: ${new Date().toISOString()}`);
    console.log(`🌐 Network: BSC Mainnet (Chain ID: 56)`);
    console.log("=" .repeat(50));
    
    // Contract addresses
    const LEADFIVE_PROXY = "0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c";
    const LEADFIVE_IMPL = "0xc58620dd8fD9d244453e421E700c2D3FCFB595b4";
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
    
    try {
        const [signer] = await ethers.getSigners();
        console.log(`📱 Current Signer: ${signer.address}`);
        
        // Check if we can connect to the contract
        const LeadFiveABI = [
            "function owner() view returns (address)",
            "function totalUsers() view returns (uint32)",
            "function paused() view returns (bool)",
            "function usdt() view returns (address)",
            "function packages(uint8) view returns (tuple(uint96 price, bool active, uint32 userCount))",
            "function users(address) view returns (tuple(uint32 id, address referrer, uint8 packageLevel, uint96 totalEarned, uint96 directEarned, uint32 directCount, bool active, uint32 lastUpdate))"
        ];
        
        const leadFive = new ethers.Contract(LEADFIVE_PROXY, LeadFiveABI, signer);
        
        console.log("\n📍 CONTRACT STATUS:");
        
        // Basic contract info
        const owner = await leadFive.owner();
        const totalUsers = await leadFive.totalUsers();
        const isPaused = await leadFive.paused();
        const usdtContract = await leadFive.usdt();
        
        console.log(`├─ Owner: ${owner}`);
        console.log(`├─ Total Users: ${totalUsers}`);
        console.log(`├─ Contract Paused: ${isPaused ? "❌ YES" : "✅ NO"}`);
        console.log(`├─ USDT Contract: ${usdtContract}`);
        console.log(`└─ USDT Match: ${usdtContract === USDT_ADDRESS ? "✅ CORRECT" : "❌ MISMATCH"}`);
        
        console.log("\n💰 PACKAGE CONFIGURATION:");
        for (let i = 1; i <= 4; i++) {
            try {
                const pkg = await leadFive.packages(i);
                const priceUSD = ethers.formatUnits(pkg.price, 18);
                console.log(`├─ Package ${i}: $${priceUSD} USDT - ${pkg.active ? "✅ Active" : "❌ Inactive"} (${pkg.userCount} users)`);
            } catch (error) {
                console.log(`├─ Package ${i}: ❌ Error reading package`);
            }
        }
        
        console.log("\n👤 ROOT USER STATUS:");
        try {
            const rootUser = await leadFive.users(owner);
            if (rootUser.active) {
                console.log(`├─ Root User ID: ${rootUser.id}`);
                console.log(`├─ Package Level: ${rootUser.packageLevel}`);
                console.log(`├─ Direct Count: ${rootUser.directCount}`);
                console.log(`├─ Total Earned: ${ethers.formatUnits(rootUser.totalEarned, 18)} USDT`);
                console.log(`└─ Status: ✅ ACTIVE`);
            } else {
                console.log(`└─ Status: ❌ NOT REGISTERED`);
            }
        } catch (error) {
            console.log(`└─ Status: ❌ Error checking root user`);
        }
        
        console.log("\n🔗 BLOCKCHAIN VERIFICATION:");
        console.log(`├─ Proxy Contract: https://bscscan.com/address/${LEADFIVE_PROXY}`);
        console.log(`├─ Implementation: https://bscscan.com/address/${LEADFIVE_IMPL}#code`);
        console.log(`└─ USDT Contract: https://bscscan.com/address/${USDT_ADDRESS}`);
        
        console.log("\n✅ STATUS: CONTRACT IS LIVE AND ACCESSIBLE");
        
    } catch (error) {
        console.error("\n❌ ERROR:", error.message);
        console.error("\n⚠️  Check your network configuration and private key in .env file");
    }
}

if (require.main === module) {
    checkDeploymentStatus()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Script failed:", error);
            process.exit(1);
        });
}

module.exports = { checkDeploymentStatus };
