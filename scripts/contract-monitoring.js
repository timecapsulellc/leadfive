const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * 📊 ORPHI CROWDFUND CONTRACT MONITORING SCRIPT
 * 
 * This script provides real-time monitoring of the deployed contract:
 * 📈 Transaction Activity
 * 👥 User Registration Stats
 * 💰 Financial Metrics
 * 🔄 Commission Tracking
 * ⚠️ Security Alerts
 * 📊 Performance Analytics
 */

// ==================== CONFIGURATION ====================
const MONITORING_CONFIG = {
    // Contract addresses (will be updated after deployment)
    CONTRACT_ADDRESS: process.env.DEPLOYED_CONTRACT_ADDRESS || null,
    USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
    
    // Monitoring intervals
    REAL_TIME_INTERVAL: 30000,    // 30 seconds
    SUMMARY_INTERVAL: 300000,     // 5 minutes
    DAILY_REPORT_INTERVAL: 86400000, // 24 hours
    
    // Alert thresholds
    HIGH_ACTIVITY_THRESHOLD: 10,   // transactions per minute
    LARGE_TRANSACTION_THRESHOLD: 1000, // USDT
    
    // Monitoring duration
    MAX_MONITORING_TIME: 3600000,  // 1 hour default
};

let monitoringData = {
    startTime: null,
    totalTransactions: 0,
    totalUsers: 0,
    totalVolume: 0,
    packageSales: [0, 0, 0, 0],
    commissionsEarned: 0,
    lastActivity: null,
    alerts: []
};

// ==================== UTILITY FUNCTIONS ====================
const formatUSDT = (amount) => {
    return ethers.utils ? ethers.utils.formatUnits(amount, 6) : ethers.formatUnits(amount, 6);
};

const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
};

const printHeader = (title) => {
    console.log("\n" + "=".repeat(60));
    console.log(`📊 ${title.toUpperCase()}`);
    console.log("=".repeat(60));
};

const printMetric = (label, value, unit = "") => {
    console.log(`   • ${label}: ${value}${unit}`);
};

const saveMonitoringReport = () => {
    const timestamp = Date.now();
    const report = {
        ...monitoringData,
        timestamp: new Date(timestamp).toISOString(),
        monitoringDuration: timestamp - monitoringData.startTime
    };
    
    const filename = `monitoring-report-${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📄 Monitoring report saved: ${filename}`);
};

// ==================== CONTRACT INTERACTION ====================
async function getContractInstance(contractAddress) {
    try {
        const contract = await ethers.getContractAt("OrphiCrowdFundComplete", contractAddress);
        
        // Verify contract is accessible
        await contract.owner();
        
        return contract;
    } catch (error) {
        throw new Error(`Failed to connect to contract: ${error.message}`);
    }
}

// ==================== REAL-TIME MONITORING ====================
async function fetchCurrentStats(contract) {
    try {
        // Get basic stats
        const totalMembers = await contract.totalMembers();
        const owner = await contract.owner();
        const usdtToken = await contract.usdtToken();
        
        // Get package amounts
        const packageAmounts = await contract.getPackageAmounts();
        
        // Get current block info
        const currentBlock = await ethers.provider.getBlockNumber();
        const blockInfo = await ethers.provider.getBlock(currentBlock);
        
        return {
            totalMembers: parseInt(totalMembers.toString()),
            owner,
            usdtToken,
            packageAmounts: packageAmounts.map(p => parseInt(p.toString())),
            currentBlock,
            blockTimestamp: blockInfo.timestamp,
            networkGasPrice: await ethers.provider.getGasPrice()
        };
        
    } catch (error) {
        console.error(`⚠️  Error fetching stats: ${error.message}`);
        return null;
    }
}

async function monitorEvents(contract, fromBlock) {
    try {
        // Get all events from the last few blocks
        const toBlock = await ethers.provider.getBlockNumber();
        const events = [];
        
        // Note: Event monitoring would be implemented based on actual contract events
        // For now, we'll monitor basic activity
        
        return {
            newTransactions: 0,
            newRegistrations: 0,
            packagePurchases: [0, 0, 0, 0],
            commissions: 0
        };
        
    } catch (error) {
        console.error(`⚠️  Error monitoring events: ${error.message}`);
        return null;
    }
}

