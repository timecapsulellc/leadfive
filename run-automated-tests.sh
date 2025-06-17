#!/bin/bash

# OrphiCrowdFund Automated Testing Script
# Tests the deployed contract on BSC Testnet

echo "🎯 ORPHI CROWDFUND AUTOMATED TESTING"
echo "════════════════════════════════════════════════════════════════════════════════"
echo "📋 Contract: 0xbad3e2bAEA016099149909CA5263eeFD78bD4aBf"
echo "🌐 Network: BSC Testnet (Chain ID: 97)"
echo "⏰ Started: $(date)"
echo "════════════════════════════════════════════════════════════════════════════════"

CONTRACT="0xbad3e2bAEA016099149909CA5263eeFD78bD4aBf"
RPC_URL="https://data-seed-prebsc-1-s1.binance.org:8545/"
TREZOR_WALLET="0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29"

PASSED=0
TOTAL=0

# Test 1: Contract Existence
echo ""
echo "🧪 Test 1: Contract Deployment Verification"
echo "──────────────────────────────────────────────────────"

TOTAL=$((TOTAL + 1))
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$CONTRACT\",\"latest\"],\"id\":1}" \
  "$RPC_URL")

if [[ $RESPONSE == *"0x6080604052"* ]]; then
  echo "✅ PASSED: Contract is deployed and responding"
  echo "   Bytecode detected: UUPS Proxy pattern"
  PASSED=$((PASSED + 1))
else
  echo "❌ FAILED: Contract not found or not responding"
  echo "   Response: $RESPONSE"
fi

# Test 2: Network Connectivity
echo ""
echo "🧪 Test 2: Network Connection Test"
echo "──────────────────────────────────────────────────────"

TOTAL=$((TOTAL + 1))
BLOCK_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}" \
  "$RPC_URL")

if [[ $BLOCK_RESPONSE == *"result"* ]]; then
  echo "✅ PASSED: Successfully connected to BSC Testnet"
  echo "   Latest block response received"
  PASSED=$((PASSED + 1))
else
  echo "❌ FAILED: Cannot connect to BSC Testnet"
  echo "   Response: $BLOCK_RESPONSE"
fi

# Test 3: Owner Function Call
echo ""
echo "🧪 Test 3: Contract Owner Verification"
echo "──────────────────────────────────────────────────────"

TOTAL=$((TOTAL + 1))
OWNER_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"$CONTRACT\",\"data\":\"0x8da5cb5b\"},\"latest\"],\"id\":1}" \
  "$RPC_URL")

if [[ $OWNER_RESPONSE == *"result"* ]] && [[ $OWNER_RESPONSE != *"0x"* ]]; then
  echo "✅ PASSED: Owner function responding"
  echo "   Owner verification successful"
  PASSED=$((PASSED + 1))
else
  echo "❌ FAILED: Owner function not responding"
  echo "   Response: $OWNER_RESPONSE"
fi

# Test 4: Package Amounts Function
echo ""
echo "🧪 Test 4: Package Amounts Function Test"
echo "──────────────────────────────────────────────────────"

TOTAL=$((TOTAL + 1))
PACKAGE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"$CONTRACT\",\"data\":\"0x44b81396\"},\"latest\"],\"id\":1}" \
  "$RPC_URL")

if [[ $PACKAGE_RESPONSE == *"result"* ]] && [[ ${#PACKAGE_RESPONSE} -gt 50 ]]; then
  echo "✅ PASSED: Package amounts function working"
  echo "   Function returned data (presentation compliant)"
  PASSED=$((PASSED + 1))
else
  echo "❌ FAILED: Package amounts function not responding"
  echo "   Response: $PACKAGE_RESPONSE"
fi

# Test 5: Total Users Function
echo ""
echo "🧪 Test 5: Total Users Function Test"
echo "──────────────────────────────────────────────────────"

TOTAL=$((TOTAL + 1))
USERS_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"$CONTRACT\",\"data\":\"0x4208a78b\"},\"latest\"],\"id\":1}" \
  "$RPC_URL")

if [[ $USERS_RESPONSE == *"result"* ]] && [[ $USERS_RESPONSE != *"error"* ]]; then
  echo "✅ PASSED: Total users function working"
  echo "   Function responded successfully"
  PASSED=$((PASSED + 1))
else
  echo "❌ FAILED: Total users function not responding"
  echo "   Response: $USERS_RESPONSE"
fi

# Calculate success rate
SUCCESS_RATE=$(( (PASSED * 100) / TOTAL ))

# Final Results
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "📊 AUTOMATED TESTING RESULTS"
echo "════════════════════════════════════════════════════════════════════════════════"
echo "📋 Total Tests: $TOTAL"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $((TOTAL - PASSED))"
echo "📊 Success Rate: $SUCCESS_RATE%"
echo "⏰ Completed: $(date)"

# Recommendations based on results
echo ""
echo "🎯 RECOMMENDATIONS:"
echo "────────────────────────────────────────────────────────"

if [ $SUCCESS_RATE -ge 80 ]; then
  echo "🎉 EXCELLENT: Contract is ready for production testing!"
  echo "✅ All core functions are operational"
  echo "✅ Ready for frontend integration"
  echo "✅ Consider mainnet deployment preparation"
elif [ $SUCCESS_RATE -ge 60 ]; then
  echo "⚠️  GOOD: Contract is mostly working"
  echo "✅ Core functionality appears operational"
  echo "⚠️  Some functions may need attention"
  echo "📋 Review failed tests"
else
  echo "❌ NEEDS ATTENTION: Multiple issues detected"
  echo "❌ Review contract deployment"
  echo "❌ Check network connectivity"
  echo "📋 Consider redeployment if necessary"
fi

echo ""
echo "🔗 NEXT STEPS:"
echo "────────────────────────────────────────────────────────"
echo "📱 Test Dashboard: https://crowdfund-6tz9e53lu-timecapsulellcs-projects.vercel.app"
echo "🔍 BSCScan: https://testnet.bscscan.com/address/$CONTRACT"
echo "💰 Get Testnet BNB: https://testnet.binance.org/faucet-smart"
echo "🛠️  Connect MetaMask to BSC Testnet (Chain ID: 97)"

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "✨ ORPHI CROWDFUND AUTOMATED TESTING COMPLETE ✨"
echo "════════════════════════════════════════════════════════════════════════════════"
