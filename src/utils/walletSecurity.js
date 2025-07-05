/* global process */
/**
 * Wallet Security Manager
 * Enhanced security for wallet connections and transactions
 */

import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

// ============ WALLET VERIFICATION ============
class WalletVerifier {
  constructor() {
    this.trustedWallets = new Set(['MetaMask', 'WalletConnect', 'Coinbase']);
    this.securityChecks = new Map();
    this.sessionTimeouts = new Map();
    this.signatureCache = new Map();
    this.setupSecurityMonitoring();
  }

  // Verify wallet provider security
  async verifyWalletProvider(provider) {
    const checks = {
      isProviderValid: false,
      isTrustedWallet: false,
      hasSecureConnection: false,
      isNetworkCorrect: false,
      hasValidCertificate: false,
      providerIntegrity: false,
    };

    try {
      // Check if provider exists and is valid
      if (!provider || !provider.request) {
        throw new Error('Invalid wallet provider');
      }
      checks.isProviderValid = true;

      // Check if it's a trusted wallet
      const providerName = await this.getProviderName(provider);
      checks.isTrustedWallet = this.trustedWallets.has(providerName);

      // Check for secure connection (HTTPS)
      checks.hasSecureConnection =
        window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost';

      // Verify network
      const network = await provider.getNetwork?.();
      if (network) {
        checks.isNetworkCorrect = this.isNetworkAllowed(network.chainId);
      }

      // Check provider integrity
      checks.providerIntegrity = await this.verifyProviderIntegrity(provider);

      // Certificate check (for production)
      if (process.env.NODE_ENV === 'production') {
        checks.hasValidCertificate = await this.validateSSLCertificate();
      } else {
        checks.hasValidCertificate = true;
      }
    } catch (error) {
      console.error('Wallet provider verification failed:', error);
    }

    const securityScore = this.calculateSecurityScore(checks);

    return {
      checks,
      securityScore,
      isSecure: securityScore >= 80,
      recommendations: this.generateSecurityRecommendations(checks),
    };
  }

  // Get provider name
  async getProviderName(provider) {
    try {
      if (provider.isMetaMask) return 'MetaMask';
      if (provider.isCoinbaseWallet) return 'Coinbase';
      if (provider.isWalletConnect) return 'WalletConnect';
      if (provider.isTrust) return 'Trust Wallet';

      // Try to detect from user agent or other methods
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('metamask')) return 'MetaMask';

      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  // Check if network is allowed
  isNetworkAllowed(chainId) {
    const allowedChainIds = [
      1, // Ethereum Mainnet
      56, // BSC Mainnet
      137, // Polygon Mainnet
      250, // Fantom Mainnet
      43114, // Avalanche Mainnet
      // Testnets
      5, // Goerli
      97, // BSC Testnet
      80001, // Mumbai
    ];

    return allowedChainIds.includes(Number(chainId));
  }

  // Verify provider integrity
  async verifyProviderIntegrity(provider) {
    try {
      // Check if provider methods exist and are functions
      const requiredMethods = ['request', 'on', 'removeListener'];
      for (const method of requiredMethods) {
        if (typeof provider[method] !== 'function') {
          return false;
        }
      }

      // Test a simple request to ensure provider is responding
      await provider.request({ method: 'eth_chainId' });

      return true;
    } catch (error) {
      console.error('Provider integrity check failed:', error);
      return false;
    }
  }

  // Validate SSL certificate
  async validateSSLCertificate() {
    try {
      // This is a simplified check - in production, you'd want more thorough validation
      const response = await fetch('/api/health', { method: 'HEAD' });
      return response.status < 400;
    } catch (error) {
      return false;
    }
  }

  // Calculate security score
  calculateSecurityScore(checks) {
    const weights = {
      isProviderValid: 25,
      isTrustedWallet: 20,
      hasSecureConnection: 20,
      isNetworkCorrect: 15,
      hasValidCertificate: 10,
      providerIntegrity: 10,
    };

    let score = 0;
    for (const [check, passed] of Object.entries(checks)) {
      if (passed && weights[check]) {
        score += weights[check];
      }
    }

    return score;
  }

  // Generate security recommendations
  generateSecurityRecommendations(checks) {
    const recommendations = [];

    if (!checks.isProviderValid) {
      recommendations.push({
        level: 'critical',
        message: 'Invalid wallet provider detected',
        action: 'Use a supported wallet like MetaMask',
      });
    }

    if (!checks.isTrustedWallet) {
      recommendations.push({
        level: 'warning',
        message: 'Unrecognized wallet provider',
        action: 'Consider using a trusted wallet for better security',
      });
    }

    if (!checks.hasSecureConnection) {
      recommendations.push({
        level: 'critical',
        message: 'Insecure connection detected',
        action: 'Access the application over HTTPS',
      });
    }

    if (!checks.isNetworkCorrect) {
      recommendations.push({
        level: 'warning',
        message: 'Unsupported network detected',
        action: 'Switch to a supported network',
      });
    }

    if (!checks.hasValidCertificate) {
      recommendations.push({
        level: 'error',
        message: 'SSL certificate validation failed',
        action: 'Check your internet connection and certificate validity',
      });
    }

    return recommendations;
  }

  // Setup security monitoring
  setupSecurityMonitoring() {
    // Monitor for suspicious activity
    setInterval(() => {
      this.monitorSuspiciousActivity();
    }, 30000); // Check every 30 seconds

    // Clean up expired sessions
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000); // Check every minute
  }

