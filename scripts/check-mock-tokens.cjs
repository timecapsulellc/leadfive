const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Existing Mock Tokens on BSC Testnet\n");
    
    // Known deployed addresses from the success report
    const MOCK_USDT_ADDRESS = "0x00175c710A7448920934eF830f2F22D6370E0642";
    const MOCK_WBNB_ADDRESS = "0xBc6dD11528644DacCbBD72f6740227B61c33B2EF";
    const MOCK_PRICE_FEED_ADDRESS = "0xb4BCe54d31B49CAF37A4a8C9Eb3AC333A7Ee7766";
    
    const [deployer] = await ethers.getSigners();
    console.log(`Testing with account: ${deployer.address}`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Account BNB balance: ${ethers.formatEther(balance)} BNB\n`);
    
    let allWorking = true;
    
    try {
        // Test MockUSDT
        console.log("📋 Testing MockUSDT...");
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        const mockUSDT = MockUSDT.attach(MOCK_USDT_ADDRESS);
        
        const usdtName = await mockUSDT.name();
        const usdtSymbol = await mockUSDT.symbol();
        const usdtBalance = await mockUSDT.balanceOf(deployer.address);
        const usdtTotalSupply = await mockUSDT.totalSupply();
        
        console.log(`✅ MockUSDT Working`);
        console.log(`   Name: ${usdtName}`);
        console.log(`   Symbol: ${usdtSymbol}`);
        console.log(`   Your Balance: ${ethers.formatEther(usdtBalance)} USDT`);
        console.log(`   Total Supply: ${ethers.formatEther(usdtTotalSupply)} USDT\n`);
        
    } catch (error) {
        console.log(`❌ MockUSDT not working: ${error.message}\n`);
        allWorking = false;
    }
    
    try {
        // Test MockWBNB
        console.log("📋 Testing MockWBNB...");
        const MockWBNB = await ethers.getContractFactory("MockWBNB");
        const mockWBNB = MockWBNB.attach(MOCK_WBNB_ADDRESS);
        
        const wbnbName = await mockWBNB.name();
        const wbnbSymbol = await mockWBNB.symbol();
        const wbnbBalance = await mockWBNB.balanceOf(deployer.address);
        const wbnbTotalSupply = await mockWBNB.totalSupply();
        
        console.log(`✅ MockWBNB Working`);
        console.log(`   Name: ${wbnbName}`);
        console.log(`   Symbol: ${wbnbSymbol}`);
        console.log(`   Your Balance: ${ethers.formatEther(wbnbBalance)} WBNB`);
        console.log(`   Total Supply: ${ethers.formatEther(wbnbTotalSupply)} WBNB\n`);
        
    } catch (error) {
        console.log(`❌ MockWBNB not working: ${error.message}\n`);
        allWorking = false;
    }
    
    try {
        // Test MockPriceFeed
        console.log("📋 Testing MockPriceFeed...");
        const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
        const mockPriceFeed = MockPriceFeed.attach(MOCK_PRICE_FEED_ADDRESS);
        
        const price = await mockPriceFeed.latestRoundData();
        const description = await mockPriceFeed.description();
        
        console.log(`✅ MockPriceFeed Working`);
        console.log(`   Description: ${description}`);
        console.log(`   Price: $${ethers.formatUnits(price[1], 8)}`);
        console.log(`   Updated: ${new Date(Number(price[3]) * 1000).toLocaleString()}\n`);
        
    } catch (error) {
        console.log(`❌ MockPriceFeed not working: ${error.message}\n`);
        allWorking = false;
    }
    
    if (allWorking) {
        console.log("🎉 All mock tokens are working perfectly!");
        console.log("\n📝 Available for testing:");
        console.log(`• MockUSDT: ${MOCK_USDT_ADDRESS}`);
        console.log(`• MockWBNB: ${MOCK_WBNB_ADDRESS}`);
        console.log(`• MockPriceFeed: ${MOCK_PRICE_FEED_ADDRESS}`);
        console.log("\n✨ No need to deploy new mock tokens!");
    } else {
        console.log("⚠️  Some mock tokens need to be redeployed.");
        console.log("Run: npx hardhat run scripts/deploy-mock-ecosystem.cjs --network bscTestnet");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
