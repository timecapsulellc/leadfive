const { ethers } = require("hardhat");

async function main() {
    console.log("🏭 LEADFIVE MAINNET PRODUCTION MANAGEMENT");
    console.log("=" .repeat(70));
    
    // Load deployment data
    const fs = require('fs');
    let deploymentData;
    
    try {
        deploymentData = JSON.parse(fs.readFileSync('./mainnet-deployment-summary.json', 'utf8'));
    } catch (error) {
        console.error("❌ No deployment data found. Deploy to mainnet first.");
        process.exit(1);
    }
    
    const [admin] = await ethers.getSigners();
    console.log(`👑 Admin Account: ${admin.address}`);
    
    const LEADFIVE_ADDRESS = deploymentData.contracts.leadFiveProxy;
    const MOCK_USDT_ADDRESS = deploymentData.contracts.mockUSDT;
    
    // Connect to contracts
    const LeadFive = await ethers.getContractFactory("contracts/LeadFive.sol:LeadFive");
    const leadFive = LeadFive.attach(LEADFIVE_ADDRESS);
    
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = MockUSDT.attach(MOCK_USDT_ADDRESS);
    
    console.log(`\\n🔗 Connected to LeadFive: ${LEADFIVE_ADDRESS}`);
    
    // Get command line argument for operation
    const operation = process.argv[2];
    
    if (!operation) {
        console.log("\\n📋 AVAILABLE OPERATIONS:");
        console.log("-".repeat(50));
        console.log("📊 status        - Check current system status");
        console.log("🏊 distribute    - Distribute pool rewards");
        console.log("⚙️  configure    - Update system configuration");
        console.log("👥 users         - Manage users");
        console.log("💰 treasury     - Treasury management");
        console.log("🔧 maintenance  - System maintenance");
        console.log("🚨 emergency    - Emergency operations");
        console.log("\\nUsage: npx hardhat run mainnet-production-manager.cjs --network bsc -- <operation>");
        return;
    }
    
    switch (operation) {
        case "status":
            await checkSystemStatus(leadFive, mockUSDT, admin.address);
            break;
            
        case "distribute":
            await distributePoolRewards(leadFive, admin);
            break;
            
        case "configure":
            await configureSystem(leadFive, admin);
            break;
            
        case "users":
            await manageUsers(leadFive, admin);
            break;
            
        case "treasury":
            await manageTreasury(leadFive, mockUSDT, admin);
            break;
            
        case "maintenance":
            await systemMaintenance(leadFive, admin);
            break;
            
        case "emergency":
            await emergencyOperations(leadFive, admin);
            break;
            
        default:
            console.log(`❌ Unknown operation: ${operation}`);
            break;
    }
}

async function checkSystemStatus(leadFive, mockUSDT, adminAddress) {
    console.log("\\n📊 SYSTEM STATUS REPORT");
    console.log("-".repeat(50));
    
    // Basic metrics
    const totalUsers = await leadFive.getTotalUsers();
    const contractBalance = await leadFive.getContractBalance();
    
    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`💰 Contract BNB: ${ethers.formatEther(contractBalance)} BNB`);
    
    // Pool balances
    console.log("\\n🏊 Pool Balances:");
    const pools = ["Leadership", "Community", "Club"];
    for (let i = 1; i <= 3; i++) {
        const balance = await leadFive.getPoolBalance(i);
        console.log(`   ${pools[i-1]}: ${ethers.formatUnits(balance, 6)} USDT`);
    }
    
    // Admin status
    const isAdmin = await leadFive.isAdmin(adminAddress);
    console.log(`\\n👑 Admin Status: ${isAdmin ? "✅ Authorized" : "❌ Not Authorized"}`);
    
    // Security status
    const circuitBreakerTriggered = await leadFive.circuitBreakerTriggered();
    console.log(`🔒 Circuit Breaker: ${circuitBreakerTriggered ? "🚨 TRIGGERED" : "✅ Normal"}`);
    
    // Recent activity (simplified)
    console.log(`\\n📈 Recent Activity: ${totalUsers} total registrations`);
    
    console.log("\\n✅ System Status: OPERATIONAL");
}

async function distributePoolRewards(leadFive, admin) {
    console.log("\\n🏊 POOL REWARD DISTRIBUTION");
    console.log("-".repeat(50));
    
    const pools = ["Leadership", "Community", "Club"];
    
    for (let poolType = 1; poolType <= 3; poolType++) {
        const balance = await leadFive.getPoolBalance(poolType);
        
        if (balance > 0) {
            console.log(`\\n💰 Distributing ${pools[poolType-1]} Pool: ${ethers.formatUnits(balance, 6)} USDT`);
            
            try {
                const tx = await leadFive.distributePool(poolType);
                const receipt = await tx.wait();
                
                console.log(`✅ ${pools[poolType-1]} Pool distributed! Gas: ${receipt.gasUsed}`);
            } catch (error) {
                if (error.message.includes("No eligible users")) {
                    console.log(`⚠️  No eligible users for ${pools[poolType-1]} Pool`);
                } else {
                    console.log(`❌ Distribution failed: ${error.message}`);
                }
            }
        } else {
            console.log(`⚪ ${pools[poolType-1]} Pool: Empty`);
        }
    }
    
    console.log("\\n✅ Pool distribution process completed");
}