  // Monitor for suspicious activity
  monitorSuspiciousActivity() {
    // Check for rapid connection attempts
    const now = Date.now();
    for (const [address, checks] of this.securityChecks.entries()) {
      const recentChecks = checks.filter(
        check => now - check.timestamp < 60000
      );

      if (recentChecks.length > 5) {
        console.warn(`Suspicious activity detected for address: ${address}`);
        this.handleSuspiciousActivity(address);
      }
    }
  }

  // Handle suspicious activity
  handleSuspiciousActivity(address) {
    // Implement rate limiting or blocking
    const existing = this.securityChecks.get(address) || [];
    existing.push({
      type: 'suspicious_activity',
      timestamp: Date.now(),
      action: 'rate_limited',
    });
    this.securityChecks.set(address, existing);
  }

  // Clean up expired sessions
  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [address, timeout] of this.sessionTimeouts.entries()) {
      if (now > timeout) {
        this.sessionTimeouts.delete(address);
        console.log(`Session expired for address: ${address}`);
      }
    }
  }
}

// ============ TRANSACTION SECURITY ============
class TransactionSecurityManager {
  constructor() {
    this.pendingTransactions = new Map();
    this.transactionHistory = new Map();
    this.securityThresholds = {
      highValue: ethers.parseEther('1.0'), // 1 ETH equivalent
      maxDailyVolume: ethers.parseEther('10.0'), // 10 ETH equivalent
      maxTransactionsPerHour: 10,
    };
  }

