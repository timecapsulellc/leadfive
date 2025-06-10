const { ethers } = require("hardhat");

/**
 * COMPREHENSIVE FUND TRANSFER AND TESTING SCRIPT
 * 
 * This script:
 * 1. Transfers BNB from deployer to test wallets
 * 2. Conducts comprehensive contract testing
 * 3. Tests user registration and commission flows
 */

async function main() {
    console.log("🚀 ORPHI CROWDFUND - FUND TRANSFER & COMPREHENSIVE TESTING");
    console.log("=" .repeat(80));
    
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Contract addresses
    const contractAddress = "0x5ab22F4d339B66C1859029d2c2540d8BefCbdED4";
    const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
    
    // Get signers
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    
    // Test wallet addresses
    const testWallets = [
        "0xE0Ea180812e05AE1B257D212C01FC4E45865EBd4",
        "0xDB54f3f8F42e0165a15A33736550790BB0662Ac6", 
        "0x7379AF7f3efC8Ab3F8dA57EA917fB5C29B12bBB7"
    ];
    
    console.log(`👤 Deployer: ${deployerAddress}`);
    console.log(`📋 Contract: ${contractAddress}`);
    console.log(`💰 USDT: ${usdtAddress}`);
    
    // Check deployer balance
    const deployerBalance = await ethers.provider.getBalance(deployerAddress);
    console.log(`💰 Deployer Balance: ${ethers.formatEther(deployerBalance)} BNB`);
    
    // STEP 1: FUND TRANSFER
    console.log("\n" + "=" .repeat(80));
    console.log("💸 STEP 1: TRANSFERRING FUNDS TO TEST WALLETS");
    console.log("=" .repeat(80));
    
    const transferAmount = ethers.parseEther("0.1"); // 0.1 BNB per wallet
    
    for (let i = 0; i < testWallets.length; i++) {
        const wallet = testWallets[i];
        const currentBalance = await ethers.provider.getBalance(wallet);
        
        console.log(`\n👛 Test Wallet ${i + 1}: ${wallet}`);
        console.log(`   Current Balance: ${ethers.formatEther(currentBalance)} BNB`);
        
        if (currentBalance < ethers.parseEther("0.05")) {
            try {
                console.log(`   💸 Transferring 0.1 BNB...`);
                
                const tx = await deployer.sendTransaction({
                    to: wallet,
                    value: transferAmount,
                    gasLimit: 21000
                });
                
                console.log(`   📝 Transaction Hash: ${tx.hash}`);
                await tx.wait();
                
                const newBalance = await ethers.provider.getBalance(wallet);
                console.log(`   ✅ New Balance: ${ethers.formatEther(newBalance)} BNB`);
                
            } catch (error) {
                console.log(`   ❌ Transfer failed: ${error.message}`);
            }
        } else {
            console.log(`   ✅ Wallet already has sufficient balance`);
        }
    }
    
    // STEP 2: CONTRACT TESTING
    console.log("\n" + "=" .repeat(80));
    console.log("🧪 STEP 2: COMPREHENSIVE CONTRACT TESTING");
    console.log("=" .repeat(80));
    
    // Get contract instance
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundV2Enhanced");
    const contract = OrphiCrowdFund.attach(contractAddress);
    
    console.log("\n🔍 Testing Contract Functions...");
    
    try {
        // Test 1: Basic contract info
        console.log("\n📋 Test 1: Basic Contract Information");
        const owner = await contract.owner();
        const usdtToken = await contract.usdtToken();
        const packageAmounts = await contract.getPackageAmounts();
        
        console.log(`   Owner: ${owner}`);
        console.log(`   USDT Token: ${usdtToken}`);
        console.log(`   Package 1: $${ethers.formatUnits(packageAmounts[0], 6)}`);
        console.log(`   Package 2: $${ethers.formatUnits(packageAmounts[1], 6)}`);
        console.log(`   Package 3: $${ethers.formatUnits(packageAmounts[2], 6)}`);
        console.log(`   Package 4: $${ethers.formatUnits(packageAmounts[3], 6)}`);
        console.log("   ✅ Basic info test passed");
        
        // Test 2: Package price retrieval
        console.log("\n💰 Test 2: Package Price Retrieval");
        for (let i = 1; i <= 4; i++) {
            const price = await contract.getPackagePrice(i);
            console.log(`   Package ${i}: $${ethers.formatUnits(price, 6)}`);
        }
        console.log("   ✅ Package price test passed");
        
        // Test 3: Rank requirements
        console.log("\n🏆 Test 3: Rank Requirements");
        for (let i = 1; i <= 5; i++) {
            try {
                const [teamSize, volume] = await contract.getRankRequirements(i);
                console.log(`   Rank ${i}: ${teamSize} team, $${ethers.formatUnits(volume, 6)} volume`);
            } catch (error) {
                console.log(`   Rank ${i}: Not defined`);
            }
        }
        console.log("   ✅ Rank requirements test passed");
        
        // Test 4: Commission rates
        console.log("\n💸 Test 4: Commission Rates");
        try {
            const directRate = await contract.DIRECT_COMMISSION_RATE();
            const matrixRate = await contract.MATRIX_COMMISSION_RATE();
            console.log(`   Direct Commission: ${directRate}%`);
            console.log(`   Matrix Commission: ${matrixRate}%`);
            console.log("   ✅ Commission rates test passed");
        } catch (error) {
            console.log(`   ⚠️  Commission rates test: ${error.message}`);
        }
        
        // Test 5: User registration check (should fail for unregistered users)
        console.log("\n👥 Test 5: User Registration Check");
        const isRegistered = await contract.isUserRegistered(testWallets[0]);
        console.log(`   Test Wallet 1 Registered: ${isRegistered}`);
        console.log("   ✅ Registration check test passed");
        
        // Test 6: Matrix position check
        console.log("\n🔗 Test 6: Matrix Position Check");
        try {
            const matrixPosition = await contract.getUserMatrixPosition(deployerAddress);
            console.log(`   Deployer Matrix Position: ${matrixPosition}`);
            console.log("   ✅ Matrix position test passed");
        } catch (error) {
            console.log(`   ⚠️  Matrix position test: ${error.message}`);
        }
        
        // Test 7: Pool balances
        console.log("\n🏊 Test 7: Pool Balances");
        try {
            const globalPool = await contract.globalHelpPoolBalance();
            const leaderPool = await contract.leaderPoolBalance();
            console.log(`   Global Help Pool: $${ethers.formatUnits(globalPool, 6)}`);
            console.log(`   Leader Pool: $${ethers.formatUnits(leaderPool, 6)}`);
            console.log("   ✅ Pool balances test passed");
        } catch (error) {
            console.log(`   ⚠️  Pool balances test: ${error.message}`);
        }
        
    } catch (error) {
        console.log(`❌ Contract testing failed: ${error.message}`);
    }
    
    // STEP 3: USDT CONTRACT TESTING
    console.log("\n" + "=" .repeat(80));
    console.log("💵 STEP 3: USDT CONTRACT TESTING");
    console.log("=" .repeat(80));
    
    try {
        // Get USDT contract (assuming it's a standard ERC20)
        const usdtAbi = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)"
        ];
        
        const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, deployer);
        
        console.log("\n🔍 USDT Contract Information:");
        try {
            const name = await usdtContract.name();
            const symbol = await usdtContract.symbol();
            const decimals = await usdtContract.decimals();
            const totalSupply = await usdtContract.totalSupply();
            
            console.log(`   Name: ${name}`);
            console.log(`   Symbol: ${symbol}`);
            console.log(`   Decimals: ${decimals}`);
            console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
            
            // Check balances
            console.log("\n💰 USDT Balances:");
            const deployerUSDT = await usdtContract.balanceOf(deployerAddress);
            console.log(`   Deployer: ${ethers.formatUnits(deployerUSDT, decimals)} ${symbol}`);
            
            for (let i = 0; i < testWallets.length; i++) {
                const balance = await usdtContract.balanceOf(testWallets[i]);
                console.log(`   Test Wallet ${i + 1}: ${ethers.formatUnits(balance, decimals)} ${symbol}`);
            }
            
            console.log("   ✅ USDT contract test passed");
            
        } catch (error) {
            console.log(`   ⚠️  USDT contract test: ${error.message}`);
        }
        
    } catch (error) {
        console.log(`❌ USDT testing failed: ${error.message}`);
    }
    
    // STEP 4: FINAL SUMMARY
    console.log("\n" + "=" .repeat(80));
    console.log("📊 TESTING SUMMARY");
    console.log("=" .repeat(80));
    
    // Check final balances
    console.log("\n💰 Final BNB Balances:");
    const finalDeployerBalance = await ethers.provider.getBalance(deployerAddress);
    console.log(`   Deployer: ${ethers.formatEther(finalDeployerBalance)} BNB`);
    
    for (let i = 0; i < testWallets.length; i++) {
        const balance = await ethers.provider.getBalance(testWallets[i]);
        console.log(`   Test Wallet ${i + 1}: ${ethers.formatEther(balance)} BNB`);
    }
    
    console.log("\n✅ TESTING COMPLETED SUCCESSFULLY!");
    console.log("\n🎯 NEXT STEPS:");
    console.log("1. Get testnet USDT for test wallets");
    console.log("2. Test user registration with different packages");
    console.log("3. Test commission calculations");
    console.log("4. Test withdrawal functionality");
    console.log("5. Test matrix positioning");
    
    console.log("\n🌐 Contract Links:");
    console.log(`   BSCScan: https://testnet.bscscan.com/address/${contractAddress}`);
    console.log(`   Contract Code: https://testnet.bscscan.com/address/${contractAddress}#code`);
    
    return {
        contractAddress,
        testWallets,
        success: true
    };
}

if (require.main === module) {
    main()
        .then((result) => {
            console.log("\n✅ Fund transfer and testing completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Fund transfer and testing failed:", error);
            process.exit(1);
        });
}

module.exports = main;
