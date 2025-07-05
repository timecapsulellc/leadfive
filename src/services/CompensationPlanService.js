/**
 * LeadFive Compensation Plan Service
 *
 * Implements the exact compensation structure from the presentation:
 * - Sponsor Commission: 40%
 * - Level Bonus: 10% (distributed across 10 levels)
 * - Global Upline Bonus: 10% (30 uplines, equal distribution)
 * - Leader Bonus: 10% (Shining Star & Silver Star)
 * - Global Help Pool: 30% (weekly distribution, 4x cap)
 */

export class CompensationPlanService {
  // Package configurations from presentation
  static PACKAGES = {
    30: { name: 'Entry Level', tier: 1, description: 'Perfect for Beginners' },
    50: { name: 'Standard', tier: 2, description: 'Popular Choice' },
    100: { name: 'Advanced', tier: 3, description: 'Enhanced Growth' },
    200: { name: 'Premium', tier: 4, description: 'Maximum Potential' },
  };

  // Level bonus distribution (10% total)
  static LEVEL_BONUS_STRUCTURE = {
    1: 0.03, // 3% for Level 1
    2: 0.01, // 1% for Level 2
    3: 0.01, // 1% for Level 3
    4: 0.01, // 1% for Level 4
    5: 0.01, // 1% for Level 5
    6: 0.01, // 1% for Level 6
    7: 0.005, // 0.5% for Level 7
    8: 0.005, // 0.5% for Level 8
    9: 0.005, // 0.5% for Level 9
    10: 0.005, // 0.5% for Level 10
  };

  // Leader qualifications
  static LEADER_REQUIREMENTS = {
    SHINING_STAR: {
      teamMembers: 250,
      directReferrals: 10,
      poolShare: 0.5, // 50% of leader bonus pool
    },
    SILVER_STAR: {
      teamMembers: 500,
      directReferrals: 0, // Not specified in presentation
      poolShare: 0.5, // 50% of leader bonus pool
    },
  };

  // Withdrawal tiers based on direct referrals
  static WITHDRAWAL_TIERS = {
    0: { withdrawal: 0.7, reinvestment: 0.3 }, // No direct referrals
    5: { withdrawal: 0.75, reinvestment: 0.25 }, // 5 direct referrals
    20: { withdrawal: 0.8, reinvestment: 0.2 }, // 20 direct referrals
  };

  // Reinvestment allocation
  static REINVESTMENT_ALLOCATION = {
    levelBonus: 0.4, // 40%
    globalUpline: 0.3, // 30%
    globalHelpPool: 0.3, // 30%
  };

  /**
   * Calculate compensation breakdown for a package amount
   */
  static calculateCompensationBreakdown(packageAmount) {
    return {
      sponsorCommission: packageAmount * 0.4, // 40%
      levelBonus: packageAmount * 0.1, // 10%
      globalUplineBonus: packageAmount * 0.1, // 10%
      leaderBonus: packageAmount * 0.1, // 10%
      globalHelpPool: packageAmount * 0.3, // 30%
    };
  }

  /**
   * Calculate level bonus distribution for a specific package
   */
  static calculateLevelBonusDistribution(packageAmount) {
    const totalLevelBonus = packageAmount * 0.1;
    const distribution = {};

    Object.entries(this.LEVEL_BONUS_STRUCTURE).forEach(
      ([level, percentage]) => {
        distribution[level] = totalLevelBonus * (percentage / 0.1); // Normalize to 10%
      }
    );

    return distribution;
  }

  /**
   * Calculate global upline bonus (equal distribution among 30 uplines)
   */
  static calculateGlobalUplineBonus(packageAmount) {
    const totalUplineBonus = packageAmount * 0.1;
    const perUpline = totalUplineBonus / 30;

    return {
      totalPool: totalUplineBonus,
      perUpline: perUpline,
      maxUplines: 30,
    };
  }

  /**
   * Calculate earnings cap (4x package amount)
   */
  static calculateEarningsCap(packageAmount) {
    return packageAmount * 4;
  }

