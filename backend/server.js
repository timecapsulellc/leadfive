const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const WebSocket = require('ws');
const { ethers } = require('ethers');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.API_PORT || 3001;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8080;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cookieParser());

// Session configuration for CSRF
app.use(session({
  secret: process.env.SESSION_SECRET || 'leadfive-secure-session-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Enhanced rate limiting with different tiers
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
});

// Different rate limits for different endpoints
const generalLimiter = createRateLimit(15 * 60 * 1000, 1000, 'Too many requests');
const authLimiter = createRateLimit(15 * 60 * 1000, 50, 'Too many authentication attempts');
const transactionLimiter = createRateLimit(60 * 1000, 10, 'Too many transaction attempts');

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/transactions/', transactionLimiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://leadfive.today',
    'https://www.leadfive.today'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF protection
const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection to state-changing operations
app.use('/api/transactions/', csrfProtection);
app.use('/api/admin/', csrfProtection);

// CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Database connection pool
const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'leadfive_enhanced',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: WEBSOCKET_PORT });
console.log(`📡 WebSocket server running on port ${WEBSOCKET_PORT}`);

// Blockchain connection
const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
const contractAddress = process.env.VITE_CONTRACT_ADDRESS;

// Minimal contract ABI for events
const contractABI = [
  "event UserRegistered(address indexed user, address indexed sponsor, uint8 packageLevel, uint96 amount)",
  "event WithdrawalMade(address indexed user, uint96 amount, uint256 newBalance)",
  "event BonusPaid(address indexed recipient, address indexed from, uint8 bonusType, uint96 amount)",
  "function users(address) view returns (bool isRegistered, uint8 packageLevel, uint256 totalEarnings, uint256 totalWithdrawn, address referrer, bool isActive, uint256 registrationTime, uint256 totalDirectReferrals)",
  "function totalUsers() view returns (uint256)",
  "function owner() view returns (address)"
];

const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Store WebSocket connections
const wsConnections = new Set();

wss.on('connection', (ws) => {
  wsConnections.add(ws);
  console.log('📱 New WebSocket connection');
  
  ws.on('close', () => {
    wsConnections.delete(ws);
    console.log('📱 WebSocket connection closed');
  });
  
  ws.on('error', (error) => {
    console.error('📱 WebSocket error:', error);
    wsConnections.delete(ws);
  });
});

// Broadcast to all WebSocket clients
function broadcast(data) {
  const message = JSON.stringify(data);
  wsConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// ===== ROUTE IMPORTS =====
const genealogyRoutes = require('./routes/genealogy');
const referralRoutes = require('./routes/referrals');
const gedcomRoutes = require('./routes/gedcom');

// ===== API ROUTES =====

// Database middleware - attach connection pool to req.db
app.use((req, res, next) => {
  req.db = dbPool;
  next();
});

// Mount enhanced route modules
app.use('/api/genealogy', genealogyRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/gedcom', gedcomRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    contract: contractAddress,
    database: 'connected'
  });
});

