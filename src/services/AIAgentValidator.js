/**
 * LEADFIVE AI AGENT VALIDATOR
 * Validation layer for contract queries, compensation calculations, and business logic
 */

import CompensationService from './CompensationService.js';
import KnowledgeBaseManager from './KnowledgeBaseManager.js';
import { APP_CONFIG } from '../config/app.js';

class AIAgentValidator {
  constructor() {
    this.compensationService = new CompensationService();
    this.knowledgeBase = new KnowledgeBaseManager();
    this.validationRules = this.loadValidationRules();
    this.accuracyMetrics = {
      totalQueries: 0,
      validQueries: 0,
      errorQueries: 0,
      averageResponseTime: 0,
    };
  }

  loadValidationRules() {
    return {
      contract: {
        allowedMethods: [
          'getUserInfo',
          'getPackageInfo',
          'getPendingRewards',
          'getPoolBalances',
          'register',
          'withdraw',
          'claimRewards',
        ],
        requiresAuth: ['register', 'withdraw', 'claimRewards'],
        gasLimits: {
          register: 500000,
          withdraw: 200000,
          claimRewards: 150000,
        },
      },
      compensation: {
        maxPackageLevel: 4,
        minPackageLevel: 1,
        maxWithdrawalPerDay: 10000, // USDT
        minWithdrawalAmount: 10, // USDT
      },
      business: {
        maxReferralDepth: 5,
        poolDistributionFrequency: 30, // days
        rankAdvancementCriteria: {
          1: { volume: 1000, referrals: 5 },
          2: { volume: 5000, referrals: 15 },
          3: { volume: 15000, referrals: 50 },
          4: { volume: 50000, referrals: 150 },
          5: { volume: 150000, referrals: 500 },
        },
      },
    };
  }

