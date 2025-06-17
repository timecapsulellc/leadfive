const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🎯 Register as OrphiCrowdFund Admin");
    console.log("===================================");

    // Get network
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

    // Get signer (the person registering)
    const [signer] = await ethers.getSigners();
    console.log(`👤 Registering Address: ${signer.address}`);
    
    const balance = await signer.provider.getBalance(signer.address);
    console.log(`💰 Current Balance: ${ethers.formatEther(balance)} BNB`);

    // Contract address
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xf9538Fe9FCF16C018E6057744555F2556f63cED9";
    console.log(`📄 Contract Address: ${CONTRACT_ADDRESS}`);

    // Admin contact info (you can modify this)
    const CONTACT_INFO = process.env.ADMIN_CONTACT || "admin@orphicrowdfund.com";

    try {
        // Connect to the V2 contract
        const OrphiCrowdFundV2 = await ethers.getContractFactory("OrphiCrowdFundV2");
        const contract = OrphiCrowdFundV2.attach(CONTRACT_ADDRESS);

        console.log("\n🔍 Checking Registration Eligibility...");
        console.log("=======================================");

        // Check if already an admin
        const isAlreadyAdmin = await contract.isAdmin(signer.address);
        if (isAlreadyAdmin) {
            console.log("✅ You are already registered as an admin!");
            
            // Show admin stats
            const adminStats = await contract.getAdminStats(signer.address);
            console.log("\n📊 Your Admin Statistics:");
            console.log(`   • Status: ${adminStats.isActive ? '🟢 Active' : '🔴 Inactive'}`);
            console.log(`   • Type: ${adminStats.isFree ? '🆓 Free' : '💳 Paid'}`);
            console.log(`   • Registered: ${new Date(Number(adminStats.registrationTime) * 1000).toLocaleDateString()}`);
            console.log(`   • Users Registered: ${adminStats.totalRegistered}`);
            console.log(`   • Total Volume: ${ethers.formatEther(adminStats.totalVolume)} BNB`);
            console.log(`   • Contact: ${adminStats.contact}`);
            
            return;
        }

        // Check registration settings
        const adminFee = await contract.adminRegistrationFee();
        const publicRegistration = await contract.publicAdminRegistration();
        const maxAdmins = await contract.maxAdmins();
        const currentAdminCount = await contract.getTotalAdmins();

        console.log(`💳 Registration Fee: ${ethers.formatEther(adminFee)} BNB`);
        console.log(`🌐 Public Registration: ${publicRegistration}`);
        console.log(`📊 Available Slots: ${maxAdmins - currentAdminCount}/${maxAdmins}`);

        // Check if registration is possible
        if (currentAdminCount >= maxAdmins) {
            console.log("❌ Maximum number of admins reached. Registration not available.");
            return;
        }

        if (!publicRegistration) {
            // Check if whitelisted
            const isWhitelisted = await contract.adminWhitelist(signer.address);
            if (!isWhitelisted) {
                console.log("❌ Public registration is disabled and you are not whitelisted.");
                console.log("💡 Contact the platform owner to get whitelisted.");
                return;
            } else {
                console.log("✅ You are whitelisted for admin registration!");
            }
        }

        // Check balance for fee
        if (adminFee > 0 && balance < adminFee) {
            console.log(`❌ Insufficient balance. Need ${ethers.formatEther(adminFee)} BNB for registration.`);
            return;
        }

        console.log("\n🚀 Proceeding with Admin Registration...");
        console.log("========================================");

        let tx;
        if (adminFee == 0) {
            // Free registration
            console.log("🆓 Registering as FREE admin...");
            tx = await contract.registerFreeAdmin(CONTACT_INFO);
        } else {
            // Paid registration
            console.log(`💳 Registering as PAID admin (${ethers.formatEther(adminFee)} BNB)...`);
            tx = await contract.registerPaidAdmin(CONTACT_INFO, { value: adminFee });
        }

        console.log(`⏳ Transaction submitted: ${tx.hash}`);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

        console.log("\n🎉 ADMIN REGISTRATION SUCCESSFUL!");
        console.log("=================================");

        // Verify registration
        const isNowAdmin = await contract.isAdmin(signer.address);
        const hasAdminRole = await contract.hasRole(await contract.ADMIN_ROLE(), signer.address);
        
        console.log(`✅ Admin Status: ${isNowAdmin ? 'Registered' : 'Not Registered'}`);
        console.log(`✅ Admin Role: ${hasAdminRole ? 'Granted' : 'Not Granted'}`);

        // Get admin stats
        const adminStats = await contract.getAdminStats(signer.address);
        console.log("\n📊 Your Admin Profile:");
        console.log(`   • Address: ${signer.address}`);
        console.log(`   • Type: ${adminStats.isFree ? '🆓 Free Admin' : '💳 Paid Admin'}`);
        console.log(`   • Status: ${adminStats.isActive ? '🟢 Active' : '🔴 Inactive'}`);
        console.log(`   • Registered: ${new Date().toLocaleDateString()}`);
        console.log(`   • Contact: ${adminStats.contact}`);

        console.log("\n🎯 What You Can Do Now:");
        console.log("=======================");
        console.log("✅ Register new users with registerUserAsAdmin()");
        console.log("✅ Distribute bonuses with distributeBonuses()");
        console.log("✅ Update oracle settings with updateOracle()");
        console.log("✅ Access all admin-only platform functions");
        console.log("✅ Track your registration statistics");

        console.log("\n📋 Next Steps:");
        console.log("==============");
        console.log("1. Update your contact information if needed");
        console.log("2. Start registering users to the platform");
        console.log("3. Monitor your admin statistics");
        console.log("4. Connect with other admins for coordination");

        // Show updated platform stats
        const newTotalAdmins = await contract.getTotalAdmins();
        const activeAdmins = await contract.getActiveAdminCount();
        
        console.log("\n📊 Updated Platform Stats:");
        console.log(`   • Total Admins: ${newTotalAdmins}`);
        console.log(`   • Active Admins: ${activeAdmins}`);
        console.log(`   • Available Slots: ${maxAdmins - newTotalAdmins}`);

        console.log("\n🎊 Welcome to the OrphiCrowdFund Admin Team!");

    } catch (error) {
        console.error("\n❌ Admin registration failed:", error.message);
        
        if (error.message.includes("Already an admin")) {
            console.log("💡 You are already registered as an admin");
        } else if (error.message.includes("insufficient funds")) {
            console.log("💡 Add more BNB to your wallet for registration fee");
        } else if (error.message.includes("Not whitelisted")) {
            console.log("💡 Contact platform owner to get whitelisted");
        } else if (error.message.includes("Max admins reached")) {
            console.log("💡 Maximum admin limit reached, try again later");
        }
        
        throw error;
    }
}

// Execute registration
if (require.main === module) {
    main()
        .then(() => {
            console.log("\n🎯 Admin registration process completed!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n💥 Admin registration failed:", error);
            process.exit(1);
        });
}

module.exports = main;
