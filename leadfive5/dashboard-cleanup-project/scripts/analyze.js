// This script analyzes the codebase for unused components and files, providing a report for cleanup.

const fs = require('fs');
const path = require('path');

// Define the directory to analyze
const componentsDir = path.join(__dirname, '../src/components');

// Function to get all component names
const getComponentNames = (dir) => {
    return fs.readdirSync(dir).filter(file => {
        return fs.statSync(path.join(dir, file)).isDirectory();
    });
};

// Function to analyze components
const analyzeComponents = () => {
    const componentNames = getComponentNames(componentsDir);
    const unusedComponents = [];

    componentNames.forEach(component => {
        const componentPath = path.join(componentsDir, component);
        const indexFile = path.join(componentPath, 'index.ts');

        if (fs.existsSync(indexFile)) {
            const content = fs.readFileSync(indexFile, 'utf-8');
            const isUsed = content.includes('import') || content.includes('export');

            if (!isUsed) {
                unusedComponents.push(component);
            }
        }
    });

    return unusedComponents;
};

// Generate report
const generateReport = (unusedComponents) => {
    if (unusedComponents.length === 0) {
        console.log('All components are in use.');
    } else {
        console.log('Unused components found:');
        unusedComponents.forEach(component => {
            console.log(`- ${component}`);
        });
    }
};

// Main function to run the analysis
const main = () => {
    const unusedComponents = analyzeComponents();
    generateReport(unusedComponents);
};

// Execute the script
main();