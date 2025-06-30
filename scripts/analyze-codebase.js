#!/usr/bin/env node

/**
 * LeadFive Codebase Cleanup Analysis Script
 * Analyzes the current codebase and provides cleanup recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CodebaseAnalyzer {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.results = {
      duplicateFiles: [],
      unusedFiles: [],
      largeFiles: [],
      outdatedFiles: [],
      recommendations: []
    };
  }

  async analyze() {
    console.log('🔍 Starting LeadFive Codebase Analysis...\n');
    
    this.analyzeRootDirectory();
    this.identifyDuplicateConfigs();
    this.identifyOutdatedDocumentation();
    this.identifyTestingFiles();
    this.identifyDeploymentFiles();
    this.analyzeFileTypes();
    this.generateRecommendations();
    
    this.printResults();
  }

  analyzeRootDirectory() {
    console.log('📁 Analyzing root directory structure...');
    
    const rootFiles = fs.readdirSync(this.rootDir);
    const problematicFiles = [];
    
    rootFiles.forEach(file => {
      const filePath = path.join(this.rootDir, file);
      const stats = fs.statSync(filePath);
      
      // Check for problematic files in root
      if (file.startsWith('check-') || 
          file.startsWith('test-') || 
          file.startsWith('debug-') ||
          file.startsWith('analyze-') ||
          file.includes('deployment') ||
          file.includes('upgrade')) {
        
        problematicFiles.push({
          name: file,
          size: stats.size,
          type: 'script',
          recommendation: 'Move to scripts/ or remove if obsolete'
        });
      }
      
      // Check for large files
      if (stats.size > 1024 * 1024) { // > 1MB
        this.results.largeFiles.push({
          name: file,
          size: Math.round(stats.size / 1024 / 1024 * 100) / 100 + ' MB',
          recommendation: 'Review if necessary or can be compressed'
        });
      }
    });
    
    this.results.unusedFiles.push(...problematicFiles);
  }

  identifyDuplicateConfigs() {
    console.log('⚙️ Identifying duplicate configuration files...');
    
    const configPatterns = [
      'hardhat.config',
      'vite.config',
      '.env',
      'package.json'
    ];
    
    configPatterns.forEach(pattern => {
      const matches = this.findFilesByPattern(pattern);
      if (matches.length > 1) {
        this.results.duplicateFiles.push({
          pattern,
          files: matches,
          recommendation: `Keep only the main ${pattern}.js file, remove others`
        });
      }
    });
  }

  identifyOutdatedDocumentation() {
    console.log('📚 Identifying outdated documentation...');
    
    const rootFiles = fs.readdirSync(this.rootDir);
    const docFiles = rootFiles.filter(file => file.endsWith('.md'));
    
    const keepFiles = [
      'README.md',
      'PHD_LEVEL_SECURITY_AUDIT_REPORT.md'
    ];
    
    const archivePatterns = [
      'BSC_TESTNET_',
      'DEPLOYMENT_',
      'TESTING_',
      'UPGRADE_',
      '_SUCCESS',
      '_REPORT',
      '_GUIDE'
    ];
    
    docFiles.forEach(file => {
      if (!keepFiles.includes(file)) {
        const shouldArchive = archivePatterns.some(pattern => 
          file.includes(pattern)
        );
        
        if (shouldArchive) {
          this.results.outdatedFiles.push({
            name: file,
            type: 'documentation',
            recommendation: 'Archive to docs/archive/ folder'
          });
        }
      }
    });
  }

  identifyTestingFiles() {
    console.log('🧪 Identifying testing and debug files...');
    
    const rootFiles = fs.readdirSync(this.rootDir);
    const testPatterns = [
      'test-',
      'check-',
      'debug-',
      'analyze-',
      'verify-',
      'simulate-',
      'comprehensive-'
    ];
    
    rootFiles.forEach(file => {
      const isTestFile = testPatterns.some(pattern => 
        file.startsWith(pattern)
      );
      
      if (isTestFile && file.endsWith('.cjs')) {
        this.results.unusedFiles.push({
          name: file,
          type: 'test/debug script',
          recommendation: 'Move to scripts/ folder or remove if obsolete'
        });
      }
    });
  }

  identifyDeploymentFiles() {
    console.log('🚀 Identifying deployment files...');
    
    const rootFiles = fs.readdirSync(this.rootDir);
    const deploymentPatterns = [
      'deploy-',
      'deployment-',
      'mainnet-',
      'testnet-',
      '.json'
    ];
    
    rootFiles.forEach(file => {
      if (file.includes('deployment') && file.endsWith('.json')) {
        const stats = fs.statSync(path.join(this.rootDir, file));
        const isOld = Date.now() - stats.mtime.getTime() > 30 * 24 * 60 * 60 * 1000; // 30 days
        
        if (isOld) {
          this.results.outdatedFiles.push({
            name: file,
            type: 'deployment record',
            age: Math.round((Date.now() - stats.mtime.getTime()) / (24 * 60 * 60 * 1000)) + ' days',
            recommendation: 'Archive to deployment/archive/ folder'
          });
        }
      }
    });
  }

  analyzeFileTypes() {
    console.log('📊 Analyzing file type distribution...');
    
    const fileTypes = {};
    const countFiles = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (!file.startsWith('.')) {
            countFiles(fullPath);
          }
        } else {
          const ext = path.extname(file);
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        }
      });
    };
    
    countFiles(this.rootDir);
    this.results.fileTypes = fileTypes;
  }

  findFilesByPattern(pattern) {
    const rootFiles = fs.readdirSync(this.rootDir);
    return rootFiles.filter(file => file.includes(pattern));
  }

  generateRecommendations() {
    console.log('💡 Generating cleanup recommendations...\n');
    
    this.results.recommendations = [
      {
        priority: 'HIGH',
        action: 'Create cleanup branch',
        command: 'git checkout -b codebase-cleanup-optimization'
      },
      {
        priority: 'HIGH',
        action: 'Create backup',
        command: 'tar -czf leadfive-backup-$(date +%Y%m%d-%H%M%S).tar.gz .'
      },
      {
        priority: 'MEDIUM',
        action: 'Move test scripts to scripts/ folder',
        files: this.results.unusedFiles.filter(f => f.type.includes('test')).length
      },
      {
        priority: 'MEDIUM',
        action: 'Archive outdated documentation',
        files: this.results.outdatedFiles.filter(f => f.type === 'documentation').length
      },
      {
        priority: 'LOW',
        action: 'Remove duplicate config files',
        files: this.results.duplicateFiles.length
      }
    ];
  }

  printResults() {
    console.log('📋 CLEANUP ANALYSIS RESULTS');
    console.log('=' * 50);
    
    console.log('\n🗑️  FILES TO REMOVE/ARCHIVE:');
    console.log(`   • Unused files: ${this.results.unusedFiles.length}`);
    console.log(`   • Outdated files: ${this.results.outdatedFiles.length}`);
    console.log(`   • Duplicate configs: ${this.results.duplicateFiles.length}`);
    console.log(`   • Large files: ${this.results.largeFiles.length}`);
    
    console.log('\n📊 FILE TYPE DISTRIBUTION:');
    Object.entries(this.results.fileTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([ext, count]) => {
        console.log(`   • ${ext || 'no extension'}: ${count} files`);
      });
    
    console.log('\n🎯 TOP RECOMMENDATIONS:');
    this.results.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority}] ${rec.action}`);
      if (rec.command) console.log(`      → ${rec.command}`);
      if (rec.files) console.log(`      → Affects ${rec.files} files`);
    });
    
    console.log('\n⚠️  DETAILED FINDINGS:');
    
    if (this.results.unusedFiles.length > 0) {
      console.log('\n   Unused/Test Files:');
      this.results.unusedFiles.slice(0, 10).forEach(file => {
        console.log(`   • ${file.name} (${file.type})`);
      });
      if (this.results.unusedFiles.length > 10) {
        console.log(`   ... and ${this.results.unusedFiles.length - 10} more`);
      }
    }
    
    if (this.results.outdatedFiles.length > 0) {
      console.log('\n   Outdated Documentation:');
      this.results.outdatedFiles.slice(0, 5).forEach(file => {
        console.log(`   • ${file.name} ${file.age ? '(' + file.age + ' old)' : ''}`);
      });
    }
    
    if (this.results.largeFiles.length > 0) {
      console.log('\n   Large Files:');
      this.results.largeFiles.forEach(file => {
        console.log(`   • ${file.name} (${file.size})`);
      });
    }
    
    console.log('\n✅ CLEANUP SCRIPT COMPLETED');
    console.log('   Run: node scripts/cleanup.js --execute to start cleanup');
  }
}

// Run analysis
const analyzer = new CodebaseAnalyzer(process.cwd());
analyzer.analyze().catch(console.error);

export default CodebaseAnalyzer;
