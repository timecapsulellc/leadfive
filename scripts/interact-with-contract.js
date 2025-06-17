const { ethers } = require("hardhat");
const fs = require("fs");

async function interactWithContract() {
    console.log("🔗 ORPHI CROWDFUND CONTRACT INTERACTION TOOL\n");

    // Load deployment info
    let deploymentInfo;
    try {
        deploymentInfo = JSON.parse(fs.readFileSync("deployment-info.json", "utf8"));
    } catch (error) {
        console.log("❌ No deployment info found. Please run deployment first.");
        return;
    }

    const [deployer, user1, user2] = await ethers.getSigners();
    
    // Get contract instances
    const orphiContract = await ethers.getContractAt("OrphiCrowdFund", deploymentInfo.contracts.OrphiCrowdFund);
    const mockUSDT = await ethers.getContractAt("MockUSDT", deploymentInfo.contracts.MockUSDT);
    const mockOracle = await ethers.getContractAt("MockPriceOracle", deploymentInfo.contracts.MockOracle);

    console.log("📋 Contract Information:");
    console.log("OrphiCrowdFund:", deploymentInfo.contracts.OrphiCrowdFund);
    console.log("Mock USDT:", deploymentInfo.contracts.MockUSDT);
    console.log("Mock Oracle:", deploymentInfo.contracts.MockOracle);

    // Interactive menu
    while (true) {
        console.log("\n🎯 ORPHI CROWDFUND INTERACTION MENU:");
        console.log("1. 📊 View Contract Statistics");
        console.log("2. 👤 Register New User");
        console.log("3. 💰 Check User Info");
        console.log("4. 💸 Withdraw Earnings");
        console.log("5. 🏦 Distribute Global Help Pool");
        console.log("6. 📦 View Package Information");
        console.log("7. 👥 View Network Tree");
        console.log("8. 🔐 Admin Functions");
        console.log("9. ⬆️  Upgrade Functions");
        console.log("10. 🔮 Oracle Functions");
        console.log("0. ❌ Exit");

        const choice = await askQuestion("\nEnter your choice (0-10): ");

        switch (choice) {
            case "1":
                await viewContractStats(orphiContract);
                break;
            case "2":
                await registerNewUser(orphiContract, mockUSDT, deployer);
                break;
            case "3":
                await checkUserInfo(orphiContract);
                break;
            case "4":
                await withdrawEarnings(orphiContract);
                break;
            case "5":
                await distributeGlobalHelpPool(orphiContract);
                break;
            case "6":
                await viewPackageInfo(orphiContract);
                break;
            case "7":
                await viewNetworkTree(orphiContract);
                break;
            case "8":
                await adminFunctions(orphiContract);
                break;
            case "9":
                await upgradeFunctions(orphiContract);
                break;
            case "10":
                await oracleFunctions(mockOracle);
                break;
            case "0":
                console.log("👋 Goodbye!");
                return;
            default:
                console.log("❌ Invalid choice. Please try again.");
        }
    }
}

async function viewContractStats(contract) {
    console.log("\n📊 CONTRACT STATISTICS:");
    try {
        const stats = await contract.getContractStats();
        console.log("Total Users:", stats._totalUsers.toString());
        console.log("Total Investment:", ethers.utils.formatEther(stats._totalInvestment), "ETH");
        console.log("Total Withdrawn:", ethers.utils.formatEther(stats._totalWithdrawn), "ETH");
        console.log("Global Help Pool Balance:", ethers.utils.formatEther(stats._ghpBalance), "ETH");
        console.log("Leader Pool Balance:", ethers.utils.formatEther(stats._leaderPoolBalance), "ETH");

        // Get additional info
        const constants = await contract.constants();
        console.log("\n📐 Contract Constants:");
        console.log("Basis Points:", constants[0].toString());
        console.log("Upgrade Delay:", constants[1].toString(), "seconds");

        const implementation = await contract.getImplementation();
        console.log("Current Implementation:", implementation);

    } catch (error) {
        console.log("❌ Error viewing stats:", error.message);
    }
}

async function registerNewUser(contract, mockUSDT, deployer) {
    console.log("\n👤 REGISTER NEW USER:");
    
    try {
        const userAddress = await askQuestion("Enter user address (or press Enter for user1): ");
        const referrerAddress = await askQuestion("Enter referrer address (or press Enter for deployer): ");
        const packageTier = await askQuestion("Enter package tier (0-7): ");

        const finalUserAddress = userAddress || (await ethers.getSigners())[1].address;
        const finalReferrerAddress = referrerAddress || deployer.address;
        const tier = parseInt(packageTier);

        if (tier < 0 || tier > 7) {
            console.log("❌ Invalid package tier. Must be 0-7.");
            return;
        }

        // Get package info
        const packageInfo = await contract.getPackage(tier);
        console.log(`\n📦 Package ${tier} Info:`);
        console.log("Amount:", ethers.utils.formatEther(packageInfo.amount), "ETH");
        console.log("USDT Amount:", ethers.utils.formatEther(packageInfo.usdtAmount), "USDT");
        console.log("BNB Amount:", ethers.utils.formatEther(packageInfo.bnbAmount), "BNB");

        // Setup USDT for user
        console.log("💰 Setting up USDT for user...");
        await mockUSDT.mint(finalUserAddress, packageInfo.usdtAmount);
        
        const userSigner = await ethers.getSigner(finalUserAddress);
        await mockUSDT.connect(userSigner).approve(contract.address, packageInfo.usdtAmount);

        // Register user
        console.log("📝 Registering user...");
        await contract.connect(userSigner).contribute(finalReferrerAddress, tier);

        console.log("✅ User registered successfully!");
        console.log("User:", finalUserAddress);
        console.log("Referrer:", finalReferrerAddress);
        console.log("Package Tier:", tier);

    } catch (error) {
        console.log("❌ Error registering user:", error.message);
    }
}

