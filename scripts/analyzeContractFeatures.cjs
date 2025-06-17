// Complete Contract Feature Analysis
// Lists all available functions and features in the deployed OrphiCrowdFund contract

const { ethers } = require("hardhat");
require('dotenv').config();

async function analyzeContractFeatures() {
    console.log("📊 ORPHI CROWDFUND - COMPLETE FEATURE ANALYSIS");
    console.log("==============================================");
    
    // Get contract instance
    const contractAddress = process.env.ORPHI_MAINNET_PROXY;
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
    const contract = OrphiCrowdFund.attach(contractAddress);
    
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Network: BSC Mainnet (Chain ID: 56)`);
    console.log(`Block Explorer: https://bscscan.com/address/${contractAddress}\n`);
    
    const features = {
        core: [],
        user: [],
        financial: [],
        admin: [],
        security: [],
        analytics: [],
        limitations: []
    };
    
    try {
        console.log("🔍 ANALYZING CONTRACT INTERFACE...\n");
        
        // ==================== CORE FUNCTIONS ====================
        console.log("1️⃣ CORE REGISTRATION & USER MANAGEMENT");
        console.log("=========================================");
        
        try {
            // Test register function
            const registerInterface = contract.interface.fragments.find(f => f.name === 'register');
            if (registerInterface) {
                features.core.push("✅ User Registration (sponsor, tier)");
                console.log("✅ register(address sponsor, uint8 tier) - User registration with sponsor and tier");
            }
        } catch (e) {
            features.limitations.push("❌ User registration function not available");
        }
        
        try {
            // Test users function
            const testUser = await contract.users(ethers.constants.AddressZero);
            features.core.push("✅ User Data Retrieval");
            console.log("✅ users(address) - Get complete user information");
            console.log("   Returns: isRegistered, sponsor, tier, investment, earnings, withdrawable, etc.");
        } catch (e) {
            features.limitations.push("❌ User data function limited");
        }
        
        try {
            // Test total users
            const totalUsers = await contract.totalUsers();
            features.analytics.push("✅ Total Users Count");
            console.log(`✅ totalUsers() - Current: ${totalUsers.toString()}`);
        } catch (e) {
            features.limitations.push("❌ Total users tracking not available");
        }
        
        try {
            // Test registration status
            const regOpen = await contract.registrationOpen();
            features.admin.push("✅ Registration Control");
            console.log(`✅ registrationOpen() - Current: ${regOpen}`);
        } catch (e) {
            console.log("⚠️ registrationOpen() - Function may not exist");
        }
        
        // ==================== FINANCIAL FUNCTIONS ====================
        console.log("\n2️⃣ FINANCIAL & WITHDRAWAL SYSTEM");
        console.log("===================================");
        
        try {
            // Test withdraw function
            const withdrawInterface = contract.interface.fragments.find(f => f.name === 'withdraw');
            if (withdrawInterface) {
                features.financial.push("✅ Earnings Withdrawal");
                console.log("✅ withdraw() - Withdraw available earnings");
            }
        } catch (e) {
            features.limitations.push("❌ Withdrawal function not available");
        }
        
        try {
            // Test total investments
            const totalInvestments = await contract.totalInvestments();
            features.analytics.push("✅ Total Investment Tracking");
            console.log(`✅ totalInvestments() - Current: ${ethers.utils.formatUnits(totalInvestments, 18)} USDT`);
        } catch (e) {
            features.limitations.push("❌ Investment tracking not available");
        }
        
        // Test package system
        try {
            // Try different package functions
            let packageSystemAvailable = false;
            
            try {
                const pkg1 = await contract.getPackageAmount(1);
                features.financial.push("✅ Dynamic Package System");
                console.log(`✅ getPackageAmount(tier) - Tier 1: ${ethers.utils.formatUnits(pkg1, 18)} USDT`);
                packageSystemAvailable = true;
            } catch (e) {
                // Try alternative package function
                try {
                    const pkgPrice = await contract.packagePrices(1);
                    features.financial.push("✅ Fixed Package Prices");
                    console.log(`✅ packagePrices(tier) - Available`);
                    packageSystemAvailable = true;
                } catch (e2) {
                    features.limitations.push("❌ Package pricing system not available");
                }
            }
            
            if (packageSystemAvailable) {
                // Test multiple tiers
                for (let tier = 1; tier <= 8; tier++) {
                    try {
                        const amount = await contract.getPackageAmount(tier);
                        console.log(`   Tier ${tier}: ${ethers.utils.formatUnits(amount, 18)} USDT`);
                    } catch (e) {
                        // Try alternative
                        try {
                            const amount = await contract.packagePrices(tier);
                            console.log(`   Tier ${tier}: ${ethers.utils.formatUnits(amount, 18)} USDT`);
                        } catch (e2) {
                            console.log(`   Tier ${tier}: Not configured`);
                        }
                    }
                }
            }
        } catch (e) {
            console.log("⚠️ Package system analysis failed");
        }
        
        // ==================== ADMIN & SECURITY ====================
        console.log("\n3️⃣ ADMIN & SECURITY FEATURES");
        console.log("==============================");
        
        try {
            // Test owner function
            const owner = await contract.owner();
            features.admin.push("✅ Contract Ownership");
            console.log(`✅ owner() - Current owner: ${owner}`);
        } catch (e) {
            features.limitations.push("❌ Ownership function not available");
        }
        
        try {
            // Test pause functionality
            const paused = await contract.paused();
            features.security.push("✅ Emergency Pause System");
            console.log(`✅ paused() - Current: ${paused ? 'PAUSED' : 'ACTIVE'}`);
        } catch (e) {
            features.limitations.push("❌ Pause functionality not available");
        }
        
        try {
            // Test role-based access
            const defaultAdminRole = await contract.DEFAULT_ADMIN_ROLE();
            const hasRole = await contract.hasRole(defaultAdminRole, await contract.owner());
            features.security.push("✅ Role-Based Access Control");
            console.log(`✅ hasRole() - RBAC system available`);
            console.log(`   Owner has admin role: ${hasRole}`);
        } catch (e) {
            features.limitations.push("❌ RBAC system limited or not available");
        }
        
        // Test for additional admin roles
        const rolesToCheck = [
            'ADMIN_ROLE', 'DISTRIBUTOR_ROLE', 'PLATFORM_ROLE', 'AUDIT_ROLE',
            'EMERGENCY_ROLE', 'TREASURY_ROLE', 'POOL_MANAGER_ROLE', 'ORACLE_ROLE'
        ];
        
        let availableRoles = [];
        for (const role of rolesToCheck) {
            try {
                await contract[role]();
                availableRoles.push(role);
            } catch (e) {
                // Role doesn't exist
            }
        }
        
        if (availableRoles.length > 0) {
            features.admin.push(`✅ Multiple Admin Roles (${availableRoles.length})`);
            console.log(`✅ Available Roles: ${availableRoles.join(', ')}`);
        }
        
        // ==================== REFERRAL & NETWORK ====================
        console.log("\n4️⃣ REFERRAL & NETWORK SYSTEM");
        console.log("==============================");
        
        try {
            // Test direct referrals
            const referrals = await contract.getDirectReferrals(ethers.constants.AddressZero);
            features.user.push("✅ Direct Referral Tracking");
            console.log("✅ getDirectReferrals(address) - Get user's direct referrals");
        } catch (e) {
            features.limitations.push("❌ Direct referral tracking not available");
        }
        
        // Test binary tree functions
        try {
            // Check for binary tree structure
            const testUser = await contract.users(ethers.constants.AddressZero);
            if (testUser.leftChild !== undefined || testUser.rightChild !== undefined) {
                features.user.push("✅ Binary Tree Structure");
                console.log("✅ Binary Tree - Left/Right child tracking in user data");
            }
        } catch (e) {
            console.log("⚠️ Binary tree structure analysis failed");
        }
        
        // ==================== COMPENSATION & BONUSES ====================
        console.log("\n5️⃣ COMPENSATION & BONUS SYSTEM");
        console.log("================================");
        
        // Test for various bonus systems
        const bonusFunctions = [
            'distributeDirectBonus', 'distributeLevelBonus', 'distributeGHPBonus',
            'distributeLeaderBonus', 'distributeClubPoolBonus'
        ];
        
        let availableBonuses = [];
        for (const func of bonusFunctions) {
            try {
                const funcInterface = contract.interface.fragments.find(f => f.name === func);
                if (funcInterface) {
                    availableBonuses.push(func);
                }
            } catch (e) {
                // Function doesn't exist
            }
        }
        
        if (availableBonuses.length > 0) {
            features.financial.push(`✅ Bonus Distribution System (${availableBonuses.length} types)`);
            console.log(`✅ Available Bonus Functions: ${availableBonuses.join(', ')}`);
        } else {
            features.limitations.push("❌ Automated bonus distribution not available");
            console.log("❌ No automated bonus distribution functions found");
        }
        
        // ==================== ORACLE & PRICING ====================
        console.log("\n6️⃣ ORACLE & DYNAMIC PRICING");
        console.log("=============================");
        
        try {
            const oracleEnabled = await contract.oracleEnabled();
            const priceOracle = await contract.priceOracle();
            
            if (priceOracle && priceOracle !== ethers.constants.AddressZero) {
                features.financial.push("✅ Oracle Integration");
                console.log(`✅ Oracle Address: ${priceOracle}`);
                console.log(`✅ Oracle Enabled: ${oracleEnabled}`);
            } else {
                features.limitations.push("❌ Oracle not configured");
                console.log("❌ Oracle integration not configured");
            }
        } catch (e) {
            features.limitations.push("❌ Oracle system not available");
            console.log("❌ Oracle system not available");
        }
        
        // ==================== ADDITIONAL FEATURES ====================
        console.log("\n7️⃣ ADDITIONAL FEATURES");
        console.log("=======================");
        
        // Test upgrade functionality
        try {
            const implementation = await contract.implementation();
            features.security.push("✅ Upgradeable Contract (UUPS)");
            console.log(`✅ Upgradeable Contract - Implementation: ${implementation}`);
        } catch (e) {
            try {
                // Alternative method to check upgradeability
                const version = await contract.version();
                features.security.push("✅ Versioned Contract");
                console.log(`✅ Contract Version: ${version}`);
            } catch (e2) {
                console.log("⚠️ Upgrade functionality check failed");
            }
        }
        
        // Test USDT integration
        try {
            const usdtToken = await contract.usdtToken();
            if (usdtToken && usdtToken !== ethers.constants.AddressZero) {
                features.financial.push("✅ USDT Integration");
                console.log(`✅ USDT Token: ${usdtToken}`);
            }
        } catch (e) {
            console.log("⚠️ USDT integration check failed");
        }
        
    } catch (error) {
        console.error("❌ Error during analysis:", error.message);
        return;
    }
    
    // ==================== SUMMARY REPORT ====================
    console.log("\n📋 COMPLETE FEATURE SUMMARY");
    console.log("============================");
    
    console.log("\n🏗️ CORE FEATURES:");
    features.core.forEach(feature => console.log(`  ${feature}`));
    
    console.log("\n👤 USER MANAGEMENT:");
    features.user.forEach(feature => console.log(`  ${feature}`));
    
    console.log("\n💰 FINANCIAL SYSTEM:");
    features.financial.forEach(feature => console.log(`  ${feature}`));
    
    console.log("\n🔐 ADMIN & CONTROL:");
    features.admin.forEach(feature => console.log(`  ${feature}`));
    
    console.log("\n🛡️ SECURITY FEATURES:");
    features.security.forEach(feature => console.log(`  ${feature}`));
    
    console.log("\n📊 ANALYTICS & DATA:");
    features.analytics.forEach(feature => console.log(`  ${feature}`));
    
    console.log("\n⚠️ LIMITATIONS & MISSING:");
    features.limitations.forEach(limitation => console.log(`  ${limitation}`));
    
    // Calculate feature score
    const totalImplemented = features.core.length + features.user.length + 
                           features.financial.length + features.admin.length + 
                           features.security.length + features.analytics.length;
    const totalLimitations = features.limitations.length;
    
    console.log("\n🎯 FEATURE ANALYSIS:");
    console.log("====================");
    console.log(`✅ Implemented Features: ${totalImplemented}`);
    console.log(`❌ Missing/Limited: ${totalLimitations}`);
    
    const completeness = totalLimitations > 0 ? 
        ((totalImplemented / (totalImplemented + totalLimitations)) * 100).toFixed(1) : 100;
    
    console.log(`📊 Implementation Completeness: ${completeness}%`);
    
    if (completeness >= 80) {
        console.log("🚀 STATUS: COMPREHENSIVE - Most features available");
    } else if (completeness >= 60) {
        console.log("👍 STATUS: FUNCTIONAL - Core features available");
    } else if (completeness >= 40) {
        console.log("⚡ STATUS: BASIC - Essential features only");
    } else {
        console.log("⚠️ STATUS: LIMITED - Many features missing");
    }
    
    console.log("\n📝 TESTING RECOMMENDATIONS:");
    console.log("============================");
    console.log("1. Test all ✅ features thoroughly");
    console.log("2. Verify USDT integration and approvals");
    console.log("3. Test user registration and withdrawal flows");
    console.log("4. Verify admin controls and security features");
    console.log("5. Check referral tracking and network building");
    
    if (totalLimitations > 0) {
        console.log("6. Consider implementing missing ❌ features if needed");
        console.log("7. Plan for feature upgrades if requirements change");
    }
}

// Run the analysis
analyzeContractFeatures()
    .then(() => {
        console.log("\n✅ Contract feature analysis completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Analysis failed:", error);
        process.exit(1);
    });
