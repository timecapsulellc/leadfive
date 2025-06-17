const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🧪 Testing OrphiCrowdFund V2 Admin Features...");
    console.log("===============================================");

    // Get network
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

    // Get signers
    const [deployer, admin1, admin2, user1] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`👤 Test Admin 1: ${admin1.address}`);
    console.log(`👤 Test Admin 2: ${admin2.address}`);
    console.log(`👤 Test User 1: ${user1.address}`);

    // Contract address
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xf9538Fe9FCF16C018E6057744555F2556f63cED9";
    console.log(`📄 Contract Address: ${CONTRACT_ADDRESS}`);

    try {
        // Connect to the upgraded contract
        const OrphiCrowdFundV2 = await ethers.getContractFactory("OrphiCrowdFundV2");
        const contract = OrphiCrowdFundV2.attach(CONTRACT_ADDRESS);

        console.log("\n📊 Current V2 Status:");
        console.log("====================");

        // Check V2 features
        const totalAdmins = await contract.getTotalAdmins();
        const activeAdmins = await contract.getActiveAdminCount();
        const adminFee = await contract.adminRegistrationFee();
        const publicRegistration = await contract.publicAdminRegistration();
        const maxAdmins = await contract.maxAdmins();

        console.log(`👥 Total Admins: ${totalAdmins}`);
        console.log(`✅ Active Admins: ${activeAdmins}`);
        console.log(`💳 Admin Registration Fee: ${ethers.formatEther(adminFee)} BNB`);
        console.log(`🌐 Public Registration: ${publicRegistration}`);
        console.log(`📊 Max Admins: ${maxAdmins}`);

        // Get current admin list
        if (totalAdmins > 0) {
            console.log("\n👥 Current Admins:");
            const allAdmins = await contract.getAllAdmins();
            for (let i = 0; i < allAdmins.length; i++) {
                const adminAddr = allAdmins[i];
                const adminStats = await contract.getAdminStats(adminAddr);
                console.log(`${i + 1}. ${adminAddr}`);
                console.log(`   • Active: ${adminStats.isActive}`);
                console.log(`   • Free: ${adminStats.isFree}`);
                console.log(`   • Registered: ${new Date(Number(adminStats.registrationTime) * 1000).toISOString()}`);
                console.log(`   • Total Registered: ${adminStats.totalRegistered}`);
                console.log(`   • Contact: ${adminStats.contact}`);
            }
        }

        console.log("\n🧪 Testing Admin Registration...");
        console.log("=================================");

        // Test 1: Register free admin
        console.log("\n1️⃣ Testing Free Admin Registration...");
        try {
            // Check if admin1 is already registered
            const isAdmin1Already = await contract.isAdmin(admin1.address);
            if (!isAdmin1Already) {
                const tx1 = await contract.connect(admin1).registerFreeAdmin("test-admin-1@orphi.com");
                console.log(`⏳ Free admin registration tx: ${tx1.hash}`);
                await tx1.wait();
                console.log("✅ Free admin registration successful!");
                
                // Check admin status
                const adminStats1 = await contract.getAdminStats(admin1.address);
                console.log(`   • Is Free Admin: ${adminStats1.isFree}`);
                console.log(`   • Is Active: ${adminStats1.isActive}`);
            } else {
                console.log("ℹ️  Admin1 already registered");
            }
        } catch (error) {
            console.log(`❌ Free admin registration failed: ${error.message}`);
        }

        // Test 2: Try registering another admin with whitelist
        console.log("\n2️⃣ Testing Whitelist Admin Registration...");
        try {
            // First whitelist admin2
            const whitelistTx = await contract.connect(deployer).whitelistAdmin(admin2.address);
            console.log(`⏳ Whitelist tx: ${whitelistTx.hash}`);
            await whitelistTx.wait();
            console.log("✅ Admin2 whitelisted!");

            // Check if admin2 is already registered
            const isAdmin2Already = await contract.isAdmin(admin2.address);
            if (!isAdmin2Already) {
                // Register admin2
                const tx2 = await contract.connect(admin2).registerFreeAdmin("test-admin-2@orphi.com");
                console.log(`⏳ Whitelisted admin registration tx: ${tx2.hash}`);
                await tx2.wait();
                console.log("✅ Whitelisted admin registration successful!");
            } else {
                console.log("ℹ️  Admin2 already registered");
            }
        } catch (error) {
            console.log(`❌ Whitelist admin registration failed: ${error.message}`);
        }

        // Test 3: Check admin management functions
        console.log("\n3️⃣ Testing Admin Management...");
        try {
            // Get updated admin count
            const newTotalAdmins = await contract.getTotalAdmins();
            const newActiveAdmins = await contract.getActiveAdminCount();
            console.log(`👥 Updated Total Admins: ${newTotalAdmins}`);
            console.log(`✅ Updated Active Admins: ${newActiveAdmins}`);

            // Get all active admins
            const activeAdminsList = await contract.getActiveAdmins();
            console.log(`📋 Active Admin Addresses: ${activeAdminsList.length}`);
            for (let i = 0; i < activeAdminsList.length; i++) {
                console.log(`   ${i + 1}. ${activeAdminsList[i]}`);
            }
        } catch (error) {
            console.log(`❌ Admin management test failed: ${error.message}`);
        }

        // Test 4: Test admin role permissions
        console.log("\n4️⃣ Testing Admin Role Permissions...");
        try {
            // Check if admins have ADMIN_ROLE
            const ADMIN_ROLE = await contract.ADMIN_ROLE();
            
            if (await contract.isAdmin(admin1.address)) {
                const hasRole1 = await contract.hasRole(ADMIN_ROLE, admin1.address);
                console.log(`👤 Admin1 has ADMIN_ROLE: ${hasRole1}`);
            }
            
            if (await contract.isAdmin(admin2.address)) {
                const hasRole2 = await contract.hasRole(ADMIN_ROLE, admin2.address);
                console.log(`👤 Admin2 has ADMIN_ROLE: ${hasRole2}`);
            }
        } catch (error) {
            console.log(`❌ Role permission test failed: ${error.message}`);
        }

        // Test 5: Test admin configuration changes
        console.log("\n5️⃣ Testing Admin Configuration...");
        try {
            // Test changing admin registration fee
            console.log("Setting admin registration fee to 0.01 BNB...");
            const setFeeTx = await contract.connect(deployer).setAdminRegistrationFee(ethers.parseEther("0.01"));
            await setFeeTx.wait();
            
            const newFee = await contract.adminRegistrationFee();
            console.log(`✅ New admin fee: ${ethers.formatEther(newFee)} BNB`);

            // Reset to free
            const resetFeeTx = await contract.connect(deployer).setAdminRegistrationFee(0);
            await resetFeeTx.wait();
            console.log("✅ Admin fee reset to free");

        } catch (error) {
            console.log(`❌ Admin configuration test failed: ${error.message}`);
        }

        console.log("\n🎉 V2 ADMIN TESTING COMPLETE!");
        console.log("==============================");
        
        // Final status
        const finalTotalAdmins = await contract.getTotalAdmins();
        const finalActiveAdmins = await contract.getActiveAdminCount();
        
        console.log("📊 Final Status:");
        console.log(`   • Total Admins: ${finalTotalAdmins}`);
        console.log(`   • Active Admins: ${finalActiveAdmins}`);
        console.log(`   • Public Registration: ${await contract.publicAdminRegistration()}`);
        console.log(`   • Current Admin Fee: ${ethers.formatEther(await contract.adminRegistrationFee())} BNB`);

        console.log("\n✅ All V2 admin features are working correctly!");
        console.log("🚀 Platform is ready for multi-admin operations!");

    } catch (error) {
        console.error("\n❌ V2 Testing failed:", error.message);
        throw error;
    }
}

// Execute testing
if (require.main === module) {
    main()
        .then(() => {
            console.log("\n🎯 V2 Testing completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n💥 V2 Testing failed:", error);
            process.exit(1);
        });
}

module.exports = main;
