/**
 * Vite Plugin: Remove Console
 * Automatically removes console statements in production builds
 */

export default function removeConsole() {
  return {
    name: 'remove-console',
    enforce: 'pre',
    transform(code, id) {
      // Only process JS/JSX files in production
      if (process.env.NODE_ENV !== 'production') {
        return null;
      }

      if (!id.match(/\.(js|jsx|ts|tsx)$/)) {
        return null;
      }

      // Skip node_modules
      if (id.includes('node_modules')) {
        return null;
      }

      // Remove various console methods - improved pattern
      // Handle multi-line console statements and edge cases
      let cleanedCode = code;
      
      // First, handle multi-line console statements
      cleanedCode = cleanedCode.replace(
        /console\.(log|debug|info|warn|error|trace|table|group|groupEnd|time|timeEnd|assert|clear|count|dir|dirxml|profile|profileEnd)\s*\([^()]*(?:\([^()]*\)[^()]*)*\)\s*;?/g,
        ''
      );
      
      // Then handle simple single-line console statements
      cleanedCode = cleanedCode.replace(
        /console\.(log|debug|info|warn|error)\s*\([^;\n]*\)\s*;?/g,
        ''
      );
      
      // Clean up any trailing commas that might be left
      cleanedCode = cleanedCode.replace(/,\s*,/g, ',');
      cleanedCode = cleanedCode.replace(/\{\s*,/g, '{');
      cleanedCode = cleanedCode.replace(/,\s*\}/g, '}');
      cleanedCode = cleanedCode.replace(/\[\s*,/g, '[');
      cleanedCode = cleanedCode.replace(/,\s*\]/g, ']');
      cleanedCode = cleanedCode.replace(/\(\s*,/g, '(');
      cleanedCode = cleanedCode.replace(/,\s*\)/g, ')');
      
      // Check if code was modified
      if (cleanedCode !== code) {
        // Count approximate removals (not exact due to complex patterns)
        const originalLines = code.split('\n').length;
        const cleanedLines = cleanedCode.split('\n').length;
        const approximateRemovals = originalLines - cleanedLines;
        
        console.log(`✨ Cleaned console statements from ${id.split('/').pop()}`);
        
        return {
          code: cleanedCode,
          map: null // Source map can be generated if needed
        };
      }

      return null;
    }
  };
}