  // Analyze transaction security
  async analyzeTransaction(transaction, userAddress) {
    const analysis = {
      riskLevel: 'low',
      warnings: [],
      requiresConfirmation: false,
      securityScore: 100,
    };

    try {
      // Check transaction value
      if (
        transaction.value &&
        BigInt(transaction.value) > this.securityThresholds.highValue
      ) {
        analysis.warnings.push({
          type: 'high_value',
          message: 'High value transaction detected',
          severity: 'warning',
        });
        analysis.requiresConfirmation = true;
        analysis.securityScore -= 20;
      }

      // Check daily volume
      const dailyVolume = await this.getDailyVolume(userAddress);
      if (
        dailyVolume + BigInt(transaction.value || 0) >
        this.securityThresholds.maxDailyVolume
      ) {
        analysis.warnings.push({
          type: 'daily_limit',
          message: 'Daily transaction volume limit exceeded',
          severity: 'error',
        });
        analysis.riskLevel = 'high';
        analysis.securityScore -= 50;
      }

      // Check transaction frequency
      const hourlyCount = await this.getHourlyTransactionCount(userAddress);
      if (hourlyCount >= this.securityThresholds.maxTransactionsPerHour) {
        analysis.warnings.push({
          type: 'frequency_limit',
          message: 'Too many transactions in the last hour',
          severity: 'warning',
        });
        analysis.requiresConfirmation = true;
        analysis.securityScore -= 30;
      }

      // Verify recipient address
      if (transaction.to) {
        const recipientCheck = await this.verifyRecipientAddress(
          transaction.to
        );
        if (!recipientCheck.isSafe) {
          analysis.warnings.push({
            type: 'suspicious_recipient',
            message: recipientCheck.reason,
            severity: 'error',
          });
          analysis.riskLevel = 'high';
          analysis.securityScore -= 60;
        }
      }

      // Check gas price
      if (transaction.gasPrice) {
        const gasPriceCheck = await this.checkGasPrice(transaction.gasPrice);
        if (!gasPriceCheck.isReasonable) {
          analysis.warnings.push({
            type: 'unusual_gas_price',
            message: gasPriceCheck.message,
            severity: 'warning',
          });
          analysis.securityScore -= 15;
        }
      }

      // Set final risk level
      if (analysis.securityScore < 50) {
        analysis.riskLevel = 'high';
      } else if (analysis.securityScore < 80) {
        analysis.riskLevel = 'medium';
      }
    } catch (error) {
      console.error('Transaction analysis failed:', error);
      analysis.warnings.push({
        type: 'analysis_error',
        message: 'Security analysis failed',
        severity: 'error',
      });
      analysis.riskLevel = 'high';
    }

    return analysis;
  }

  // Get daily transaction volume
  async getDailyVolume(userAddress) {
    const now = Date.now();
    const dayStart = now - 24 * 60 * 60 * 1000;

    const history = this.transactionHistory.get(userAddress) || [];
    const dayTransactions = history.filter(tx => tx.timestamp > dayStart);

    return dayTransactions.reduce(
      (total, tx) => total + BigInt(tx.value || 0),
      BigInt(0)
    );
  }

  // Get hourly transaction count
  async getHourlyTransactionCount(userAddress) {
    const now = Date.now();
    const hourStart = now - 60 * 60 * 1000;

    const history = this.transactionHistory.get(userAddress) || [];
    return history.filter(tx => tx.timestamp > hourStart).length;
  }

  // Verify recipient address
  async verifyRecipientAddress(address) {
    // Known blacklisted addresses (this would typically come from a service)
    const blacklistedAddresses = new Set([
      // Add known malicious addresses
    ]);

    if (blacklistedAddresses.has(address.toLowerCase())) {
      return {
        isSafe: false,
        reason: 'Recipient address is blacklisted',
      };
    }

    // Check if address is a contract
    try {
      const code = await window.ethereum?.request({
        method: 'eth_getCode',
        params: [address, 'latest'],
      });

      if (code && code !== '0x') {
        return {
          isSafe: true,
          reason: 'Recipient is a smart contract',
          isContract: true,
        };
      }
    } catch (error) {
      console.warn('Could not verify recipient address:', error);
    }

    return { isSafe: true };
  }

  // Check gas price reasonableness
  async checkGasPrice(gasPrice) {
    try {
      // Get current gas price from network
      const currentGasPrice = await window.ethereum?.request({
        method: 'eth_gasPrice',
      });

      if (currentGasPrice) {
        const current = BigInt(currentGasPrice);
        const provided = BigInt(gasPrice);

        // Check if gas price is more than 5x current
        if (provided > current * BigInt(5)) {
          return {
            isReasonable: false,
            message: 'Gas price is unusually high',
          };
        }

        // Check if gas price is less than 0.1x current
        if (provided < current / BigInt(10)) {
          return {
            isReasonable: false,
            message: 'Gas price may be too low',
          };
        }
      }

      return { isReasonable: true };
    } catch (error) {
      return { isReasonable: true }; // Default to safe if check fails
    }
  }

