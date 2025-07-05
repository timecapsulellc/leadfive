# Corrupted API Service Recovery Guide

## Overview

This guide provides step-by-step instructions for identifying, diagnosing, and fixing corrupted API service files in the LeadFive DApp. It specifically addresses issues found in service files like `referralsApi.js`, `dashboardApi.js`, and other API service modules.

## Common Corruption Issues

### 1. Duplicate Method Definitions
- **Symptom**: Methods defined multiple times with different or incomplete implementations
- **Example**: `initialize()` method appearing twice with different signatures
- **Impact**: JavaScript syntax errors, unexpected behavior, method conflicts

### 2. Incomplete Code Blocks
- **Symptom**: Methods missing opening/closing braces, incomplete function bodies
- **Example**: Methods that start but don't finish, dangling code fragments
- **Impact**: Syntax errors, compilation failures, runtime crashes

### 3. Merged/Concatenated Code
- **Symptom**: Code from different methods or files merged together
- **Example**: Method signatures appearing in the middle of other methods
- **Impact**: Unparseable JavaScript, module loading failures

### 4. Missing or Malformed Comments
- **Symptom**: Comment blocks that interfere with code execution
- **Example**: JSDoc comments that accidentally include executable code
- **Impact**: Unexpected execution, syntax errors

## Diagnostic Steps

### Step 1: Identify Corruption Patterns

```bash
# Check for syntax errors
npm run build 2>&1 | grep -i error

# Look for duplicate method names
grep -n "async \|function " src/services/api/*.js

# Check for incomplete braces
grep -n "{" src/services/api/*.js | wc -l
grep -n "}" src/services/api/*.js | wc -l
```

### Step 2: File-Specific Analysis

For each corrupted file:

1. **Open in VS Code with syntax highlighting**
2. **Look for red squiggly lines (syntax errors)**
3. **Check the Problems panel (Ctrl+Shift+M)**
4. **Verify method structure and completeness**

### Step 3: Compare with Working Versions

```bash
# Check git history for working versions
git log --oneline src/services/api/referralsApi.js

# Compare with last known good version
git diff HEAD~1 src/services/api/referralsApi.js
```

## Recovery Procedures

### Method 1: Clean Reconstruction

**When to use**: File is heavily corrupted with multiple issues

1. **Backup the corrupted file**:
   ```bash
   cp src/services/api/referralsApi.js src/services/api/referralsApi.js.corrupted
   ```

2. **Create a clean template**:
   ```javascript
   /**
    * [Service Name] API Service
    * [Description]
    */
   
   import { ethers } from 'ethers';
   import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contracts';
   
   class [ServiceName]ApiService {
     constructor() {
       this.cache = new Map();
       this.cacheTimeout = 30000; // 30 seconds
     }
   
     // Add methods here
   }
   
   export const [serviceName]Api = new [ServiceName]ApiService();
   export default [serviceName]Api;
   ```

3. **Rebuild methods systematically**:
   - Copy method signatures from corrupted file
   - Implement clean method bodies
   - Add proper error handling and fallbacks
   - Test each method individually

### Method 2: Surgical Repair

**When to use**: File has specific corruption issues but mostly intact structure

1. **Identify corruption boundaries**:
   - Find where corruption starts and ends
   - Mark clean sections vs corrupted sections

2. **Remove corrupted sections**:
   ```javascript
   // Remove duplicate methods
   // Remove incomplete code blocks
   // Remove merged code sections
   ```

3. **Rebuild corrupted sections**:
   - Implement missing methods
   - Fix incomplete implementations
   - Restore proper method signatures

### Method 3: Git-Based Recovery

**When to use**: Recent commits contain working versions

1. **Find last working commit**:
   ```bash
   git log --oneline src/services/api/referralsApi.js
   ```

2. **Restore from specific commit**:
   ```bash
   git checkout [commit-hash] -- src/services/api/referralsApi.js
   ```

3. **Merge recent changes manually**:
   - Compare current needs with restored version
   - Add any new requirements
   - Update to match current API patterns

## Specific Fix for referralsApi.js

### Current Issues Identified

1. **Duplicate `initialize()` method** (lines 22-34 and 39-48)
2. **Incomplete method definitions** (malformed comments mixing with code)
3. **Missing method closures**
4. **Orphaned code fragments**

