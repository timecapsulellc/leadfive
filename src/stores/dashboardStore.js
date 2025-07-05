/**
 * Dashboard State Management with Zustand
 * Centralized state for all dashboard data with real-time updates
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { dashboardApi } from '../services/api/dashboardApi';
import { earningsApi } from '../services/api/earningsApi';
import { referralsApi } from '../services/api/referralsApi';

// Create dashboard store with Zustand
export const useDashboardStore = create(
  subscribeWithSelector((set, get) => ({
    // ============ STATE ============

    // User account data
    user: {
      account: null,
      isActive: false,
      registrationTime: null,
      currentLevel: 1,
      memberSince: null,
      lastActivity: new Date(),
    },

    // Dashboard overview data
    dashboard: {
      totalEarnings: 0,
      directReferralEarnings: 0,
      levelBonusEarnings: 0,
      uplineBonusEarnings: 0,
      leaderPoolEarnings: 0,
      helpPoolEarnings: 0,
      dailyEarnings: 0,
      pendingRewards: 0,
      lastUpdated: null,
      source: 'loading', // 'blockchain', 'fallback', 'loading'
    },

    // Referrals and team data
    referrals: {
      directReferrals: 0,
      teamSize: 0,
      activeReferrals: 0,
      referralList: [],
      teamStructure: {},
      stats: {},
      commissions: {},
      recent: [],
    },

    // Package and investment data
    package: {
      currentPackage: 0,
      maxEarnings: 0,
      currentTier: 1,
      upgradeAvailable: false,
      withdrawalRatio: { withdraw: 70, reinvest: 30 },
    },

    // Real-time data
    realTime: {
      currentTime: new Date(),
      serverTime: new Date(),
      marketStatus: 'active',
      networkStatus: 'connected',
      lastSyncTime: new Date(),
      liveMode: true,
    },

    // Loading states
    loading: {
      dashboard: false,
      earnings: false,
      referrals: false,
      team: false,
      transactions: false,
      initialLoad: true,
    },

    // Error states
    errors: {
      dashboard: null,
      earnings: null,
      referrals: null,
      connection: null,
    },

    // Cache metadata
    cache: {
      lastRefresh: null,
      ttl: 30000, // 30 seconds
      autoRefresh: true,
    },

    // ============ ACTIONS ============

    /**
     * Initialize the store with provider and account
     */
    initialize: async (provider, account) => {
      console.log('🚀 Starting dashboard store initialization...', {
        account,
        provider: !!provider,
      });

      set(state => ({
        user: { ...state.user, account },
        loading: { ...state.loading, initialLoad: true },
        errors: {
          dashboard: null,
          earnings: null,
          referrals: null,
          connection: null,
        },
      }));

      // Add timeout mechanism to prevent hanging
      const initializeWithTimeout = async () => {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Initialization timeout after 10 seconds')),
            10000
          )
        );

        const initPromise = async () => {
          console.log('📡 Initializing API services...');

          // Initialize API services with individual error handling
          const apiResults = await Promise.allSettled([
            dashboardApi.initialize(provider, account),
            earningsApi.initialize(provider, account),
            referralsApi.initialize(provider, account),
          ]);

          // Log API initialization results
          apiResults.forEach((result, index) => {
            const apiName = ['dashboardApi', 'earningsApi', 'referralsApi'][
              index
            ];
            if (result.status === 'rejected') {
              console.warn(
                `⚠️ ${apiName} initialization failed:`,
                result.reason
              );
            } else {
              console.log(`✅ ${apiName} initialized successfully`);
            }
          });

          console.log('📊 Loading initial data...');
          // Load initial data with fallback
          try {
            await get().loadAllData(account);
            console.log('✅ Initial data loaded successfully');
          } catch (dataError) {
            console.warn(
              '⚠️ Initial data loading failed, using fallback:',
              dataError
            );
            // Continue anyway - we'll use fallback data
          }
        };

        return Promise.race([initPromise(), timeoutPromise]);
      };

      try {
        await initializeWithTimeout();

        set(state => ({
          loading: { ...state.loading, initialLoad: false },
          realTime: { ...state.realTime, networkStatus: 'connected' },
        }));

        console.log(
          '🎉 Dashboard store initialization complete - loading cleared'
        );
      } catch (error) {
        console.error('❌ Dashboard store initialization failed:', error);
        set(state => ({
          loading: { ...state.loading, initialLoad: false }, // Always clear loading
          errors: { ...state.errors, connection: error.message },
          realTime: { ...state.realTime, networkStatus: 'error' },
        }));

        // Still log success to show the dashboard with fallback data
        console.log(
          '🔄 Dashboard will use fallback data due to initialization error'
        );
      }
    },

    /**
     * Load all dashboard data
     */
    loadAllData: async account => {
      const { loadDashboardData, loadReferralData } = get();

      console.log('📊 Starting to load all dashboard data...');

      try {
        // Use Promise.allSettled to ensure one failure doesn't block the other
        const results = await Promise.allSettled([
          loadDashboardData(account),
          loadReferralData(account),
        ]);

        // Log results
        results.forEach((result, index) => {
          const dataType = ['dashboard', 'referral'][index];
          if (result.status === 'rejected') {
            console.warn(`⚠️ ${dataType} data loading failed:`, result.reason);
          } else {
            console.log(`✅ ${dataType} data loaded successfully`);
          }
        });

        console.log('📊 All data loading completed');
      } catch (error) {
        console.error('❌ Error in loadAllData:', error);
        throw error; // Re-throw so initialize can handle it
      }
    },

    /**
     * Load dashboard overview data
     */
    loadDashboardData: async account => {
      set(state => ({
        loading: { ...state.loading, dashboard: true },
        errors: { ...state.errors, dashboard: null },
      }));

      try {
        const data = await dashboardApi.getDashboardData(account);

        set(state => ({
          user: {
            ...state.user,
            ...data.user,
            lastActivity: new Date(),
          },
          dashboard: {
            ...state.dashboard,
            ...data.earnings,
            lastUpdated: data.lastUpdated,
            source: data.source,
          },
          package: {
            ...state.package,
            ...data.package,
          },
          loading: { ...state.loading, dashboard: false },
          cache: { ...state.cache, lastRefresh: new Date() },
        }));

        console.log('Dashboard data loaded successfully');
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        set(state => ({
          loading: { ...state.loading, dashboard: false },
          errors: { ...state.errors, dashboard: error.message },
        }));
      }
    },

    /**
     * Load detailed earnings data
     */
    loadEarningsData: async account => {
      set(state => ({
        loading: { ...state.loading, earnings: true },
        errors: { ...state.errors, earnings: null },
      }));

      try {
        const earningsBreakdown =
          await earningsApi.getEarningsBreakdown(account);

        set(state => ({
          dashboard: {
            ...state.dashboard,
            totalEarnings: earningsBreakdown.total,
            directReferralEarnings: earningsBreakdown.directReferral.total,
            levelBonusEarnings: earningsBreakdown.levelBonus.total,
            uplineBonusEarnings: earningsBreakdown.uplineBonus.total,
            leaderPoolEarnings: earningsBreakdown.leaderPool.total,
            helpPoolEarnings: earningsBreakdown.helpPool.total,
            lastUpdated: earningsBreakdown.lastUpdated,
          },
          // Store detailed breakdown for components that need it
          earningsBreakdown,
          loading: { ...state.loading, earnings: false },
        }));

        console.log('Earnings data loaded successfully');
      } catch (error) {
        console.error('Error loading earnings data:', error);
        set(state => ({
          loading: { ...state.loading, earnings: false },
          errors: { ...state.errors, earnings: error.message },
        }));
      }
    },

    /**
     * Load referrals and team data
     */
    loadReferralData: async account => {
      set(state => ({
        loading: { ...state.loading, referrals: true },
        errors: { ...state.errors, referrals: null },
      }));

      try {
        const referralData = await referralsApi.getReferralData(account);

        set(state => ({
          referrals: {
            directReferrals: referralData.stats.totalDirectReferrals,
            teamSize: referralData.team.totalSize,
            activeReferrals: referralData.stats.activeReferrals,
            referralList: referralData.direct,
            teamStructure: referralData.team,
            stats: referralData.stats,
            commissions: referralData.commissions,
            recent: referralData.recent,
          },
          loading: { ...state.loading, referrals: false },
        }));

        console.log('Referral data loaded successfully');
      } catch (error) {
        console.error('Error loading referral data:', error);
        set(state => ({
          loading: { ...state.loading, referrals: false },
          errors: { ...state.errors, referrals: error.message },
        }));
      }
    },

    /**
     * Refresh all data
     */
    refreshAllData: async () => {
      const { user, loadAllData } = get();
      if (user.account) {
        console.log('Refreshing all dashboard data...');

        // Clear caches
        dashboardApi.clearCache();
        earningsApi.clearCache();
        referralsApi.clearCache();

        await loadAllData(user.account);
      }
    },

    /**
     * Update real-time data
     */
    updateRealTimeData: () => {
      set(state => ({
        realTime: {
          ...state.realTime,
          currentTime: new Date(),
          lastSyncTime: state.realTime.liveMode
            ? new Date()
            : state.realTime.lastSyncTime,
        },
      }));
    },

    /**
     * Toggle live mode
     */
    toggleLiveMode: () => {
      set(state => ({
        realTime: {
          ...state.realTime,
          liveMode: !state.realTime.liveMode,
          lastSyncTime: !state.realTime.liveMode
            ? new Date()
            : state.realTime.lastSyncTime,
        },
      }));
    },

    /**
     * Update single dashboard metric
     */
    updateDashboardMetric: (metric, value) => {
      set(state => ({
        dashboard: {
          ...state.dashboard,
          [metric]: value,
          lastUpdated: new Date(),
        },
      }));
    },

    /**
     * Add real-time transaction
     */
    addRealtimeTransaction: transaction => {
      set(state => ({
        referrals: {
          ...state.referrals,
          recent: [transaction, ...state.referrals.recent.slice(0, 9)], // Keep last 10
        },
        dashboard: {
          ...state.dashboard,
          lastUpdated: new Date(),
        },
      }));
    },

    /**
     * Update network status
     */
    updateNetworkStatus: status => {
      set(state => ({
        realTime: {
          ...state.realTime,
          networkStatus: status,
        },
      }));
    },

    /**
     * Clear all errors
     */
    clearErrors: () => {
      set(state => ({
        errors: {
          dashboard: null,
          earnings: null,
          referrals: null,
          connection: null,
        },
      }));
    },

    /**
     * Reset store to initial state
     */
    reset: () => {
      set(() => ({
        user: {
          account: null,
          isActive: false,
          registrationTime: null,
          currentLevel: 1,
          memberSince: null,
          lastActivity: new Date(),
        },
        dashboard: {
          totalEarnings: 0,
          directReferralEarnings: 0,
          levelBonusEarnings: 0,
          uplineBonusEarnings: 0,
          leaderPoolEarnings: 0,
          helpPoolEarnings: 0,
          dailyEarnings: 0,
          pendingRewards: 0,
          lastUpdated: null,
          source: 'loading',
        },
        referrals: {
          directReferrals: 0,
          teamSize: 0,
          activeReferrals: 0,
          referralList: [],
          teamStructure: {},
          stats: {},
          commissions: {},
          recent: [],
        },
        package: {
          currentPackage: 0,
          maxEarnings: 0,
          currentTier: 1,
          upgradeAvailable: false,
          withdrawalRatio: { withdraw: 70, reinvest: 30 },
        },
        loading: {
          dashboard: false,
          earnings: false,
          referrals: false,
          team: false,
          transactions: false,
          initialLoad: true,
        },
        errors: {
          dashboard: null,
          earnings: null,
          referrals: null,
          connection: null,
        },
      }));
    },

    // ============ COMPUTED GETTERS ============

    /**
     * Get formatted dashboard data for components
     */
    getDashboardData: () => {
      const state = get();
      return {
        totalEarnings: state.dashboard.totalEarnings,
        directReferralEarnings: state.dashboard.directReferralEarnings,
        levelBonusEarnings: state.dashboard.levelBonusEarnings,
        uplineBonusEarnings: state.dashboard.uplineBonusEarnings,
        leaderPoolEarnings: state.dashboard.leaderPoolEarnings,
        helpPoolEarnings: state.dashboard.helpPoolEarnings,
        dailyEarnings: state.dashboard.dailyEarnings,
        pendingRewards: state.dashboard.pendingRewards,

        // Team data
        teamSize: state.referrals.teamSize,
        directReferrals: state.referrals.directReferrals,
        activeReferrals: state.referrals.activeReferrals,

        // Package data
        currentPackage: state.package.currentPackage,
        maxEarnings: state.package.maxEarnings,
        currentTier: state.package.currentTier,
        currentLevel: state.user.currentLevel,

        // Meta data
        withdrawalRatio: state.package.withdrawalRatio,
        helpPoolEligible: true, // TODO: Calculate based on criteria
        leaderRank: state.package.currentTier > 2 ? 'silver-star' : 'none',
        lastUpdated: state.dashboard.lastUpdated,
        memberSince: state.user.memberSince,
        lastWithdrawal: new Date('2024-12-28'), // TODO: Get from contract
        nextDistribution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastActivity: state.user.lastActivity,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sessionStartTime: new Date(),
      };
    },

    /**
     * Check if data is loading
     */
    isLoading: () => {
      const state = get();
      return (
        state.loading.dashboard ||
        state.loading.earnings ||
        state.loading.referrals ||
        state.loading.initialLoad
      );
    },

    /**
     * Check if data is stale and needs refresh
     */
    isDataStale: () => {
      const state = get();
      if (!state.cache.lastRefresh) return true;
      return Date.now() - state.cache.lastRefresh.getTime() > state.cache.ttl;
    },

    /**
     * Get error summary
     */
    getErrors: () => {
      const state = get();
      const errors = Object.values(state.errors).filter(Boolean);
      return errors.length > 0 ? errors : null;
    },
  }))
);

