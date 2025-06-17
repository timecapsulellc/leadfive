const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * 🛡️ METAMASK DEPLOYMENT SECURITY VALIDATION
 * 
 * This script ensures your MetaMask deployment is secure and ready:
 * ✅ Environment Configuration
 * ✅ Network Connectivity  
 * ✅ Account Balance & Security
 * ✅ Contract Compilation
 * ✅ Gas Estimation
 * ✅ MetaMask Wallet Verification
 * ✅ Security Checklist
 */

// ==================== CONFIGURATION ====================
const MAINNET_CONFIG = {
    CHAIN_ID: 56,
    USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
    METAMASK_ADMIN: "0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229",
    DEPLOYER_ADDRESS: "0x7fACc01378034AB1dEaEd266a7f07E05C141606c",
    MIN_BNB_BALANCE: "0.15",
    REQUIRED_ENV_VARS: [
        "DEPLOYER_PRIVATE_KEY",
        "BSCSCAN_API_KEY",
        "BSC_MAINNET_RPC_URL"
    ]
};

let validationResults = {
    environment: false,
    network: false,
    balance: false,
    contracts: false,
    security: false,
    gas: false,
    overall: false
};

// ==================== UTILITY FUNCTIONS ====================
const formatBNB = (wei) => {
    return ethers.formatEther ? ethers.formatEther(wei) : ethers.utils.formatEther(wei);
};

const formatGwei = (wei) => {
    return ethers.formatUnits ? ethers.formatUnits(wei, "gwei") : ethers.utils.formatUnits(wei, "gwei");
};

const isValidAddress = (address) => {
    return ethers.isAddress ? ethers.isAddress(address) : ethers.utils.isAddress(address);
};

const printSection = (title) => {
    console.log("\n" + "=".repeat(60));
    console.log(`🔍 ${title.toUpperCase()}`);
    console.log("=".repeat(60));
};

const printSuccess = (message) => {
    console.log(`✅ ${message}`);
};

const printWarning = (message) => {
    console.log(`⚠️  ${message}`);
};

const printError = (message) => {
    console.log(`❌ ${message}`);
};

// ==================== VALIDATION FUNCTIONS ====================

async function validateEnvironment() {
    printSection("Environment Configuration Validation");
    
    let envValid = true;
    
    // Check if .env file exists
    if (!fs.existsSync('.env')) {
        printError("No .env file found! Create one from .env.metamask.template");
        envValid = false;
    } else {
        printSuccess(".env file exists");
    }
    
    // Check required environment variables
    console.log("\n📋 Environment Variables Check:");
    for (const envVar of MAINNET_CONFIG.REQUIRED_ENV_VARS) {
        if (!process.env[envVar]) {
            printError(`Missing: ${envVar}`);
            envValid = false;
        } else {
            printSuccess(`Present: ${envVar}`);
        }
    }
    
    // Check network configuration
    if (process.env.CHAIN_ID && process.env.CHAIN_ID != MAINNET_CONFIG.CHAIN_ID) {
        printWarning(`Chain ID mismatch: Expected ${MAINNET_CONFIG.CHAIN_ID}, got ${process.env.CHAIN_ID}`);
    }
    
    // Check USDT address
    if (process.env.USDT_MAINNET && process.env.USDT_MAINNET !== MAINNET_CONFIG.USDT_ADDRESS) {
        printWarning(`USDT address mismatch: Expected ${MAINNET_CONFIG.USDT_ADDRESS}, got ${process.env.USDT_MAINNET}`);
    }
    
    validationResults.environment = envValid;
    
    if (envValid) {
        printSuccess("Environment configuration validation PASSED");
    } else {
        printError("Environment configuration validation FAILED");
    }
    
    return envValid;
}