### Recommended Fix Strategy

1. **Remove corrupted sections**:
   ```javascript
   // Remove lines 13-21 (incomplete comment/code mix)
   // Remove lines 39-48 (duplicate initialize method)
   // Clean up method boundaries
   ```

2. **Standardize method structure**:
   ```javascript
   async methodName(parameters) {
     try {
       // Contract check
       if (!this.contract) {
         return this.getFallbackData();
       }
       
       // Main implementation
       // ...
       
     } catch (error) {
       console.error('Error in methodName:', error);
       return this.getFallbackData();
     }
   }
   ```

3. **Verify contract method existence**:
   ```javascript
   // Add contract method checks
   if (typeof this.contract[methodName] !== 'function') {
     console.warn(`Contract method ${methodName} not available`);
     return fallbackData;
   }
   ```

## Prevention Strategies

### 1. Version Control Best Practices

- **Commit frequently** with small, focused changes
- **Use descriptive commit messages** for API service changes
- **Create branches** for major API refactoring
- **Tag stable versions** before major changes

### 2. Code Quality Measures

- **Use ESLint** to catch syntax errors early
- **Enable Prettier** for consistent formatting
- **Add TypeScript** for better type safety
- **Implement unit tests** for API services

### 3. Development Workflow

- **Test after every change** to API services
- **Use hot reload** to catch errors immediately
- **Monitor browser console** during development
- **Validate in production-like environment**

### 4. Backup and Recovery

- **Regular git commits** (every feature/fix)
- **Branch before major changes**
- **Keep working versions** in separate branches
- **Document breaking changes**

## Testing Recovered Files

### 1. Syntax Validation

```bash
# Check for syntax errors
node -c src/services/api/referralsApi.js

# Run ESLint
npx eslint src/services/api/referralsApi.js

# Check with TypeScript (if using TS)
npx tsc --noEmit --checkJs src/services/api/referralsApi.js
```

### 2. Import Testing

```javascript
// Test file imports correctly
import { referralsApi } from './src/services/api/referralsApi.js';
console.log('Import successful:', typeof referralsApi);
```

### 3. Method Testing

```javascript
// Test key methods with mock data
const testMethods = async () => {
  try {
    // Test initialization
    await referralsApi.initialize(mockProvider, mockAccount);
    
    // Test data fetching
    const data = await referralsApi.getReferralData(mockAccount);
    console.log('Methods working:', data);
    
  } catch (error) {
    console.error('Method test failed:', error);
  }
};
```

### 4. Integration Testing

```bash
# Start development server
npm run dev

# Check browser console for errors
# Navigate to pages using the API service
# Verify data loading and display
```

## Emergency Recovery Checklist

When facing corrupted API services in production:

- [ ] **Immediate**: Stop deployment/rollback if possible
- [ ] **Assess**: Identify scope of corruption
- [ ] **Backup**: Save corrupted files for analysis
- [ ] **Restore**: Use git/backup to restore working version
- [ ] **Test**: Verify functionality in development
- [ ] **Deploy**: Careful deployment with monitoring
- [ ] **Monitor**: Watch for errors post-deployment
- [ ] **Document**: Record what went wrong and how it was fixed

## Tools and Resources

### VS Code Extensions
- **ESLint** - Real-time syntax checking
- **Prettier** - Code formatting
- **GitLens** - Git history and blame
- **Error Lens** - Inline error display

### Command Line Tools
```bash
# Syntax checking
node -c filename.js

# Find duplicate patterns
grep -n "pattern" file.js

# Count braces/brackets
grep -o "{" file.js | wc -l
grep -o "}" file.js | wc -l

# Git operations
git log --oneline filename.js
git diff HEAD~1 filename.js
git checkout commit-hash -- filename.js
```

### Online Resources
- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Git Documentation](https://git-scm.com/doc)

## Conclusion

Corrupted API service files can be recovered using systematic approaches:

1. **Identify the corruption pattern**
2. **Choose appropriate recovery method**
3. **Implement fixes carefully**
4. **Test thoroughly before deployment**
5. **Implement prevention measures**

The key is to remain methodical and use version control effectively to minimize data loss and downtime.

---

*This guide is part of the LeadFive DApp development documentation. Keep it updated as new corruption patterns are discovered and resolved.*