// ============ AUTO-REFRESH SETUP ============

// Set up auto-refresh interval for real-time data
let realTimeInterval;
let autoRefreshInterval;

// Subscribe to store changes to manage intervals
useDashboardStore.subscribe(
  state => state.realTime.liveMode,
  liveMode => {
    if (liveMode) {
      // Start real-time updates
      realTimeInterval = setInterval(() => {
        useDashboardStore.getState().updateRealTimeData();
      }, 1000);

      // Start auto-refresh for data
      if (useDashboardStore.getState().cache.autoRefresh) {
        autoRefreshInterval = setInterval(() => {
          if (useDashboardStore.getState().isDataStale()) {
            useDashboardStore.getState().refreshAllData();
          }
        }, 30000); // Check every 30 seconds
      }
    } else {
      // Stop intervals
      if (realTimeInterval) {
        clearInterval(realTimeInterval);
        realTimeInterval = null;
      }
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
      }
    }
  }
);

// ============ PERFORMANCE OPTIMIZED SELECTORS ============

// Memoized selectors to prevent unnecessary re-renders
export const selectDashboardOverview = state => ({
  totalEarnings: state.dashboard.totalEarnings,
  dailyEarnings: state.dashboard.dailyEarnings,
  pendingRewards: state.dashboard.pendingRewards,
  isLoading: state.loading.dashboard,
  lastUpdated: state.dashboard.lastUpdated,
});

