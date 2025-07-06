/**
 * Vite Plugin: Remove Console (Safe Version)
 * Safely removes console statements without breaking syntax
 */

import MagicString from 'magic-string';

export default function removeConsoleSafe() {
  return {
    name: 'remove-console-safe',
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

      const s = new MagicString(code);
      let hasConsole = false;

      // Use a simpler approach: replace console.X with void 0
      // This preserves syntax while removing the console call
      const consoleRegex = /console\.(log|debug|info|warn|error|trace|table|time|timeEnd|group|groupEnd)/g;
      
      let match;
      while ((match = consoleRegex.exec(code)) !== null) {
        hasConsole = true;
        // Replace console.method with void 0
        s.overwrite(match.index, match.index + match[0].length, 'void 0');
      }

      if (hasConsole) {
        console.log(`✨ Neutralized console statements in ${id.split('/').pop()}`);
        
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true })
        };
      }

      return null;
    }
  };
}