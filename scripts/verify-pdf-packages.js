import { ethers } from 'ethers';

// Configuration
const CONTRACT_ADDRESS = '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569';
const BSC_RPC = 'https://bsc-dataseed.binance.org/';

// LeadFive Official Package Requirements (from PDF)
const EXPECTED_PACKAGES = [
    { name: "Entry Level", title: "Web3 Starter", priceUSD: 30, priceBNB: "0.111", directBonus: 40, levelBonus: 10, uplineBonus: 10, leaderBonus: 10, helpBonus: 30, clubBonus: 0 },
    { name: "Standard", title: "Community Builder", priceUSD: 50, priceBNB: "0.185", directBonus: 40, levelBonus: 10, uplineBonus: 10, leaderBonus: 10, helpBonus: 30, clubBonus: 0 },
    { name: "Advanced", title: "DAO Contributor", priceUSD: 100, priceBNB: "0.370", directBonus: 40, levelBonus: 10, uplineBonus: 10, leaderBonus: 10, helpBonus: 30, clubBonus: 0 },
    { name: "Premium", title: "Ecosystem Pioneer", priceUSD: 200, priceBNB: "0.741", directBonus: 40, levelBonus: 10, uplineBonus: 10, leaderBonus: 10, helpBonus: 30, clubBonus: 0 }
];

const CONTRACT_ABI = [
    'function packages(uint8) view returns (uint256 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus)',
    'function owner() view returns (address)'
];

