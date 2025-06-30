const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Fixing Oracle Issue for LeadFive Contract\n");
    
    const contractAddress = "0x8796A9a42A468Bab9C0e73a6C5df08bDe3D83e1b";
    const [deployer] = await ethers.getSigners();
    
    console.log(`Adding oracle with account: ${deployer.address}`);
    
    // Connect to contract
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach(contractAddress);
    
    try {
        console.log("📋 === CHECKING CURRENT STATE ===");
        
        const isAdmin = await leadFive.isAdmin(deployer.address);
        console.log(`✅ Deployer is admin: ${isAdmin}`);
        
        const owner = await leadFive.owner();
        console.log(`✅ Contract owner: ${owner}`);
        
        // Add oracle to the contract
        console.log("\n🔮 === ADDING ORACLE ===");
        
        const oracleAddress = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // BSC Testnet BNB/USD Price Feed
        console.log(`Adding oracle: ${oracleAddress}`);
        
        try {
            const addOracleTx = await leadFive.addOracle(oracleAddress);
            const receipt = await addOracleTx.wait();
            console.log(`✅ Oracle added successfully! Gas used: ${receipt.gasUsed}`);
            
        } catch (error) {
            console.log(`❌ Failed to add oracle: ${error.message}`);
            
            // The oracle might already exist or there might be another issue
            // Let's try to check the current price anyway
        }
        
        // Test price after adding oracle
        console.log("\n💰 === TESTING PRICE AFTER ORACLE FIX ===");
        
        try {
            const currentPrice = await leadFive.getCurrentBNBPrice();
            console.log(`✅ Current BNB Price: $${ethers.formatUnits(currentPrice, 8)}`);
            
            // Calculate required BNB for package 1
            const packagePrice = await leadFive.getPackagePrice(1);
            const requiredBNB = (packagePrice * ethers.parseEther("1")) / BigInt(currentPrice);
            console.log(`✅ Required BNB for $30 package: ${ethers.formatEther(requiredBNB)} BNB`);
            
        } catch (error) {
            console.log(`❌ Price check still failed: ${error.message}`);
        }
        
        // Now test registration
        console.log("\n🎯 === TESTING REGISTRATION AFTER FIX ===");
        
        const testWallet = ethers.Wallet.createRandom().connect(ethers.provider);
        console.log(`Test wallet: ${testWallet.address}`);
        
        // Fund test wallet
        const fundTx = await deployer.sendTransaction({
            to: testWallet.address,
            value: ethers.parseEther("0.1")
        });
        await fundTx.wait();
        console.log(`✅ Funded test wallet with 0.1 BNB`);
        
        try {
            const bnbValue = ethers.parseEther("0.05");
            console.log(`Attempting registration with ${ethers.formatEther(bnbValue)} BNB...`);
            
            const registrationTx = await leadFive.connect(testWallet).register(
                deployer.address, // sponsor
                1, // package level
                false, // use BNB
                { value: bnbValue }
            );
            
            const receipt = await registrationTx.wait();
            console.log(`✅ Registration successful! Gas used: ${receipt.gasUsed}`);
            
            // Check user status
            const [isRegistered, packageLevel, balance] = await leadFive.getUserBasicInfo(testWallet.address);
            console.log(`✅ User registered: ${isRegistered}`);
            console.log(`✅ Package level: ${packageLevel}`);
            console.log(`✅ Balance: ${ethers.formatUnits(balance, 6)} USDT`);
            
            const newTotalUsers = await leadFive.getTotalUsers();
            console.log(`✅ Total users now: ${newTotalUsers}`);
            
        } catch (error) {
            console.log(`❌ Registration still failed: ${error.message}`);
            if (error.data) {
                console.log(`Error data: ${error.data}`);
            }
        }
        
    } catch (error) {
        console.log(`❌ Oracle fix failed: ${error.message}`);
        console.log(error);
    }
}

main().catch((error) => {
    console.error("💥 Oracle fix error:", error);
    process.exitCode = 1;
});
