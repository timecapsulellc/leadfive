const hre = require("hardhat");
const { ethers } = require("hardhat");

async function prepareForTrezorRegistration() {
    try {
        console.log('🔧 PREPARING FOR TREZOR REGISTRATION');
        console.log('='.repeat(40));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        const [deployer] = await ethers.getSigners();
        
        // Load contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        // Check current balances
        const deployerBalance = await deployer.provider.getBalance(deployer.address);
        const trezorBalance = await deployer.provider.getBalance(trezorAddress);
        
        console.log('💰 CURRENT BALANCES:');
        console.log(`  Deployer: ${ethers.formatEther(deployerBalance)} BNB`);
        console.log(`  Trezor: ${ethers.formatEther(trezorBalance)} BNB`);
        
        // Check package price
        const packagePrice = await contract.getPackagePrice(1);
        console.log(`  Package 1 Price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
        
        // Send BNB to Trezor for registration
        const bnbToSend = ethers.parseEther("0.08"); // Send enough for registration + gas
        
        if (trezorBalance < ethers.parseEther("0.05")) {
            console.log('');
            console.log('💸 SENDING BNB TO TREZOR FOR REGISTRATION...');
            
            const sendTx = await deployer.sendTransaction({
                to: trezorAddress,
                value: bnbToSend
            });
            
            console.log(`  Transaction Hash: ${sendTx.hash}`);
            await sendTx.wait();
            
            const newTrezorBalance = await deployer.provider.getBalance(trezorAddress);
            console.log(`  ✅ Sent ${ethers.formatEther(bnbToSend)} BNB to Trezor`);
            console.log(`  New Trezor Balance: ${ethers.formatEther(newTrezorBalance)} BNB`);
        } else {
            console.log('  ✅ Trezor already has sufficient BNB');
        }
        
        console.log('');
        console.log('🎯 NEXT STEPS FOR TREZOR REGISTRATION:');
        console.log('');
        console.log('METHOD 1: Using Hardhat Console (Simulated)');
        console.log('='.repeat(45));
        console.log('1. Connect to Trezor wallet in MetaMask');
        console.log('2. Switch to BSC Mainnet');
        console.log('3. Use the following contract call:');
        console.log('');
        console.log('Contract Address:', contractAddress);
        console.log('Function: register(address,uint8,bool)');
        console.log('Parameters:');
        console.log('  sponsor: 0x0000000000000000000000000000000000000000');
        console.log('  packageLevel: 1');
        console.log('  useUSDT: false');
        console.log('  value: 0.05 BNB');
        
        console.log('');
        console.log('METHOD 2: Using Web3 Interface');
        console.log('='.repeat(32));
        console.log('// JavaScript code for frontend:');
        console.log('const contract = new ethers.Contract(');
        console.log(`  "${contractAddress}",`);
        console.log('  ABI,');
        console.log('  trezorSigner');
        console.log(');');
        console.log('');
        console.log('const tx = await contract.register(');
        console.log('  "0x0000000000000000000000000000000000000000", // No sponsor (root)');
        console.log('  1, // Package level');
        console.log('  false, // Use BNB');
        console.log('  { value: ethers.parseEther("0.05") }');
        console.log(');');
        
        console.log('');
        console.log('METHOD 3: Direct Transaction');
        console.log('='.repeat(28));
        console.log('To:', contractAddress);
        console.log('Value: 0.05 BNB');
        console.log('Data: register function signature with parameters');
        
        // Create the function call data
        const iface = new ethers.Interface([
            "function register(address sponsor, uint8 packageLevel, bool useUSDT)"
        ]);
        
        const callData = iface.encodeFunctionData("register", [
            ethers.ZeroAddress, // sponsor
            1, // packageLevel
            false // useUSDT
        ]);
        
        console.log('Transaction Data:', callData);
        
        console.log('');
        console.log('🔍 VERIFICATION STEPS:');
        console.log('After registration, verify with:');
        console.log('');
        console.log('const userInfo = await contract.getUserBasicInfo(trezorAddress);');
        console.log('console.log("Registered:", userInfo[0]);');
        console.log('console.log("Package Level:", userInfo[1]);');
        console.log('console.log("Balance:", ethers.formatUnits(userInfo[2], 6), "USDT");');
        
        console.log('');
        console.log('🚨 IMPORTANT NOTES:');
        console.log('- Registration MUST be called by the Trezor address itself');
        console.log('- Cannot be done by proxy or admin for security reasons');
        console.log('- Ensure Trezor has sufficient BNB for gas + registration fee');
        console.log('- Use BSC Mainnet (Chain ID: 56)');
        
        console.log('');
        console.log('🔗 USEFUL LINKS:');
        console.log(`  Contract: https://bscscan.com/address/${contractAddress}`);
        console.log(`  Trezor: https://bscscan.com/address/${trezorAddress}`);
        console.log('  BSC Explorer: https://bscscan.com');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    }
}

prepareForTrezorRegistration();