async function verifyLeadFivePackages() {
    console.log('🔍 LEADFIVE PACKAGE VERIFICATION');
    console.log('Against Official PDF Requirements');
    console.log('===============================\n');
    
    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    try {
        console.log('📋 Expected Package Structure (from PDF):');
        console.log('==========================================');
        EXPECTED_PACKAGES.forEach((pkg, index) => {
            console.log(`${index + 1}. ${pkg.name} (${pkg.title}) - $${pkg.priceUSD} (~${pkg.priceBNB} BNB)`);
        });
        
        console.log('\n📦 Current Contract Configuration:');
        console.log('==================================');
        
        let allCorrect = true;
        const currentBNBPrice = 270; // Approximate USD price
        
        for (let i = 0; i < 4; i++) {
            try {
                const pkg = await contract.packages(i);
                const priceInBNB = ethers.formatEther(pkg.price);
                const priceInUSD = parseFloat(priceInBNB) * currentBNBPrice;
                const expected = EXPECTED_PACKAGES[i];
                
                console.log(`\nPackage ${i + 1}: ${expected.name} - ${expected.title}`);
                console.log(`  Expected: $${expected.priceUSD} (~${expected.priceBNB} BNB)`);
                console.log(`  Current:  $${priceInUSD.toFixed(0)} (${priceInBNB} BNB)`);
                
                // Check if price matches (within 10% tolerance)
                const expectedPriceBNB = parseFloat(expected.priceBNB);
                const currentPriceBNB = parseFloat(priceInBNB);
                const tolerance = expectedPriceBNB * 0.1; // 10% tolerance
                
                const priceMatch = Math.abs(currentPriceBNB - expectedPriceBNB) <= tolerance;
                const isInitialized = pkg.price > 0;
                
                // Check commission rates
                const directMatch = Number(pkg.directBonus) === expected.directBonus * 100; // Convert to basis points
                const levelMatch = Number(pkg.levelBonus) === expected.levelBonus * 100;
                const uplineMatch = Number(pkg.uplineBonus) === expected.uplineBonus * 100;
                const leaderMatch = Number(pkg.leaderBonus) === expected.leaderBonus * 100;
                const helpMatch = Number(pkg.helpBonus) === expected.helpBonus * 100;
                const clubMatch = Number(pkg.clubBonus) === expected.clubBonus * 100;
                
                const commissionsMatch = directMatch && levelMatch && uplineMatch && leaderMatch && helpMatch && clubMatch;
                
                if (isInitialized && priceMatch && commissionsMatch) {
                    console.log(`  Status: ✅ CORRECT - Matches PDF requirements`);
                } else if (isInitialized && (!priceMatch || !commissionsMatch)) {
                    console.log(`  Status: ⚠️ INCORRECT VALUES - Needs correction`);
                    if (!priceMatch) console.log(`    • Price mismatch: Expected ${expected.priceBNB} BNB, got ${priceInBNB} BNB`);
                    if (!commissionsMatch) {
                        console.log(`    • Commission mismatches:`);
                        if (!directMatch) console.log(`      - Direct: Expected ${expected.directBonus}%, got ${Number(pkg.directBonus)/100}%`);
                        if (!levelMatch) console.log(`      - Level: Expected ${expected.levelBonus}%, got ${Number(pkg.levelBonus)/100}%`);
                        if (!uplineMatch) console.log(`      - Upline: Expected ${expected.uplineBonus}%, got ${Number(pkg.uplineBonus)/100}%`);
                        if (!leaderMatch) console.log(`      - Leader: Expected ${expected.leaderBonus}%, got ${Number(pkg.leaderBonus)/100}%`);
                        if (!helpMatch) console.log(`      - Help: Expected ${expected.helpBonus}%, got ${Number(pkg.helpBonus)/100}%`);
                        if (!clubMatch) console.log(`      - Club: Expected ${expected.clubBonus}%, got ${Number(pkg.clubBonus)/100}%`);
                    }
                    allCorrect = false;
                } else {
                    console.log(`  Status: ❌ NOT INITIALIZED - Needs setup`);
                    allCorrect = false;
                }
                
                console.log(`  Commission Rates:`);
                console.log(`    Direct Bonus: ${Number(pkg.directBonus) / 100}% (Expected: ${expected.directBonus}%)`);
                console.log(`    Level Bonus: ${Number(pkg.levelBonus) / 100}% (Expected: ${expected.levelBonus}%)`);
                console.log(`    Upline Bonus: ${Number(pkg.uplineBonus) / 100}% (Expected: ${expected.uplineBonus}%)`);
                console.log(`    Leader Bonus: ${Number(pkg.leaderBonus) / 100}% (Expected: ${expected.leaderBonus}%)`);
                console.log(`    Help Bonus: ${Number(pkg.helpBonus) / 100}% (Expected: ${expected.helpBonus}%)`);
                console.log(`    Club Bonus: ${Number(pkg.clubBonus) / 100}% (Expected: ${expected.clubBonus}%)`);
                
                // Verify total commission adds up to 100%
                const totalCommission = expected.directBonus + expected.levelBonus + expected.uplineBonus + expected.leaderBonus + expected.helpBonus + expected.clubBonus;
                console.log(`    Total: ${totalCommission}% (Should be 100%)`);
                console.log(`    Status: ${totalCommission === 100 ? '✅ Correct total' : '❌ Incorrect total'}`);
                
            } catch (error) {
                console.log(`  Package ${i + 1}: ❌ Error reading - ${error.message}`);
                allCorrect = false;
            }
        }
        
        console.log('\n' + '='.repeat(60));
        if (allCorrect) {
            console.log('🎉 ALL PACKAGES MATCH PDF REQUIREMENTS!');
            console.log('✅ Contract is ready for ROOT user registration');
            console.log('✅ Entry Level ($30) can be used for first registration');
        } else {
            console.log('⚠️ PACKAGES DON\'T MATCH PDF REQUIREMENTS!');
            console.log('❌ Contract needs initialization/correction');
            console.log('\n🔧 Action Required:');
            console.log('1. Run: node initialize-contract.js');
            console.log('2. Follow the setup instructions');
            console.log('3. Initialize with EXACT values from PDF');
        }
        
        console.log('\n💡 ROOT USER REGISTRATION:');
        console.log('==========================');
        console.log('For ROOT user (first registration):');
        console.log('• Use Package 1 (Entry Level - $30)');
        console.log('• Set referrer to: 0x0000000000000000000000000000000000000000');
        console.log('• This will establish you as the root of the network');
        
    } catch (error) {
        console.error('❌ Error verifying packages:', error.message);
    }
}

// Run verification
verifyLeadFivePackages();
