const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 DEPLOYING ORPHI CROWDFUND TO BSC TESTNET");
    console.log("=" .repeat(50));
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "BNB");
    
    if (balance < ethers.parseEther("0.1")) {
        throw new Error("Insufficient BNB balance for deployment");
    }
    
    // BSC Testnet USDT address
    const USDT_TESTNET = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
    const TREZOR_ADMIN = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    console.log("📋 Deployment Parameters:");
    console.log("  USDT Token:", USDT_TESTNET);
    console.log("  Trezor Admin:", TREZOR_ADMIN);
    console.log("");
    
    try {
        // Deploy the main OrphiCrowdFund contract
        console.log("📦 Deploying OrphiCrowdFund contract...");
        
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        
        const orphiCrowdFund = await upgrades.deployProxy(
            OrphiCrowdFund,
            [USDT_TESTNET],
            {
                initializer: 'initialize',
                kind: 'uups'
            }
        );
        
        await orphiCrowdFund.waitForDeployment();
        const contractAddress = await orphiCrowdFund.getAddress();
        
        console.log("✅ OrphiCrowdFund deployed to:", contractAddress);
        
        // Verify contract configuration
        console.log("\\n🔍 VERIFYING CONTRACT CONFIGURATION");
        console.log("-" .repeat(30));
        
        // Check contract name
        const contractName = await orphiCrowdFund.getContractName();
        console.log("✅ Contract Name:", contractName);
        
        // Check Trezor admin setup
        const owner = await orphiCrowdFund.owner();
        console.log("✅ Contract Owner:", owner);
        console.log("✅ Trezor Admin Check:", owner === TREZOR_ADMIN ? "CORRECT" : "NEEDS TRANSFER");
        
        // Check USDT token
        const usdtAddress = await orphiCrowdFund.usdtToken();
        console.log("✅ USDT Token:", usdtAddress);
        
        // Check package amounts
        const packageAmounts = await orphiCrowdFund.getPackageAmounts();
        console.log("✅ Package Amounts:", packageAmounts.map(p => ethers.formatUnits(p, 6)));
        
        // Transfer ownership to Trezor if needed
        if (owner !== TREZOR_ADMIN) {
            console.log("\\n🔄 TRANSFERRING OWNERSHIP TO TREZOR");
            console.log("-" .repeat(30));
            
            const tx = await orphiCrowdFund.transferOwnership(TREZOR_ADMIN);
            await tx.wait();
            console.log("✅ Ownership transferred to Trezor wallet");
            
            // Grant admin role to Trezor
            const ADMIN_ROLE = await orphiCrowdFund.ADMIN_ROLE();
            const tx2 = await orphiCrowdFund.grantRole(ADMIN_ROLE, TREZOR_ADMIN);
            await tx2.wait();
            console.log("✅ Admin role granted to Trezor wallet");
        }
        
        console.log("\\n🎉 DEPLOYMENT SUCCESSFUL!");
        console.log("=" .repeat(50));
        console.log("Contract Address:", contractAddress);
        console.log("Contract Name:", contractName);
        console.log("Owner:", await orphiCrowdFund.owner());
        console.log("Network: BSC Testnet");
        console.log("Explorer: https://testnet.bscscan.com/address/" + contractAddress);
        
        console.log("\\n📋 NEXT STEPS:");
        console.log("1. Verify contract on BSCScan");
        console.log("2. Test frontend integration");
        console.log("3. Perform comprehensive testing");
        console.log("4. Deploy to mainnet when ready");
        
        // Save deployment info
        const deploymentInfo = {
            contractAddress,
            contractName,
            owner: await orphiCrowdFund.owner(),
            network: "BSC Testnet",
            deployedAt: new Date().toISOString(),
            explorer: `https://testnet.bscscan.com/address/${contractAddress}`,
            usdt: USDT_TESTNET,
            trezorAdmin: TREZOR_ADMIN
        };
        
        const fs = require('fs');
        fs.writeFileSync(
            'deployment-info.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\\n💾 Deployment info saved to deployment-info.json");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
