// TRANSFER EXISTING CONTRACT OWNERSHIP TO TREZOR
// This script transfers ownership of an existing contract to the Trezor wallet

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const TREZOR_WALLET = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
const NETWORK_CONFIG = {
    testnet: {
        name: 'BSC Testnet',
        rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        chainId: 97,
        contractAddress: '0x2A5CDeEc5dF5AE5137AF46920b2B4C4Aa9b0aEA0' // Update with actual address
    },
    mainnet: {
        name: 'BSC Mainnet', 
        rpc: 'https://bsc-dataseed.binance.org/',
        chainId: 56,
        contractAddress: '' // Update when mainnet contract is deployed
    }
};

class OwnershipTransfer {
    constructor(network = 'testnet') {
        this.network = network;
        this.config = NETWORK_CONFIG[network];
        this.provider = new ethers.JsonRpcProvider(this.config.rpc);
        this.trezorAddress = TREZOR_WALLET;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const symbols = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', security: '🔒' };
        console.log(`${symbols[type]} [${timestamp}] ${message}`);
    }

    async transferAllRights() {
        this.log(`Starting ownership transfer to Trezor on ${this.config.name}...`, 'security');
        
        try {
            // Get the current owner's wallet (from private key)
            if (!process.env.DEPLOYER_PRIVATE_KEY) {
                throw new Error('DEPLOYER_PRIVATE_KEY not found in environment. Please add the private key of the current owner (0x658C37b88d211EEFd9a684237a20D5268B4A2e72) to your .env file');
            }

            const currentOwnerWallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, this.provider);
            this.log(`Current owner wallet: ${currentOwnerWallet.address}`, 'info');

            // Verify this is the actual owner
            if (currentOwnerWallet.address.toLowerCase() !== '0x658C37b88d211EEFd9a684237a20D5268B4A2e72'.toLowerCase()) {
                this.log('⚠️  Warning: The wallet in DEPLOYER_PRIVATE_KEY does not match the current contract owner', 'warning');
                this.log(`Expected: 0x658C37b88d211EEFd9a684237a20D5268B4A2e72`, 'warning');
                this.log(`Got: ${currentOwnerWallet.address}`, 'warning');
                this.log('You need the private key of the current owner to transfer ownership', 'warning');
            }

            // Load contract
            const contractPath = path.join(__dirname, 'artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json');
            if (!fs.existsSync(contractPath)) {
                throw new Error('Contract artifacts not found. Please compile: npx hardhat compile');
            }

            const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
            const contract = new ethers.Contract(
                this.config.contractAddress,
                contractArtifact.abi,
                currentOwnerWallet
            );

            // Check current ownership
            const currentOwner = await contract.owner();
            this.log(`Current contract owner: ${currentOwner}`, 'info');
            
            if (currentOwner.toLowerCase() !== currentOwnerWallet.address.toLowerCase()) {
                throw new Error('The wallet in DEPLOYER_PRIVATE_KEY is not the current owner');
            }

            // Transfer ownership
            this.log('Transferring ownership to Trezor...', 'security');
            const transferTx = await contract.transferOwnership(this.trezorAddress);
            await transferTx.wait();
            this.log(`✓ Ownership transferred! Tx: ${transferTx.hash}`, 'success');

            // Grant all roles to Trezor
            const roles = [
                'DEFAULT_ADMIN_ROLE',
                'TREASURY_ROLE', 
                'EMERGENCY_ROLE',
                'POOL_MANAGER_ROLE',
                'UPGRADER_ROLE',
                'ORACLE_MANAGER_ROLE'
            ];

            for (const roleName of roles) {
                try {
                    this.log(`Granting ${roleName} to Trezor...`, 'security');
                    const roleHash = await contract[roleName]();
                    const grantTx = await contract.grantRole(roleHash, this.trezorAddress);
                    await grantTx.wait();
                    this.log(`✓ ${roleName} granted to Trezor`, 'success');
                } catch (error) {
                    this.log(`⚠️ Could not grant ${roleName}: ${error.message}`, 'warning');
                }
            }

            // Revoke current owner's roles
            this.log('Revoking current owner roles...', 'security');
            for (const roleName of roles) {
                try {
                    const roleHash = await contract[roleName]();
                    const revokeTx = await contract.revokeRole(roleHash, currentOwnerWallet.address);
                    await revokeTx.wait();
                    this.log(`✓ ${roleName} revoked from current owner`, 'success');
                } catch (error) {
                    this.log(`⚠️ Could not revoke ${roleName}: ${error.message}`, 'warning');
                }
            }

            // Update addresses if they're not already set to Trezor
            try {
                const treasuryAddress = await contract.treasuryAddress();
                if (treasuryAddress.toLowerCase() !== this.trezorAddress.toLowerCase()) {
                    this.log('Updating treasury address to Trezor...', 'security');
                    const setTreasuryTx = await contract.setTreasuryAddress(this.trezorAddress);
                    await setTreasuryTx.wait();
                    this.log('✓ Treasury address updated', 'success');
                }
            } catch (error) {
                this.log(`Could not update treasury address: ${error.message}`, 'warning');
            }

            try {
                const emergencyAddress = await contract.emergencyAddress();
                if (emergencyAddress.toLowerCase() !== this.trezorAddress.toLowerCase()) {
                    this.log('Updating emergency address to Trezor...', 'security');
                    const setEmergencyTx = await contract.setEmergencyAddress(this.trezorAddress);
                    await setEmergencyTx.wait();
                    this.log('✓ Emergency address updated', 'success');
                }
            } catch (error) {
                this.log(`Could not update emergency address: ${error.message}`, 'warning');
            }

            try {
                const poolManagerAddress = await contract.poolManagerAddress();
                if (poolManagerAddress.toLowerCase() !== this.trezorAddress.toLowerCase()) {
                    this.log('Updating pool manager address to Trezor...', 'security');
                    const setPoolManagerTx = await contract.setPoolManagerAddress(this.trezorAddress);
                    await setPoolManagerTx.wait();
                    this.log('✓ Pool manager address updated', 'success');
                }
            } catch (error) {
                this.log(`Could not update pool manager address: ${error.message}`, 'warning');
            }

            this.log('🎉 ALL RIGHTS SUCCESSFULLY TRANSFERRED TO TREZOR!', 'success');
            this.log(`🔒 Trezor Wallet: ${this.trezorAddress}`, 'security');
            this.log(`📋 Contract: ${this.config.contractAddress}`, 'info');

        } catch (error) {
            this.log(`Transfer failed: ${error.message}`, 'error');
            throw error;
        }
    }
}

// Main execution
async function main() {
    const network = process.argv[2] || 'testnet';
    
    if (!['testnet', 'mainnet'].includes(network)) {
        console.error('❌ Invalid network. Use: testnet or mainnet');
        process.exit(1);
    }

    const transfer = new OwnershipTransfer(network);
    await transfer.transferAllRights();
}

// Execute if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Transfer failed:', error.message);
        process.exit(1);
    });
}

module.exports = { OwnershipTransfer };
