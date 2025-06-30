const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Direct Oracle Testing\n");
    
    const [deployer] = await ethers.getSigners();
    
    // Test the oracle directly
    const oracleAddress = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";
    
    console.log(`Testing oracle: ${oracleAddress}`);
    
    try {
        // ABI for Chainlink price feed
        const priceFeedABI = [
            "function latestRoundData() external view returns (uint80 roundId, int256 price, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
        ];
        
        const priceFeed = new ethers.Contract(oracleAddress, priceFeedABI, deployer);
        
        console.log("📋 === DIRECT ORACLE TEST ===");
        
        const roundData = await priceFeed.latestRoundData();
        
        console.log(`Round ID: ${roundData.roundId}`);
        console.log(`Price: ${ethers.formatUnits(roundData.price, 8)}`); // Chainlink uses 8 decimals
        console.log(`Started At: ${new Date(Number(roundData.startedAt) * 1000)}`);
        console.log(`Updated At: ${new Date(Number(roundData.updatedAt) * 1000)}`);
        console.log(`Answered In Round: ${roundData.answeredInRound}`);
        
        const currentTime = Math.floor(Date.now() / 1000);
        const age = currentTime - Number(roundData.updatedAt);
        console.log(`Data age: ${age} seconds`);
        
        // Check if price is reasonable for BNB
        const priceInUSD = Number(ethers.formatUnits(roundData.price, 8));
        console.log(`BNB Price: $${priceInUSD}`);
        
        if (priceInUSD < 100 || priceInUSD > 2000) {
            console.log("⚠️  Price seems out of expected range for BNB");
        } else {
            console.log("✅ Price seems reasonable");
        }
        
        if (age > 1800) { // 30 minutes
            console.log("⚠️  Data is stale (older than 30 minutes)");
        } else {
            console.log("✅ Data is fresh");
        }
        
    } catch (error) {
        console.log(`❌ Direct oracle test failed: ${error.message}`);
        
        // Maybe this oracle doesn't exist or work on testnet
        // Let's try using a different approach - fixed price or different oracle
        console.log("\n🔧 === TRYING ALTERNATIVE SOLUTIONS ===");
        
        // Option 1: Use USDT registration instead of BNB
        console.log("Testing USDT registration instead...");
        
        const contractAddress = "0x8796A9a42A468Bab9C0e73a6C5df08bDe3D83e1b";
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const leadFive = LeadFive.attach(contractAddress);
        
        const testWallet = ethers.Wallet.createRandom().connect(ethers.provider);
        console.log(`Test wallet: ${testWallet.address}`);
        
        // Fund test wallet with BNB for gas
        const fundTx = await deployer.sendTransaction({
            to: testWallet.address,
            value: ethers.parseEther("0.01") // Just for gas
        });
        await fundTx.wait();
        console.log(`✅ Funded test wallet with gas`);
        
        // For now, let's just test if USDT registration would work
        // (We'd need to deploy mock USDT and approve it first)
        
        console.log("\n💡 RECOMMENDATION:");
        console.log("1. Use USDT registration instead of BNB");
        console.log("2. Deploy a mock USDT token for testing");
        console.log("3. Or use a working oracle address for BSC testnet");
        console.log("4. Or implement a fallback price mechanism");
    }
}

main().catch((error) => {
    console.error("💥 Oracle test error:", error);
    process.exitCode = 1;
});
