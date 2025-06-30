const { ethers } = require("hardhat");
const { LEADFIVE_PROXY_ADDRESS, getContracts } = require("./contract-interaction-guide");

// EMERGENCY PROCEDURES FOR LEADFIVE CONTRACT

async function pauseContract() {
    console.log("🚨 EMERGENCY: Pausing LeadFive Contract...");
    const { leadFive } = await getContracts();
    
    try {
        const tx = await leadFive.emergencyPause();
        await tx.wait();
        console.log("✅ Contract PAUSED successfully");
        console.log("Transaction hash:", tx.hash);
        console.log("🔒 All user operations are now blocked");
    } catch (error) {
        console.error("❌ Failed to pause:", error.message);
        console.log("💡 Make sure you have admin permissions");
    }
}

async function unpauseContract() {
    console.log("🟢 Unpausing LeadFive Contract...");
    const { leadFive } = await getContracts();
    
    try {
        const tx = await leadFive.emergencyUnpause();
        await tx.wait();
        console.log("✅ Contract UNPAUSED successfully");
        console.log("Transaction hash:", tx.hash);
        console.log("🔓 All user operations are now enabled");
    } catch (error) {
        console.error("❌ Failed to unpause:", error.message);
        console.log("💡 Make sure you have admin permissions");
    }
}

async function setCircuitBreaker(thresholdInBNB) {
    console.log(`⚡ Setting circuit breaker threshold to ${thresholdInBNB} BNB...`);
    const { leadFive } = await getContracts();
    
    try {
        const threshold = ethers.parseEther(thresholdInBNB.toString());
        const tx = await leadFive.setCircuitBreaker(threshold);
        await tx.wait();
        console.log("✅ Circuit breaker threshold updated");
        console.log("Transaction hash:", tx.hash);
        console.log(`🔧 New threshold: ${thresholdInBNB} BNB`);
    } catch (error) {
        console.error("❌ Failed to set circuit breaker:", error.message);
        console.log("💡 Make sure you have admin permissions");
    }
}

async function addAdmin(adminAddress) {
    console.log(`👤 Adding admin: ${adminAddress}...`);
    const { leadFive } = await getContracts();
    
    try {
        const tx = await leadFive.addAdmin(adminAddress);
        await tx.wait();
        console.log("✅ Admin added successfully");
        console.log("Transaction hash:", tx.hash);
        console.log(`👑 ${adminAddress} now has admin privileges`);
    } catch (error) {
        console.error("❌ Failed to add admin:", error.message);
        console.log("💡 Make sure you are the contract owner");
    }
}

async function removeAdmin(adminAddress) {
    console.log(`👤 Removing admin: ${adminAddress}...`);
    const { leadFive } = await getContracts();
    
    try {
        const tx = await leadFive.removeAdmin(adminAddress);
        await tx.wait();
        console.log("✅ Admin removed successfully");
        console.log("Transaction hash:", tx.hash);
        console.log(`🚫 ${adminAddress} no longer has admin privileges`);
    } catch (error) {
        console.error("❌ Failed to remove admin:", error.message);
        console.log("💡 Make sure you are the contract owner");
    }
}

async function distributePool(poolType) {
    const poolNames = { 1: 'Leadership', 2: 'Community', 3: 'Club' };
    console.log(`🏊 Distributing ${poolNames[poolType]} Pool...`);
    
    const { leadFive } = await getContracts();
    
    try {
        // Check pool balance first
        const balance = await leadFive.getPoolBalance(poolType);
        console.log(`Current pool balance: ${ethers.formatUnits(balance, 6)} USDT`);
        
        if (balance === 0n) {
            console.log("⚠️ Pool is empty, nothing to distribute");
            return;
        }
        
        const tx = await leadFive.distributePool(poolType);
        await tx.wait();
        console.log("✅ Pool distribution successful");
        console.log("Transaction hash:", tx.hash);
        console.log(`💰 ${poolNames[poolType]} pool rewards distributed`);
    } catch (error) {
        console.error("❌ Failed to distribute pool:", error.message);
        console.log("💡 Make sure you have admin permissions and there are eligible users");
    }
}

async function emergencyWithdrawBNB() {
    console.log("🚨 EMERGENCY: Withdrawing all BNB from contract...");
    const { leadFive } = await getContracts();
    
    try {
        // Check contract BNB balance
        const contractBalance = await ethers.provider.getBalance(LEADFIVE_PROXY_ADDRESS);
        console.log(`Contract BNB balance: ${ethers.formatEther(contractBalance)} BNB`);
        
        if (contractBalance === 0n) {
            console.log("⚠️ Contract has no BNB to withdraw");
            return;
        }
        
        const tx = await leadFive.emergencyWithdraw();
        await tx.wait();
        console.log("✅ Emergency withdrawal successful");
        console.log("Transaction hash:", tx.hash);
        console.log("💰 All BNB transferred to owner");
    } catch (error) {
        console.error("❌ Failed to emergency withdraw:", error.message);
        console.log("💡 This only works if:");
        console.log("   - Circuit breaker is triggered");
        console.log("   - You are the contract owner");
    }
}