  /**
   * Main validation entry point
   */
  async validateQuery(queryType, queryData, userContext = null) {
    const startTime = Date.now();
    this.accuracyMetrics.totalQueries++;

    try {
      console.log(`🔍 Validating ${queryType} query...`);

      const validator = this.getValidator(queryType);
      if (!validator) {
        throw new Error(`Unknown query type: ${queryType}`);
      }

      const result = await validator.call(this, queryData, userContext);

      // Track metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);

      return {
        valid: true,
        result: result,
        queryType: queryType,
        responseTime: responseTime,
        timestamp: new Date().toISOString(),
        validator: 'AIAgentValidator',
      };
    } catch (error) {
      console.error(`❌ Validation failed for ${queryType}:`, error);

      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);

      return {
        valid: false,
        error: error.message,
        queryType: queryType,
        responseTime: responseTime,
        timestamp: new Date().toISOString(),
        validator: 'AIAgentValidator',
      };
    }
  }

  getValidator(queryType) {
    const validators = {
      contract: this.validateContractQuery,
      compensation: this.validateCompensationQuery,
      business_logic: this.validateBusinessLogic,
      knowledge: this.validateKnowledgeQuery,
      user_action: this.validateUserAction,
    };

    return validators[queryType];
  }

  /**
   * Validate contract-related queries
   */
  async validateContractQuery(queryData, userContext) {
    const { method, params = [], userAddress } = queryData;

    // Check if method is allowed
    if (!this.validationRules.contract.allowedMethods.includes(method)) {
      throw new Error(`Contract method '${method}' is not allowed`);
    }

    // Check authentication requirements
    if (
      this.validationRules.contract.requiresAuth.includes(method) &&
      !userAddress
    ) {
      throw new Error(`Method '${method}' requires user authentication`);
    }

    // Validate parameters based on method
    await this.validateMethodParameters(method, params);

    // Execute contract call with gas estimation
    try {
      const gasEstimate =
        this.validationRules.contract.gasLimits[method] || 100000;

      if (this.validationRules.contract.requiresAuth.includes(method)) {
        // Read-only validation for auth-required methods
        return {
          method: method,
          params: params,
          gasEstimate: gasEstimate,
          requiresAuth: true,
          validated: true,
          note: 'This method requires user wallet connection to execute',
        };
      } else {
        // Execute read-only contract call
        const result = await this.compensationService.contract[method](
          ...params
        );
        return {
          method: method,
          params: params,
          result: this.formatContractResult(result, method),
          gasEstimate: gasEstimate,
          validated: true,
        };
      }
    } catch (error) {
      throw new Error(`Contract call failed: ${error.message}`);
    }
  }

  async validateMethodParameters(method, params) {
    switch (method) {
      case 'getUserInfo':
      case 'getPendingRewards':
        if (!params[0] || !this.isValidAddress(params[0])) {
          throw new Error('Valid Ethereum address required');
        }
        break;

      case 'getPackageInfo':
        const packageLevel = parseInt(params[0]);
        if (packageLevel < 1 || packageLevel > 4) {
          throw new Error('Package level must be between 1 and 4');
        }
        break;

      case 'register':
        if (!this.isValidAddress(params[0])) {
          throw new Error('Valid referrer address required');
        }
        const regPackageLevel = parseInt(params[1]);
        if (regPackageLevel < 1 || regPackageLevel > 4) {
          throw new Error('Package level must be between 1 and 4');
        }
        break;
    }
  }

  isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  formatContractResult(result, method) {
    switch (method) {
      case 'getUserInfo':
        return {
          isRegistered: result.isRegistered,
          packageLevel: Number(result.packageLevel),
          totalEarnings: result.totalEarnings.toString(),
          balance: result.balance.toString(),
          directReferrals: Number(result.directReferrals),
          teamSize: Number(result.teamSize),
          rank: Number(result.rank),
          isActive: result.isActive,
        };

      case 'getPackageInfo':
        return {
          price: result.price.toString(),
          directBonus: Number(result.directBonus),
          levelBonus: Number(result.levelBonus),
          isActive: result.isActive,
        };

      case 'getPendingRewards':
        return {
          pendingUserRewards: result.pendingUserRewards.toString(),
          pendingCommissionRewards: result.pendingCommissionRewards.toString(),
          totalPending: result.totalPending.toString(),
        };

      default:
        return result;
    }
  }

  /**
   * Validate compensation-related queries
   */
  async validateCompensationQuery(queryData, userContext) {
    const { calculationType, userAddress, amount, level, packageLevel } =
      queryData;

    switch (calculationType) {
      case 'direct_commission':
        return await this.validateDirectCommission(
          userAddress,
          amount,
          packageLevel
        );

      case 'level_commission':
        return await this.validateLevelCommission(userAddress, amount, level);

      case 'matrix_spillover':
        return await this.validateMatrixSpillover(queryData);

      case 'earnings_cap':
        return await this.validateEarningsCap(userAddress, packageLevel);

      default:
        throw new Error(
          `Unknown compensation calculation type: ${calculationType}`
        );
    }
  }

  async validateDirectCommission(userAddress, amount, packageLevel) {
    if (!this.isValidAddress(userAddress)) {
      throw new Error('Valid user address required');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (
      packageLevel < 1 ||
      packageLevel > this.validationRules.compensation.maxPackageLevel
    ) {
      throw new Error(
        `Package level must be between 1 and ${this.validationRules.compensation.maxPackageLevel}`
      );
    }

    const compensation = await this.compensationService.validateCompensation(
      userAddress,
      amount,
      1
    );

    return {
      calculation: 'direct_commission',
      userAddress: userAddress,
      amount: amount,
      packageLevel: packageLevel,
      commission: compensation.directBonus,
      eligible: compensation.eligible,
      validated: true,
    };
  }

  async validateLevelCommission(userAddress, amount, level) {
    if (level < 1 || level > this.validationRules.business.maxReferralDepth) {
      throw new Error(
        `Level must be between 1 and ${this.validationRules.business.maxReferralDepth}`
      );
    }

    const rate = await this.compensationService.getCompensationRate(level);
    const commission = amount * rate;

    return {
      calculation: 'level_commission',
      userAddress: userAddress,
      amount: amount,
      level: level,
      rate: rate,
      commission: commission,
      validated: true,
    };
  }

  async validateMatrixSpillover(queryData) {
    const { sponsorAddress, newMemberAddress, position } = queryData;

    if (
      !this.isValidAddress(sponsorAddress) ||
      !this.isValidAddress(newMemberAddress)
    ) {
      throw new Error('Valid sponsor and member addresses required');
    }

    const spillover = await this.compensationService.handleMatrixSpillover(
      sponsorAddress,
      newMemberAddress,
      position
    );

    return {
      calculation: 'matrix_spillover',
      spillover: spillover,
      validated: true,
    };
  }

  async validateEarningsCap(userAddress, packageLevel) {
    const userInfo =
      await this.compensationService.contract.getUserInfo(userAddress);
    const earningsCap = Number(userInfo.earningsCap);
    const currentEarnings = Number(userInfo.totalEarnings);
    const remainingCap = earningsCap - currentEarnings;

    return {
      calculation: 'earnings_cap',
      userAddress: userAddress,
      packageLevel: Number(userInfo.packageLevel),
      earningsCap: earningsCap,
      currentEarnings: currentEarnings,
      remainingCap: remainingCap,
      capReached: remainingCap <= 0,
      validated: true,
    };
  }

  /**
   * Validate business logic queries
   */
  async validateBusinessLogic(queryData, userContext) {
    const { logicType, data } = queryData;

    switch (logicType) {
      case 'rank_advancement':
        return await this.validateRankAdvancement(data);

      case 'pool_distribution':
        return await this.validatePoolDistribution(data);

      case 'referral_tree':
        return await this.validateReferralTree(data);

      default:
        throw new Error(`Unknown business logic type: ${logicType}`);
    }
  }

  async validateRankAdvancement(data) {
    const { userAddress, currentVolume, currentReferrals } = data;
    const criteria = this.validationRules.business.rankAdvancementCriteria;

    let nextRank = 1;
    for (const [rank, requirements] of Object.entries(criteria)) {
      if (
        currentVolume >= requirements.volume &&
        currentReferrals >= requirements.referrals
      ) {
        nextRank = Math.max(nextRank, parseInt(rank));
      }
    }

    return {
      logic: 'rank_advancement',
      userAddress: userAddress,
      currentVolume: currentVolume,
      currentReferrals: currentReferrals,
      qualifiedRank: nextRank,
      nextRankRequirements: criteria[nextRank + 1] || null,
      validated: true,
    };
  }

  async validatePoolDistribution(data) {
    const poolBalances = await this.compensationService.getPoolDistribution();

    return {
      logic: 'pool_distribution',
      pools: poolBalances,
      distributionFrequency:
        this.validationRules.business.poolDistributionFrequency,
      validated: true,
    };
  }

  async validateReferralTree(data) {
    const { rootAddress, depth = 3 } = data;

    if (depth > 10) {
      throw new Error('Maximum tree depth is 10 levels');
    }

    const treeData = await this.compensationService.getReferralTreeData(
      rootAddress,
      depth
    );

    return {
      logic: 'referral_tree',
      treeData: treeData,
      validated: true,
    };
  }

  /**
   * Validate knowledge base queries
   */
  async validateKnowledgeQuery(queryData, userContext) {
    const { query, type, context } = queryData;

    if (!query || query.trim().length < 3) {
      throw new Error('Query must be at least 3 characters long');
    }

    const results = await this.knowledgeBase.searchKnowledge(query, type);
    const contextData = await this.knowledgeBase.getContextForQuery(query);

    return {
      query: query,
      type: type,
      results: results,
      context: contextData,
      validated: true,
    };
  }

  /**
   * Validate user actions
   */
  async validateUserAction(queryData, userContext) {
    const { action, userAddress, data } = queryData;

    switch (action) {
      case 'register':
        return await this.validateRegistrationAction(data);

      case 'withdraw':
        return await this.validateWithdrawalAction(userAddress, data);

      case 'claim_rewards':
        return await this.validateClaimAction(userAddress);

      default:
        throw new Error(`Unknown user action: ${action}`);
    }
  }

  async validateRegistrationAction(data) {
    const { referrerAddress, packageLevel, paymentMethod } = data;

    const packageValidation =
      await this.compensationService.validatePackageRegistration(
        packageLevel,
        paymentMethod
      );

    if (!packageValidation.valid) {
      throw new Error(`Package validation failed: ${packageValidation.error}`);
    }

    return {
      action: 'register',
      referrerAddress: referrerAddress,
      packageValidation: packageValidation,
      validated: true,
    };
  }

  async validateWithdrawalAction(userAddress, data) {
    const { amount } = data;

    if (amount < this.validationRules.compensation.minWithdrawalAmount) {
      throw new Error(
        `Minimum withdrawal amount is ${this.validationRules.compensation.minWithdrawalAmount} USDT`
      );
    }

    if (amount > this.validationRules.compensation.maxWithdrawalPerDay) {
      throw new Error(
        `Maximum daily withdrawal is ${this.validationRules.compensation.maxWithdrawalPerDay} USDT`
      );
    }

    const userInfo =
      await this.compensationService.contract.getUserInfo(userAddress);
    const availableBalance = Number(userInfo.balance);

    if (amount > availableBalance) {
      throw new Error('Insufficient balance for withdrawal');
    }

    return {
      action: 'withdraw',
      userAddress: userAddress,
      amount: amount,
      availableBalance: availableBalance,
      validated: true,
    };
  }

  async validateClaimAction(userAddress) {
    const pendingRewards =
      await this.compensationService.contract.getPendingRewards(userAddress);
    const totalPending = Number(pendingRewards.totalPending);

    if (totalPending <= 0) {
      throw new Error('No pending rewards to claim');
    }

    return {
      action: 'claim_rewards',
      userAddress: userAddress,
      pendingRewards: totalPending,
      validated: true,
    };
  }

  /**
   * Update accuracy metrics
   */
  updateMetrics(success, responseTime) {
    if (success) {
      this.accuracyMetrics.validQueries++;
    } else {
      this.accuracyMetrics.errorQueries++;
    }

    // Update average response time
    const totalTime =
      this.accuracyMetrics.averageResponseTime *
        (this.accuracyMetrics.totalQueries - 1) +
      responseTime;
    this.accuracyMetrics.averageResponseTime =
      totalTime / this.accuracyMetrics.totalQueries;
  }

  /**
   * Get accuracy monitoring data
   */
  getAccuracyMetrics() {
    const accuracy =
      this.accuracyMetrics.totalQueries > 0
        ? (this.accuracyMetrics.validQueries /
            this.accuracyMetrics.totalQueries) *
          100
        : 0;

    return {
      ...this.accuracyMetrics,
      accuracyPercentage: accuracy.toFixed(2),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset metrics (for testing or new periods)
   */
  resetMetrics() {
    this.accuracyMetrics = {
      totalQueries: 0,
      validQueries: 0,
      errorQueries: 0,
      averageResponseTime: 0,
    };
  }
}

export default AIAgentValidator;