export const selectEarningsBreakdown = state => ({
  directReferral: state.dashboard.directReferralEarnings,
  levelBonus: state.dashboard.levelBonusEarnings,
  uplineBonus: state.dashboard.uplineBonusEarnings,
  leaderPool: state.dashboard.leaderPoolEarnings,
  helpPool: state.dashboard.helpPoolEarnings,
});

export const selectTeamStats = state => ({
  directReferrals: state.referrals.directReferrals,
  teamSize: state.referrals.teamSize,
  activeReferrals: state.referrals.activeReferrals,
  isLoading: state.loading.referrals,
});

export const selectConnectionStatus = state => ({
  isConnected: state.user.account !== null,
  hasErrors: Object.values(state.errors).some(error => error !== null),
  connectionError: state.errors.connection,
  isLiveMode: state.realTime.enabled,
});

// ============ EXPORT SELECTORS ============

// Convenient selectors for common use cases
export const selectDashboardData = state => state.getDashboardData();
export const selectLoading = state => state.isLoading();
export const selectErrors = state => state.getErrors();
export const selectReferrals = state => state.referrals;
export const selectRealTime = state => state.realTime;
export const selectStoreActions = state => ({
  initialize: state.initialize,
  refreshAllData: state.refreshAllData,
  toggleLiveMode: state.toggleLiveMode,
  updateRealTimeData: state.updateRealTimeData,
  clearErrors: state.clearErrors,
  reset: state.reset,
});