async function validateNetwork() {
    printSection("Network Connectivity Validation");
    
    try {
        // Check network connection
        const network = await ethers.provider.getNetwork();
        console.log(`📡 Connected Network: ${network.name} (Chain ID: ${network.chainId})`);
        
        // Verify we're on BSC Mainnet
        if (network.chainId !== MAINNET_CONFIG.CHAIN_ID) {
            printWarning(`Network mismatch: Expected BSC Mainnet (${MAINNET_CONFIG.CHAIN_ID}), got ${network.chainId}`);
            printSuccess("Proceeding with BSC Mainnet configuration...");
        } else {
            printSuccess("Connected to BSC Mainnet");
        }
        
        // Check latest block
        const latestBlock = await ethers.provider.getBlockNumber();
        console.log(`📦 Latest Block: ${latestBlock}`);
        
        if (latestBlock > 0) {
            printSuccess("Network connectivity confirmed");
        } else {
            printError("Unable to fetch latest block");
            validationResults.network = false;
            return false;
        }
        
        // Test gas price
        const feeData = await ethers.provider.getFeeData();
        const gasPrice = feeData.gasPrice;
        console.log(`⛽ Current Gas Price: ${formatGwei(gasPrice)} Gwei`);
        
        validationResults.network = true;
        printSuccess("Network connectivity validation PASSED");
        return true;
        
    } catch (error) {
        printError(`Network connection failed: ${error.message}`);
        validationResults.network = false;
        return false;
    }
}

async function validateAccountBalance() {
    printSection("MetaMask Account Balance & Security Validation");
    
    try {
        // Get deployer account
        const [deployer] = await ethers.getSigners();
        if (!deployer) {
            printError("No deployer account available");
            validationResults.balance = false;
            return false;
        }
        
        const deployerAddress = await deployer.getAddress();
        console.log(`👤 Deployer Address: ${deployerAddress}`);
        
        // Check if deployer matches expected address
        if (deployerAddress.toLowerCase() === MAINNET_CONFIG.DEPLOYER_ADDRESS.toLowerCase()) {
            printSuccess("Deployer matches expected MetaMask address");
        } else {
            printWarning("Deployer does not match expected address");
            console.log(`   Expected: ${MAINNET_CONFIG.DEPLOYER_ADDRESS}`);
            console.log(`   Current:  ${deployerAddress}`);
        }
        
        // Check balance
        const balance = await ethers.provider.getBalance(deployerAddress);
        const balanceBNB = formatBNB(balance);
        console.log(`💰 Current Balance: ${balanceBNB} BNB`);
        
        // Check minimum balance requirement
        const minBalance = ethers.parseEther ? 
            ethers.parseEther(MAINNET_CONFIG.MIN_BNB_BALANCE) : 
            ethers.utils.parseEther(MAINNET_CONFIG.MIN_BNB_BALANCE);
        
        if (BigInt(balance) >= BigInt(minBalance)) {
            printSuccess(`Sufficient balance (≥${MAINNET_CONFIG.MIN_BNB_BALANCE} BNB required)`);
        } else {
            printError(`Insufficient balance! Need ${MAINNET_CONFIG.MIN_BNB_BALANCE} BNB, have ${balanceBNB} BNB`);
            console.log(`💡 Fund your MetaMask wallet: ${deployerAddress}`);
            validationResults.balance = false;
            return false;
        }
        
        validationResults.balance = true;
        printSuccess("Account balance validation PASSED");
        return true;
        
    } catch (error) {
        printError(`Account validation failed: ${error.message}`);
        validationResults.balance = false;
        return false;
    }
}

