#!/usr/bin/env node

/**
 * Fix LeadFive.sol by removing duplicate initialize function
 */

const fs = require('fs');

console.log('🔧 Fixing LeadFive.sol - removing duplicate initialize function...');

// Read the contract file
const content = fs.readFileSync('./contracts/LeadFive.sol', 'utf8');
const lines = content.split('\n');

// Find the start and end of the duplicate section
let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// ========== CORE CONTRACT FUNCTIONS ==========')) {
        startLine = i;
    }
    if (startLine !== -1 && lines[i].includes('// ========== REGISTRATION FUNCTIONS ==========')) {
        endLine = i;
        break;
    }
}

if (startLine === -1 || endLine === -1) {
    console.log('❌ Could not find duplicate section markers');
    process.exit(1);
}

console.log(`📍 Found duplicate section: lines ${startLine + 1} to ${endLine + 1}`);

// Remove the duplicate section
const beforeSection = lines.slice(0, startLine);
const afterSection = lines.slice(endLine);

// Combine the parts
const fixedLines = [...beforeSection, ...afterSection];
const fixedContent = fixedLines.join('\n');

// Write the fixed content back
fs.writeFileSync('./contracts/LeadFive.sol', fixedContent);

console.log('✅ Duplicate initialize function removed!');
console.log(`📊 Removed ${endLine - startLine} lines`);

// Verify the fix
const newContent = fs.readFileSync('./contracts/LeadFive.sol', 'utf8');
const initializeFunctions = (newContent.match(/function initialize\(/g) || []).length;
console.log(`📋 Initialize functions remaining: ${initializeFunctions}`);

if (initializeFunctions === 1) {
    console.log('🎉 Success! Only one initialize function remains.');
} else {
    console.log('⚠️ Warning: Expected 1 initialize function, found', initializeFunctions);
}
