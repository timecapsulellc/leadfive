// PURE TREZOR DEPLOYMENT - NO PRIVATE KEYS REQUIRED
// This script deploys using ONLY Trezor hardware wallet with ALL rights assigned to Trezor from the start

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
        explorer: 'https://testnet.bscscan.com',
        usdt: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
    },
    mainnet: {
        name: 'BSC Mainnet',
        rpc: 'https://bsc-dataseed.binance.org/',
        chainId: 56,
        explorer: 'https://bscscan.com',
        usdt: '0x55d398326f99059fF775485246999027B3197955'
    }
};

class PureTrezorDeployment {
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
            deploymentMethod: 'PURE_TREZOR_NO_PRIVATE_KEYS',
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
            verify: '🔍',
            trezor: '🔐'
        };
        console.log(`${symbols[type]} [${timestamp}] ${message}`);
    }

    async validateTrezorWallet() {
        this.log('Validating Trezor wallet configuration...', 'verify');
        
        // Check if Trezor wallet address is valid
        if (!ethers.isAddress(this.trezorAddress)) {
            throw new Error(`Invalid Trezor wallet address: ${this.trezorAddress}`);
        }

        // Check Trezor wallet balance
        const balance = await this.provider.getBalance(this.trezorAddress);
        const balanceInBNB = ethers.formatEther(balance);
        
        this.log(`Trezor wallet: ${this.trezorAddress}`, 'trezor');
        this.log(`Trezor balance: ${balanceInBNB} BNB`, 'info');

        if (parseFloat(balanceInBNB) < 0.05) {
            throw new Error(`Insufficient Trezor balance! Need at least 0.05 BNB, have ${balanceInBNB} BNB`);
        }

        this.log('✅ Trezor wallet validation passed!', 'success');
        return true;
    }

    async connectTrezor() {
        this.log('Connecting to Trezor hardware wallet...', 'trezor');
        
        // In a real implementation, this would use @trezor/connect-web
        // For now, we'll simulate the connection
        this.log('🔐 Please connect your Trezor device and unlock it', 'trezor');
        this.log('📱 Make sure Trezor Bridge is running or use Trezor Suite', 'info');
        
        // Create a mock Trezor signer that would use the hardware wallet
        // In production, this would be: const TrezorSigner = new TrezorConnect.EthereumSigner(...)
        const mockTrezorSigner = {
            address: this.trezorAddress,
            signTransaction: async (tx) => {
                this.log('🔐 Please confirm transaction on your Trezor device...', 'trezor');
                // In real implementation: return await TrezorConnect.ethereumSignTransaction(...)
                throw new Error('Trezor integration requires @trezor/connect-web package. Please install it first.');
            }
        };

        return mockTrezorSigner;
    }

    async deployWithTrezorOnly() {
        this.log('Starting pure Trezor deployment (no private keys)...', 'deploy');
        
        try {
            // Connect to Trezor
            const trezorSigner = await this.connectTrezor();
            
            // Load contract artifacts
            const contractPath = path.join(__dirname, 'artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json');
            if (!fs.existsSync(contractPath)) {
                throw new Error('Contract artifacts not found. Please run: npx hardhat compile');
            }

            const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
            
            this.log('📋 Contract deployment parameters:', 'info');
            this.log(`   • USDT Token: ${this.config.usdt}`, 'info');
            this.log(`   • Treasury: ${this.trezorAddress} (Trezor)`, 'trezor');
            this.log(`   • Emergency: ${this.trezorAddress} (Trezor)`, 'trezor');
            this.log(`   • Pool Manager: ${this.trezorAddress} (Trezor)`, 'trezor');
            this.log(`   • Owner: ${this.trezorAddress} (Trezor)`, 'trezor');

            // Prepare deployment transaction
            const deploymentData = {
                abi: contractArtifact.abi,
                bytecode: contractArtifact.bytecode,
                constructorArgs: [], // For upgradeable contracts
                initializeArgs: [
                    this.config.usdt,       // USDT token
                    this.trezorAddress,     // Treasury (Trezor)
                    this.trezorAddress,     // Emergency (Trezor)
                    this.trezorAddress      // Pool Manager (Trezor)
                ]
            };

            this.log('🔐 Deployment transaction prepared for Trezor signing', 'trezor');
            this.log('📱 Please review and confirm the deployment on your Trezor device', 'trezor');

            // In a real implementation, this would deploy using Trezor
            throw new Error('Pure Trezor deployment requires Trezor Connect integration. See implementation guide below.');

        } catch (error) {
            if (error.message.includes('Trezor integration requires')) {
                this.log('📋 TREZOR INTEGRATION SETUP REQUIRED', 'warning');
                this.showTrezorSetupInstructions();
            }
            throw error;
        }
    }

    showTrezorSetupInstructions() {
        console.log('\n' + '='.repeat(80));
        console.log('🔐 TREZOR INTEGRATION SETUP INSTRUCTIONS');
        console.log('='.repeat(80));
        console.log('');
        console.log('To deploy with pure Trezor (no private keys), you need to:');
        console.log('');
        console.log('1️⃣  Install Trezor Connect:');
        console.log('   npm install @trezor/connect-web');
        console.log('');
        console.log('2️⃣  Enable Trezor Bridge or use Trezor Suite:');
        console.log('   • Download: https://suite.trezor.io/');
        console.log('   • Or install Trezor Bridge: https://wiki.trezor.io/Trezor_Bridge');
        console.log('');
        console.log('3️⃣  Alternative: Use hardware wallet with MetaMask:');
        console.log('   • Connect Trezor to MetaMask');
        console.log('   • Use MetaMask for deployment');
        console.log('   • Run: npm run deploy:metamask');
        console.log('');
        console.log('4️⃣  Manual deployment with Trezor:');
        console.log('   • Generate deployment transaction');
        console.log('   • Sign with Trezor using Trezor Suite');
        console.log('   • Broadcast transaction');
        console.log('');
        console.log('🔄 For immediate deployment, use the simplified approach:');
        console.log('   npm run deploy:simple:trezor');
        console.log('');
        console.log('='.repeat(80));
    }

    async createSimpleTrezorDeployment() {
        this.log('Creating simplified Trezor deployment instructions...', 'deploy');
        
        // Load contract artifacts
        const contractPath = path.join(__dirname, 'artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json');
        if (!fs.existsSync(contractPath)) {
            throw new Error('Contract artifacts not found. Please run: npx hardhat compile');
        }

        const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        
        // Create deployment instructions
        const deploymentInstructions = {
            network: this.config.name,
            chainId: this.config.chainId,
            rpcUrl: this.config.rpc,
            trezorWallet: this.trezorAddress,
            contractBytecode: contractArtifact.bytecode,
            contractABI: contractArtifact.abi,
            initializeFunction: 'initialize',
            initializeArgs: [
                this.config.usdt,       // USDT token
                this.trezorAddress,     // Treasury (Trezor)
                this.trezorAddress,     // Emergency (Trezor)
                this.trezorAddress      // Pool Manager (Trezor)
            ],
            gasLimit: '3000000',
            estimatedCost: '~0.02 BNB',
            allRolesAssignedTo: this.trezorAddress
        };

        // Save deployment instructions
        const instructionsPath = path.join(__dirname, `trezor-deployment-instructions-${this.network}.json`);
        fs.writeFileSync(instructionsPath, JSON.stringify(deploymentInstructions, null, 2));

        this.log(`✅ Deployment instructions saved: ${instructionsPath}`, 'success');
        this.log('🔐 All roles will be assigned to Trezor wallet during deployment', 'trezor');

        return deploymentInstructions;
    }

    async verifyTrezorOnlyRoles(contractAddress) {
        this.log('Verifying ALL roles are assigned to Trezor only...', 'verify');
        
        const contractPath = path.join(__dirname, 'artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json');
        const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        const contract = new ethers.Contract(contractAddress, contractArtifact.abi, this.provider);

        const verificationResults = {};

        try {
            // Check ownership
            const owner = await contract.owner();
            verificationResults.owner = owner.toLowerCase() === this.trezorAddress.toLowerCase();
            this.log(`Owner: ${owner} ${verificationResults.owner ? '✅' : '❌'}`, 
                     verificationResults.owner ? 'success' : 'error');

            // Check treasury
            const treasury = await contract.treasuryAddress();
            verificationResults.treasury = treasury.toLowerCase() === this.trezorAddress.toLowerCase();
            this.log(`Treasury: ${treasury} ${verificationResults.treasury ? '✅' : '❌'}`, 
                     verificationResults.treasury ? 'success' : 'error');

            // Check emergency
            const emergency = await contract.emergencyAddress();
            verificationResults.emergency = emergency.toLowerCase() === this.trezorAddress.toLowerCase();
            this.log(`Emergency: ${emergency} ${verificationResults.emergency ? '✅' : '❌'}`, 
                     verificationResults.emergency ? 'success' : 'error');

            // Check pool manager
            const poolManager = await contract.poolManagerAddress();
            verificationResults.poolManager = poolManager.toLowerCase() === this.trezorAddress.toLowerCase();
            this.log(`Pool Manager: ${poolManager} ${verificationResults.poolManager ? '✅' : '❌'}`, 
                     verificationResults.poolManager ? 'success' : 'error');

            // Check roles
            const roles = [
                'DEFAULT_ADMIN_ROLE',
                'TREASURY_ROLE', 
                'EMERGENCY_ROLE',
                'POOL_MANAGER_ROLE',
                'UPGRADER_ROLE'
            ];

            for (const roleName of roles) {
                try {
                    const roleHash = await contract[roleName]();
                    const hasRole = await contract.hasRole(roleHash, this.trezorAddress);
                    verificationResults[roleName] = hasRole;
                    this.log(`${roleName}: ${hasRole ? '✅' : '❌'}`, hasRole ? 'success' : 'error');
                } catch (e) {
                    this.log(`${roleName}: Not available`, 'info');
                }
            }

            const allCorrect = Object.values(verificationResults).every(result => result === true);
            
            if (allCorrect) {
                this.log('🎉 ALL ROLES VERIFIED - TREZOR HAS COMPLETE CONTROL!', 'success');
                this.log('🔒 SECURITY STATUS: MAXIMUM - PURE TREZOR CONTROL', 'trezor');
            } else {
                this.log('⚠️ VERIFICATION INCOMPLETE - MANUAL REVIEW NEEDED', 'warning');
            }

            return allCorrect;

        } catch (error) {
            this.log(`Verification error: ${error.message}`, 'error');
            return false;
        }
    }

    async saveDeploymentRecord() {
        const recordPath = path.join(__dirname, `pure-trezor-deployment-${this.network}-${Date.now()}.json`);
        fs.writeFileSync(recordPath, JSON.stringify(this.deploymentRecord, null, 2));
        this.log(`Deployment record saved: ${recordPath}`, 'success');
    }

    async deploy() {
        try {
            console.log('============================================================');
            this.log(`🔐 PURE TREZOR DEPLOYMENT TO ${this.config.name.toUpperCase()}`, 'trezor');
            this.log(`🚀 NO PRIVATE KEYS - TREZOR ONLY: ${this.trezorAddress}`, 'security');
            console.log('============================================================');

            // Step 1: Validate Trezor wallet
            await this.validateTrezorWallet();

            // Step 2: Try pure Trezor deployment
            try {
                await this.deployWithTrezorOnly();
            } catch (error) {
                if (error.message.includes('Trezor integration requires')) {
                    // Step 3: Create deployment instructions for manual execution
                    this.log('Creating manual deployment instructions...', 'info');
                    const instructions = await this.createSimpleTrezorDeployment();
                    
                    // Save deployment record
                    await this.saveDeploymentRecord();

                    console.log('\n' + '='.repeat(80));
                    this.log('📋 MANUAL TREZOR DEPLOYMENT READY', 'success');
                    this.log('🔐 All roles configured for Trezor wallet only', 'trezor');
                    this.log(`📄 Instructions saved: trezor-deployment-instructions-${this.network}.json`, 'info');
                    console.log('='.repeat(80));

                    return {
                        deploymentMethod: 'MANUAL_TREZOR',
                        trezorWallet: this.trezorAddress,
                        network: this.network,
                        instructionsFile: `trezor-deployment-instructions-${this.network}.json`,
                        allRolesAssignedTo: this.trezorAddress
                    };
                } else {
                    throw error;
                }
            }

        } catch (error) {
            this.log(`Deployment preparation failed: ${error.message}`, 'error');
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

    const deployment = new PureTrezorDeployment(network);
    await deployment.deploy();
}

// Execute if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Deployment preparation failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = { PureTrezorDeployment };
