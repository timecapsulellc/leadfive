import { scanFiles } from '../src/analysis/file-scanner';
import { DependencyAnalyzer } from '../src/analysis/dependency-analyzer';
import { auditDocumentation } from '../src/analysis/documentation-audit';

async function analyzeProject() {
    console.log('Starting project analysis...');

    // Scan for unused or orphaned files
    const unusedFiles = await scanFiles();
    console.log('Unused or orphaned files:', unusedFiles);

    // Analyze project dependencies
    const dependencyAnalyzer = new DependencyAnalyzer();
    const unusedComponents = dependencyAnalyzer.analyze();
    console.log('Unused components and dead code:', unusedComponents);

    // Audit documentation files
    const essentialDocs = await auditDocumentation();
    console.log('Essential documentation files:', essentialDocs);

    console.log('Project analysis completed.');
}

analyzeProject().catch(error => {
    console.error('Error during analysis:', error);
});