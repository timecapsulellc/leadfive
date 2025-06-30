const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function checkBSCScan() {
    console.log('🔍 CHECKING CONTRACT VERIFICATION ON BSCSCAN');
    console.log('==============================================');
    
    const PROXY_ADDRESS = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
    const IMPLEMENTATION_ADDRESS = '0xA4AB35Ab2BA415E6CCf9559e8dcAB0661cC29e2b';
    
    console.log(`Proxy Address: ${PROXY_ADDRESS}`);
    console.log(`Implementation: ${IMPLEMENTATION_ADDRESS}`);
    console.log('');
    
    // Check proxy verification
    console.log('📋 PROXY CONTRACT VERIFICATION:');
    console.log(`🔗 BSCScan Proxy: https://bscscan.com/address/${PROXY_ADDRESS}`);
    
    try {
        const { stdout: proxyCheck } = await execAsync(`curl -s "https://api.bscscan.com/api?module=contract&action=getsourcecode&address=${PROXY_ADDRESS}&apikey=YourApiKeyToken"`);
        const proxyData = JSON.parse(proxyCheck);
        
        if (proxyData.status === '1' && proxyData.result[0].SourceCode !== '') {
            console.log('✅ Proxy contract is verified on BSCScan');
        } else {
            console.log('⚠️  Proxy contract verification status unclear');
        }
    } catch (e) {
        console.log('⚠️  Could not check proxy verification automatically');
    }
    
    // Check implementation verification
    console.log('');
    console.log('📋 IMPLEMENTATION CONTRACT VERIFICATION:');
    console.log(`🔗 BSCScan Implementation: https://bscscan.com/address/${IMPLEMENTATION_ADDRESS}`);
    
    try {
        const { stdout: implCheck } = await execAsync(`curl -s "https://api.bscscan.com/api?module=contract&action=getsourcecode&address=${IMPLEMENTATION_ADDRESS}&apikey=YourApiKeyToken"`);
        const implData = JSON.parse(implCheck);
        
        if (implData.status === '1' && implData.result[0].SourceCode !== '') {
            console.log('✅ Implementation contract is verified on BSCScan');
        } else {
            console.log('⚠️  Implementation contract verification status unclear');
        }
    } catch (e) {
        console.log('⚠️  Could not check implementation verification automatically');
    }
    
    console.log('');
    console.log('🎯 VERIFICATION SUMMARY:');
    console.log('Manual verification on BSCScan:');
    console.log(`1. Visit: https://bscscan.com/address/${PROXY_ADDRESS}`);
    console.log(`2. Check if "Contract" tab shows verified contract`);
    console.log(`3. Visit: https://bscscan.com/address/${IMPLEMENTATION_ADDRESS}`);
    console.log(`4. Check if "Contract" tab shows verified contract`);
    console.log('');
    console.log('✅ If both show verified contracts, verification is complete');
    console.log('❌ If not verified, run: npx hardhat verify --network bscMainnet <address>');
}

checkBSCScan().catch(console.error);
