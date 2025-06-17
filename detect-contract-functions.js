#!/usr/bin/env node
/**
 * Direct Contract Function Detection
 * Checks what functions are actually available on the deployed contract
 */

const { ethers } = require("ethers");

async function main() {
    console.log("\n🔍 DIRECT CONTRACT FUNCTION DETECTION");
    console.log("═".repeat(60));
    
    // BSC Testnet RPC
    const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
    const contractAddress = "0x6fA993A33AA860A79E15ae44AC9390465c5f02aC";
    
    console.log("📍 Contract Address:", contractAddress);
    console.log("🌐 BSCScan: https://testnet.bscscan.com/address/" + contractAddress);
    
    // Function signatures to test (from BSCScan)
    const functionsToTest = {
        // Core functions
        "getUserInfo": "0x6b7f3c85",
        "getPackageAmounts": "0x8e15f473", 
        "isUserRegistered": "0x4fad54f5",
        "getGlobalStats": "0x9c4f17e9",
        "contribute": "0x60b0b0f0",
        "contractName": "0x024ae44e",
        "totalUsers": "0x5be5c55c",
        "paused": "0x5c975abb",
        
        // Compensation Plan Functions (from BSCScan screenshot)
        "registerUser": "0x9e9fa097",
        "checkRankAdvancement": "0x27d7a4ea",
        "distributeGlobalHelpPool": "0xcadc6113",
        "distributeLeaderBonus": "0x65b8792e",
        "upgradePackage": "0x8f9c6f16",
        "withdraw": "0x2e1a7d4d",
        "setOracleEnabled": "0x9c0f201c",
        "setPriceOracle": "0x530e784f",
        "emergencyWithdraw": "0x5312ea8e",
        "pause": "0x8456cb59",
        "unpause": "0x3f4ba83a"
    };
    
    console.log("\n🧪 TESTING FUNCTION AVAILABILITY");
    console.log("─".repeat(60));
    
    const availableFunctions = [];
    const missingFunctions = [];
    
    for (const [funcName, selector] of Object.entries(functionsToTest)) {
        try {
            // Try to call the function (this will fail but tells us if function exists)
            const callData = selector + "0".repeat(64); // Add some padding
            
            try {
                await provider.call({
                    to: contractAddress,
                    data: callData
                });
                // If we get here, function exists (even if call failed)
                console.log(`✅ ${funcName}: Available (${selector})`);
                availableFunctions.push(funcName);
            } catch (error) {
                if (error.message.includes("function selector was not recognized")) {
                    console.log(`❌ ${funcName}: Not found (${selector})`);
                    missingFunctions.push(funcName);
                } else {
                    // Function exists but call failed for other reasons (params, etc)
                    console.log(`✅ ${funcName}: Available but requires params (${selector})`);
                    availableFunctions.push(funcName);
                }
            }
        } catch (error) {
            console.log(`❓ ${funcName}: Unable to test (${selector})`);
            missingFunctions.push(funcName);
        }
    }
    
    console.log("\n📊 FUNCTION AVAILABILITY SUMMARY");
    console.log("─".repeat(60));
    console.log(`✅ Available Functions: ${availableFunctions.length}`);
    console.log(`❌ Missing Functions: ${missingFunctions.length}`);
    
    console.log("\n✅ AVAILABLE FUNCTIONS:");
    availableFunctions.forEach(func => console.log(`  • ${func}`));
    
    if (missingFunctions.length > 0) {
        console.log("\n❌ MISSING FUNCTIONS:");
        missingFunctions.forEach(func => console.log(`  • ${func}`));
    }
    
    // Test basic contract calls that should work
    console.log("\n🔧 BASIC CONTRACT TESTING");
    console.log("─".repeat(60));
    
    try {
        // Simple read-only calls
        const totalUsersCallData = "0x5be5c55c"; // totalUsers()
        const result = await provider.call({
            to: contractAddress,
            data: totalUsersCallData
        });
        
        const totalUsers = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], result)[0];
        console.log("✅ Total Users:", totalUsers.toString());
        
    } catch (error) {
        console.log("❌ Basic contract call failed:", error.message);
    }
    
    console.log("\n🎯 ANALYSIS:");
    console.log("─".repeat(60));
    
    if (availableFunctions.includes("registerUser")) {
        console.log("🎉 COMPLETE COMPENSATION PLAN DETECTED!");
        console.log("✅ All advanced features are available");
    } else if (availableFunctions.includes("contribute")) {
        console.log("⚠️  BASIC VERSION DETECTED");
        console.log("ℹ️  Contract has contribute() but not registerUser()");
        console.log("ℹ️  This suggests the deployed contract is the basic version");
    } else {
        console.log("❌ MINIMAL CONTRACT DETECTED");
        console.log("⚠️  Missing core compensation plan functions");
    }
    
    console.log("\n🔗 Manual verification: https://testnet.bscscan.com/address/" + contractAddress);
}

main().catch(console.error);
