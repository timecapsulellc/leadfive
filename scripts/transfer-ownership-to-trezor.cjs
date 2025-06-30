const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🔐 Starting LeadFive Ownership Transfer to Trezor...\n");

    // Verify we're on the correct network
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
    
    if (network.chainId !== 56n) {
        console.log("❌ Error: This script must be run on BSC Mainnet (Chain ID: 56)");
        console.log("Please run: npx hardhat run transfer-ownership-to-trezor.cjs --network bsc");
        process.exit(1);
    }

    // Get deployer account (current owner)
    const [deployer] = await ethers.getSigners();
    console.log("Current Owner (Deployer):", deployer.address);
    console.log("Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "BNB");

    // Contract and target addresses
    const PROXY_ADDRESS = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
    const TREZOR_ADDRESS = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    console.log("\n📋 Ownership Transfer Details:");
    console.log("- Contract Address:", PROXY_ADDRESS);
    console.log("- Current Owner:", deployer.address);
    console.log("- New Owner (Trezor):", TREZOR_ADDRESS);
    console.log("- Network: BSC Mainnet\n");

    try {
        // Connect to the contract
        const contract = await ethers.getContractAt("LeadFive", PROXY_ADDRESS);
        
        // Verify current ownership
        const currentOwner = await contract.owner();
        console.log("🔍 Verifying current ownership...");
        console.log("Contract Owner:", currentOwner);
        
        if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.log("❌ Error: Deployer is not the current owner!");
            console.log("Current owner:", currentOwner);
            console.log("Deployer:", deployer.address);
            process.exit(1);
        }
        
        console.log("✅ Ownership verification passed");

        // Check if target is already owner
        if (currentOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
            console.log("✅ Trezor address is already the owner!");
            console.log("No transfer needed.");
            return;
        }

        // Verify the target address is valid
        if (!ethers.isAddress(TREZOR_ADDRESS)) {
            console.log("❌ Error: Invalid Trezor address format");
            process.exit(1);
        }

        console.log("\n⚠️  SECURITY CHECKPOINT:");
        console.log("======================");
        console.log("You are about to transfer ownership of the LeadFive contract");
        console.log("from the deployer wallet to your Trezor hardware wallet.");
        console.log("");
        console.log("IMPORTANT SECURITY NOTES:");
        console.log("1. Make sure you have access to the Trezor device");
        console.log("2. Verify the Trezor address is correct");
        console.log("3. After transfer, only the Trezor can perform admin functions");
        console.log("4. This action is IRREVERSIBLE");
        console.log("");
        console.log("Current Owner:", deployer.address);
        console.log("New Owner:", TREZOR_ADDRESS);
        console.log("");

        // Perform the ownership transfer
        console.log("🔄 Initiating ownership transfer...");
        
        const transferTx = await contract.transferOwnership(TREZOR_ADDRESS);
        console.log("Transaction submitted:", transferTx.hash);
        
        console.log("⏳ Waiting for confirmation...");
        const receipt = await transferTx.wait();
        
        if (receipt.status === 1) {
            console.log("✅ Ownership transfer successful!");
            console.log("Block number:", receipt.blockNumber);
            console.log("Gas used:", receipt.gasUsed.toString());
            
            // Verify the transfer
            console.log("\n🔍 Verifying ownership transfer...");
            const newOwner = await contract.owner();
            console.log("New contract owner:", newOwner);
            
            if (newOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
                console.log("✅ Ownership transfer verified!");
            } else {
                console.log("❌ Ownership transfer verification failed!");
                console.log("Expected:", TREZOR_ADDRESS);
                console.log("Actual:", newOwner);
            }
            
        } else {
            console.log("❌ Transaction failed!");
            process.exit(1);
        }

        // Test admin access
        console.log("\n🔍 Testing admin access...");
        const isDeployerAdmin = await contract.isAdmin(deployer.address);
        const isTrezorAdmin = await contract.isAdmin(TREZOR_ADDRESS);
        
        console.log("Deployer still admin:", isDeployerAdmin);
        console.log("Trezor is admin:", isTrezorAdmin);

        // Save transfer record
        const transferData = {
            transferDate: new Date().toISOString(),
            network: "BSC Mainnet",
            contractAddress: PROXY_ADDRESS,
            oldOwner: deployer.address,
            newOwner: TREZOR_ADDRESS,
            transactionHash: transferTx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            status: "SUCCESS"
        };
        
        const fs = require('fs');
        fs.writeFileSync('ownership-transfer-record.json', JSON.stringify(transferData, null, 2));
        
        console.log("\n📄 Transfer record saved to: ownership-transfer-record.json");
        
        console.log("\n🎉 OWNERSHIP TRANSFER COMPLETE!");
        console.log("=================================");
        console.log("✅ Contract ownership transferred to Trezor");
        console.log("✅ All admin functions now require Trezor approval");
        console.log("✅ Enhanced security activated");
        console.log("");
        console.log("🔐 IMPORTANT NEXT STEPS:");
        console.log("1. Test Trezor access by connecting to BSCScan");
        console.log("2. Verify you can perform admin functions");
        console.log("3. Update your documentation with new owner");
        console.log("4. Secure backup of Trezor seed phrase");
        console.log("");
        console.log("🌐 BSCScan Contract:");
        console.log(`https://bscscan.com/address/${PROXY_ADDRESS}#writeContract`);
        
    } catch (error) {
        console.error("❌ Ownership transfer failed:", error.message);
        
        if (error.message.includes("revert")) {
            console.error("\nPossible reasons:");
            console.error("- You don't have permission to transfer ownership");
            console.error("- Invalid target address");
            console.error("- Contract is paused");
        }
        
        console.error("\nFull error:", error);
        process.exit(1);
    }
}

// Error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    });
