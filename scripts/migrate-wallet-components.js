#!/usr/bin/env node

/**
 * Wallet Component Migration Script
 * Automatically migrates old wallet components to SuperWalletConnect
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  srcDir: path.resolve(__dirname, '../src'),
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  backup: process.argv.includes('--backup')
};

// Component mappings
const COMPONENT_MIGRATIONS = {
  'WalletConnect': {
    newComponent: 'SuperWalletConnect',
    newImport: './unified/SuperWalletConnect',
    propsMap: {
      'onConnect': 'onConnect',
      'onDisconnect': 'onDisconnect'
    },
    defaultProps: {
      mode: 'desktop',
      showWalletList: true
    }
  },
  
  'WalletConnection': {
    newComponent: 'SuperWalletConnect',
    newImport: './unified/SuperWalletConnect',
    propsMap: {
      'onWalletConnected': 'onConnect'
    },
    defaultProps: {
      mode: 'desktop',
      showWalletList: true,
      showNetworkStatus: true
    }
  },
  
  'WalletConnector': {
    newComponent: 'SuperWalletConnect',
    newImport: './unified/SuperWalletConnect',
    propsMap: {
      'onConnect': 'onConnect',
      'onDisconnect': 'onDisconnect',
      'currentAccount': 'account'
    },
    defaultProps: {
      mode: 'desktop',
      showWalletList: true
    }
  },
  
  'UnifiedWalletConnect': {
    newComponent: 'SuperWalletConnect',
    newImport: './unified/SuperWalletConnect',
    propsMap: {
      'account': 'account',
      'onConnect': 'onConnect',
      'onDisconnect': 'onDisconnect',
      'buttonText': 'buttonText',
      'compact': 'compact'
    },
    defaultProps: {
      mode: 'auto',
      showWalletList: false
    }
  },
  
  'MobileWalletConnect': {
    newComponent: 'SuperWalletConnect',
    newImport: './unified/SuperWalletConnect',
    propsMap: {
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

let migrationStats = {
  filesProcessed: 0,
  filesModified: 0,
  componentsReplaced: 0,
  importsUpdated: 0,
  errors: []
};

// Process a single file
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let fileModified = false;

  // Process each component migration
  Object.entries(COMPONENT_MIGRATIONS).forEach(([oldComponent, migration]) => {
    // Update import statements
    const importRegex = new RegExp(
      `import\\s+${oldComponent}\\s+from\\s+['"](.*?)['"];?`,
      'g'
    );
    
    if (importRegex.test(content)) {
      modifiedContent = modifiedContent.replace(
        importRegex,
        `import ${migration.newComponent} from '${migration.newImport}';`
      );
      migrationStats.importsUpdated++;
      fileModified = true;
    }

    // Update component usage
    const componentRegex = new RegExp(
      `<${oldComponent}(\\s[^>]*)?\\s*/?>`,'g'
    );
    
    const matches = modifiedContent.match(componentRegex);
    if (matches) {
      matches.forEach(match => {
        const newComponentTag = transformComponentUsage(match, oldComponent, migration);
        modifiedContent = modifiedContent.replace(match, newComponentTag);
        migrationStats.componentsReplaced++;
        fileModified = true;
      });
    }
  });

  if (fileModified) {
    migrationStats.filesModified++;
    
    if (config.backup) {
      fs.writeFileSync(`${filePath}.backup`, content);
    }
    
    if (!config.dryRun) {
      fs.writeFileSync(filePath, modifiedContent);
    }
    
    if (config.verbose) {
      console.log(`✅ Modified: ${path.relative(config.srcDir, filePath)}`);
    }
  }

  migrationStats.filesProcessed++;
}

// Transform component usage
function transformComponentUsage(componentTag, oldComponent, migration) {
  const { newComponent, propsMap, defaultProps } = migration;
  
  // Extract existing props
  const propsRegex = /(\w+)=\{([^}]+)\}|(\w+)="([^"]+)"|(\w+)=(\w+)|(\w+)(?=\s|$|\/)/g;
  const existingProps = {};
  let match;
  
  while ((match = propsRegex.exec(componentTag)) !== null) {
    const propName = match[1] || match[3] || match[5] || match[7];
    const propValue = match[2] || match[4] || match[6] || true;
    existingProps[propName] = propValue;
  }

  // Map old props to new props
  const newProps = { ...defaultProps };
  Object.entries(existingProps).forEach(([oldProp, value]) => {
    const newProp = propsMap[oldProp];
    if (newProp) {
      newProps[newProp] = value;
    } else if (!['className', 'key', 'ref'].includes(oldProp)) {
      // Keep other props that might be valid
      newProps[oldProp] = value;
    }
  });

  // Generate new component tag
  const propsString = Object.entries(newProps)
    .map(([key, value]) => {
      if (typeof value === 'string' && !value.startsWith('{')) {
        return `${key}="${value}"`;
      } else if (typeof value === 'boolean') {
        return value ? key : `${key}={false}`;
      } else {
        return `${key}={${value}}`;
      }
    })
    .join(' ');

  const selfClosing = componentTag.endsWith('/>');
  return selfClosing 
    ? `<${newComponent} ${propsString} />`
    : `<${newComponent} ${propsString}>`;
}

// Process directory recursively
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        processDirectory(filePath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        try {
          processFile(filePath);
        } catch (error) {
          migrationStats.errors.push({
            file: filePath,
            error: error.message
          });
        }
      }
    }
  });
}

// Generate migration report
function generateReport() {
  const oldComponents = Object.keys(COMPONENT_MIGRATIONS);
  const filesToRemove = [
    'src/components/WalletConnect.jsx',
    'src/components/WalletConnection.jsx',
    'src/components/WalletConnector.jsx',
    'src/components/UnifiedWalletConnect.jsx',
    'src/components/UnifiedWalletConnect-Fixed.jsx',
    'src/components/MobileWalletConnect.jsx',
    'src/components/web3/WalletConnection.jsx',
    'src/components/unified/UnifiedWalletConnect.jsx'
  ];

  const report = {
    migration: {
      timestamp: new Date().toISOString(),
      mode: config.dryRun ? 'DRY RUN' : 'LIVE',
      stats: migrationStats
    },
    oldComponents,
    newComponent: 'SuperWalletConnect',
    filesToRemove,
    benefits: [
      'Unified wallet connection logic',
      'Better mobile support with deep linking',
      'Improved error handling and retry logic',
      'Network verification and balance display',
      'Consistent UI across all wallet interactions',
      'Reduced bundle size from duplicate code removal'
    ],
    nextSteps: [
      '1. Review migrated components for correctness',
      '2. Test wallet connections in different scenarios',
      '3. Remove old component files',
      '4. Update CSS imports',
      '5. Run tests to ensure functionality',
      '6. Update documentation'
    ]
  };

  return report;
}

// Main execution
console.log('🔄 Starting wallet component migration...\n');

if (config.dryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
}

// Process all files
processDirectory(config.srcDir);

// Generate and display report
const report = generateReport();

console.log('\n📊 Migration Summary:');
console.log(`Files processed: ${migrationStats.filesProcessed}`);
console.log(`Files modified: ${migrationStats.filesModified}`);
console.log(`Components replaced: ${migrationStats.componentsReplaced}`);
console.log(`Imports updated: ${migrationStats.importsUpdated}`);
console.log(`Errors: ${migrationStats.errors.length}`);

if (migrationStats.errors.length > 0) {
  console.log('\n❌ Errors encountered:');
  migrationStats.errors.forEach(({ file, error }) => {
    console.log(`  ${path.relative(config.srcDir, file)}: ${error}`);
  });
}

console.log('\n📋 Components migrated:');
Object.keys(COMPONENT_MIGRATIONS).forEach(component => {
  console.log(`  ${component} → SuperWalletConnect`);
});

console.log('\n🗑️  Files to remove after migration:');
report.filesToRemove.forEach(file => {
  console.log(`  ${file}`);
});

console.log('\n✨ Benefits:');
report.benefits.forEach(benefit => {
  console.log(`  • ${benefit}`);
});

if (config.dryRun) {
  console.log('\n💡 Run without --dry-run to apply changes');
} else {
  console.log('\n✅ Migration completed successfully!');
}

// Save detailed report
const reportPath = path.resolve('wallet-migration-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📄 Detailed report saved to: ${reportPath}`);

process.exit(migrationStats.errors.length > 0 ? 1 : 0);