const { ethers } = require("hardhat");

/**
 * Quick Security Feature Check for Deployed Contract
 * Verifies what security features are available in the deployed contract
 */
async function main() {
    console.log("🔍 Checking Security Features in Deployed Contract...");
    
    const contractAddress = "0x2A5CDeEc5dF5AE5137AF46920b2B4C4Aa9b0aEA0";
    console.log("📋 Contract Address:", contractAddress);
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("👤 Testing with account:", deployer.address);
    
    try {
        // Try connecting with different contract interfaces
        console.log("\n🔗 Attempting to connect to contract...");
        
        // Try OrphiCrowdFundSimplified first (latest with security features)
        try {
            const SimplifiedContract = await ethers.getContractFactory("OrphiCrowdFundSimplified");
            const contract = SimplifiedContract.attach(contractAddress);
            
            console.log("✅ Connected with OrphiCrowdFundSimplified interface");
            
            // Test security features
            console.log("\n🔒 Testing Security Features:");
            
            try {
                const mevEnabled = await contract.mevProtectionEnabled();
                console.log("  MEV Protection:", mevEnabled);
            } catch (e) {
                console.log("  MEV Protection: Not available");
            }
            
            try {
                const circuitBreakerEnabled = await contract.circuitBreakerEnabled();
                console.log("  Circuit Breaker:", circuitBreakerEnabled);
            } catch (e) {
                console.log("  Circuit Breaker: Not available");
            }
            
            try {
                const paused = await contract.paused();
                console.log("  Contract Paused:", paused);
            } catch (e) {
                console.log("  Pause Function: Not available");
            }
            
            try {
                const version = await contract.version();
                console.log("  Contract Version:", version);
            } catch (e) {
                console.log("  Version: Not available");
            }
            
        } catch (error) {
            console.log("❌ OrphiCrowdFundSimplified interface failed");
            
            // Try original OrphiCrowdFund interface
            try {
                const OriginalContract = await ethers.getContractFactory("OrphiCrowdFund");
                const contract = OriginalContract.attach(contractAddress);
                
                console.log("✅ Connected with OrphiCrowdFund interface");
                
                // Test basic functions
                console.log("\n📊 Testing Basic Functions:");
                
                try {
                    const totalUsers = await contract.totalUsers();
                    console.log("  Total Users:", totalUsers.toString());
                } catch (e) {
                    console.log("  Total Users: Error -", e.message);
                }
                
                try {
                    const packageAmounts = await contract.getPackageAmounts();
                    console.log("  Package Amounts:", packageAmounts.map(p => ethers.formatUnits(p, 6)));
                } catch (e) {
                    console.log("  Package Amounts: Error -", e.message);
                }
                
            } catch (error2) {
                console.log("❌ OrphiCrowdFund interface also failed");
                console.log("🔧 Contract may need redeployment with latest security features");
            }
        }
        
    } catch (error) {
        console.error("❌ Connection failed:", error.message);
    }
    
    console.log("\n📋 Next Steps:");
    console.log("  1. If security features not available, deploy new contract");
    console.log("  2. If contract working, proceed with comprehensive testing");
    console.log("  3. Verify all security enhancements are active");
}

main()
    .then(() => {
        console.log("\n✅ Security check completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Security check failed:", error);
        process.exit(1);
    });
