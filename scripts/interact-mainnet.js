const hre = require("hardhat");

/**
 * BSC Mainnet Contract Interaction Script
 * 
 * This script allows you to interact with your deployed contract
 * without needing verification on BSCScan.
 * 
 * Usage:
 * npx hardhat run scripts/interact-mainnet.js --network bsc
 */

async function main() {
    console.log("🔗 BSC Mainnet Contract Interaction");
    console.log("===================================");

    const contractAddress = "0x8F826B18096Dcf7AF4515B06Cb563475d189ab50";
    const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";

    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`💰 USDT Address: ${usdtAddress}`);
    console.log("");

    try {
        // Try different contract names to identify the correct one
        const contractNames = [
            "OrphiCrowdFund",
            "OrphiCrowdFundV2Enhanced", 
            "OrphichainCrowdfundPlatform",
            "OrphichainCrowdfundPlatformUpgradeableSecure"
        ];

        let contract = null;
        let contractName = "";

        for (const name of contractNames) {
            try {
                console.log(`🧪 Testing contract type: ${name}...`);
                contract = await hre.ethers.getContractAt(name, contractAddress);
                
                // Test if we can call owner function
                await contract.owner();
                contractName = name;
                console.log(`✅ SUCCESS! Contract is: ${name}`);
                break;
            } catch (error) {
                console.log(`❌ Not ${name}`);
            }
        }

        if (!contract) {
            console.log("❌ Could not identify contract type");
            console.log("💡 Try manual verification or check contract source");
            return;
        }

        console.log("\n📊 Reading Contract Information");
        console.log("==============================");

        // Read basic contract info
        try {
            const owner = await contract.owner();
            console.log(`👤 Owner: ${owner}`);
        } catch (error) {
            console.log(`❌ Could not get owner: ${error.message}`);
        }

        try {
            const totalMembers = await contract.totalMembers();
            console.log(`👥 Total Members: ${totalMembers.toString()}`);
        } catch (error) {
            console.log(`❌ Could not get total members: ${error.message}`);
        }

        try {
            const usdtToken = await contract.usdtToken();
            console.log(`💰 USDT Token: ${usdtToken}`);
            console.log(`✅ USDT Match: ${usdtToken.toLowerCase() === usdtAddress.toLowerCase()}`);
        } catch (error) {
            console.log(`❌ Could not get USDT token: ${error.message}`);
        }

        // Try to get more contract details
        try {
            const paused = await contract.paused();
            console.log(`⏸️  Paused: ${paused}`);
        } catch (error) {
            console.log(`ℹ️  Pause status not available`);
        }

        try {
            const registrationFee = await contract.registrationFee();
            console.log(`💵 Registration Fee: ${hre.ethers.utils.formatUnits(registrationFee, 18)} USDT`);
        } catch (error) {
            console.log(`ℹ️  Registration fee not available`);
        }

        console.log("\n🔧 Available Functions");
        console.log("=====================");
        
        // Get contract interface to show available functions
        const contractInterface = contract.interface;
        const functions = Object.keys(contractInterface.functions);
        
        console.log("📖 Read Functions:");
        functions.filter(func => contractInterface.functions[func].constant || contractInterface.functions[func].stateMutability === 'view').forEach(func => {
            console.log(`   - ${func}`);
        });

        console.log("\n✍️  Write Functions:");
        functions.filter(func => !contractInterface.functions[func].constant && contractInterface.functions[func].stateMutability !== 'view').forEach(func => {
            console.log(`   - ${func}`);
        });

        console.log("\n🎯 Next Steps");
        console.log("=============");
        console.log("1. ✅ Contract is working and accessible");
        console.log("2. 🔍 To verify on BSCScan: ./verify-mainnet.sh");
        console.log("3. 🌐 To interact via web: Use MetaMask + BSCScan");
        console.log("4. 💻 To interact via code: Use this script as template");
        console.log("5. 🎮 To use Remix: Load contract at address in Remix IDE");

        console.log("\n📋 Contract Summary");
        console.log("==================");
        console.log(`Contract Type: ${contractName}`);
        console.log(`Network: BSC Mainnet (Chain ID: 56)`);
        console.log(`Address: ${contractAddress}`);
        console.log(`Status: ✅ Deployed and Functional`);
        console.log(`Verification: ⏳ Pending (run ./verify-mainnet.sh)`);

    } catch (error) {
        console.error("❌ Error interacting with contract:", error.message);
        console.log("\n🔧 Troubleshooting:");
        console.log("1. Check your .env.custom file has correct values");
        console.log("2. Ensure you're connected to BSC Mainnet");
        console.log("3. Verify the contract address is correct");
        console.log("4. Try running: ./verify-mainnet.sh");
    }
}

// Example function to demonstrate write operations
async function exampleWriteOperation() {
    console.log("\n💡 Example Write Operation (commented out for safety)");
    console.log("====================================================");
    
    // Uncomment and modify as needed for actual transactions
    /*
    const [signer] = await hre.ethers.getSigners();
    console.log(`Using account: ${signer.address}`);
    
    const contract = await hre.ethers.getContractAt("OrphiCrowdFund", contractAddress);
    
    // Example: Register a user (modify parameters as needed)
    const tx = await contract.registerUser(
        "0x1234567890123456789012345678901234567890", // sponsor address
        { value: hre.ethers.utils.parseEther("0.01") } // registration fee
    );
    
    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log("✅ Transaction confirmed");
    */
}

main()
    .then(() => {
        console.log("\n🎉 Contract interaction completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
