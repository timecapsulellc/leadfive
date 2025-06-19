const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🚀 LEADFIVE MAINNET CONTRACT INITIALIZATION");
    console.log("=" * 80);
    console.log("🎯 Initializing LeadFiveModular contract on BSC Mainnet");
    console.log("📍 Contract: 0x7FEEA22942407407801cCDA55a4392f25975D998");
    console.log("🌐 Network: BSC Mainnet");

    try {
        // Get network and signer
        const [deployer] = await ethers.getSigners();
        const network = await ethers.provider.getNetwork();
        
        console.log("\n👤 Initializer Address:", deployer.address);
        console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());
        console.log("💰 Initializer Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

        const contractAddress = "0x7FEEA22942407407801cCDA55a4392f25975D998";
        const LeadFiveModular = await ethers.getContractFactory("LeadFiveModular");
        const contract = LeadFiveModular.attach(contractAddress);

        // Check if already initialized
        console.log("\n🔍 Checking initialization status...");
        
        try {
            const owner = await contract.owner();
            const totalUsers = await contract.totalUsers();
            const package1 = await contract.packages(1);
            
            console.log("📊 Current Status:");
            console.log("   Owner:", owner);
            console.log("   Total Users:", totalUsers.toString());
            console.log("   Package 1 Price:", ethers.formatEther(package1.price), "USDT");
            
            if (owner !== "0x0000000000000000000000000000000000000000" && package1.price > 0) {
                console.log("✅ Contract appears to be already initialized!");
                console.log("🎯 Skipping initialization...");
                return;
            }
        } catch (error) {
            console.log("⚠️  Could not check initialization status:", error.message);
        }

        console.log("\n🚀 Proceeding with contract initialization...");

        // Initialization parameters
        const usdtAddress = "0x55d398326f99059fF775485246999027B3197955"; // BSC Mainnet USDT
        const priceFeedAddress = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"; // BNB/USD Price Feed on BSC
        
        // Admin IDs array (16 addresses) - using deployer for all initially
        const adminIds = Array(16).fill(deployer.address);
        
        console.log("📋 Initialization Parameters:");
        console.log("   USDT Address:", usdtAddress);
        console.log("   Price Feed:", priceFeedAddress);
        console.log("   Admin Addresses: All set to", deployer.address);

        // Estimate gas for initialization
        console.log("\n⛽ Estimating gas for initialization...");
        
        try {
            const gasEstimate = await contract.initialize.estimateGas(
                usdtAddress,
                priceFeedAddress,
                adminIds
            );
            
            console.log("📊 Gas Estimate:", gasEstimate.toString());
            
            // Calculate gas cost
            const gasPrice = await ethers.provider.getFeeData();
            const gasCostWei = gasEstimate * gasPrice.gasPrice;
            const gasCostBNB = ethers.formatEther(gasCostWei);
            
            console.log("💰 Estimated Cost:", gasCostBNB, "BNB");
            
        } catch (error) {
            console.log("⚠️  Gas estimation failed:", error.message);
            console.log("🔄 Proceeding with default gas settings...");
        }

        // Execute initialization
        console.log("\n🚀 Executing contract initialization...");
        
        const initTx = await contract.initialize(
            usdtAddress,
            priceFeedAddress,
            adminIds,
            {
                gasLimit: 2000000, // 2M gas limit for safety
                gasPrice: ethers.parseUnits("3", "gwei") // 3 gwei gas price
            }
        );

        console.log("📝 Transaction Hash:", initTx.hash);
        console.log("⏳ Waiting for confirmation...");

        const receipt = await initTx.wait();
        
        console.log("✅ Initialization Transaction Confirmed!");
        console.log("📊 Transaction Details:");
        console.log("   Block Number:", receipt.blockNumber);
        console.log("   Gas Used:", receipt.gasUsed.toString());
        console.log("   Gas Price:", ethers.formatUnits(receipt.gasPrice || 0, "gwei"), "gwei");
        console.log("   Transaction Fee:", ethers.formatEther(receipt.gasUsed * (receipt.gasPrice || 0)), "BNB");

        // Verify initialization
        console.log("\n🔍 Verifying initialization...");
        
        const newOwner = await contract.owner();
        const newTotalUsers = await contract.totalUsers();
        const newPackage1 = await contract.packages(1);
        const newPackage2 = await contract.packages(2);
        const newPackage3 = await contract.packages(3);
        const newPackage4 = await contract.packages(4);
        
        console.log("✅ Post-Initialization Status:");
        console.log("   Owner:", newOwner);
        console.log("   Total Users:", newTotalUsers.toString());
        console.log("   Package Prices:");
        console.log("     Package 1: $" + ethers.formatEther(newPackage1.price));
        console.log("     Package 2: $" + ethers.formatEther(newPackage2.price));
        console.log("     Package 3: $" + ethers.formatEther(newPackage3.price));
        console.log("     Package 4: $" + ethers.formatEther(newPackage4.price));

        // Verify expected values
        const expectedPrices = ["30.0", "50.0", "100.0", "200.0"];
        const actualPrices = [
            ethers.formatEther(newPackage1.price),
            ethers.formatEther(newPackage2.price),
            ethers.formatEther(newPackage3.price),
            ethers.formatEther(newPackage4.price)
        ];

        const pricesCorrect = expectedPrices.every((expected, index) => expected === actualPrices[index]);
        
        if (pricesCorrect) {
            console.log("✅ Package prices correctly initialized!");
        } else {
            console.log("❌ Package prices mismatch!");
            console.log("   Expected:", expectedPrices.join(", "));
            console.log("   Actual:", actualPrices.join(", "));
        }

        // Check admin fee recipient
        const adminFeeInfo = await contract.getAdminFeeInfo();
        console.log("📊 Admin Fee Configuration:");
        console.log("   Recipient:", adminFeeInfo[0]);
        console.log("   Total Collected:", ethers.formatEther(adminFeeInfo[1]), "USDT");
        console.log("   Fee Rate:", adminFeeInfo[2].toString(), "basis points");

        // Check pool balances
        const poolBalances = await contract.getPoolBalances();
        console.log("🏊 Pool Balances:");
        console.log("   Leader Pool:", ethers.formatEther(poolBalances[0]), "USDT");
        console.log("   Help Pool:", ethers.formatEther(poolBalances[1]), "USDT");
        console.log("   Club Pool:", ethers.formatEther(poolBalances[2]), "USDT");

        console.log("\n" + "=" * 80);
        console.log("🎉 CONTRACT INITIALIZATION COMPLETE!");
        console.log("=" * 80);
        
        console.log("📍 Contract Address: 0x7FEEA22942407407801cCDA55a4392f25975D998");
        console.log("🔍 BSCScan: https://bscscan.com/address/0x7FEEA22942407407801cCDA55a4392f25975D998");
        console.log("👤 Owner:", newOwner);
        console.log("💰 Package Prices: $30, $50, $100, $200");
        console.log("🎯 Status: READY FOR USER REGISTRATION!");

        // Save initialization results
        const initResults = {
            timestamp: new Date().toISOString(),
            contractAddress: contractAddress,
            network: "BSC Mainnet",
            chainId: 56,
            transactionHash: initTx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            owner: newOwner,
            totalUsers: newTotalUsers.toString(),
            packagePrices: actualPrices,
            adminFeeRate: adminFeeInfo[2].toString(),
            poolBalances: {
                leader: ethers.formatEther(poolBalances[0]),
                help: ethers.formatEther(poolBalances[1]),
                club: ethers.formatEther(poolBalances[2])
            }
        };

        const fs = require('fs');
        fs.writeFileSync(
            'mainnet-initialization-results.json',
            JSON.stringify(initResults, null, 2)
        );

        console.log("📄 Initialization results saved to: mainnet-initialization-results.json");

    } catch (error) {
        console.error("❌ Contract initialization failed:", error);
        
        if (error.message.includes("already initialized")) {
            console.log("ℹ️  Contract is already initialized - this is expected!");
        } else {
            console.error("🚨 Critical initialization error:", error.message);
            process.exit(1);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
