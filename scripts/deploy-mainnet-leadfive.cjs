// SPDX-License-Identifier: MIT
/**
 * @title BSC Mainnet LeadFive Deployment Script
 * @dev Comprehensive mainnet deployment with all libraries and admin rights setup
 * @notice This script deploys all required libraries and LeadFive main contract to BSC Mainnet
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 LEADFIVE BSC MAINNET DEPLOYMENT");
    console.log("=" .repeat(80));
    console.log("⚠️ DEPLOYING TO PRODUCTION MAINNET! ⚠️");
    console.log("=" .repeat(80));
    
    const [deployer] = await ethers.getSigners();
    const deployerAddress = deployer.address;
    
    console.log("\n📋 DEPLOYMENT DETAILS:");
    console.log(`Deployer Address: ${deployerAddress}`);
    console.log(`Network: BSC Mainnet (Chain ID: 56)`);
    console.log(`Expected Address: 0x140aad3E7c6bCC415Bc8E830699855fF072d405D`);
    
    // Verify deployer address matches expected
    if (deployerAddress !== "0x140aad3E7c6bCC415Bc8E830699855fF072d405D") {
        throw new Error(`❌ Deployer address mismatch! Expected: 0x140aad3E7c6bCC415Bc8E830699855fF072d405D, Got: ${deployerAddress}`);
    }
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployerAddress);
    console.log(`BNB Balance: ${ethers.formatEther(balance)} BNB`);
    
    if (balance < ethers.parseEther("0.1")) {
        throw new Error("❌ Insufficient BNB balance for deployment! Need at least 0.1 BNB");
    }
    
    // Mainnet contract addresses
    const MAINNET_USDT = "0x55d398326f99059fF775485246999027B3197955";
    const MAINNET_PRICE_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"; // BNB/USD
    
    console.log(`\n📊 MAINNET CONTRACTS:`);
    console.log(`USDT Token: ${MAINNET_USDT}`);
    console.log(`Price Feed: ${MAINNET_PRICE_FEED}`);
    
    const deploymentResults = {
        network: "BSC Mainnet",
        chainId: 56,
        deployer: deployerAddress,
        timestamp: new Date().toISOString(),
        contracts: {},
        libraries: {},
        gasUsed: {},
        totalGasUsed: 0,
        estimatedCostBNB: 0
    };
    
    console.log("\n📚 DEPLOYING REQUIRED LIBRARIES...");
    console.log("-" .repeat(50));
    
    // Deploy all required libraries in order
    const libraries = [
        "ConstantsLib",
        "DataStructures", 
        "OracleManagementLib",
        "WithdrawalSafetyLib",
        "UserManagementLib",
        "ReferralLib",
        "MatrixManagementLib",
        "PoolDistributionLib",
        "BonusDistributionLib",
        "LeaderPoolLib",
        "MatrixRewardsLib",
        "ViewFunctionsLib",
        "BusinessLogicLib",
        "AdvancedFeaturesLib",
        "CoreOperationsLib"
    ];
    
    const libraryAddresses = {};
    
    for (const libName of libraries) {
        try {
            console.log(`\n🔧 Deploying ${libName}...`);
            const LibraryFactory = await ethers.getContractFactory(libName);
            const library = await LibraryFactory.deploy();
            await library.waitForDeployment();
            
            const libAddress = await library.getAddress();
            libraryAddresses[libName] = libAddress;
            
            // Wait for confirmations
            await library.deploymentTransaction().wait(2);
            
            const gasUsed = (await library.deploymentTransaction().wait()).gasUsed;
            deploymentResults.libraries[libName] = libAddress;
            deploymentResults.gasUsed[libName] = gasUsed.toString();
            deploymentResults.totalGasUsed += Number(gasUsed);
            
            console.log(`✅ ${libName} deployed at: ${libAddress}`);
            console.log(`⛽ Gas used: ${gasUsed.toString()}`);
            
        } catch (error) {
            console.error(`❌ Failed to deploy ${libName}:`, error.message);
            throw error;
        }
    }
    
    console.log("\n✅ ALL LIBRARIES DEPLOYED SUCCESSFULLY!");
    console.log(`📊 Total libraries: ${Object.keys(libraryAddresses).length}`);
    
    // Deploy main LeadFive contract with library linking
    console.log("\n🏗️ DEPLOYING MAIN LEADFIVE CONTRACT...");
    console.log("-" .repeat(50));
    
    try {
        const LeadFive = await ethers.getContractFactory("LeadFive", {
            libraries: libraryAddresses
        });
        
        console.log("📦 Deploying LeadFive with proxy pattern...");
        
        // Deploy with proxy pattern for upgradeability
        const leadFive = await hre.upgrades.deployProxy(
            LeadFive,
            [MAINNET_USDT, MAINNET_PRICE_FEED],
            {
                initializer: "initialize",
                kind: "uups",
                unsafeAllowLinkedLibraries: true
            }
        );
        
        await leadFive.waitForDeployment();
        const contractAddress = await leadFive.getAddress();
        
        console.log(`✅ LeadFive deployed at: ${contractAddress}`);
        
        // Wait for confirmations
        console.log("⏳ Waiting for block confirmations...");
        const deployTx = await leadFive.deploymentTransaction().wait(3);
        
        deploymentResults.contracts.LeadFive = contractAddress;
        deploymentResults.gasUsed.LeadFive = deployTx.gasUsed.toString();
        deploymentResults.totalGasUsed += Number(deployTx.gasUsed);
        
        // Get implementation address
        const implementationAddress = await hre.upgrades.erc1967.getImplementationAddress(contractAddress);
        deploymentResults.contracts.LeadFiveImplementation = implementationAddress;
        
        console.log(`🔧 Implementation Address: ${implementationAddress}`);
        
    } catch (error) {
        console.error("❌ Failed to deploy LeadFive contract:", error.message);
        throw error;
    }
    
    // Verify all admin settings and permissions
    console.log("\n🔐 VERIFYING ADMIN RIGHTS AND PERMISSIONS:");
    console.log("-" .repeat(50));
    
    const leadFive = await ethers.getContractAt("LeadFive", deploymentResults.contracts.LeadFive, {
        libraries: libraryAddresses
    });
    
    try {
        // Check owner
        const owner = await leadFive.owner();
        console.log(`Contract Owner: ${owner}`);
        
        if (owner.toLowerCase() !== deployerAddress.toLowerCase()) {
            console.log("⚠️ Owner mismatch detected! This should not happen with proxy deployment.");
            throw new Error("Owner verification failed!");
        } else {
            console.log("✅ Owner correctly set to deployer");
        }
        
        // Check USDT and Price Feed setup
        const usdtAddress = await leadFive.usdt();
        const priceFeedAddress = await leadFive.priceFeed();
        
        console.log(`USDT Token: ${usdtAddress} ${usdtAddress === MAINNET_USDT ? '✅' : '❌'}`);
        console.log(`Price Feed: ${priceFeedAddress} ${priceFeedAddress === MAINNET_PRICE_FEED ? '✅' : '❌'}`);
        
        // Test admin functions
        console.log("\n� TESTING ADMIN FUNCTIONS:");
        
        // Test pause/unpause (admin function)
        try {
            await leadFive.pause.staticCall();
            console.log("✅ Pause function accessible");
        } catch (error) {
            console.log("❌ Pause function test failed:", error.message);
        }
        
        // Check packages
        console.log("\n📦 PACKAGE VERIFICATION:");
        for (let i = 1; i <= 8; i++) {
            try {
                const packageInfo = await leadFive.packages(i);
                if (packageInfo.price > 0) {
                    console.log(`Package ${i}: ${ethers.formatEther(packageInfo.price)} USDT ✅`);
                }
            } catch (error) {
                console.log(`Package ${i}: Not configured`);
            }
        }
        
    } catch (error) {
        console.error("❌ Admin verification failed:", error.message);
        throw error;
    }
    
    // Calculate total deployment cost
    const gasPrice = (await ethers.provider.getFeeData()).gasPrice;
    const totalCostWei = BigInt(deploymentResults.totalGasUsed) * gasPrice;
    const totalCostBNB = ethers.formatEther(totalCostWei);
    deploymentResults.estimatedCostBNB = totalCostBNB;
    
    console.log("\n💰 DEPLOYMENT COST SUMMARY:");
    console.log(`Total Gas Used: ${deploymentResults.totalGasUsed.toLocaleString()}`);
    console.log(`Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
    console.log(`Total Cost: ${totalCostBNB} BNB`);
    
    // Save deployment results
    const resultsFile = "deployment-mainnet-results.json";
    deploymentResults.bscscanUrls = {
        contract: `https://bscscan.com/address/${deploymentResults.contracts.LeadFive}`,
        writeContract: `https://bscscan.com/address/${deploymentResults.contracts.LeadFive}#writeContract`,
        implementation: `https://bscscan.com/address/${deploymentResults.contracts.LeadFiveImplementation}`
    };
    
    fs.writeFileSync(resultsFile, JSON.stringify(deploymentResults, null, 2));
    
    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=" .repeat(80));
    console.log(`📍 Contract Address: ${deploymentResults.contracts.LeadFive}`);
    console.log(`🔧 Implementation: ${deploymentResults.contracts.LeadFiveImplementation}`);
    console.log(`👤 Owner: ${deployerAddress}`);
    console.log(`💾 Results saved to: ${resultsFile}`);
    console.log(`🔍 View on BSCScan: ${deploymentResults.bscscanUrls.contract}`);
    console.log(`✏️ Write Contract: ${deploymentResults.bscscanUrls.writeContract}`);
    console.log("=" .repeat(80));
    
    console.log("\n📝 NEXT STEPS:");
    console.log("1. Verify contract on BSCScan using the implementation address");
    console.log("2. Update frontend with the new contract address");
    console.log("3. Test contract functions on mainnet with small amounts");
    console.log("4. Update documentation with mainnet addresses");
    console.log("5. Begin user onboarding and monitoring");
    
    return deploymentResults;
}
            "OracleManagementLib",
            "MatrixManagementLib",
            "PoolDistributionLib",
            "WithdrawalSafetyLib",
            "AdvancedFeaturesLib",
            "LeaderPoolLib",
            "MatrixRewardsLib",
            "ViewFunctionsLib",
            "ReferralLib"
        ];
        
        const deployedLibraries = {};
        
        for (const libName of libraries) {
            try {
                console.log(`  Deploying ${libName}...`);
                const Library = await ethers.getContractFactory(libName);
                const library = await Library.deploy();
                await library.waitForDeployment();
                
                const address = await library.getAddress();
                deployedLibraries[libName] = address;
                console.log(`  ✅ ${libName} deployed at: ${address}`);
            } catch (error) {
                console.log(`  ℹ️  ${libName} may not need deployment or has dependencies`);
            }
        }
        
        console.log("\n🏗️  DEPLOYING LEADFIVE CONTRACT...");
        
        // Prepare library links for LeadFive contract
        const libraryLinks = {};
        for (const [name, address] of Object.entries(deployedLibraries)) {
            libraryLinks[`contracts/libraries/${name}.sol:${name}`] = address;
        }
        
        // Deploy LeadFive contract
        const LeadFive = await ethers.getContractFactory("LeadFive", {
            libraries: libraryLinks
        });
        
        console.log("Deploying LeadFive as upgradeable proxy...");
        const leadFive = await upgrades.deployProxy(
            LeadFive,
            [USDT_ADDRESS, PRICE_FEED_ADDRESS],
            { 
                initializer: 'initialize',
                kind: 'uups',
                libraries: libraryLinks
            }
        );
        
        await leadFive.waitForDeployment();
        const contractAddress = await leadFive.getAddress();
        
        console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
        console.log("=" .repeat(60));
        console.log("📋 CONTRACT DETAILS:");
        console.log("• LeadFive Address:", contractAddress);
        console.log("• Implementation Address:", await upgrades.erc1967.getImplementationAddress(contractAddress));
        console.log("• Admin Address:", await upgrades.erc1967.getAdminAddress(contractAddress));
        
        console.log("\n🔧 SETTING UP ADMIN RIGHTS...");
        
        // Set admin fee recipient to deployer
        try {
            console.log("Setting admin fee recipient...");
            const setRecipientTx = await leadFive.setAdminFeeRecipient(deployer.address);
            await setRecipientTx.wait();
            console.log("✅ Admin fee recipient set to:", deployer.address);
        } catch (error) {
            console.log("⚠️  Admin fee recipient may already be set");
        }
        
        // Verify admin permissions
        console.log("\n🔍 VERIFYING ADMIN PERMISSIONS...");
        try {
            const owner = await leadFive.owner();
            console.log("✅ Contract Owner:", owner);
            console.log("✅ Owner matches deployer:", owner.toLowerCase() === deployer.address.toLowerCase());
            
            // Check if deployer is in admin list
            const adminIds = await leadFive.getAllAdmins();
            let deployerIsAdmin = false;
            for (let i = 0; i < adminIds.length; i++) {
                if (adminIds[i].toLowerCase() === deployer.address.toLowerCase()) {
                    deployerIsAdmin = true;
                    break;
                }
            }
            console.log("✅ Deployer in admin list:", deployerIsAdmin);
            
        } catch (error) {
            console.log("⚠️  Could not verify all admin permissions:", error.message);
        }
        
        console.log("\n📊 CONTRACT VERIFICATION:");
        
        // Test basic contract functions
        try {
            const packageInfo = await leadFive.packages(1);
            console.log("✅ Package 1 price:", ethers.formatEther(packageInfo.price), "USDT");
            
            const totalUsers = await leadFive.totalUsers();
            console.log("✅ Total users:", totalUsers.toString());
            
            const poolBalances = await leadFive.getPoolBalances();
            console.log("✅ Pool balances:", {
                leader: ethers.formatEther(poolBalances[0]),
                help: ethers.formatEther(poolBalances[1]),
                club: ethers.formatEther(poolBalances[2])
            });
            
        } catch (error) {
            console.log("⚠️  Contract verification error:", error.message);
        }
        
        console.log("\n💰 POST-DEPLOYMENT BALANCE:");
        const finalBalance = await ethers.provider.getBalance(deployer.address);
        console.log("Deployer balance:", ethers.formatEther(finalBalance), "BNB");
        console.log("Gas used:", ethers.formatEther(balance - finalBalance), "BNB");
        
        console.log("\n📝 UPDATE YOUR .ENV FILE:");
        console.log("VITE_CONTRACT_ADDRESS=" + contractAddress);
        console.log("MAINNET_CONTRACT_ADDRESS=" + contractAddress);
        
        console.log("\n🔗 CONTRACT VERIFICATION COMMAND:");
        console.log(`npx hardhat verify --network bscMainnet ${contractAddress} "${USDT_ADDRESS}" "${PRICE_FEED_ADDRESS}"`);
        
        console.log("\n🎯 NEXT STEPS:");
        console.log("1. Update .env file with new contract address");
        console.log("2. Verify contract on BSCScan");
        console.log("3. Test contract functions");
        console.log("4. Update frontend configuration");
        console.log("5. Begin user registration testing");
        
        // Save deployment information
        const deploymentInfo = {
            network: "BSC Mainnet",
            contractAddress: contractAddress,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            gasUsed: ethers.formatEther(balance - finalBalance),
            usdtAddress: USDT_ADDRESS,
            priceFeedAddress: PRICE_FEED_ADDRESS,
            libraries: deployedLibraries
        };
        
        console.log("\n💾 DEPLOYMENT INFO SAVED");
        console.log("Details:", JSON.stringify(deploymentInfo, null, 2));
        
        return {
            contractAddress,
            deployedLibraries,
            deploymentInfo
        };
        
    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED:");
        console.error("Error:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.error("\n💡 SOLUTION: Add more BNB to your wallet");
            console.error("   Minimum required: ~0.1 BNB");
        } else if (error.message.includes("nonce")) {
            console.error("\n💡 SOLUTION: Wait a moment and try again");
        } else if (error.message.includes("gas")) {
            console.error("\n💡 SOLUTION: Increase gas limit or gas price");
        }
        
        process.exit(1);
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then((results) => {
            console.log("\n✅ Deployment script completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n❌ Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = main;
