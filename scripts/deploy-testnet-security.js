const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

/**
 * Deploy OrphiCrowdFund to BSC Testnet with Security Enhancements
 * This script deploys the contract with all new security features for comprehensive testing
 */
async function main() {
    console.log("🚀 Starting OrphiCrowdFund Testnet Deployment with Security Features...");
    console.log("📅 Date:", new Date().toISOString());
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "BNB");
    
    if (balance < ethers.parseEther("0.1")) {
        throw new Error("❌ Insufficient BNB balance. Need at least 0.1 BNB for deployment.");
    }
    
    // BSC Testnet USDT address
    const USDT_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet USDT
    
    // Admin addresses (use deployer for testnet)
    const TREASURY_ADDRESS = deployer.address;
    const EMERGENCY_ADDRESS = deployer.address;
    const POOL_MANAGER_ADDRESS = deployer.address;
    
    console.log("📋 Deployment Configuration:");
    console.log("  USDT Token:", USDT_ADDRESS);
    console.log("  Treasury:", TREASURY_ADDRESS);
    console.log("  Emergency:", EMERGENCY_ADDRESS);
    console.log("  Pool Manager:", POOL_MANAGER_ADDRESS);
    
    try {
        // Deploy Mock USDT for testing if needed
        console.log("🪙 Deploying Mock USDT for testing...");
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        const mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        const mockUSDTAddress = await mockUSDT.getAddress();
        console.log("✅ Mock USDT deployed to:", mockUSDTAddress);
        
        // Use Mock USDT instead of mainnet USDT for testing
        const usdtAddress = mockUSDTAddress;
        
        // Check contract size before deployment
        console.log("📏 Checking contract size...");
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        const bytecode = OrphiCrowdFund.bytecode;
        const sizeInBytes = (bytecode.length - 2) / 2; // Remove 0x prefix and convert hex to bytes
        const sizeInKB = sizeInBytes / 1024;
        
        console.log("📊 Contract size:", sizeInKB.toFixed(2), "KB");
        
        if (sizeInKB > 24.576) {
            console.log("⚠️  WARNING: Contract size exceeds 24KB limit!");
            console.log("🔧 Deploying simplified version for testing...");
            
            // Deploy simplified version
            const OrphiCrowdFundSimplified = await ethers.getContractFactory("OrphiCrowdFundSimplified");
            
            console.log("🚀 Deploying OrphiCrowdFundSimplified...");
            const orphiCrowdFund = await upgrades.deployProxy(OrphiCrowdFundSimplified, [
                usdtAddress,
                TREASURY_ADDRESS,
                EMERGENCY_ADDRESS,
                true,  // MEV protection enabled
                true,  // circuit breaker enabled
                true   // timelock enabled
            ], {
                initializer: 'initialize',
                kind: 'uups'
            });
            
            await orphiCrowdFund.waitForDeployment();
            const contractAddress = await orphiCrowdFund.getAddress();
            
            console.log("✅ OrphiCrowdFundSimplified deployed to:", contractAddress);
            
            // Test basic functionality
            console.log("🧪 Testing basic functionality...");
            
            // Test MEV protection
            console.log("🔒 Testing MEV protection...");
            const mevEnabled = await orphiCrowdFund.mevProtectionEnabled();
            console.log("  MEV Protection enabled:", mevEnabled);
            
            // Test circuit breaker
            console.log("🚨 Testing circuit breaker...");
            const circuitBreakerEnabled = await orphiCrowdFund.circuitBreakerEnabled();
            console.log("  Circuit Breaker enabled:", circuitBreakerEnabled);
            
            // Save deployment info
            const deploymentInfo = {
                network: "bscTestnet",
                contractName: "OrphiCrowdFundSimplified",
                contractAddress: contractAddress,
                deployer: deployer.address,
                usdtToken: usdtAddress,
                mockUSDT: mockUSDTAddress,
                treasury: TREASURY_ADDRESS,
                emergency: EMERGENCY_ADDRESS,
                poolManager: POOL_MANAGER_ADDRESS,
                deploymentTime: new Date().toISOString(),
                gasUsed: "Estimated",
                securityFeatures: {
                    mevProtection: mevEnabled,
                    circuitBreaker: circuitBreakerEnabled,
                    timelockEnabled: true
                },
                contractSize: `${sizeInKB.toFixed(2)} KB (Simplified version used)`
            };
            
            fs.writeFileSync(
                'testnet-deployment-info.json',
                JSON.stringify(deploymentInfo, null, 2)
            );
            
            console.log("📄 Deployment info saved to testnet-deployment-info.json");
            
        } else {
            // Deploy full version if size allows
            console.log("✅ Contract size acceptable, deploying full version...");
            
            console.log("🚀 Deploying OrphiCrowdFund...");
            const orphiCrowdFund = await upgrades.deployProxy(OrphiCrowdFund, [
                usdtAddress,
                TREASURY_ADDRESS,
                EMERGENCY_ADDRESS,
                POOL_MANAGER_ADDRESS
            ], {
                initializer: 'initialize',
                kind: 'uups'
            });
            
            await orphiCrowdFund.waitForDeployment();
            const contractAddress = await orphiCrowdFund.getAddress();
            
            console.log("✅ OrphiCrowdFund deployed to:", contractAddress);
            
            // Save deployment info
            const deploymentInfo = {
                network: "bscTestnet",
                contractName: "OrphiCrowdFund",
                contractAddress: contractAddress,
                deployer: deployer.address,
                usdtToken: usdtAddress,
                mockUSDT: mockUSDTAddress,
                treasury: TREASURY_ADDRESS,
                emergency: EMERGENCY_ADDRESS,
                poolManager: POOL_MANAGER_ADDRESS,
                deploymentTime: new Date().toISOString(),
                gasUsed: "Estimated",
                contractSize: `${sizeInKB.toFixed(2)} KB`
            };
            
            fs.writeFileSync(
                'testnet-deployment-info.json',
                JSON.stringify(deploymentInfo, null, 2)
            );
        }
        
        console.log("\n🎉 TESTNET DEPLOYMENT COMPLETED SUCCESSFULLY!");
        console.log("📋 Next Steps:");
        console.log("  1. Run comprehensive security tests");
        console.log("  2. Test all new security features");
        console.log("  3. Validate gas optimization");
        console.log("  4. Test frontend integration");
        console.log("  5. Perform load testing");
        console.log("  6. Verify admin controls");
        console.log("\n⚠️  Do NOT proceed to mainnet until ALL tests pass!");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        console.error("🔧 Full error:", error);
        process.exit(1);
    }
}

// Handle deployment
main()
    .then(() => {
        console.log("✅ Deployment script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment script failed:", error);
        process.exit(1);
    });
