const { ethers } = require('hardhat');

async function main() {
    console.log('🔍 CHECKING LEADFIVE CONTRACT ON BSC MAINNET');
    console.log('==================================================');
    
    // Use BSC Mainnet provider
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    
    // Our deployed proxy address
    const PROXY_ADDRESS = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
    
    console.log(`RPC URL: https://bsc-dataseed.binance.org/`);
    console.log(`Proxy Address: ${PROXY_ADDRESS}`);
    console.log('');
    
    // Check if contract exists
    const code = await provider.getCode(PROXY_ADDRESS);
    console.log(`Contract Code Length: ${code.length} characters`);
    console.log(`Has Contract Code: ${code !== '0x'}`);
    
    if (code === '0x') {
        console.log('❌ No contract found at this address');
        return;
    }
    
    console.log('✅ Contract code found at address');
    console.log('');
    
    // Load the contract ABI with correct function signatures
    const contractABI = [
        "function owner() view returns (address)",
        "function getTotalUsers() view returns (uint32)",
        "function usdt() view returns (address)",
        "function dailyWithdrawalLimit() view returns (uint96)",
        "function register(address sponsor, uint8 packageLevel, bool useUSDT) payable",
        "function getUserBasicInfo(address user) view returns (bool, uint8, uint96)",
        "function getUserEarnings(address user) view returns (uint96, uint96, uint32)",
        "function getUserNetwork(address user) view returns (address, uint32)",
        "function getContractBalance() view returns (uint256)",
        "function getUSDTBalance() view returns (uint256)",
        "function paused() view returns (bool)",
        "function getPackagePrice(uint8 packageLevel) view returns (uint96)",
        "function isAdmin(address user) view returns (bool)"
    ];
    
    const contract = new ethers.Contract(PROXY_ADDRESS, contractABI, provider);
    
    console.log('📋 TESTING CONTRACT FUNCTIONS:');
    
    try {
        // Test basic functions
        const owner = await contract.owner();
        console.log(`✅ Owner: ${owner}`);
        
        const totalUsers = await contract.getTotalUsers();
        console.log(`✅ Total Users: ${totalUsers.toString()}`);
        
        const usdtAddress = await contract.usdt();
        console.log(`✅ USDT Address: ${usdtAddress}`);
        
        const withdrawalLimit = await contract.dailyWithdrawalLimit();
        console.log(`✅ Daily Withdrawal Limit: ${ethers.formatUnits(withdrawalLimit, 18)} USDT`);
        
        const isPaused = await contract.paused();
        console.log(`✅ Contract Paused: ${isPaused}`);
        
        try {
            const version = await contract.version();
            console.log(`✅ Version: ${version}`);
        } catch (e) {
            console.log(`⚠️  Version function not available`);
        }
        
        const balance = await contract.getContractBalance();
        console.log(`✅ Contract Balance: ${ethers.formatEther(balance)} BNB`);
        
        const usdtBalance = await contract.getUSDTBalance();
        console.log(`✅ USDT Balance: ${ethers.formatUnits(usdtBalance, 18)} USDT`);
        
        console.log('');
        console.log('🎯 CONTRACT STATUS: OPERATIONAL ✅');
        
        // Check if this is the root/admin user (user ID 1)
        console.log('');
        console.log('🔍 CHECKING ROOT USER FOR SPONSOR ID:');
        try {
            const rootUserInfo = await contract.getUserBasicInfo(owner);
            console.log(`Root User Active: ${rootUserInfo[0]}`);
            console.log(`Root User Package: ${rootUserInfo[1]}`);
            console.log(`Root User Total Earnings: ${ethers.formatUnits(rootUserInfo[2], 18)} USDT`);
            
            if (rootUserInfo[0]) {
                console.log('');
                console.log('🎯 SPONSOR ID FOR NEW REGISTRATIONS:');
                console.log(`✅ Use sponsor address: ${owner}`);
                console.log('   This is the contract owner/root user');
                
                // Show package prices for reference
                console.log('');
                console.log('💰 PACKAGE PRICES FOR REGISTRATION:');
                for (let level = 1; level <= 4; level++) {
                    try {
                        const price = await contract.getPackagePrice(level);
                        console.log(`   Level ${level}: ${ethers.formatUnits(price, 18)} USDT`);
                    } catch (e) {
                        console.log(`   Level ${level}: Unable to fetch price`);
                    }
                }
            } else {
                console.log('⚠️  Root user not yet registered - need to register first');
            }
        } catch (e) {
            console.log(`⚠️  Could not check root user info: ${e.message}`);
        }
        
    } catch (error) {
        console.log(`❌ Contract interaction failed: ${error.message}`);
        console.log('');
        console.log('🔧 POSSIBLE ISSUES:');
        console.log('- Contract ABI mismatch');
        console.log('- Contract not fully initialized');
        console.log('- Network connectivity issue');
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
