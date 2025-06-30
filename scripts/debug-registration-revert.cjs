const { ethers } = require('hardhat');

async function debugRegistrationRevert() {
    console.log('🔍 Debugging Registration Revert...\n');
    
    // Contract details
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    const trezorAddress = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
    
    try {
        // Get the contract
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const contract = LeadFive.attach(contractAddress);
        
        console.log('📋 Contract Information:');
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Trezor Address: ${trezorAddress}\n`);
        
        // Check if contract is paused
        console.log('⏸️ Checking if contract is paused...');
        try {
            const isPaused = await contract.paused();
            console.log(`Contract Paused: ${isPaused}`);
            if (isPaused) {
                console.log('❌ Contract is PAUSED - this will cause registration to revert!\n');
                return;
            }
        } catch (error) {
            console.log('⚠️ Could not check paused status:', error.message);
        }
        
        // Check registration status
        console.log('👤 Checking registration status...');
        try {
            const isRegistered = await contract.isRegistered(trezorAddress);
            console.log(`Is Registered: ${isRegistered}`);
            if (isRegistered) {
                console.log('✅ User is already registered - registration would revert!\n');
                return;
            }
        } catch (error) {
            console.log('⚠️ Could not check registration status:', error.message);
        }
        
        // Check registration fee
        console.log('💰 Checking registration fees...');
        try {
            const registrationFee = await contract.registrationFee();
            console.log(`Registration Fee: ${ethers.formatEther(registrationFee)} BNB`);
            
            const expectedFee = ethers.parseEther('0.05');
            if (registrationFee.toString() !== expectedFee.toString()) {
                console.log(`❌ Registration fee mismatch! Expected: ${ethers.formatEther(expectedFee)} BNB`);
            }
        } catch (error) {
            console.log('⚠️ Could not check registration fee:', error.message);
        }
        
        // Check oracle status
        console.log('🔮 Checking Chainlink oracle status...');
        try {
            const oracleAddress = await contract.priceFeed();
            console.log(`Oracle Address: ${oracleAddress}`);
            
            // Try to get the latest price
            const latestPrice = await contract.getLatestPrice();
            console.log(`Latest BNB/USD Price: $${ethers.formatUnits(latestPrice, 8)}`);
        } catch (error) {
            console.log('❌ Oracle Error:', error.message);
            console.log('This is likely causing the registration to revert!\n');
            
            // Suggest solutions
            console.log('🔧 Suggested Solutions:');
            console.log('1. Register using USDT instead of BNB');
            console.log('2. Fix/replace the oracle (requires contract owner)');
            console.log('3. Temporarily pause oracle dependency (if contract allows)\n');
            return;
        }
        
        // Check package details
        console.log('📦 Checking Package 1 details...');
        try {
            const package1 = await contract.packages(1);
            console.log(`Package 1 Price: $${ethers.formatUnits(package1.price, 8)}`);
            console.log(`Package 1 Active: ${package1.isActive}`);
            
            if (!package1.isActive) {
                console.log('❌ Package 1 is not active - this will cause registration to revert!\n');
                return;
            }
        } catch (error) {
            console.log('⚠️ Could not check package details:', error.message);
        }
        
        // Try to simulate the registration call
        console.log('🧪 Simulating registration call...');
        try {
            // Get the signer for simulation
            const [deployer] = await ethers.getSigners();
            
            // Estimate gas for registration
            const gasEstimate = await contract.register.estimateGas(1, {
                value: ethers.parseEther('0.05'),
                from: trezorAddress
            });
            console.log(`Estimated Gas: ${gasEstimate.toString()}`);
            
            console.log('✅ Gas estimation successful - no obvious revert reason found');
            
        } catch (error) {
            console.log('❌ Simulation Error:', error.message);
            console.log('This shows the exact reason for revert!\n');
            
            // Parse the error for more details
            if (error.message.includes('revert')) {
                const revertReason = error.message.match(/revert (.+?)(?:\s|$)/)?.[1];
                if (revertReason) {
                    console.log(`🎯 Revert Reason: ${revertReason}\n`);
                }
            }
        }
        
        // Check Trezor balance
        console.log('💳 Checking Trezor balance...');
        try {
            const provider = ethers.provider;
            const balance = await provider.getBalance(trezorAddress);
            console.log(`Trezor BNB Balance: ${ethers.formatEther(balance)} BNB`);
            
            const requiredAmount = ethers.parseEther('0.05');
            if (balance < requiredAmount) {
                console.log('❌ Insufficient BNB balance for registration!\n');
                return;
            }
        } catch (error) {
            console.log('⚠️ Could not check balance:', error.message);
        }
        
        console.log('✅ Debug analysis complete');
        
    } catch (error) {
        console.error('❌ Debug Error:', error.message);
    }
}

// Run the debug
debugRegistrationRevert()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
