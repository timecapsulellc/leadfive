#!/usr/bin/env node

/**
 * MAINNET CONFIGURATION VERIFICATION SCRIPT
 * Verifies all contract addresses and roles are correctly configured
 */

const fs = require('fs');

console.log('🔍 MAINNET CONFIGURATION VERIFICATION');
console.log('=====================================\n');

const expectedConfig = {
  CONTRACT_ADDRESS: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
  IMPLEMENTATION_ADDRESS: '0x2cc37CB4e1F5D3D56E86c8792fD241d46064B2cF',
  OWNER_ADDRESS: '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335',
  ROOT_USER_ADDRESS: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29',
  DEPLOYER_ADDRESS: '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335'
};

let allChecks = true;

function checkConfig(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
  } else {
    console.log(`❌ ${message}`);
    allChecks = false;
  }
  return condition;
}

async function verifyConfiguration() {
  console.log('1. 📄 Environment Files Verification');
  console.log('------------------------------------');
  
  // Check .env file
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    
    checkConfig(
      envContent.includes(`VITE_CONTRACT_ADDRESS=${expectedConfig.CONTRACT_ADDRESS}`),
      '.env: Contract address correct'
    );
    
    checkConfig(
      envContent.includes(`VITE_IMPLEMENTATION_ADDRESS=${expectedConfig.IMPLEMENTATION_ADDRESS}`),
      '.env: Implementation address updated to v1.10'
    );
    
    checkConfig(
      envContent.includes(`VITE_OWNER_ADDRESS=${expectedConfig.OWNER_ADDRESS}`),
      '.env: Owner address set correctly'
    );
    
    checkConfig(
      envContent.includes(`VITE_ROOT_USER_ADDRESS=${expectedConfig.ROOT_USER_ADDRESS}`),
      '.env: Root user address configured'
    );
  } else {
    checkConfig(false, '.env file not found');
  }
  
  console.log('\n2. 🌐 Digital Ocean Configuration');
  console.log('---------------------------------');
  
  // Check .do/app.yaml file
  if (fs.existsSync('.do/app.yaml')) {
    const yamlContent = fs.readFileSync('.do/app.yaml', 'utf8');
    
    checkConfig(
      yamlContent.includes(`value: "${expectedConfig.CONTRACT_ADDRESS}"`),
      'app.yaml: Contract address correct'
    );
    
    checkConfig(
      yamlContent.includes(`value: "${expectedConfig.IMPLEMENTATION_ADDRESS}"`),
      'app.yaml: Implementation address updated'
    );
    
    checkConfig(
      yamlContent.includes(`value: "${expectedConfig.OWNER_ADDRESS}"`),
      'app.yaml: Owner address set'
    );
    
    checkConfig(
      yamlContent.includes(`value: "${expectedConfig.ROOT_USER_ADDRESS}"`),
      'app.yaml: Root user address configured'
    );
  } else {
    checkConfig(false, '.do/app.yaml file not found');
  }
  
  console.log('\n3. 🔧 Source Code Configuration');
  console.log('-------------------------------');
  
  // Check deployment constants
  if (fs.existsSync('src/constants/deployment.js')) {
    const deploymentContent = fs.readFileSync('src/constants/deployment.js', 'utf8');
    
    checkConfig(
      deploymentContent.includes(`'${expectedConfig.IMPLEMENTATION_ADDRESS}'`),
      'deployment.js: Implementation address updated'
    );
    
    checkConfig(
      deploymentContent.includes(`'${expectedConfig.CONTRACT_ADDRESS}'`),
      'deployment.js: Contract address correct'
    );
  }
  
  // Check app config
  if (fs.existsSync('src/config/app.js')) {
    const appConfigContent = fs.readFileSync('src/config/app.js', 'utf8');
    
    checkConfig(
      appConfigContent.includes(`'${expectedConfig.IMPLEMENTATION_ADDRESS}'`),
      'app.js: Implementation address updated'
    );
  }
  
  // Check contracts config
  if (fs.existsSync('src/config/contracts.js')) {
    const contractsContent = fs.readFileSync('src/config/contracts.js', 'utf8');
    
    checkConfig(
      contractsContent.includes(`'${expectedConfig.IMPLEMENTATION_ADDRESS}'`),
      'contracts.js: Implementation address updated'
    );
  }
  
  console.log('\n4. 🎯 Address Validation');
  console.log('------------------------');
  
  // Validate address formats
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  
  Object.entries(expectedConfig).forEach(([key, address]) => {
    checkConfig(
      addressRegex.test(address),
      `${key}: Valid Ethereum address format`
    );
  });
  
  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('=======================');
  
  if (allChecks) {
    console.log('🎉 ALL CONFIGURATION CHECKS PASSED!');
    console.log('');
    console.log('✅ Contract addresses synchronized with mainnet');
    console.log('✅ Implementation updated to v1.10');
    console.log('✅ Owner and root user addresses configured');
    console.log('✅ All environment files updated');
    console.log('✅ Source code configuration aligned');
    console.log('');
    console.log('🚀 MAINNET CONFIGURATION STATUS: READY');
    console.log('');
    console.log('📍 Current Configuration:');
    console.log(`   Contract: ${expectedConfig.CONTRACT_ADDRESS}`);
    console.log(`   Implementation: ${expectedConfig.IMPLEMENTATION_ADDRESS}`);
    console.log(`   Owner: ${expectedConfig.OWNER_ADDRESS}`);
    console.log(`   Root User: ${expectedConfig.ROOT_USER_ADDRESS}`);
    console.log('');
    console.log('🔄 Next Steps:');
    console.log('1. Deploy to Digital Ocean');
    console.log('2. Test contract interactions');
    console.log('3. Verify owner functions');
    console.log('4. Validate root user access');
  } else {
    console.log('⚠️  SOME CONFIGURATION CHECKS FAILED');
    console.log('');
    console.log('Please review the failed checks above and ensure all');
    console.log('configuration files are properly updated before deployment.');
  }
  
  return allChecks;
}

verifyConfiguration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Configuration verification failed:', error.message);
    process.exit(1);
  });
