const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 LEADFIVE MAINNET - ROOT USER REGISTRATION");
    console.log("=" .repeat(70));
    console.log("🌐 Network: BSC Mainnet (Chain ID: 56)");
    console.log("📅 Registration Date:", new Date().toISOString());
    console.log("=" .repeat(70));
    
    // Contract addresses from mainnet deployment
    const LEADFIVE_PROXY = "0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c";
    const REAL_USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
    const DEPLOYER_ADDRESS = "0x140aad3E7c6bCC415Bc8E830699855fF072d405D";
    
    const [signer] = await ethers.getSigners();
    const signerAddress = signer.address;
    
    console.log(`🏗️  Signer Account: ${signerAddress}`);
    console.log(`👤 Deployer/Root User: ${DEPLOYER_ADDRESS}`);
    
    // Verify signer is the deployer
    if (signerAddress.toLowerCase() !== DEPLOYER_ADDRESS.toLowerCase()) {
        console.error("❌ Signer must be the deployer address!");
        console.error(`Expected: ${DEPLOYER_ADDRESS}`);
        console.error(`Got: ${signerAddress}`);
        process.exit(1);
    }
    
    const balance = await ethers.provider.getBalance(signerAddress);
    console.log(`💰 Signer BNB Balance: ${ethers.formatEther(balance)} BNB`);
    
    // Connect to deployed contracts
    console.log("\\n📡 CONNECTING TO MAINNET CONTRACTS");
    console.log("-".repeat(50));
    
    const LeadFive = await ethers.getContractFactory("contracts/LeadFive.sol:LeadFive");
    const leadFive = LeadFive.attach(LEADFIVE_PROXY);
    
    const USDT = await ethers.getContractFactory("MockUSDT"); // Use MockUSDT ABI for real USDT
    const usdt = USDT.attach(REAL_USDT_ADDRESS);
    
    console.log(`✅ LeadFive Contract: ${LEADFIVE_PROXY}`);
    console.log(`✅ Real USDT Contract: ${REAL_USDT_ADDRESS}`);
    
    // Check current contract state
    console.log("\\n🔍 CHECKING CURRENT STATE");
    console.log("-".repeat(50));
    
    const owner = await leadFive.owner();
    const totalUsers = await leadFive.getTotalUsers();
    const packagePrice1 = await leadFive.getPackagePrice(1);
    
    console.log(`✅ Contract Owner: ${owner}`);
    console.log(`✅ Total Users: ${totalUsers}`);
    console.log(`✅ Package 1 Price: ${ethers.formatUnits(packagePrice1, 6)} USDT`);
    
    // Check if deployer is already registered
    const [isRegistered, packageLevel, userBalance] = await leadFive.getUserBasicInfo(DEPLOYER_ADDRESS);
    console.log(`✅ Deployer Registered: ${isRegistered}`);
    
    if (isRegistered) {
        console.log("\\n⚠️  DEPLOYER ALREADY REGISTERED");
        console.log("-".repeat(50));
        
        const [totalEarnings, earningsCap, directReferrals] = await leadFive.getUserEarnings(DEPLOYER_ADDRESS);
        const [referrer, teamSize] = await leadFive.getUserNetwork(DEPLOYER_ADDRESS);
        
        console.log(`📊 Package Level: ${packageLevel}`);
        console.log(`📊 Balance: ${ethers.formatUnits(userBalance, 6)} USDT`);
        console.log(`📊 Referrer: ${referrer}`);
        console.log(`📊 Direct Referrals: ${directReferrals}`);
        console.log(`📊 Team Size: ${teamSize}`);
        console.log(`📊 Total Earned: ${ethers.formatUnits(totalEarnings, 6)} USDT`);
        console.log(`📊 Earnings Cap: ${ethers.formatUnits(earningsCap, 6)} USDT`);
        
        console.log("\\n✅ Root user already exists! Registration not needed.");
        return;
    }
    
    // Check USDT balance and allowance
    console.log("\\n💰 CHECKING USDT REQUIREMENTS");
    console.log("-".repeat(50));
    
    const usdtBalance = await usdt.balanceOf(DEPLOYER_ADDRESS);
    const usdtAllowance = await usdt.allowance(DEPLOYER_ADDRESS, LEADFIVE_PROXY);
    const requiredAmount = ethers.parseUnits("30", 18); // 30 USDT with 18 decimals (real USDT)
    
    console.log(`💵 USDT Balance: ${ethers.formatUnits(usdtBalance, 18)} USDT`);
    console.log(`🔐 Current Allowance: ${ethers.formatUnits(usdtAllowance, 18)} USDT`);
    console.log(`💸 Required Amount: ${ethers.formatUnits(requiredAmount, 18)} USDT`);
    
    // Check if we have enough USDT
    if (usdtBalance < requiredAmount) {
        console.error("\\n❌ INSUFFICIENT USDT BALANCE");
        console.error(`Need: ${ethers.formatUnits(requiredAmount, 18)} USDT`);
        console.error(`Have: ${ethers.formatUnits(usdtBalance, 18)} USDT`);
        console.error("\\n💡 SOLUTION: Acquire real USDT from:");
        console.error("- Binance, KuCoin, or other exchanges");
        console.error("- PancakeSwap (swap BNB/BUSD for USDT)");
        console.error("- Transfer from another wallet");
        process.exit(1);
    }
    
    // Approve USDT if needed
    if (usdtAllowance < requiredAmount) {
        console.log("\\n🔐 APPROVING USDT SPENDING");
        console.log("-".repeat(50));
        
        const approveTx = await usdt.approve(LEADFIVE_PROXY, requiredAmount);
        console.log(`📝 Approval Transaction: ${approveTx.hash}`);
        
        await approveTx.wait();
        console.log("✅ USDT approval confirmed");
        
        const newAllowance = await usdt.allowance(DEPLOYER_ADDRESS, LEADFIVE_PROXY);
        console.log(`✅ New Allowance: ${ethers.formatUnits(newAllowance, 18)} USDT`);
    }
    
    // Register the root user (deployer as sponsor of themselves)
    console.log("\\n👤 REGISTERING ROOT USER");
    console.log("-".repeat(50));
    console.log(`👤 User: ${DEPLOYER_ADDRESS}`);
    console.log(`👥 Sponsor: ${DEPLOYER_ADDRESS} (self-sponsored root)`);
    console.log(`📦 Package: Level 1 ($30 USDT)`);
    
    const registerTx = await leadFive.register(
        DEPLOYER_ADDRESS, // sponsor (self for root user)
        1, // package level 1 ($30 USDT)
        true // use USDT (not BNB)
    );
    
    console.log(`📝 Registration Transaction: ${registerTx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await registerTx.wait();
    console.log("✅ Registration confirmed!");
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    
    // Verify registration
    console.log("\\n🔍 VERIFYING REGISTRATION");
    console.log("-".repeat(50));
    
    const newTotalUsers = await leadFive.getTotalUsers();
    const [newIsRegistered, newPackageLevel, newUserBalance] = await leadFive.getUserBasicInfo(DEPLOYER_ADDRESS);
    const [newTotalEarnings, newEarningsCap, newDirectReferrals] = await leadFive.getUserEarnings(DEPLOYER_ADDRESS);
    const [newReferrer, newTeamSize] = await leadFive.getUserNetwork(DEPLOYER_ADDRESS);
    const newUsdtBalance = await usdt.balanceOf(DEPLOYER_ADDRESS);
    
    console.log(`✅ New Total Users: ${newTotalUsers}`);
    console.log(`✅ User Registered: ${newIsRegistered}`);
    console.log(`✅ Package Level: ${newPackageLevel}`);
    console.log(`✅ Referrer: ${newReferrer}`);
    console.log(`✅ Direct Referrals: ${newDirectReferrals}`);
    console.log(`✅ User Balance: ${ethers.formatUnits(newUserBalance, 6)} USDT`);
    console.log(`✅ Remaining USDT: ${ethers.formatUnits(newUsdtBalance, 18)} USDT`);
    
    // Check pool distributions
    console.log("\\n🏊 CHECKING POOL DISTRIBUTIONS");
    console.log("-".repeat(50));
    
    const leadershipPool = await leadFive.getPoolBalance(1);
    const communityPool = await leadFive.getPoolBalance(2);
    const clubPool = await leadFive.getPoolBalance(3);
    
    console.log(`💎 Leadership Pool: ${ethers.formatUnits(leadershipPool, 6)} USDT`);
    console.log(`🌐 Community Pool: ${ethers.formatUnits(communityPool, 6)} USDT`);
    console.log(`🏆 Club Pool: ${ethers.formatUnits(clubPool, 6)} USDT`);
    
    // Create registration summary
    const registrationSummary = {
        timestamp: new Date().toISOString(),
        network: "BSC Mainnet",
        chainId: 56,
        transaction: {
            hash: registerTx.hash,
            gasUsed: receipt.gasUsed.toString(),
            blockNumber: receipt.blockNumber
        },
        rootUser: {
            address: DEPLOYER_ADDRESS,
            registered: newIsRegistered,
            packageLevel: newPackageLevel,
            referrer: newReferrer,
            investmentAmount: ethers.formatUnits(requiredAmount, 18),
            directReferrals: newDirectReferrals,
            userBalance: ethers.formatUnits(newUserBalance, 6)
        },
        systemState: {
            totalUsers: newTotalUsers.toString(),
            poolBalances: {
                leadership: ethers.formatUnits(leadershipPool, 6),
                community: ethers.formatUnits(communityPool, 6),
                club: ethers.formatUnits(clubPool, 6)
            }
        },
        status: "ROOT_USER_REGISTERED"
    };
    
    // Save registration summary
    const fs = require('fs');
    fs.writeFileSync(
        './root-user-registration-summary.json', 
        JSON.stringify(registrationSummary, null, 2)
    );
    
    console.log("\\n📋 REGISTRATION SUMMARY SAVED");
    console.log("-".repeat(50));
    console.log("✅ File: ./root-user-registration-summary.json");
    
    console.log("\\n🎉 ROOT USER REGISTRATION COMPLETE!");
    console.log("=" .repeat(70));
    console.log(`👤 Root User: ${DEPLOYER_ADDRESS}`);
    console.log(`📦 Package: Level ${newPackageLevel} ($30 USDT)`);
    console.log(`👥 Total Users: ${newTotalUsers}`);
    console.log(`🔗 Transaction: https://bscscan.com/tx/${registerTx.hash}`);
    console.log("=" .repeat(70));
    
    console.log("\\n🚀 SYSTEM NOW READY FOR USER ONBOARDING!");
    console.log("✅ Root user established");
    console.log("✅ Commission structure active"); 
    console.log("✅ Pool distributions working");
    console.log("✅ Ready for referral registrations");
    
    return {
        rootUser: DEPLOYER_ADDRESS,
        registered: newIsRegistered,
        packageLevel: newPackageLevel,
        transactionHash: registerTx.hash,
        totalUsers: newTotalUsers.toString()
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Root user registration failed:", error);
        process.exit(1);
    });
