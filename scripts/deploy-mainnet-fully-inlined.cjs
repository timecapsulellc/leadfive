const { ethers, upgrades } = require('hardhat');

async function main() {
    console.log("🚀 Starting LeadFive BSC Mainnet Deployment");
    console.log("==========================================");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deployer address:", deployer.address);
    
    // Check deployer balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(balance), "BNB");
    
    if (balance < ethers.parseEther("0.1")) {
        throw new Error("❌ Insufficient BNB balance for deployment (need at least 0.1 BNB)");
    }

    // BSC Mainnet contract addresses
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC Mainnet USDT
    const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // BSC Mainnet WBNB
    const PRICE_FEED_ADDRESS = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"; // BSC Mainnet BNB/USD Price Feed

    console.log("📋 Contract Addresses:");
    console.log("   USDT:", USDT_ADDRESS);
    console.log("   WBNB:", WBNB_ADDRESS);
    console.log("   Price Feed:", PRICE_FEED_ADDRESS);
    console.log("");

    console.log("🔨 Deploying LeadFiveFullyInlined contract...");
    
    try {
        // Get contract factory
        const LeadFiveFullyInlined = await ethers.getContractFactory("LeadFiveFullyInlined");
        
        // Deploy as upgradeable proxy
        console.log("⏳ Deploying contract (this may take a few minutes)...");
        
        const contract = await upgrades.deployProxy(
            LeadFiveFullyInlined,
            [
                USDT_ADDRESS,
                WBNB_ADDRESS, 
                PRICE_FEED_ADDRESS,
                deployer.address // Set deployer as initial admin
            ],
            { 
                initializer: 'initialize',
                kind: 'uups'
            }
        );

        // Wait for deployment
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();

        console.log("✅ Contract deployed successfully!");
        console.log("📋 Contract address:", contractAddress);
        console.log("");

        // Verify deployment
        console.log("🔍 Verifying deployment...");
        
        // Check if deployer is owner
        const owner = await contract.owner();
        console.log("👑 Contract owner:", owner);
        console.log("✅ Owner verification:", owner.toLowerCase() === deployer.address.toLowerCase() ? "PASSED" : "FAILED");
        
        // Check if deployer is admin
        const isAdmin = await contract.adminUsers(deployer.address);
        console.log("🔑 Is deployer admin:", isAdmin);
        console.log("✅ Admin verification:", isAdmin ? "PASSED" : "FAILED");
        
        // Check package prices
        const package1Price = await contract.packagePrices(1);
        const package2Price = await contract.packagePrices(2);
        const package3Price = await contract.packagePrices(3);
        const package4Price = await contract.packagePrices(4);
        
        console.log("💰 Package Prices:");
        console.log("   Package 1:", ethers.formatEther(package1Price), "USD");
        console.log("   Package 2:", ethers.formatEther(package2Price), "USD");
        console.log("   Package 3:", ethers.formatEther(package3Price), "USD");
        console.log("   Package 4:", ethers.formatEther(package4Price), "USD");
        
        // Check admin settings
        const adminFee = await contract.adminFeePercentage();
        const withdrawalFee = await contract.withdrawalFeePercentage();
        const maxWithdrawal = await contract.maxWithdrawalPerDay();
        const minWithdrawal = await contract.minWithdrawalAmount();
        
        console.log("⚙️ Admin Settings:");
        console.log("   Admin fee:", (adminFee / 100).toString(), "%");
        console.log("   Withdrawal fee:", (withdrawalFee / 100).toString(), "%");
        console.log("   Max daily withdrawal:", ethers.formatEther(maxWithdrawal), "USD");
        console.log("   Min withdrawal:", ethers.formatEther(minWithdrawal), "USD");
        
        // Get current BNB price
        try {
            const currentPrice = await contract.getCurrentPrice();
            console.log("📈 Current BNB price:", ethers.formatEther(currentPrice), "USD");
        } catch (error) {
            console.log("⚠️ Could not fetch BNB price (price feed may need verification)");
        }

        console.log("");
        console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
        console.log("==========================================");
        console.log("📋 MAINNET CONTRACT ADDRESS:", contractAddress);
        console.log("👑 OWNER/ADMIN:", deployer.address);
        console.log("");
        console.log("📝 Next Steps:");
        console.log("1. Verify contract on BSCScan");
        console.log("2. Update frontend with new contract address");
        console.log("3. Update documentation");
        console.log("4. Test basic functions (if needed)");
        console.log("");

        // Save deployment info
        const deploymentInfo = {
            network: "BSC Mainnet",
            contractAddress: contractAddress,
            deployer: deployer.address,
            deploymentTime: new Date().toISOString(),
            gasUsed: "TBD", // Will be filled after transaction confirmation
            contractName: "LeadFiveFullyInlined",
            features: [
                "Zero external dependencies",
                "Fully inlined OpenZeppelin contracts",
                "All business logic included",
                "All security features implemented",
                "Admin rights set to deployer"
            ]
        };

        console.log("💾 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
        
        return {
            contract,
            contractAddress,
            deploymentInfo
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("💡 Solution: Add more BNB to deployer wallet");
        } else if (error.message.includes("nonce")) {
            console.log("💡 Solution: Wait a moment and try again (nonce issue)");
        } else if (error.message.includes("gas")) {
            console.log("💡 Solution: Increase gas limit or wait for lower network congestion");
        }
        
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => {
            console.log("🎯 Deployment script completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Deployment script failed:", error);
            process.exit(1);
        });
}

module.exports = main;