async function configureSystem(leadFive, admin) {
    console.log("\\n⚙️ SYSTEM CONFIGURATION");
    console.log("-".repeat(50));
    
    console.log("🔧 Available configurations:");
    console.log("1. Circuit breaker threshold");
    console.log("2. Daily withdrawal limit");
    console.log("3. Platform fee recipient");
    console.log("4. Add/remove admin");
    
    // Example: Update circuit breaker (can be customized)
    const newThreshold = ethers.parseEther("5"); // 5 BNB threshold
    
    try {
        const tx = await leadFive.setCircuitBreaker(newThreshold);
        await tx.wait();
        
        console.log(`✅ Circuit breaker threshold updated to ${ethers.formatEther(newThreshold)} BNB`);
    } catch (error) {
        console.log(`❌ Configuration failed: ${error.message}`);
    }
}

async function manageUsers(leadFive, admin) {
    console.log("\\n👥 USER MANAGEMENT");
    console.log("-".repeat(50));
    
    const totalUsers = await leadFive.getTotalUsers();
    console.log(`📊 Total Users: ${totalUsers}`);
    
    // Show recent users (last 10)
    console.log("\\n📋 Recent Users:");
    const startIndex = Math.max(1, Number(totalUsers) - 9);
    
    for (let i = startIndex; i <= totalUsers; i++) {
        try {
            const userAddress = await leadFive.userIds(i);
            const [isRegistered, packageLevel, balance] = await leadFive.getUserBasicInfo(userAddress);
            
            console.log(`${i}. ${userAddress} - Package ${packageLevel} - Balance: ${ethers.formatUnits(balance, 6)} USDT`);
        } catch (error) {
            console.log(`${i}. Error retrieving user data`);
        }
    }
}

async function manageTreasury(leadFive, mockUSDT, admin) {
    console.log("\\n💰 TREASURY MANAGEMENT");
    console.log("-".repeat(50));
    
    // Check contract USDT balance
    const contractUSDTBalance = await mockUSDT.balanceOf(await leadFive.getAddress());
    console.log(`💵 Contract USDT: ${ethers.formatUnits(contractUSDTBalance, 18)} USDT`);
    
    // Check BNB balance
    const contractBNBBalance = await leadFive.getContractBalance();
    console.log(`💎 Contract BNB: ${ethers.formatEther(contractBNBBalance)} BNB`);
    
    // Pool summary
    console.log("\\n🏊 Pool Summary:");
    let totalPoolBalance = BigInt(0);
    const pools = ["Leadership", "Community", "Club"];
    
    for (let i = 1; i <= 3; i++) {
        const balance = await leadFive.getPoolBalance(i);
        totalPoolBalance += balance;
        console.log(`   ${pools[i-1]}: ${ethers.formatUnits(balance, 6)} USDT`);
    }
    
    console.log(`\\n💰 Total Pool Balance: ${ethers.formatUnits(totalPoolBalance, 6)} USDT`);
    
    // Platform fees collected
    try {
        const totalFees = await leadFive.totalPlatformFeesCollected();
        console.log(`💼 Platform Fees Collected: ${ethers.formatUnits(totalFees, 6)} USDT`);
    } catch (error) {
        console.log(`💼 Platform Fees: Data not available`);
    }
}

async function systemMaintenance(leadFive, admin) {
    console.log("\\n🔧 SYSTEM MAINTENANCE");
    console.log("-".repeat(50));
    
    console.log("🔍 Running system diagnostics...");
    
    // Check circuit breaker status
    const circuitBreakerTriggered = await leadFive.circuitBreakerTriggered();
    const circuitBreakerThreshold = await leadFive.circuitBreakerThreshold();
    
    console.log(`🔒 Circuit Breaker: ${circuitBreakerTriggered ? "🚨 TRIGGERED" : "✅ Normal"}`);
    console.log(`🔒 Threshold: ${ethers.formatEther(circuitBreakerThreshold)} BNB`);
    
    // Reset circuit breaker if needed
    if (circuitBreakerTriggered) {
        console.log("\\n🔄 Resetting circuit breaker...");
        try {
            const tx = await leadFive.setCircuitBreaker(circuitBreakerThreshold);
            await tx.wait();
            console.log("✅ Circuit breaker reset successfully");
        } catch (error) {
            console.log(`❌ Reset failed: ${error.message}`);
        }
    }
    
    console.log("\\n✅ Maintenance completed");
}

async function emergencyOperations(leadFive, admin) {
    console.log("\\n🚨 EMERGENCY OPERATIONS");
    console.log("-".repeat(50));
    
    console.log("⚠️  WARNING: Emergency operations available:");
    console.log("1. Pause contract");
    console.log("2. Unpause contract");
    console.log("3. Emergency withdrawal (if circuit breaker triggered)");
    
    // Check if contract is paused
    try {
        // Test if contract is paused by trying to call a view function
        await leadFive.getTotalUsers();
        console.log("\\n✅ Contract Status: OPERATIONAL");
    } catch (error) {
        if (error.message.includes("paused")) {
            console.log("\\n🚨 Contract Status: PAUSED");
        }
    }
    
    // This section would require additional input for actual emergency actions
    console.log("\\n⚠️  Emergency actions require manual confirmation");
    console.log("Contact admin for emergency procedures");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Management operation failed:", error);
        process.exit(1);
    });
