# 🚀 LEAD FIVE - DigitalOcean Deployment Guide

Complete guide for deploying LEAD FIVE Web3 Crowdfunding Platform to DigitalOcean App Platform.

## 📋 Prerequisites

- DigitalOcean account
- GitHub repository with LEAD FIVE code
- Domain name (optional but recommended)
- BSC wallet with BNB for contract deployment

## 🎯 Deployment Overview

### Phase 1: Smart Contract Deployment
1. Deploy LeadFive contract to BSC Mainnet
2. Verify contract on BSCScan
3. Update frontend configuration

### Phase 2: DigitalOcean Setup
1. Create App Platform application
2. Configure environment variables
3. Set up custom domain and SSL
4. Deploy and test

## 🔧 Phase 1: Smart Contract Deployment

### Step 1: Prepare Environment

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Step 2: Configure Deployment

Edit `.env` file:
```env
# BSC Mainnet Configuration
PRIVATE_KEY=your_private_key_here
BSC_RPC_URL=https://bsc-dataseed.binance.org/
ETHERSCAN_API_KEY=your_bscscan_api_key
```

### Step 3: Deploy Contract

```bash
# Compile contracts
npx hardhat compile

# Deploy to BSC Mainnet
npx hardhat run scripts/deploy-leadfive.js --network bsc

# Verify on BSCScan
npx hardhat verify --network bsc DEPLOYED_CONTRACT_ADDRESS
```

### Step 4: Update Frontend Configuration

After deployment, update `src/contracts-leadfive.js` with the new contract address:

```javascript
export const LEAD_FIVE_CONFIG = {
    address: "YOUR_DEPLOYED_CONTRACT_ADDRESS",
    implementationAddress: "IMPLEMENTATION_ADDRESS",
    // ... rest of config
};
```

## 🌊 Phase 2: DigitalOcean Deployment

### Step 1: Create DigitalOcean App

1. **Login to DigitalOcean**
   - Go to [DigitalOcean Console](https://cloud.digitalocean.com)
   - Navigate to "Apps" section

2. **Create New App**
   - Click "Create App"
   - Choose "GitHub" as source
   - Select your LEAD FIVE repository
   - Choose main/master branch

### Step 2: Configure Build Settings

**App Spec Configuration:**
```yaml
name: lead-five
services:
- name: web
  source_dir: /
  github:
    repo: your-username/leadfive
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  health_check:
    http_path: /health
  envs:
  - key: NODE_ENV
    value: production
  - key: VITE_CONTRACT_ADDRESS
    value: YOUR_DEPLOYED_CONTRACT_ADDRESS
  - key: VITE_NETWORK_ID
    value: "56"
  - key: VITE_CHAIN_ID
    value: "56"
```

### Step 3: Environment Variables

Set these environment variables in DigitalOcean:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `VITE_CONTRACT_ADDRESS` | `0x...` | LeadFive contract address |
| `VITE_NETWORK_ID` | `56` | BSC Mainnet ID |
| `VITE_CHAIN_ID` | `56` | BSC Chain ID |
| `VITE_RPC_URL` | `https://bsc-dataseed.binance.org/` | BSC RPC endpoint |
| `VITE_BLOCK_EXPLORER` | `https://bscscan.com` | Block explorer URL |

### Step 4: Custom Domain Setup (Optional)

1. **Add Domain**
   - Go to App settings
   - Click "Domains"
   - Add your custom domain

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: www (or @)
   Value: your-app-name.ondigitalocean.app
   ```

3. **SSL Certificate**
   - DigitalOcean automatically provisions SSL
   - Wait for certificate validation

### Step 5: Deploy Application

1. **Trigger Deployment**
   - Click "Deploy" in DigitalOcean console
   - Monitor build logs for any errors

2. **Verify Deployment**
   - Check application URL
   - Test Web3 wallet connections
   - Verify contract interactions

## 🔍 Testing Checklist

### Frontend Testing
- [ ] Application loads successfully
- [ ] Web3 wallet connection works
- [ ] Contract address is correct
- [ ] Network detection works (BSC Mainnet)
- [ ] User registration flow
- [ ] Package selection and payment
- [ ] Dashboard functionality

### Smart Contract Testing
- [ ] Contract is verified on BSCScan
- [ ] Admin functions work
- [ ] User registration works
- [ ] Package upgrades work
- [ ] Withdrawal functionality
- [ ] Pool distributions

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check build logs in DigitalOcean console
# Common fixes:
- Ensure all dependencies are in package.json
- Check Node.js version compatibility
- Verify environment variables
```

**Web3 Connection Issues:**
```javascript
// Check network configuration
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
console.log('Current chain:', chainId);
```

**Contract Interaction Errors:**
```javascript
// Verify contract address and ABI
console.log('Contract address:', LEAD_FIVE_CONFIG.address);
console.log('Network ID:', LEAD_FIVE_CONFIG.chainId);
```

### Performance Optimization

**CDN Configuration:**
- Enable DigitalOcean Spaces CDN
- Configure asset caching
- Optimize image delivery

**Monitoring:**
- Set up application monitoring
- Configure alerts for downtime
- Monitor resource usage

## 📊 Production Monitoring

### Key Metrics to Monitor
- Application uptime
- Response times
- Error rates
- Contract transaction success
- User registration rates

### Logging
```javascript
// Add comprehensive logging
console.log('User action:', action);
console.log('Contract interaction:', result);
console.log('Error details:', error);
```

## 🔐 Security Considerations

### Environment Security
- Never commit private keys
- Use environment variables for sensitive data
- Enable 2FA on DigitalOcean account

### Application Security
- HTTPS enforced
- CORS properly configured
- Input validation on all forms
- Rate limiting for API calls

## 📈 Scaling Considerations

### Horizontal Scaling
- Increase instance count during high traffic
- Use load balancer for multiple instances
- Configure auto-scaling rules

### Database Scaling
- Monitor Supabase usage
- Optimize database queries
- Consider read replicas for high load

## 🎉 Go Live Checklist

### Pre-Launch
- [ ] Contract deployed and verified
- [ ] Frontend deployed successfully
- [ ] All tests passing
- [ ] Domain configured with SSL
- [ ] Monitoring set up
- [ ] Backup procedures in place

### Launch
- [ ] Announce to community
- [ ] Monitor for issues
- [ ] Be ready for support requests
- [ ] Track key metrics

### Post-Launch
- [ ] Monitor performance
- [ ] Gather user feedback
- [ ] Plan feature updates
- [ ] Scale as needed

## 📞 Support

### DigitalOcean Resources
- [App Platform Documentation](https://docs.digitalocean.com/products/app-platform/)
- [Community Forums](https://www.digitalocean.com/community)
- [Support Tickets](https://cloud.digitalocean.com/support)

### LEAD FIVE Resources
- Contract Address: `YOUR_DEPLOYED_ADDRESS`
- BSCScan: `https://bscscan.com/address/YOUR_DEPLOYED_ADDRESS`
- Frontend URL: `https://your-app.ondigitalocean.app`

---

**🚀 LEAD FIVE is now ready for production deployment on DigitalOcean!**

*Last updated: June 19, 2025*
