// scripts/deploy-mock-usdt.cjs
// Deploy MockUSDTTestnet contract for large-scale testing

const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying MockUSDTTestnet to BSC Testnet...");
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Get balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "BNB");
    
    if (balance < hre.ethers.parseEther("0.01")) {
        console.log("⚠️  Warning: Low BNB balance. Get testnet BNB from https://testnet.bnbchain.org/faucet-smart");
    }
    
    try {
        // Deploy MockUSDTTestnet
        console.log("\n📦 Deploying MockUSDTTestnet...");
        const MockUSDT = await hre.ethers.getContractFactory("MockUSDTTestnet");
        const mockUSDT = await MockUSDT.deploy();
        
        await mockUSDT.waitForDeployment();
        const mockUSDTAddress = await mockUSDT.getAddress();
        
        console.log("✅ MockUSDTTestnet deployed to:", mockUSDTAddress);
        
        // Verify deployment
        console.log("\n🔍 Verifying deployment...");
        const name = await mockUSDT.name();
        const symbol = await mockUSDT.symbol();
        const decimals = await mockUSDT.decimals();
        const totalSupply = await mockUSDT.totalSupply();
        const owner = await mockUSDT.owner();
        const deployerBalance = await mockUSDT.balanceOf(deployer.address);
        
        console.log("Contract name:", name);
        console.log("Contract symbol:", symbol);
        console.log("Decimals:", decimals);
        console.log("Total supply:", hre.ethers.formatUnits(totalSupply, decimals), symbol);
        console.log("Owner:", owner);
        console.log("Deployer balance:", hre.ethers.formatUnits(deployerBalance, decimals), symbol);
        
        // Test faucet functionality
        console.log("\n💧 Testing faucet functionality...");
        const faucetInfo = await mockUSDT.getFaucetInfo(deployer.address);
        console.log("Faucet amount:", hre.ethers.formatUnits(faucetInfo.claimAmount, decimals), symbol);
        console.log("Can claim from faucet:", faucetInfo.canClaim);
        
        // Verify contract on BSCScan
        if (hre.network.name === "bscTestnet") {
            console.log("\n📋 Verifying contract on BSCScan...");
            try {
                await hre.run("verify:verify", {
                    address: mockUSDTAddress,
                    constructorArguments: [],
                });
                console.log("✅ Contract verified on BSCScan");
            } catch (error) {
                console.log("⚠️  Verification failed (might be already verified):", error.message);
            }
        }
        
        // Summary
        console.log("\n" + "=".repeat(80));
        console.log("🎉 MOCK USDT DEPLOYMENT SUCCESSFUL!");
        console.log("=".repeat(80));
        console.log("Contract Address:", mockUSDTAddress);
        console.log("Network:", hre.network.name);
        console.log("Owner/Admin:", owner);
        console.log("Initial Supply:", hre.ethers.formatUnits(totalSupply, decimals), symbol);
        console.log("Deployer Balance:", hre.ethers.formatUnits(deployerBalance, decimals), symbol);
        console.log("BSCScan URL:", `https://testnet.bscscan.com/address/${mockUSDTAddress}`);
        console.log("=".repeat(80));
        
        // Save deployment info
        const fs = require('fs');
        const deploymentInfo = {
            network: hre.network.name,
            contractAddress: mockUSDTAddress,
            deployer: deployer.address,
            owner: owner,
            deploymentTime: new Date().toISOString(),
            txHash: mockUSDT.deploymentTransaction()?.hash,
            contractInfo: {
                name: name,
                symbol: symbol,
                decimals: Number(decimals),
                totalSupply: totalSupply.toString(),
                faucetAmount: faucetInfo.claimAmount.toString()
            }
        };
        
        fs.writeFileSync('./mock-usdt-deployment.json', JSON.stringify(deploymentInfo, null, 2));
        console.log("💾 Deployment info saved to mock-usdt-deployment.json");
        
        return {
            mockUSDTAddress,
            deploymentInfo
        };
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
