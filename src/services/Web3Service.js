import { ethers } from 'ethers';
import { NETWORK_CONFIG } from '../utils/constants';
import { APP_CONFIG } from '../config/app.js';

class Web3Service {
  constructor() {
    // Use secure configuration - contract address is public information
    this.contractAddress = APP_CONFIG.contract.address;
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
          'function getUserInfo(address user) view returns (tuple(uint256 totalEarned, uint256 totalInvested, uint256 withdrawableAmount, bool isCapped, uint256 directReferrals, uint256 teamSize, uint256 matrixPosition, address leftChild, address rightChild))',
          'function getEarningsByPool(address user) view returns (uint256[5])',
          'function withdraw(uint256 amount) external',
          'function reinvest(uint256 amount) external',
          'function register(address sponsor) external payable',
          'function distributeGlobalHelpPool() external',
          'function distributeLeaderBonus() external',
          'function pauseContract() external',
          'function owner() view returns (address)',
        ];

        this.contract = new ethers.Contract(
          this.contractAddress,
          abi,
          this.signer
        );
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
      // First check if user exists in the contract
      const userInfo = await this.contract.getUserInfo(address);

      // If user doesn't exist or has no earnings data, return default values
      if (!userInfo || userInfo.totalEarned === 0n) {
        return {
          sponsorCommission: 0,
          levelBonus: 0,
          globalUplineBonus: 0,
          leaderBonus: 0,
          globalHelpPool: 0,
          totalEarned: 0,
          withdrawableAmount: 0,
          totalInvested: 0,
          isCapped: false,
          capAmount: 0,
        };
      }

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
        capAmount: (Number(userInfo.totalInvested) * 4) / 1e18,
      };
    } catch (error) {
      console.warn(
        `User ${address} not found in contract or has no data. Using default values.`
      );
      // Return default values for unregistered users
      return {
        sponsorCommission: 0,
        levelBonus: 0,
        globalUplineBonus: 0,
        leaderBonus: 0,
        globalHelpPool: 0,
        totalEarned: 0,
        withdrawableAmount: 0,
        totalInvested: 0,
        isCapped: false,
        capAmount: 0,
      };
    }
  }

  async getMatrixData(address) {
    await this.ensureInitialized();

    try {
      const userInfo = await this.contract.getUserInfo(address);

      // If user doesn't exist, return default values
      if (!userInfo) {
        return {
          position: 0,
          leftChild: null,
          rightChild: null,
          teamSize: 0,
          directReferrals: 0,
        };
      }

      return {
        position: Number(userInfo.matrixPosition),
        leftChild:
          userInfo.leftChild !== '0x0000000000000000000000000000000000000000'
            ? userInfo.leftChild
            : null,
        rightChild:
          userInfo.rightChild !== '0x0000000000000000000000000000000000000000'
            ? userInfo.rightChild
            : null,
        teamSize: Number(userInfo.teamSize),
        directReferrals: Number(userInfo.directReferrals),
      };
    } catch (error) {
      console.warn(
        `Matrix data not found for ${address}. Using default values.`
      );
      return {
        position: 0,
        leftChild: null,
        rightChild: null,
        teamSize: 0,
        directReferrals: 0,
      };
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
      maximumFractionDigits: decimals,
    });
  }

  // Enhanced genealogy tree building method
  async buildGenealogyTree(rootAddress, maxDepth = 5) {
    const visited = new Set();

    const buildNode = async (address, depth = 0) => {
      if (depth >= maxDepth || visited.has(address)) {
        return null;
      }

      visited.add(address);

      try {
        const [matrixData, earningsData] = await Promise.all([
          this.getMatrixData(address),
          this.getUserEarnings(address),
        ]);

        const node = {
          name: address === rootAddress ? 'YOU' : this.formatAddress(address),
          attributes: {
            address: address,
            earnings: `$${this.formatCurrency(earningsData.totalEarned)}`,
            withdrawable: `$${this.formatCurrency(earningsData.withdrawableAmount)}`,
            position: matrixData.position,
            directReferrals: matrixData.directReferrals,
            teamSize: matrixData.teamSize,
            isUser: address === rootAddress,
            isCapped: earningsData.isCapped,
            level: depth + 1,
          },
          children: [],
        };

        // Add left and right children
        const childPromises = [];
        if (matrixData.leftChild) {
          childPromises.push(buildNode(matrixData.leftChild, depth + 1));
        }
        if (matrixData.rightChild) {
          childPromises.push(buildNode(matrixData.rightChild, depth + 1));
        }

        const children = await Promise.all(childPromises);
        node.children = children.filter(child => child !== null);

        return node;
      } catch (error) {
        console.error(`Error building node for ${address}:`, error);
        return {
          name: this.formatAddress(address),
          attributes: {
            address: address,
            earnings: '$0.00',
            withdrawable: '$0.00',
            error: 'Failed to load',
            level: depth + 1,
          },
          children: [],
        };
      }
    };

    return await buildNode(rootAddress);
  }

  // Get team hierarchy data for genealogy view
  async getTeamHierarchy(rootAddress, maxDepth = 10) {
    const teamMembers = [];
    const visited = new Set();

    const processNode = async (address, level = 1, sponsor = null) => {
      if (visited.has(address) || level > maxDepth) return;

      visited.add(address);

      try {
        const [matrixData, earningsData] = await Promise.all([
          this.getMatrixData(address),
          this.getUserEarnings(address),
        ]);

        const memberData = {
          address: address,
          displayName:
            address === rootAddress ? 'YOU' : this.formatAddress(address),
          level: level,
          position: matrixData.position,
          totalEarnings: earningsData.totalEarned,
          withdrawableAmount: earningsData.withdrawableAmount,
          directReferrals: matrixData.directReferrals,
          teamSize: matrixData.teamSize,
          isCapped: earningsData.isCapped,
          joinDate: new Date(
            Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
          ), // Simulated
          sponsor: sponsor,
          children: [],
        };

        teamMembers.push(memberData);

        // Process children
        const childPromises = [];
        if (matrixData.leftChild) {
          childPromises.push(
            processNode(matrixData.leftChild, level + 1, address)
          );
          memberData.children.push(matrixData.leftChild);
        }
        if (matrixData.rightChild) {
          childPromises.push(
            processNode(matrixData.rightChild, level + 1, address)
          );
          memberData.children.push(matrixData.rightChild);
        }

        await Promise.all(childPromises);
      } catch (error) {
        console.error(`Error processing team member ${address}:`, error);
      }
    };

    await processNode(rootAddress);
    return teamMembers.filter(member => member.address !== rootAddress); // Exclude root user
  }
}

// Export singleton instance
export default new Web3Service();
