// METAMASK + TREZOR DEPLOYMENT - NO PRIVATE KEYS
// Connect Trezor to MetaMask and deploy with hardware wallet security

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

class MetaMaskTrezorDeployment {
    constructor(network = 'testnet') {
        this.network = network;
        this.config = NETWORK_CONFIG[network];
        this.trezorAddress = TREZOR_WALLET;
        this.deploymentRecord = {
            timestamp: new Date().toISOString(),
            network: network,
            deployer: this.trezorAddress,
            chainId: this.config.chainId,
            deploymentMethod: 'METAMASK_TREZOR_NO_PRIVATE_KEYS',
            contracts: {},
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
            metamask: '🦊',
            trezor: '🔐'
        };
        console.log(`${symbols[type]} [${timestamp}] ${message}`);
    }

    async detectMetaMask() {
        this.log('Checking for MetaMask + Trezor setup...', 'metamask');
        
        // Check if we're in a browser environment with MetaMask
        if (typeof window !== 'undefined' && window.ethereum) {
            this.log('✅ MetaMask detected', 'success');
            return window.ethereum;
        } else {
            this.log('⚠️ MetaMask not detected - showing setup instructions', 'warning');
            this.showMetaMaskTrezorSetup();
            return null;
        }
    }

    showMetaMaskTrezorSetup() {
        console.log('\n' + '='.repeat(80));
        console.log('🦊 METAMASK + TREZOR SETUP INSTRUCTIONS');
        console.log('='.repeat(80));
        console.log('');
        console.log('To deploy using MetaMask connected to your Trezor:');
        console.log('');
        console.log('1️⃣  Install MetaMask browser extension');
        console.log('   • Chrome: https://chrome.google.com/webstore/detail/metamask/');
        console.log('   • Firefox: https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/');
        console.log('');
        console.log('2️⃣  Connect Trezor to MetaMask:');
        console.log('   • Open MetaMask');
        console.log('   • Click "Connect Hardware Wallet"');
        console.log('   • Select "Trezor"');
        console.log('   • Follow the connection steps');
        console.log('');
        console.log('3️⃣  Add BSC Network to MetaMask:');
        console.log('   • Network Name: Binance Smart Chain');
        console.log(`   • RPC URL: ${this.config.rpc}`);
        console.log(`   • Chain ID: ${this.config.chainId}`);
        console.log('   • Symbol: BNB');
        console.log(`   • Block Explorer: ${this.config.explorer}`);
        console.log('');
        console.log('4️⃣  Ensure Trezor wallet is selected in MetaMask:');
        console.log(`   • Address should be: ${this.trezorAddress}`);
        console.log('   • Account should show "Hardware Wallet" indicator');
        console.log('');
        console.log('5️⃣  Open browser deployment interface:');
        console.log('   • Open: http://localhost:3000/deploy-trezor.html');
        console.log('   • Or use: npm run deploy:browser');
        console.log('');
        console.log('='.repeat(80));
    }

