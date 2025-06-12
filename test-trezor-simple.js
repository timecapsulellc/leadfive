const TrezorConnect = require('@trezor/connect').default;

async function testTrezorConnection() {
    console.log('🔐 Testing Trezor connection...');
    console.log('📱 Please look at your Trezor device for prompts');
    
    try {
        // Initialize Trezor Connect
        console.log('Initializing Trezor Connect...');
        await TrezorConnect.init({
            lazyLoad: true,
            manifest: {
                email: 'orphi@example.com',
                appUrl: 'https://orphi.com'
            },
            debug: true
        });
        
        console.log('✅ Trezor Connect initialized');
        
        // Test connection
        console.log('🔌 Attempting to get address from Trezor...');
        console.log('👆 Please CONFIRM on your Trezor device when prompted');
        
        const result = await TrezorConnect.ethereumGetAddress({
            path: "m/44'/60'/0'/0/0",
            showOnTrezor: true
        });
        
        if (result.success) {
            console.log('✅ Success! Trezor is working properly');
            console.log(`📍 Address: ${result.payload.address}`);
            
            const expectedAddress = "0xeB652c4523f3Cf615D3F3694b14E551145953aD0";
            if (result.payload.address.toLowerCase() === expectedAddress.toLowerCase()) {
                console.log('✅ Address matches expected deployment address');
                console.log('🚀 Ready for deployment!');
            } else {
                console.log(`⚠️  Address mismatch:`);
                console.log(`   Expected: ${expectedAddress}`);
                console.log(`   Got:      ${result.payload.address}`);
                console.log('   Check your Trezor derivation path');
            }
        } else {
            console.log('❌ Failed to get address from Trezor');
            console.log(`Error: ${result.payload.error}`);
            
            if (result.payload.error.includes('Permissions not granted')) {
                console.log('💡 Solution: Make sure to APPROVE/CONFIRM on your Trezor device');
            } else if (result.payload.error.includes('Device not found')) {
                console.log('💡 Solution: Check USB connection and unlock your Trezor');
            }
        }
        
    } catch (error) {
        console.log('❌ Error during test:', error.message);
        console.log('🔧 Troubleshooting:');
        console.log('1. Ensure Trezor device is connected via USB');
        console.log('2. Unlock your Trezor with PIN');
        console.log('3. Make sure Trezor Suite or Bridge is running');
        console.log('4. Enable Ethereum app on your Trezor');
    }
}

testTrezorConnection();
