// simple-websocket-server.js - Simplified WebSocket server for testing PWA real-time features
const http = require('http');
const WebSocket = require('ws');

const PORT = 8080;

// Create HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

console.log(`🚀 OrphiChain WebSocket Server starting on port ${PORT}...`);

// Track connected clients
let clients = new Set();
let messageCount = 0;

// Sample OrphiChain data
const generateSampleData = () => {
    const eventTypes = ['system-stats', 'contract-events', 'user-activity', 'pool-updates'];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    const sampleData = {
        'system-stats': {
            type: 'system-stats',
            data: {
                totalUsers: Math.floor(Math.random() * 1000) + 500,
                totalVolume: (Math.random() * 1000000).toFixed(2),
                activeConnections: clients.size,
                lastBlockNumber: Math.floor(Math.random() * 1000000) + 18000000,
                networkHealth: Math.random() > 0.1 ? 'healthy' : 'degraded',
                timestamp: Date.now()
            }
        },
        'contract-events': {
            type: 'contract-events',
            data: {
                eventName: ['UserRegistered', 'WithdrawalMade', 'GlobalHelpDistributed'][Math.floor(Math.random() * 3)],
                userAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
                amount: (Math.random() * 1000).toFixed(2),
                transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
                blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
                timestamp: Date.now()
            }
        },
        'user-activity': {
            type: 'user-activity',
            data: {
                activeUsers: Math.floor(Math.random() * 100) + 50,
                newRegistrations: Math.floor(Math.random() * 10),
                pendingWithdrawals: Math.floor(Math.random() * 20),
                timestamp: Date.now()
            }
        },
        'pool-updates': {
            type: 'pool-updates',
            data: {
                poolId: Math.floor(Math.random() * 4) + 1,
                currentAmount: (Math.random() * 10000).toFixed(2),
                participantCount: Math.floor(Math.random() * 50) + 10,
                nextDistribution: Date.now() + (Math.random() * 86400000), // Next 24 hours
                timestamp: Date.now()
            }
        }
    };
    
    return sampleData[randomType];
};

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    console.log(`🔗 New client connected from ${req.socket.remoteAddress}`);
    clients.add(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connection',
        data: {
            message: 'Connected to OrphiChain WebSocket Server',
            clientId: ws._socket.remoteAddress,
            timestamp: Date.now()
        }
    }));
    
    // Send initial system stats
    ws.send(JSON.stringify(generateSampleData()));
    
    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`📨 Received message:`, data);
            
            // Echo back a response
            ws.send(JSON.stringify({
                type: 'response',
                data: {
                    originalMessage: data,
                    serverTime: Date.now(),
                    messageCount: ++messageCount
                }
            }));
            
        } catch (error) {
            console.error('❌ Error parsing message:', error);
        }
    });
    
    // Handle disconnection
    ws.on('close', () => {
        console.log('🔌 Client disconnected');
        clients.delete(ws);
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        clients.delete(ws);
    });
});

// Broadcast sample data to all connected clients every 5 seconds
setInterval(() => {
    if (clients.size > 0) {
        const sampleData = generateSampleData();
        console.log(`📡 Broadcasting to ${clients.size} clients:`, sampleData.type);
        
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(sampleData));
            }
        });
    }
}, 5000);

// Start server
server.listen(PORT, () => {
    console.log(`✅ OrphiChain WebSocket Server running on port ${PORT}`);
    console.log(`🌐 WebSocket URL: ws://localhost:${PORT}`);
    console.log(`📊 Broadcasting sample OrphiChain data every 5 seconds`);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down WebSocket server...');
    
    // Close all client connections
    clients.forEach(client => {
        client.close();
    });
    
    // Close server
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});
