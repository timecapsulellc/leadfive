/**
 * Bundle Size Analyzer Plugin for Vite
 * Provides insights into bundle composition and size
 */

import fs from 'fs';
import path from 'path';

export default function bundleAnalyzer(options = {}) {
  const {
    enabled = process.env.ANALYZE === 'true',
    outputFile = 'bundle-analysis.json',
    threshold = 100000, // 100KB threshold for large chunks
  } = options;

  let bundleInfo = {
    chunks: [],
    totalSize: 0,
    gzippedSize: 0,
    warnings: [],
    optimizations: []
  };

  return {
    name: 'bundle-analyzer',
    generateBundle(options, bundle) {
      if (!enabled) return;

      // Analyze each chunk
      Object.entries(bundle).forEach(([fileName, chunk]) => {
        if (chunk.type === 'chunk') {
          const size = chunk.code.length;
          const modules = chunk.modules ? Object.keys(chunk.modules) : [];
          
          bundleInfo.chunks.push({
            fileName,
            size,
            sizeFormatted: formatBytes(size),
            modules: modules.length,
            isEntry: chunk.isEntry,
            isDynamicEntry: chunk.isDynamicEntry,
            imports: chunk.imports || [],
            exports: chunk.exports || [],
            moduleList: modules.slice(0, 10) // Top 10 modules
          });

          bundleInfo.totalSize += size;

          // Check for optimization opportunities
          if (size > threshold) {
            bundleInfo.warnings.push({
              type: 'large-chunk',
              fileName,
              size: formatBytes(size),
              message: `Large chunk detected. Consider code splitting.`
            });
          }

          // Check for duplicate dependencies
          const reactModules = modules.filter(m => m.includes('react'));
          if (reactModules.length > 1) {
            bundleInfo.optimizations.push({
              type: 'duplicate-react',
              fileName,
              message: 'Multiple React imports detected. Ensure proper chunk splitting.'
            });
          }

          // Check for heavy libraries
          const heavyLibs = ['d3', 'chart.js', 'framer-motion', 'ethers'];
          heavyLibs.forEach(lib => {
            const libModules = modules.filter(m => m.includes(lib));
            if (libModules.length > 0) {
              bundleInfo.optimizations.push({
                type: 'heavy-library',
                library: lib,
                fileName,
                message: `${lib} detected. Consider lazy loading if not critical.`
              });
            }
          });
        }
      });

      // Sort chunks by size
      bundleInfo.chunks.sort((a, b) => b.size - a.size);

      // Generate recommendations
      bundleInfo.recommendations = generateRecommendations(bundleInfo);

      console.log('\n📊 Bundle Analysis Summary:');
      console.log(`Total Size: ${formatBytes(bundleInfo.totalSize)}`);
      console.log(`Chunks: ${bundleInfo.chunks.length}`);
      console.log(`Warnings: ${bundleInfo.warnings.length}`);
      console.log(`Optimizations: ${bundleInfo.optimizations.length}`);

      // Show top 5 largest chunks
      console.log('\n🔍 Largest Chunks:');
      bundleInfo.chunks.slice(0, 5).forEach((chunk, i) => {
        console.log(`${i + 1}. ${chunk.fileName}: ${chunk.sizeFormatted} (${chunk.modules} modules)`);
      });

      // Show warnings
      if (bundleInfo.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        bundleInfo.warnings.forEach(warning => {
          console.log(`- ${warning.fileName}: ${warning.message}`);
        });
      }

      // Show optimizations
      if (bundleInfo.optimizations.length > 0) {
        console.log('\n💡 Optimization Opportunities:');
        bundleInfo.optimizations.slice(0, 3).forEach(opt => {
          console.log(`- ${opt.message}`);
        });
      }
    },

    writeBundle() {
      if (!enabled) return;

      // Write detailed analysis to file
      fs.writeFileSync(
        path.resolve(outputFile),
        JSON.stringify(bundleInfo, null, 2)
      );

      console.log(`\n📄 Detailed analysis written to: ${outputFile}`);
    }
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateRecommendations(bundleInfo) {
  const recommendations = [];

  // Large bundle recommendation
  if (bundleInfo.totalSize > 1000000) { // 1MB
    recommendations.push({
      type: 'bundle-size',
      priority: 'high',
      message: 'Total bundle size exceeds 1MB. Consider aggressive code splitting and lazy loading.'
    });
  }

  // Too many chunks
  if (bundleInfo.chunks.length > 20) {
    recommendations.push({
      type: 'chunk-count',
      priority: 'medium',
      message: 'High number of chunks detected. Consider consolidating smaller chunks.'
    });
  }

  // Heavy entry points
  const entryChunks = bundleInfo.chunks.filter(c => c.isEntry);
  entryChunks.forEach(chunk => {
    if (chunk.size > 200000) { // 200KB
      recommendations.push({
        type: 'entry-size',
        priority: 'high',
        fileName: chunk.fileName,
        message: `Entry point ${chunk.fileName} is ${chunk.sizeFormatted}. Consider moving non-critical code to dynamic imports.`
      });
    }
  });

  return recommendations;
}