    createBrowserDeploymentInterface() {
        this.log('Creating browser deployment interface...', 'deploy');
        
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orphi CrowdFund - Trezor Deployment</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .status {
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 10px;
            margin: 10px 0;
        }
        .success { border-left: 4px solid #10b981; }
        .warning { border-left: 4px solid #f59e0b; }
        .error { border-left: 4px solid #ef4444; }
        .info { border-left: 4px solid #3b82f6; }
        button {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
            transition: all 0.3s ease;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        button:disabled {
            background: #6b7280;
            cursor: not-allowed;
            transform: none;
        }
        .deployment-info {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .role-assignment {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .address {
            font-family: monospace;
            background: rgba(0, 0, 0, 0.3);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Orphi CrowdFund - Pure Trezor Deployment</h1>
            <p>Deploy with hardware wallet security - No private keys required</p>
        </div>

        <div id="statusContainer">
            <div class="status info">
                <strong>🔍 Checking MetaMask + Trezor connection...</strong>
            </div>
        </div>

        <div class="deployment-info">
            <h3>🎯 Deployment Configuration</h3>
            <div class="role-assignment">
                <span><strong>Network:</strong></span>
                <span>${this.config.name} (Chain ID: ${this.config.chainId})</span>
            </div>
            <div class="role-assignment">
                <span><strong>Trezor Wallet:</strong></span>
                <span class="address">${this.trezorAddress}</span>
            </div>
            <div class="role-assignment">
                <span><strong>Contract Owner:</strong></span>
                <span class="address">${this.trezorAddress} 🔐</span>
            </div>
            <div class="role-assignment">
                <span><strong>Treasury Role:</strong></span>
                <span class="address">${this.trezorAddress} 🔐</span>
            </div>
            <div class="role-assignment">
                <span><strong>Emergency Role:</strong></span>
                <span class="address">${this.trezorAddress} 🔐</span>
            </div>
            <div class="role-assignment">
                <span><strong>Pool Manager Role:</strong></span>
                <span class="address">${this.trezorAddress} 🔐</span>
            </div>
            <div class="role-assignment">
                <span><strong>Admin Roles:</strong></span>
                <span class="address">${this.trezorAddress} 🔐</span>
            </div>
        </div>

        <div style="text-align: center;">
            <button onclick="checkConnection()">🔍 Check Connection</button>
            <button onclick="deployContract()" id="deployBtn" disabled>🚀 Deploy Contract</button>
            <button onclick="verifyDeployment()" id="verifyBtn" disabled>✅ Verify Deployment</button>
        </div>

        <div id="deploymentResult" style="margin-top: 20px;"></div>
    </div>

    <script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script>
    <script>
        const NETWORK_CONFIG = ${JSON.stringify(this.config, null, 2)};
        const TREZOR_ADDRESS = '${this.trezorAddress}';
        let provider, signer, contract;

        // Contract ABI will be loaded dynamically
        const CONTRACT_ABI = ${JSON.stringify(this.getContractABI(), null, 2)};
        const CONTRACT_BYTECODE = "${this.getContractBytecode()}";

        function addStatus(message, type = 'info') {
            const statusContainer = document.getElementById('statusContainer');
            const statusDiv = document.createElement('div');
            statusDiv.className = \`status \${type}\`;
            statusDiv.innerHTML = \`<strong>\${message}</strong>\`;
            statusContainer.appendChild(statusDiv);
            statusContainer.scrollTop = statusContainer.scrollHeight;
        }

        async function checkConnection() {
            try {
                addStatus('🔍 Checking MetaMask connection...', 'info');
                
                if (typeof window.ethereum === 'undefined') {
                    throw new Error('MetaMask not installed');
                }

                provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                if (accounts.length === 0) {
                    throw new Error('No accounts connected');
                }

                const network = await provider.getNetwork();
                if (network.chainId !== NETWORK_CONFIG.chainId) {
                    throw new Error(\`Wrong network. Expected \${NETWORK_CONFIG.chainId}, got \${network.chainId}\`);
                }

                signer = provider.getSigner();
                const address = await signer.getAddress();
                
                if (address.toLowerCase() !== TREZOR_ADDRESS.toLowerCase()) {
                    throw new Error(\`Wrong wallet connected. Expected \${TREZOR_ADDRESS}, got \${address}\`);
                }

                const balance = await provider.getBalance(address);
                const balanceInBNB = ethers.utils.formatEther(balance);

                addStatus(\`✅ Connected to \${NETWORK_CONFIG.name}\`, 'success');
                addStatus(\`🔐 Trezor wallet: \${address}\`, 'success');
                addStatus(\`💰 Balance: \${balanceInBNB} BNB\`, 'info');

                if (parseFloat(balanceInBNB) < 0.05) {
                    throw new Error('Insufficient balance for deployment');
                }

                document.getElementById('deployBtn').disabled = false;
                addStatus('🎉 Ready for deployment!', 'success');

            } catch (error) {
                addStatus(\`❌ \${error.message}\`, 'error');
                if (error.message.includes('Wrong network')) {
                    addStatus('Please switch to the correct network in MetaMask', 'warning');
                }
                if (error.message.includes('Wrong wallet')) {
                    addStatus('Please select your Trezor wallet in MetaMask', 'warning');
                }
            }
        }

        async function deployContract() {
            try {
                addStatus('🚀 Starting contract deployment...', 'info');
                addStatus('🔐 Please confirm transaction on your Trezor device', 'warning');

                const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, signer);
                
                addStatus('📋 Deployment parameters:', 'info');
                addStatus(\`   • USDT: \${NETWORK_CONFIG.usdt}\`, 'info');
                addStatus(\`   • Treasury: \${TREZOR_ADDRESS}\`, 'info');
                addStatus(\`   • Emergency: \${TREZOR_ADDRESS}\`, 'info');
                addStatus(\`   • Pool Manager: \${TREZOR_ADDRESS}\`, 'info');

                const deployTx = await factory.deploy();
                addStatus(\`📨 Deployment transaction: \${deployTx.deployTransaction.hash}\`, 'info');
                
                addStatus('⏳ Waiting for deployment confirmation...', 'info');
                const deployedContract = await deployTx.deployed();
                
                addStatus(\`✅ Contract deployed at: \${deployedContract.address}\`, 'success');
                
                // Initialize the contract
                addStatus('🔧 Initializing contract...', 'info');
                const initTx = await deployedContract.initialize(
                    NETWORK_CONFIG.usdt,
                    TREZOR_ADDRESS,
                    TREZOR_ADDRESS,
                    TREZOR_ADDRESS
                );
                
                await initTx.wait();
                addStatus('✅ Contract initialized successfully!', 'success');
                
                contract = deployedContract;
                document.getElementById('verifyBtn').disabled = false;
                
                addStatus(\`🎉 Deployment completed! Address: \${deployedContract.address}\`, 'success');
                addStatus(\`🔍 View on explorer: \${NETWORK_CONFIG.explorer}/address/\${deployedContract.address}\`, 'info');

            } catch (error) {
                addStatus(\`❌ Deployment failed: \${error.message}\`, 'error');
                if (error.message.includes('user rejected')) {
                    addStatus('🔐 Transaction rejected on Trezor device', 'warning');
                }
            }
        }

        async function verifyDeployment() {
            if (!contract) {
                addStatus('❌ No contract deployed yet', 'error');
                return;
            }

            try {
                addStatus('🔍 Verifying role assignments...', 'info');
                
                const owner = await contract.owner();
                const treasury = await contract.treasuryAddress();
                const emergency = await contract.emergencyAddress();
                const poolManager = await contract.poolManagerAddress();

                const checks = [
                    { name: 'Owner', address: owner },
                    { name: 'Treasury', address: treasury },
                    { name: 'Emergency', address: emergency },
                    { name: 'Pool Manager', address: poolManager }
                ];

                let allCorrect = true;
                for (const check of checks) {
                    const isCorrect = check.address.toLowerCase() === TREZOR_ADDRESS.toLowerCase();
                    addStatus(\`\${isCorrect ? '✅' : '❌'} \${check.name}: \${check.address}\`, isCorrect ? 'success' : 'error');
                    if (!isCorrect) allCorrect = false;
                }

                if (allCorrect) {
                    addStatus('🎉 ALL ROLES VERIFIED - TREZOR HAS COMPLETE CONTROL!', 'success');
                    addStatus('🔒 SECURITY STATUS: MAXIMUM', 'success');
                } else {
                    addStatus('⚠️ VERIFICATION FAILED - MANUAL REVIEW NEEDED', 'warning');
                }

            } catch (error) {
                addStatus(\`❌ Verification failed: \${error.message}\`, 'error');
            }
        }

        // Auto-check connection on page load
        window.addEventListener('load', () => {
            setTimeout(checkConnection, 1000);
        });
    </script>
</body>
</html>`;

        const htmlPath = path.join(__dirname, 'deploy-trezor.html');
        fs.writeFileSync(htmlPath, htmlContent);
        
        this.log(`✅ Browser interface created: ${htmlPath}`, 'success');
        this.log('🌐 Open in browser: file://' + htmlPath, 'info');
        
        return htmlPath;
    }

    getContractABI() {
        try {
            const contractPath = path.join(__dirname, 'artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json');
            if (fs.existsSync(contractPath)) {
                const artifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
                return artifact.abi;
            }
        } catch (error) {
            this.log('⚠️ Could not load contract ABI', 'warning');
        }
        return [];
    }

    getContractBytecode() {
        try {
            const contractPath = path.join(__dirname, 'artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json');
            if (fs.existsSync(contractPath)) {
                const artifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
                return artifact.bytecode;
            }
        } catch (error) {
            this.log('⚠️ Could not load contract bytecode', 'warning');
        }
        return '';
    }

    async deploy() {
        try {
            console.log('============================================================');
            this.log(`🦊 METAMASK + TREZOR DEPLOYMENT TO ${this.config.name.toUpperCase()}`, 'metamask');
            this.log(`🔐 NO PRIVATE KEYS - HARDWARE WALLET ONLY`, 'security');
            console.log('============================================================');

            // Check if artifacts exist
            const contractPath = path.join(__dirname, 'artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json');
            if (!fs.existsSync(contractPath)) {
                this.log('⚠️ Contract artifacts not found. Running compilation...', 'warning');
                const { execSync } = require('child_process');
                execSync('npx hardhat compile', { cwd: __dirname, stdio: 'inherit' });
            }

            // Detect MetaMask
            const ethereum = await this.detectMetaMask();
            
            if (!ethereum) {
                // Create browser interface for manual deployment
                const htmlPath = this.createBrowserDeploymentInterface();
                
                console.log('\n' + '='.repeat(80));
                this.log('🦊 BROWSER DEPLOYMENT INTERFACE READY', 'success');
                this.log(`📄 Open: ${htmlPath}`, 'info');
                this.log('🔐 All roles will be assigned to Trezor wallet', 'security');
                console.log('='.repeat(80));

                return {
                    deploymentMethod: 'BROWSER_METAMASK_TREZOR',
                    interfaceFile: htmlPath,
                    trezorWallet: this.trezorAddress,
                    network: this.network,
                    allRolesAssignedTo: this.trezorAddress
                };
            }

        } catch (error) {
            this.log(`Deployment preparation failed: ${error.message}`, 'error');
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

    const deployment = new MetaMaskTrezorDeployment(network);
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

module.exports = { MetaMaskTrezorDeployment };