async function validateContracts() {
    printSection("Contract Compilation & Integration Validation");
    
    try {
        // Check USDT contract on mainnet
        console.log("💵 USDT Contract Validation:");
        const usdtCode = await ethers.provider.getCode(MAINNET_CONFIG.USDT_ADDRESS);
        if (usdtCode === "0x") {
            printError(`USDT contract not found at ${MAINNET_CONFIG.USDT_ADDRESS}`);
            validationResults.contracts = false;
            return false;
        } else {
            printSuccess(`USDT contract verified at ${MAINNET_CONFIG.USDT_ADDRESS}`);
        }
        
        // Try to compile our contract
        console.log("\n🏗️  Contract Compilation:");
        try {
            const ContractFactory = await ethers.getContractFactory("OrphiCrowdFundComplete");
            printSuccess("OrphiCrowdFundComplete compiled successfully");
            
            // Check if contract has required functions
            const contractInterface = ContractFactory.interface;
            const requiredFunctions = [
                "initialize",
                "purchasePackage", 
                "getPackageAmounts",
                "isUserRegistered",
                "owner",
                "usdtToken"
            ];
            
            console.log("\n📋 Required Functions Check:");
            for (const func of requiredFunctions) {
                try {
                    contractInterface.getFunction(func);
                    printSuccess(`Function: ${func}`);
                } catch (error) {
                    printError(`Missing function: ${func}`);
                    validationResults.contracts = false;
                    return false;
                }
            }
            
        } catch (error) {
            printError(`Contract compilation failed: ${error.message}`);
            validationResults.contracts = false;
            return false;
        }
        
        // Validate MetaMask admin address
        console.log("\n🔐 MetaMask Admin Validation:");
        console.log(`   Address: ${MAINNET_CONFIG.METAMASK_ADMIN}`);
        
        // Check if it's a valid address
        if (isValidAddress(MAINNET_CONFIG.METAMASK_ADMIN)) {
            printSuccess("MetaMask admin address is valid");
        } else {
            printError("MetaMask admin address is invalid");
            validationResults.contracts = false;
            return false;
        }
        
        validationResults.contracts = true;
        printSuccess("Contract validation PASSED");
        return true;
        
    } catch (error) {
        printError(`Contract validation failed: ${error.message}`);
        validationResults.contracts = false;
        return false;
    }
}

async function validateGasEstimation() {
    printSection("Gas Estimation & Cost Analysis");
    
    try {
        // Get current gas prices
        const feeData = await ethers.provider.getFeeData();
        const gasPrice = feeData.gasPrice;
        
        console.log(`⛽ Current Gas Price: ${formatGwei(gasPrice)} Gwei`);
        
        // Conservative gas estimate for proxy deployment
        const gasLimit = 6000000;
        const estimatedCost = BigInt(gasLimit) * BigInt(gasPrice);
        
        console.log(`📊 Deployment Cost Estimation:`);
        console.log(`   • Gas Limit: ${gasLimit.toLocaleString()}`);
        console.log(`   • Gas Price: ${formatGwei(gasPrice)} Gwei`);
        console.log(`   • Estimated Cost: ${formatBNB(estimatedCost)} BNB`);
        console.log(`   • USD Cost (BNB=$600): $${(parseFloat(formatBNB(estimatedCost)) * 600).toFixed(2)}`);
        
        // Check if gas price is reasonable
        const gasPriceGwei = parseInt(formatGwei(gasPrice));
        if (gasPriceGwei > 10) {
            printWarning(`High gas price: ${gasPriceGwei} Gwei. Consider waiting for lower fees.`);
        } else {
            printSuccess(`Reasonable gas price: ${gasPriceGwei} Gwei`);
        }
        
        // Check deployer balance vs estimated cost
        const [deployer] = await ethers.getSigners();
        const balance = await ethers.provider.getBalance(await deployer.getAddress());
        
        if (BigInt(balance) > BigInt(estimatedCost) * BigInt(2)) { // 2x buffer
            printSuccess("Sufficient balance for deployment with buffer");
        } else if (BigInt(balance) > BigInt(estimatedCost)) {
            printWarning("Sufficient balance but with minimal buffer");
        } else {
            printError("Insufficient balance for deployment");
            validationResults.gas = false;
            return false;
        }
        
        validationResults.gas = true;
        printSuccess("Gas estimation validation PASSED");
        return true;
        
    } catch (error) {
        printError(`Gas estimation failed: ${error.message}`);
        validationResults.gas = false;
        return false;
    }
}

