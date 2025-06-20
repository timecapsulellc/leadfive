# LeadFive Domain Setup Checklist

## ✅ Domain Configuration Steps

### 1. DigitalOcean App Platform
- [ ] Add `leadfive.today` as custom domain
- [ ] Add `www.leadfive.today` as custom domain
- [ ] Wait for SSL certificates (auto-generated)

### 2. DNS Configuration
- [ ] Add A/CNAME records as provided by DigitalOcean
- [ ] Verify DNS propagation (use https://dnschecker.org)
- [ ] Test both www and non-www versions

### 3. Application Updates
- [ ] Update all hardcoded URLs to use `leadfive.today`
- [ ] Update meta tags with proper domain
- [ ] Update social sharing images
- [ ] Update sitemap.xml

### 4. Smart Contract Integration
- [ ] Verify contract address is correct
- [ ] Test wallet connections on live domain
- [ ] Verify all contract functions work

### 5. Final Testing
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Test wallet connections (MetaMask, Trust Wallet)
- [ ] Verify SSL certificate is working
- [ ] Check all routes work properly

## 📝 DNS Records to Add

```
Type: A
Name: @
Value: [Get from DigitalOcean]
TTL: 3600

Type: A  
Name: www
Value: [Get from DigitalOcean]
TTL: 3600
```

## 🔗 Important URLs
- Live Site: https://leadfive.today
- DigitalOcean App: https://cloud.digitalocean.com/apps/[your-app-id]
- Contract: https://bscscan.com/address/0x742d35Cc6634C0532925a3b8D398389b7aaB0F7d
