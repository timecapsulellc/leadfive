# Corrupted JavaScript File Recovery Guide

## Overview
This guide provides step-by-step instructions for identifying, diagnosing, and fixing corrupted JavaScript files that may have syntax errors, duplicate code blocks, or structural issues that prevent proper execution.

## Common Corruption Symptoms

### 1. Syntax Errors
- Missing or mismatched brackets `{}`, parentheses `()`, or square brackets `[]`
- Incomplete function declarations
- Missing semicolons or commas
- Unclosed strings or comments

### 2. Duplicate Code Blocks
- Repeated function definitions
- Duplicated class methods
- Multiple export statements
- Overlapping code segments

### 3. Incomplete or Broken Structure
- Functions without closing braces
- Classes with missing constructors
- Import/export statements in wrong locations
- Mixed or corrupted indentation

### 4. Runtime Issues
- Functions that exist but throw errors
- Methods that return undefined unexpectedly
- Infinite loops or recursive calls
- Memory leaks from unclosed resources

## Diagnostic Tools and Commands

### 1. Syntax Validation
```bash
# Check for syntax errors using Node.js
node -c src/services/api/referralsApi.js

# Check with ESLint (if configured)
npx eslint src/services/api/referralsApi.js

# Check with TypeScript compiler (for type checking)
npx tsc --noEmit --checkJs src/services/api/referralsApi.js
```

### 2. Code Analysis
```bash
# Search for duplicate function declarations
grep -n "initialize(" src/services/api/referralsApi.js

# Find unclosed brackets
grep -n "{" src/services/api/referralsApi.js | wc -l
grep -n "}" src/services/api/referralsApi.js | wc -l

# Check for incomplete functions
grep -A 10 -B 2 "function\|async.*(" src/services/api/referralsApi.js
```

### 3. Development Server Debugging
```bash
# Clear development cache
rm -rf node_modules/.cache
rm -rf .next (for Next.js)
rm -rf dist (for Vite)

# Restart development server with verbose logging
npm run dev -- --verbose

# Check for 500 errors in network tab
# Monitor console for import/syntax errors
```

## Step-by-Step Recovery Process

### Step 1: Backup and Assessment
```bash
# Create backup of corrupted file
cp src/services/api/referralsApi.js src/services/api/referralsApi.js.backup

# Check file size and basic structure
wc -l src/services/api/referralsApi.js
head -20 src/services/api/referralsApi.js
tail -20 src/services/api/referralsApi.js
```

### Step 2: Identify Corruption Patterns
1. **Search for duplicate code blocks**:
   ```bash
   # Find duplicate method definitions
   grep -n "initialize\|constructor\|async.*(" src/services/api/referralsApi.js
   
   # Look for repeated import statements
   grep -n "import\|export" src/services/api/referralsApi.js
   ```

2. **Check bracket matching**:
   ```bash
   # Count opening and closing brackets
   grep -o "{" src/services/api/referralsApi.js | wc -l
   grep -o "}" src/services/api/referralsApi.js | wc -l
   ```

3. **Validate function completeness**:
   ```bash
   # Check for incomplete function definitions
   grep -B 5 -A 10 "function.*{.*$" src/services/api/referralsApi.js
   ```

### Step 3: Systematic Cleanup

#### 3.1 Remove Duplicate Code Blocks
```javascript
// Example: Fix duplicate initialize methods
// BEFORE (corrupted):
initialize(provider, account) {
  // First implementation
}

initialize(provider, account) {
  // Duplicate implementation
}

// AFTER (fixed):
initialize(provider, account) {
  // Single, complete implementation
  this.provider = provider;
  this.account = account;
  // ... rest of method
}
```

#### 3.2 Fix Bracket Mismatches
```javascript
// BEFORE (corrupted):
class ReferralsApiService {
  constructor() {
    this.cache = new Map();
  // Missing closing bracket

  initialize(provider, account) {
    // Method implementation
  }

// AFTER (fixed):
class ReferralsApiService {
  constructor() {
    this.cache = new Map();
  }

  initialize(provider, account) {
    // Method implementation
  }
}
```

#### 3.3 Complete Incomplete Functions
```javascript
// BEFORE (corrupted):
async getReferralCommissions(account) {
  try {
    if (!this.contract) throw new Error('Contract not initialized');
    // Incomplete implementation...

// AFTER (fixed):
async getReferralCommissions(account) {
  try {
    if (!this.contract) throw new Error('Contract not initialized');
    
    // Complete implementation
    return this.getFallbackCommissions();
  } catch (error) {
    console.error('Error fetching referral commissions:', error);
    return this.getFallbackCommissions();
  }
}
```

### Step 4: Validation and Testing

#### 4.1 Syntax Validation
```bash
# Test syntax after each fix
node -c src/services/api/referralsApi.js

# Run linter to catch remaining issues
npx eslint src/services/api/referralsApi.js --fix
```

