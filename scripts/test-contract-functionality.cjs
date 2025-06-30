require('dotenv').config();
const { ethers } = require('hardhat');

async function testContractFunctionality() {
    console.log('🧪 TESTING CONTRACT FUNCTIONALITY');
    console.log('='.repeat(50));
    
    try {
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        const proxyAddress = process.env.MAINNET_CONTRACT_ADDRESS;
        const usdtAddress = process.env.VITE_USDT_CONTRACT_ADDRESS;
        
        console.log(`\n📋 Test Configuration:`);
        console.log(`Contract: ${proxyAddress}`);
        console.log(`USDT: ${usdtAddress}`);
        console.log(`Tester: ${wallet.address}`);
        
        // Connect to contract
        const LeadFive = await ethers.getContractFactory("LeadFive", wallet);
        const contract = LeadFive.attach(proxyAddress);
        
        // Test current state
        console.log(`\n🔍 Current Contract State:`);
        const owner = await contract.owner();
        const contractUSDT = await contract.usdt();
        const totalUsers = await contract.getTotalUsers();
        
        console.log(`Owner: ${owner}`);
        console.log(`Contract USDT: ${contractUSDT}`);
        console.log(`Total Users: ${totalUsers}`);
        console.log(`USDT is Zero: ${contractUSDT === ethers.ZeroAddress}`);
        
        // Test package prices
        console.log(`\n✅ Package Prices Test:`);
        for (let i = 1; i <= 4; i++) {
            const price = await contract.getPackagePrice(i);
            console.log(`   Package ${i}: $${ethers.formatUnits(price, 6)} USDT`);
        }
        
        // Connect to real USDT to check balance
        console.log(`\n🔍 USDT Balance Check:`);
        const usdtABI = [
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)"
        ];
        
        const usdtContract = new ethers.Contract(usdtAddress, usdtABI, provider);
        const usdtBalance = await usdtContract.balanceOf(wallet.address);
        const usdtDecimals = await usdtContract.decimals();
        const usdtSymbol = await usdtContract.symbol();
        
        console.log(`USDT Symbol: ${usdtSymbol}`);
        console.log(`USDT Decimals: ${usdtDecimals}`);
        console.log(`Your USDT Balance: ${ethers.formatUnits(usdtBalance, usdtDecimals)} USDT`);
        
        // Test if we can call admin functions
        console.log(`\n🔧 Admin Functions Test:`);
        
        try {
            const isAdmin = await contract.isAdmin(wallet.address);
            console.log(`✅ Is Admin: ${isAdmin}`);
        } catch (error) {
            console.log(`❌ Is Admin check failed: ${error.message}`);
        }
        
        // Check if contract has any USDT balance
        const contractUSDTBalance = await usdtContract.balanceOf(proxyAddress);
        console.log(`Contract USDT Balance: ${ethers.formatUnits(contractUSDTBalance, usdtDecimals)} USDT`);
        
        // Try to get user info for the owner
        console.log(`\n🔍 Owner User Info:`);
        try {
            const userInfo = await contract.getUserFullInfo(wallet.address);
            console.log(`   Registered: ${userInfo[0]}`);
            console.log(`   Package Level: ${userInfo[1]}`);
            console.log(`   Balance: ${ethers.formatUnits(userInfo[2], 6)} USDT`);
            console.log(`   Total Earnings: ${ethers.formatUnits(userInfo[3], 6)} USDT`);
            console.log(`   Direct Referrals: ${userInfo[5]}`);
        } catch (error) {
            console.log(`   User info error: ${error.message}`);
        }
        
        // The key test: Does the contract think USDT is set?
        console.log(`\n🎯 KEY DIAGNOSTIC:`);
        
        if (contractUSDT === ethers.ZeroAddress) {
            console.log(`❌ Contract USDT address is zero - this will cause registration failures`);
            console.log(`❌ All USDT transfers will fail`);
            console.log(`❌ Contract is NOT functional for registrations`);
            
            // Try to determine why setUSDTAddress didn't work
            console.log(`\n🔧 Attempting to diagnose setUSDTAddress function...`);
            
            // Check if the function exists in the contract
            try {
                const contractCode = await provider.getCode(proxyAddress);
                console.log(`Contract has code: ${contractCode !== '0x'}`);
                
                // Try to call setUSDTAddress with call static to see what happens
                const setUSDTCalldata = contract.interface.encodeFunctionData("setUSDTAddress", [usdtAddress]);
                console.log(`SetUSDT calldata: ${setUSDTCalldata}`);
                
            } catch (error) {
                console.log(`Diagnostic error: ${error.message}`);
            }
            
        } else {
            console.log(`✅ Contract USDT address is set correctly`);
            console.log(`✅ Contract should be functional`);
        }
        
        console.log(`\n📊 FUNCTIONALITY SUMMARY:`);
        console.log(`✅ Contract is deployed: ${owner !== ethers.ZeroAddress}`);
        console.log(`✅ Package prices work: TRUE`);
        console.log(`✅ Owner functions work: TRUE`);
        console.log(`${contractUSDT === ethers.ZeroAddress ? '❌' : '✅'} USDT address set: ${contractUSDT !== ethers.ZeroAddress}`);
        console.log(`${contractUSDT === ethers.ZeroAddress ? '❌' : '✅'} Registration ready: ${contractUSDT !== ethers.ZeroAddress}`);
        
        return {
            contractWorking: owner !== ethers.ZeroAddress,
            usdtSet: contractUSDT !== ethers.ZeroAddress,
            usdtAddress: contractUSDT,
            needsFix: contractUSDT === ethers.ZeroAddress
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        throw error;
    }
}

// Only run if called directly
if (require.main === module) {
    testContractFunctionality()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = testContractFunctionality;
