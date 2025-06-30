#!/usr/bin/env node
const interval = setInterval(() => {
    const mem = process.memoryUsage();
    const used = Math.round(mem.heapUsed / 1024 / 1024);
    const total = Math.round(mem.heapTotal / 1024 / 1024);
    const external = Math.round(mem.external / 1024 / 1024);
    
    console.log(`[${new Date().toLocaleTimeString()}] Memory: ${used}MB/${total}MB (External: ${external}MB)`);
    
    if (used > 512) {
        console.log('⚠️  High memory usage detected!');
    }
}, 5000);

process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\nMemory monitoring stopped.');
    process.exit(0);
});

console.log('🔍 Memory monitoring started. Press Ctrl+C to stop.');