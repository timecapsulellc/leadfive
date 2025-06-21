# LeadFive Development Server - Troubleshooting Guide

## 🚨 Current Issues & Solutions

### 1. **426 Upgrade Required Error**
This error typically occurs when there's a WebSocket protocol mismatch or server configuration issue.

**Solution:**
```bash
# Kill any existing Vite processes
pkill -f vite

# Clear npm cache
npm cache clean --force

# Restart the development server
npm run dev
```

### 2. **WebSocket Events Module Issue**
The browser compatibility issue with Node.js `events` module has been resolved by implementing a custom SimpleEventEmitter.

**Fixed in:** `src/services/WebSocketService.js`

### 3. **Favicon 404 Errors**
The favicon exists but may not be properly served. This is a minor issue that doesn't affect functionality.

## 🔧 Quick Fixes

### Method 1: Clean Restart
```bash
cd "/Users/dadou/LEAD FIVE"
pkill -f vite
rm -rf node_modules/.vite
npm run dev
```

### Method 2: Alternative Port
```bash
npm run dev -- --port 3000
```

### Method 3: Force Clean Build
```bash
npm run build
npm run preview
```

## ✅ Verification Steps

1. **Check if server is running:**
   - Look for "Local: http://localhost:5173" in terminal
   - Check if port 5173 is accessible

2. **Verify features work:**
   - Navigate to `/dashboard` 
   - Navigate to `/genealogy`
   - Test the analytics view mode
   - Check mobile responsiveness

3. **Console warnings are expected:**
   - TSS setup messages (browser extension related)
   - Deprecation warnings from external libraries
   - These don't affect LeadFive functionality

## 🌐 Access URLs

- **Development:** http://localhost:5173
- **Alternative:** http://localhost:3000 (if using preview)
- **Network:** http://0.0.0.0:5173 (for mobile testing)

## 📱 Mobile Testing

To test on mobile devices on the same network:
1. Find your computer's IP address
2. Access: http://[YOUR_IP]:5173
3. Ensure firewall allows the connection

## 🎯 Expected Behavior

When working correctly, you should see:
- **Homepage:** Modern gradient background with navigation
- **Dashboard:** Feature-rich dashboard with charts and metrics
- **Genealogy:** Interactive tree view with multiple modes including analytics
- **Mobile:** Responsive design that adapts to screen size

## 🔍 Debug Information

The console output shows:
- ✅ WebSocket service warnings resolved
- ✅ Browser compatibility improvements
- ✅ Error boundary protection active
- ⚠️ Some external library deprecation warnings (normal)

## 📞 Support

If issues persist:
1. Check browser compatibility (Chrome, Firefox, Safari supported)
2. Verify Node.js version (18+ recommended)
3. Clear browser cache and cookies
4. Try incognito/private browsing mode
