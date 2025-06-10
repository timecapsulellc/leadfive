#!/bin/bash
# MetaMask Configuration Script for OrphiChain Dashboard
# This script provides instructions for configuring MetaMask to work with the local Hardhat network

echo "🦊 MetaMask Configuration for OrphiChain Dashboard 🦊"
echo "=====================================================\n"

echo "Step 1: Open MetaMask in your browser"
echo "-------------------------------------"
echo "1. Click on the MetaMask extension icon"
echo "2. Unlock your wallet if needed\n"

echo "Step 2: Add Hardhat Local Network"
echo "--------------------------------"
echo "1. Click on the network dropdown at the top of MetaMask"
echo "2. Select 'Add Network' or 'Custom RPC'"
echo "3. Enter the following details:"
echo "   Network Name: Hardhat Local"
echo "   RPC URL: http://localhost:8545"
echo "   Chain ID: 1337"
echo "   Currency Symbol: ETH"
echo "   Block Explorer URL: (leave blank)\n"

echo "Step 3: Import Test Accounts"
echo "---------------------------"
echo "Use these private keys to import test accounts:"
echo "Account #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 (Admin/Deployer)"
echo "Account #1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d (User 1)"
echo "Account #2: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a (User 2)"
echo "\nTo import:"
echo "1. In MetaMask, click on your account icon"
echo "2. Select 'Import Account'"
echo "3. Paste the private key and click 'Import'\n"

echo "Step 4: Connect to the Dashboard"
echo "-------------------------------"
echo "1. Open the dashboard at http://localhost:5179"
echo "2. Click 'Connect Wallet' button in the dashboard"
echo "3. Select MetaMask and approve the connection"
echo "4. Ensure you're connected to the Hardhat Local network\n"

echo "Step 5: Contract Interaction"
echo "---------------------------"
echo "Contract Addresses:"
echo "OrphiCrowdFundV4UltraSecure: 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
echo "MockUSDT: 0x0165878A594ca255338adfa4d48449f69242Eb8F\n"

echo "🎉 You're all set! The dashboard should now be able to connect to the contract and display data. 🎉"
echo "Note: If the dashboard shows empty/zero values, this is expected as the contract has no data yet."