async function checkAdminStatus(address) {
    console.log(`🔍 Checking admin status for: ${address}`);
    const { leadFive } = await getContracts();
    
    try {
        const isAdmin = await leadFive.isAdmin(address);
        const owner = await leadFive.owner();
        
        console.log("📊 Admin Status:");
        console.log(`├─ Address: ${address}`);
        console.log(`├─ Is Admin: ${isAdmin}`);
        console.log(`├─ Is Owner: ${address.toLowerCase() === owner.toLowerCase()}`);
        console.log(`└─ Contract Owner: ${owner}`);
        
        return { isAdmin, isOwner: address.toLowerCase() === owner.toLowerCase(), owner };
    } catch (error) {
        console.error("❌ Failed to check admin status:", error.message);
        return null;
    }
}

async function getEmergencyInfo() {
    console.log("🚨 EMERGENCY PROCEDURES GUIDE");
    console.log("=" .repeat(50));
    
    const { leadFive, signer } = await getContracts();
    
    // Check current user permissions
    const signerAddress = signer.address;
    const adminStatus = await checkAdminStatus(signerAddress);
    
    if (!adminStatus) return;
    
    console.log("\n📋 Available Emergency Actions:");
    
    if (adminStatus.isAdmin || adminStatus.isOwner) {
        console.log("✅ pause           - Stop all contract operations");
        console.log("✅ unpause         - Resume contract operations");
        console.log("✅ circuit <amount> - Set circuit breaker threshold");
        console.log("✅ distribute <pool> - Distribute pool rewards (1=Leadership, 2=Community, 3=Club)");
    }
    
    if (adminStatus.isOwner) {
        console.log("✅ addAdmin <addr>   - Add new admin");
        console.log("✅ removeAdmin <addr> - Remove admin");
        console.log("✅ emergencyWithdraw - Withdraw all BNB (only if circuit breaker triggered)");
    }
    
    if (!adminStatus.isAdmin && !adminStatus.isOwner) {
        console.log("❌ No admin permissions - contact contract owner");
    }
    
    console.log("\n🔗 Contract Links:");
    console.log(`├─ Proxy: https://bscscan.com/address/${LEADFIVE_PROXY_ADDRESS}`);
    console.log(`└─ Implementation: https://bscscan.com/address/0xc58620dd8fD9d244453e421E700c2D3FCFB595b4#code`);
}

// Run specific emergency procedure
async function main() {
    const action = process.argv[2];
    const param = process.argv[3];
    
    try {
        switch(action) {
            case 'pause':
                await pauseContract();
                break;
            case 'unpause':
                await unpauseContract();
                break;
            case 'circuit':
                const threshold = param || '10';
                await setCircuitBreaker(threshold);
                break;
            case 'addAdmin':
                if (!param) {
                    console.error("Usage: node emergency-procedures.js addAdmin <address>");
                    break;
                }
                await addAdmin(param);
                break;
            case 'removeAdmin':
                if (!param) {
                    console.error("Usage: node emergency-procedures.js removeAdmin <address>");
                    break;
                }
                await removeAdmin(param);
                break;
            case 'distribute':
                const poolType = parseInt(param) || 1;
                await distributePool(poolType);
                break;
            case 'emergencyWithdraw':
                await emergencyWithdrawBNB();
                break;
            case 'admin':
                const address = param || (await getContracts()).signer.address;
                await checkAdminStatus(address);
                break;
            case 'info':
                await getEmergencyInfo();
                break;
            default:
                console.log("LEADFIVE EMERGENCY PROCEDURES");
                console.log("===========================");
                console.log("Available commands:");
                console.log("  pause                    - Pause contract operations");
                console.log("  unpause                  - Resume contract operations");
                console.log("  circuit <threshold>      - Set circuit breaker (BNB)");
                console.log("  addAdmin <address>       - Add admin (owner only)");
                console.log("  removeAdmin <address>    - Remove admin (owner only)");
                console.log("  distribute <pool>        - Distribute pool (1,2,3)");
                console.log("  emergencyWithdraw        - Withdraw BNB (emergency only)");
                console.log("  admin <address>          - Check admin status");
                console.log("  info                     - Show emergency guide");
                console.log("\nExample:");
                console.log("  npx hardhat run deployment-restoration/emergency-procedures.js --network bsc pause");
        }
    } catch (error) {
        console.error("❌ Emergency procedure failed:", error.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    pauseContract,
    unpauseContract,
    setCircuitBreaker,
    addAdmin,
    removeAdmin,
    distributePool,
    emergencyWithdrawBNB,
    checkAdminStatus,
    getEmergencyInfo
};
