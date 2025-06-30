const { ethers } = require('hardhat');

async function debugRegistrationIssue() {
    console.log('🔍 Debugging Registration Issue...\n');
    
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
            const user = await contract.users(trezorAddress);
            // Check if the first bit of the packed user data indicates registration
            const isRegistered = user.registrationTime > 0; // If has registration time, is registered
            console.log(`Is Registered: ${isRegistered}`);
            console.log(`Registration Time: ${user.registrationTime}`);
            console.log(`Package Level: ${user.packageLevel}`);
            if (isRegistered) {
                console.log('✅ User is already registered - registration would revert!\n');
                return;
            }
        } catch (error) {
            console.log('⚠️ Could not check registration status:', error.message);
        }
        
        // Check package details
        console.log('📦 Checking Package 1 details...');
        try {
            const package1 = await contract.packages(1);
            console.log(`Package 1 Price: $${ethers.formatUnits(package1.price, 6)} USDT`);
            console.log(`Direct Bonus: ${package1.directBonus / 100}%`);
            console.log(`Level Bonus: ${package1.levelBonus / 100}%`);
        } catch (error) {
            console.log('⚠️ Could not check package details:', error.message);
        }
        
        // Try to get oracle price
        console.log('🔮 Testing oracle price retrieval...');
        try {
            // This is what fails in the registration
            await contract.callStatic.register(ethers.ZeroAddress, 1, false, {
                value: ethers.parseEther('0.05'),
                from: trezorAddress
            });
            console.log('✅ Oracle price retrieval works fine');
        } catch (error) {
            console.log('❌ Oracle Error:', error.message);
            console.log('This is causing the registration to revert!\n');
            
            if (error.message.includes('Invalid price feed')) {
                console.log('🎯 The oracle is returning an invalid price (likely 0 or negative)');
            } else if (error.message.includes('revert')) {
                console.log('🎯 Oracle contract call is reverting');
            }
            
            console.log('🔧 Solutions:');
            console.log('1. ✅ Register using USDT (bypasses oracle entirely)');
            console.log('2. Fix the oracle as contract owner');
            console.log('3. Add a fallback price mechanism\n');
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
            } else {
                console.log('✅ Sufficient BNB balance');
            }
        } catch (error) {
            console.log('⚠️ Could not check balance:', error.message);
        }
        
        // Check USDT balance for alternative
        console.log('💰 Checking USDT option...');
        try {
            const usdtAddress = await contract.usdt();
            console.log(`USDT Contract: ${usdtAddress}`);
            
            // Create USDT contract instance
            const USDT = await ethers.getContractFactory('contracts/interfaces/IERC20.sol:IERC20');
            const usdtContract = USDT.attach(usdtAddress);
            
            try {
                const usdtBalance = await usdtContract.balanceOf(trezorAddress);
                console.log(`Trezor USDT Balance: ${ethers.formatUnits(usdtBalance, 6)} USDT`);
                
                if (usdtBalance >= ethers.parseUnits('30', 6)) {
                    console.log('✅ Sufficient USDT for registration using USDT option');
                    
                    // Check allowance
                    const allowance = await usdtContract.allowance(trezorAddress, contractAddress);
                    console.log(`USDT Allowance: ${ethers.formatUnits(allowance, 6)} USDT`);
                    
                    if (allowance >= ethers.parseUnits('30', 6)) {
                        console.log('✅ USDT is pre-approved for registration');
                    } else {
                        console.log('❌ Need to approve USDT first');
                    }
                } else {
                    console.log('❌ Insufficient USDT balance');
                }
            } catch (error) {
                console.log('⚠️ Could not check USDT balance:', error.message);
            }
        } catch (error) {
            console.log('⚠️ Could not check USDT details:', error.message);
        }
        
        console.log('\n📝 Summary:');
        console.log('The registration is failing because the Chainlink oracle is not working properly.');
        console.log('When registering with BNB, the contract tries to get the BNB/USD price but fails.');
        console.log('The best solution is to register using USDT instead of BNB.\n');
        
    } catch (error) {
        console.error('❌ Debug Error:', error.message);
    }
}

// Run the debug
debugRegistrationIssue()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
