#!/usr/bin/env node

/**
 * PhD-Level Comprehensive Testing Suite
 * Advanced validation before production merge
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class AdvancedTestingSuite {
  constructor() {
    this.testResults = {
      structural: [],
      functional: [],
      performance: [],
      security: [],
      compatibility: []
    };
    this.issues = [];
    this.warnings = [];
  }

  // 1. STRUCTURAL INTEGRITY TESTS
  async testStructuralIntegrity() {
    console.log('🔬 PHASE 1: STRUCTURAL INTEGRITY ANALYSIS');
    console.log('=' .repeat(50));

    // Test 1.1: Critical file presence
    const criticalFiles = [
      'package.json',
      'vite.config.js',
      'hardhat.config.js',
      'src/main.jsx',
      'src/App.jsx',
      'index.html'
    ];

    console.log('📋 Testing critical file presence...');
    for (const file of criticalFiles) {
      if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
        this.testResults.structural.push({ test: file, status: 'PASS' });
      } else {
        console.log(`   ❌ MISSING: ${file}`);
        this.issues.push(`Critical file missing: ${file}`);
        this.testResults.structural.push({ test: file, status: 'FAIL' });
      }
    }

    // Test 1.2: Directory structure validation
    console.log('\n📁 Validating directory structure...');
    const expectedDirs = [
      'src',
      'scripts',
      'docs',
      'deployment',
      'contracts',
      'public'
    ];

    for (const dir of expectedDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        console.log(`   ✅ ${dir}/ (${files.length} items)`);
        this.testResults.structural.push({ test: `${dir}-structure`, status: 'PASS' });
      } else {
        console.log(`   ❌ MISSING: ${dir}/`);
        this.issues.push(`Expected directory missing: ${dir}`);
        this.testResults.structural.push({ test: `${dir}-structure`, status: 'FAIL' });
      }
    }

    // Test 1.3: Package.json validation
    console.log('\n📦 Validating package.json integrity...');
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const requiredScripts = ['dev', 'build', 'preview', 'test'];
      for (const script of requiredScripts) {
        if (pkg.scripts[script]) {
          console.log(`   ✅ Script: ${script}`);
        } else {
          console.log(`   ⚠️  Missing script: ${script}`);
          this.warnings.push(`Missing package.json script: ${script}`);
        }
      }

      const criticalDeps = ['react', 'vite', 'ethers'];
      for (const dep of criticalDeps) {
        if (pkg.dependencies[dep] || pkg.devDependencies[dep]) {
          console.log(`   ✅ Dependency: ${dep}`);
        } else {
          console.log(`   ❌ Missing dependency: ${dep}`);
          this.issues.push(`Critical dependency missing: ${dep}`);
        }
      }

      this.testResults.structural.push({ test: 'package-validation', status: 'PASS' });
    } catch (error) {
      console.log(`   ❌ Package.json validation failed: ${error.message}`);
      this.issues.push(`Package.json validation error: ${error.message}`);
      this.testResults.structural.push({ test: 'package-validation', status: 'FAIL' });
    }
  }

  // 2. FUNCTIONAL TESTS
  async testFunctionalIntegrity() {
    console.log('\n🔧 PHASE 2: FUNCTIONAL INTEGRITY TESTS');
    console.log('=' .repeat(50));

    // Test 2.1: Build process
    console.log('🏗️  Testing build process...');
    try {
      console.log('   Running production build...');
      execSync('npm run build', { stdio: 'pipe' });
      console.log('   ✅ Build successful');
      this.testResults.functional.push({ test: 'build-process', status: 'PASS' });
      
      // Check build output
      if (fs.existsSync('dist')) {
        const distFiles = fs.readdirSync('dist');
        console.log(`   ✅ Build output created (${distFiles.length} files)`);
        this.testResults.functional.push({ test: 'build-output', status: 'PASS' });
      } else {
        console.log('   ❌ Build output directory missing');
        this.issues.push('Build did not create dist directory');
        this.testResults.functional.push({ test: 'build-output', status: 'FAIL' });
      }
    } catch (error) {
      console.log(`   ❌ Build failed: ${error.message}`);
      this.issues.push(`Build process failed: ${error.message}`);
      this.testResults.functional.push({ test: 'build-process', status: 'FAIL' });
    }

    // Test 2.2: Script accessibility
    console.log('\n📜 Testing script accessibility...');
    const scriptDir = 'scripts';
    if (fs.existsSync(scriptDir)) {
      const scripts = fs.readdirSync(scriptDir).filter(f => f.endsWith('.cjs') || f.endsWith('.js'));
      console.log(`   ✅ Found ${scripts.length} scripts in scripts/ directory`);
      
      // Test a few critical scripts
      const criticalScripts = [
        'scripts/performance-diagnostics.cjs',
        'scripts/analyze-codebase.js',
        'scripts/build-performance.cjs'
      ];

      for (const script of criticalScripts) {
        if (fs.existsSync(script)) {
          console.log(`   ✅ ${script}`);
          this.testResults.functional.push({ test: script, status: 'PASS' });
        } else {
          console.log(`   ❌ Missing: ${script}`);
          this.issues.push(`Expected script missing: ${script}`);
          this.testResults.functional.push({ test: script, status: 'FAIL' });
        }
      }
    }

    // Test 2.3: Import resolution
    console.log('\n🔗 Testing import resolution...');
    try {
      // Test if main entry point exists and is valid
      const mainFile = 'src/main.jsx';
      if (fs.existsSync(mainFile)) {
        const content = fs.readFileSync(mainFile, 'utf8');
        if (content.includes('import') && content.includes('React')) {
          console.log('   ✅ Main entry point valid');
          this.testResults.functional.push({ test: 'main-entry', status: 'PASS' });
        } else {
          console.log('   ⚠️  Main entry point may have issues');
          this.warnings.push('Main entry point structure unclear');
        }
      }
    } catch (error) {
      console.log(`   ❌ Import resolution test failed: ${error.message}`);
      this.warnings.push(`Import resolution issue: ${error.message}`);
    }
  }

  // 3. PERFORMANCE ANALYSIS
  async testPerformanceMetrics() {
    console.log('\n⚡ PHASE 3: PERFORMANCE ANALYSIS');
    console.log('=' .repeat(50));

    // Test 3.1: Bundle size analysis
    console.log('📦 Analyzing bundle metrics...');
    try {
      if (fs.existsSync('dist')) {
        const distStats = this.calculateDirectorySize('dist');
        console.log(`   📊 Total build size: ${(distStats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   📄 Total files: ${distStats.files}`);
        
        if (distStats.size < 50 * 1024 * 1024) { // 50MB threshold
          console.log('   ✅ Bundle size within acceptable limits');
          this.testResults.performance.push({ test: 'bundle-size', status: 'PASS' });
        } else {
          console.log('   ⚠️  Bundle size is large, consider optimization');
          this.warnings.push('Bundle size exceeds 50MB - consider optimization');
          this.testResults.performance.push({ test: 'bundle-size', status: 'WARN' });
        }
      }
    } catch (error) {
      console.log(`   ❌ Bundle analysis failed: ${error.message}`);
      this.warnings.push(`Bundle analysis error: ${error.message}`);
    }

    // Test 3.2: Code organization efficiency
    console.log('\n🏗️  Analyzing code organization...');
    const srcStats = this.calculateDirectorySize('src');
    const scriptsStats = this.calculateDirectorySize('scripts');
    
    console.log(`   📊 Source code: ${srcStats.files} files, ${(srcStats.size / 1024).toFixed(2)} KB`);
    console.log(`   📊 Scripts: ${scriptsStats.files} files, ${(scriptsStats.size / 1024).toFixed(2)} KB`);
    
    if (scriptsStats.files > 50) {
      console.log('   ✅ Good script organization (centralized)');
      this.testResults.performance.push({ test: 'script-organization', status: 'PASS' });
    } else {
      console.log('   ⚠️  Consider organizing more utility scripts');
      this.warnings.push('Script organization could be improved');
    }
  }

  // 4. SECURITY VALIDATION
  async testSecurityCompliance() {
    console.log('\n🔒 PHASE 4: SECURITY COMPLIANCE CHECK');
    console.log('=' .repeat(50));

    // Test 4.1: Sensitive file exclusion
    console.log('🛡️  Checking for sensitive files...');
    const sensitivePatterns = [
      '.env.local',
      '.env.production.local',
      'private-key',
      'secret',
      '*.pem',
      '*.key'
    ];

    let sensitiveFound = 0;
    for (const pattern of sensitivePatterns) {
      try {
        const files = execSync(`find . -name "${pattern}" -not -path "./node_modules/*" 2>/dev/null || true`, 
          { encoding: 'utf8' }).trim().split('\n').filter(f => f);
        
        if (files.length > 0 && files[0]) {
          console.log(`   ⚠️  Found potentially sensitive files: ${files.join(', ')}`);
          this.warnings.push(`Potentially sensitive files found: ${files.join(', ')}`);
          sensitiveFound++;
        }
      } catch (error) {
        // Ignore errors in file searching
      }
    }

    if (sensitiveFound === 0) {
      console.log('   ✅ No obvious sensitive files in repository');
      this.testResults.security.push({ test: 'sensitive-files', status: 'PASS' });
    }

    // Test 4.2: .gitignore validation
    console.log('\n📝 Validating .gitignore...');
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      const requiredIgnores = ['node_modules', '.env', 'dist', '.DS_Store'];
      
      for (const ignore of requiredIgnores) {
        if (gitignore.includes(ignore)) {
          console.log(`   ✅ ${ignore} ignored`);
        } else {
          console.log(`   ⚠️  Missing from .gitignore: ${ignore}`);
          this.warnings.push(`Missing from .gitignore: ${ignore}`);
        }
      }
      this.testResults.security.push({ test: 'gitignore-validation', status: 'PASS' });
    } else {
      console.log('   ❌ .gitignore file missing');
      this.issues.push('.gitignore file missing');
      this.testResults.security.push({ test: 'gitignore-validation', status: 'FAIL' });
    }
  }

  // 5. COMPATIBILITY TESTS
  async testCompatibility() {
    console.log('\n🔄 PHASE 5: COMPATIBILITY VALIDATION');
    console.log('=' .repeat(50));

    // Test 5.1: Node.js version compatibility
    console.log('⚙️  Checking Node.js compatibility...');
    try {
      const nodeVersion = process.version;
      console.log(`   📊 Current Node.js version: ${nodeVersion}`);
      
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      if (majorVersion >= 16) {
        console.log('   ✅ Node.js version compatible');
        this.testResults.compatibility.push({ test: 'node-version', status: 'PASS' });
      } else {
        console.log('   ⚠️  Node.js version may be too old');
        this.warnings.push(`Node.js version ${nodeVersion} may be too old`);
        this.testResults.compatibility.push({ test: 'node-version', status: 'WARN' });
      }
    } catch (error) {
      console.log(`   ❌ Node.js version check failed: ${error.message}`);
    }

    // Test 5.2: Package manager compatibility
    console.log('\n📦 Testing package manager...');
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(`   📊 NPM version: ${npmVersion}`);
      console.log('   ✅ NPM available');
      this.testResults.compatibility.push({ test: 'npm-available', status: 'PASS' });
    } catch (error) {
      console.log(`   ❌ NPM not available: ${error.message}`);
      this.issues.push('NPM not available');
    }
  }

  // Utility method
  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    let fileCount = 0;

    function calculateSize(currentPath) {
      const stats = fs.statSync(currentPath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
          calculateSize(path.join(currentPath, file));
        }
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    }

    if (fs.existsSync(dirPath)) {
      calculateSize(dirPath);
    }

    return { size: totalSize, files: fileCount };
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(60));

    const totalTests = Object.values(this.testResults).reduce((sum, tests) => sum + tests.length, 0);
    const passedTests = Object.values(this.testResults).reduce((sum, tests) => 
      sum + tests.filter(t => t.status === 'PASS').length, 0);
    const failedTests = Object.values(this.testResults).reduce((sum, tests) => 
      sum + tests.filter(t => t.status === 'FAIL').length, 0);

    console.log(`\n📈 SUMMARY STATISTICS:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    console.log(`   Critical Issues: ${this.issues.length}`);

    if (this.issues.length > 0) {
      console.log(`\n❌ CRITICAL ISSUES:`);
      this.issues.forEach((issue, i) => console.log(`   ${i+1}. ${issue}`));
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS:`);
      this.warnings.forEach((warning, i) => console.log(`   ${i+1}. ${warning}`));
    }

    // Recommendation
    console.log(`\n🎯 RECOMMENDATION:`);
    if (this.issues.length === 0 && failedTests === 0) {
      console.log(`   ✅ READY FOR MERGE - All critical tests passed`);
      if (this.warnings.length > 0) {
        console.log(`   📝 Address ${this.warnings.length} warnings in future iterations`);
      }
      return 'READY_FOR_MERGE';
    } else {
      console.log(`   ⚠️  REQUIRES ATTENTION - ${this.issues.length} critical issues found`);
      console.log(`   📋 Resolve critical issues before merging to main`);
      return 'REQUIRES_FIXES';
    }
  }

  // Main execution
  async runComprehensiveTests() {
    console.log('🎓 PhD-LEVEL COMPREHENSIVE TESTING SUITE');
    console.log('🔬 Advanced Validation for Production Merge');
    console.log('=' .repeat(60));

    await this.testStructuralIntegrity();
    await this.testFunctionalIntegrity();
    await this.testPerformanceMetrics();
    await this.testSecurityCompliance();
    await this.testCompatibility();

    return this.generateReport();
  }
}

// Execute comprehensive testing
const testSuite = new AdvancedTestingSuite();
testSuite.runComprehensiveTests().then(result => {
  console.log(`\n🚀 FINAL STATUS: ${result}`);
  process.exit(result === 'READY_FOR_MERGE' ? 0 : 1);
}).catch(error => {
  console.error(`\n❌ Testing suite failed: ${error.message}`);
  process.exit(1);
});
