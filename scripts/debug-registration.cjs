const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Debugging LeadFive Registration Issue\n");
    
    const contractAddress = "0x8796A9a42A468Bab9C0e73a6C5df08bDe3D83e1b";
    const [deployer] = await ethers.getSigners();
    
    console.log(`Debugging with account: ${deployer.address}`);
    
    // Connect to contract
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach(contractAddress);
    
    try {
        console.log("📋 === CONTRACT DEBUGGING ===");
        
        // Check current BNB price from oracle
        try {
            const currentPrice = await leadFive.getCurrentBNBPrice();
            console.log(`Current BNB Price: $${ethers.formatUnits(currentPrice, 8)}`);
        } catch (error) {
            console.log(`❌ Price check failed: ${error.message}`);
        }
        
        // Check package prices
        for (let i = 1; i <= 4; i++) {
            try {
                const packagePrice = await leadFive.getPackagePrice(i);
                console.log(`Package ${i} Price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
            } catch (error) {
                console.log(`❌ Package ${i} price check failed: ${error.message}`);
            }
        }
        
        // Create test wallet
        const testWallet = ethers.Wallet.createRandom().connect(ethers.provider);
        console.log(`\nTest wallet: ${testWallet.address}`);
        
        // Fund test wallet
        const fundTx = await deployer.sendTransaction({
            to: testWallet.address,
            value: ethers.parseEther("0.1")
        });
        await fundTx.wait();
        console.log(`✅ Funded test wallet with 0.1 BNB`);
        
        // Test registration with detailed error handling
        console.log("\n🎯 === TESTING REGISTRATION (DEBUG MODE) ===");
        
        // Try with different BNB amounts and see what works
        const testAmounts = [
            ethers.parseEther("0.01"),
            ethers.parseEther("0.02"),
            ethers.parseEther("0.05"),
            ethers.parseEther("0.1")
        ];
        
        for (const amount of testAmounts) {
            try {
                console.log(`\nTrying registration with ${ethers.formatEther(amount)} BNB...`);
                
                // Estimate gas first
                const gasEstimate = await leadFive.connect(testWallet).register.estimateGas(
                    deployer.address, // sponsor
                    1, // package level
                    false, // use BNB
                    { value: amount }
                );
                console.log(`Gas estimate: ${gasEstimate}`);
                
                const tx = await leadFive.connect(testWallet).register(
                    deployer.address, // sponsor
                    1, // package level
                    false, // use BNB
                    { value: amount }
                );
                
                const receipt = await tx.wait();
                console.log(`✅ Registration successful with ${ethers.formatEther(amount)} BNB!`);
                console.log(`Gas used: ${receipt.gasUsed}`);
                
                // Check user status
                const [isRegistered, packageLevel, balance] = await leadFive.getUserBasicInfo(testWallet.address);
                console.log(`✅ User registered: ${isRegistered}, Level: ${packageLevel}, Balance: ${ethers.formatUnits(balance, 6)} USDT`);
                
                break; // Success, exit loop
                
            } catch (error) {
                console.log(`❌ Failed with ${ethers.formatEther(amount)} BNB: ${error.message}`);
                if (error.data) {
                    console.log(`Error data: ${error.data}`);
                }
            }
        }
        
        // Try alternative approach - check if oracle is working
        console.log("\n🔮 === ORACLE DEBUG ===");
        try {
            // Manual price calculation
            const packagePrice = await leadFive.getPackagePrice(1); // $30
            console.log(`Package 1 costs: ${ethers.formatUnits(packagePrice, 6)} USDT`);
            
            const bnbPrice = await leadFive.getCurrentBNBPrice();
            console.log(`BNB Price: $${ethers.formatUnits(bnbPrice, 8)}`);
            
            // Calculate required BNB manually
            const requiredBNB = (packagePrice * ethers.parseEther("1")) / BigInt(bnbPrice);
            console.log(`Required BNB for $30: ${ethers.formatEther(requiredBNB)} BNB`);
            
        } catch (error) {
            console.log(`❌ Oracle calculation failed: ${error.message}`);
        }
        
    } catch (error) {
        console.log(`❌ Debugging failed: ${error.message}`);
        console.log(error);
    }
}

main().catch((error) => {
    console.error("💥 Debug error:", error);
    process.exitCode = 1;
});
