// Simple JavaScript Web3 Integration for LeadFive
// No frameworks required - just vanilla JavaScript

class LeadFiveWeb3 {
  constructor() {
    this.contractAddress = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
    this.usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
    this.sponsorAddress = '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335';
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.usdtContract = null;
    this.account = '';

    // Minimal ABI
    this.contractABI = [
      "function register(address sponsor, uint8 packageLevel, bool useUSDT) payable",
      "function getUserBasicInfo(address user) view returns (bool, uint8, uint256)",
      "function getUserEarnings(address user) view returns (uint256, uint256, uint32)",
      "function getPackagePrice(uint8 packageLevel) view returns (uint256)",
      "function withdraw(uint256 amount)",
      "function calculateWithdrawalRate(address user) view returns (uint8)"
    ];

    this.usdtABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)"
    ];

    this.packages = {
      1: { name: 'Starter', price: '30' },
      2: { name: 'Basic', price: '50' },
      3: { name: 'Premium', price: '100' },
      4: { name: 'VIP', price: '200' }
    };
  }

  // Connect to MetaMask
  async connect() {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = accounts[0];

      // Check network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== 56) {
        throw new Error('Please switch to BSC Mainnet (Chain ID: 56)');
      }

      // Initialize contracts
      this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);
      this.usdtContract = new ethers.Contract(this.usdtAddress, this.usdtABI, this.signer);

      console.log('✅ Connected to wallet:', this.account);
      return { success: true, account: this.account };

    } catch (error) {
      console.error('❌ Connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user information
  async getUserInfo(userAddress = null) {
    try {
      const address = userAddress || this.account;
      if (!this.contract || !address) {
        throw new Error('Contract not connected or address not provided');
      }

      const [basicInfo, earnings] = await Promise.all([
        this.contract.getUserBasicInfo(address),
        this.contract.getUserEarnings(address)
      ]);

      let withdrawalRate = 0;
      if (basicInfo[0]) { // If user is registered
        withdrawalRate = await this.contract.calculateWithdrawalRate(address);
      }

      return {
        isRegistered: basicInfo[0],
        packageLevel: Number(basicInfo[1]),
        balance: ethers.formatUnits(basicInfo[2], 18),
        totalEarnings: ethers.formatUnits(earnings[0], 18),
        earningsCap: ethers.formatUnits(earnings[1], 18),
        directReferrals: Number(earnings[2]),
        withdrawalRate: Number(withdrawalRate)
      };

    } catch (error) {
      console.error('Failed to get user info:', error);
      throw error;
    }
  }

  // Get USDT balance
  async getUsdtBalance(userAddress = null) {
    try {
      const address = userAddress || this.account;
      if (!this.usdtContract || !address) {
        throw new Error('USDT contract not connected or address not provided');
      }

      const balance = await this.usdtContract.balanceOf(address);
      return ethers.formatUnits(balance, 18);

    } catch (error) {
      console.error('Failed to get USDT balance:', error);
      throw error;
    }
  }

  // Register user
  async register(packageLevel, sponsorAddress = null, progressCallback = null) {
    try {
      if (!this.contract || !this.usdtContract) {
        throw new Error('Contracts not connected');
      }

      const sponsor = sponsorAddress || this.sponsorAddress;
      
      if (progressCallback) progressCallback('Getting package price...');
      const packagePrice = await this.contract.getPackagePrice(packageLevel);
      
      if (progressCallback) progressCallback('Checking USDT balance...');
      const balance = await this.usdtContract.balanceOf(this.account);
      if (balance < packagePrice) {
        throw new Error(`Insufficient USDT balance. Need ${ethers.formatUnits(packagePrice, 18)} USDT`);
      }

      if (progressCallback) progressCallback('Checking USDT allowance...');
      const allowance = await this.usdtContract.allowance(this.account, this.contractAddress);
      
      if (allowance < packagePrice) {
        if (progressCallback) progressCallback('Approving USDT...');
        const approveTx = await this.usdtContract.approve(this.contractAddress, packagePrice);
        await approveTx.wait();
      }

      if (progressCallback) progressCallback('Registering user...');
      const tx = await this.contract.register(sponsor, packageLevel, true);
      
      if (progressCallback) progressCallback('Waiting for confirmation...');
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        packageLevel: packageLevel,
        price: ethers.formatUnits(packagePrice, 18)
      };

    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Withdraw funds
  async withdraw(amount, progressCallback = null) {
    try {
      if (!this.contract) {
        throw new Error('Contract not connected');
      }

      if (progressCallback) progressCallback('Processing withdrawal...');
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await this.contract.withdraw(amountWei);
      
      if (progressCallback) progressCallback('Waiting for confirmation...');
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        amount: amount
      };

    } catch (error) {
      console.error('Withdrawal failed:', error);
      throw error;
    }
  }

  // Get package information
  getPackageInfo(level) {
    return this.packages[level] || null;
  }

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Get BSCScan link
  getBSCScanLink(hash, type = 'tx') {
    return `https://bscscan.com/${type}/${hash}`;
  }

  // Check if wallet is connected
  isConnected() {
    return !!(this.provider && this.signer && this.account);
  }
}

// Usage example:
/*
const leadFive = new LeadFiveWeb3();

// Connect wallet
const result = await leadFive.connect();
if (result.success) {
  console.log('Connected to:', result.account);
  
  // Get user info
  const userInfo = await leadFive.getUserInfo();
  console.log('User info:', userInfo);
  
  // Register user (if not registered)
  if (!userInfo.isRegistered) {
    await leadFive.register(1, null, (status) => {
      console.log('Status:', status);
    });
  }
  
  // Withdraw funds (if balance > 0)
  if (parseFloat(userInfo.balance) > 0) {
    await leadFive.withdraw(1.0, (status) => {
      console.log('Status:', status);
    });
  }
}
*/

// Make it available globally
if (typeof window !== 'undefined') {
  window.LeadFiveWeb3 = LeadFiveWeb3;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeadFiveWeb3;
}
