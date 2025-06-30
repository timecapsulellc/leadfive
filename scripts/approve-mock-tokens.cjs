// SPDX-License-Identifier: MIT
/**
 * @title Approve Mock Tokens for LeadFive Contract
 * @dev Script to approve mock USDT and WBNB for LeadFive contract testing
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🔓 Approving Mock Tokens for LeadFive Contract");
    console.log("===============================================");
    
    try {
        // Get deployer account
        const [deployer] = await ethers.getSigners();
        console.log(`Approving from account: ${deployer.address}`);
        
        // Contract addresses
        const mockUSDTAddress = process.env.MOCK_USDT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const mockWBNBAddress = process.env.MOCK_WBNB_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const leadFiveAddress = process.env.VITE_CONTRACT_ADDRESS || "0x1E95943b022dde7Ce7e0F54ced25599e0c6D8b9b";
        
        // Get contract instances
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        const mockUSDT = MockUSDT.attach(mockUSDTAddress);
        
        const MockWBNB = await ethers.getContractFactory("MockWBNB");
        const mockWBNB = MockWBNB.attach(mockWBNBAddress);
        
        // Approval amounts (very large for testing)
        const maxApproval = ethers.parseUnits("1000000000", 18); // 1 billion tokens
        
        console.log(`\n📋 APPROVAL DETAILS:`);
        console.log(`LeadFive Contract: ${leadFiveAddress}`);
        console.log(`Approval Amount: ${ethers.formatUnits(maxApproval, 18)} tokens\n`);
        
        // Approve USDT
        console.log("💰 Approving MockUSDT...");
        const usdtApproveTx = await mockUSDT.approve(leadFiveAddress, maxApproval);
        console.log(`Transaction hash: ${usdtApproveTx.hash}`);
        await usdtApproveTx.wait();
        
        // Verify USDT approval
        const usdtAllowance = await mockUSDT.allowance(deployer.address, leadFiveAddress);
        console.log(`✅ USDT approved: ${ethers.formatUnits(usdtAllowance, 18)} USDT\n`);
        
        // Approve WBNB
        console.log("🌐 Approving MockWBNB...");
        const wbnbApproveTx = await mockWBNB.approve(leadFiveAddress, maxApproval);
        console.log(`Transaction hash: ${wbnbApproveTx.hash}`);
        await wbnbApproveTx.wait();
        
        // Verify WBNB approval
        const wbnbAllowance = await mockWBNB.allowance(deployer.address, leadFiveAddress);
        console.log(`✅ WBNB approved: ${ethers.formatUnits(wbnbAllowance, 18)} WBNB\n`);
        
        // Test faucet functions
        console.log("🚰 Testing faucet functions...");
        
        try {
            console.log("Testing USDT faucet...");
            const usdtFaucetTx = await mockUSDT.faucet();
            await usdtFaucetTx.wait();
            console.log("✅ USDT faucet successful");
        } catch (error) {
            console.log(`ℹ️ USDT faucet: ${error.reason || error.message}`);
        }
        
        try {
            console.log("Testing WBNB faucet...");
            const wbnbFaucetTx = await mockWBNB.faucet();
            await wbnbFaucetTx.wait();
            console.log("✅ WBNB faucet successful");
        } catch (error) {
            console.log(`ℹ️ WBNB faucet: ${error.reason || error.message}`);
        }
        
        // Final balance check
        console.log("\n📊 FINAL BALANCES:");
        const usdtBalance = await mockUSDT.balanceOf(deployer.address);
        const wbnbBalance = await mockWBNB.balanceOf(deployer.address);
        console.log(`USDT Balance: ${ethers.formatUnits(usdtBalance, 18)} USDT`);
        console.log(`WBNB Balance: ${ethers.formatUnits(wbnbBalance, 18)} WBNB`);
        
        console.log("\n🎉 Token approvals completed successfully!");
        console.log("\n🔧 NEXT STEPS:");
        console.log("1. Test user registration with mock tokens");
        console.log("2. Run mass testing script");
        console.log("3. Test withdrawal functions");
        console.log("\n💡 TESTING COMMANDS:");
        console.log("# Test registration:");
        console.log("npx hardhat run scripts/test-registration.cjs --network bscTestnet");
        console.log("\n# Run mass testing:");
        console.log("npx hardhat run scripts/mass-testing-with-mocks.cjs --network bscTestnet");
        
    } catch (error) {
        console.error("❌ Error approving tokens:", error.message);
        console.error("Full error:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
