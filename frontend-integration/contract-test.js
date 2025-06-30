// Quick test to verify contract integration
// Run this in browser console to test connection

async function testLeadFiveContract() {
    console.log('🔍 Testing LeadFive Contract Integration...');
    
    // Check if Web3 is available
    if (typeof window.ethereum === 'undefined') {
        console.error('❌ MetaMask not detected');
        return;
    }
    
    // Import Web3
    const { ethers } = window;
    if (!ethers) {
        console.error('❌ Ethers.js not loaded');
        return;
    }
    
    try {
        // Connect to BSC Mainnet
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Contract addresses
        const PROXY_ADDRESS = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
        const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
        const SPONSOR_ADDRESS = '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335';
        
        // Basic contract ABI for testing
        const contractABI = [
            "function owner() view returns (address)",
            "function getTotalUsers() view returns (uint32)",
            "function usdt() view returns (address)",
            "function dailyWithdrawalLimit() view returns (uint256)",
            "function paused() view returns (bool)",
            "function getPackagePrice(uint8 packageLevel) view returns (uint96)"
        ];
        
        const contract = new ethers.Contract(PROXY_ADDRESS, contractABI, provider);
        
        console.log('📋 Contract Address:', PROXY_ADDRESS);
        console.log('📋 USDT Address:', USDT_ADDRESS);
        console.log('📋 Sponsor Address:', SPONSOR_ADDRESS);
        
        // Test basic contract functions
        console.log('\n🔍 Testing Contract Functions:');
        
        const owner = await contract.owner();
        console.log('✅ Owner:', owner);
        
        const totalUsers = await contract.getTotalUsers();
        console.log('✅ Total Users:', totalUsers.toString());
        
        const usdtAddr = await contract.usdt();
        console.log('✅ USDT Token:', usdtAddr);
        
        const isPaused = await contract.paused();
        console.log('✅ Contract Paused:', isPaused);
        
        const withdrawalLimit = await contract.dailyWithdrawalLimit();
        console.log('✅ Daily Limit:', ethers.formatUnits(withdrawalLimit, 18), 'USDT');
        
        // Test package prices
        console.log('\n💰 Package Prices:');
        for (let level = 1; level <= 4; level++) {
            try {
                const price = await contract.getPackagePrice(level);
                console.log(`✅ Level ${level}: ${ethers.formatUnits(price, 18)} USDT`);
            } catch (e) {
                console.log(`❌ Level ${level}: Failed to fetch price`);
            }
        }
        
        // Check network
        const network = await provider.getNetwork();
        console.log('\n🌐 Network Info:');
        console.log('✅ Chain ID:', network.chainId.toString());
        console.log('✅ Network Name:', network.name);
        
        if (network.chainId !== 56n) {
            console.warn('⚠️  Not connected to BSC Mainnet (Chain ID: 56)');
        } else {
            console.log('✅ Connected to BSC Mainnet');
        }
        
        console.log('\n🎉 Contract integration test completed successfully!');
        
        return {
            contractAddress: PROXY_ADDRESS,
            owner,
            totalUsers: totalUsers.toString(),
            usdtAddress: usdtAddr,
            isPaused,
            withdrawalLimit: ethers.formatUnits(withdrawalLimit, 18),
            chainId: network.chainId.toString(),
            networkName: network.name
        };
        
    } catch (error) {
        console.error('❌ Contract test failed:', error);
        throw error;
    }
}

// Auto-run test when page loads
if (typeof window !== 'undefined') {
    window.testLeadFiveContract = testLeadFiveContract;
    console.log('🔧 Contract test function loaded. Run testLeadFiveContract() to test.');
}

export default testLeadFiveContract;
