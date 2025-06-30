#!/usr/bin/env node
const { performance } = require('perf_hooks');

const startTime = performance.now();
console.log('🚀 Starting optimized build...');

// Run build with timing
require('child_process').exec('npm run build', (error, stdout, stderr) => {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    if (error) {
        console.error('❌ Build failed:', error.message);
        return;
    }
    
    console.log('✅ Build completed in', duration, 'ms');
    console.log(stdout);
    
    if (stderr) {
        console.log('Warnings:', stderr);
    }
});