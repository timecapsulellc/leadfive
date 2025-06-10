# 🚀 OrphiCrowdFund Production Deployment Guide

## Pre-Deployment Checklist ✅

### 1. Security Verification
- ✅ Smart contract security audit completed
- ✅ Frontend security review completed  
- ✅ Environment variables secured
- ✅ Private keys secured (not in version control)

### 2. Code Quality
- ✅ All tests passing
- ✅ Code linting completed
- ✅ Production build successful (121.54 kB - under 500KB target)
- ✅ Browser compatibility tested
- ✅ Environment variable error fixed (VITE_ → REACT_APP_)

### 3. Configuration
- ✅ Environment files configured (.env.mainnet)
- ✅ Contract deployment script ready
- ✅ Gas optimization completed
- ✅ RPC endpoints configured

## Deployment Steps

### Step 1: Prepare Mainnet Environment

1. **Copy and configure mainnet environment:**
   ```bash
   cp .env.mainnet .env
   # Edit .env with your actual values:
   # - DEPLOYER_PRIVATE_KEY (without 0x prefix)
   # - BSCSCAN_API_KEY
   # - ADMIN_RESERVE address
   # - MATRIX_ROOT address
   ```

2. **Verify deployer account has sufficient BNB:**
   ```bash
   # Check balance (needs at least 0.1 BNB for deployment)
   npx hardhat run scripts/check-balance.js --network bscMainnet
   ```

### Step 2: Deploy Smart Contract

1. **Deploy to BSC Mainnet:**
   ```bash
   npx hardhat run scripts/deploy-mainnet.js --network bscMainnet
   ```

2. **Verify deployment info:**
   - Contract address will be saved to `deployment-mainnet.json`
   - Verification on BSCScan will be automatic
   - Note down the contract address for frontend configuration

### Step 3: Configure Frontend

1. **Update environment variables:**
   ```bash
   # Update .env with actual contract address
   REACT_APP_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
   ```

2. **Build production frontend:**
   ```bash
   npm run build
   ```

3. **Test production build locally:**
   ```bash
   npm install -g serve
   serve -s build -p 3000
   ```
- Components render correctly
- No console errors appear
- Performance is acceptable

## Step 4: Run Browser Compatibility Tests

Test the application in different browsers:

```bash
# Run compatibility tests
npm run test:compatibility
```

This will inject a compatibility testing script and show a banner indicating compatibility status.

## Step 5: Deploy to Production Server

```bash
# Example deployment to a server (customize as needed)
npm run build
cp -r dist/* /path/to/production/server/
```

## Step 6: Post-Deployment Verification

After deploying to production, perform these checks:

- [ ] Verify all components load correctly
- [ ] Test user flows and interactions
- [ ] Check network requests and load times
- [ ] Verify API connections (if applicable)
- [ ] Test on multiple devices and browsers

## Troubleshooting

### Common Issues

#### 1. Blank screen in production build

Check for:
- JavaScript errors in the console
- Missing dependencies
- Environment variables

#### 2. Styling differences between development and production

Check for:
- CSS purging issues
- Browser-specific CSS
- Missing vendor prefixes

#### 3. Performance issues

Use the performance profiling script:

```bash
npm run test:performance
```

Review the output for optimization opportunities.

## Maintenance

- Regularly update dependencies with `npm update`
- Run performance tests after significant changes
- Maintain browser compatibility testing

## Contact

For assistance with deployment issues, contact the OrphiChain Development Team.
