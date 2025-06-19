const { ethers, upgrades } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🚀 LEAD FIVE Contract Deployment Starting...");
    console.log("=" * 60);

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "BNB");

    // Contract parameters
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC Mainnet USDT
    const PRICE_FEED_ADDRESS = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"; // BNB/USD Price Feed
    
    // Admin addresses (16 addresses for admin roles)
    const ADMIN_ADDRESSES = [
        deployer.address, // Primary admin
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000", // Placeholder
        "0x0000000000000000000000000000000000000000"  // Placeholder
    ];

    try {
        // Get the contract factory
        console.log("\n📦 Getting LeadFiveModular contract factory...");
        const LeadFive = await ethers.getContractFactory("LeadFiveModular");

        // Deploy the contract using OpenZeppelin upgrades
        console.log("🚀 Deploying LeadFive contract...");
        const leadFive = await upgrades.deployProxy(
            LeadFive,
            [USDT_ADDRESS, PRICE_FEED_ADDRESS, ADMIN_ADDRESSES],
            {
                initializer: "initialize",
                kind: "uups"
            }
        );

        await leadFive.waitForDeployment();
        const contractAddress = await leadFive.getAddress();

        console.log("✅ LEAD FIVE Contract deployed successfully!");
        console.log("📍 Proxy Address:", contractAddress);

        // Get implementation address
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
        console.log("🔧 Implementation Address:", implementationAddress);

        // Verify deployment
        console.log("\n🔍 Verifying deployment...");
        const owner = await leadFive.owner();
        console.log("👤 Contract Owner:", owner);

        const usdtToken = await leadFive.usdt();
        console.log("💰 USDT Token:", usdtToken);

        const priceFeed = await leadFive.priceFeed();
        console.log("📊 Price Feed:", priceFeed);

        // Test package configuration
        console.log("\n📦 Package Configuration:");
        for (let i = 1; i <= 8; i++) {
            try {
                const packageInfo = await leadFive.packages(i);
                console.log(`Package ${i}: ${ethers.formatEther(packageInfo.price)} USDT`);
            } catch (error) {
                console.log(`Package ${i}: Error reading package info`);
            }
        }

        // Generate deployment summary
        const deploymentInfo = {
            network: "BSC Mainnet",
            contractName: "LeadFive",
            proxyAddress: contractAddress,
            implementationAddress: implementationAddress,
            deployer: deployer.address,
            usdtAddress: USDT_ADDRESS,
            priceFeedAddress: PRICE_FEED_ADDRESS,
            timestamp: new Date().toISOString(),
            blockNumber: await deployer.provider.getBlockNumber(),
            gasUsed: "TBD", // Will be calculated from transaction receipt
            bscscanUrl: `https://bscscan.com/address/${contractAddress}`,
            writeContractUrl: `https://bscscan.com/address/${contractAddress}#writeContract`
        };

        // Save deployment info to file
        const fs = require('fs');
        fs.writeFileSync(
            'leadfive-deployment.json',
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\n" + "=" * 60);
        console.log("🎉 LEAD FIVE DEPLOYMENT COMPLETE!");
        console.log("=" * 60);
        console.log("📍 Contract Address:", contractAddress);
        console.log("🔗 BSCScan:", `https://bscscan.com/address/${contractAddress}`);
        console.log("✍️  Write Contract:", `https://bscscan.com/address/${contractAddress}#writeContract`);
        console.log("📄 Deployment Info saved to: leadfive-deployment.json");
        console.log("=" * 60);

        // Update frontend configuration
        console.log("\n🔄 Updating frontend configuration...");
        const configUpdate = `
// LEAD FIVE Contract Configuration - Updated after deployment
export const LEAD_FIVE_CONFIG = {
    address: "${contractAddress}",
    implementationAddress: "${implementationAddress}",
    network: "BSC Mainnet",
    chainId: 56,
    usdtAddress: "${USDT_ADDRESS}",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    blockExplorer: "https://bscscan.com",
    contractUrl: "https://bscscan.com/address/${contractAddress}",
    writeContractUrl: "https://bscscan.com/address/${contractAddress}#writeContract"
};`;

        console.log("✅ Frontend configuration ready for update");
        console.log("\n🚀 LEAD FIVE is ready for production!");

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
