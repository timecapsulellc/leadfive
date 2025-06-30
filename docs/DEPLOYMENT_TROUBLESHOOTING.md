# 🔧 LEADFIVE DEPLOYMENT TROUBLESHOOTING GUIDE

**Repository**: `git@github.com:timecapsulellc/LeadFive.git`  
**Domain**: `leadfive.today`  
**Updated**: 2025-06-20 01:05 UTC+5.5

---

## 🚨 **COMMON DEPLOYMENT ERRORS FIXED**

### **Error 1: "failed to launch: determine start command"**
```
ERROR: failed to launch: determine start command: when there is no default process a command is required
```

**✅ SOLUTION IMPLEMENTED:**
- ✅ **Fixed package.json**: Added proper `start` script
- ✅ **Fixed Dockerfile**: Corrected CMD instruction
- ✅ **Added vite.config.js**: Proper Vite configuration

### **Error 2: "Readiness probe failed: dial tcp connection refused"**
```
ERROR failed health checks after 1 attempts with error Readiness probe failed: dial tcp 10.244.219.229:8080: connect: connection refused
```

**✅ SOLUTION IMPLEMENTED:**
- ✅ **Fixed health check**: Changed from curl to wget
- ✅ **Fixed port mapping**: Added proper port exposure
- ✅ **Fixed health endpoint**: Corrected health check URL

### **Error 3: "component terminated with non-zero exit code: 190"**
```
ERROR component terminated with non-zero exit code: 190
```

**✅ SOLUTION IMPLEMENTED:**
- ✅ **Fixed dependencies**: Removed nginx from app container
- ✅ **Fixed build process**: Corrected multi-stage build
- ✅ **Fixed permissions**: Proper user and file permissions

---

## 📦 **UPDATED CONFIGURATION FILES**

### **✅ package.json (CREATED)**
```json
{
  "name": "leadfive",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5173",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 3000",
    "start": "vite preview --host 0.0.0.0 --port 3000"
  }
}
```

### **✅ vite.config.js (CREATED)**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  preview: {
    host: '0.0.0.0',
    port: 3000
  }
})
```

### **✅ Dockerfile (FIXED)**
```dockerfile
# Fixed CMD instruction
CMD ["npm", "start"]

# Fixed health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Added wget for health checks
RUN apk add --no-cache curl wget dumb-init
```

### **✅ docker-compose.yml (FIXED)**
```yaml
leadfive-app:
  ports:
    - "3000:3000"  # Added port mapping
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
```

---

## 🚀 **DEPLOYMENT COMMANDS (UPDATED)**

### **Step 1: Clone Repository**
```bash
git clone git@github.com:timecapsulellc/LeadFive.git
cd LeadFive
```

### **Step 2: Configure Environment**
```bash
cp .env.example .env
nano .env
```

**Required Environment Variables:**
```bash
VITE_CONTRACT_ADDRESS=0x7FEEA22942407407801cCDA55a4392f25975D998
VITE_NETWORK_ID=56
DOMAIN=leadfive.today
SSL_EMAIL=your_email@example.com
```

### **Step 3: Build and Deploy**
```bash
# Build the application
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### **Step 4: Verify Deployment**
```bash
# Check application logs
docker-compose logs leadfive-app

# Check nginx logs
docker-compose logs nginx

# Test application
curl http://localhost:3000
```

---

## 🔍 **DEBUGGING COMMANDS**

### **Container Status**
```bash
# Check all containers
docker-compose ps

# Check specific container
docker-compose logs -f leadfive-app

# Enter container for debugging
docker-compose exec leadfive-app sh
```

### **Health Check Testing**
```bash
# Test health check manually
docker-compose exec leadfive-app wget --no-verbose --tries=1 --spider http://localhost:3000/

# Check port binding
docker-compose exec leadfive-app netstat -tlnp
```

### **Build Debugging**
```bash
# Build with verbose output
docker-compose build --no-cache --progress=plain

# Test build locally
docker build --target production -t leadfive:test .
docker run -p 3000:3000 leadfive:test
```

---

## 🛠️ **COMMON FIXES**

### **Fix 1: Port Issues**
```bash
# Check if port 3000 is available
lsof -i :3000

# Kill process using port 3000
sudo kill -9 $(lsof -t -i:3000)
```

