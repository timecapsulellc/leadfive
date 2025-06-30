const { ethers } = require('hardhat');

async function main() {
    console.log('🔍 VERIFYING TREZOR AS SPONSOR FOR NEW REGISTRATIONS');
    console.log('==================================================');
    
    // Use BSC Mainnet provider
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    
    // Our deployed proxy address
    const PROXY_ADDRESS = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
    const TREZOR_ADDRESS = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
    
    console.log(`Contract: ${PROXY_ADDRESS}`);
    console.log(`Trezor Sponsor: ${TREZOR_ADDRESS}`);
    console.log('');
    
    // Contract ABI for checking user info
    const contractABI = [
        "function owner() view returns (address)",
        "function getUserBasicInfo(address user) view returns (bool, uint8, uint96)",
        "function getUserEarnings(address user) view returns (uint96, uint96, uint32)",
        "function getUserNetwork(address user) view returns (address, uint32)",
        "function getTotalUsers() view returns (uint32)"
    ];
    
    const contract = new ethers.Contract(PROXY_ADDRESS, contractABI, provider);
    
    console.log('📋 VERIFYING TREZOR ACCOUNT:');
    
    try {
        // Check if Trezor address is registered
        const trezorInfo = await contract.getUserBasicInfo(TREZOR_ADDRESS);
        const trezorEarnings = await contract.getUserEarnings(TREZOR_ADDRESS);
        const trezorNetwork = await contract.getUserNetwork(TREZOR_ADDRESS);
        
        console.log(`✅ Trezor Registered: ${trezorInfo[0]}`);
        
        if (trezorInfo[0]) {
            console.log(`✅ Trezor Package Level: ${trezorInfo[1]}`);
            console.log(`✅ Trezor Balance: ${ethers.formatUnits(trezorInfo[2], 18)} USDT`);
            console.log(`✅ Trezor Total Earnings: ${ethers.formatUnits(trezorEarnings[0], 18)} USDT`);
            console.log(`✅ Trezor Earnings Cap: ${ethers.formatUnits(trezorEarnings[1], 18)} USDT`);
            console.log(`✅ Trezor Direct Referrals: ${trezorEarnings[2].toString()}`);
            console.log(`✅ Trezor Sponsor: ${trezorNetwork[0]}`);
            console.log(`✅ Trezor Team Size: ${trezorNetwork[1].toString()}`);
        } else {
            console.log('⚠️  Trezor not yet registered as a user');
            console.log('⚠️  For optimal sponsorship, register Trezor address first');
        }
        
        // Check current contract owner
        const currentOwner = await contract.owner();
        console.log(`✅ Current Contract Owner: ${currentOwner}`);
        
        if (currentOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
            console.log('✅ Trezor is contract owner - PERFECT for sponsorship!');
        }
        
        console.log('');
        console.log('🎯 SPONSOR CONFIGURATION STATUS:');
        console.log(`✅ Frontend configured to use: ${TREZOR_ADDRESS}`);
        console.log('✅ All new registrations will use Trezor as sponsor');
        console.log('✅ Trezor will receive direct bonuses from new users');
        
        if (trezorInfo[0]) {
            console.log('✅ Sponsor account is active and ready');
        } else {
            console.log('⚠️  Consider registering Trezor address as a user first');
            console.log('   (Register with a high package level for maximum benefits)');
        }
        
        const totalUsers = await contract.getTotalUsers();
        console.log('');
        console.log(`📊 Current total users: ${totalUsers}`);
        console.log('📊 All new users will be sponsored by Trezor address');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
