const hre = require("hardhat");
const { ethers } = require("hardhat");

async function debugFailedTransaction() {
    try {
        console.log('🔍 DEBUGGING FAILED REGISTRATION TRANSACTION');
        console.log('='.repeat(50));
        
        const txHash = "0x93f9c7319bdd35dd20eaa3b7946ec7b565237afb197b70005c3ef4c60cf9edb4";
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        console.log(`📋 Transaction Hash: ${txHash}`);
        console.log(`📋 Contract: ${contractAddress}`);
        console.log(`📋 From: ${trezorAddress}`);
        
        // Get transaction details
        const tx = await hre.ethers.provider.getTransaction(txHash);
        const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
        
        console.log('');
        console.log('📊 TRANSACTION DETAILS:');
        console.log(`  To: ${tx.to}`);
        console.log(`  Value: ${ethers.formatEther(tx.value)} BNB`);
        console.log(`  Gas Limit: ${tx.gasLimit.toString()}`);
        console.log(`  Gas Price: ${ethers.formatUnits(tx.gasPrice, 'gwei')} Gwei`);
        console.log(`  Status: ${receipt.status === 1 ? 'SUCCESS' : 'FAILED'}`);
        console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
        
        // Decode the input data
        const iface = new ethers.Interface([
            "function register(address sponsor, uint8 packageLevel, bool useUSDT)"
        ]);
        
        try {
            const decoded = iface.parseTransaction({ data: tx.data });
            console.log('');
            console.log('📝 DECODED FUNCTION CALL:');
            console.log(`  Function: ${decoded.name}`);
            console.log(`  Sponsor: ${decoded.args[0]}`);
            console.log(`  Package Level: ${decoded.args[1]}`);
            console.log(`  Use USDT: ${decoded.args[2]}`);
        } catch (e) {
            console.log('  Could not decode function call');
        }
        
        // Load contract and check current state
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        console.log('');
        console.log('🔍 CONTRACT STATE AT TIME OF FAILURE:');
        
        // Check if contract is paused
        try {
            const isPaused = await contract.paused();
            console.log(`  Contract Paused: ${isPaused ? '❌ YES (ISSUE!)' : '✅ NO'}`);
        } catch (e) {
            console.log('  Pause Status: Unable to check');
        }
        
        // Check circuit breaker
        try {
            const circuitBreakerTriggered = await contract.circuitBreakerTriggered();
            console.log(`  Circuit Breaker: ${circuitBreakerTriggered ? '❌ TRIGGERED' : '✅ OK'}`);
        } catch (e) {
            console.log('  Circuit Breaker: Unable to check');
        }
        
        // Check if Trezor is already registered
        try {
            const userInfo = await contract.getUserBasicInfo(trezorAddress);
            const isRegistered = userInfo[0];
            console.log(`  Trezor Already Registered: ${isRegistered ? '❌ YES (ISSUE!)' : '✅ NO'}`);
        } catch (e) {
            console.log('  Registration Status: Unable to check');
        }
        
        // Check package price
        try {
            const packagePrice = await contract.getPackagePrice(1);
            console.log(`  Package 1 Price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
        } catch (e) {
            console.log('  Package Price: Unable to check');
        }
        
        // Check oracle status
        console.log('');
        console.log('🔮 ORACLE STATUS CHECK:');
        try {
            const bnbPrice = await contract.getCurrentBNBPrice();
            console.log(`  BNB Price: $${ethers.formatUnits(bnbPrice, 8)} ✅`);
        } catch (e) {
            console.log(`  Oracle Error: ${e.message}`);
            console.log('  🚨 ORACLE FAILURE - This might be the issue!');
        }
        
        // Try to simulate the transaction
        console.log('');
        console.log('🧪 SIMULATING TRANSACTION:');
        try {
            // Create a test transaction
            const simulatedTx = await contract.register.staticCall(
                "0x0000000000000000000000000000000000000000",
                1,
                false,
                { 
                    value: ethers.parseEther("0.05"),
                    from: trezorAddress
                }
            );
            console.log('  Simulation: ✅ SUCCESS');
        } catch (error) {
            console.log(`  Simulation Failed: ${error.message}`);
            
            // Check for specific error types
            if (error.message.includes('Already registered')) {
                console.log('  🚨 ISSUE: Trezor is already registered!');
            } else if (error.message.includes('Invalid sponsor')) {
                console.log('  🚨 ISSUE: Sponsor validation failed!');
            } else if (error.message.includes('Paused')) {
                console.log('  🚨 ISSUE: Contract is paused!');
            } else if (error.message.includes('Oracle')) {
                console.log('  🚨 ISSUE: Oracle price feed problem!');
            } else {
                console.log('  🚨 UNKNOWN ISSUE - Check contract logic');
            }
        }
        
        console.log('');
        console.log('🎯 POSSIBLE SOLUTIONS:');
        console.log('='.repeat(25));
        console.log('1. 🔧 Check if oracle needs to be fixed');
        console.log('2. 🔧 Try with higher gas limit');
        console.log('3. 🔧 Verify all contract prerequisites');
        console.log('4. 🔧 Check for recent contract state changes');
        
        console.log('');
        console.log('🔗 TRANSACTION LINK:');
        console.log(`  https://bscscan.com/tx/${txHash}`);
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugFailedTransaction();
