#!/usr/bin/env node

/**
 * CHECK PROXY ADMIN AND UPGRADE CAPABILITY
 * Determines who can upgrade the proxy and what method to use
 */

const { ethers } = require('hardhat');
require('dotenv').config();

async function checkProxyAdmin() {
    console.log('🔍 CHECKING PROXY UPGRADE CAPABILITY');
    console.log('====================================');
    console.log();

    try {
        // Connect to BSC Mainnet
        const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
        
        const PROXY_ADDRESS = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
        const TREZOR_ADDRESS = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        console.log(`📍 Proxy Address: ${PROXY_ADDRESS}`);
        console.log(`👑 Expected Owner: ${TREZOR_ADDRESS}`);
        console.log();

        // Check if it's a UUPS proxy (has upgradeTo function)
        console.log('🔍 Checking proxy type...');
        
        // Try to call owner() function
        try {
            const ownerCalldata = "0x8da5cb5b"; // owner() selector
            const ownerResult = await provider.call({
                to: PROXY_ADDRESS,
                data: ownerCalldata
            });
            
            if (ownerResult !== "0x") {
                const owner = ethers.getAddress("0x" + ownerResult.slice(-40));
                console.log(`👑 Current owner: ${owner}`);
                
                if (owner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
                    console.log('✅ Trezor is the owner - can upgrade directly');
                } else {
                    console.log('❌ Trezor is not the owner');
                }
            }
        } catch (error) {
            console.log('⚠️ Could not read owner:', error.message);
        }

        // Check if it supports upgradeTo (UUPS pattern)
        console.log('🔍 Checking UUPS support...');
        try {
            const upgradeToSelector = "0x3659cfe6"; // upgradeTo(address) selector
            const dummyImpl = "0x0000000000000000000000000000000000000001";
            
            // This will fail but tells us if the function exists
            await provider.call({
                to: PROXY_ADDRESS,
                data: upgradeToSelector + dummyImpl.slice(2).padStart(64, '0'),
                from: TREZOR_ADDRESS
            });
            
        } catch (error) {
            if (error.message.includes('execution reverted')) {
                console.log('✅ Proxy supports upgradeTo function (UUPS)');
                console.log('📋 Upgrade method: Call upgradeTo() from owner');
            } else if (error.message.includes('function selector not found')) {
                console.log('❌ Proxy does not support upgradeTo (not UUPS)');
                console.log('📋 May need ProxyAdmin pattern');
            } else {
                console.log('⚠️ Could not determine proxy type:', error.message);
            }
        }

        // Check EIP-1967 implementation slot
        console.log('🔍 Checking implementation slot...');
        const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        try {
            const implSlot = await provider.getStorage(PROXY_ADDRESS, IMPLEMENTATION_SLOT);
            if (implSlot !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
                const currentImpl = "0x" + implSlot.slice(-40);
                console.log(`📋 Current implementation: ${currentImpl}`);
                
                // Check if current implementation has code
                const implCode = await provider.getCode(currentImpl);
                console.log(`📊 Implementation code length: ${implCode.length} bytes`);
                
                if (implCode === '0x') {
                    console.log('❌ Current implementation has no code!');
                } else {
                    console.log('✅ Current implementation has code');
                }
            } else {
                console.log('⚠️ Implementation slot is empty');
            }
        } catch (error) {
            console.log('⚠️ Could not read implementation slot:', error.message);
        }

        // Check admin slot (for ProxyAdmin pattern)
        console.log('🔍 Checking admin slot...');
        const ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
        try {
            const adminSlot = await provider.getStorage(PROXY_ADDRESS, ADMIN_SLOT);
            if (adminSlot !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
                const proxyAdmin = "0x" + adminSlot.slice(-40);
                console.log(`📋 Proxy admin: ${proxyAdmin}`);
                
                if (proxyAdmin === "0x0000000000000000000000000000000000000000") {
                    console.log('✅ No separate proxy admin - UUPS pattern');
                } else {
                    console.log('⚠️ Has proxy admin - ProxyAdmin pattern');
                    console.log('📋 Upgrade method: Call upgrade() on ProxyAdmin contract');
                }
            }
        } catch (error) {
            console.log('⚠️ Could not read admin slot:', error.message);
        }

        console.log();
        console.log('📋 RECOMMENDATIONS:');
        console.log('1. Use Trezor wallet to call upgradeTo() on the proxy');
        console.log('2. New implementation should NOT be initialized');
        console.log('3. Only the proxy retains state and initialization');
        console.log('4. Implementation is just a logic template');
        console.log();

        return {
            proxyAddress: PROXY_ADDRESS,
            expectedOwner: TREZOR_ADDRESS
        };

    } catch (error) {
        console.error('❌ Proxy check failed:', error.message);
        throw error;
    }
}

if (require.main === module) {
    checkProxyAdmin()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { checkProxyAdmin };
