const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking LeadFive Contract Status on BSC Testnet\n");
    
    const contractAddress = "0x5cb32e2cCd59b60C45606487dB902160728f7528";
    const [deployer] = await ethers.getSigners();
    
    console.log(`Checking with account: ${deployer.address}`);
    console.log(`Contract address: ${contractAddress}\n`);
    
    try {
        // Check if contract exists
        const code = await ethers.provider.getCode(contractAddress);
        if (code === "0x") {
            console.log("❌ Contract not found at the given address");
            return;
        }
        console.log(`✅ Contract exists (code length: ${code.length} chars)\n`);
        
        // Try to connect to contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const leadFive = LeadFive.attach(contractAddress);
        
        // Test basic functions one by one
        console.log("📋 === TESTING BASIC FUNCTIONS ===");
        
        try {
            const owner = await leadFive.owner();
            console.log(`✅ Owner: ${owner}`);
        } catch (error) {
            console.log(`❌ Owner check failed: ${error.message}`);
        }
        
        try {
            const totalUsers = await leadFive.getTotalUsers();
            console.log(`✅ Total Users: ${totalUsers}`);
        } catch (error) {
            console.log(`❌ Total Users check failed: ${error.message}`);
        }
        
        try {
            const packagePrice = await leadFive.getPackagePrice(1);
            console.log(`✅ Package 1 Price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
        } catch (error) {
            console.log(`❌ Package price check failed: ${error.message}`);
        }
        
        try {
            const contractBalance = await leadFive.getContractBalance();
            console.log(`✅ Contract BNB Balance: ${ethers.formatEther(contractBalance)} BNB`);
        } catch (error) {
            console.log(`❌ Contract balance check failed: ${error.message}`);
        }
        
        try {
            const [isRegistered, packageLevel, balance] = await leadFive.getUserBasicInfo(deployer.address);
            console.log(`✅ Deployer Registered: ${isRegistered}`);
            console.log(`✅ Deployer Package: ${packageLevel}`);
            console.log(`✅ Deployer Balance: ${ethers.formatUnits(balance, 6)} USDT`);
        } catch (error) {
            console.log(`❌ User info check failed: ${error.message}`);
        }
        
        try {
            const isAdmin = await leadFive.isAdmin(deployer.address);
            console.log(`✅ Deployer is Admin: ${isAdmin}`);
        } catch (error) {
            console.log(`❌ Admin check failed: ${error.message}`);
        }
        
        // Check balance
        const deployerBalance = await ethers.provider.getBalance(deployer.address);
        console.log(`\n💰 Deployer BNB Balance: ${ethers.formatEther(deployerBalance)} BNB`);
        
    } catch (error) {
        console.log(`❌ Contract check failed: ${error.message}`);
        console.log(error);
    }
}

main().catch((error) => {
    console.error("💥 Script error:", error);
    process.exitCode = 1;
});
