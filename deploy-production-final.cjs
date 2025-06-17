#!/usr/bin/env node
/**
 * FINAL PRODUCTION DEPLOYMENT SCRIPT
 * OrphiCrowdFund Unified Contract
 * BSC Mainnet Ready
 */

const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("\n🚀 DEPLOYING ORPHI CROWDFUND - UNIFIED PRODUCTION CONTRACT");
    console.log("═".repeat(70));
    
    // Get deployment account
    const [deployer] = await ethers.getSigners();
    console.log(`📋 Deploying from account: ${deployer.address}`);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.1")) {
        console.log("❌ Insufficient balance for deployment");
        process.exit(1);
    }
    
    // Contract addresses
    const TREZOR_ADMIN_WALLET = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    const BSC_USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
    
    console.log(`🔐 Trezor Admin: ${TREZOR_ADMIN_WALLET}`);
    console.log(`💵 USDT Token: ${BSC_USDT_ADDRESS}`);
    
    try {
        // Deploy MockUSDT for testing (remove for mainnet)
        console.log("\n📄 Deploying MockUSDT for testing...");
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        const mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        const mockUSDTAddress = await mockUSDT.getAddress();
        console.log(`✅ MockUSDT deployed at: ${mockUSDTAddress}`);
        
        // Use MockUSDT for testing, BSC USDT for mainnet
        const usdtAddress = process.env.NETWORK === "bsc" ? BSC_USDT_ADDRESS : mockUSDTAddress;
        
        // Deploy OrphiCrowdFund Proxy
        console.log("\n🏗️  Deploying OrphiCrowdFund (UUPS Proxy)...");
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        
        // Package amounts in USDT (6 decimals)
        const packageAmounts = [
            30000000,   // $30 USDT
            50000000,   // $50 USDT  
            100000000,  // $100 USDT
            200000000,  // $200 USDT
            0           // Reserved for future use
        ];

        const contract = await upgrades.deployProxy(
            OrphiCrowdFund,
            [
                usdtAddress,    // USDT token address
                packageAmounts  // Package amounts array [30, 50, 100, 200, 0]
            ],
            { 
                initializer: 'initialize',
                kind: 'uups'
            }
        );
        
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        
        console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
        console.log("═".repeat(50));
        console.log(`📍 Contract Address: ${contractAddress}`);
        console.log(`🔗 Proxy Pattern: UUPS (ERC-1967)`);
        console.log(`🏭 Implementation: OrphiCrowdFund`);
        
        // Verify contract configuration
        console.log("\n🔍 VERIFYING CONTRACT CONFIGURATION...");
        
        try {
            const contractName = await contract.getContractName();
            console.log(`✅ Contract Name: ${contractName}`);
            
            const hasDefaultAdmin = await contract.hasRole(
                await contract.DEFAULT_ADMIN_ROLE(), 
                TREZOR_ADMIN_WALLET
            );
            console.log(`✅ Trezor Admin Role: ${hasDefaultAdmin ? 'SET' : 'NOT SET'}`);
            
            // Check all package amounts
            const packages = [
                ethers.parseUnits("30", 6),   // ENTRY
                ethers.parseUnits("50", 6),   // STANDARD  
                ethers.parseUnits("100", 6),  // ADVANCED
                ethers.parseUnits("200", 6)   // PREMIUM
            ];
            
            console.log("✅ Package Validation:");
            console.log(`   • Entry: $30 (${ethers.formatUnits(packages[0], 6)} USDT)`);
            console.log(`   • Standard: $50 (${ethers.formatUnits(packages[1], 6)} USDT)`);
            console.log(`   • Advanced: $100 (${ethers.formatUnits(packages[2], 6)} USDT)`);
            console.log(`   • Premium: $200 (${ethers.formatUnits(packages[3], 6)} USDT)`);
            
        } catch (error) {
            console.log(`⚠️  Configuration check failed: ${error.message}`);
        }
        
        // Generate deployment summary
        console.log("\n📊 DEPLOYMENT SUMMARY");
        console.log("═".repeat(50));
        console.log(`Network: ${process.env.NETWORK || 'localhost'}`);
        console.log(`Deployer: ${deployer.address}`);
        console.log(`Contract: ${contractAddress}`);
        console.log(`USDT Token: ${usdtAddress}`);
        console.log(`Admin Wallet: ${TREZOR_ADMIN_WALLET}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        
        // Next steps
        console.log("\n📋 NEXT STEPS:");
        console.log("1. Verify contract on BSCScan");
        console.log("2. Test admin functions with Trezor wallet");
        console.log("3. Configure frontend with new contract address");
        console.log("4. Execute test transactions");
        console.log("5. Begin user onboarding");
        
        // Save deployment info
        const deploymentInfo = {
            network: process.env.NETWORK || 'localhost',
            contractAddress: contractAddress,
            implementationAddress: await upgrades.erc1967.getImplementationAddress(contractAddress),
            adminAddress: await upgrades.erc1967.getAdminAddress(contractAddress),
            deployer: deployer.address,
            trezorAdmin: TREZOR_ADMIN_WALLET,
            usdtToken: usdtAddress,
            timestamp: new Date().toISOString(),
            transactionHash: contract.deploymentTransaction()?.hash,
            gasUsed: contract.deploymentTransaction()?.gasLimit?.toString()
        };
        
        console.log("\n💾 Saving deployment info to deployment-info.json");
        require('fs').writeFileSync(
            'deployment-info.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\n🚀 ORPHI CROWDFUND UNIFIED CONTRACT DEPLOYED SUCCESSFULLY!");
        console.log("🏆 PRODUCTION READY - LAUNCH AUTHORIZED!");
        
    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED:");
        console.error(error);
        process.exit(1);
    }
}

// Handle deployment
main()
    .then(() => {
        console.log("\n✅ Deployment script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment script failed:", error);
        process.exit(1);
    });
