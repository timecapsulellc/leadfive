// Basic Contract Connectivity Test
// This script tests basic connectivity to the OrphiCrowdFundV4UltraSecure contract

const { ethers } = require("hardhat");

async function main() {
    console.log("🔌 Testing Basic Contract Connectivity...\n");

    try {
        // Get accounts
        const [deployer, user1] = await ethers.getSigners();
        console.log(`Admin Account: ${deployer.address}`);
        console.log(`Test Account: ${user1.address}`);
        
        // Get provider status
        const provider = ethers.provider;
        const blockNumber = await provider.getBlockNumber();
        console.log(`Current Block Number: ${blockNumber}`);
        
        // Check contract exists at address
        const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const code = await provider.getCode(contractAddress);
        if (code !== '0x') {
            console.log(`✅ Contract exists at ${contractAddress}`);
            console.log(`Code Length: ${(code.length - 2) / 2} bytes`);
        } else {
            console.log(`❌ No contract found at ${contractAddress}`);
        }
        
        // Check USDT token exists
        const mockUSDTAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const tokenCode = await provider.getCode(mockUSDTAddress);
        if (tokenCode !== '0x') {
            console.log(`✅ MockUSDT exists at ${mockUSDTAddress}`);
        } else {
            console.log(`❌ No MockUSDT found at ${mockUSDTAddress}`);
        }
        
        console.log("\n✅ Basic connectivity test complete!");
        
    } catch (error) {
        console.error("❌ Error testing contract connectivity:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