  /**
   * Determine withdrawal tier based on direct referrals
   */
  static getWithdrawalTier(directReferrals) {
    if (directReferrals >= 20) return this.WITHDRAWAL_TIERS[20];
    if (directReferrals >= 5) return this.WITHDRAWAL_TIERS[5];
    return this.WITHDRAWAL_TIERS[0];
  }

  /**
   * Calculate leader qualification status
   */
  static checkLeaderQualification(teamSize, directReferrals) {
    const qualifications = [];

    if (
      teamSize >= this.LEADER_REQUIREMENTS.SHINING_STAR.teamMembers &&
      directReferrals >= this.LEADER_REQUIREMENTS.SHINING_STAR.directReferrals
    ) {
      qualifications.push('SHINING_STAR');
    }

    if (teamSize >= this.LEADER_REQUIREMENTS.SILVER_STAR.teamMembers) {
      qualifications.push('SILVER_STAR');
    }

    return qualifications;
  }

  /**
   * Generate matrix level requirements (dual-branch system)
   */
  static getMatrixLevelRequirements() {
    const levels = [];

    // Generate levels 1-20 with doubling pattern
    for (let level = 1; level <= 20; level++) {
      const requiredIDs = Math.pow(2, level);
      let upgrade = null;

      // Package upgrades at specific levels
      if (level === 7) upgrade = 30;
      if (level === 8) upgrade = 50;
      if (level === 11) upgrade = 100;
      if (level === 15) upgrade = 200;

      levels.push({
        level,
        requiredIDs,
        upgrade,
        isUpgradeLevel: upgrade !== null,
      });
    }

    return levels;
  }

  /**
   * Calculate potential earnings for different team sizes
   */
  static calculatePotentialEarnings(
    packageAmount,
    teamSize,
    directReferrals = 0
  ) {
    const breakdown = this.calculateCompensationBreakdown(packageAmount);
    const withdrawalTier = this.getWithdrawalTier(directReferrals);
    const earningsCap = this.calculateEarningsCap(packageAmount);

    // Estimate earnings based on team activity
    const estimatedMonthlyFromTeam = teamSize * 0.1 * packageAmount; // Conservative estimate
    const estimatedGlobalHelpPool = breakdown.globalHelpPool * 0.25; // Weekly estimate

    return {
      breakdown,
      withdrawalTier,
      earningsCap,
      estimatedMonthly: {
        sponsorCommissions: Math.min(
          estimatedMonthlyFromTeam * 0.4,
          earningsCap * 0.3
        ),
        levelBonuses: Math.min(
          estimatedMonthlyFromTeam * 0.1,
          earningsCap * 0.2
        ),
        globalUpline: breakdown.globalUplineBonus,
        globalHelpPool: estimatedGlobalHelpPool,
        total: function () {
          return (
            this.sponsorCommissions +
            this.levelBonuses +
            this.globalUpline +
            this.globalHelpPool
          );
        },
      },
    };
  }

  /**
   * Generate genealogy tree data based on dual-branch system
   */
  static generateGenealogyTreeData(userPackage = 100, depth = 5) {
    const generateNode = (level, position, parentPackage) => {
      if (level > depth) return null;

      const packages = [30, 50, 100, 200];
      const randomPackage =
        packages[Math.floor(Math.random() * packages.length)];
      const packageInfo = this.PACKAGES[randomPackage];
      const earnings = this.calculateCompensationBreakdown(randomPackage);

      const node = {
        name: `Member ${level}-${position}`,
        attributes: {
          address: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
          level: level,
          package: `$${randomPackage}`,
          packageAmount: randomPackage,
          packageTier: packageInfo.tier,
          earnings: `$${(Math.random() * randomPackage * 2).toFixed(2)}`,
          team: Math.floor(Math.random() * 50) + level * 5,
          active: Math.random() > 0.2, // 80% active rate
          directReferrals: Math.floor(Math.random() * 10),
          joinDate: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split('T')[0],
        },
        children: [],
      };

      // Dual-branch system: each node can have up to 2 children
      if (level < depth) {
        const leftChild = generateNode(level + 1, position * 2, randomPackage);
        const rightChild = generateNode(
          level + 1,
          position * 2 + 1,
          randomPackage
        );

        if (leftChild) node.children.push(leftChild);
        if (rightChild) node.children.push(rightChild);
      }

      return node;
    };

    // Root user
    const rootPackageInfo = this.PACKAGES[userPackage];
    const rootEarnings = this.calculateCompensationBreakdown(userPackage);

    return {
      name: 'You',
      attributes: {
        address: '0xYour...Address',
        level: 0,
        package: `$${userPackage}`,
        packageAmount: userPackage,
        packageTier: rootPackageInfo.tier,
        earnings: `$${(userPackage * 1.5).toFixed(2)}`,
        team: Math.floor(Math.pow(2, depth) - 1), // Total possible team size
        active: true,
        directReferrals: 2,
        joinDate: new Date().toISOString().split('T')[0],
        isRoot: true,
      },
      children: [
        generateNode(1, 1, userPackage),
        generateNode(1, 2, userPackage),
      ].filter(Boolean),
    };
  }