// Get platform statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [userStats] = await dbPool.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(total_investment) as total_investment,
        SUM(total_earnings) as total_earnings,
        SUM(total_withdrawn) as total_withdrawn,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users
      FROM users
    `);
    
    const [dailyStats] = await dbPool.execute(`
      SELECT 
        COUNT(*) as today_registrations,
        SUM(amount) as today_volume
      FROM transactions 
      WHERE DATE(created_at) = CURDATE() 
      AND transaction_type = 'registration'
    `);
    
    // Get blockchain stats
    const totalUsers = await contract.totalUsers();
    const owner = await contract.owner();
    
    res.json({
      database: userStats[0],
      daily: dailyStats[0],
      blockchain: {
        total_users: totalUsers.toString(),
        contract_owner: owner,
        contract_address: contractAddress
      },
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get user information
app.get('/api/user/:address', async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();
    
    // First check database
    const [dbUsers] = await dbPool.execute(
      'SELECT * FROM users WHERE LOWER(wallet_address) = ?',
      [address]
    );
    
    let user = dbUsers[0] || null;
    
    // If not in database, check blockchain and sync
    if (!user) {
      try {
        const blockchainUser = await contract.users(req.params.address);
        if (blockchainUser.isRegistered) {
          user = await syncUserFromBlockchain(req.params.address);
        }
      } catch (blockchainError) {
        console.log('User not found on blockchain:', req.params.address);
      }
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get referral link
    const [links] = await dbPool.execute(
      'SELECT link_code FROM referral_links WHERE user_id = ? AND is_active = 1',
      [user.id]
    );
    
    user.referral_link = links[0]?.link_code || null;
    
    res.json(user);
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Get genealogy tree data
app.get('/api/genealogy/:address', async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();
    const depth = parseInt(req.query.depth) || 5;
    
    const [users] = await dbPool.execute(
      'SELECT id FROM users WHERE LOWER(wallet_address) = ?',
      [address]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = users[0].id;
    const treeData = await buildGenealogyTree(userId, depth);
    
    res.json(treeData);
  } catch (error) {
    console.error('Genealogy error:', error);
    res.status(500).json({ error: 'Failed to fetch genealogy data' });
  }
});

// Get user transactions
app.get('/api/transactions/:address', async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    const [transactions] = await dbPool.execute(`
      SELECT t.*, u.wallet_address 
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE LOWER(u.wallet_address) = ?
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `, [address, limit, offset]);
    
    const [countResult] = await dbPool.execute(`
      SELECT COUNT(*) as total
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE LOWER(u.wallet_address) = ?
    `, [address]);
    
    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ===== HELPER FUNCTIONS =====

async function syncUserFromBlockchain(address) {
  try {
    const blockchainUser = await contract.users(address);
    
    if (!blockchainUser.isRegistered) {
      return null;
    }
    
    // Find sponsor in database
    let sponsorId = null;
    if (blockchainUser.referrer !== ethers.ZeroAddress) {
      const [sponsors] = await dbPool.execute(
        'SELECT id FROM users WHERE LOWER(wallet_address) = ?',
        [blockchainUser.referrer.toLowerCase()]
      );
      sponsorId = sponsors[0]?.id || null;
    }
    
    // Insert user
    const [result] = await dbPool.execute(`
      INSERT INTO users (
        wallet_address, sponsor_id, package_level, 
        total_investment, total_earnings, total_withdrawn, 
        direct_referrals, is_active, registration_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?))
      ON DUPLICATE KEY UPDATE
        package_level = VALUES(package_level),
        total_earnings = VALUES(total_earnings),
        total_withdrawn = VALUES(total_withdrawn),
        direct_referrals = VALUES(direct_referrals),
        last_sync = NOW()
    `, [
      address.toLowerCase(),
      sponsorId,
      blockchainUser.packageLevel,
      ethers.formatEther(blockchainUser.totalEarnings || 0),
      ethers.formatEther(blockchainUser.totalEarnings || 0),
      ethers.formatEther(blockchainUser.totalWithdrawn || 0),
      blockchainUser.totalDirectReferrals || 0,
      blockchainUser.isActive,
      blockchainUser.registrationTime || Math.floor(Date.now() / 1000)
    ]);
    
    const userId = result.insertId || result.insertId;
    
    // Create referral link
    const linkCode = generateReferralCode();
    await dbPool.execute(`
      INSERT INTO referral_links (user_id, link_code) 
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE link_code = link_code
    `, [userId, linkCode]);
    
    // Get the inserted user
    const [users] = await dbPool.execute(
      'SELECT * FROM users WHERE LOWER(wallet_address) = ?',
      [address.toLowerCase()]
    );
    
    console.log(`✅ Synced user from blockchain: ${address}`);
    return users[0];
  } catch (error) {
    console.error(`❌ Failed to sync user ${address}:`, error);
    return null;
  }
}

async function buildGenealogyTree(userId, maxDepth = 5) {
  try {
    const [user] = await dbPool.execute(`
      SELECT u.*, r.link_code
      FROM users u
      LEFT JOIN referral_links r ON u.id = r.user_id AND r.is_active = 1
      WHERE u.id = ?
    `, [userId]);
    
    if (user.length === 0) return null;
    
    const node = {
      id: user[0].id,
      address: user[0].wallet_address,
      username: user[0].username || `User ${user[0].id}`,
      packageLevel: user[0].package_level,
      totalEarnings: user[0].total_earnings,
      directReferrals: user[0].direct_referrals,
      isActive: user[0].is_active,
      referralCode: user[0].link_code,
      children: []
    };
    
    if (maxDepth > 0) {
      const [children] = await dbPool.execute(
        'SELECT id FROM users WHERE sponsor_id = ? ORDER BY created_at ASC',
        [userId]
      );
      
      for (const child of children) {
        const childTree = await buildGenealogyTree(child.id, maxDepth - 1);
        if (childTree) {
          node.children.push(childTree);
        }
      }
    }
    
    return node;
  } catch (error) {
    console.error('Build tree error:', error);
    return null;
  }
}

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ===== BLOCKCHAIN EVENT LISTENERS =====

// Listen for new registrations
contract.on('UserRegistered', async (user, sponsor, packageLevel, amount) => {
  console.log('🔔 New user registered:', user);
  
  try {
    const syncedUser = await syncUserFromBlockchain(user);
    
    // Broadcast to WebSocket clients
    broadcast({
      type: 'user_registered',
      data: {
        user: syncedUser,
        sponsor,
        packageLevel: packageLevel.toString(),
        amount: ethers.formatEther(amount)
      }
    });
  } catch (error) {
    console.error('Error handling UserRegistered event:', error);
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LeadFive Enhanced API running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'leadfive_enhanced'}`);
  console.log(`🔗 Contract: ${contractAddress}`);
  console.log(`📡 WebSocket: port ${WEBSOCKET_PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    dbPool.end();
  });
});

module.exports = app;
