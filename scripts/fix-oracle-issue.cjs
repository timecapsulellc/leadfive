const hre = require("hardhat");
const { ethers } = require("hardhat");

async function fixOracleIssue() {
    try {
        console.log('🔧 DIAGNOSING AND FIXING ORACLE ISSUE');
        console.log('='.repeat(45));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        console.log('🔮 ORACLE STATUS CHECK:');
        
        // Test oracle functions
        try {
            const bnbPrice = await contract.getCurrentBNBPrice();
            console.log(`  ✅ BNB Price: $${ethers.formatUnits(bnbPrice, 8)}`);
        } catch (e) {
            console.log(`  ❌ Oracle Error: ${e.message}`);
            console.log('  🔧 Oracle is causing the registration to fail!');
            
            // The oracle error is likely causing gas estimation to fail
            console.log('');
            console.log('💡 SOLUTION: BYPASS ORACLE BY USING USDT=true');
            console.log('');
            console.log('🎯 MODIFIED REGISTRATION APPROACH:');
            console.log('Instead of using BNB payment (which needs oracle), use USDT payment:');
            console.log('');
            console.log('OPTION 1: Use USDT Payment (Bypasses Oracle)');
            console.log('  sponsor: 0x0000000000000000000000000000000000000000');
            console.log('  packageLevel: 1');
            console.log('  useUSDT: true  ← CHANGE THIS TO TRUE');
            console.log('  value: 0 BNB   ← NO BNB NEEDED');
            console.log('');
            console.log('But wait... Trezor needs USDT tokens first!');
            
            // Check if Trezor has USDT
            console.log('');
            console.log('💰 CHECKING TREZOR USDT BALANCE:');
            
            const usdtAddress = await contract.usdt();
            console.log(`  USDT Contract: ${usdtAddress}`);
            
            // Create USDT contract interface
            const usdtABI = [
                "function balanceOf(address) view returns (uint256)",
                "function transfer(address,uint256) returns (bool)",
                "function approve(address,uint256) returns (bool)",
                "function allowance(address,address) view returns (uint256)"
            ];
            
            const usdtContract = new ethers.Contract(usdtAddress, usdtABI, ethers.provider);
            
            try {
                const usdtBalance = await usdtContract.balanceOf(trezorAddress);
                console.log(`  Trezor USDT Balance: ${ethers.formatUnits(usdtBalance, 6)} USDT`);
                
                if (usdtBalance >= ethers.parseUnits("30", 6)) {
                    console.log('  ✅ Sufficient USDT for registration!');
                    console.log('');
                    console.log('🔧 USDT REGISTRATION STEPS:');
                    console.log('1. First approve USDT spending:');
                    console.log(`   Contract: ${usdtAddress}`);
                    console.log('   Function: approve(address,uint256)');
                    console.log(`   Spender: ${contractAddress}`);
                    console.log('   Amount: 30000000 (30 USDT with 6 decimals)');
                    console.log('');
                    console.log('2. Then register with USDT:');
                    console.log('   sponsor: 0x0000000000000000000000000000000000000000');
                    console.log('   packageLevel: 1');
                    console.log('   useUSDT: true');
                    console.log('   value: 0');
                    
                } else {
                    console.log('  ❌ Insufficient USDT balance');
                    console.log('');
                    console.log('🔧 ALTERNATIVE SOLUTION: FIX ORACLE');
                    console.log('As contract owner, you can:');
                    console.log('1. Add a working oracle');
                    console.log('2. Or disable oracle requirement');
                    console.log('3. Or use a different price feed');
                }
                
            } catch (e) {
                console.log(`  ❌ Could not check USDT balance: ${e.message}`);
            }
            
            console.log('');
            console.log('🔧 ORACLE FIX OPTIONS (AS OWNER):');
            console.log('');
            console.log('OPTION A: Disable Oracle Dependency');
            console.log('  • Modify contract to allow BNB payments without oracle');
            console.log('  • This would require a contract upgrade');
            console.log('');
            console.log('OPTION B: Fix Oracle Configuration');
            console.log('  • Add a working BNB/USD price feed');
            console.log('  • Use a different oracle address');
            console.log('');
            console.log('OPTION C: Use USDT Payment (Immediate Fix)');
            console.log('  • Transfer 30 USDT to Trezor');
            console.log('  • Use useUSDT=true for registration');
            console.log('  • Bypasses oracle completely');
        }
        
        console.log('');
        console.log('🎯 RECOMMENDED IMMEDIATE ACTION:');
        console.log('The oracle error is preventing BSCScan from showing the payable field!');
        console.log('');
        console.log('QUICK FIX: Transfer 30 USDT to Trezor and use USDT payment');
        console.log('This completely bypasses the oracle issue.');
        
    } catch (error) {
        console.error('❌ Oracle diagnosis failed:', error.message);
    }
}

fixOracleIssue();
