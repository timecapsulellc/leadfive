import { exec } from 'child_process';

const validateProjectIntegrity = () => {
    // Run tests to ensure all components are functioning correctly
    exec('npm test', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing tests: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Test errors: ${stderr}`);
            return;
        }
        console.log(`Test results: ${stdout}`);
    });

    // Check for any missing or orphaned files
    exec('ts-node src/analysis/file-scanner.ts', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error scanning files: ${error.message}`);
            return;
        }
        console.log(`File scan results: ${stdout}`);
    });

    // Analyze dependencies for unused components
    exec('ts-node src/analysis/dependency-analyzer.ts', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error analyzing dependencies: ${error.message}`);
            return;
        }
        console.log(`Dependency analysis results: ${stdout}`);
    });

    // Audit documentation to ensure only essential files remain
    exec('ts-node src/analysis/documentation-audit.ts', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error auditing documentation: ${error.message}`);
            return;
        }
        console.log(`Documentation audit results: ${stdout}`);
    });
};

// Execute the validation process
validateProjectIntegrity();