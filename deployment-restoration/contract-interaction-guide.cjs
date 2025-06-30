const { ethers } = require("hardhat");

// MAINNET CONTRACT ADDRESSES
const LEADFIVE_PROXY_ADDRESS = "0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c";
const LEADFIVE_IMPLEMENTATION_ADDRESS = "0xc58620dd8fD9d244453e421E700c2D3FCFB595b4";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const ROOT_USER_ADDRESS = "0x140aad3E7c6bCC415Bc8E830699855fF072d405D";

// CONTRACT ABI (Essential functions)
const LEADFIVE_ABI = [
    // Registration
    "function register(address sponsor, uint8 packageLevel, bool useUSDT) payable",
    "function upgradePackage(uint8 newLevel, bool useUSDT) payable",
    
    // Withdrawals
    "function withdraw(uint96 amount)",
    "function calculateWithdrawalRate(address user) view returns (uint8)",
    
    // User Info
    "function getUserBasicInfo(address user) view returns (bool isRegistered, uint8 packageLevel, uint96 balance)",
    "function getUserEarnings(address user) view returns (uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals)",
    "function getUserNetwork(address user) view returns (address referrer, uint32 teamSize)",
    
    // System Info
    "function getTotalUsers() view returns (uint32)",
    "function getPackagePrice(uint8 packageLevel) view returns (uint96)",
    "function getPoolBalance(uint8 poolType) view returns (uint96)",
    "function owner() view returns (address)",
    "function isAdmin(address user) view returns (bool)",
    
    // Admin Functions
    "function addAdmin(address admin)",
    "function removeAdmin(address admin)",
    "function emergencyPause()",
    "function emergencyUnpause()",
    "function distributePool(uint8 poolType)",
    "function setCircuitBreaker(uint256 threshold)",
    
    // Events
    "event UserRegistered(address indexed user, address indexed sponsor, uint8 packageLevel, uint96 amount)",
    "event RewardDistributed(address indexed recipient, uint96 amount, uint8 rewardType)",
    "event UserWithdrawal(address indexed user, uint96 amount)"
];

// USDT ABI
const USDT_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function transfer(address to, uint256 amount) returns (bool)"
];

async function getContracts() {
    const [signer] = await ethers.getSigners();
    
    const leadFive = new ethers.Contract(LEADFIVE_PROXY_ADDRESS, LEADFIVE_ABI, signer);
    const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
    
    return { leadFive, usdt, signer };
}

