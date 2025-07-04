# Cloudflare Setup Guide for LeadFive Production

## Overview
This guide helps you configure Cloudflare credentials in your `.env` file for production deployment automation.

## Step 1: Get Your Cloudflare API Token

1. **Login to Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com/
   - Login with your Cloudflare account

2. **Create API Token**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use "Custom token" template
   - **Permissions needed:**
     - `Zone:Edit` - for DNS management
     - `Zone:Read` - for reading zone information
     - `Page Rules:Edit` - for redirect rules (optional)
   - **Zone Resources:**
     - Include: `leadfive.today` (or "All zones" if you prefer)
   - Click "Continue to summary" then "Create Token"
   - **COPY THE TOKEN** - you won't see it again!

## Step 2: Get Your Zone ID

1. **Navigate to Domain Overview**
   - In Cloudflare dashboard, click on your domain `leadfive.today`
   - Look at the right sidebar under "API"
   - Copy the **Zone ID**

## Step 3: Get Your Account ID

1. **Navigate to Dashboard Home**
   - Go back to main Cloudflare dashboard
   - Look at the right sidebar under "Account details"
   - Copy the **Account ID**

## Step 4: Update Your .env File

Replace these placeholders in your `.env` file:

```env
# Replace with your actual values:
CLOUDFLARE_API_TOKEN=your_actual_api_token_here
CLOUDFLARE_ZONE_ID=your_actual_zone_id_here  
CLOUDFLARE_ACCOUNT_ID=your_actual_account_id_here
```

## Step 5: Verify Configuration

Run this command to test your Cloudflare setup:

```bash
npm run cloudflare-test
```

## Security Notes

- ⚠️ **NEVER commit the real API token to Git**
- Store the API token securely (consider using a password manager)
- The API token has zone-level permissions - treat it like a password
- You can regenerate the token anytime if compromised

## DNS Configuration for Production

Once configured, you'll be able to manage these DNS records via automation:

- `leadfive.today` → Frontend (Vercel/Netlify)
- `api.leadfive.today` → Backend API server
- `ws.leadfive.today` → WebSocket server

## Troubleshooting

- **Invalid API token**: Check the token has correct permissions
- **Zone not found**: Verify the Zone ID is correct
- **API rate limits**: Cloudflare has rate limits for API calls

## Next Steps

After configuring Cloudflare:
1. Test the configuration with the verification script
2. Set up automated DNS management for deployments
3. Configure SSL/TLS settings for your subdomains
4. Enable security features (firewall rules, DDoS protection)