// ==================== ACTIVITY ANALYSIS ====================
async function analyzeActivity(contract) {
    try {
        const currentStats = await fetchCurrentStats(contract);
        
        if (!currentStats) return;
        
        // Update monitoring data
        const now = Date.now();
        if (!monitoringData.startTime) {
            monitoringData.startTime = now;
        }
        
        // Calculate metrics
        const runtime = (now - monitoringData.startTime) / 1000 / 60; // minutes
        const avgTransactionsPerMinute = runtime > 0 ? monitoringData.totalTransactions / runtime : 0;
        
        console.log("\n📊 REAL-TIME ACTIVITY ANALYSIS");
        console.log(`🕐 Time: ${formatTime(now)}`);
        console.log(`⏱️  Runtime: ${runtime.toFixed(1)} minutes`);
        
        printMetric("Current Block", currentStats.currentBlock);
        printMetric("Total Members", currentStats.totalMembers);
        printMetric("Avg Tx/Min", avgTransactionsPerMinute.toFixed(2));
        
        // Gas price analysis
        const gasPriceGwei = ethers.utils.formatUnits(currentStats.networkGasPrice, "gwei");
        printMetric("Gas Price", `${parseFloat(gasPriceGwei).toFixed(1)} Gwei`);
        
        // Package price display
        console.log("\n💰 Package Prices:");
        currentStats.packageAmounts.forEach((amount, index) => {
            const priceUSD = amount / 1000000;
            printMetric(`Package ${index + 1}`, `$${priceUSD} USDT`);
        });
        
        // Activity alerts
        if (avgTransactionsPerMinute > MONITORING_CONFIG.HIGH_ACTIVITY_THRESHOLD) {
            const alert = `🚨 HIGH ACTIVITY: ${avgTransactionsPerMinute.toFixed(2)} tx/min`;
            console.log(alert);
            monitoringData.alerts.push({ time: now, message: alert });
        }
        
        monitoringData.lastActivity = now;
        
    } catch (error) {
        console.error(`❌ Activity analysis failed: ${error.message}`);
    }
}

// ==================== FINANCIAL MONITORING ====================
async function monitorFinancials(contract) {
    try {
        console.log("\n💰 FINANCIAL METRICS");
        
        // Note: These would be implemented based on actual contract state variables
        // For now, we'll show placeholder metrics
        
        printMetric("Total Volume", `$${monitoringData.totalVolume.toLocaleString()} USDT`);
        printMetric("Total Commissions", `$${monitoringData.commissionsEarned.toLocaleString()} USDT`);
        
        console.log("\n📦 Package Sales:");
        const packageNames = ["Starter ($30)", "Basic ($50)", "Premium ($100)", "Elite ($200)"];
        monitoringData.packageSales.forEach((sales, index) => {
            printMetric(packageNames[index], sales);
        });
        
    } catch (error) {
        console.error(`❌ Financial monitoring failed: ${error.message}`);
    }
}

// ==================== SECURITY MONITORING ====================
async function monitorSecurity(contract) {
    try {
        console.log("\n🛡️ SECURITY STATUS");
        
        // Check contract owner
        const owner = await contract.owner();
        const expectedOwner = "0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229";
        
        if (owner.toLowerCase() === expectedOwner.toLowerCase()) {
            printMetric("Owner Status", "✅ SECURE (Trezor wallet)");
        } else {
            const alert = `⚠️  Owner changed to: ${owner}`;
            console.log(alert);
            monitoringData.alerts.push({ time: Date.now(), message: alert });
        }
        
        // Check if contract is paused
        try {
            const isPaused = await contract.paused();
            printMetric("Contract Status", isPaused ? "⏸️  PAUSED" : "▶️  ACTIVE");
        } catch (error) {
            printMetric("Contract Status", "❓ Unknown");
        }
        
        // Check USDT integration
        const usdtToken = await contract.usdtToken();
        const expectedUSDT = "0x55d398326f99059fF775485246999027B3197955";
        
        if (usdtToken.toLowerCase() === expectedUSDT.toLowerCase()) {
            printMetric("USDT Integration", "✅ VERIFIED");
        } else {
            const alert = `⚠️  USDT address changed to: ${usdtToken}`;
            console.log(alert);
            monitoringData.alerts.push({ time: Date.now(), message: alert });
        }
        
    } catch (error) {
        console.error(`❌ Security monitoring failed: ${error.message}`);
    }
}

// ==================== PERFORMANCE MONITORING ====================
async function monitorPerformance() {
    try {
        console.log("\n⚡ PERFORMANCE METRICS");
        
        // Network performance
        const latestBlock = await ethers.provider.getBlockNumber();
        const blockInfo = await ethers.provider.getBlock(latestBlock);
        
        printMetric("Latest Block", latestBlock);
        printMetric("Block Time", formatTime(blockInfo.timestamp * 1000));
        
        // Calculate block time
        if (latestBlock > 1) {
            const prevBlockInfo = await ethers.provider.getBlock(latestBlock - 1);
            const blockTime = blockInfo.timestamp - prevBlockInfo.timestamp;
            printMetric("Block Interval", `${blockTime}s`);
        }
        
        // Response time test
        const startTime = Date.now();
        await ethers.provider.getBlockNumber();
        const responseTime = Date.now() - startTime;
        
        printMetric("RPC Response", `${responseTime}ms`);
        
        if (responseTime > 5000) {
            const alert = `⚠️  Slow RPC response: ${responseTime}ms`;
            console.log(alert);
            monitoringData.alerts.push({ time: Date.now(), message: alert });
        }
        
    } catch (error) {
        console.error(`❌ Performance monitoring failed: ${error.message}`);
    }
}

