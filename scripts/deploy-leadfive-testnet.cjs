const { ethers, upgrades } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🧪 LEADFIVE BSC TESTNET DEPLOYMENT");
    console.log("=" * 60);

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "BNB");

    // BSC Testnet contract addresses
    const USDT_TESTNET_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet USDT
    const PRICE_FEED_TESTNET_ADDRESS = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // BNB/USD Testnet Price Feed
    
    console.log("🌐 Network: BSC Testnet");
    console.log("💰 USDT Address:", USDT_TESTNET_ADDRESS);
    console.log("📊 Price Feed:", PRICE_FEED_TESTNET_ADDRESS);

    // Admin addresses - deployer gets all admin rights initially
    const ADMIN_ADDRESSES = Array(16).fill(deployer.address);

    try {
        // Get the contract factory
        console.log("\n📦 Getting LeadFiveModular contract factory...");
        const LeadFive = await ethers.getContractFactory("LeadFiveModular");

        // Deploy the contract using OpenZeppelin upgrades
        console.log("🚀 Deploying LeadFive contract to BSC Testnet...");
        const leadFive = await upgrades.deployProxy(
            LeadFive,
            [USDT_TESTNET_ADDRESS, PRICE_FEED_TESTNET_ADDRESS, ADMIN_ADDRESSES],
            {
                initializer: "initialize",
                kind: "uups"
            }
        );

        await leadFive.waitForDeployment();
        const contractAddress = await leadFive.getAddress();

        console.log("\n✅ LEADFIVE TESTNET DEPLOYMENT SUCCESSFUL!");
        console.log("📍 Proxy Address:", contractAddress);

        // Get implementation address
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
        console.log("🔧 Implementation Address:", implementationAddress);

        // Verify deployment
        console.log("\n🔍 Verifying deployment...");
        const owner = await leadFive.owner();
        console.log("👤 Contract Owner:", owner);
        console.log("🔐 Admin Control: Deployer has all 16 admin positions");

        const usdtToken = await leadFive.usdt();
        console.log("💰 USDT Token:", usdtToken);

        const priceFeed = await leadFive.priceFeed();
        console.log("📊 Price Feed:", priceFeed);

        // Test package configuration
        console.log("\n📦 Package Configuration:");
        for (let i = 1; i <= 4; i++) {
            try {
                const packageInfo = await leadFive.packages(i);
                console.log(`Package ${i}: ${ethers.formatEther(packageInfo.price)} USDT`);
            } catch (error) {
                console.log(`Package ${i}: Error reading package info`);
            }
        }

        // Test admin functions
        console.log("\n🔧 Testing admin functions...");
        try {
            // Test setting admin fee recipient
            await leadFive.setAdminFeeRecipient(deployer.address);
            console.log("✅ Admin fee recipient set successfully");

            // Get admin fee info
            const adminFeeInfo = await leadFive.getAdminFeeInfo();
            console.log("💰 Admin fee recipient:", adminFeeInfo[0]);
            console.log("💰 Admin fee rate:", adminFeeInfo[2].toString(), "basis points (5%)");

        } catch (error) {
            console.log("⚠️  Admin function test failed:", error.message);
        }

        // Generate deployment summary
        const deploymentInfo = {
            network: "BSC Testnet",
            chainId: 97,
            contractName: "LeadFive",
            proxyAddress: contractAddress,
            implementationAddress: implementationAddress,
            deployer: deployer.address,
            usdtAddress: USDT_TESTNET_ADDRESS,
            priceFeedAddress: PRICE_FEED_TESTNET_ADDRESS,
            timestamp: new Date().toISOString(),
            blockNumber: await deployer.provider.getBlockNumber(),
            testnetExplorer: `https://testnet.bscscan.com/address/${contractAddress}`,
            writeContractUrl: `https://testnet.bscscan.com/address/${contractAddress}#writeContract`,
            adminPositions: "All 16 positions controlled by deployer",
            adminFeeRecipient: deployer.address,
            packages: [
                { level: 1, price: "30 USDT" },
                { level: 2, price: "50 USDT" },
                { level: 3, price: "100 USDT" },
                { level: 4, price: "200 USDT" }
            ]
        };

        // Save deployment info to file
        const fs = require('fs');
        fs.writeFileSync(
            'leadfive-testnet-deployment.json',
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\n" + "=" * 60);
        console.log("🎉 LEADFIVE TESTNET DEPLOYMENT COMPLETE!");
        console.log("=" * 60);
        console.log("📍 Contract Address:", contractAddress);
        console.log("🔗 Testnet Explorer:", `https://testnet.bscscan.com/address/${contractAddress}`);
        console.log("✍️  Write Contract:", `https://testnet.bscscan.com/address/${contractAddress}#writeContract`);
        console.log("📄 Deployment Info saved to: leadfive-testnet-deployment.json");

        // Update .env with testnet addresses
        console.log("\n🔄 Updating .env with testnet addresses...");
        console.log("Add these to your .env file:");
        console.log(`LEADFIVE_TESTNET_PROXY=${contractAddress}`);
        console.log(`LEADFIVE_TESTNET_IMPLEMENTATION=${implementationAddress}`);

        // Frontend configuration for testnet
        console.log("\n🌐 Frontend Configuration for Testnet:");
        const testnetConfig = `
// LeadFive Testnet Configuration
export const LEAD_FIVE_TESTNET_CONFIG = {
    address: "${contractAddress}",
    implementationAddress: "${implementationAddress}",
    network: "BSC Testnet",
    chainId: 97,
    usdtAddress: "${USDT_TESTNET_ADDRESS}",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    blockExplorer: "https://testnet.bscscan.com",
    contractUrl: "https://testnet.bscscan.com/address/${contractAddress}",
    writeContractUrl: "https://testnet.bscscan.com/address/${contractAddress}#writeContract"
};`;

        console.log(testnetConfig);

        console.log("\n📋 NEXT STEPS:");
        console.log("1. ✅ Contract deployed to BSC Testnet");
        console.log("2. 🧪 Test all functions on testnet");
        console.log("3. 🔍 Verify contract on testnet explorer");
        console.log("4. 🌐 Update frontend for testnet testing");
        console.log("5. 👥 Invite users for testnet testing");
        console.log("6. 🚀 Deploy to mainnet after successful testing");

        console.log("\n🧪 TESTNET TESTING COMMANDS:");
        console.log("# Get testnet BNB from faucet:");
        console.log("https://testnet.binance.org/faucet-smart");
        console.log("\n# Test registration:");
        console.log("npx hardhat run scripts/test-registration.js --network bscTestnet");

        console.log("\n✅ LEADFIVE TESTNET IS READY FOR TESTING!");

    } catch (error) {
        console.error("❌ Testnet deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
