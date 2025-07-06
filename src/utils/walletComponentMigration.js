/**
 * Wallet Component Migration Utility
 * Helper to migrate from old wallet components to SuperWalletConnect
 */

// Component mapping for migration
export const MIGRATION_MAP = {
  // Old component -> New props mapping
  'WalletConnect': {
    component: 'SuperWalletConnect',
    propsMapping: {
      'onConnect': 'onConnect',
      'onDisconnect': 'onDisconnect'
    },
    defaultProps: {
      mode: 'desktop',
      showWalletList: true
    }
  },
  
  'WalletConnection': {
    component: 'SuperWalletConnect',
    propsMapping: {
      'onWalletConnected': 'onConnect',
      'onBack': null, // Not needed in SuperWalletConnect
      'isConnecting': null, // Handled internally
      'error': null // Handled internally
    },
    defaultProps: {
      mode: 'desktop',
      showWalletList: true,
      showNetworkStatus: true
    }
  },
  
  'WalletConnector': {
    component: 'SuperWalletConnect',
    propsMapping: {
      'onConnect': 'onConnect',
      'onDisconnect': 'onDisconnect',
      'currentAccount': 'account',
      'isConnected': null // Derived from account
    },
    defaultProps: {
      mode: 'desktop',
      showWalletList: true
    }
  },
  
  'UnifiedWalletConnect': {
    component: 'SuperWalletConnect',
    propsMapping: {
      'account': 'account',
      'onConnect': 'onConnect',
      'onDisconnect': 'onDisconnect',
      'buttonText': 'buttonText',
      'compact': 'compact'
    },
    defaultProps: {
      mode: 'auto',
      showWalletList: false // Simple mode like original
    }
  },
  
  'MobileWalletConnect': {
    component: 'SuperWalletConnect',
    propsMapping: {
      'onConnect': 'onConnect',
      'onDisconnect': 'onDisconnect',
      'account': 'account'
    },
    defaultProps: {
      mode: 'mobile',
      showWalletList: true,
      enableRetry: true,
      maxRetries: 3
    }
  }
};

// Migration helper function
export const migrateWalletProps = (oldComponentName, oldProps) => {
  const migration = MIGRATION_MAP[oldComponentName];
  if (!migration) {
    console.warn(`No migration available for ${oldComponentName}`);
    return oldProps;
  }

  const newProps = { ...migration.defaultProps };
  
  // Map old props to new props
  Object.entries(oldProps).forEach(([oldProp, value]) => {
    const newProp = migration.propsMapping[oldProp];
    if (newProp && value !== undefined) {
      newProps[newProp] = value;
    }
  });

  return newProps;
};

// Generate migration report
export const generateMigrationReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    componentsToMigrate: Object.keys(MIGRATION_MAP),
    benefits: [
      'Unified codebase - single wallet component',
      'Better mobile support with deep linking',
      'Improved error handling and retry logic',
      'Network verification and balance display',
      'Consistent UI across all wallet interactions',
      'Reduced bundle size from duplicate code removal'
    ],
    migrationSteps: [
      '1. Replace import statements',
      '2. Update component props using migrateWalletProps()',
      '3. Remove old component files',
      '4. Update CSS imports',
      '5. Test wallet connections',
      '6. Remove unused dependencies'
    ],
    estimatedReduction: {
      files: '6 components → 1 component',
      lines: '~2000 lines → ~500 lines',
      bundleSize: '~50KB reduction',
      maintenance: '80% less wallet-related code to maintain'
    }
  };

  return report;
};

// Auto-migration helper (for build-time usage)
export const getReplacementCode = (oldComponentName, props) => {
  const newProps = migrateWalletProps(oldComponentName, props);
  const propsString = Object.entries(newProps)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      } else if (typeof value === 'boolean') {
        return value ? key : `${key}={false}`;
      } else {
        return `${key}={${JSON.stringify(value)}}`;
      }
    })
    .join(' ');

  return `<SuperWalletConnect ${propsString} />`;
};

// Usage examples for migration
export const MIGRATION_EXAMPLES = {
  'Before: WalletConnect': `
import WalletConnect from './components/WalletConnect';

<WalletConnect 
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
/>`,

  'After: SuperWalletConnect': `
import SuperWalletConnect from './components/unified/SuperWalletConnect';

<SuperWalletConnect 
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  mode="desktop"
  showWalletList={true}
/>`,

  'Before: UnifiedWalletConnect': `
import UnifiedWalletConnect from './components/unified/UnifiedWalletConnect';

<UnifiedWalletConnect 
  account={account}
  onConnect={onConnect}
  onDisconnect={onDisconnect}
  buttonText="Connect"
  compact={true}
/>`,

  'After: SuperWalletConnect (simple mode)': `
import SuperWalletConnect from './components/unified/SuperWalletConnect';

<SuperWalletConnect 
  account={account}
  onConnect={onConnect}
  onDisconnect={onDisconnect}
  buttonText="Connect"
  compact={true}
  mode="auto"
  showWalletList={false}
/>`,

  'Before: MobileWalletConnect': `
import MobileWalletConnect from './components/MobileWalletConnect';

<MobileWalletConnect 
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  account={externalAccount}
/>`,

  'After: SuperWalletConnect (mobile mode)': `
import SuperWalletConnect from './components/unified/SuperWalletConnect';

<SuperWalletConnect 
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  account={externalAccount}
  mode="mobile"
  enableRetry={true}
  maxRetries={3}
/>`
};

export default {
  MIGRATION_MAP,
  migrateWalletProps,
  generateMigrationReport,
  getReplacementCode,
  MIGRATION_EXAMPLES
};