  /**
   * Calculate real-time compensation data for dashboard
   */
  static calculateDashboardData(
    userPackage = 100,
    teamSize = 47,
    directReferrals = 5
  ) {
    const packageInfo = this.PACKAGES[userPackage];
    const breakdown = this.calculateCompensationBreakdown(userPackage);
    const withdrawalTier = this.getWithdrawalTier(directReferrals);
    const earningsCap = this.calculateEarningsCap(userPackage);
    const leaderStatus = this.checkLeaderQualification(
      teamSize,
      directReferrals
    );

    // Calculate actual earnings based on team performance
    const totalEarnings = Math.min(
      userPackage * 1.5 + teamSize * 0.02 * userPackage,
      earningsCap
    );

    return {
      package: {
        amount: userPackage,
        name: packageInfo.name,
        tier: packageInfo.tier,
        description: packageInfo.description,
      },
      earnings: {
        total: totalEarnings,
        cap: earningsCap,
        progress: (totalEarnings / earningsCap) * 100,
        breakdown: {
          sponsorCommissions: totalEarnings * 0.45,
          levelBonuses: totalEarnings * 0.25,
          globalUplineBonus: breakdown.globalUplineBonus,
          leaderBonus: leaderStatus.length > 0 ? totalEarnings * 0.1 : 0,
          globalHelpPool: totalEarnings * 0.2,
        },
      },
      team: {
        size: teamSize,
        directReferrals: directReferrals,
        activeMembers: Math.floor(teamSize * 0.8),
        weeklyGrowth: Math.floor(Math.random() * 5) + 1,
      },
      rank: {
        current:
          leaderStatus.length > 0
            ? leaderStatus[0].replace('_', ' ')
            : 'Member',
        qualifications: leaderStatus,
        nextRequirement: this.getNextRankRequirement(teamSize, directReferrals),
      },
      withdrawal: {
        available: totalEarnings * withdrawalTier.withdrawal,
        tier: withdrawalTier,
        nextTierRequirement: this.getNextWithdrawalTier(directReferrals),
      },
    };
  }

  /**
   * Get next rank requirement
   */
  static getNextRankRequirement(currentTeamSize, currentDirectReferrals) {
    if (currentTeamSize < 250) {
      return {
        rank: 'Shining Star',
        teamNeeded: 250 - currentTeamSize,
        directNeeded: Math.max(0, 10 - currentDirectReferrals),
      };
    }
    if (currentTeamSize < 500) {
      return {
        rank: 'Silver Star',
        teamNeeded: 500 - currentTeamSize,
        directNeeded: 0,
      };
    }
    return null;
  }

  /**
   * Get next withdrawal tier requirement
   */
  static getNextWithdrawalTier(currentDirectReferrals) {
    if (currentDirectReferrals < 5) {
      return {
        tier: '75% Withdrawal',
        directNeeded: 5 - currentDirectReferrals,
      };
    }
    if (currentDirectReferrals < 20) {
      return {
        tier: '80% Withdrawal',
        directNeeded: 20 - currentDirectReferrals,
      };
    }
    return null;
  }
}

export default CompensationPlanService;