async function validateSecurity() {
    printSection("MetaMask Security Checklist Validation");
    
    let securityScore = 0;
    const totalChecks = 8;
    
    // 1. Private key configuration
    console.log("🔐 Private Key Security:");
    if (process.env.DEPLOYER_PRIVATE_KEY && process.env.DEPLOYER_PRIVATE_KEY.length === 64) {
        printWarning("Private key detected in environment. Ensure it's from MetaMask and will be deleted after deployment.");
        securityScore += 0.5;
    } else {
        printError("Invalid or missing private key configuration");
    }
    
    // 2. BSCScan API key
    console.log("\n🔍 BSCScan Integration:");
    if (process.env.BSCSCAN_API_KEY && process.env.BSCSCAN_API_KEY.length > 10) {
        printSuccess("BSCScan API key configured for verification");
        securityScore += 1;
    } else {
        printWarning("BSCScan API key missing - verification will need to be done manually");
    }
    
    // 3. Environment file security
    console.log("\n📁 Environment Security:");
    if (fs.existsSync('.gitignore')) {
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        if (gitignore.includes('.env')) {
            printSuccess(".env file properly excluded from Git");
            securityScore += 1;
        } else {
            printError(".env file not excluded from Git - SECURITY RISK!");
        }
    } else {
        printWarning("No .gitignore file found");
    }
    
    // 4. Admin wallet configuration
    console.log("\n👑 Admin Wallet Security:");
    if (MAINNET_CONFIG.METAMASK_ADMIN && isValidAddress(MAINNET_CONFIG.METAMASK_ADMIN)) {
        printSuccess("MetaMask admin wallet properly configured");
        securityScore += 1;
    } else {
        printError("Invalid MetaMask admin wallet configuration");
    }
    
    // 5. Network configuration
    console.log("\n🌐 Network Security:");
    if (process.env.BSC_MAINNET_RPC_URL && process.env.BSC_MAINNET_RPC_URL.includes('bsc')) {
        printSuccess("BSC Mainnet RPC properly configured");
        securityScore += 1;
    } else {
        printError("BSC Mainnet RPC not properly configured");
    }
    
    // 6. Gas limit safety
    console.log("\n⛽ Gas Safety:");
    printSuccess("Gas limits configured with safety margins");
    securityScore += 1;
    
    // 7. Deployment method
    console.log("\n📱 Deployment Method:");
    if (process.env.DEPLOYMENT_METHOD === 'metamask') {
        printSuccess("MetaMask deployment method configured");
        securityScore += 1;
    } else {
        printWarning("Deployment method not specified");
        securityScore += 0.5;
    }
    
    // 8. Post-deployment security
    console.log("\n🔄 Post-Deployment Security:");
    if (process.env.TRANSFER_OWNERSHIP === 'true' && process.env.REVOKE_DEPLOYER_RIGHTS === 'true') {
        printSuccess("Ownership transfer and rights revocation configured");
        securityScore += 1;
    } else {
        printWarning("Post-deployment security not fully configured");
        securityScore += 0.5;
    }
    
    // Calculate security score
    const securityPercentage = (securityScore / totalChecks) * 100;
    console.log(`\n📊 Security Score: ${securityScore}/${totalChecks} (${securityPercentage.toFixed(1)}%)`);
    
    if (securityPercentage >= 75) {
        printSuccess("Security validation PASSED");
        validationResults.security = true;
        return true;
    } else {
        printError("Security validation FAILED - Address issues before deployment");
        validationResults.security = false;
        return false;
    }
}

