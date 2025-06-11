
import { ethers } from 'ethers';
import { NETWORK_CONFIG } from '../utils/constants';

class Web3Service {
  constructor() {
    this.contractAddress = process.env.VITE_CONTRACT_ADDRESS || '0x5ab22F4d339B66C1859029d2c2540d8BefCbdED4';
    this.contract = null;
    this.provider = null;
    this.signer = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        // Contract ABI (simplified for key functions)
        const abi = [
          "function getUserInfo(address user) view returns (tuple(uint256 totalEarned, uint256 totalInvested, uint256 withdrawableAmount, bool isCapped, uint256 directReferrals, uint256 teamSize, uint256 matrixPosition, address leftChild, address rightChild))",
          "function getEarningsByPool(address user) view returns (uint256[5])",
          "function withdraw(uint256 amount) external",
          "function reinvest(uint256 amount) external",
          "function register(address sponsor) external payable",
          "function distributeGlobalHelpPool() external",
          "function distributeLeaderBonus() external",
          "function pauseContract() external",
          "function owner() view returns (address)"
        ];
        
        this.contract = new ethers.Contract(this.contractAddress, abi, this.signer);
        this.isInitialized = true;
        console.log('Web3Service initialized successfully');
      } else {
        throw new Error('MetaMask not detected');
      }
    } catch (error) {
      console.error('Failed to initialize Web3Service:', error);
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  async getUserEarnings(address) {
    await this.ensureInitialized();
    
    try {
      const userInfo = await this.contract.getUserInfo(address);
      const earningsByPool = await this.contract.getEarningsByPool(address);
      
      return {
        sponsorCommission: Number(earningsByPool[0]) / 1e18,
        levelBonus: Number(earningsByPool[1]) / 1e18,
        globalUplineBonus: Number(earningsByPool[2]) / 1e18,
        leaderBonus: Number(earningsByPool[3]) / 1e18,
        globalHelpPool: Number(earningsByPool[4]) / 1e18,
        totalEarned: Number(userInfo.totalEarned) / 1e18,
        withdrawableAmount: Number(userInfo.withdrawableAmount) / 1e18,
        totalInvested: Number(userInfo.totalInvested) / 1e18,
        isCapped: userInfo.isCapped,
        capAmount: Number(userInfo.totalInvested) * 4 / 1e18
      };
    } catch (error) {
      console.error('Error fetching user earnings:', error);
      throw error;
    }
  }

  async getMatrixData(address) {
    await this.ensureInitialized();
    
    try {
      const userInfo = await this.contract.getUserInfo(address);
      
      return {
        position: Number(userInfo.matrixPosition),
        leftChild: userInfo.leftChild !== '0x0000000000000000000000000000000000000000' ? userInfo.leftChild : null,
        rightChild: userInfo.rightChild !== '0x0000000000000000000000000000000000000000' ? userInfo.rightChild : null,
        teamSize: Number(userInfo.teamSize),
        directReferrals: Number(userInfo.directReferrals)
      };
    } catch (error) {
      console.error('Error fetching matrix data:', error);
      throw error;
    }
  }

  async withdraw(amount) {
    await this.ensureInitialized();
    
    try {
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await this.contract.withdraw(amountWei);
      return await tx.wait();
    } catch (error) {
      console.error('Error withdrawing:', error);
      throw error;
    }
  }

  async reinvest(amount) {
    await this.ensureInitialized();
    
    try {
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await this.contract.reinvest(amountWei);
      return await tx.wait();
    } catch (error) {
      console.error('Error reinvesting:', error);
      throw error;
    }
  }

  // Admin functions
  async isAdmin(address) {
    await this.ensureInitialized();
    
    try {
      const owner = await this.contract.owner();
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  async distributeGlobalHelpPool() {
    await this.ensureInitialized();
    
    try {
      const tx = await this.contract.distributeGlobalHelpPool();
      return await tx.wait();
    } catch (error) {
      console.error('Error distributing global help pool:', error);
      throw error;
    }
  }

  async distributeLeaderBonus() {
    await this.ensureInitialized();
    
    try {
      const tx = await this.contract.distributeLeaderBonus();
      return await tx.wait();
    } catch (error) {
      console.error('Error distributing leader bonus:', error);
      throw error;
    }
  }

  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatCurrency(amount, decimals = 2) {
    return Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }
}

// Export singleton instance
export default new Web3Service();
