const { ethers, upgrades } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🚀 DEPLOYING LEADFIVE TO BSC TESTNET WITH LIBRARIES");
    console.log("=" .repeat(80));
    
    const [deployer] = await ethers.getSigners();
    const deployerAddress = deployer.address;
    
    console.log("📋 DEPLOYMENT DETAILS:");
    console.log(`Deployer: ${deployerAddress}`);
    console.log(`Network: BSC Testnet (Chain ID: 97)`);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployerAddress);
    console.log(`BNB Balance: ${ethers.formatEther(balance)} BNB`);
    
    if (balance < ethers.parseEther("0.05")) {
        throw new Error("❌ Insufficient BNB balance for deployment! Need at least 0.05 BNB");
    }
    
    // Testnet contract addresses
    const TESTNET_USDT = process.env.MOCK_USDT_ADDRESS || "0x00175c710A7448920934eF830f2F22D6370E0642";
    const TESTNET_PRICE_FEED = process.env.MOCK_PRICEFEED_ADDRESS || "0xb4BCe54d31B49CAF37A4a8C9Eb3AC333A7Ee7766";
    
    console.log(`\n📊 TESTNET CONTRACTS:`);
    console.log(`Mock USDT: ${TESTNET_USDT}`);
    console.log(`Mock Price Feed: ${TESTNET_PRICE_FEED}`);
    
    const deploymentResults = {
        network: "BSC Testnet",
        chainId: 97,
        deployer: deployerAddress,
        timestamp: new Date().toISOString(),
        contracts: {},
        libraries: {},
        gasUsed: {},
        totalGasUsed: 0
    };
    
    console.log("\n📚 DEPLOYING REQUIRED LIBRARIES...");
    console.log("-" .repeat(50));
    
    // Deploy all required libraries in dependency order
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
            const receipt = await library.deploymentTransaction().wait(2);
            
            deploymentResults.libraries[libName] = libAddress;
            deploymentResults.gasUsed[libName] = receipt.gasUsed.toString();
            deploymentResults.totalGasUsed += Number(receipt.gasUsed);
            
            console.log(`✅ ${libName} deployed at: ${libAddress}`);
            console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
            
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
        const leadFive = await upgrades.deployProxy(
            LeadFive,
            [TESTNET_USDT, TESTNET_PRICE_FEED],
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
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
        deploymentResults.contracts.LeadFiveImplementation = implementationAddress;
        
        console.log(`🔧 Implementation Address: ${implementationAddress}`);
        
        // Verify deployment
        console.log("\n🔍 VERIFYING DEPLOYMENT...");
        console.log("-" .repeat(50));
        
        const owner = await leadFive.owner();
        console.log(`Contract Owner: ${owner} ${owner === deployerAddress ? '✅' : '❌'}`);
        
        const usdtAddress = await leadFive.usdt();
        const priceFeedAddress = await leadFive.priceFeed();
        
        console.log(`USDT Token: ${usdtAddress} ${usdtAddress === TESTNET_USDT ? '✅' : '❌'}`);
        console.log(`Price Feed: ${priceFeedAddress} ${priceFeedAddress === TESTNET_PRICE_FEED ? '✅' : '❌'}`);
        
        // Test admin fee recipient
        console.log("\n🔧 SETTING UP ADMIN FEE RECIPIENT...");
        const setFeeRecipientTx = await leadFive.setAdminFeeRecipient(deployerAddress);
        await setFeeRecipientTx.wait();
        console.log(`✅ Admin fee recipient set to: ${deployerAddress}`);
        
        // Check packages
        console.log("\n📦 PACKAGE VERIFICATION:");
        for (let i = 1; i <= 4; i++) {
            try {
                const packageInfo = await leadFive.packages(i);
                if (packageInfo.price > 0) {
                    console.log(`Package ${i}: ${ethers.formatEther(packageInfo.price)} USDT ✅`);
                }
            } catch (error) {
                console.log(`Package ${i}: Not configured`);
            }
        }
        
        // Save deployment results
        const resultsFile = "testnet-deployment-results.json";
        deploymentResults.bscscanUrls = {
            contract: `https://testnet.bscscan.com/address/${contractAddress}`,
            writeContract: `https://testnet.bscscan.com/address/${contractAddress}#writeContract`,
            implementation: `https://testnet.bscscan.com/address/${implementationAddress}`
        };
        
        // Update .env file with new contract address
        console.log("\n📝 UPDATING .ENV FILE...");
        const fs = require("fs");
        let envContent = fs.readFileSync(".env", "utf8");
        
        // Update contract address
        envContent = envContent.replace(
            /VITE_CONTRACT_ADDRESS=.*/,
            `VITE_CONTRACT_ADDRESS=${contractAddress}`
        );
        
        fs.writeFileSync(".env", envContent);
        fs.writeFileSync(resultsFile, JSON.stringify(deploymentResults, null, 2));
        
        console.log("✅ .env file updated with new contract address");
        console.log(`💾 Results saved to: ${resultsFile}`);
        
        console.log("\n🎉 TESTNET DEPLOYMENT COMPLETED SUCCESSFULLY!");
        console.log("=" .repeat(80));
        console.log(`📍 Contract Address: ${contractAddress}`);
        console.log(`🔧 Implementation: ${implementationAddress}`);
        console.log(`👤 Owner: ${deployerAddress}`);
        console.log(`🔍 View on BSCScan: ${deploymentResults.bscscanUrls.contract}`);
        console.log(`✏️ Write Contract: ${deploymentResults.bscscanUrls.writeContract}`);
        
        console.log("\n📝 NEXT STEPS:");
        console.log("1. Run comprehensive testing on the new contract");
        console.log("2. Test registration and withdrawals");
        console.log("3. Verify contract on BSCScan");
        console.log("4. If all tests pass, proceed to mainnet deployment");
        
        return deploymentResults;
        
    } catch (error) {
        console.error("❌ Failed to deploy LeadFive contract:", error.message);
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then((results) => {
            console.log("\n✅ Testnet deployment completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n❌ Testnet deployment failed:", error);
            process.exit(1);
        });
}

module.exports = main;
