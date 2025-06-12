const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function checkOwnership() {
    console.log('🔍 Checking Contract Ownership...');
    console.log('============================================================');
    
    try {
        // Connect to BSC Testnet
        const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
        const network = await provider.getNetwork();
        console.log(`🌐 Network: ${network.name} Chain ID: ${network.chainId}`);
        
        // NOTE: We are deploying a NEW contract - the old one will be abandoned
        const oldContractAddress = '0x2A5CDeEc5dF5AE5137AF46920b2B4C4Aa9b0aEA0';
        const compromisedWallet = '0x658C37b88d211EEFd9a684237a20D5268B4A2e72';
        const trezorWallet = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
        
        // Check if we have a new contract address
        let contractAddress = process.env.NEW_CONTRACT_ADDRESS || oldContractAddress;
        
        console.log(`📋 Contract Address: ${contractAddress}`);
        if (contractAddress === oldContractAddress) {
            console.log(`⚠️  This is the OLD contract (will be abandoned)`);
            console.log(`🚨 Current Owner: ${compromisedWallet} (COMPROMISED)`);
        }
        console.log(`🔐 Target Owner (Trezor): ${trezorWallet}`);
        
        // Load contract ABI from artifacts
        const contractPath = path.join(__dirname, 'artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json');
        if (!fs.existsSync(contractPath)) {
            console.log('⚠️  Contract artifacts not found. Please compile first: npx hardhat compile');
            return;
        }
        
        const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        const contract = new ethers.Contract(contractAddress, contractArtifact.abi, provider);
        
        // Check owner
        const owner = await contract.owner();
        console.log(`👤 Current Owner: ${owner}`);
        
        // Check if Trezor wallet is the owner
        const isTrezorOwner = owner.toLowerCase() === trezorWallet.toLowerCase();
        console.log(`✅ Is Trezor Owner: ${isTrezorOwner}`);
        
        // Check roles
        try {
            const hasAdminRole = await contract.hasRole(await contract.DEFAULT_ADMIN_ROLE(), trezorWallet);
            console.log(`🔑 Has Admin Role: ${hasAdminRole}`);
        } catch (e) {
            console.log('ℹ️  Admin role check not available');
        }
        
        // Check if contract is paused
        try {
            const isPaused = await contract.paused();
            console.log(`⏸️  Contract Paused: ${isPaused}`);
        } catch (e) {
            console.log('ℹ️  Pause status check not available');
        }
        
        console.log('============================================================');
        
        if (contractAddress === oldContractAddress) {
            console.log('🚨 OLD CONTRACT STATUS (TO BE ABANDONED):');
            console.log('❌ This contract is owned by compromised wallet');
            console.log('🔴 Security Status: COMPROMISED');
            console.log('');
            console.log('🎯 SOLUTION: DEPLOY NEW CONTRACT');
            console.log('📋 Next Steps:');
            console.log('   1. Deploy new contract with Trezor wallet');
            console.log('   2. Run: npm run deploy:metamask:testnet');
            console.log('   3. All users will migrate to new contract');
            console.log('   4. Old contract will be abandoned');
        } else if (isTrezorOwner) {
            console.log('🎉 SUCCESS: New contract is owned by Trezor wallet!');
            console.log('🔒 Security Status: FULLY SECURED');
        } else {
            console.log('⚠️  WARNING: Contract is NOT owned by Trezor wallet!');
            console.log('🔓 Security Status: NEEDS TRANSFER');
            console.log('📋 Next Steps:');
            console.log('   1. Transfer ownership to Trezor wallet');
            console.log('   2. Verify the transfer');
        }
        
    } catch (error) {
        console.error('❌ Error checking ownership:', error.message);
    }
}

checkOwnership().catch(console.error);