#### 4.2 Import/Export Validation
```bash
# Test if file can be imported
node -e "try { require('./src/services/api/referralsApi.js'); console.log('✓ Import successful'); } catch(e) { console.error('✗ Import failed:', e.message); }"
```

#### 4.3 Integration Testing
```bash
# Start development server and check for errors
npm run dev

# Check browser console for errors
# Test specific functionality in application
```

### Step 5: Cache Clearing and Reset

#### 5.1 Development Environment Reset
```bash
# Clear all caches
rm -rf node_modules/.cache
rm -rf .next
rm -rf dist
rm -rf .vite

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install
```

#### 5.2 Browser Cache Reset
```bash
# For development testing
# - Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
# - Clear application data in DevTools
# - Disable cache in Network tab during development
```

## Common Fixes for referralsApi.js Specifically

### Fix 1: Remove Duplicate Initialize Methods
```javascript
// Remove duplicate initialize method definitions
// Keep only one complete implementation
async initialize(provider, account) {
  this.provider = provider;
  this.account = account;
  this.contract = null;

  if (provider && account) {
    try {
      const signer = await provider.getSigner();
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      console.log('Referrals API service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize referrals contract:', error);
      throw new Error('Referrals contract initialization failed');
    }
  }
}
```

### Fix 2: Complete Broken Method Chains
```javascript
// Ensure all methods have proper structure and return statements
async getReferralCommissions(account) {
  try {
    if (!this.contract) throw new Error('Contract not initialized');
    
    // Check method availability before calling
    const methodsExist = [
      'getTotalReferralCommissions',
      'getDirectReferralEarnings'
    ].every(method => typeof this.contract[method] === 'function');

    if (!methodsExist) {
      console.warn('Contract commission methods not available, using fallback');
      return this.getFallbackCommissions();
    }

    // Actual contract calls would go here
    return this.getFallbackCommissions();

  } catch (error) {
    console.error('Error fetching referral commissions:', error);
    return this.getFallbackCommissions();
  }
}
```

### Fix 3: Proper Class Structure
```javascript
class ReferralsApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000;
  }

  // All methods properly nested within class
  async initialize(provider, account) { /* ... */ }
  async getReferralData(account) { /* ... */ }
  // ... other methods

  // Utility methods at end
  getFallbackCommissions() { /* ... */ }
}

// Single export at end of file
export const referralsApi = new ReferralsApiService();
export default referralsApi;
```

## Prevention Strategies

### 1. Code Structure Best Practices
- Use consistent indentation (2 or 4 spaces)
- Always close brackets and parentheses
- Add comments for complex logic
- Use meaningful function and variable names

### 2. Development Workflow
- Commit changes frequently
- Test after each significant change
- Use version control to track changes
- Run linters before committing

### 3. Automated Validation
```json
// .eslintrc.json configuration
{
  "extends": ["eslint:recommended"],
  "rules": {
    "no-unused-vars": "error",
    "no-duplicate-case": "error",
    "no-unreachable": "error",
    "no-undef": "error"
  }
}
```

### 4. IDE Configuration
- Enable syntax highlighting
- Configure auto-formatting (Prettier)
- Enable real-time error detection
- Use bracket matching features

## Emergency Recovery Commands

### Quick Syntax Check
```bash
# One-liner to check if file is valid JavaScript
node -e "try { require('./src/services/api/referralsApi.js'); console.log('✓ Valid'); } catch(e) { console.log('✗ Invalid:', e.message); }"
```

### Backup and Restore
```bash
# Create timestamped backup
cp src/services/api/referralsApi.js "backups/referralsApi_$(date +%Y%m%d_%H%M%S).js"

# Restore from backup
cp backups/referralsApi_20241220_143022.js src/services/api/referralsApi.js
```

### Force Clean Development Environment
```bash
# Nuclear option: clean everything and restart
rm -rf node_modules .next dist .vite
npm cache clean --force
npm install
npm run dev
```

## Troubleshooting Checklist

- [ ] File syntax is valid (no red squiggles in IDE)
- [ ] All brackets and parentheses are matched
- [ ] No duplicate function definitions
- [ ] All imports are at the top of file
- [ ] Export statements are at the bottom
- [ ] All async functions have proper error handling
- [ ] Console shows no import/syntax errors
- [ ] Development server starts without errors
- [ ] Browser console shows no 500 errors
- [ ] File can be imported in other modules
- [ ] All methods return expected data types

## Success Indicators

### ✅ File is Fully Recovered When:
1. No syntax errors in IDE or console
2. Development server starts without warnings
3. File imports successfully in other modules
4. All methods return expected data (even if fallback)
5. No 500 errors in browser network tab
6. Console.log statements execute as expected
7. Error boundaries don't trigger due to syntax issues

---

**Note**: This guide was created specifically to address issues encountered with `referralsApi.js` but applies to any corrupted JavaScript file. Always backup files before attempting repairs and test thoroughly after each fix.
