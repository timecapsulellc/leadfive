#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// MIME type mapping
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`📝 ${req.method} ${req.url}`);
    
    // Handle root path
    let filePath = req.url === '/' ? '/public/index.html' : req.url;
    
    // Remove query parameters
    filePath = filePath.split('?')[0];
    
    // Security: prevent directory traversal
    filePath = path.normalize(filePath);
    if (filePath.includes('..')) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    // Map public URLs to actual file paths
    let actualPath;
    if (filePath.startsWith('/js/')) {
        actualPath = path.join(__dirname, 'public', filePath);
    } else if (filePath.startsWith('/public/')) {
        actualPath = path.join(__dirname, filePath);
    } else {
        actualPath = path.join(__dirname, 'public', filePath);
    }
    
    // Check if file exists
    fs.access(actualPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`❌ File not found: ${actualPath}`);
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        // Get file extension and MIME type
        const ext = path.extname(actualPath).toLowerCase();
        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        
        // Read and serve the file
        fs.readFile(actualPath, (err, data) => {
            if (err) {
                console.log(`❌ Error reading file: ${err}`);
                res.writeHead(500);
                res.end('Server error');
                return;
            }
            
            // Set CORS headers for development
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(data);
            console.log(`✅ Served: ${actualPath}`);
        });
    });
});

const PORT = 3000;
const HOST = 'localhost';

server.listen(PORT, HOST, () => {
    const url = `http://${HOST}:${PORT}`;
    console.log(`
🚀 OrphiChain Dashboard Development Server Started!

📍 Server running at: ${url}
📁 Serving files from: ${__dirname}/public/
🌐 Open your browser and go to: ${url}

🔧 Features:
   ✅ Proper HTTP protocol (no file:// issues)
   ✅ CORS headers enabled
   ✅ CDN libraries will load correctly
   ✅ All JavaScript modules working

📝 Available endpoints:
   • ${url}/ - Main Dashboard
   • ${url}/js/app.js - Main Application
   • ${url}/js/contracts.js - Contract Configuration

Press Ctrl+C to stop the server
`);
    
    // Auto-open browser (optional)
    setTimeout(() => {
        exec(`open ${url}`, (err) => {
            if (err) {
                console.log('💡 Manually open your browser and go to:', url);
            }
        });
    }, 1000);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down OrphiChain Dashboard server...');
    server.close(() => {
        console.log('✅ Server stopped. Goodbye!');
        process.exit(0);
    });
});
