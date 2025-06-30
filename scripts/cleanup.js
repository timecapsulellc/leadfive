#!/usr/bin/env node

/**
 * LeadFive Codebase Cleanup Execution Script
 * Safely cleans up the codebase while preserving functionality
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CodebaseCleanup {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.dryRun = true;
    this.backupCreated = false;
  }

  async executeCleanup(options = {}) {
    this.dryRun = options.dryRun !== false;
    
    console.log('🧹 Starting LeadFive Codebase Cleanup...');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'EXECUTION'}\n`);
    
    if (!this.dryRun) {
      await this.createBackup();
      await this.createCleanupBranch();
    }
    
    await this.cleanupRootScripts();
    await this.cleanupDocumentation();
    await this.cleanupDeploymentFiles();
    await this.cleanupDuplicateConfigs();
    await this.organizeFileStructure();
    
    console.log('\n✅ Cleanup process completed!');
    
    if (!this.dryRun) {
      console.log('\n🔄 Next steps:');
      console.log('1. Test the application: npm run dev:fast');
      console.log('2. Verify all functionality works');
      console.log('3. Commit changes: git add . && git commit -m "feat: optimize codebase structure"');
      console.log('4. Merge to main: git checkout main && git merge codebase-cleanup-optimization');
    }
  }

  async createBackup() {
    if (this.backupCreated) return;
    
    console.log('💾 Creating backup...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `leadfive-backup-${timestamp}.tar.gz`;
    
    try {
      execSync(`tar -czf ${backupName} --exclude=node_modules --exclude=.git .`, {
        cwd: this.rootDir,
        stdio: 'inherit'
      });
      console.log(`✅ Backup created: ${backupName}`);
      this.backupCreated = true;
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      process.exit(1);
    }
  }

  async createCleanupBranch() {
    console.log('🌿 Creating cleanup branch...');
    
    try {
      // Check if branch exists
      const branchExists = execSync('git branch --list codebase-cleanup-optimization', {
        cwd: this.rootDir,
        encoding: 'utf8'
      }).trim();
      
      if (!branchExists) {
        execSync('git checkout -b codebase-cleanup-optimization', {
          cwd: this.rootDir,
          stdio: 'inherit'
        });
        console.log('✅ Created and switched to cleanup branch');
      } else {
        execSync('git checkout codebase-cleanup-optimization', {
          cwd: this.rootDir,
          stdio: 'inherit'
        });
        console.log('✅ Switched to existing cleanup branch');
      }
    } catch (error) {
      console.error('❌ Branch creation failed:', error.message);
      process.exit(1);
    }
  }

  async cleanupRootScripts() {
    console.log('\n🗂️  Cleaning up root scripts...');
    
    const scriptsToMove = [
      'check-',
      'test-',
      'debug-',
      'analyze-',
      'verify-',
      'simulate-',
      'comprehensive-',
      'deploy-',
      'upgrade-',
      'fix-',
      'run-',
      'register-',
      'transfer-',
      'mainnet-',
      'testnet-'
    ];
    
    // Ensure scripts directory exists
    const scriptsDir = path.join(this.rootDir, 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      console.log('📁 Creating scripts/ directory...');
      if (!this.dryRun) {
        fs.mkdirSync(scriptsDir, { recursive: true });
      }
    }
    
    const rootFiles = fs.readdirSync(this.rootDir);
    let movedCount = 0;
    
    rootFiles.forEach(file => {
      const shouldMove = scriptsToMove.some(pattern => file.startsWith(pattern)) && 
                        (file.endsWith('.cjs') || file.endsWith('.js'));
      
      if (shouldMove) {
        const srcPath = path.join(this.rootDir, file);
        const destPath = path.join(scriptsDir, file);
        
        console.log(`   → Moving ${file} to scripts/`);
        
        if (!this.dryRun) {
          fs.renameSync(srcPath, destPath);
        }
        movedCount++;
      }
    });
    
    console.log(`✅ ${movedCount} scripts organized`);
  }

  async cleanupDocumentation() {
    console.log('\n📚 Cleaning up documentation...');
    
    // Create docs directory if it doesn't exist
    const docsDir = path.join(this.rootDir, 'docs');
    const archiveDir = path.join(docsDir, 'archive');
    
    if (!fs.existsSync(docsDir)) {
      console.log('📁 Creating docs/ directory...');
      if (!this.dryRun) {
        fs.mkdirSync(docsDir, { recursive: true });
      }
    }
    
    if (!fs.existsSync(archiveDir)) {
      console.log('📁 Creating docs/archive/ directory...');
      if (!this.dryRun) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }
    }
    
    const keepInRoot = [
      'README.md',
      'LICENSE'
    ];
    
    const moveToArchive = [
      'BSC_TESTNET_',
      'DEPLOYMENT_',
      'TESTING_',
      'UPGRADE_',
      '_SUCCESS',
      '_REPORT',
      '_GUIDE',
      'CONTRACT_',
      'MAINNET_',
      'FRONTEND_',
      'COMPLETE_',
      'FINAL_',
      'COMPREHENSIVE_'
    ];
    
    const rootFiles = fs.readdirSync(this.rootDir);
    let archivedCount = 0;
    
    rootFiles.forEach(file => {
      if (file.endsWith('.md') && !keepInRoot.includes(file)) {
        const shouldArchive = moveToArchive.some(pattern => file.includes(pattern));
        
        if (shouldArchive) {
          const srcPath = path.join(this.rootDir, file);
          const destPath = path.join(archiveDir, file);
          
          console.log(`   → Archiving ${file}`);
          
          if (!this.dryRun) {
            fs.renameSync(srcPath, destPath);
          }
          archivedCount++;
        }
      }
    });
    
    // Move important docs to docs/ folder
    const importantDocs = ['PHD_LEVEL_SECURITY_AUDIT_REPORT.md'];
    importantDocs.forEach(doc => {
      const srcPath = path.join(this.rootDir, doc);
      const destPath = path.join(docsDir, doc);
      
      if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
        console.log(`   → Moving ${doc} to docs/`);
        if (!this.dryRun) {
          fs.renameSync(srcPath, destPath);
        }
      }
    });
    
    console.log(`✅ ${archivedCount} documentation files archived`);
  }

  async cleanupDeploymentFiles() {
    console.log('\n🚀 Cleaning up deployment files...');
    
    const deploymentDir = path.join(this.rootDir, 'deployment');
    const archiveDir = path.join(deploymentDir, 'archive');
    
    if (!fs.existsSync(deploymentDir)) {
      console.log('📁 Creating deployment/ directory...');
      if (!this.dryRun) {
        fs.mkdirSync(deploymentDir, { recursive: true });
      }
    }
    
    if (!fs.existsSync(archiveDir)) {
      console.log('📁 Creating deployment/archive/ directory...');
      if (!this.dryRun) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }
    }
    
    const rootFiles = fs.readdirSync(this.rootDir);
    let archivedCount = 0;
    
    rootFiles.forEach(file => {
      if (file.endsWith('.json') && 
          (file.includes('deployment') || 
           file.includes('mainnet') || 
           file.includes('testnet'))) {
        
        const srcPath = path.join(this.rootDir, file);
        const stats = fs.statSync(srcPath);
        const isOld = Date.now() - stats.mtime.getTime() > 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (isOld) {
          const destPath = path.join(archiveDir, file);
          console.log(`   → Archiving ${file}`);
          
          if (!this.dryRun) {
            fs.renameSync(srcPath, destPath);
          }
          archivedCount++;
        } else {
          // Keep recent deployment files but move to deployment/
          const destPath = path.join(deploymentDir, file);
          console.log(`   → Moving ${file} to deployment/`);
          
          if (!this.dryRun && !fs.existsSync(destPath)) {
            fs.renameSync(srcPath, destPath);
          }
        }
      }
    });
    
    console.log(`✅ ${archivedCount} old deployment files archived`);
  }

  async cleanupDuplicateConfigs() {
    console.log('\n⚙️  Cleaning up duplicate configuration files...');
    
    const configFiles = [
      { pattern: 'hardhat.config', keep: 'hardhat.config.js' },
      { pattern: 'vite.config', keep: 'vite.config.js' }
    ];
    
    let removedCount = 0;
    
    configFiles.forEach(({ pattern, keep }) => {
      const rootFiles = fs.readdirSync(this.rootDir);
      const matches = rootFiles.filter(file => 
        file.includes(pattern) && file !== keep
      );
      
      matches.forEach(file => {
        console.log(`   → Removing duplicate config: ${file}`);
        if (!this.dryRun) {
          fs.unlinkSync(path.join(this.rootDir, file));
        }
        removedCount++;
      });
    });
    
    console.log(`✅ ${removedCount} duplicate config files removed`);
  }

  async organizeFileStructure() {
    console.log('\n📁 Organizing file structure...');
    
    // Create organized directories
    const directories = [
      'src/components/dashboard',
      'src/components/ai',
      'src/components/common',
      'src/components/layout',
      'src/components/forms',
      'src/services/api',
      'src/services/blockchain',
      'src/services/ai',
      'src/config',
      'src/constants',
      'src/utils',
      'src/hooks'
    ];
    
    directories.forEach(dir => {
      const fullPath = path.join(this.rootDir, dir);
      if (!fs.existsSync(fullPath)) {
        console.log(`   → Creating ${dir}/`);
        if (!this.dryRun) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
      }
    });
    
    // Create index.js files for better imports
    const indexFiles = [
      'src/components/index.js',
      'src/services/index.js',
      'src/config/index.js',
      'src/constants/index.js',
      'src/utils/index.js',
      'src/hooks/index.js'
    ];
    
    indexFiles.forEach(indexFile => {
      const fullPath = path.join(this.rootDir, indexFile);
      if (!fs.existsSync(fullPath)) {
        console.log(`   → Creating ${indexFile}`);
        if (!this.dryRun) {
          fs.writeFileSync(fullPath, '// Export all components from this directory\n');
        }
      }
    });
    
    console.log('✅ File structure organized');
  }
}

// CLI interface
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

if (dryRun) {
  console.log('🔍 Running in DRY RUN mode. Use --execute to actually perform cleanup.\n');
}

const cleanup = new CodebaseCleanup(process.cwd());
cleanup.executeCleanup({ dryRun }).catch(console.error);

export default CodebaseCleanup;