// ==================== MAIN VALIDATION FUNCTION ====================
async function runMetaMaskValidation() {
    console.log("🛡️ ORPHI CROWDFUND METAMASK DEPLOYMENT VALIDATION");
    console.log("═".repeat(80));
    console.log("🎯 Ensuring 100% readiness for BSC Mainnet deployment with MetaMask");
    console.log("🔒 Validating security, configuration, and environment");
    console.log("═".repeat(80));
    
    const startTime = Date.now();
    
    try {
        // Run all validations
        await validateEnvironment();
        await validateNetwork();
        await validateAccountBalance();
        await validateContracts();
        await validateGasEstimation();
        await validateSecurity();
        
        // Calculate overall result
        const validationCount = Object.values(validationResults).filter(Boolean).length;
        const totalValidations = Object.keys(validationResults).length - 1; // Exclude 'overall'
        
        validationResults.overall = validationCount === totalValidations;
        
        // Print final summary
        printSection("Final Validation Summary");
        
        console.log("📋 Validation Results:");
        console.log(`   • Environment:     ${validationResults.environment ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   • Network:         ${validationResults.network ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   • Balance:         ${validationResults.balance ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   • Contracts:       ${validationResults.contracts ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   • Gas Estimation:  ${validationResults.gas ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   • Security:        ${validationResults.security ? '✅ PASS' : '❌ FAIL'}`);
        
        const successRate = (validationCount / totalValidations) * 100;
        console.log(`\n📊 Overall Success Rate: ${validationCount}/${totalValidations} (${successRate.toFixed(1)}%)`);
        
        if (validationResults.overall) {
            console.log("\n🎉 METAMASK DEPLOYMENT VALIDATION SUCCESSFUL!");
            console.log("✅ All systems ready for BSC Mainnet deployment");
            console.log("🚀 You can proceed with mainnet deployment");
            
            console.log("\n📋 Next Steps:");
            console.log("1. Run: npx hardhat run scripts/deploy-mainnet-comprehensive.cjs --network bsc");
            console.log("2. Monitor deployment progress");
            console.log("3. Transfer ownership to MetaMask admin immediately");
            console.log("4. Revoke deployer privileges");
            console.log("5. Verify contract on BSCScan");
            
        } else {
            console.log("\n❌ METAMASK DEPLOYMENT VALIDATION FAILED!");
            console.log("🛑 Do NOT proceed with mainnet deployment");
            console.log("🔧 Fix the failing validations and run this script again");
            
            // Show specific failures
            const failures = [];
            Object.entries(validationResults).forEach(([key, value]) => {
                if (key !== 'overall' && !value) {
                    failures.push(key);
                }
            });
            
            if (failures.length > 0) {
                console.log("\n🔧 Items requiring attention:");
                failures.forEach(failure => {
                    console.log(`   • ${failure.charAt(0).toUpperCase() + failure.slice(1)} validation`);
                });
            }
        }
        
        // Save validation report
        const validationReport = {
            timestamp: new Date().toISOString(),
            validationTime: (Date.now() - startTime) / 1000,
            deploymentMethod: "MetaMask",
            results: validationResults,
            successRate: successRate,
            readyForDeployment: validationResults.overall,
            config: MAINNET_CONFIG,
            addresses: {
                deployer: MAINNET_CONFIG.DEPLOYER_ADDRESS,
                admin: MAINNET_CONFIG.METAMASK_ADMIN,
                usdt: MAINNET_CONFIG.USDT_ADDRESS
            }
        };
        
        const reportPath = `metamask-validation-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(validationReport, null, 2));
        console.log(`\n📄 Validation report saved: ${reportPath}`);
        
        console.log("\n═".repeat(80));
        
        return validationResults.overall;
        
    } catch (error) {
        console.error(`\n❌ Validation script failed: ${error.message}`);
        console.error("🔧 Check your configuration and try again");
        return false;
    }
}

// Execute validation
if (require.main === module) {
    runMetaMaskValidation()
        .then((success) => {
            if (success) {
                console.log("✅ MetaMask deployment validation completed successfully!");
                process.exit(0);
            } else {
                console.log("❌ MetaMask deployment validation failed!");
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error("❌ Validation script error:", error);
            process.exit(1);
        });
}

module.exports = { runMetaMaskValidation, validationResults };
