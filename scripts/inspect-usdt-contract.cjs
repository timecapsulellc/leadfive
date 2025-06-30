const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 INSPECTING USDT CONTRACT & GETTING TOKENS\n");
    console.log("=".repeat(60));

    const contractAddress = "0xD636Dfda3b062fA310d48a5283BE28fe608C6514";
    const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
    
    const [deployer] = await ethers.getSigners();
    
    console.log("📋 Setup:");
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   USDT: ${usdtAddress}`);
    console.log(`   Deployer: ${deployer.address}`);

    // Try different ways to interact with USDT contract
    console.log("\n🔍 USDT Contract Analysis:");
    console.log("-".repeat(40));

    try {
        // Try to get code at USDT address
        const code = await ethers.provider.getCode(usdtAddress);
        console.log(`   Contract Code Length: ${code.length} characters`);
        
        if (code === "0x") {
            console.log("   ❌ No contract deployed at USDT address");
            return;
        }

        // Try basic ERC20 interface
        const erc20Interface = new ethers.Interface([
            "function name() view returns (string)",
            "function symbol() view returns (string)", 
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)",
            "function transfer(address, uint256) returns (bool)",
            "function allowance(address, address) view returns (uint256)",
            "function approve(address, uint256) returns (bool)",
            "function transferFrom(address, address, uint256) returns (bool)",
            // Mock USDT specific functions
            "function mint(address, uint256) returns (bool)",
            "function faucet() returns (bool)",
            "function owner() view returns (address)"
        ]);

        const usdtContract = new ethers.Contract(usdtAddress, erc20Interface, deployer);

        try {
            const name = await usdtContract.name();
            const symbol = await usdtContract.symbol();
            const decimals = await usdtContract.decimals();
            const totalSupply = await usdtContract.totalSupply();
            
            console.log(`   Name: ${name}`);
            console.log(`   Symbol: ${symbol}`);
            console.log(`   Decimals: ${decimals}`);
            console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
        } catch (error) {
            console.log(`   ⚠️  Basic info error: ${error.message.split('\n')[0]}`);
        }

        // Check balances
        console.log("\n💰 Current Balances:");
        console.log("-".repeat(30));
        
        const deployerBalance = await usdtContract.balanceOf(deployer.address);
        console.log(`   Deployer: ${ethers.formatUnits(deployerBalance, 18)} USDT`);

        // Test users (from previous script)
        const testAddresses = [
            "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
            "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF", 
            "0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69"
        ];

        for (let i = 0; i < testAddresses.length; i++) {
            const balance = await usdtContract.balanceOf(testAddresses[i]);
            console.log(`   Test User ${i + 1}: ${ethers.formatUnits(balance, 18)} USDT`);
        }

        // Try to get more USDT
        console.log("\n🪙 Attempting to Get More USDT:");
        console.log("-".repeat(40));

        // Method 1: Check if there's a faucet function
        try {
            console.log("   Trying faucet function...");
            const faucetTx = await usdtContract.faucet();
            await faucetTx.wait();
            console.log("   ✅ Faucet successful!");
            
            const newBalance = await usdtContract.balanceOf(deployer.address);
            console.log(`   New balance: ${ethers.formatUnits(newBalance, 18)} USDT`);
        } catch (error) {
            console.log(`   ⚠️  Faucet failed: ${error.message.split('\n')[0]}`);
        }

        // Method 2: Check if we can mint
        try {
            console.log("   Trying mint function...");
            const mintAmount = ethers.parseUnits("5000", 18); // 5000 USDT
            const mintTx = await usdtContract.mint(deployer.address, mintAmount);
            await mintTx.wait();
            console.log("   ✅ Mint successful!");
            
            const newBalance = await usdtContract.balanceOf(deployer.address);
            console.log(`   New balance: ${ethers.formatUnits(newBalance, 18)} USDT`);
        } catch (error) {
            console.log(`   ⚠️  Mint failed: ${error.message.split('\n')[0]}`);
        }

        // Method 3: Check contract owner and try admin functions
        try {
            const owner = await usdtContract.owner();
            console.log(`   Contract owner: ${owner}`);
            
            if (owner === deployer.address) {
                console.log("   ✅ We are the owner! Trying to mint...");
                const mintAmount = ethers.parseUnits("10000", 18);
                const mintTx = await usdtContract.mint(deployer.address, mintAmount);
                await mintTx.wait();
                console.log("   ✅ Owner mint successful!");
            }
        } catch (error) {
            console.log(`   ⚠️  Owner check failed: ${error.message.split('\n')[0]}`);
        }

        // Check final balances
        console.log("\n📊 Final Balances:");
        console.log("-".repeat(25));
        
        const finalDeployerBalance = await usdtContract.balanceOf(deployer.address);
        console.log(`   Deployer: ${ethers.formatUnits(finalDeployerBalance, 18)} USDT`);

        // If we have USDT, distribute to test users
        if (finalDeployerBalance >= ethers.parseUnits("1000", 18)) {
            console.log("\n💸 Distributing USDT to Test Users:");
            console.log("-".repeat(40));
            
            for (let i = 0; i < testAddresses.length; i++) {
                try {
                    const transferAmount = ethers.parseUnits("500", 18); // 500 USDT each
                    const transferTx = await usdtContract.transfer(testAddresses[i], transferAmount);
                    await transferTx.wait();
                    console.log(`   ✅ Sent 500 USDT to Test User ${i + 1}`);
                } catch (error) {
                    console.log(`   ⚠️  Transfer to User ${i + 1} failed: ${error.message.split('\n')[0]}`);
                }
            }
            
            // Check final distribution
            console.log("\n📊 Post-Distribution Balances:");
            for (let i = 0; i < testAddresses.length; i++) {
                const balance = await usdtContract.balanceOf(testAddresses[i]);
                console.log(`   Test User ${i + 1}: ${ethers.formatUnits(balance, 18)} USDT`);
            }
        }

    } catch (error) {
        console.error("❌ USDT contract analysis failed:", error.message);
    }

    console.log("\n🎯 USDT Analysis Complete");
    console.log("=".repeat(50));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
