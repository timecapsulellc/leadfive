# 🚀 LeadFive - Advanced MLM Platform

**Live Platform**: [https://leadfive.today](https://leadfive.today)  
**Contract**: `0x7FEEA22942407407801cCDA55a4392f25975D998` (BSC Mainnet)  
**Network**: Binance Smart Chain (BSC)

---

## 📋 **Overview**

LeadFive is a cutting-edge Multi-Level Marketing (MLM) platform built on the Binance Smart Chain. It features a sophisticated matrix-based compensation plan, automated commission distribution, and a modern React-based user interface.

### **🎯 Key Features**

- ✅ **Smart Contract Based**: Fully decentralized on BSC
- ✅ **Matrix System**: 2x2 matrix with spillover mechanics
- ✅ **Multiple Packages**: $30, $50, $100, $200 USDT packages
- ✅ **Automated Commissions**: Real-time distribution
- ✅ **Pool Distributions**: Leader, Help, and Club pools
- ✅ **4× Earnings Cap**: Automatic reinvestment system
- ✅ **Mobile Responsive**: Works on all devices
- ✅ **Real-time Analytics**: Live dashboard and statistics

---

## 🏗️ **Architecture**

### **Smart Contract**
- **Language**: Solidity ^0.8.19
- **Framework**: Hardhat
- **Network**: BSC Mainnet
- **Token**: USDT (BEP-20)
- **Security**: Audited and tested

### **Frontend**
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Web3**: ethers.js v6
- **State Management**: React Context
- **Responsive**: Mobile-first design

### **Infrastructure**
- **Deployment**: Docker + Docker Compose
- **Web Server**: Nginx with SSL
- **SSL**: Let's Encrypt certificates
- **Monitoring**: Health checks and logging
- **Backup**: Automated daily backups

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Docker & Docker Compose
- BSC wallet (MetaMask recommended)
- USDT tokens for participation

### **Local Development**

```bash
# Clone the repository
git clone https://github.com/timecapsulellc/LeadFive.git
cd LeadFive

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure environment variables
nano .env

# Start development server
npm run dev
```

### **Production Deployment**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production deployment instructions.

```bash
# Quick production deployment
docker-compose up -d

# Check status
docker-compose ps
```

---

## 💰 **Compensation Plan**

### **Package Structure**
| Package | Price | Direct Bonus | Level Bonus | Matrix Bonus |
|---------|-------|--------------|-------------|--------------|
| Basic   | $30   | 10%          | 5%          | 85%          |
| Silver  | $50   | 10%          | 5%          | 85%          |
| Gold    | $100  | 10%          | 5%          | 85%          |
| Platinum| $200  | 10%          | 5%          | 85%          |

### **Matrix System**
- **Structure**: 2×2 matrix (2 direct, 6 total positions)
- **Spillover**: Automatic placement system
- **Cycling**: Matrix completion triggers new matrix
- **Earnings Cap**: 4× package price maximum

### **Pool Distributions**
- **Leader Pool**: 2% of all transactions
- **Help Pool**: 1% of all transactions  
- **Club Pool**: 1% of all transactions
- **Distribution**: Weekly to qualified members

---

## 🔧 **Technical Specifications**

### **Smart Contract Features**
- **Modular Architecture**: Upgradeable design
- **Gas Optimized**: Efficient transaction costs
- **Security Features**: Pause, blacklist, emergency controls
- **Admin Functions**: Fee management, user management
- **Event Logging**: Comprehensive transaction tracking

### **Frontend Features**
- **Wallet Integration**: MetaMask, WalletConnect
- **Real-time Updates**: Live transaction monitoring
- **Responsive Design**: Mobile and desktop optimized
- **Multi-language**: Internationalization ready
- **Analytics Dashboard**: Comprehensive statistics

### **Security Features**
- **Smart Contract Audited**: Professional security audit
- **Rate Limiting**: API protection
- **SSL/TLS**: End-to-end encryption
- **Input Validation**: XSS and injection protection
- **Access Control**: Role-based permissions

---

## 📊 **Contract Information**

### **Mainnet Deployment**
- **Contract Address**: `0x7FEEA22942407407801cCDA55a4392f25975D998`
- **Network**: BSC Mainnet (Chain ID: 56)
- **USDT Token**: `0x55d398326f99059fF775485246999027B3197955`
- **Verification**: [View on BSCScan](https://bscscan.com/address/0x7FEEA22942407407801cCDA55a4392f25975D998)

### **Contract Functions**
```solidity
// User registration
function register(address referrer, uint256 packageId) external

// Matrix placement
function buyNewLevel(uint256 packageId) external

// Withdrawals
function withdraw(uint256 amount) external

// Admin functions
function pause() external onlyOwner
function setAdminFee(uint256 newRate) external onlyOwner
```

---

## 🛠️ **Development**

### **Project Structure**
```
LeadFive/
├── contracts/           # Smart contracts
├── scripts/            # Deployment scripts
├── src/               # React frontend
│   ├── components/    # React components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   └── utils/         # Utility functions
├── public/            # Static assets
├── test/              # Contract tests
├── docker-compose.yml # Production deployment
├── Dockerfile         # Container configuration
├── nginx.conf         # Web server configuration
└── DEPLOYMENT.md      # Deployment guide
```

### **Available Scripts**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run contract tests
npm run test:coverage # Test coverage report

# Deployment
npm run deploy:testnet  # Deploy to BSC testnet
npm run deploy:mainnet  # Deploy to BSC mainnet
npm run verify         # Verify contract on BSCScan

# Docker
docker-compose up -d   # Start production services
docker-compose logs -f # View logs
docker-compose down    # Stop services
```

### **Environment Variables**

See [.env.example](./.env.example) for all configuration options.

**Critical Variables:**
```bash
VITE_CONTRACT_ADDRESS=0x7FEEA22942407407801cCDA55a4392f25975D998
VITE_NETWORK_ID=56
VITE_APP_ENV=production
DOMAIN=leadfive.today
```

---

## 🔐 **Security**

### **Smart Contract Security**
- ✅ **Reentrancy Protection**: OpenZeppelin ReentrancyGuard
- ✅ **Access Control**: Role-based permissions
- ✅ **Pause Mechanism**: Emergency stop functionality
- ✅ **Input Validation**: Comprehensive parameter checking
- ✅ **Overflow Protection**: SafeMath operations

### **Frontend Security**
- ✅ **XSS Protection**: Input sanitization
- ✅ **CSRF Protection**: Token validation
- ✅ **SSL/TLS**: HTTPS enforcement
- ✅ **Content Security Policy**: Header protection
- ✅ **Rate Limiting**: API protection

### **Infrastructure Security**
- ✅ **Firewall**: UFW configuration
- ✅ **Fail2Ban**: Intrusion prevention
- ✅ **SSL Certificates**: Let's Encrypt
- ✅ **Security Headers**: HSTS, CSP, etc.
- ✅ **Regular Updates**: Automated security patches

---

## 📈 **Performance**

### **Optimization Features**
- ⚡ **Fast Loading**: < 3 second page loads
- ⚡ **Efficient Caching**: Static asset optimization
- ⚡ **CDN Ready**: Global content delivery
- ⚡ **Mobile Optimized**: Progressive Web App
- ⚡ **Gas Optimized**: Minimal transaction costs

### **Monitoring**
- 📊 **Health Checks**: Automated monitoring
- 📊 **Error Tracking**: Comprehensive logging
- 📊 **Performance Metrics**: Real-time analytics
- 📊 **Uptime Monitoring**: 99.9% availability target
- 📊 **Resource Usage**: CPU, memory, disk tracking

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md).

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Code Standards**
- **JavaScript**: ESLint + Prettier
- **Solidity**: Solhint + Prettier
- **Testing**: Minimum 80% coverage
- **Documentation**: JSDoc comments
- **Git**: Conventional commits

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 📞 **Support**

### **Documentation**
- 📖 **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 📖 **API Documentation**: [docs/API.md](./docs/API.md)
- 📖 **User Guide**: [docs/USER_GUIDE.md](./docs/USER_GUIDE.md)

### **Community**
- 🌐 **Website**: [https://leadfive.today](https://leadfive.today)
- 📧 **Email**: support@leadfive.today
- 💬 **Telegram**: [LeadFive Community](https://t.me/leadfive)
- 🐦 **Twitter**: [@LeadFiveMLM](https://twitter.com/leadfivemlm)

### **Technical Support**
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/timecapsulellc/LeadFive/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/timecapsulellc/LeadFive/discussions)
- 📚 **Documentation**: [GitHub Wiki](https://github.com/timecapsulellc/LeadFive/wiki)

---

## 🎯 **Roadmap**

### **Phase 1: Foundation** ✅
- [x] Smart contract development
- [x] Frontend application
- [x] BSC mainnet deployment
- [x] Security audit
- [x] Production infrastructure

### **Phase 2: Enhancement** 🚧
- [ ] Mobile application (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] Enhanced security features

### **Phase 3: Expansion** 📅
- [ ] Multi-chain support (Ethereum, Polygon)
- [ ] NFT integration
- [ ] Governance token
- [ ] DAO implementation
- [ ] Advanced DeFi features

---

## 📊 **Statistics**

### **Platform Metrics**
- 🎯 **Total Users**: Live counter on platform
- 💰 **Total Volume**: Real-time transaction volume
- 🏆 **Active Matrices**: Current active matrices
- 💎 **Pool Distributions**: Weekly distribution amounts

### **Technical Metrics**
- ⚡ **Uptime**: 99.9% target
- 🚀 **Performance**: < 3s page loads
- 🔒 **Security**: A+ SSL rating
- 📱 **Mobile**: 100% responsive

---

## ⚠️ **Disclaimer**

**Investment Risk**: Participation in MLM platforms involves financial risk. Only invest what you can afford to lose.

**Regulatory Compliance**: Users are responsible for compliance with local laws and regulations.

**Smart Contract Risk**: While audited, smart contracts may contain bugs or vulnerabilities.

**Market Risk**: Cryptocurrency values are volatile and may fluctuate significantly.

---

## 🎉 **Get Started Today!**

Ready to join the LeadFive community? 

👉 **[Visit LeadFive Platform](https://leadfive.today)**

1. **Connect Wallet**: MetaMask or WalletConnect
2. **Choose Package**: $30, $50, $100, or $200
3. **Find Referrer**: Get referral link from existing member
4. **Register**: Complete registration with USDT
5. **Start Earning**: Begin your MLM journey!

---

**🚀 Built with ❤️ by the LeadFive Team**

*Empowering financial freedom through blockchain technology*
