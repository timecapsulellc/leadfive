require('dotenv').config();
const { ethers } = require('hardhat');

async function checkContractStatusDetailed() {
    try {
        console.log('🔍 CHECKING CONTRACT STATUS - DETAILED ANALYSIS');
        console.log('='.repeat(60));
        
        // Contract addresses from your message
        const proxyAddress = "0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c";
        const implementationAddress = "0xc58620dd8fD9d244453e421E700c2D3FCFB595b4";
        const ownerAddress = "0x140aad3E7c6bCC415Bc8E830699855fF072d405D";
        
        console.log(`Proxy Address: ${proxyAddress}`);
        console.log(`Implementation: ${implementationAddress}`);
        console.log(`Expected Owner: ${ownerAddress}`);
        
        // Set up BSC mainnet connection
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        
        // Check if contracts exist
        console.log('\n📋 CONTRACT EXISTENCE CHECK:');
        const proxyCode = await provider.getCode(proxyAddress);
        const implCode = await provider.getCode(implementationAddress);
        
        console.log(`Proxy has code: ${proxyCode !== '0x'} (${proxyCode.length} chars)`);
        console.log(`Implementation has code: ${implCode !== '0x'} (${implCode.length} chars)`);
        
        if (proxyCode === '0x') {
            console.log('❌ PROXY CONTRACT NOT FOUND');
            return;
        }
        
        if (implCode === '0x') {
            console.log('❌ IMPLEMENTATION CONTRACT NOT FOUND');
            return;
        }
        
        // Try to connect to the contract
        console.log('\n🔗 CONNECTING TO CONTRACT:');
        try {
            const LeadFive = await ethers.getContractFactory("LeadFive");
            const contract = LeadFive.attach(proxyAddress).connect(provider);
            
            console.log('✅ Contract connection successful');
            
            // Test basic functions
            console.log('\n📊 BASIC CONTRACT INFO:');
            
            try {
                const owner = await contract.owner();
                console.log(`Owner: ${owner}`);
                console.log(`Owner matches expected: ${owner.toLowerCase() === ownerAddress.toLowerCase()}`);
            } catch (error) {
                console.log(`❌ owner() failed: ${error.message}`);
            }
            
            try {
                const version = await contract.getVersion();
                console.log(`Version: ${version}`);
            } catch (error) {
                console.log(`❌ getVersion() failed: ${error.message}`);
            }
            
            try {
                const totalUsers = await contract.getTotalUsers();
                console.log(`Total Users: ${totalUsers}`);
            } catch (error) {
                console.log(`❌ getTotalUsers() failed: ${error.message}`);
            }
            
            try {
                const usdt = await contract.usdt();
                console.log(`USDT Address: ${usdt}`);
                console.log(`USDT Initialized: ${usdt !== '0x0000000000000000000000000000000000000000'}`);
            } catch (error) {
                console.log(`❌ usdt() failed: ${error.message}`);
            }
            
            try {
                const decimals = await contract.getUSDTDecimals();
                console.log(`USDT Decimals: ${decimals}`);
            } catch (error) {
                console.log(`❌ getUSDTDecimals() failed: ${error.message}`);
            }
            
            // Check register function
            console.log('\n🔧 REGISTER FUNCTION ANALYSIS:');
            try {
                const registerFunction = contract.interface.getFunction("register");
                console.log(`Register Parameters: ${registerFunction.inputs.length}`);
                registerFunction.inputs.forEach((input, index) => {
                    console.log(`  ${index + 1}. ${input.name} (${input.type})`);
                });
                
                // Determine if it's BNB+USDT or USDT-only
                if (registerFunction.inputs.length === 2) {
                    console.log('📌 Contract Type: USDT-ONLY (2 parameters)');
                } else if (registerFunction.inputs.length === 3) {
                    console.log('📌 Contract Type: BNB+USDT (3 parameters)');
                } else {
                    console.log('📌 Contract Type: UNKNOWN');
                }
            } catch (error) {
                console.log(`❌ register() analysis failed: ${error.message}`);
            }
            
            // Check package prices
            console.log('\n💰 PACKAGE PRICES:');
            for (let i = 1; i <= 4; i++) {
                try {
                    const price = await contract.getPackagePrice(i);
                    console.log(`Package ${i}: ${ethers.formatEther(price)} USDT`);
                } catch (error) {
                    console.log(`Package ${i}: Error - ${error.message}`);
                }
            }
            
            // Check admin status
            console.log('\n👑 ADMIN STATUS:');
            try {
                const isAdmin = await contract.isAdmin(ownerAddress);
                console.log(`Owner is Admin: ${isAdmin}`);
            } catch (error) {
                console.log(`❌ isAdmin() failed: ${error.message}`);
            }
            
            // Check if contract supports BNB payments
            console.log('\n💳 PAYMENT METHODS CHECK:');
            try {
                // Check if contract has BNB-related functions
                const functionNames = contract.interface.fragments
                    .filter(f => f.type === 'function')
                    .map(f => f.name);
                
                const hasBNBFunctions = functionNames.some(name => 
                    name.toLowerCase().includes('bnb') || 
                    name.toLowerCase().includes('price') ||
                    name.toLowerCase().includes('oracle')
                );
                
                console.log(`Total Functions: ${functionNames.length}`);
                console.log(`Has BNB-related functions: ${hasBNBFunctions}`);
                
                // Check for oracle/price functions
                if (functionNames.includes('getCurrentBNBPrice')) {
                    console.log('✅ BNB price function found');
                    try {
                        const bnbPrice = await contract.getCurrentBNBPrice();
                        console.log(`Current BNB Price: $${bnbPrice}`);
                    } catch (error) {
                        console.log(`BNB price error: ${error.message}`);
                    }
                } else {
                    console.log('❌ No BNB price function found');
                }
                
            } catch (error) {
                console.log(`Payment methods check failed: ${error.message}`);
            }
            
        } catch (contractError) {
            console.log(`❌ Contract connection failed: ${contractError.message}`);
        }
        
        // BSCScan verification check
        console.log('\n🔍 BSCSCAN VERIFICATION STATUS:');
        console.log(`Proxy verification: https://bscscan.com/address/${proxyAddress}#code`);
        console.log(`Implementation verification: https://bscscan.com/address/${implementationAddress}#code`);
        
        console.log('\n📝 VERIFICATION COMMANDS:');
        console.log(`npx hardhat verify --network bsc ${implementationAddress}`);
        console.log(`npx hardhat verify --network bsc ${proxyAddress}`);
        
        console.log('\n🎯 RECOMMENDATIONS:');
        console.log('1. Check if proxy is verified on BSCScan');
        console.log('2. Verify implementation contract if not done');
        console.log('3. Test register function with both BNB and USDT if supported');
        console.log('4. Update .env with correct contract address');
        
        // Update .env file
        console.log('\n📝 UPDATING .ENV FILE:');
        const envPath = '.env';
        let envContent = require('fs').readFileSync(envPath, 'utf8');
        
        // Update contract addresses
        envContent = envContent.replace(
            /VITE_CONTRACT_ADDRESS=.*/,
            `VITE_CONTRACT_ADDRESS=${proxyAddress}`
        );
        envContent = envContent.replace(
            /MAINNET_CONTRACT_ADDRESS=.*/,
            `MAINNET_CONTRACT_ADDRESS=${proxyAddress}`
        );
        
        require('fs').writeFileSync(envPath, envContent);
        console.log('✅ .env file updated with current contract address');
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
    }
}

checkContractStatusDetailed()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
