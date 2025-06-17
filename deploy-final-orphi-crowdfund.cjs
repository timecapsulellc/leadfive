const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 DEPLOYING ORPHI CROWD FUND TO BSC TESTNET");
    console.log("=" .repeat(60));

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deployer address:", deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Constants
    const TREZOR_ADMIN_WALLET = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    const USDT_BSC_TESTNET = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet USDT
    
    // Package amounts in USDT (with 18 decimals)
    const packageAmounts = [
        ethers.parseEther("30"),   // $30
        ethers.parseEther("50"),   // $50
        ethers.parseEther("100"),  // $100
        ethers.parseEther("200"),  // $200
        ethers.parseEther("500")   // $500
    ];

    console.log("📦 Package amounts:", packageAmounts.map(amt => ethers.formatEther(amt) + " USDT"));
    console.log("🔐 Trezor Admin Wallet:", TREZOR_ADMIN_WALLET);
    console.log("💵 USDT Token Address:", USDT_BSC_TESTNET);

    try {
        // Deploy contract
        console.log("\\n🏗️  Deploying OrphiCrowdFundDeployable...");
        
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundDeployable");
        
        const contract = await upgrades.deployProxy(
            OrphiCrowdFund,
            [USDT_BSC_TESTNET, packageAmounts],
            { 
                initializer: 'initialize',
                kind: 'uups'
            }
        );

        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();

        console.log("\\n✅ DEPLOYMENT SUCCESSFUL!");
        console.log("📍 Proxy Address:", contractAddress);
        console.log("🔗 BSCScan URL:", `https://testnet.bscscan.com/address/${contractAddress}`);

        // Verify contract name
        console.log("\\n🔍 VERIFYING CONTRACT...");
        const contractName = await contract.contractName();
        console.log("📝 Contract Name:", contractName);
        
        if (contractName === "Orphi Crowd Fund") {
            console.log("✅ Contract name verified correctly!");
        } else {
            console.log("❌ Contract name mismatch!");
        }

        // Verify admin setup
        const ADMIN_ROLE = await contract.ADMIN_ROLE();
        const hasAdminRole = await contract.hasRole(ADMIN_ROLE, TREZOR_ADMIN_WALLET);
        console.log("👑 Trezor has admin role:", hasAdminRole);

        const owner = await contract.owner();
        console.log("🏠 Contract owner:", owner);

        // Get contract stats
        const stats = await contract.getContractStats();
        console.log("\\n📊 CONTRACT STATS:");
        console.log("👥 Total Users:", stats[0].toString());
        console.log("💰 Total Volume:", ethers.formatEther(stats[1]), "USDT");
        console.log("🏦 Contract Balance:", ethers.formatEther(stats[2]), "USDT");

        console.log("\\n🎉 DEPLOYMENT COMPLETE!");
        console.log("🔥 Ready for frontend integration!");

        // Save deployment info
        const deploymentInfo = {
            contractAddress: contractAddress,
            contractName: contractName,
            owner: owner,
            trezorAdminWallet: TREZOR_ADMIN_WALLET,
            usdtToken: USDT_BSC_TESTNET,
            packageAmounts: packageAmounts.map(amt => ethers.formatEther(amt)),
            deploymentTime: new Date().toISOString(),
            network: "BSC Testnet",
            deployer: deployer.address
        };

        console.log("\\n💾 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));

        return {
            success: true,
            contractAddress: contractAddress,
            deploymentInfo: deploymentInfo
        };

    } catch (error) {
        console.error("\\n❌ DEPLOYMENT FAILED:", error.message);
        console.error("Full error:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

if (require.main === module) {
    main()
        .then((result) => {
            if (result.success) {
                console.log("\\n🎊 Script completed successfully!");
                process.exit(0);
            } else {
                console.log("\\n💥 Script failed!");
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error("\\n💥 Unhandled error:", error);
            process.exit(1);
        });
}

module.exports = main;
