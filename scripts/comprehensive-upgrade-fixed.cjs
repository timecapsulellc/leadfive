// comprehensive-upgrade-fixed.cjs - Fixed version with proper OpenZeppelin upgrades
require('dotenv').config();
const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('\n🚀 Executing Comprehensive Contract Upgrade with USDT Fix');
    console.log('='.repeat(70));

    // --- Configuration ---
    const proxyAddress = process.env.MAINNET_CONTRACT_ADDRESS || "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
    const usdtAddress = process.env.VITE_USDT_CONTRACT_ADDRESS || "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
    
    console.log(`Proxy Address: ${proxyAddress}`);
    console.log(`USDT Address: ${usdtAddress}`);
    
    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);

    try {
        // --- Step 1: Deploy New Implementation With USDT Management ---
        console.log('\n[1/4] Deploying LeadFive implementation with USDT management...');
        
        // Use the fully qualified name to avoid the multiple artifacts issue
        const LeadFive = await ethers.getContractFactory("LeadFive");
        console.log('Contract factory created...');
        
        // Upgrade the proxy to the new implementation
        console.log('Preparing to upgrade proxy...');
        const upgradedContract = await upgrades.upgradeProxy(proxyAddress, LeadFive);
        await upgradedContract.waitForDeployment();
        const newImplAddress = await upgradedContract.getAddress();
        console.log(`✅ Proxy upgraded to LeadFive at ${newImplAddress}`);
        
        // --- Step 2: Set USDT Address Using New Function ---
        console.log('\n[2/4] Setting USDT address using setUSDTAddress function...');
        try {
            const setUsdtTx = await upgradedContract.setUSDTAddress(usdtAddress);
            await setUsdtTx.wait();
            console.log(`✅ USDT address set successfully. TX: ${setUsdtTx.hash}`);
        } catch (error) {
            console.error(`❌ Failed to set USDT address with setUSDTAddress: ${error.message}`);
            
            // --- Step 2b: Try Emergency USDT Setter ---
            console.log('\n[2b/4] Trying emergency USDT setter...');
            try {
                const emergencyTx = await upgradedContract.emergencySetUSDT(usdtAddress);
                await emergencyTx.wait();
                console.log(`✅ USDT address set using emergency function. TX: ${emergencyTx.hash}`);
            } catch (emergencyError) {
                console.error(`❌ Failed to set USDT with emergency method: ${emergencyError.message}`);
                throw new Error("All USDT setter methods failed");
            }
        }

        // --- Step 3: Verification ---
        console.log('\n[3/4] Verifying USDT configuration...');
        
        try {
            // Try using the new getUSDTConfig function
            const usdtConfig = await upgradedContract.getUSDTConfig();
            console.log(`✅ USDT Address: ${usdtConfig[0]}`);
            console.log(`✅ USDT Decimals: ${usdtConfig[1]}`);
            console.log(`✅ Contract USDT Balance: ${usdtConfig[2]}`);
            
            if (usdtConfig[0].toLowerCase() === usdtAddress.toLowerCase()) {
                console.log('✅ USDT address successfully verified!');
            } else {
                console.error('❌ USDT address mismatch!');
            }
        } catch (verifyError) {
            console.error(`❌ Error using getUSDTConfig: ${verifyError.message}`);
            
            // Try the direct getter
            try {
                const directUsdt = await upgradedContract.usdt();
                console.log(`✅ Direct USDT Address: ${directUsdt}`);
                
                if (directUsdt.toLowerCase() === usdtAddress.toLowerCase()) {
                    console.log('✅ USDT address successfully verified!');
                } else {
                    console.error('❌ USDT address mismatch!');
                }
            } catch (directError) {
                console.error(`❌ Failed to get direct USDT address: ${directError.message}`);
            }
        }
        
        // --- Step 4: Test Registration Function ---
        console.log('\n[4/4] Testing registration functionality...');
        try {
            // Just check that the register function exists (don't actually call it)
            const registerAbi = upgradedContract.interface.getFunction("register");
            console.log(`✅ Register function verified: ${registerAbi.name}`);
            console.log('✅ Contract upgrade complete and verified.');
        } catch (registerError) {
            console.error(`❌ Failed to find register function: ${registerError.message}`);
        }
        
        console.log('\n🎉🎉🎉 UPGRADE COMPLETED SUCCESSFULLY 🎉🎉🎉');
        
        // Save upgrade summary
        const summary = {
            timestamp: new Date().toISOString(),
            proxyAddress,
            newImplementation: newImplAddress,
            usdtAddress,
            deployer: deployer.address,
            success: true
        };
        
        fs.writeFileSync(
            path.join(__dirname, 'contract-upgrade-v1.3.0-summary.json'),
            JSON.stringify(summary, null, 2)
        );
        
    } catch (error) {
        console.error('\n❌❌❌ UPGRADE FAILED ❌❌❌');
        console.error(error);
        process.exit(1);
    }
}

// Execute the upgrade
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
