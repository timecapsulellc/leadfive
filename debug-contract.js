// Debug Contract Deployment
const { ethers } = require("hardhat");

async function debugContract() {
    console.log("🔍 Debugging Contract Deployment...\n");

    try {
        const [deployer] = await ethers.getSigners();
        const provider = ethers.provider;
        
        console.log("🌐 Network Info:");
        console.log(`Account: ${deployer.address}`);
        console.log(`Balance: ${ethers.formatEther(await provider.getBalance(deployer.address))} ETH`);
        console.log(`Block Number: ${await provider.getBlockNumber()}`);
        console.log(`Chain ID: ${(await provider.getNetwork()).chainId}`);
        
        const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        console.log(`\n📄 Contract Info:`);
        console.log(`Address: ${contractAddress}`);
        
        // Check if there's code at the address
        const code = await provider.getCode(contractAddress);
        console.log(`Code length: ${code.length} bytes`);
        console.log(`Has code: ${code !== "0x"}`);
        
        if (code === "0x") {
            console.log("❌ No contract deployed at this address!");
            console.log("🔄 Let's deploy a fresh contract...");
            
            // Deploy fresh contract
            const MockUSDT = await ethers.getContractFactory("MockUSDT");
            const mockUSDT = await MockUSDT.deploy();
            await mockUSDT.waitForDeployment();
            console.log(`✅ MockUSDT deployed: ${await mockUSDT.getAddress()}`);
            
            const OrphiContract = await ethers.getContractFactory("OrphiCrowdFundV4UltraSecure");
            const orphiContract = await OrphiContract.deploy(
                await mockUSDT.getAddress(),
                deployer.address
            );
            await orphiContract.waitForDeployment();
            
            const newAddress = await orphiContract.getAddress();
            console.log(`✅ OrphiCrowdFundV4UltraSecure deployed: ${newAddress}`);
            
            // Test the fresh contract
            const globalStats = await orphiContract.getGlobalStats();
            console.log(`✅ Fresh contract test successful!`);
            console.log(`  Users: ${globalStats[0]}`);
            console.log(`  Volume: ${ethers.formatUnits(globalStats[1], 6)} USDT`);
            console.log(`  Automation: ${globalStats[2]}`);
            console.log(`  Locked: ${globalStats[3]}`);
            
            return { orphiContract, mockUSDT, newAddress };
        } else {
            console.log("✅ Contract exists but may not be responding correctly");
            return null;
        }
        
    } catch (error) {
        console.error("❌ Debug failed:", error.message);
    }
}

debugContract()
    .then((result) => {
        if (result) {
            console.log("\n🎉 Fresh deployment successful!");
            console.log(`📝 Update your dashboard with new address: ${result.newAddress}`);
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
