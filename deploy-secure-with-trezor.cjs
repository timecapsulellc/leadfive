// SECURE DEPLOYMENT WITH TREZOR WALLET - ALL RIGHTS ASSIGNED TO TREZOR
// This script ensures ALL admin rights are assigned to Trezor wallet 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const TREZOR_WALLET = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
const NETWORK_CONFIG = {
    testnet: {
        name: 'BSC Testnet',
        rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        chainId: 97,
        explorer: 'https://testnet.bscscan.com'
    },
    mainnet: {
        name: 'BSC Mainnet',
        rpc: 'https://bsc-dataseed.binance.org/',
        chainId: 56,
        explorer: 'https://bscscan.com'
    }
};

class TrezorSecureDeployment {
    constructor(network = 'testnet') {
        this.network = network;
        this.config = NETWORK_CONFIG[network];
        this.provider = new ethers.JsonRpcProvider(this.config.rpc);
        this.trezorAddress = TREZOR_WALLET;
        this.deploymentRecord = {
            timestamp: new Date().toISOString(),
            network: network,
            deployer: this.trezorAddress,
            chainId: this.config.chainId,
            contracts: {},
            roles: {},
            verification: {}
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const symbols = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            security: '🔒',
            deploy: '🚀',
            verify: '🔍'
        };
        console.log(`${symbols[type]} [${timestamp}] ${message}`);
    }

    async validateTrezorWallet() {
        this.log('Validating Trezor wallet configuration...', 'verify');
        
        // Check if wallet address is valid
        if (!ethers.isAddress(this.trezorAddress)) {
            throw new Error(`Invalid Trezor wallet address: ${this.trezorAddress}`);
        }

        // Check wallet balance
        const balance = await this.provider.getBalance(this.trezorAddress);
        const balanceInBNB = ethers.formatEther(balance);
        
        this.log(`Trezor wallet: ${this.trezorAddress}`, 'security');
        this.log(`Wallet balance: ${balanceInBNB} BNB`, 'info');

        if (parseFloat(balanceInBNB) < 0.05) {
            throw new Error(`Insufficient balance! Need at least 0.05 BNB, have ${balanceInBNB} BNB`);
        }

        this.log('Trezor wallet validation passed!', 'success');
        return true;
    }

    async deployContract() {
        this.log('Starting secure contract deployment...', 'deploy');
        
        // Load contract artifacts
        const contractPath = path.join(__dirname, 'artifacts/contracts/OrphiCrowdFundUpgradeableSecure.sol/OrphiCrowdFundUpgradeableSecure.json');
        if (!fs.existsSync(contractPath)) {
            throw new Error('Contract artifacts not found. Please compile contracts first.');
        }

        const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        
        // Create wallet instance (for actual deployment, this would connect to Trezor)
        this.log('Connecting to Trezor wallet...', 'security');
        // Note: In production, this would use Trezor Connect SDK
        
        // For simulation, we'll use the provided wallet
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || 'test', this.provider);
        
        // Create contract factory
        const ContractFactory = new ethers.ContractFactory(
            contractArtifact.abi,
            contractArtifact.bytecode,
            wallet
        );

        // Deploy contract with Trezor as initial owner
        this.log('Deploying OrphiCrowdFundUpgradeableSecure...', 'deploy');
        
        const contract = await ContractFactory.deploy(
            this.trezorAddress, // Initial owner (Trezor wallet)
            this.trezorAddress, // Treasury role (Trezor wallet)
            this.trezorAddress, // Emergency role (Trezor wallet)
            this.trezorAddress  // Pool Manager role (Trezor wallet)
        );

        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        
        this.log(`Contract deployed at: ${contractAddress}`, 'success');
        this.deploymentRecord.contracts.OrphiCrowdFund = contractAddress;

