/**
 * Script to remove console.log statements from source files
 * Run this before building for production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  srcDir: path.resolve(__dirname, '../src'),
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  excludeDirs: ['node_modules', 'dist', 'build', '.git'],
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose')
};

// Console patterns to remove
const consolePatterns = [
  // Standard console methods
  /console\.(log|debug|info|warn|error|trace|table|group|groupEnd|time|timeEnd|assert|clear|count|dir|dirxml|profile|profileEnd)\s*\([^)]*\)\s*;?/g,
  // Multi-line console statements
  /console\.(log|debug|info|warn|error)\s*\(\s*[\s\S]*?\)\s*;?/gm,
  // Console statements with template literals
  /console\.(log|debug|info|warn|error)\s*\(`[\s\S]*?`\)\s*;?/g
];

let totalFilesProcessed = 0;
let totalConsoleRemoved = 0;
let filesModified = [];

// Process a single file
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let consoleCount = 0;

  // Apply each pattern
  consolePatterns.forEach(pattern => {
    const matches = modifiedContent.match(pattern);
    if (matches) {
      consoleCount += matches.length;
      modifiedContent = modifiedContent.replace(pattern, '');
    }
  });

  if (consoleCount > 0) {
    if (!config.dryRun) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
    }
    filesModified.push({ file: filePath, count: consoleCount });
    totalConsoleRemoved += consoleCount;
    
    if (config.verbose) {
      console.log(`✅ ${path.relative(config.srcDir, filePath)}: Removed ${consoleCount} console statements`);
    }
  }

  totalFilesProcessed++;
}

// Recursively process directory
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!config.excludeDirs.includes(file)) {
        processDirectory(filePath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (config.extensions.includes(ext)) {
        processFile(filePath);
      }
    }
  });
}

// Main execution
console.log('🧹 Removing console statements from production code...\n');

if (config.dryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
}

// Start processing
processDirectory(config.srcDir);

// Summary
console.log('\n📊 Summary:');
console.log(`Total files processed: ${totalFilesProcessed}`);
console.log(`Total console statements removed: ${totalConsoleRemoved}`);
console.log(`Files modified: ${filesModified.length}`);

if (filesModified.length > 0 && !config.verbose) {
  console.log('\n📝 Modified files:');
  filesModified
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .forEach(({ file, count }) => {
      console.log(`  ${path.relative(config.srcDir, file)}: ${count} statements`);
    });
  
  if (filesModified.length > 10) {
    console.log(`  ... and ${filesModified.length - 10} more files`);
  }
}

if (config.dryRun) {
  console.log('\n💡 Run without --dry-run to actually remove console statements');
} else {
  console.log('\n✨ Console statements removed successfully!');
}

// Exit with appropriate code
process.exit(0);