// Example: Register a new user
async function registerUser(sponsorAddress, packageLevel = 1) {
    console.log(`🔄 Registering user with sponsor ${sponsorAddress}, package level ${packageLevel}`);
    
    const { leadFive, usdt, signer } = await getContracts();
    
    // Get package price (in 6 decimals as stored in contract)
    const packagePrice = await leadFive.getPackagePrice(packageLevel);
    console.log(`Package ${packageLevel} price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
    
    // Convert to 18 decimals for real USDT
    const usdtAmount = ethers.parseUnits(ethers.formatUnits(packagePrice, 6), 18);
    
    // Check USDT balance
    const balance = await usdt.balanceOf(signer.address);
    console.log(`Your USDT balance: ${ethers.formatUnits(balance, 18)} USDT`);
    
    if (balance < usdtAmount) {
        throw new Error(`Insufficient USDT balance. Need ${ethers.formatUnits(usdtAmount, 18)} USDT`);
    }
    
    // Check current allowance
    const currentAllowance = await usdt.allowance(signer.address, LEADFIVE_PROXY_ADDRESS);
    
    if (currentAllowance < usdtAmount) {
        console.log("📝 Approving USDT spending...");
        const approveTx = await usdt.approve(LEADFIVE_PROXY_ADDRESS, usdtAmount);
        await approveTx.wait();
        console.log("✅ USDT approved");
    }
    
    // Register with USDT
    console.log("📝 Registering user...");
    const registerTx = await leadFive.register(sponsorAddress, packageLevel, true);
    const receipt = await registerTx.wait();
    
    console.log("✅ Registration successful!");
    console.log(`Transaction hash: ${registerTx.hash}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    return registerTx.hash;
}

// Example: Check user info
async function checkUserInfo(userAddress) {
    console.log(`🔍 Checking info for user: ${userAddress}`);
    
    const { leadFive } = await getContracts();
    
    const [isRegistered, packageLevel, balance] = await leadFive.getUserBasicInfo(userAddress);
    
    if (!isRegistered) {
        console.log("❌ User is not registered");
        return;
    }
    
    const [totalEarnings, earningsCap, directReferrals] = await leadFive.getUserEarnings(userAddress);
    const [referrer, teamSize] = await leadFive.getUserNetwork(userAddress);
    
    console.log("📊 User Info:");
    console.log(`├─ Registered: ${isRegistered}`);
    console.log(`├─ Package Level: ${packageLevel}`);
    console.log(`├─ Balance: ${ethers.formatUnits(balance, 6)} USDT`);
    console.log(`├─ Total Earnings: ${ethers.formatUnits(totalEarnings, 6)} USDT`);
    console.log(`├─ Earnings Cap: ${ethers.formatUnits(earningsCap, 6)} USDT`);
    console.log(`├─ Direct Referrals: ${directReferrals}`);
    console.log(`├─ Team Size: ${teamSize}`);
    console.log(`└─ Referrer: ${referrer}`);
    
    return {
        isRegistered,
        packageLevel,
        balance: ethers.formatUnits(balance, 6),
        totalEarnings: ethers.formatUnits(totalEarnings, 6),
        directReferrals: directReferrals.toString(),
        teamSize: teamSize.toString(),
        referrer
    };
}

// Example: Withdraw earnings
async function withdrawEarnings(amount) {
    console.log(`💰 Withdrawing ${amount} USDT...`);
    
    const { leadFive, signer } = await getContracts();
    
    // Check user balance first
    const [, , balance] = await leadFive.getUserBasicInfo(signer.address);
    const balanceFormatted = ethers.formatUnits(balance, 6);
    
    console.log(`Current balance: ${balanceFormatted} USDT`);
    
    if (parseFloat(balanceFormatted) < amount) {
        throw new Error(`Insufficient balance. Have ${balanceFormatted} USDT, need ${amount} USDT`);
    }
    
    // Convert amount to 6 decimals (contract format)
    const amountInUnits = ethers.parseUnits(amount.toString(), 6);
    
    console.log("📝 Processing withdrawal...");
    const withdrawTx = await leadFive.withdraw(amountInUnits);
    const receipt = await withdrawTx.wait();
    
    console.log("✅ Withdrawal successful!");
    console.log(`Transaction hash: ${withdrawTx.hash}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    return withdrawTx.hash;
}

// Check system status
async function checkSystemStatus() {
    console.log("🔍 SYSTEM STATUS CHECK");
    console.log("=" .repeat(50));
    
    const { leadFive, usdt } = await getContracts();
    
    // Basic system info
    const totalUsers = await leadFive.getTotalUsers();
    const owner = await leadFive.owner();
    
    console.log(`📊 Total Users: ${totalUsers}`);
    console.log(`👤 Contract Owner: ${owner}`);
    
    // Package prices
    console.log("\n💰 Package Prices:");
    for (let i = 1; i <= 4; i++) {
        const price = await leadFive.getPackagePrice(i);
        console.log(`├─ Level ${i}: $${ethers.formatUnits(price, 6)} USDT`);
    }
    
    // Pool balances
    console.log("\n🏊 Pool Balances:");
    const poolNames = ['Leadership', 'Community', 'Club'];
    for (let i = 1; i <= 3; i++) {
        const balance = await leadFive.getPoolBalance(i);
        console.log(`├─ ${poolNames[i-1]} Pool: ${ethers.formatUnits(balance, 6)} USDT`);
    }
    
    // Contract balances
    console.log("\n💎 Contract Balances:");
    const contractBNB = await ethers.provider.getBalance(LEADFIVE_PROXY_ADDRESS);
    const contractUSDT = await usdt.balanceOf(LEADFIVE_PROXY_ADDRESS);
    console.log(`├─ BNB: ${ethers.formatEther(contractBNB)} BNB`);
    console.log(`└─ USDT: ${ethers.formatUnits(contractUSDT, 18)} USDT`);
    
    console.log("\n✅ System Status: OPERATIONAL");
}

// Get user referral link
async function getUserReferralInfo(userAddress) {
    console.log(`🔗 Referral info for: ${userAddress}`);
    
    const { leadFive } = await getContracts();
    
    const [isRegistered] = await leadFive.getUserBasicInfo(userAddress);
    
    if (!isRegistered) {
        console.log("❌ User must be registered to get referral info");
        return;
    }
    
    console.log("📋 Referral Information:");
    console.log(`├─ Sponsor Address: ${userAddress}`);
    console.log(`├─ Contract Address: ${LEADFIVE_PROXY_ADDRESS}`);
    console.log(`└─ Registration Function: register(address,uint8,bool)`);
    
    // Example registration code
    console.log("\n💻 Example Registration Code:");
    console.log(`await leadFive.register(`);
    console.log(`    "${userAddress}",  // sponsor`);
    console.log(`    1,                 // package level (1-4)`);
    console.log(`    true               // use USDT`);
    console.log(`);`);
}

module.exports = {
    LEADFIVE_PROXY_ADDRESS,
    LEADFIVE_IMPLEMENTATION_ADDRESS,
    USDT_ADDRESS,
    ROOT_USER_ADDRESS,
    getContracts,
    registerUser,
    checkUserInfo,
    withdrawEarnings,
    checkSystemStatus,
    getUserReferralInfo
};

// CLI interface
async function main() {
    const action = process.argv[2];
    const param1 = process.argv[3];
    const param2 = process.argv[4];
    
    try {
        switch(action) {
            case 'status':
                await checkSystemStatus();
                break;
            case 'user':
                if (!param1) {
                    console.error("Usage: node contract-interaction-guide.js user <address>");
                    break;
                }
                await checkUserInfo(param1);
                break;
            case 'register':
                if (!param1 || !param2) {
                    console.error("Usage: node contract-interaction-guide.js register <sponsor> <level>");
                    break;
                }
                await registerUser(param1, parseInt(param2));
                break;
            case 'withdraw':
                if (!param1) {
                    console.error("Usage: node contract-interaction-guide.js withdraw <amount>");
                    break;
                }
                await withdrawEarnings(parseFloat(param1));
                break;
            case 'referral':
                if (!param1) {
                    console.error("Usage: node contract-interaction-guide.js referral <address>");
                    break;
                }
                await getUserReferralInfo(param1);
                break;
            default:
                console.log("LEADFIVE CONTRACT INTERACTION GUIDE");
                console.log("================================");
                console.log("Available commands:");
                console.log("  status                          - Check system status");
                console.log("  user <address>                  - Check user info");
                console.log("  register <sponsor> <level>      - Register new user");
                console.log("  withdraw <amount>               - Withdraw earnings");
                console.log("  referral <address>              - Get referral info");
                console.log("\nExample:");
                console.log("  npx hardhat run deployment-restoration/contract-interaction-guide.js --network bsc status");
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

if (require.main === module) {
    main();
}
