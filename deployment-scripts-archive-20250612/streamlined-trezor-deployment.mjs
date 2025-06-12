#!/usr/bin/env node

/**
 * 🔐 STREAMLINED TREZOR DEPLOYMENT SCRIPT
 * 
 * This script simplifies the deployment process by using the Node.js TrezorConnect
 * in a more straightforward way, avoiding browser compatibility issues.
 */

import { spawn } from 'child_process';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;

console.log('🔐 STREAMLINED TREZOR DEPLOYMENT');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('This deployment will:');
console.log('✅ Start a local HTTP server for TrezorConnect');
console.log('✅ Open deployment interface in browser');
console.log('✅ Enable secure hardware wallet deployment');
console.log('✅ Deploy both InternalAdminManager and OrphiCrowdFund');
console.log('');

// Create simple HTTP server
const server = createServer((req, res) => {
    const url = req.url === '/' ? '/direct-trezor-deployment.html' : req.url;
    const filePath = join(__dirname, url);
    
    try {
        if (url.endsWith('.html')) {
            const content = readFileSync(filePath, 'utf8');
            res.writeHead(200, { 
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*'
            });
            res.end(content);
        } else if (url.endsWith('.js')) {
            const content = readFileSync(filePath, 'utf8');
            res.writeHead(200, { 
                'Content-Type': 'application/javascript',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content);
        } else {
            res.writeHead(404);
            res.end('Not found');
        }
    } catch (err) {
        res.writeHead(404);
        res.end('File not found');
    }
});

server.listen(PORT, () => {
    console.log(`🌐 Server started at http://localhost:${PORT}`);
    console.log('');
    console.log('🚀 OPENING DEPLOYMENT INTERFACE...');
    console.log('');
    console.log('📋 Instructions:');
    console.log('1. Connect your Trezor device via USB');
    console.log('2. Unlock with PIN and ensure Ethereum app is ready');
    console.log('3. Click "Connect Trezor Device" in the browser');
    console.log('4. Confirm address matches: 0xeB652c4523f3Cf615D3F3694b14E551145953aD0');
    console.log('5. Follow deployment steps and confirm transactions on Trezor');
    console.log('');
    
    // Open browser automatically
    const open = spawn('open', [`http://localhost:${PORT}`], { 
        stdio: 'ignore',
        detached: true 
    });
    open.unref();
    
    console.log('✅ Browser should open automatically');
    console.log('⚠️  Keep this terminal open during deployment');
    console.log('');
    console.log('Press Ctrl+C to stop when deployment is complete');
});

// Handle graceful shutdown
const cleanup = () => {
    console.log('\n🛑 Stopping deployment server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Log any unhandled errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    cleanup();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    cleanup();
});
