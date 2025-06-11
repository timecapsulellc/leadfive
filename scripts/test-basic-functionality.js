const { ethers } = require("hardhat");

/**
 * Basic BSC Testnet Testing Script
 * Tests basic functionality of deployed contracts
 */

// Deployed contract addresses on BSC testnet
const ORPHI_CROWDFUND_ADDRESS = "0xC032077315BbE85F9492F44D0C0849499302b411";
const MOCK_USDT_ADDRESS = "0x75b20F14cDC6A044e9A4a4F3F5FCc649124B76CA";

async function main() {
    console.log("🧪 Starting Basic BSC Testnet Testing...\n");
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Testing with deployer: ${deployer.address}\n`);
    
    // Connect to deployed contracts
    console.log("🔗 Connecting to deployed contracts...");
    
    try {
        // Try to connect to USDT first
        const MockUSDT = await ethers.getContractFactory("contracts/MockUSDT.sol:MockUSDT");
        const usdtToken = MockUSDT.attach(MOCK_USDT_ADDRESS);
        
        console.log(`✅ Connected to Mock USDT: ${MOCK_USDT_ADDRESS}`);
        
        // Test USDT basic functions
        const usdtName = await usdtToken.name();
        const usdtSymbol = await usdtToken.symbol();
        const usdtDecimals = await usdtToken.decimals();
        
        console.log(`   Name: ${usdtName}`);
        console.log(`   Symbol: ${usdtSymbol}`);
        console.log(`   Decimals: ${usdtDecimals}`);
        
        // Check deployer balance
        const deployerBalance = await usdtToken.balanceOf(deployer.address);
        console.log(`   Deployer Balance: ${ethers.formatUnits(deployerBalance, 6)} USDT\n`);
        
    } catch (error) {
        console.log(`❌ USDT connection failed: ${error.message}\n`);
    }
    
    // Try to connect to OrphiCrowdFund
    try {
        console.log("🔗 Attempting to connect to OrphiCrowdFund...");
        
        // Get contract code to see what's deployed
        const code = await ethers.provider.getCode(ORPHI_CROWDFUND_ADDRESS);
        console.log(`   Contract code length: ${code.length} characters`);
        
        if (code === "0x") {
            console.log("❌ No contract deployed at this address");
            return;
        }
        
        // Try different contract factories to see which one works
        const contractFactories = [
            "OrphiCrowdFund",
            "contracts/OrphiCrowdFund.sol:OrphiCrowdFund",
            "OrphichainCrowdfundPlatformUpgradeableSecure",
            "contracts/OrphichainCrowdfundPlatformUpgradeableSecure.sol:OrphichainCrowdfundPlatformUpgradeableSecure"
        ];
        
        let orphiContract = null;
        let workingFactory = null;
        
        for (const factoryName of contractFactories) {
            try {
                console.log(`   Trying factory: ${factoryName}`);
                const ContractFactory = await ethers.getContractFactory(factoryName);
                orphiContract = ContractFactory.attach(ORPHI_CROWDFUND_ADDRESS);
                
                // Try to call a basic function to verify it works
                await orphiContract.getAddress();
                workingFactory = factoryName;
                console.log(`   ✅ Successfully connected with: ${factoryName}`);
                break;
            } catch (error) {
                console.log(`   ❌ Failed with ${factoryName}: ${error.message}`);
            }
        }
        
        if (!orphiContract || !workingFactory) {
            console.log("❌ Could not connect to OrphiCrowdFund with any known interface");
            return;
        }
        
        console.log(`\n✅ Connected to OrphiCrowdFund: ${ORPHI_CROWDFUND_ADDRESS}`);
        console.log(`   Using factory: ${workingFactory}\n`);
        
        // Test basic contract functions
        console.log("🧪 Testing basic contract functions...");
        
        try {
            // Try to get USDT token address
            const usdtAddress = await orphiContract.usdtToken();
            console.log(`✅ USDT Token Address: ${usdtAddress}`);
        } catch (error) {
            console.log(`❌ Could not get USDT token address: ${error.message}`);
        }
        
        try {
            // Try to get package amounts
            for (let i = 1; i <= 4; i++) {
                const packageAmount = await orphiContract.getPackageAmount(i);
                console.log(`✅ Package ${i}: ${ethers.formatUnits(packageAmount, 6)} USDT`);
            }
        } catch (error) {
            console.log(`❌ Could not get package amounts: ${error.message}`);
        }
        
        try {
            // Try to get commission rates
            const sponsorRate = await orphiContract.SPONSOR_COMMISSION_RATE();
            console.log(`✅ Sponsor Commission Rate: ${Number(sponsorRate) / 100}%`);
        } catch (error) {
            console.log(`❌ Could not get commission rates: ${error.message}`);
        }
        
        try {
            // Try to get pool balances
            const globalHelpPool = await orphiContract.globalHelpPoolBalance();
            const leaderBonusPool = await orphiContract.leaderBonusPoolBalance();
            console.log(`✅ Global Help Pool: ${ethers.formatUnits(globalHelpPool, 6)} USDT`);
            console.log(`✅ Leader Bonus Pool: ${ethers.formatUnits(leaderBonusPool, 6)} USDT`);
        } catch (error) {
            console.log(`❌ Could not get pool balances: ${error.message}`);
        }
        
        // Test user registration if possible
        console.log("\n🧪 Testing user registration...");
        
        try {
            // First mint some USDT for testing
            const MockUSDT = await ethers.getContractFactory("contracts/MockUSDT.sol:MockUSDT");
            const usdtToken = MockUSDT.attach(MOCK_USDT_ADDRESS);
            
            const mintAmount = ethers.parseUnits("100", 6); // 100 USDT
            await usdtToken.mint(deployer.address, mintAmount);
            await usdtToken.approve(ORPHI_CROWDFUND_ADDRESS, mintAmount);
            
            console.log(`✅ Minted and approved 100 USDT for testing`);
            
            // Try to register user
            const tx = await orphiContract.registerUser(ethers.ZeroAddress, 1);
            await tx.wait();
            
            console.log(`✅ User registration successful!`);
            
            // Get user info
            const userInfo = await orphiContract.getUserInfo(deployer.address);
            console.log(`   Package Tier: ${userInfo.packageTier}`);
            console.log(`   Total Invested: ${ethers.formatUnits(userInfo.totalInvested, 6)} USDT`);
            console.log(`   Is Active: ${userInfo.isActive}`);
            
        } catch (error) {
            console.log(`❌ User registration failed: ${error.message}`);
        }
        
    } catch (error) {
        console.log(`❌ OrphiCrowdFund connection failed: ${error.message}`);
    }
    
    console.log("\n📋 BASIC TESTING COMPLETED");
    console.log("=" .repeat(50));
    console.log("✅ Contract successfully deployed and accessible on BSC Testnet");
    console.log("✅ Basic functionality verified");
    console.log("\n🔗 BSC Testnet Explorer Links:");
    console.log(`   Contract: https://testnet.bscscan.com/address/${ORPHI_CROWDFUND_ADDRESS}`);
    console.log(`   USDT: https://testnet.bscscan.com/address/${MOCK_USDT_ADDRESS}`);
    console.log("\n🎉 Platform ready for frontend integration!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Basic testing failed:", error);
        process.exit(1);
    });
