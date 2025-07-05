# 📦 LeadFive: Codebase Cleanup Action Plan

> **Date:** July 5, 2025  
> **Status:** Ready for Execution  
> **Priority:** High

This document provides specific, actionable steps to clean up the LeadFive codebase and prepare it for production deployment. Following these steps will significantly improve code maintainability, reduce bundle size, and ensure a cleaner, more professional codebase.

## 🔍 Identified Issues to Address

1. **Unused Files & Assets**: Multiple unused scripts, components, and test files that are no longer needed
2. **Duplicate Components**: Several components with similar functionality exist in different locations
3. **Hardcoded Data**: Mock/dummy data embedded in components that should be replaced with dynamic data
4. **Console Logs**: Debugging logs still present throughout the codebase
5. **Outdated Comments**: TODO comments and other notes that are no longer relevant
6. **Inconsistent Formatting**: Some files still have formatting inconsistencies

## 📋 Step-by-Step Cleanup Process

### Phase 1: Archive Unused Files (1-2 Hours)

```bash
# Run these commands to create archive directory and move files
mkdir -p _archive/components _archive/scripts _archive/styles _archive/pages _archive/services
```

#### Files to Archive (Move to `_archive/` Directory)

1. **Unused Scripts**:
   - `add-dashboard-patterns.sh`
   - `ai-integration-verify.cjs`
   - `ai-integration-verify.js`
   - `ai-verification.js`
   - `browser-testing-script.js`
   - `build.sh`
   - `check-env.sh`
   - `cleanup-repository.sh`
   - `clear-dev-cache.sh`

2. **Unused Components**:
   - `src/components/UnifiedChatbot_emergency.jsx`
   - `src/components/UnifiedWalletConnect-Fixed.jsx`
   - `src/components/enhanced/GenealogyTree_Original.jsx`
   - `src/components/NetworkTreeVisualization-LiveIntegration.jsx`
   - `src/components/NetworkTreeVisualization.examples.jsx`

3. **Duplicate/Old Pages**:
   - `src/pages/Dashboard_Original.css`
   - `src/pages/Dashboard_BrandAligned.css`
   - `src/pages/Referrals_New.jsx`
   - `src/pages/Referrals_Enhanced.css`

4. **Unused Main Files**:
   - `src/main-correct.jsx`
   - `src/main-original.jsx`
   - `src/main-simple.jsx`
   - `src/main-test.jsx`
   - `src/main-wrong-backup.jsx`

### Phase 2: Remove Hardcoded Mock Data (2-3 Hours)

1. **Dashboard Component Files**:
   - Replace all hardcoded user data and statistics with proper loading states
   - Look for arrays and objects defined directly in components
   - Common mock data includes:
     - Referral lists
     - Earnings statistics
     - Package information
     - User profiles

2. **Replace with Proper Loading States**:
   - Use the `SkeletonLoader` component during data fetching
   - Add proper error states for failed data fetching
   - Use the Zustand store selectors for data access

### Phase 3: Clean Up Console Logs and Debug Code (1 Hour)

```bash
# Command to find all console.log statements
grep -r "console.log" src/
```

1. **Remove console.log statements** in production code:
   - Focus on components, services, and utility files
   - Keep only essential error logging

2. **Remove debug conditions**:
   - Look for `if (DEBUG)` or similar development-only code
   - Remove or properly gate behind environment variables

### Phase 4: Code Style & Format Cleanup (1-2 Hours)

1. **Run linting and formatting tools**:
   ```bash
   npm run lint:fix
   npm run format
   ```

2. **Enforce consistent naming conventions**:
   - Component files should use PascalCase
   - Utility files should use camelCase
   - CSS modules should match their component name

3. **Add missing PropTypes** to all components:
   - Focus on core components first
   - Ensure all props are properly documented

### Phase 5: Update Documentation (2 Hours)

1. **Update README.md**:
   - Add clear installation instructions
   - Document environment variables
   - Add deployment steps

2. **Create CONTRIBUTING.md**:
   - Document code style guidelines
   - Explain the PR process
   - Describe testing requirements

3. **Update API Documentation**:
   - Document all API endpoints
   - Include request/response examples

## 🧪 Testing After Cleanup

After completing the cleanup, perform the following tests:

1. **Functionality Test**:
   ```bash
   npm run dev
   ```
   - Verify all core features work as expected
   - Check navigation between all sections
   - Test wallet connection

2. **Build Test**:
   ```bash
   npm run build
   ```
   - Ensure build completes without errors
   - Analyze bundle size improvements
   - Check for any missing assets

3. **Performance Test**:
   ```bash
   npm run analyze
   ```
   - Measure performance improvements
   - Verify bundle size reduction
   - Check for unused dependencies

## 🚀 Expected Results

After completing this cleanup plan, you should see:

- **Reduced Bundle Size**: ~20-30% smaller bundle size
- **Faster Build Times**: Quicker development and production builds
- **Improved Developer Experience**: Cleaner codebase, easier to navigate
- **Better Performance**: Faster initial load and rendering
- **Easier Maintenance**: More consistent code style and organization

## 👥 Ownership & Responsibilities

| Task | Owner | Deadline | Status |
|------|-------|----------|--------|
| Archive Unused Files | TBD | TBD | Not Started |
| Remove Mock Data | TBD | TBD | Not Started |
| Clean Console Logs | TBD | TBD | Not Started |
| Code Formatting | TBD | TBD | Not Started |
| Update Documentation | TBD | TBD | Not Started |

Remember to communicate any significant changes to the team and document your cleanup process for future reference.