  // Record transaction
  recordTransaction(userAddress, transaction) {
    const history = this.transactionHistory.get(userAddress) || [];
    history.push({
      ...transaction,
      timestamp: Date.now(),
    });

    // Keep only last 100 transactions
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    this.transactionHistory.set(userAddress, history);
  }
}

// ============ SIGNATURE VERIFICATION ============
class SignatureVerifier {
  constructor() {
    this.signatureCache = new Map();
    this.nonceTracker = new Map();
  }

  // Generate secure nonce
  generateNonce(address) {
    const timestamp = Date.now();
    const random = Math.random().toString(36);
    const nonce = `${address}_${timestamp}_${random}`;

    // Store nonce with expiration
    this.nonceTracker.set(nonce, {
      address,
      timestamp,
      used: false,
      expiry: timestamp + 5 * 60 * 1000, // 5 minutes
    });

    return nonce;
  }

  // Verify signature
  async verifySignature(message, signature, expectedAddress) {
    try {
      // Recover address from signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      // Check if addresses match
      if (recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
        return {
          isValid: false,
          error: 'Signature does not match expected address',
        };
      }

      // Verify nonce if included in message
      const nonceMatch = message.match(/Nonce: ([^\n]+)/);
      if (nonceMatch) {
        const nonce = nonceMatch[1];
        const nonceData = this.nonceTracker.get(nonce);

        if (!nonceData) {
          return {
            isValid: false,
            error: 'Invalid or expired nonce',
          };
        }

        if (nonceData.used) {
          return {
            isValid: false,
            error: 'Nonce has already been used',
          };
        }

        if (Date.now() > nonceData.expiry) {
          return {
            isValid: false,
            error: 'Nonce has expired',
          };
        }

        // Mark nonce as used
        nonceData.used = true;
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: `Signature verification failed: ${error.message}`,
      };
    }
  }

  // Clean up expired nonces
  cleanupNonces() {
    const now = Date.now();
    for (const [nonce, data] of this.nonceTracker.entries()) {
      if (now > data.expiry) {
        this.nonceTracker.delete(nonce);
      }
    }
  }
}

// ============ EXPORTS ============
export const walletVerifier = new WalletVerifier();
export const transactionSecurity = new TransactionSecurityManager();
export const signatureVerifier = new SignatureVerifier();

// Utility functions
export const verifyWalletConnection = async (provider, address) => {
  const providerCheck = await walletVerifier.verifyWalletProvider(provider);

  return {
    provider: providerCheck,
    address: {
      isValid: ethers.isAddress(address),
      checksumAddress: ethers.getAddress(address),
    },
    overall: providerCheck.isSecure && ethers.isAddress(address),
  };
};

export const createSecureMessage = (address, action, data = {}) => {
  const nonce = signatureVerifier.generateNonce(address);
  const timestamp = Date.now();

  return `Please sign this message to verify your wallet:

Action: ${action}
Address: ${address}
Timestamp: ${timestamp}
Nonce: ${nonce}
Data: ${JSON.stringify(data)}

This signature will not trigger any blockchain transaction.`;
};

export const validateSecureTransaction = async (transaction, userAddress) => {
  const analysis = await transactionSecurity.analyzeTransaction(
    transaction,
    userAddress
  );

  if (analysis.riskLevel === 'high') {
    throw new Error(
      `Transaction rejected: ${analysis.warnings.map(w => w.message).join(', ')}`
    );
  }

  return analysis;
};

export default {
  walletVerifier,
  transactionSecurity,
  signatureVerifier,
  verifyWalletConnection,
  createSecureMessage,
  validateSecureTransaction,
};