async function checkUserInfo(contract) {
    console.log("\n👤 CHECK USER INFO:");
    
    try {
        const userAddress = await askQuestion("Enter user address: ");
        
        if (!ethers.utils.isAddress(userAddress)) {
            console.log("❌ Invalid address format.");
            return;
        }

        const userInfo = await contract.getUser(userAddress);
        console.log("\n📋 User Information:");
        console.log("Registered:", userInfo.isRegistered);
        console.log("Active:", userInfo.isActive);
        console.log("Sponsor:", userInfo.sponsor);
        console.log("Current Tier:", userInfo.currentTier);
        console.log("Total Investment:", ethers.utils.formatEther(userInfo.totalInvestment), "ETH");
        console.log("Total Earnings:", ethers.utils.formatEther(userInfo.totalEarnings), "ETH");
        console.log("Withdrawable Balance:", ethers.utils.formatEther(userInfo.withdrawableBalance), "ETH");
        console.log("Direct Referrals:", userInfo.directReferrals.toString());
        console.log("Team Size:", userInfo.teamSize.toString());
        console.log("Registration Time:", new Date(userInfo.registrationTime * 1000).toLocaleString());

        // Get additional info using interface functions
        const earnings = await contract.getUserEarnings(userAddress);
        console.log("\n💰 Earnings Details:");
        console.log("Total Earnings:", ethers.utils.formatEther(earnings[0]), "ETH");
        console.log("Withdrawable:", ethers.utils.formatEther(earnings[1]), "ETH");
        console.log("Total Investment:", ethers.utils.formatEther(earnings[2]), "ETH");

        const leaderInfo = await contract.getLeaderInfo(userAddress);
        console.log("\n👑 Leader Info:");
        console.log("Direct Referrals:", leaderInfo[0].toString());
        console.log("Team Size:", leaderInfo[1].toString());
        console.log("Team Volume:", ethers.utils.formatEther(leaderInfo[2]), "ETH");

        const referrals = await contract.getDirectReferrals(userAddress);
        console.log("\n👥 Direct Referrals:", referrals.length);
        if (referrals.length > 0) {
            console.log("Referrals List:", referrals.slice(0, 5)); // Show first 5
        }

    } catch (error) {
        console.log("❌ Error checking user info:", error.message);
    }
}

async function withdrawEarnings(contract) {
    console.log("\n💸 WITHDRAW EARNINGS:");
    
    try {
        const userAddress = await askQuestion("Enter user address: ");
        
        if (!ethers.utils.isAddress(userAddress)) {
            console.log("❌ Invalid address format.");
            return;
        }

        const userInfo = await contract.getUser(userAddress);
        const withdrawable = userInfo.withdrawableBalance;
        
        console.log("💰 Current withdrawable balance:", ethers.utils.formatEther(withdrawable), "ETH");
        
        if (withdrawable.eq(0)) {
            console.log("❌ No balance to withdraw.");
            return;
        }

        // Calculate withdrawal rate based on direct referrals
        const directReferrals = userInfo.directReferrals;
        let withdrawalRate;
        if (directReferrals >= 20) {
            withdrawalRate = 80;
        } else if (directReferrals >= 5) {
            withdrawalRate = 75;
        } else {
            withdrawalRate = 70;
        }

        const withdrawAmount = withdrawable.mul(withdrawalRate).div(100);
        const reinvestAmount = withdrawable.sub(withdrawAmount);

        console.log(`\n📊 Withdrawal Details (${withdrawalRate}% rate):`);
        console.log("Withdrawal Amount:", ethers.utils.formatEther(withdrawAmount), "ETH");
        console.log("Reinvest Amount:", ethers.utils.formatEther(reinvestAmount), "ETH");

        const confirm = await askQuestion("Proceed with withdrawal? (y/n): ");
        if (confirm.toLowerCase() !== 'y') {
            console.log("❌ Withdrawal cancelled.");
            return;
        }

        const userSigner = await ethers.getSigner(userAddress);
        await contract.connect(userSigner).withdraw();

        console.log("✅ Withdrawal successful!");

    } catch (error) {
        console.log("❌ Error withdrawing earnings:", error.message);
    }
}