### **Fix 2: Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### **Fix 3: Docker Issues**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Reset Docker Compose
docker-compose down -v
docker-compose up -d
```

### **Fix 4: Node.js Issues**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 **MONITORING & LOGS**

### **Real-time Monitoring**
```bash
# Watch all logs
docker-compose logs -f

# Watch specific service
docker-compose logs -f leadfive-app

# Monitor resource usage
docker stats
```

### **Log Locations**
```bash
# Application logs
docker-compose logs leadfive-app

# Nginx logs
docker-compose logs nginx

# System logs
journalctl -u docker
```

---

## 🔧 **ADVANCED TROUBLESHOOTING**

### **Network Issues**
```bash
# Check network connectivity
docker network ls
docker network inspect leadfive_leadfive-network

# Test internal connectivity
docker-compose exec leadfive-app ping nginx
```

### **SSL Issues**
```bash
# Check SSL certificate
docker-compose logs certbot

# Manually request certificate
docker-compose exec certbot certbot certonly --webroot --webroot-path=/var/www/html --email your_email@example.com --agree-tos --no-eff-email -d leadfive.today
```

### **Performance Issues**
```bash
# Check resource usage
docker stats

# Check disk space
df -h

# Check memory usage
free -h
```

---

## ✅ **VERIFICATION CHECKLIST**

### **Pre-Deployment**
- [ ] **Environment file**: `.env` configured with correct values
- [ ] **Domain DNS**: `leadfive.today` points to server IP
- [ ] **Ports available**: 80, 443, 3000 not in use
- [ ] **Docker installed**: Docker and Docker Compose working

### **Post-Deployment**
- [ ] **Containers running**: All services show "Up" status
- [ ] **Health checks passing**: No failed health checks
- [ ] **Application accessible**: `http://localhost:3000` responds
- [ ] **SSL working**: HTTPS certificate valid
- [ ] **Logs clean**: No error messages in logs

### **Production Ready**
- [ ] **Domain accessible**: `https://leadfive.today` loads
- [ ] **SSL certificate**: Valid and trusted
- [ ] **Performance**: Page loads < 3 seconds
- [ ] **Mobile responsive**: Works on mobile devices
- [ ] **Contract connection**: Web3 connects to BSC

---

## 🆘 **EMERGENCY PROCEDURES**

### **Quick Restart**
```bash
# Restart all services
docker-compose restart

# Force restart with rebuild
docker-compose down
docker-compose up -d --build
```

### **Rollback Deployment**
```bash
# Stop current deployment
docker-compose down

# Checkout previous version
git checkout HEAD~1

# Redeploy
docker-compose up -d --build
```

### **Emergency Stop**
```bash
# Stop all services
docker-compose down

# Stop and remove everything
docker-compose down -v --remove-orphans
```

---

## 📞 **SUPPORT INFORMATION**

### **Quick Commands Reference**
```bash
# Status check
docker-compose ps && curl -I http://localhost:3000

# Full restart
docker-compose down && docker-compose up -d

# View logs
docker-compose logs -f --tail=50

# Health check
docker-compose exec leadfive-app wget --spider http://localhost:3000/
```

### **Configuration Files**
- **Main Config**: `docker-compose.yml`
- **App Config**: `package.json`, `vite.config.js`
- **Container Config**: `Dockerfile`
- **Web Server**: `nginx.conf`
- **Environment**: `.env`

---

## 🎯 **DEPLOYMENT SUCCESS INDICATORS**

### **✅ All Systems Operational**
```bash
# Expected output from docker-compose ps:
NAME                 COMMAND                  SERVICE             STATUS              PORTS
leadfive-frontend    "dumb-init -- npm st…"   leadfive-app        Up (healthy)        0.0.0.0:3000->3000/tcp
leadfive-nginx       "/docker-entrypoint.…"   nginx               Up (healthy)        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
leadfive-certbot     "certbot certonly --…"   certbot             Exited (0)
```

### **✅ Application Responding**
```bash
# Expected response:
curl -I http://localhost:3000
HTTP/1.1 200 OK
Content-Type: text/html
```

---

**🎊 DEPLOYMENT ISSUES RESOLVED! 🎊**

**All common deployment errors have been fixed and the LeadFive application is now ready for successful deployment on DigitalOcean.**

---

**Updated**: 2025-06-20 01:05 UTC+5.5  
**Status**: ✅ **DEPLOYMENT ISSUES FIXED**  
**Repository**: `git@github.com:timecapsulellc/LeadFive.git`
