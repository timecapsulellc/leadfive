/**
 * Smart Contract Verification Script
 * 
 * Automates the process of verifying smart contracts on BSCScan
 * Ensures contract transparency and builds user trust
 * 
 * Requirements:
 * - Deployed contract address
 * - Original source code
 * - Compiler version and settings
 * - Constructor parameters
 * - BSCScan API key
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Configuration
const CONFIG = {
  BSC_MAINNET: {
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorerApi: 'https://api.bscscan.com/api',
    explorerUrl: 'https://bscscan.com'
  },
  BSC_TESTNET: {
    chainId: 97,
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    explorerApi: 'https://api-testnet.bscscan.com/api',
    explorerUrl: 'https://testnet.bscscan.com'
  }
};

class ContractVerifier {
  constructor(network = 'testnet', apiKey) {
    this.network = network === 'mainnet' ? CONFIG.BSC_MAINNET : CONFIG.BSC_TESTNET;
    this.apiKey = apiKey;
    this.provider = new ethers.JsonRpcProvider(this.network.rpcUrl);
  }

  /**
   * Verify contract source code on BSCScan
   */
  async verifyContract(contractAddress, sourceCode, contractName, compilerVersion, constructorArgs = '') {
    try {
      console.log(`\n🔍 Verifying contract at ${contractAddress}...`);
      
      // Prepare verification data
      const verificationData = {
        apikey: this.apiKey,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: contractAddress,
        sourceCode: sourceCode,
        codeformat: 'solidity-single-file',
        contractname: contractName,
        compilerversion: compilerVersion,
        optimizationUsed: '1',
        runs: '200',
        constructorArguements: constructorArgs,
        evmversion: 'default',
        licenseType: '3' // MIT License
      };

      // Submit verification request
      const response = await axios.post(this.network.explorerApi, new URLSearchParams(verificationData));
      
      if (response.data.status === '1') {
        const guid = response.data.result;
        console.log(`✅ Verification submitted successfully. GUID: ${guid}`);
        
        // Poll for verification status
        return await this.pollVerificationStatus(guid);
      } else {
        throw new Error(response.data.result);
      }
    } catch (error) {
      console.error('❌ Contract verification failed:', error.message);
      return false;
    }
  }

  /**
   * Poll verification status until completion
   */
  async pollVerificationStatus(guid) {
    const maxAttempts = 30;
    const pollInterval = 5000; // 5 seconds
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`📊 Checking verification status (attempt ${attempt}/${maxAttempts})...`);
        
        const response = await axios.get(this.network.explorerApi, {
          params: {
            apikey: this.apiKey,
            module: 'contract',
            action: 'checkverifystatus',
            guid: guid
          }
        });

        const status = response.data.result;
        
        if (status === 'Pass - Verified') {
          console.log('🎉 Contract verified successfully!');
          return true;
        } else if (status.includes('Fail')) {
          console.error('❌ Verification failed:', status);
          return false;
        } else {
          console.log(`⏳ Status: ${status}`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      } catch (error) {
        console.error('Error checking verification status:', error.message);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    console.log('⏰ Verification timeout - check manually on BSCScan');
    return false;
  }

  /**
   * Get contract ABI from verified contract
   */
  async getContractABI(contractAddress) {
    try {
      const response = await axios.get(this.network.explorerApi, {
        params: {
          module: 'contract',
          action: 'getabi',
          address: contractAddress,
          apikey: this.apiKey
        }
      });

      if (response.data.status === '1') {
        return JSON.parse(response.data.result);
      } else {
        throw new Error('Contract not verified or ABI not available');
      }
    } catch (error) {
      console.error('Error fetching contract ABI:', error.message);
      return null;
    }
  }

  /**
   * Verify contract deployment and get deployment transaction
   */
  async getDeploymentInfo(contractAddress) {
    try {
      console.log(`\n📋 Getting deployment information for ${contractAddress}...`);
      
      const code = await this.provider.getCode(contractAddress);
      if (code === '0x') {
        throw new Error('No contract found at this address');
      }

      // Get contract creation transaction
      const response = await axios.get(this.network.explorerApi, {
        params: {
          module: 'contract',
          action: 'getcontractcreation',
          contractaddresses: contractAddress,
          apikey: this.apiKey
        }
      });

      if (response.data.status === '1' && response.data.result.length > 0) {
        const deploymentInfo = response.data.result[0];
        console.log('📍 Deployment Info:');
        console.log(`   Creator: ${deploymentInfo.contractCreator}`);
        console.log(`   Transaction: ${deploymentInfo.txHash}`);
        console.log(`   Explorer: ${this.network.explorerUrl}/tx/${deploymentInfo.txHash}`);
        
        return deploymentInfo;
      } else {
        throw new Error('Deployment information not found');
      }
    } catch (error) {
      console.error('Error getting deployment info:', error.message);
      return null;
    }
  }

  /**
   * Generate verification report
   */
  generateVerificationReport(contractAddress, verificationSuccess, deploymentInfo) {
    const report = {
      timestamp: new Date().toISOString(),
      network: this.network.chainId === 56 ? 'BSC Mainnet' : 'BSC Testnet',
      contractAddress,
      explorerUrl: `${this.network.explorerUrl}/address/${contractAddress}`,
      verificationStatus: verificationSuccess ? 'VERIFIED' : 'FAILED',
      deploymentInfo: deploymentInfo || null,
      securityScore: this.calculateSecurityScore(verificationSuccess, deploymentInfo),
      recommendations: this.generateRecommendations(verificationSuccess, deploymentInfo)
    };

    // Save report to file
    const reportPath = path.join(process.cwd(), `contract-verification-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Verification Report:`);
    console.log(`   Status: ${report.verificationStatus}`);
    console.log(`   Security Score: ${report.securityScore}/100`);
    console.log(`   Explorer: ${report.explorerUrl}`);
    console.log(`   Report saved: ${reportPath}`);
    
    return report;
  }

  /**
   * Calculate security score based on verification and deployment
   */
  calculateSecurityScore(verificationSuccess, deploymentInfo) {
    let score = 0;
    
    // Base score for contract existence
    score += 20;
    
    // Verification bonus
    if (verificationSuccess) {
      score += 50;
    }
    
    // Deployment info availability
    if (deploymentInfo) {
      score += 20;
    }
    
    // Network bonus (mainnet gets higher score)
    if (this.network.chainId === 56) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Generate security recommendations
   */
  generateRecommendations(verificationSuccess, deploymentInfo) {
    const recommendations = [];
    
    if (!verificationSuccess) {
      recommendations.push({
        priority: 'HIGH',
        message: 'Contract verification failed - users cannot audit the source code',
        action: 'Re-verify contract with correct parameters and source code'
      });
    }
    
    if (!deploymentInfo) {
      recommendations.push({
        priority: 'MEDIUM',
        message: 'Deployment information not available',
        action: 'Ensure contract is properly deployed and indexed by BSCScan'
      });
    }
    
    if (verificationSuccess) {
      recommendations.push({
        priority: 'LOW',
        message: 'Contract successfully verified',
        action: 'Consider adding detailed documentation and usage examples'
      });
    }
    
    return recommendations;
  }
}

/**
 * Main verification function
 */
export async function verifyLeadFiveContract() {
  try {
    // Load configuration
    const contractConfig = JSON.parse(fs.readFileSync('./contract-config.json', 'utf8'));
    const apiKey = process.env.BSCSCAN_API_KEY;
    
    if (!apiKey) {
      throw new Error('BSCSCAN_API_KEY environment variable not set');
    }

    // Initialize verifier
    const verifier = new ContractVerifier(contractConfig.network, apiKey);
    
    // Load contract source code
    const sourceCode = fs.readFileSync(contractConfig.sourceCodePath, 'utf8');
    
    // Get deployment info
    const deploymentInfo = await verifier.getDeploymentInfo(contractConfig.contractAddress);
    
    // Verify contract
    const verificationSuccess = await verifier.verifyContract(
      contractConfig.contractAddress,
      sourceCode,
      contractConfig.contractName,
      contractConfig.compilerVersion,
      contractConfig.constructorArgs
    );
    
    // Generate report
    const report = verifier.generateVerificationReport(
      contractConfig.contractAddress,
      verificationSuccess,
      deploymentInfo
    );
    
    return report;
  } catch (error) {
    console.error('❌ Verification process failed:', error.message);
    return null;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyLeadFiveContract()
    .then(report => {
      if (report) {
        console.log('\n✅ Verification process completed');
        process.exit(0);
      } else {
        console.log('\n❌ Verification process failed');
        process.exit(1);
      }
    });
}
