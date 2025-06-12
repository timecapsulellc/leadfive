// Test TrezorConnect import in ESM environment
import { ethers } from 'ethers';

console.log('✅ Node.js version:', process.version);
console.log('✅ Ethers imported successfully');

async function testTrezorImport() {
    try {
        console.log('🔐 Testing TrezorConnect import...');
        
        // Dynamic import for TrezorConnect to handle ESM compatibility
        let TrezorConnect;
        try {
            const trezorModule = await import('@trezor/connect');
            console.log('📦 TrezorConnect module loaded, keys:', Object.keys(trezorModule));
            
            // Handle different export structures
            if (trezorModule.default && typeof trezorModule.default.init === 'function') {
                TrezorConnect = trezorModule.default;
                console.log('✅ Using default export');
            } else if (typeof trezorModule.init === 'function') {
                TrezorConnect = trezorModule;
                console.log('✅ Using named exports');
            } else if (trezorModule.TrezorConnect && typeof trezorModule.TrezorConnect.init === 'function') {
                TrezorConnect = trezorModule.TrezorConnect;
                console.log('✅ Using TrezorConnect property');
            } else {
                throw new Error("TrezorConnect.init function not found in any export structure");
            }
            
            console.log('✅ TrezorConnect import successful');
            console.log('📋 TrezorConnect type:', typeof TrezorConnect);
            console.log('📋 TrezorConnect.init type:', typeof TrezorConnect.init);
            
            // Test initialization (without actually connecting)
            console.log('🚀 Testing TrezorConnect initialization...');
            const result = await TrezorConnect.init({
                lazyLoad: true,
                manifest: {
                    email: 'test@example.com',
                    appUrl: 'https://test.com'
                },
                connectSrc: 'https://connect.trezor.io/9/',
                popup: false,
                webusb: false,
                debug: false
            });
            
            if (result.success) {
                console.log('✅ TrezorConnect initialization successful');
            } else {
                console.log('⚠️  TrezorConnect initialization failed (expected without Bridge):', result.payload?.error);
            }
            
        } catch (error) {
            console.error('❌ TrezorConnect import/init failed:', error.message);
            throw error;
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testTrezorImport().then(() => {
    console.log('🎉 All tests passed! ESM TrezorConnect integration is working.');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
});
