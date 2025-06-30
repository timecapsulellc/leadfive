// optimization-config.ts

export const optimizationConfig = {
    performanceMetrics: {
        maxFileSize: 500, // in KB
        maxDependencies: 20,
        minDocumentationCoverage: 80 // percentage
    },
    codeQualityGuidelines: {
        maxCyclomaticComplexity: 10,
        enforceConsistentNaming: true,
        requireJSDocComments: true
    },
    cleanupSettings: {
        retainEssentialDocs: true,
        removeUnusedFiles: true,
        auditFrequency: 'monthly' // frequency of documentation audits
    }
};