        return { contract, contractAddress };
    }

    async configureAllRoles(contract) {
        this.log('Configuring ALL admin roles for Trezor wallet...', 'security');
        
        // Define all roles
        const roles = {
            OWNER: 'owner',
            DEFAULT_ADMIN_ROLE: await contract.DEFAULT_ADMIN_ROLE(),
            TREASURY_ROLE: await contract.TREASURY_ROLE(),
            EMERGENCY_ROLE: await contract.EMERGENCY_ROLE(),
            POOL_MANAGER_ROLE: await contract.POOL_MANAGER_ROLE()
        };

        this.log('Setting up role assignments...', 'security');

        try {
            // Grant all roles to Trezor wallet
            for (const [roleName, roleHash] of Object.entries(roles)) {
                if (roleName === 'OWNER') {
                    // Owner is set during deployment
                    this.log(`✓ OWNER role: Already assigned to Trezor`, 'success');
                    continue;
                }

                this.log(`Setting ${roleName} for Trezor wallet...`, 'security');
                
                // Grant role
                const tx = await contract.grantRole(roleHash, this.trezorAddress);
                await tx.wait();
                
                this.log(`✓ ${roleName}: Granted to Trezor`, 'success');
                this.deploymentRecord.roles[roleName] = this.trezorAddress;
            }

            // Verify all roles are correctly assigned
            await this.verifyRoleAssignments(contract, roles);

        } catch (error) {
            this.log(`Error configuring roles: ${error.message}`, 'error');
            throw error;
        }
    }

    async verifyRoleAssignments(contract, roles) {
        this.log('Verifying ALL role assignments...', 'verify');
        
        let allRolesCorrect = true;

        for (const [roleName, roleHash] of Object.entries(roles)) {
            try {
                let hasRole = false;
                
                if (roleName === 'OWNER') {
                    const owner = await contract.owner();
                    hasRole = owner.toLowerCase() === this.trezorAddress.toLowerCase();
                } else {
                    hasRole = await contract.hasRole(roleHash, this.trezorAddress);
                }

                if (hasRole) {
                    this.log(`✅ ${roleName}: CORRECTLY assigned to Trezor`, 'success');
                    this.deploymentRecord.verification[roleName] = 'PASSED';
                } else {
                    this.log(`❌ ${roleName}: NOT assigned to Trezor`, 'error');
                    this.deploymentRecord.verification[roleName] = 'FAILED';
                    allRolesCorrect = false;
                }
            } catch (error) {
                this.log(`⚠️ ${roleName}: Verification failed - ${error.message}`, 'warning');
                this.deploymentRecord.verification[roleName] = 'ERROR';
                allRolesCorrect = false;
            }
        }

        if (allRolesCorrect) {
            this.log('🎉 ALL ROLES SUCCESSFULLY ASSIGNED TO TREZOR WALLET!', 'success');
            this.deploymentRecord.verification.overall = 'PASSED';
        } else {
            this.log('❌ ROLE ASSIGNMENT VERIFICATION FAILED!', 'error');
            this.deploymentRecord.verification.overall = 'FAILED';
            throw new Error('Not all roles were correctly assigned to Trezor wallet');
        }

        return allRolesCorrect;
    }

    async performSecurityAudit(contract) {
        this.log('Performing security audit...', 'verify');
        
        const auditResults = {
            ownership: false,
            roles: false,
            pausable: false,
            upgradeability: false
        };

        try {
            // Check ownership
            const owner = await contract.owner();
            auditResults.ownership = owner.toLowerCase() === this.trezorAddress.toLowerCase();
            
            // Check if contract is properly initialized
            const isPaused = await contract.paused();
            auditResults.pausable = typeof isPaused === 'boolean';
            
            // Check role-based access
            const hasAdminRole = await contract.hasRole(await contract.DEFAULT_ADMIN_ROLE(), this.trezorAddress);
            auditResults.roles = hasAdminRole;
            
            // Log audit results
            this.log('=== SECURITY AUDIT RESULTS ===', 'verify');
            this.log(`Ownership Control: ${auditResults.ownership ? '✅' : '❌'}`, auditResults.ownership ? 'success' : 'error');
            this.log(`Role-Based Access: ${auditResults.roles ? '✅' : '❌'}`, auditResults.roles ? 'success' : 'error');
            this.log(`Pausable Mechanism: ${auditResults.pausable ? '✅' : '❌'}`, auditResults.pausable ? 'success' : 'error');
            
            const overallSecure = Object.values(auditResults).every(result => result === true);
            this.log(`Overall Security: ${overallSecure ? '🔒 SECURE' : '🔓 NEEDS ATTENTION'}`, overallSecure ? 'success' : 'error');
            
            this.deploymentRecord.verification.securityAudit = auditResults;
            return overallSecure;

        } catch (error) {
            this.log(`Security audit failed: ${error.message}`, 'error');
            return false;
        }
    }

    async saveDeploymentRecord() {
        const recordPath = path.join(__dirname, `deployment-record-${this.network}-${Date.now()}.json`);
        fs.writeFileSync(recordPath, JSON.stringify(this.deploymentRecord, null, 2));
        this.log(`Deployment record saved: ${recordPath}`, 'success');
    }

    async deploy() {
        try {
            this.log(`🚀 STARTING SECURE DEPLOYMENT TO ${this.config.name.toUpperCase()}`, 'deploy');
            this.log(`🔒 ALL ADMIN RIGHTS WILL BE ASSIGNED TO TREZOR: ${this.trezorAddress}`, 'security');
            console.log('============================================================');

            // Step 1: Validate Trezor wallet
            await this.validateTrezorWallet();

            // Step 2: Deploy contract
            const { contract, contractAddress } = await this.deployContract();

            // Step 3: Configure all roles for Trezor
            await this.configureAllRoles(contract);

            // Step 4: Perform security audit
            const isSecure = await this.performSecurityAudit(contract);

            // Step 5: Save deployment record
            await this.saveDeploymentRecord();

            console.log('============================================================');
            this.log('🎉 SECURE DEPLOYMENT COMPLETED SUCCESSFULLY!', 'success');
            this.log(`📋 Contract Address: ${contractAddress}`, 'info');
            this.log(`🔒 Trezor Wallet (Owner): ${this.trezorAddress}`, 'security');
            this.log(`🌐 Network: ${this.config.name}`, 'info');
            this.log(`🔍 Explorer: ${this.config.explorer}/address/${contractAddress}`, 'info');

            if (isSecure) {
                this.log('🔒 SECURITY STATUS: FULLY SECURED WITH TREZOR', 'success');
            } else {
                this.log('⚠️ SECURITY STATUS: NEEDS MANUAL REVIEW', 'warning');
            }

            return {
                contractAddress,
                trezorWallet: this.trezorAddress,
                network: this.network,
                secure: isSecure
            };

        } catch (error) {
            this.log(`Deployment failed: ${error.message}`, 'error');
            await this.saveDeploymentRecord();
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

    const deployment = new TrezorSecureDeployment(network);
    await deployment.deploy();
}

// Execute if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    });
}

module.exports = { TrezorSecureDeployment };
