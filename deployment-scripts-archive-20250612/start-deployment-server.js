#!/usr/bin/env node

/**
 * Simple HTTP Server for Trezor Deployment Interface
 * Serves the deployment HTML with proper HTTPS context for TrezorConnect
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const HOST = 'localhost';

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to deployment interface
    if (pathname === '/') {
        pathname = '/direct-trezor-deployment.html';
    }
    
    // Construct file path
    const filePath = path.join(__dirname, pathname);
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <head><title>404 Not Found</title></head>
                    <body>
                        <h1>404 - File Not Found</h1>
                        <p>The requested file was not found.</p>
                        <p><a href="/">Go to Deployment Interface</a></p>
                    </body>
                </html>
            `);
            return;
        }
        
        // Read file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - Internal Server Error</h1>');
                return;
            }
            
            // Get file extension and MIME type
            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            
            // Set CORS headers for TrezorConnect
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            
            res.end(data);
        });
    });
});

server.listen(PORT, HOST, () => {
    console.log('🌐 Trezor Deployment Server Started');
    console.log('═══════════════════════════════════════');
    console.log(`🔗 Server running at: http://${HOST}:${PORT}`);
    console.log(`📱 Deployment Interface: http://${HOST}:${PORT}/`);
    console.log('');
    console.log('✅ Ready for secure Trezor deployment');
    console.log('✅ TrezorConnect will work properly from HTTP server');
    console.log('');
    console.log('🔐 Open the URL above in your browser to start deployment');
    console.log('⚠️  Keep this server running during deployment');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});