// ==================== ALERT SYSTEM ====================
function displayAlerts() {
    if (monitoringData.alerts.length === 0) return;
    
    console.log("\n🚨 ALERTS SUMMARY");
    
    // Show recent alerts (last 10)
    const recentAlerts = monitoringData.alerts.slice(-10);
    recentAlerts.forEach((alert, index) => {
        console.log(`${index + 1}. [${formatTime(alert.time)}] ${alert.message}`);
    });
    
    if (monitoringData.alerts.length > 10) {
        console.log(`... and ${monitoringData.alerts.length - 10} older alerts`);
    }
}

// ==================== SUMMARY REPORTING ====================
function displaySummary() {
    printHeader("Monitoring Summary");
    
    const runtime = monitoringData.startTime ? 
        (Date.now() - monitoringData.startTime) / 1000 / 60 : 0;
    
    console.log("\n📊 SESSION SUMMARY:");
    printMetric("Monitoring Time", `${runtime.toFixed(1)} minutes`);
    printMetric("Total Alerts", monitoringData.alerts.length);
    printMetric("Last Activity", monitoringData.lastActivity ? 
        formatTime(monitoringData.lastActivity) : "None");
    
    displayAlerts();
}

// ==================== MAIN MONITORING LOOP ====================
async function startMonitoring(contractAddress, duration = MONITORING_CONFIG.MAX_MONITORING_TIME) {
    console.log("📊 ORPHI CROWDFUND CONTRACT MONITORING");
    console.log("═".repeat(80));
    console.log(`📍 Contract: ${contractAddress}`);
    console.log(`⏱️  Duration: ${duration / 1000 / 60} minutes`);
    console.log(`🔄 Update Interval: ${MONITORING_CONFIG.REAL_TIME_INTERVAL / 1000}s`);
    console.log("═".repeat(80));
    
    let contract;
    
    try {
        // Initialize contract connection
        contract = await getContractInstance(contractAddress);
        console.log("✅ Connected to contract successfully");
        
        // Verify contract details
        const owner = await contract.owner();
        const usdtToken = await contract.usdtToken();
        
        console.log(`👑 Owner: ${owner}`);
        console.log(`💵 USDT: ${usdtToken}`);
        
    } catch (error) {
        console.error(`❌ Failed to initialize monitoring: ${error.message}`);
        return false;
    }
    
    // Start monitoring loop
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    console.log("\n🚀 Starting real-time monitoring...");
    console.log("Press Ctrl+C to stop monitoring\n");
    
    const monitoringInterval = setInterval(async () => {
        try {
            // Check if monitoring should continue
            if (Date.now() >= endTime) {
                console.log("⏰ Monitoring duration completed");
                clearInterval(monitoringInterval);
                displaySummary();
                saveMonitoringReport();
                return;
            }
            
            // Run monitoring functions
            await analyzeActivity(contract);
            await monitorFinancials(contract);
            await monitorSecurity(contract);
            await monitorPerformance();
            
            console.log("\n" + "-".repeat(60));
            
        } catch (error) {
            console.error(`⚠️  Monitoring cycle error: ${error.message}`);
        }
    }, MONITORING_CONFIG.REAL_TIME_INTERVAL);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log("\n🛑 Monitoring interrupted by user");
        clearInterval(monitoringInterval);
        displaySummary();
        saveMonitoringReport();
        process.exit(0);
    });
    
    return true;
}

// ==================== COMMAND LINE INTERFACE ====================
async function main() {
    const args = process.argv.slice(2);
    let contractAddress = MONITORING_CONFIG.CONTRACT_ADDRESS;
    let duration = MONITORING_CONFIG.MAX_MONITORING_TIME;
    
    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--address' && args[i + 1]) {
            contractAddress = args[i + 1];
            i++;
        } else if (args[i] === '--duration' && args[i + 1]) {
            duration = parseInt(args[i + 1]) * 1000 * 60; // Convert minutes to milliseconds
            i++;
        } else if (ethers.utils.isAddress(args[i])) {
            contractAddress = args[i];
        }
    }
    
    if (!contractAddress) {
        console.error("❌ No contract address provided!");
        console.error("Usage: node contract-monitoring.js --address <contract_address> [--duration <minutes>]");
        console.error("Example: node contract-monitoring.js --address 0x123... --duration 60");
        process.exit(1);
    }
    
    if (!ethers.utils.isAddress(contractAddress)) {
        console.error(`❌ Invalid contract address: ${contractAddress}`);
        process.exit(1);
    }
    
    // Start monitoring
    const success = await startMonitoring(contractAddress, duration);
    
    if (!success) {
        process.exit(1);
    }
}

// Execute monitoring
if (require.main === module) {
    main().catch((error) => {
        console.error("💥 Fatal monitoring error:", error);
        process.exit(1);
    });
}

module.exports = { startMonitoring, monitoringData };
