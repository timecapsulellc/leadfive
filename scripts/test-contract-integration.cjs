#!/usr/bin/env node

/**
 * Contract Integration Test Script
 * Tests the basic contract functions to ensure they're working
 */

const { ethers } = require('ethers');

// Contract configuration
const CONTRACT_ADDRESS = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// Minimal ABI for testing
const TEST_ABI = [
  "function totalUsers() view returns (uint32)",
  "function totalAdminFeesCollected() view returns (uint96)",
  "function getPoolBalances() view returns (uint96, uint96, uint96)",
  "function getTreasuryWallet() view returns (address)",
  "function rootUser() view returns (address)",
  "function getUserInfo(address) view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate, uint32 lastHelpPoolClaim, bool isEligibleForHelpPool, uint32 registrationTime, string referralCode, uint96 pendingRewards, uint32 lastWithdrawal, bool isActive))"
];

async function testContractIntegration() {
  try {
    console.log('🔍 Testing LeadFive Contract Integration...\n');
    
    // Connect to BSC mainnet
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, TEST_ABI, provider);
    
    console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`🌐 Network: BSC Mainnet\n`);
    
    // Test basic contract info
    console.log('📊 Testing Basic Contract Functions:');
    
    try {
      const totalUsers = await contract.totalUsers();
      console.log(`✅ Total Users: ${totalUsers.toString()}`);
    } catch (error) {
      console.log(`❌ Total Users: ${error.message}`);
    }
    
    try {
      const totalFees = await contract.totalAdminFeesCollected();
      const feesInUSDT = parseFloat(totalFees.toString()) / 1e18;
      console.log(`✅ Total Admin Fees: ${feesInUSDT.toFixed(2)} USDT`);
    } catch (error) {
      console.log(`❌ Total Admin Fees: ${error.message}`);
    }
    
    try {
      const treasuryWallet = await contract.getTreasuryWallet();
      console.log(`✅ Treasury Wallet: ${treasuryWallet}`);
    } catch (error) {
      console.log(`❌ Treasury Wallet: ${error.message}`);
    }
    
    try {
      const rootUser = await contract.rootUser();
      console.log(`✅ Root User: ${rootUser}`);
    } catch (error) {
      console.log(`❌ Root User: ${error.message}`);
    }
    
    try {
      const poolBalances = await contract.getPoolBalances();
      const leaderPool = parseFloat(poolBalances[0].toString()) / 1e18;
      const helpPool = parseFloat(poolBalances[1].toString()) / 1e18;
      const clubPool = parseFloat(poolBalances[2].toString()) / 1e18;
      console.log(`✅ Pool Balances:`);
      console.log(`   Leader Pool: ${leaderPool.toFixed(2)} USDT`);
      console.log(`   Help Pool: ${helpPool.toFixed(2)} USDT`);
      console.log(`   Club Pool: ${clubPool.toFixed(2)} USDT`);
    } catch (error) {
      console.log(`❌ Pool Balances: ${error.message}`);
    }
    
    // Test user info function with root user
    console.log('\n👤 Testing User Info Function:');
    try {
      const rootUser = await contract.rootUser();
      const userInfo = await contract.getUserInfo(rootUser);
      
      console.log(`✅ Root User Info:`);
      console.log(`   Is Registered: ${userInfo.isRegistered}`);
      console.log(`   Balance: ${(parseFloat(userInfo.balance.toString()) / 1e18).toFixed(2)} USDT`);
      console.log(`   Total Earnings: ${(parseFloat(userInfo.totalEarnings.toString()) / 1e18).toFixed(2)} USDT`);
      console.log(`   Team Size: ${userInfo.teamSize.toString()}`);
      console.log(`   Package Level: ${userInfo.packageLevel.toString()}`);
      console.log(`   Direct Referrals: ${userInfo.directReferrals.toString()}`);
      console.log(`   Referral Code: "${userInfo.referralCode}"`);
      console.log(`   Is Active: ${userInfo.isActive}`);
      
    } catch (error) {
      console.log(`❌ User Info: ${error.message}`);
    }
    
    console.log('\n✅ Contract integration test completed!');
    
    // Test connection health
    console.log('\n🏥 Network Health Check:');
    try {
      const latestBlock = await provider.getBlockNumber();
      const network = await provider.getNetwork();
      console.log(`✅ Latest Block: ${latestBlock}`);
      console.log(`✅ Chain ID: ${network.chainId}`);
      console.log(`✅ Network Name: ${network.name}`);
    } catch (error) {
      console.log(`❌ Network Health: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Contract integration test failed:', error);
  }
}

// Run the test
testContractIntegration().catch(console.error);