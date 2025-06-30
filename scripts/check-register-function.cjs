const hre = require("hardhat");
const { ethers } = require("hardhat");

async function checkRegisterFunctionDetails() {
    try {
        console.log('🔍 CHECKING REGISTER FUNCTION DETAILS');
        console.log('='.repeat(40));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        
        // Load contract ABI
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        // Get the register function from the ABI
        const registerFunction = contract.interface.fragments.find(f => f.name === 'register');
        
        console.log('📋 REGISTER FUNCTION DETAILS:');
        console.log(`  Function Name: ${registerFunction.name}`);
        console.log(`  Function Type: ${registerFunction.type}`);
        console.log(`  Is Payable: ${registerFunction.payable ? '✅ YES' : '❌ NO'}`);
        console.log(`  State Mutability: ${registerFunction.stateMutability}`);
        
        console.log('');
        console.log('📝 FUNCTION SIGNATURE:');
        console.log(`  ${registerFunction.format()}`);
        
        console.log('');
        console.log('📋 PARAMETERS:');
        registerFunction.inputs.forEach((input, index) => {
            console.log(`  ${index + 1}. ${input.name} (${input.type})`);
        });
        
        console.log('');
        console.log('💰 PAYMENT INFORMATION:');
        if (registerFunction.payable || registerFunction.stateMutability === 'payable') {
            console.log('  ✅ Function IS payable - requires BNB payment');
            console.log('  💡 You should see a "Value" or "payableAmount" field');
            console.log('  📊 Required payment: 0.05 BNB');
        } else {
            console.log('  ❌ Function is NOT payable - no payment field needed');
        }
        
        // Create encoded function data for manual transaction
        console.log('');
        console.log('🔧 MANUAL TRANSACTION DATA:');
        const iface = new ethers.Interface([
            "function register(address sponsor, uint8 packageLevel, bool useUSDT) payable"
        ]);
        
        const callData = iface.encodeFunctionData("register", [
            "0x0000000000000000000000000000000000000000", // sponsor
            1, // packageLevel
            false // useUSDT
        ]);
        
        console.log(`  To: ${contractAddress}`);
        console.log(`  Value: 0.05 BNB`);
        console.log(`  Data: ${callData}`);
        
        console.log('');
        console.log('🎯 BSCSCAN TROUBLESHOOTING:');
        console.log('If you cannot find the payment field:');
        console.log('');
        console.log('1. 📜 SCROLL DOWN - Payment field is usually at the bottom');
        console.log('2. 🔄 REFRESH PAGE - Sometimes BSCScan has display issues');
        console.log('3. 🌐 TRY DIFFERENT BROWSER - Chrome/Firefox might display differently');
        console.log('4. 📱 CHECK MOBILE VIEW - Sometimes mobile shows different fields');
        console.log('');
        console.log('5. 🔍 LOOK FOR THESE FIELD NAMES:');
        console.log('   • "Value (BNB)"');
        console.log('   • "payableAmount"');
        console.log('   • "Amount to send"');
        console.log('   • "msg.value"');
        console.log('');
        
        console.log('🚨 ALTERNATIVE METHODS:');
        console.log('');
        console.log('METHOD 1: Use MetaMask directly');
        console.log('  • Copy the transaction data above');
        console.log('  • Send transaction directly via MetaMask');
        console.log('  • To: Contract address');
        console.log('  • Value: 0.05 BNB');
        console.log('  • Data: Function call data');
        console.log('');
        console.log('METHOD 2: Use different block explorer');
        console.log('  • Try BscScan alternatives');
        console.log('  • Use wallet connect interface');
        console.log('');
        console.log('METHOD 3: Frontend interface');
        console.log('  • Use our provided frontend');
        console.log('  • npm run dev');
        console.log('  • Connect Trezor and register');
        
    } catch (error) {
        console.error('❌ Function check failed:', error.message);
    }
}

checkRegisterFunctionDetails();
