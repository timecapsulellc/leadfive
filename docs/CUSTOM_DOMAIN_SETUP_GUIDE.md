# 🌐 CUSTOM DOMAIN SETUP - LEADFIVE.TODAY

## ✅ **CURRENT STATUS**
- **Working Production URL**: https://leadfive-app-3f8tb.ondigitalocean.app ✅
- **Target Custom Domain**: leadfive.today ⏳
- **SSL Certificate**: Automatically provided by DigitalOcean ✅

---

## 🔧 **DNS CONFIGURATION REQUIRED**

### **Step 1: Add Domain to DigitalOcean App**
1. Go to DigitalOcean App Platform
2. Select your LeadFive app
3. Go to "Settings" → "Domains"
4. Click "Add Domain"
5. Enter: `leadfive.today`
6. Click "Add Domain"

### **Step 2: Configure DNS Records**
Add these DNS records at your domain registrar (where you bought leadfive.today):

```dns
Type: CNAME
Name: @  (or leave blank for root domain)
Value: leadfive-app-3f8tb.ondigitalocean.app
TTL: 300 (or automatic)

Type: CNAME  
Name: www
Value: leadfive-app-3f8tb.ondigitalocean.app
TTL: 300 (or automatic)
```

### **Step 3: Verify DNS Propagation**
After adding DNS records, check propagation:
```bash
# Check DNS propagation
nslookup leadfive.today
dig leadfive.today CNAME

# Should return: leadfive-app-3f8tb.ondigitalocean.app
```

---

## ⏱️ **EXPECTED TIMELINE**
- **DNS Propagation**: 15 minutes - 24 hours
- **SSL Certificate**: Automatic after DNS resolves
- **Domain Active**: Usually within 1-2 hours

---

## 🔍 **TROUBLESHOOTING**

### **Common Issues**
1. **DNS Not Propagating**: Wait up to 24 hours
2. **SSL Certificate Pending**: Wait for DNS to fully propagate
3. **404 Error**: Check CNAME record points to correct DigitalOcean URL

### **Verification Commands**
```bash
# Test if domain resolves
curl -I https://leadfive.today

# Check CNAME record
dig leadfive.today CNAME

# Check from different locations
nslookup leadfive.today 8.8.8.8
```

---

## 🚀 **CURRENT WORKING LINKS**

**Use these URLs until custom domain is configured:**

- **Production App**: https://leadfive-app-3f8tb.ondigitalocean.app
- **Registration**: https://leadfive-app-3f8tb.ondigitalocean.app/register
- **Packages**: https://leadfive-app-3f8tb.ondigitalocean.app/packages
- **Withdrawals**: https://leadfive-app-3f8tb.ondigitalocean.app/withdrawals
- **Genealogy**: https://leadfive-app-3f8tb.ondigitalocean.app/genealogy

**All functions are working perfectly on the DigitalOcean URL!**

---

## ✅ **IMMEDIATE ACTION ITEMS**

1. **Configure DNS records** at your domain registrar
2. **Add custom domain** in DigitalOcean App Platform
3. **Wait for propagation** (15 minutes - 24 hours)
4. **Test custom domain** once DNS resolves

The LeadFive platform is **fully functional and ready for business** at the DigitalOcean URL. The custom domain setup is just a DNS configuration step.
