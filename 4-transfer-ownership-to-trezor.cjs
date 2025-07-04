const { ethers } = require("hardhat");

/**
 * LEADFIVE OWNERSHIP TRANSFER TO TREZOR
 * Transfer contract ownership to Trezor hardware wallet for maximum security
 */

async function main() {
  console.log("🔐 Starting LeadFive Contract Ownership Transfer to Trezor...");
  console.log("=".repeat(60));

  // Trezor wallet address (provided by user)
  const TREZOR_ADDRESS = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
  
  // Contract addresses (will be loaded from deployment files)
  let contractAddress;
  
  try {
    // Try to load the latest deployment
    const deploymentFiles = [
      './BSC_MAINNET_IMPLEMENTATION_1751057678176.json',
      './BSC_MAINNET_IMPLEMENTATION_1751056669960.json',
      './BSC_MAINNET_COMPLETE_DEPLOYMENT_PREP_1751056490902.json'
    ];
    
    let deploymentData = null;
    for (const file of deploymentFiles) {
      try {
        const fs = require('fs');
        if (fs.existsSync(file)) {
          deploymentData = JSON.parse(fs.readFileSync(file, 'utf8'));
          console.log(`📄 Loaded deployment data from: ${file}`);
          break;
        }
      } catch (error) {
        console.log(`⚠️  Could not load ${file}: ${error.message}`);
      }
    }
    
    if (!deploymentData || (!deploymentData.contractAddress && !deploymentData.proxyAddress)) {
      throw new Error("No valid deployment data found. Please deploy the contract first.");
    }
    
    // Use proxy address if available, otherwise use contract address
    contractAddress = deploymentData.proxyAddress || deploymentData.contractAddress;
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🔐 Trezor Address: ${TREZOR_ADDRESS}`);
    
  } catch (error) {
    console.error("❌ Error loading deployment data:", error.message);
    return;
  }

  try {
    // Get the contract ABI
    const LeadFive = await ethers.getContractFactory("LeadFive");
    
    // Connect to the deployed contract
    const contract = LeadFive.attach(contractAddress);
    
    // Get current signer (deployer)
    const [deployer] = await ethers.getSigners();
    const provider = deployer.provider;
    console.log(`👤 Current deployer: ${deployer.address}`);
    
    // Check current owner
    const currentOwner = await contract.owner();
    console.log(`🏠 Current contract owner: ${currentOwner}`);
    
    if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log("⚠️  Warning: Deployer is not the current owner!");
      console.log(`Current owner: ${currentOwner}`);
      console.log(`Deployer: ${deployer.address}`);
    }
    
    // Validate Trezor address
    if (!ethers.isAddress(TREZOR_ADDRESS)) {
      throw new Error("Invalid Trezor address provided");
    }
    
    // Check if Trezor address is already the owner
    if (currentOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
      console.log("✅ Trezor is already the contract owner!");
      return;
    }
    
    console.log("\n🔄 Preparing ownership transfer...");
    
    // Simple gas estimation without complex provider calls
    console.log(`⚠️  Using default gas settings for BSC network`);
    
    // Check deployer balance
    const deployerBalance = await deployer.provider.getBalance(deployer.address);
    console.log(`💎 Deployer balance: ${ethers.formatEther(deployerBalance)} BNB`);
    
    // Use reasonable gas settings for BSC
    const gasLimit = 100000; // Standard for ownership transfer
    const gasPrice = ethers.parseUnits("5", "gwei"); // 5 Gwei for BSC
    
    console.log("\n⚠️  CRITICAL SECURITY NOTICE:");
    console.log("   This will transfer FULL CONTROL of the LeadFive contract");
    console.log("   to your Trezor hardware wallet.");
    console.log("   After this transfer:");
    console.log("   ✓ Only the Trezor can modify contract settings");
    console.log("   ✓ Only the Trezor can upgrade the contract");
    console.log("   ✓ Only the Trezor can pause/unpause operations");
    console.log("   ✓ This action CANNOT be reversed by the deployer");
    
    console.log("\n🚀 Executing ownership transfer...");
    
    // Execute the ownership transfer
    const tx = await contract.transferOwnership(TREZOR_ADDRESS, {
      gasPrice: gasPrice,
      gasLimit: gasLimit,
    });
    
    console.log(`📤 Transaction sent: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ OWNERSHIP TRANSFER SUCCESSFUL!");
      console.log(`🧾 Transaction hash: ${tx.hash}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      const totalCost = BigInt(receipt.gasUsed) * BigInt(gasPrice);
      console.log(`💰 Total cost: ${ethers.formatEther(totalCost)} BNB`);
      
      // Verify the transfer
      const newOwner = await contract.owner();
      console.log(`🔐 New contract owner: ${newOwner}`);
      
      if (newOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
        console.log("✅ Ownership verification PASSED!");
        
        // Save transfer record
        const transferRecord = {
          timestamp: new Date().toISOString(),
          contractAddress: contractAddress,
          previousOwner: currentOwner,
          newOwner: TREZOR_ADDRESS,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          gasCost: ethers.formatEther(BigInt(receipt.gasUsed) * BigInt(gasPrice)),
          network: "BSC Mainnet"
        };
        
        require('fs').writeFileSync(
          `ownership-transfer-${Date.now()}.json`,
          JSON.stringify(transferRecord, null, 2)
        );
        
        console.log("\n🎉 OWNERSHIP TRANSFER COMPLETE!");
        console.log("📄 Transfer record saved to ownership-transfer-*.json");
        console.log("\n🔒 SECURITY STATUS:");
        console.log("   ✅ Contract is now controlled by Trezor hardware wallet");
        console.log("   ✅ Maximum security achieved");
        console.log("   ✅ Protection against private key exposure");
        console.log("   ✅ Multi-signature capability (if configured)");
        
        console.log("\n📋 NEXT STEPS:");
        console.log("   1. Verify Trezor can connect to the contract");
        console.log("   2. Test contract functions using Trezor");
        console.log("   3. Update frontend to use new owner address");
        console.log("   4. Proceed with production deployment");
        
      } else {
        console.log("❌ Ownership verification FAILED!");
        console.log(`Expected: ${TREZOR_ADDRESS}`);
        console.log(`Actual: ${newOwner}`);
      }
      
    } else {
      console.log("❌ Transaction failed!");
      console.log(`Status: ${receipt.status}`);
    }
    
  } catch (error) {
    console.error("❌ Error during ownership transfer:", error);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("💡 Solution: Add more BNB to the deployer wallet for gas fees");
    } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      console.log("💡 Solution: Contract may be paused or have restrictions");
    } else if (error.message.includes('Ownable: caller is not the owner')) {
      console.log("💡 Solution: Current account is not the contract owner");
    }
    
    console.log("\n🔧 Troubleshooting:");
    console.log("   - Ensure deployer wallet has sufficient BNB");
    console.log("   - Verify contract is not paused");
    console.log("   - Check deployer is current owner");
    console.log("   - Validate Trezor address format");
  }
}

// Enhanced error handling
main()
  .then(() => {
    console.log("\n🎯 Ownership transfer script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
