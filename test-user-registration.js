// Test User Registration Script
// This script tests the registration flow for the OrphiCrowdFundV4UltraSecure contract

const { ethers } = require("hardhat");
const contractArtifact = require("./artifacts-v4ultra/standalone-v4ultra/OrphiCrowdFundV4UltraSecure.sol/OrphiCrowdFundV4UltraSecure.json");

async function main() {
    console.log("🧪 Testing User Registration on OrphiCrowdFundV4UltraSecure Contract...\n");

    // Contract addresses from latest deployment
    const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    const mockUSDTAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
    
    // Get signers
    const [deployer, user1, user2, user3] = await ethers.getSigners();
    
    // Connect to contracts
    const contract = new ethers.Contract(contractAddress, contractArtifact.abi, deployer);
    const mockUSDT = await ethers.getContractAt("MockUSDT", mockUSDTAddress, deployer);
    
    console.log("📋 Test Environment:");
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`MockUSDT Address: ${mockUSDTAddress}`);
    console.log(`Admin: ${deployer.address}`);
    console.log(`Test User 1: ${user1.address}`);
    console.log(`Test User 2: ${user2.address}`);
    console.log(`Test User 3: ${user3.address}\n`);

    try {
        // Step 1: Check contract state before registration
        console.log("📊 Step 1: Checking initial contract state...");
        try {
            const globalStats = await contract.getGlobalStats();
            console.log(`Initial Users: ${globalStats[0]}`);
            console.log(`Initial Volume: ${ethers.formatUnits(globalStats[1], 6)} USDT`);
            console.log(`Automation Enabled: ${globalStats[2]}`);
            console.log(`System Locked: ${globalStats[3]}\n`);
        } catch (e) {
            console.log("Could not get global stats:", e.message);
        }

        // Step 2: Mint USDT tokens for test users
        console.log("💰 Step 2: Minting USDT tokens for test users...");
        const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDT
        
        await mockUSDT.mint(user1.address, mintAmount);
        await mockUSDT.mint(user2.address, mintAmount);
        await mockUSDT.mint(user3.address, mintAmount);
        
        console.log(`✅ Minted ${ethers.formatUnits(mintAmount, 6)} USDT to each test user`);
        
        // Check balances
        const user1Balance = await mockUSDT.balanceOf(user1.address);
        console.log(`User 1 USDT Balance: ${ethers.formatUnits(user1Balance, 6)} USDT\n`);

        // Step 3: Try to register users
        console.log("🔐 Step 3: Testing user registration...");
        
        // Look for registerUser function
        const abi = contractArtifact.abi;
        const registerFunctions = abi.filter(f => 
            f.type === 'function' && 
            (f.name.includes('register') || f.name.includes('Register'))
        );
        
        console.log("Registration-related functions:");
        registerFunctions.forEach(f => {
            console.log(`  - ${f.name}(${f.inputs.map(i => i.type).join(', ')})`);
        });
        
        // Try to register User 1 (this may fail if there are specific requirements)
        // First approve token transfer
        try {
            console.log("\nApproving USDT transfer for User 1...");
            const regFee = ethers.parseUnits("100", 6); // Assuming 100 USDT registration fee
            await mockUSDT.connect(user1).approve(contractAddress, regFee);
            console.log("✅ USDT transfer approved");
            
            // Try different registration functions
            console.log("\nAttempting registration for User 1...");
            
            // First check if the user needs to be verified/KYC'd
            if (registerFunctions.find(f => f.name === 'verifyUser')) {
                console.log("KYC verification required. Verifying User 1...");
                await contract.connect(deployer).verifyUser(user1.address, true);
                console.log("✅ User 1 verified");
            }
            
            // Try standard registration
            if (registerFunctions.find(f => f.name === 'registerUser')) {
                console.log("Calling registerUser for User 1...");
                await contract.connect(user1).registerUser(deployer.address); // Admin as referrer
                console.log("✅ User 1 registered successfully");
            } else if (registerFunctions.find(f => f.name === 'register')) {
                console.log("Calling register for User 1...");
                await contract.connect(user1).register(deployer.address); // Admin as referrer
                console.log("✅ User 1 registered successfully");
            } else {
                console.log("❌ No standard registration function found. Check contract documentation for specific registration flow.");
            }
            
        } catch (e) {
            console.log(`❌ Registration attempt failed: ${e.message}`);
            console.log("This may be due to specific requirements or security features in the contract.");
        }

        // Step 4: Check contract state after registration attempts
        console.log("\n📊 Step 4: Checking contract state after registration attempts...");
        try {
            const globalStats = await contract.getGlobalStats();
            console.log(`Current Users: ${globalStats[0]}`);
            console.log(`Current Volume: ${ethers.formatUnits(globalStats[1], 6)} USDT`);
            
            // Check User 1 info
            const user1Info = await contract.getUserInfo(user1.address);
            console.log("\nUser 1 Info:");
            console.log(`  ID: ${user1Info[0] || 0}`);
            console.log(`  Team Size: ${user1Info[1] || 0}`);
            console.log(`  Direct Count: ${user1Info[2] || 0}`);
            console.log(`  Package Tier: ${user1Info[3] || 0}`);
            console.log(`  Total Earnings: ${ethers.formatUnits(user1Info[5] || 0, 6)} USDT`);
            console.log(`  Withdrawable: ${ethers.formatUnits(user1Info[6] || 0, 6)} USDT`);
        } catch (e) {
            console.log("Could not get updated contract state:", e.message);
        }

        console.log("\n🎯 Test Completion Summary:");
        console.log("1. USDT tokens have been minted to test users");
        console.log("2. Registration functions have been identified");
        console.log("3. Registration attempts have been made");
        console.log("4. Current contract state has been checked");
        
        console.log("\n🚀 Next Steps for Dashboard Testing:");
        console.log("1. Open the dashboard at http://localhost:5179");
        console.log("2. Connect MetaMask with one of the test accounts");
        console.log("3. Verify if the dashboard can display user data correctly");
        console.log("4. If registration failed, implement proper registration UI in the dashboard");

    } catch (error) {
        console.error("❌ Error testing user registration:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
