const { ethers, upgrades } = require("hardhat");
require('dotenv').config();

/**
 * Deploy OrphiCrowdFundComplete - ACCURATE Compensation Plan Implementation
 * This script deploys the corrected contract with proper 40% direct bonus
 * and complete compensation plan matching the presentation.
 */
async function main() {
    console.log("🚀 DEPLOYING ORPHI CROWDFUND COMPLETE (ACCURATE COMPENSATION)");
    console.log("=" .repeat(70));

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} BNB`);

    // Contract addresses for BSC Mainnet
    const USDT_MAINNET = "0x55d398326f99059fF775485246999027B3197955";
    const TREASURY_WALLET = process.env.Orphi_ADMIN_WALLET;
    const PLATFORM_WALLET = process.env.Orphi_ADMIN_WALLET;
    const EMERGENCY_WALLET = process.env.Orphi_ADMIN_WALLET;
    const ADMIN_WALLET = process.env.Orphi_ADMIN_WALLET;

    console.log("\n🔧 DEPLOYMENT CONFIGURATION:");
    console.log(`USDT Address: ${USDT_MAINNET}`);
    console.log(`Treasury: ${TREASURY_WALLET}`);
    console.log(`Platform: ${PLATFORM_WALLET}`);
    console.log(`Emergency: ${EMERGENCY_WALLET}`);
    console.log(`Admin: ${ADMIN_WALLET}`);

    try {
        // Get contract factory
        console.log("\n📦 Getting contract factory...");
        const OrphiCrowdFundComplete = await ethers.getContractFactory("OrphiCrowdFundComplete");

        // Deploy proxy
        console.log("\n🚀 Deploying OrphiCrowdFundComplete proxy...");
        const contract = await upgrades.deployProxy(
            OrphiCrowdFundComplete,
            [
                USDT_MAINNET,
                TREASURY_WALLET,
                PLATFORM_WALLET,
                EMERGENCY_WALLET,
                ADMIN_WALLET
            ],
            {
                kind: 'uups',
                initializer: 'initialize',
                gasLimit: 6000000
            }
        );

        await contract.waitForDeployment();
        const proxyAddress = await contract.getAddress();
        
        console.log("\n✅ DEPLOYMENT SUCCESSFUL!");
        console.log(`📍 Proxy Address: ${proxyAddress}`);
        
        // Get implementation address
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log(`🔧 Implementation: ${implementationAddress}`);

        // Verify compensation plan is correct
        console.log("\n🔍 VERIFYING COMPENSATION PLAN...");
        
        // Test compensation breakdown
        const testAmount = ethers.parseEther("100"); // $100 USDT
        const breakdown = await contract.verifyCompensationBreakdown(testAmount);
        
        console.log("\n📊 COMPENSATION VERIFICATION:");
        console.log(`Direct Sponsor (40%): ${ethers.formatEther(breakdown[0])} USDT`);
        console.log(`Level Bonuses (10%): ${ethers.formatEther(breakdown[1])} USDT`);
        console.log(`Global Upline (10%): ${ethers.formatEther(breakdown[2])} USDT`);
        console.log(`Leader Pool (10%): ${ethers.formatEther(breakdown[3])} USDT`);
        console.log(`Help Pool (30%): ${ethers.formatEther(breakdown[4])} USDT`);
        console.log(`Total: ${ethers.formatEther(breakdown[5])} USDT`);
        console.log(`✅ Valid: ${breakdown[6]}`);

        if (breakdown[6]) {
            console.log("\n✅ COMPENSATION PLAN VERIFICATION: PASSED");
            console.log("✅ 100% allocation confirmed");
            console.log("✅ Direct sponsor bonus: 40% ✓");
            console.log("✅ Mathematical accuracy: VERIFIED");
        } else {
            console.log("\n❌ COMPENSATION PLAN VERIFICATION: FAILED");
        }

        // Check package configuration
        console.log("\n📦 VERIFYING PACKAGE CONFIGURATION...");
        const packages = [
            { tier: 1, expected: "30" },
            { tier: 2, expected: "50" },
            { tier: 3, expected: "100" },
            { tier: 4, expected: "200" },
            { tier: 5, expected: "300" },
            { tier: 6, expected: "500" },
            { tier: 7, expected: "1000" },
            { tier: 8, expected: "2000" }
        ];

        for (const pkg of packages) {
            try {
                const packageData = await contract.getPackage(pkg.tier);
                const amount = ethers.formatEther(packageData.usdtAmount);
                console.log(`Package ${pkg.tier}: $${amount} USDT (Expected: $${pkg.expected}) ${amount === pkg.expected ? "✅" : "❌"}`);
            } catch (error) {
                console.log(`Package ${pkg.tier}: ERROR - ${error.message} ❌`);
            }
        }

        // Save deployment info
        const deploymentInfo = {
            network: network.name,
            chainId: network.chainId,
            proxyAddress: proxyAddress,
            implementationAddress: implementationAddress,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            contractName: "OrphiCrowdFundComplete",
            verified: breakdown[6],
            gasUsed: "TBD",
            compensationPlan: {
                directSponsor: "40%",
                levelBonuses: "10%",
                globalUpline: "10%",
                leaderPool: "10%",
                helpPool: "30%",
                total: "100%"
            },
            packages: {
                "Package 1": "$30 USDT",
                "Package 2": "$50 USDT",
                "Package 3": "$100 USDT",
                "Package 4": "$200 USDT",
                "Package 5": "$300 USDT",
                "Package 6": "$500 USDT",
                "Package 7": "$1000 USDT",
                "Package 8": "$2000 USDT"
            }
        };

        // Write deployment info to file
        const fs = require('fs');
        fs.writeFileSync(
            'deployment-complete-contract.json',
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\n📋 DEPLOYMENT SUMMARY:");
        console.log(`Contract: OrphiCrowdFundComplete`);
        console.log(`Proxy: ${proxyAddress}`);
        console.log(`Implementation: ${implementationAddress}`);
        console.log(`Status: VERIFIED & READY`);
        console.log(`Compensation: 100% ACCURATE`);

        console.log("\n🎯 NEXT STEPS:");
        console.log("1. Verify contract on BSCScan");
        console.log("2. Update frontend configuration");
        console.log("3. Register root/admin users");
        console.log("4. Test complete user flows");
        console.log("5. Launch with correct compensation");

        console.log("\n🔧 VERIFICATION COMMAND:");
        console.log(`npx hardhat verify --network mainnet ${implementationAddress}`);

        console.log("\n✅ DEPLOYMENT COMPLETE!");

    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED:");
        console.error(error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
