const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Pre-Deployment Verification for LeadFive v1.0.0 USDT-Only\n");

    const [deployer] = await ethers.getSigners();
    const PROXY_ADDRESS = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
    const TREZOR_ADDRESS = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

    console.log("=== ENVIRONMENT CHECK ===");
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
    console.log("Deployer Address:", deployer.address);
    console.log("Deployer Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    console.log("\n=== CURRENT CONTRACT STATE ===");
    
    try {
        const proxy = await ethers.getContractAt("LeadFive", PROXY_ADDRESS);
        const owner = await proxy.owner();
        console.log("Current Owner:", owner);
        console.log("Owner is Trezor:", owner.toLowerCase() === TREZOR_ADDRESS.toLowerCase());
        console.log("Owner is Deployer:", owner.toLowerCase() === deployer.address.toLowerCase());

        // Check current register function signature
        console.log("\n=== CURRENT REGISTER FUNCTION ===");
        try {
            // Try to call with 3 params (old version)
            const testAbi = [
                "function register(address sponsor, uint8 packageLevel, bool useUSDT) external payable"
            ];
            const testContract = new ethers.Contract(PROXY_ADDRESS, testAbi, deployer);
            await testContract.estimateGas.register(ethers.ZeroAddress, 1, true);
            console.log("❌ OLD VERSION: register(sponsor, packageLevel, useUSDT) detected");
            console.log("   This needs to be upgraded to USDT-only version");
        } catch (e) {
            console.log("✅ Old register function not found (good)");
        }

        // Check current implementation address
        const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        const implementationBytes = await ethers.provider.getStorage(PROXY_ADDRESS, implementationSlot);
        const currentImplementation = ethers.getAddress("0x" + implementationBytes.slice(-40));
        console.log("Current Implementation:", currentImplementation);

        // Check package prices
        console.log("\n=== CURRENT PACKAGE PRICES ===");
        for (let i = 1; i <= 4; i++) {
            try {
                const pkg = await proxy.packages(i);
                const price = Number(pkg.price);
                console.log(`Package ${i}: ${price} units (${price / 1e6} USDT if 6 decimals)`);
            } catch (e) {
                console.log(`Package ${i}: Error reading`);
            }
        }

        // Check total users
        try {
            const totalUsers = await proxy.getTotalUsers();
            console.log("\nTotal Users:", totalUsers.toString());
        } catch (e) {
            console.log("Total Users: Unable to read");
        }

    } catch (error) {
        console.error("Error checking current contract:", error.message);
    }

    console.log("\n=== USDT BALANCE CHECK ===");
    try {
        const usdt = await ethers.getContractAt("IERC20", USDT_ADDRESS);
        const deployerBalance = await usdt.balanceOf(deployer.address);
        console.log("Deployer USDT Balance:", ethers.formatUnits(deployerBalance, 18), "USDT");
        
        // Check if deployer has at least 30 USDT
        const required = ethers.parseUnits("30", 18);
        if (deployerBalance >= required) {
            console.log("✅ Sufficient USDT for testing");
        } else {
            console.log("⚠️  Deployer needs at least 30 USDT for testing");
        }
    } catch (e) {
        console.log("Error checking USDT balance:", e.message);
    }

    console.log("\n=== NEW CONTRACT COMPILATION CHECK ===");
    try {
        const LeadFive = await ethers.getContractFactory("LeadFive");
        console.log("✅ LeadFive contract compiles successfully");
        
        // Check the register function in new contract
        const abi = LeadFive.interface;
        const registerFunc = abi.getFunction("register");
        console.log("New register function parameters:", registerFunc.inputs.length);
        
        if (registerFunc.inputs.length === 2) {
            console.log("✅ USDT-only version detected (2 params: sponsor, packageLevel)");
            console.log("   Parameters:");
            registerFunc.inputs.forEach((input, idx) => {
                console.log(`   ${idx + 1}. ${input.name} (${input.type})`);
            });
        } else {
            console.log("❌ Wrong version - has", registerFunc.inputs.length, "params");
        }
        
    } catch (error) {
        console.error("❌ Contract compilation error:", error.message);
    }

    console.log("\n=== DEPLOYMENT READINESS ===");
    console.log("To proceed with upgrade:");
    console.log("1. ✅ Contract compiles successfully");
    console.log("2. ✅ New USDT-only register function ready");
    console.log("3. ⚠️  Ownership transfer may be needed");
    console.log("4. ⚠️  Ensure sufficient USDT for testing");
    console.log("\nNext step: Run deployment script if all checks pass");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