async function distributeGlobalHelpPool(contract) {
    console.log("\n🏦 DISTRIBUTE GLOBAL HELP POOL:");
    
    try {
        const stats = await contract.getContractStats();
        const ghpBalance = stats._ghpBalance;
        
        console.log("💰 Current GHP Balance:", ethers.utils.formatEther(ghpBalance), "ETH");
        
        if (ghpBalance.eq(0)) {
            console.log("❌ No balance to distribute.");
            return;
        }

        const confirm = await askQuestion("Proceed with GHP distribution? (y/n): ");
        if (confirm.toLowerCase() !== 'y') {
            console.log("❌ Distribution cancelled.");
            return;
        }

        await contract.distributeGlobalHelpPool();
        console.log("✅ Global Help Pool distributed successfully!");

    } catch (error) {
        console.log("❌ Error distributing GHP:", error.message);
    }
}

async function viewPackageInfo(contract) {
    console.log("\n📦 PACKAGE INFORMATION:");
    
    try {
        for (let i = 0; i < 8; i++) {
            const pkg = await contract.getPackage(i);
            console.log(`\nPackage ${i}:`);
            console.log("  Amount:", ethers.utils.formatEther(pkg.amount), "ETH");
            console.log("  USDT Amount:", ethers.utils.formatEther(pkg.usdtAmount), "USDT");
            console.log("  BNB Amount:", ethers.utils.formatEther(pkg.bnbAmount), "BNB");
            console.log("  Active:", pkg.isActive);
        }
    } catch (error) {
        console.log("❌ Error viewing package info:", error.message);
    }
}

async function viewNetworkTree(contract) {
    console.log("\n👥 NETWORK TREE:");
    
    try {
        const userAddress = await askQuestion("Enter user address to view their network: ");
        
        if (!ethers.utils.isAddress(userAddress)) {
            console.log("❌ Invalid address format.");
            return;
        }

        const referrals = await contract.getDirectReferrals(userAddress);
        console.log(`\n👤 ${userAddress} has ${referrals.length} direct referrals:`);
        
        for (let i = 0; i < Math.min(referrals.length, 10); i++) {
            const referral = referrals[i];
            const referralInfo = await contract.getUser(referral);
            console.log(`  ${i + 1}. ${referral} (Tier: ${referralInfo.currentTier}, Investment: ${ethers.utils.formatEther(referralInfo.totalInvestment)} ETH)`);
        }

        if (referrals.length > 10) {
            console.log(`  ... and ${referrals.length - 10} more`);
        }

    } catch (error) {
        console.log("❌ Error viewing network tree:", error.message);
    }
}

async function adminFunctions(contract) {
    console.log("\n🔐 ADMIN FUNCTIONS:");
    console.log("1. Pause Contract");
    console.log("2. Unpause Contract");
    console.log("3. Register Root User");
    console.log("4. View Role Info");
    
    const choice = await askQuestion("Choose admin function (1-4): ");
    
    try {
        switch (choice) {
            case "1":
                await contract.pause();
                console.log("✅ Contract paused.");
                break;
            case "2":
                await contract.unpause();
                console.log("✅ Contract unpaused.");
                break;
            case "3":
                await contract.registerRootUser();
                console.log("✅ Root user registered.");
                break;
            case "4":
                const adminRole = await contract.ADMIN_ROLE();
                const pauserRole = await contract.PAUSER_ROLE();
                const upgraderRole = await contract.UPGRADER_ROLE();
                console.log("Admin Role:", adminRole);
                console.log("Pauser Role:", pauserRole);
                console.log("Upgrader Role:", upgraderRole);
                break;
            default:
                console.log("❌ Invalid choice.");
        }
    } catch (error) {
        console.log("❌ Error executing admin function:", error.message);
    }
}

async function upgradeFunctions(contract) {
    console.log("\n⬆️ UPGRADE FUNCTIONS:");
    
    try {
        const pendingUpgrades = await contract.getPendingUpgrades();
        console.log("Pending Upgrades:", pendingUpgrades.length);
        
        if (pendingUpgrades.length > 0) {
            console.log("Pending Upgrade IDs:", pendingUpgrades);
        }

        const proxyAdmin = await contract.getProxyAdmin();
        console.log("Proxy Admin:", proxyAdmin);

    } catch (error) {
        console.log("❌ Error viewing upgrade info:", error.message);
    }
}

async function oracleFunctions(oracle) {
    console.log("\n🔮 ORACLE FUNCTIONS:");
    
    try {
        const currentPrice = await oracle.getPrice();
        console.log("Current BNB/USD Price:", ethers.utils.formatEther(currentPrice), "USD");
        
        const newPrice = await askQuestion("Enter new price (or press Enter to skip): ");
        if (newPrice) {
            const priceInWei = ethers.utils.parseEther(newPrice);
            await oracle.setPrice(priceInWei);
            console.log("✅ Price updated to:", newPrice, "USD");
        }

    } catch (error) {
        console.log("❌ Error with oracle functions:", error.message);
    }
}

// Helper function for user input
function askQuestion(question) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        readline.question(question, (answer) => {
            readline.close();
            resolve(answer);
        });
    });
}

if (require.main === module) {
    interactWithContract()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = interactWithContract;
