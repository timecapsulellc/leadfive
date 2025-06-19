const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🔍 LEADFIVE LIVE CONTRACT VALIDATION");
    console.log("=" * 80);
    console.log("🎯 Validating mainnet contract functionality and security");
    console.log("📍 Contract: 0x7FEEA22942407407801cCDA55a4392f25975D998");
    console.log("🌐 Network: BSC Mainnet");

    // Validation results storage
    const validationResults = {
        timestamp: new Date().toISOString(),
        contractAddress: "0x7FEEA22942407407801cCDA55a4392f25975D998",
        network: "BSC Mainnet",
        chainId: 56,
        validationChecks: [],
        summary: {
            totalChecks: 0,
            passed: 0,
            failed: 0,
            warnings: 0
        }
    };

    function addValidationResult(checkName, status, details, expected = null, actual = null) {
        const result = {
            check: checkName,
            status: status, // 'PASS', 'FAIL', 'WARN'
            details: details,
            expected: expected,
            actual: actual,
            timestamp: new Date().toISOString()
        };
        validationResults.validationChecks.push(result);
        validationResults.summary.totalChecks++;
        
        if (status === 'PASS') {
            validationResults.summary.passed++;
            console.log(`✅ ${checkName}: ${details}`);
        } else if (status === 'FAIL') {
            validationResults.summary.failed++;
            console.log(`❌ ${checkName}: ${details}`);
            if (expected && actual) {
                console.log(`   Expected: ${expected}`);
                console.log(`   Actual: ${actual}`);
            }
        } else if (status === 'WARN') {
            validationResults.summary.warnings++;
            console.log(`⚠️  ${checkName}: ${details}`);
        }
    }

    try {
        // PHASE 1: BASIC CONTRACT VERIFICATION
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 1: BASIC CONTRACT VERIFICATION");
        console.log("=" * 80);

        // Get network and signer
        const [deployer] = await ethers.getSigners();
        const network = await ethers.provider.getNetwork();
        
        console.log("👤 Validator Address:", deployer.address);
        console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());

        // Test 1.1: Contract Code Verification
        console.log("\n--- Test 1.1: Contract Code Verification ---");
        
        const contractAddress = "0x7FEEA22942407407801cCDA55a4392f25975D998";
        const contractCode = await ethers.provider.getCode(contractAddress);
        
        if (contractCode === "0x") {
            addValidationResult(
                "Contract Code Presence",
                "FAIL",
                "No contract code found at address",
                "Contract code present",
                "No code"
            );
        } else {
            addValidationResult(
                "Contract Code Presence",
                "PASS",
                `Contract code verified (${contractCode.length} bytes)`,
                "Contract code present",
                `${contractCode.length} bytes`
            );
        }

        // Test 1.2: Contract Interface Detection
        console.log("\n--- Test 1.2: Contract Interface Detection ---");
        
        try {
            // Try LeadFiveModular interface first
            const LeadFiveModular = await ethers.getContractFactory("LeadFiveModular");
            const contract = LeadFiveModular.attach(contractAddress);
            
            // Test basic view function
            try {
                const owner = await contract.owner();
                addValidationResult(
                    "LeadFiveModular Interface",
                    "PASS",
                    `Contract responds to owner() call: ${owner}`,
                    "Interface compatible",
                    "Compatible"
                );
                
                validationResults.detectedInterface = "LeadFiveModular";
                validationResults.contractOwner = owner;
                
            } catch (error) {
                addValidationResult(
                    "LeadFiveModular Interface",
                    "FAIL",
                    `Interface test failed: ${error.message}`,
                    "Interface compatible",
                    error.message
                );
            }
            
        } catch (error) {
            addValidationResult(
                "Contract Interface Detection",
                "FAIL",
                `Interface detection failed: ${error.message}`,
                "Interface detected",
                error.message
            );
        }

        // PHASE 2: OWNERSHIP AND ACCESS CONTROL
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 2: OWNERSHIP AND ACCESS CONTROL");
        console.log("=" * 80);

        try {
            const LeadFiveModular = await ethers.getContractFactory("LeadFiveModular");
            const contract = LeadFiveModular.attach(contractAddress);

            // Test 2.1: Owner Verification
            console.log("\n--- Test 2.1: Owner Verification ---");
            
            const owner = await contract.owner();
            const expectedOwner = deployer.address;
            
            if (owner === "0x0000000000000000000000000000000000000000") {
                addValidationResult(
                    "Contract Owner",
                    "WARN",
                    "Contract owner is zero address - ownership not initialized",
                    expectedOwner,
                    owner
                );
            } else if (owner.toLowerCase() === expectedOwner.toLowerCase()) {
                addValidationResult(
                    "Contract Owner",
                    "PASS",
                    `Contract owner correctly set to deployer: ${owner}`,
                    expectedOwner,
                    owner
                );
            } else {
                addValidationResult(
                    "Contract Owner",
                    "WARN",
                    `Contract owner differs from deployer: ${owner}`,
                    expectedOwner,
                    owner
                );
            }

            // Test 2.2: Pause State
            console.log("\n--- Test 2.2: Pause State Verification ---");
            
            try {
                const isPaused = await contract.paused();
                addValidationResult(
                    "Contract Pause State",
                    "PASS",
                    `Contract pause state: ${isPaused}`,
                    "Accessible",
                    isPaused.toString()
                );
            } catch (error) {
                addValidationResult(
                    "Contract Pause State",
                    "FAIL",
                    `Pause state check failed: ${error.message}`,
                    "Accessible",
                    error.message
                );
            }

        } catch (error) {
            addValidationResult(
                "Ownership Verification",
                "FAIL",
                `Ownership verification failed: ${error.message}`,
                "Ownership accessible",
                error.message
            );
        }

        // PHASE 3: CORE FUNCTION VERIFICATION
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 3: CORE FUNCTION VERIFICATION");
        console.log("=" * 80);

        try {
            const LeadFiveModular = await ethers.getContractFactory("LeadFiveModular");
            const contract = LeadFiveModular.attach(contractAddress);

            // Test 3.1: Package Prices
            console.log("\n--- Test 3.1: Package Prices Verification ---");
            
            try {
                // Use the correct packages() function from LeadFiveModular
                const packagePrices = [];
                for (let i = 1; i <= 4; i++) {
                    const packageInfo = await contract.packages(i);
                    packagePrices.push(packageInfo.price);
                }
                
                const pricesInUSDT = packagePrices.map(p => ethers.formatEther(p));
                const expectedPrices = ["30.0", "50.0", "100.0", "200.0"];
                const pricesMatch = expectedPrices.every((expected, index) => expected === pricesInUSDT[index]);
                
                addValidationResult(
                    "Package Prices Access",
                    "PASS",
                    `Package prices: [$${pricesInUSDT.join(", $")}] USDT`,
                    "Package prices accessible",
                    "Accessible"
                );
                
                addValidationResult(
                    "Package Price Verification",
                    pricesMatch ? "PASS" : "WARN",
                    `Package prices: [$${pricesInUSDT.join(", $")}] USDT`,
                    `[$${expectedPrices.join(", $")}] USDT`,
                    `[$${pricesInUSDT.join(", $")}] USDT`
                );
                
            } catch (error) {
                addValidationResult(
                    "Package Prices Access",
                    "FAIL",
                    `Package prices access failed: ${error.message}`,
                    "Package prices accessible",
                    error.message
                );
            }

            // Test 3.2: Pool Balances
            console.log("\n--- Test 3.2: Pool Balances Verification ---");
            
            try {
                let poolBalances;
                try {
                    poolBalances = await contract.getPoolBalances();
                } catch (e1) {
                    try {
                        poolBalances = await contract.poolBalances();
                    } catch (e2) {
                        throw new Error("No pool balance function found");
                    }
                }
                
                const balancesInUSDT = poolBalances.map(p => ethers.formatEther(p));
                addValidationResult(
                    "Pool Balances Access",
                    "PASS",
                    `Pool balances: [${balancesInUSDT.join(", ")}] USDT`,
                    "Pool balances accessible",
                    "Accessible"
                );
                
            } catch (error) {
                addValidationResult(
                    "Pool Balances Access",
                    "FAIL",
                    `Pool balances access failed: ${error.message}`,
                    "Pool balances accessible",
                    error.message
                );
            }

            // Test 3.3: Admin Fee Rate
            console.log("\n--- Test 3.3: Admin Fee Rate Verification ---");
            
            try {
                const adminFeeInfo = await contract.getAdminFeeInfo();
                const adminFeeRate = adminFeeInfo[2]; // Third element is the fee rate
                const expectedRate = 500; // 5% = 500 basis points
                
                addValidationResult(
                    "Admin Fee Rate",
                    adminFeeRate.toString() === expectedRate.toString() ? "PASS" : "WARN",
                    `Admin fee rate: ${adminFeeRate.toString()} basis points (${(Number(adminFeeRate)/100).toString()}%)`,
                    `${expectedRate} basis points`,
                    `${adminFeeRate.toString()} basis points`
                );
                
            } catch (error) {
                addValidationResult(
                    "Admin Fee Rate",
                    "FAIL",
                    `Admin fee rate access failed: ${error.message}`,
                    "Admin fee rate accessible",
                    error.message
                );
            }

        } catch (error) {
            addValidationResult(
                "Core Function Verification",
                "FAIL",
                `Core function verification failed: ${error.message}`,
                "Core functions accessible",
                error.message
            );
        }

        // PHASE 4: EMERGENCY PROTOCOL VERIFICATION
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 4: EMERGENCY PROTOCOL VERIFICATION");
        console.log("=" * 80);

        try {
            const LeadFiveModular = await ethers.getContractFactory("LeadFiveModular");
            const contract = LeadFiveModular.attach(contractAddress);

            // Test 4.1: Emergency Functions Availability
            console.log("\n--- Test 4.1: Emergency Functions Availability ---");
            
            const emergencyFunctions = ["pause", "unpause", "emergencyWithdraw"];
            
            for (const funcName of emergencyFunctions) {
                try {
                    const func = contract.interface.getFunction(funcName);
                    addValidationResult(
                        `Emergency Function: ${funcName}`,
                        "PASS",
                        `Function ${funcName} available in contract interface`,
                        "Function available",
                        "Available"
                    );
                } catch (error) {
                    addValidationResult(
                        `Emergency Function: ${funcName}`,
                        "WARN",
                        `Function ${funcName} not found in interface`,
                        "Function available",
                        "Not found"
                    );
                }
            }

        } catch (error) {
            addValidationResult(
                "Emergency Protocol Verification",
                "FAIL",
                `Emergency protocol verification failed: ${error.message}`,
                "Emergency protocols accessible",
                error.message
            );
        }

        // FINAL SUMMARY
        console.log("\n" + "=" * 80);
        console.log("🎉 LIVE CONTRACT VALIDATION SUMMARY");
        console.log("=" * 80);

        const passRate = (validationResults.summary.passed / validationResults.summary.totalChecks * 100).toFixed(1);
        const failRate = (validationResults.summary.failed / validationResults.summary.totalChecks * 100).toFixed(1);
        const warnRate = (validationResults.summary.warnings / validationResults.summary.totalChecks * 100).toFixed(1);

        console.log(`📊 Total Validation Checks: ${validationResults.summary.totalChecks}`);
        console.log(`✅ Passed: ${validationResults.summary.passed} (${passRate}%)`);
        console.log(`❌ Failed: ${validationResults.summary.failed} (${failRate}%)`);
        console.log(`⚠️  Warnings: ${validationResults.summary.warnings} (${warnRate}%)`);

        // Overall assessment
        let contractStatus = "OPERATIONAL";
        if (validationResults.summary.failed > 2) {
            contractStatus = "CRITICAL ISSUES";
        } else if (validationResults.summary.failed > 0 || validationResults.summary.warnings > 3) {
            contractStatus = "NEEDS ATTENTION";
        }

        console.log(`\n🎯 Contract Status: ${contractStatus}`);
        console.log(`📍 Contract Address: 0x7FEEA22942407407801cCDA55a4392f25975D998`);
        console.log(`🔍 BSCScan: https://bscscan.com/address/0x7FEEA22942407407801cCDA55a4392f25975D998`);

        // Save validation results
        const fs = require('fs');
        fs.writeFileSync(
            'live-contract-validation-results.json',
            JSON.stringify(validationResults, null, 2)
        );

        console.log(`\n📄 Validation results saved to: live-contract-validation-results.json`);

        if (contractStatus === "OPERATIONAL") {
            console.log("\n✅ LIVE CONTRACT VALIDATION COMPLETE - READY FOR FRONTEND INTEGRATION!");
        } else {
            console.log("\n⚠️  LIVE CONTRACT VALIDATION COMPLETE - ISSUES DETECTED, REVIEW REQUIRED");
        }

    } catch (error) {
        console.error("❌ Live contract validation failed:", error);
        addValidationResult("Live Contract Validation Execution", "FAIL", `Critical error: ${error.message}`);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
