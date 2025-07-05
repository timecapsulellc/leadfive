/**
 * Navigation Configuration for LeadFive Dashboard
 * Centralized navigation logic and route definitions
 */

import {
  FaChartLine,
  FaDollarSign,
  FaUsers,
  FaNetworkWired,
  FaWallet,
  FaHistory,
  FaCog,
  FaTrophy,
  FaRocket,
  FaChartBar,
  FaGift,
  FaHandsHelping,
  FaCrown,
  FaCoins,
  FaRobot,
  FaFileAlt,
} from 'react-icons/fa';

// Dashboard route configuration
export const NAVIGATION_CONFIG = {
  routes: {
    overview: {
      path: '/dashboard',
      section: 'overview',
      title: 'Dashboard Overview',
      component: 'EnhancedDashboardOverview',
      icon: FaChartLine,
      description: 'Main dashboard with key metrics and insights',
    },
    earnings: {
      path: '/dashboard/earnings',
      section: 'earnings',
      title: 'My Earnings',
      component: 'EarningsSection',
      icon: FaDollarSign,
      badge: '✓',
      description: 'Detailed breakdown of all earnings and commissions',
    },
    'direct-referrals': {
      path: '/dashboard/referrals',
      section: 'direct-referrals',
      title: 'Direct Referrals',
      component: 'DirectReferralsSection',
      icon: FaUsers,
      description: '40% commission from direct referrals',
    },
    'level-bonus': {
      path: '/dashboard/level-bonus',
      section: 'level-bonus',
      title: 'Level Bonus',
      component: 'LevelBonusSection',
      icon: FaNetworkWired,
      description: '10% commission distributed across levels',
    },
    'upline-bonus': {
      path: '/dashboard/upline-bonus',
      section: 'upline-bonus',
      title: 'Upline Bonus',
      component: 'UplineBonusSection',
      icon: FaChartBar,
      description: '10% bonus from upline structure',
    },
    'leader-pool': {
      path: '/dashboard/leader-pool',
      section: 'leader-pool',
      title: 'Leader Pool',
      component: 'LeaderPoolSection',
      icon: FaCrown,
      description: '10% leader pool for qualified members',
    },
    'help-pool': {
      path: '/dashboard/help-pool',
      section: 'help-pool',
      title: 'Help Pool',
      component: 'HelpPoolSection',
      icon: FaHandsHelping,
      badge: '!',
      description: '30% weekly help pool distribution',
    },
    packages: {
      path: '/dashboard/packages',
      section: 'packages',
      title: 'Packages',
      component: 'PackagesSection',
      icon: FaGift,
      description: 'Investment packages and upgrades',
    },
    'community-tiers': {
      path: '/dashboard/community-tiers',
      section: 'community-tiers',
      title: 'Community Tiers',
      component: 'CommunityTiersSection',
      icon: FaTrophy,
      description: 'Community tier progression and benefits',
    },
    withdrawals: {
      path: '/dashboard/withdrawals',
      section: 'withdrawals',
      title: 'Withdrawals',
      component: 'WithdrawalsSection',
      icon: FaWallet,
      description: 'Withdrawal history and management',
    },
    'team-structure': {
      path: '/dashboard/team',
      section: 'team-structure',
      title: 'My Team',
      component: 'TeamStructureSection',
      icon: FaNetworkWired,
      description: 'Binary tree genealogy and team overview',
    },
    gamification: {
      path: '/dashboard/achievements',
      section: 'gamification',
      title: 'Achievements',
      component: 'GamificationSection',
      icon: FaRocket,
      badge: 'AI',
      description: 'Achievements, rewards, and gamification',
    },
    reports: {
      path: '/dashboard/reports',
      section: 'reports',
      title: 'Reports',
      component: 'ReportsSection',
      icon: FaFileAlt,
      description: 'Analytics and performance reports',
    },
    'ai-insights': {
      path: '/dashboard/ai-coach',
      section: 'ai-insights',
      title: 'AI Business Coach',
      component: 'AIInsightsSection',
      icon: FaRobot,
      badge: 'AI',
      description: 'PhD-level business coaching and insights',
    },
    settings: {
      path: '/dashboard/settings',
      section: 'settings',
      title: 'Settings',
      component: 'SettingsSection',
      icon: FaCog,
      description: 'Account settings and preferences',
    },
  },

  // Menu structure for sidebar navigation
  menuItems: [
    {
      id: 'overview',
      label: 'Overview',
      icon: FaChartLine,
      route: 'overview',
      group: 'main',
    },
    {
      id: 'earnings',
      label: 'My Earnings',
      icon: FaDollarSign,
      badge: '$25',
      route: 'earnings',
      group: 'earnings',
    },
    {
      id: 'direct-referrals',
      label: 'Direct Referrals',
      icon: FaUsers,
      badge: '0',
      route: 'direct-referrals',
      group: 'earnings',
    },
    {
      id: 'level-bonus',
      label: 'Level Bonus',
      icon: FaNetworkWired,
      route: 'level-bonus',
      group: 'earnings',
    },
    {
      id: 'upline-bonus',
      label: 'Upline Bonus',
      icon: FaChartBar,
      route: 'upline-bonus',
      group: 'earnings',
    },
    {
      id: 'leader-pool',
      label: 'Leader Pool',
      icon: FaCrown,
      route: 'leader-pool',
      group: 'earnings',
    },
    {
      id: 'help-pool',
      label: 'Help Pool',
      icon: FaHandsHelping,
      badge: '✓',
      route: 'help-pool',
      group: 'earnings',
    },
    {
      id: 'packages',
      label: 'Packages',
      icon: FaGift,
      badge: '$100',
      route: 'packages',
      group: 'management',
    },
    {
      id: 'community-tiers',
      label: 'Community Tiers',
      icon: FaTrophy,
      badge: 'T1',
      route: 'community-tiers',
      group: 'management',
    },
    {
      id: 'withdrawals',
      label: 'Withdrawals',
      icon: FaWallet,
      badge: '!',
      route: 'withdrawals',
      group: 'management',
    },
    {
      id: 'team-structure',
      label: 'My Team',
      icon: FaNetworkWired,
      badge: '0',
      route: 'team-structure',
      group: 'team',
    },
    {
      id: 'gamification',
      label: 'Achievements',
      icon: FaRocket,
      badge: 'AI',
      route: 'gamification',
      group: 'features',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FaFileAlt,
      route: 'reports',
      group: 'features',
    },
    {
      id: 'ai-insights',
      label: 'AI Business Coach',
      icon: FaRobot,
      badge: 'AI',
      route: 'ai-insights',
      group: 'features',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: FaCog,
      route: 'settings',
      group: 'account',
    },
  ],

  // Menu groups for organization
  menuGroups: {
    main: {
      title: 'Dashboard',
      order: 1,
    },
    earnings: {
      title: 'Earnings & Commissions',
      order: 2,
    },
    management: {
      title: 'Account Management',
      order: 3,
    },
    team: {
      title: 'Team & Network',
      order: 4,
    },
    features: {
      title: 'Advanced Features',
      order: 5,
    },
    account: {
      title: 'Account',
      order: 6,
    },
  },
};

// Utility functions for navigation
export const getRouteBySection = sectionId => {
  return (
    NAVIGATION_CONFIG.routes[sectionId] || NAVIGATION_CONFIG.routes.overview
  );
};

export const getSectionByPath = path => {
  for (const [sectionId, route] of Object.entries(NAVIGATION_CONFIG.routes)) {
    if (route.path === path) {
      return sectionId;
    }
  }
  return 'overview';
};

export const getMenuItemBySection = sectionId => {
  return NAVIGATION_CONFIG.menuItems.find(item => item.id === sectionId);
};

export const getBreadcrumbs = sectionId => {
  const route = getRouteBySection(sectionId);
  const menuItem = getMenuItemBySection(sectionId);

  return [
    { label: 'Dashboard', path: '/dashboard' },
    { label: route.title, path: route.path, active: true },
  ];
};

// Validation helpers
export const isValidSection = sectionId => {
  return NAVIGATION_CONFIG.routes.hasOwnProperty(sectionId);
};

export const getValidSectionId = sectionId => {
  return isValidSection(sectionId) ? sectionId : 'overview';
};
