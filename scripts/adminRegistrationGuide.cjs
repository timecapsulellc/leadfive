const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🎯 OrphiCrowdFund V2 - Admin Registration Guide");
    console.log("==============================================");

    // Get network
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

    // Contract address
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xf9538Fe9FCF16C018E6057744555F2556f63cED9";
    console.log(`📄 Contract Address: ${CONTRACT_ADDRESS}`);

    try {
        // Connect to the V2 contract
        const OrphiCrowdFundV2 = await ethers.getContractFactory("OrphiCrowdFundV2");
        const contract = OrphiCrowdFundV2.attach(CONTRACT_ADDRESS);

        console.log("\n📋 V2 Admin Registration Options:");
        console.log("=================================");

        // Get current settings
        const adminFee = await contract.adminRegistrationFee();
        const publicRegistration = await contract.publicAdminRegistration();
        const maxAdmins = await contract.maxAdmins();
        const currentAdminCount = await contract.getTotalAdmins();

        console.log(`💳 Current Admin Registration Fee: ${ethers.formatEther(adminFee)} BNB`);
        console.log(`🌐 Public Registration Enabled: ${publicRegistration}`);
        console.log(`📊 Max Admins Allowed: ${maxAdmins}`);
        console.log(`👥 Current Admin Count: ${currentAdminCount}`);
        console.log(`🆓 Available Slots: ${maxAdmins - currentAdminCount}`);

        console.log("\n🔧 Admin Registration Methods:");
        console.log("==============================");

        if (adminFee == 0) {
            console.log("1️⃣ FREE ADMIN REGISTRATION (Currently Available)");
            console.log("   • Function: registerFreeAdmin(string contactInfo)");
            console.log("   • Cost: FREE (0 BNB)");
            console.log("   • Requirements: None (if public registration enabled)");
            console.log("   • Benefits: Full admin privileges");
            console.log("");
            console.log("   📝 Example Usage:");
            console.log("   await contract.registerFreeAdmin('admin@example.com');");
        } else {
            console.log("1️⃣ PAID ADMIN REGISTRATION");
            console.log(`   • Function: registerPaidAdmin(string contactInfo)`);
            console.log(`   • Cost: ${ethers.formatEther(adminFee)} BNB`);
            console.log("   • Requirements: Payment + whitelist (if public disabled)");
            console.log("   • Benefits: Full admin privileges + priority support");
            console.log("");
            console.log("   📝 Example Usage:");
            console.log(`   await contract.registerPaidAdmin('admin@example.com', { value: '${adminFee}' });`);
        }

        if (!publicRegistration) {
            console.log("\n2️⃣ WHITELIST REQUIREMENT (Currently Active)");
            console.log("   • Contact platform owner to get whitelisted");
            console.log("   • Owner function: whitelistAdmin(address)");
            console.log("   • Check whitelist status: adminWhitelist(address)");
        }

        console.log("\n🎪 Admin Registration Process:");
        console.log("==============================");
        console.log("1. Check if public registration is enabled");
        console.log("2. If not, get whitelisted by platform owner");
        console.log("3. Call appropriate registration function");
        console.log("4. Provide contact information for communication");
        console.log("5. Pay registration fee (if required)");
        console.log("6. Receive ADMIN_ROLE permissions automatically");

        console.log("\n👑 Admin Privileges After Registration:");
        console.log("======================================");
        console.log("✅ Register new users: registerUserAsAdmin()");
        console.log("✅ Distribute bonuses: distributeBonuses()");
        console.log("✅ Update oracle settings: updateOracle()");
        console.log("✅ Access all admin-only functions");
        console.log("✅ Track registration statistics");
        console.log("✅ Manage user registrations");

        console.log("\n📊 Admin Management Functions:");
        console.log("==============================");
        console.log("• getAllAdmins() - Get all admin addresses");
        console.log("• getActiveAdmins() - Get only active admins");
        console.log("• getAdminStats(address) - Get admin statistics");
        console.log("• isAdmin(address) - Check if address is admin");
        console.log("• getTotalAdmins() - Get total admin count");
        console.log("• getActiveAdminCount() - Get active admin count");

        // Show current admins if any
        if (currentAdminCount > 0) {
            console.log("\n👥 Current Registered Admins:");
            console.log("=============================");
            
            const allAdmins = await contract.getAllAdmins();
            for (let i = 0; i < allAdmins.length; i++) {
                const adminAddr = allAdmins[i];
                const isCurrentAdmin = await contract.isAdmin(adminAddr);
                const adminStats = await contract.getAdminStats(adminAddr);
                
                console.log(`${i + 1}. ${adminAddr}`);
                console.log(`   • Status: ${adminStats.isActive ? '🟢 Active' : '🔴 Inactive'}`);
                console.log(`   • Type: ${adminStats.isFree ? '🆓 Free' : '💳 Paid'}`);
                console.log(`   • Registered: ${new Date(Number(adminStats.registrationTime) * 1000).toLocaleDateString()}`);
                console.log(`   • Users Registered: ${adminStats.totalRegistered}`);
                console.log(`   • Total Volume: ${ethers.formatEther(adminStats.totalVolume)} BNB`);
                console.log(`   • Contact: ${adminStats.contact || 'Not provided'}`);
                console.log("");
            }
        }

        console.log("\n🚀 Ready to Register as Admin?");
        console.log("==============================");
        
        if (publicRegistration && adminFee == 0) {
            console.log("🎉 GOOD NEWS! Free admin registration is currently open!");
            console.log("");
            console.log("💡 To register as admin from your wallet:");
            console.log("1. Connect to the contract");
            console.log("2. Call: registerFreeAdmin('your-email@example.com')");
            console.log("3. You'll instantly receive admin privileges!");
            console.log("");
            console.log("📱 Or use this script command:");
            console.log("node scripts/registerAsAdmin.cjs");
        } else if (publicRegistration && adminFee > 0) {
            console.log(`💰 Paid registration available for ${ethers.formatEther(adminFee)} BNB`);
            console.log("Contact platform for payment process");
        } else {
            console.log("📝 Contact platform owner for whitelist approval");
            console.log("Once whitelisted, you can register as admin");
        }

        console.log("\n📞 Support & Questions:");
        console.log("======================");
        console.log("• Technical Support: dev@orphicrowdfund.com");
        console.log("• Business Inquiries: business@orphicrowdfund.com");
        console.log("• Platform Owner: Contact through official channels");
        console.log("• Documentation: Check project README.md");

        console.log("\n✅ Platform is ready for multi-admin operations!");

    } catch (error) {
        console.error("\n❌ Guide generation failed:", error.message);
        throw error;
    }
}

// Execute guide
if (require.main === module) {
    main()
        .then(() => {
            console.log("\n🎯 Admin registration guide completed!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n💥 Guide generation failed:", error);
            process.exit(1);
        });
}

module.exports = main;
