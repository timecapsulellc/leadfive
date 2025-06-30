// SPDX-License-Identifier: MIT
/**
 * @title Check Mock Token Balances
 * @dev Script to verify mock token deployments and balances
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Mock Token Balances");
    console.log("================================");
    
    try {
        // Get deployer account
        const [deployer] = await ethers.getSigners();
        console.log(`Checking balances for: ${deployer.address}`);
        console.log(`Account BNB balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} BNB\n`);
        
        // Contract addresses from deployment
        const mockUSDTAddress = process.env.MOCK_USDT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const mockWBNBAddress = process.env.MOCK_WBNB_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const mockPriceFeedAddress = process.env.MOCK_PRICEFEED_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
        const leadFiveAddress = process.env.VITE_CONTRACT_ADDRESS || "0x1E95943b022dde7Ce7e0F54ced25599e0c6D8b9b";
        
        // Get contract instances
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        const mockUSDT = MockUSDT.attach(mockUSDTAddress);
        
        const MockWBNB = await ethers.getContractFactory("MockWBNB");
        const mockWBNB = MockWBNB.attach(mockWBNBAddress);
        
        const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
        const mockPriceFeed = MockPriceFeed.attach(mockPriceFeedAddress);
        
        const LeadFiveOptimized = await ethers.getContractFactory("LeadFiveOptimized");
        const leadFive = LeadFiveOptimized.attach(leadFiveAddress);
        
        console.log("📊 CONTRACT ADDRESSES:");
        console.log(`MockUSDT: ${mockUSDTAddress}`);
        console.log(`MockWBNB: ${mockWBNBAddress}`);
        console.log(`MockPriceFeed: ${mockPriceFeedAddress}`);
        console.log(`LeadFive: ${leadFiveAddress}\n`);
        
        // Check MockUSDT
        console.log("💰 MOCK USDT TOKEN:");
        const usdtBalance = await mockUSDT.balanceOf(deployer.address);
        const usdtTotalSupply = await mockUSDT.totalSupply();
        const usdtDecimals = await mockUSDT.decimals();
        console.log(`  Balance: ${ethers.formatUnits(usdtBalance, usdtDecimals)} USDT`);
        console.log(`  Total Supply: ${ethers.formatUnits(usdtTotalSupply, usdtDecimals)} USDT`);
        console.log(`  Decimals: ${usdtDecimals}`);
        
        // Check allowance for LeadFive contract
        const usdtAllowance = await mockUSDT.allowance(deployer.address, leadFiveAddress);
        console.log(`  Allowance to LeadFive: ${ethers.formatUnits(usdtAllowance, usdtDecimals)} USDT\n`);
        
        // Check MockWBNB
        console.log("🌐 MOCK WBNB TOKEN:");
        const wbnbBalance = await mockWBNB.balanceOf(deployer.address);
        const wbnbTotalSupply = await mockWBNB.totalSupply();
        const wbnbDecimals = await mockWBNB.decimals();
        console.log(`  Balance: ${ethers.formatUnits(wbnbBalance, wbnbDecimals)} WBNB`);
        console.log(`  Total Supply: ${ethers.formatUnits(wbnbTotalSupply, wbnbDecimals)} WBNB`);
        console.log(`  Decimals: ${wbnbDecimals}`);
        
        // Check allowance for LeadFive contract
        const wbnbAllowance = await mockWBNB.allowance(deployer.address, leadFiveAddress);
        console.log(`  Allowance to LeadFive: ${ethers.formatUnits(wbnbAllowance, wbnbDecimals)} WBNB\n`);
        
        // Check MockPriceFeed
        console.log("📊 MOCK PRICE FEED:");
        try {
            const latestRoundData = await mockPriceFeed.latestRoundData();
            const price = ethers.formatUnits(latestRoundData[1], 8); // Price feeds typically use 8 decimals
            console.log(`  Latest Price: $${price}`);
            console.log(`  Round ID: ${latestRoundData[0]}`);
            console.log(`  Updated At: ${new Date(Number(latestRoundData[3]) * 1000).toLocaleString()}\n`);
        } catch (error) {
            console.log(`  Error reading price feed: ${error.message}\n`);
        }
        
        // Check LeadFive contract configuration
        console.log("🎯 LEADFIVE CONTRACT:");
        try {
            const registrationFee = await leadFive.getRegistrationFee();
            console.log(`  Registration Fee: ${ethers.formatEther(registrationFee)} BNB`);
            
            const contractBalance = await ethers.provider.getBalance(leadFiveAddress);
            console.log(`  Contract BNB Balance: ${ethers.formatEther(contractBalance)} BNB`);
            
            // Check if deployer is registered
            try {
                const userInfo = await leadFive.getUserInfo(deployer.address);
                console.log(`  Deployer registered: Yes`);
                console.log(`  User ID: ${userInfo[0]}`);
            } catch (error) {
                console.log(`  Deployer registered: No`);
            }
        } catch (error) {
            console.log(`  Error reading LeadFive contract: ${error.message}`);
        }
        
        console.log("\n✅ Balance check completed!");
        console.log("\n🔧 NEXT STEPS:");
        console.log("1. Approve tokens for LeadFive contract if needed");
        console.log("2. Test user registration");
        console.log("3. Run mass testing with 1000+ users");
        console.log("\n💡 COMMANDS:");
        console.log("# Approve USDT for testing:");
        console.log("npx hardhat run scripts/approve-mock-tokens.cjs --network bscTestnet");
        console.log("\n# Run mass testing:");
        console.log("npx hardhat run scripts/mass-testing-with-mocks.cjs --network bscTestnet");
        
    } catch (error) {
        console.error("❌ Error checking balances:", error.message);
        console.error("Full error:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
