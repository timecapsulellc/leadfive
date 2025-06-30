const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Finding Working Oracle for BSC Testnet\n");
    
    const [deployer] = await ethers.getSigners();
    
    // Known BSC testnet oracle addresses to test
    const testOracles = [
        "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526", // BNB/USD (current)
        "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e", // Alternative BNB/USD
        "0x81faeDDfeBc2F8Ac524327d70Cf913001732224C", // Another BNB/USD
    ];
    
    const priceFeedABI = [
        "function latestRoundData() external view returns (uint80 roundId, int256 price, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
        "function decimals() external view returns (uint8)"
    ];
    
    console.log("📋 === TESTING MULTIPLE ORACLES ===\n");
    
    let workingOracle = null;
    
    for (const oracleAddress of testOracles) {
        try {
            console.log(`Testing: ${oracleAddress}`);
            
            const priceFeed = new ethers.Contract(oracleAddress, priceFeedABI, deployer);
            
            const roundData = await priceFeed.latestRoundData();
            const decimals = await priceFeed.decimals();
            
            const currentTime = Math.floor(Date.now() / 1000);
            const age = currentTime - Number(roundData.updatedAt);
            const priceInUSD = Number(ethers.formatUnits(roundData.price, decimals));
            
            console.log(`  Price: $${priceInUSD} (${decimals} decimals)`);
            console.log(`  Age: ${age} seconds (${Math.floor(age/60)} minutes)`);
            console.log(`  Updated: ${new Date(Number(roundData.updatedAt) * 1000)}`);
            
            if (age <= 1800) { // Within 30 minutes
                console.log(`  ✅ Fresh data!`);
                workingOracle = oracleAddress;
                break;
            } else {
                console.log(`  ⚠️  Stale data`);
            }
            
        } catch (error) {
            console.log(`  ❌ Failed: ${error.message}`);
        }
        console.log();
    }
    
    if (workingOracle) {
        console.log(`🎉 Found working oracle: ${workingOracle}`);
        
        // Update contract to use working oracle
        console.log("\n🔧 === UPDATING CONTRACT ORACLE ===");
        
        const contractAddress = "0x8796A9a42A468Bab9C0e73a6C5df08bDe3D83e1b";
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const leadFive = LeadFive.attach(contractAddress);
        
        try {
            const addOracleTx = await leadFive.addOracle(workingOracle);
            await addOracleTx.wait();
            console.log(`✅ Added working oracle to contract`);
            
            // Test price
            const currentPrice = await leadFive.getCurrentBNBPrice();
            console.log(`✅ Contract price: $${ethers.formatUnits(currentPrice, 8)}`);
            
        } catch (error) {
            console.log(`❌ Failed to update contract oracle: ${error.message}`);
        }
        
    } else {
        console.log("❌ No working oracle found. Will use alternative approach.");
        
        // Alternative: Create a simple test with USDT
        console.log("\n💡 === ALTERNATIVE: TEST WITH USDT ===");
        console.log("Since oracles are stale, let's test with USDT registration");
        console.log("This bypasses the oracle completely");
        
        // Let's deploy a mock USDT for testing
        console.log("\n📦 === DEPLOYING MOCK USDT FOR TESTING ===");
        
        try {
            // Deploy a simple ERC20 mock
            const MockERC20 = await ethers.getContractFactory("MockERC20");
            const mockUSDT = await MockERC20.deploy("Mock USDT", "MUSDT", 6);
            await mockUSDT.waitForDeployment();
            
            const mockUSDTAddress = await mockUSDT.getAddress();
            console.log(`✅ Mock USDT deployed: ${mockUSDTAddress}`);
            
            // Mint some tokens for testing
            const testWallet = ethers.Wallet.createRandom().connect(ethers.provider);
            
            // Fund test wallet with BNB for gas
            const fundTx = await deployer.sendTransaction({
                to: testWallet.address,
                value: ethers.parseEther("0.01")
            });
            await fundTx.wait();
            
            // Mint USDT to test wallet
            const mintAmount = ethers.parseUnits("1000", 6); // 1000 USDT
            await mockUSDT.mint(testWallet.address, mintAmount);
            console.log(`✅ Minted 1000 USDT to test wallet: ${testWallet.address}`);
            
            // Approve contract to spend USDT
            const contractAddress = "0x8796A9a42A468Bab9C0e73a6C5df08bDe3D83e1b";
            await mockUSDT.connect(testWallet).approve(contractAddress, mintAmount);
            console.log(`✅ Approved contract to spend USDT`);
            
            // Now test registration with USDT
            const LeadFive = await ethers.getContractFactory("LeadFive");
            const leadFive = LeadFive.attach(contractAddress);
            
            console.log("\n🎯 === TESTING USDT REGISTRATION ===");
            
            const registrationTx = await leadFive.connect(testWallet).register(
                deployer.address, // sponsor
                1, // package level
                true // use USDT
            );
            
            const receipt = await registrationTx.wait();
            console.log(`✅ USDT Registration successful! Gas used: ${receipt.gasUsed}`);
            
            // Check user status
            const [isRegistered, packageLevel, balance] = await leadFive.getUserBasicInfo(testWallet.address);
            console.log(`✅ User registered: ${isRegistered}`);
            console.log(`✅ Package level: ${packageLevel}`);
            console.log(`✅ Balance: ${ethers.formatUnits(balance, 6)} USDT`);
            
            console.log("\n🎉 USDT registration works! Oracle not needed for USDT payments.");
            
        } catch (error) {
            console.log(`❌ Mock USDT test failed: ${error.message}`);
        }
    }
}

main().catch((error) => {
    console.error("💥 Oracle search error:", error);
    process.exitCode = 1;
});
