// This file includes functions to audit documentation files, ensuring only essential documents remain. 
// It checks for outdated or redundant documentation.

import fs from 'fs';
import path from 'path';
import { essentialDocs } from '../../config/essential-docs.json';

export function auditDocumentation(directory: string): string[] {
    const filesToRemove: string[] = [];
    
    const allFiles = fs.readdirSync(directory);
    
    allFiles.forEach(file => {
        const filePath = path.join(directory, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        
        if (isDirectory) {
            filesToRemove.push(...auditDocumentation(filePath));
        } else {
            if (!isEssentialDocument(file) && isOutdatedDocument(file)) {
                filesToRemove.push(filePath);
            }
        }
    });
    
    return filesToRemove;
}

function isEssentialDocument(fileName: string): boolean {
    return essentialDocs.includes(fileName);
}

function isOutdatedDocument(fileName: string): boolean {
    // Logic to determine if the document is outdated
    // This could involve checking timestamps, content, etc.
    // Placeholder for actual implementation
    return true; // Assume all non-essential documents are outdated for this example
}