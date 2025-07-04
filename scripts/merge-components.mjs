import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComponentMerger {
  constructor() {
    this.srcPath = path.join(__dirname, '..', 'src');
    this.componentsPath = path.join(this.srcPath, 'components');
    this.unifiedPath = path.join(this.componentsPath, 'unified');
    this.legacyPath = path.join(this.componentsPath, 'legacy');
    
    this.duplicateGroups = {
      dashboard: [
        'Dashboard.jsx',
        'DashboardPage.jsx', 
        'MainDashboard.jsx',
        'UserDashboard.jsx',
        'SimpleDashboard.jsx',
        'TestAIDashboard.jsx'
      ],
      aiAssistant: [
        'UnifiedChatbot.jsx',
        'UnifiedChatbot_test.jsx',
        'UnifiedChatbot_emergency.jsx',
        'UnifiedChatbot_backup.jsx',
        'UnifiedChatbot_broken.jsx',
        'AIAssistant.jsx',
        'AICoachingPanel.jsx',
        'ExtraordinaryAIAssistant.jsx'
      ],
      genealogy: [
        'Genealogy.jsx',
        'GenealogyTree.jsx',
        'UnifiedGenealogyTree.jsx',
        'NetworkTree.jsx',
        'TeamStructure.jsx'
      ],
      matrix: [
        'MatrixView.jsx',
        'MatrixVisualization.jsx',
        'BinaryMatrix.jsx',
        'Matrix5x5.jsx'
      ],
      walletConnect: [
        'WalletConnect.jsx',
        'WalletConnection.jsx',
        'WalletConnector.jsx',
        'UnifiedWalletConnect.jsx',
        'UnifiedWalletConnect-Fixed.jsx'
      ]
    };
  }

  async execute() {
    console.log('🔄 Starting comprehensive component migration...\n');

    try {
      // Step 1: Create directories
      await this.createDirectories();

      // Step 2: Analyze current state
      const analysis = await this.analyzeDuplicates();
      console.log('📊 Component Analysis Complete');

      // Step 3: Create unified components
      await this.createUnifiedComponents();

      // Step 4: Archive legacy components
      await this.archiveLegacyComponents();

      // Step 5: Generate migration report
      const report = await this.generateReport();
      console.log('\n✅ Component Migration Complete!');
      
      return report;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async createDirectories() {
    // Create unified directory
    if (!fs.existsSync(this.unifiedPath)) {
      fs.mkdirSync(this.unifiedPath, { recursive: true });
      console.log('📁 Created unified components directory');
    }

    // Create legacy directory for archiving
    if (!fs.existsSync(this.legacyPath)) {
      fs.mkdirSync(this.legacyPath, { recursive: true });
      console.log('📁 Created legacy components directory');
    }
  }

  async analyzeDuplicates() {
    const duplicates = {};
    
    for (const [group, files] of Object.entries(this.duplicateGroups)) {
      duplicates[group] = {
        found: [],
        missing: []
      };

      for (const file of files) {
        const filePath = this.findFile(file);
        if (filePath) {
          duplicates[group].found.push({
            name: file,
            path: filePath,
            size: fs.statSync(filePath).size
          });
        } else {
          duplicates[group].missing.push(file);
        }
      }

      console.log(`🔍 ${group}: Found ${duplicates[group].found.length}/${files.length} components`);
    }

    return duplicates;
  }

  findFile(fileName, dir = this.componentsPath) {
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && file !== 'unified' && file !== 'legacy') {
          const found = this.findFile(fileName, filePath);
          if (found) return found;
        } else if (file === fileName) {
          return filePath;
        }
      }
    } catch (error) {
      // Directory doesn't exist or permission error
      return null;
    }
    
    return null;
  }

  async createUnifiedComponents() {
    console.log('🏗️  Creating unified components...');

    // Create unified dashboard
    await this.createUnifiedDashboard();
    
    // Create unified AI assistant (without ElevenLabs)
    await this.createUnifiedAI();
    
    // Create unified wallet connector
    await this.createUnifiedWalletConnect();

    console.log('✅ All unified components created');
  }

  async createUnifiedDashboard() {
    const template = `import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FeatureRecoveryManager from '../../services/FeatureRecoveryManager';
import UnifiedAIAssistant from './UnifiedAIAssistant';
import './UnifiedDashboard.css';

const UnifiedDashboard = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [features, setFeatures] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Initialize feature recovery on mount
  useEffect(() => {
    const initializeFeatures = async () => {
      try {
        const recoveryManager = new FeatureRecoveryManager();
        const recoveredFeatures = await recoveryManager.recoverMissingFeatures();
        setFeatures(recoveredFeatures);
        setIsLoading(false);
        console.log('✅ Features recovered successfully');
      } catch (error) {
        console.error('❌ Feature recovery failed:', error);
        setIsLoading(false);
      }
    };

    initializeFeatures();
  }, []);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  // Load user data when connected
  useEffect(() => {
    if (isConnected && address) {
      loadUserData(address);
    }
  }, [isConnected, address]);

  const loadUserData = async (userAddress) => {
    try {
      // Mock user data - replace with actual contract calls
      const mockData = {
        userId: 1,
        package: 'Gold',
        directReferrals: 5,
        teamSize: 25,
        totalEarnings: 1250,
        rank: 'Silver',
        leftLeg: 12,
        rightLeg: 13,
        nextRankRequirement: {
          directReferrals: 10,
          teamVolume: 20000
        }
      };
      setUserData(mockData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'genealogy', label: 'Network Tree', icon: '🌳' },
    { id: 'matrix', label: 'Binary Matrix', icon: '⚡' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'packages', label: 'Packages', icon: '📦' },
    { id: 'referrals', label: 'Referrals', icon: '👥' }
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Recovering features...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return <UnifiedOverview userData={userData} features={features} />;
      case 'genealogy':
        return <UnifiedGenealogyTree userData={userData} />;
      case 'matrix':
        return <UnifiedMatrixView userData={userData} />;
      case 'earnings':
        return <UnifiedEarnings userData={userData} />;
      case 'packages':
        return <UnifiedPackages userData={userData} />;
      case 'referrals':
        return <UnifiedReferrals userData={userData} />;
      default:
        return <UnifiedOverview userData={userData} features={features} />;
    }
  };

  return (
    <div className="unified-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>LeadFive Dashboard</h1>
            <p>Welcome back, {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
          <div className="header-stats">
            {userData && (
              <>
                <div className="stat-item">
                  <span className="label">Rank</span>
                  <span className="value">{userData.rank}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Earnings</span>
                  <span className="value">\${userData.totalEarnings}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={\`nav-item \${activeSection === section.id ? 'active' : ''}\`}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>

      {/* ARIA AI Assistant */}
      <UnifiedAIAssistant features={features?.aiFeatures} userData={userData} />
    </div>
  );
};

// Placeholder components - to be implemented
const UnifiedOverview = ({ userData, features }) => (
  <div className="overview-container">
    <h2>Dashboard Overview</h2>
    <div className="stats-grid">
      {userData && (
        <>
          <div className="stat-card">
            <h3>Team Size</h3>
            <p className="stat-value">{userData.teamSize}</p>
          </div>
          <div className="stat-card">
            <h3>Direct Referrals</h3>
            <p className="stat-value">{userData.directReferrals}</p>
          </div>
          <div className="stat-card">
            <h3>Binary Balance</h3>
            <p className="stat-value">{userData.leftLeg}L / {userData.rightLeg}R</p>
          </div>
        </>
      )}
    </div>
  </div>
);

const UnifiedGenealogyTree = ({ userData }) => (
  <div className="genealogy-container">
    <h2>Network Tree</h2>
    <p>Your genealogy tree will be displayed here</p>
  </div>
);

const UnifiedMatrixView = ({ userData }) => (
  <div className="matrix-container">
    <h2>Binary Matrix</h2>
    <p>Your binary matrix will be displayed here</p>
  </div>
);

const UnifiedEarnings = ({ userData }) => (
  <div className="earnings-container">
    <h2>Earnings Report</h2>
    <p>Your earnings breakdown will be displayed here</p>
  </div>
);

const UnifiedPackages = ({ userData }) => (
  <div className="packages-container">
    <h2>Available Packages</h2>
    <p>Package upgrade options will be displayed here</p>
  </div>
);

const UnifiedReferrals = ({ userData }) => (
  <div className="referrals-container">
    <h2>Referral System</h2>
    <p>Your referral network will be displayed here</p>
  </div>
);

export default UnifiedDashboard;`;

    fs.writeFileSync(
      path.join(this.unifiedPath, 'UnifiedDashboard.jsx'),
      template
    );
    console.log('✅ Created UnifiedDashboard.jsx');
  }

  async createUnifiedAI() {
    const template = `import React, { useState, useEffect, useRef } from 'react';
import './UnifiedAIAssistant.css';

const UnifiedAIAssistant = ({ features, userData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [personality, setPersonality] = useState('advisor');
  const messagesEndRef = useRef(null);

  const personalities = {
    advisor: {
      name: 'Revenue Advisor',
      icon: '🧠',
      color: 'from-green-400 to-emerald-600',
      prompt: 'Strategic advice for maximizing earnings in LeadFive'
    },
    analyzer: {
      name: 'Network Analyzer',
      icon: '📊',
      color: 'from-blue-400 to-indigo-600',
      prompt: 'Data insights and network analytics for LeadFive users'
    },
    mentor: {
      name: 'Success Mentor',
      icon: '🎯',
      color: 'from-purple-400 to-pink-600',
      prompt: 'Motivational coaching and success strategies for LeadFive'
    },
    strategist: {
      name: 'Binary Strategist',
      icon: '♟️',
      color: 'from-yellow-400 to-orange-600',
      prompt: 'Binary matrix optimization and long-term planning for LeadFive'
    }
  };

  useEffect(() => {
    // Initialize with welcome message
    if (isOpen && messages.length === 0) {
      const welcomeMsg = {
        id: Date.now(),
        type: 'ai',
        personality,
        message: \`Hello! I'm your \${personalities[personality].name}. How can I help you succeed with LeadFive today?\`
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, personality]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (replace with actual OpenAI integration)
    setTimeout(() => {
      const responses = {
        advisor: [
          "Based on your current position, I recommend focusing on your weaker leg to maximize binary bonuses.",
          "Consider upgrading to the next package level to increase your earning potential.",
          "Your network shows good growth potential. Focus on quality referrals rather than quantity."
        ],
        analyzer: [
          "Your left leg has 60% of your volume. Try to balance it with more right-side placements.",
          "Your team growth rate is 15% above average for your rank level.",
          "I detect an opportunity for spillover in your network structure."
        ],
        mentor: [
          "Every successful leader started where you are now. Stay consistent and trust the process!",
          "Your dedication to building your LeadFive network will pay off. Keep pushing forward!",
          "Remember: success in network marketing is about helping others succeed first."
        ],
        strategist: [
          "For optimal binary growth, place your next 3 referrals on your weaker leg.",
          "Your long-term strategy should focus on developing leaders, not just adding numbers.",
          "Consider the compound effect: quality placements now mean exponential growth later."
        ]
      };

      const personalityResponses = responses[personality] || responses.advisor;
      const randomResponse = personalityResponses[Math.floor(Math.random() * personalityResponses.length)];

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        personality,
        message: randomResponse
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const switchPersonality = () => {
    const personalityKeys = Object.keys(personalities);
    const currentIndex = personalityKeys.indexOf(personality);
    const nextIndex = (currentIndex + 1) % personalityKeys.length;
    const nextPersonality = personalityKeys[nextIndex];
    
    setPersonality(nextPersonality);
    
    // Add transition message
    const transitionMsg = {
      id: Date.now(),
      type: 'ai',
      personality: nextPersonality,
      message: \`Switched to \${personalities[nextPersonality].name}. \${personalities[nextPersonality].icon} How can I assist you?\`
    };
    setMessages(prev => [...prev, transitionMsg]);
  };

  const quickPrompts = {
    advisor: ['Optimize my earnings', 'Package recommendations', 'Investment strategy'],
    analyzer: ['Analyze my network', 'Show growth trends', 'Team performance'],
    mentor: ['Motivate me', 'Success tips', 'Overcome challenges'],
    strategist: ['Binary planning', 'Placement strategy', 'Long-term goals']
  };

  return (
    <>
      {/* Floating ARIA Button */}
      <button 
        className="aria-float-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open ARIA AI Assistant"
      >
        <span className="aria-icon">🤖</span>
        <span className="aria-badge">ARIA</span>
      </button>

      {/* ARIA Chat Interface */}
      {isOpen && (
        <div className="aria-chat-container">
          <div className="aria-header">
            <div className="aria-title">
              <span className="aria-personality-icon">
                {personalities[personality].icon}
              </span>
              <h3>ARIA - {personalities[personality].name}</h3>
            </div>
            <div className="aria-controls">
              <button 
                onClick={switchPersonality}
                className="aria-switch-btn"
                title="Switch AI Personality"
              >
                🔄
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="aria-close-btn"
              >
                ✖
              </button>
            </div>
          </div>

          <div className="aria-messages">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={\`aria-message \${msg.type}\`}
              >
                {msg.type === 'ai' && (
                  <span className="message-icon">
                    {personalities[msg.personality]?.icon}
                  </span>
                )}
                <div className="message-content">{msg.message}</div>
              </div>
            ))}
            
            {isTyping && (
              <div className="aria-message ai typing">
                <span className="message-icon">
                  {personalities[personality].icon}
                </span>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="quick-prompts">
            {quickPrompts[personality]?.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInput(prompt)}
                className="quick-prompt"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="aria-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask ARIA anything about LeadFive..."
              className="aria-input"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="aria-send-btn"
            >
              Send
            </button>
          </div>

          <div className="aria-features">
            <p>💡 Ask about: Placement strategies • Earnings optimization • Network growth • Success tips</p>
          </div>
        </div>
      )}
    </>
  );
};

export default UnifiedAIAssistant;`;

    fs.writeFileSync(
      path.join(this.unifiedPath, 'UnifiedAIAssistant.jsx'),
      template
    );
    console.log('✅ Created UnifiedAIAssistant.jsx');
  }

  async createUnifiedWalletConnect() {
    const template = `import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { motion } from 'framer-motion';
import './UnifiedWalletConnect.css';

const UnifiedWalletConnect = ({ onConnect, onDisconnect }) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isConnected && onConnect) {
      onConnect(address);
    }
  }, [isConnected, address, onConnect]);

  const handleConnect = (connector) => {
    connect({ connector });
    setShowModal(false);
  };

  const handleDisconnect = () => {
    disconnect();
    if (onDisconnect) {
      onDisconnect();
    }
  };

  if (isConnected) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <div className="wallet-address">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <button onClick={handleDisconnect} className="disconnect-btn">
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="connect-wallet-btn"
      >
        Connect Wallet
      </button>

      {showModal && (
        <div className="wallet-modal-overlay" onClick={() => setShowModal(false)}>
          <motion.div 
            className="wallet-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Connect Your Wallet</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                ✖
              </button>
            </div>

            <div className="connectors-list">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={!connector.ready || isLoading}
                  className="connector-btn"
                >
                  <div className="connector-info">
                    <span className="connector-name">{connector.name}</span>
                    {!connector.ready && ' (unsupported)'}
                    {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
                  </div>
                  <div className="connector-icon">
                    {connector.name === 'MetaMask' && '🦊'}
                    {connector.name === 'WalletConnect' && '🔗'}
                    {connector.name === 'Injected' && '💳'}
                  </div>
                </button>
              ))}
            </div>

            <div className="modal-footer">
              <p>Connect your wallet to access LeadFive features</p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default UnifiedWalletConnect;`;

    fs.writeFileSync(
      path.join(this.unifiedPath, 'UnifiedWalletConnect.jsx'),
      template
    );
    console.log('✅ Created UnifiedWalletConnect.jsx');
  }

  async archiveLegacyComponents() {
    console.log('📦 Archiving legacy components...');
    
    let archivedCount = 0;
    
    for (const [group, files] of Object.entries(this.duplicateGroups)) {
      for (const file of files) {
        const filePath = this.findFile(file);
        if (filePath) {
          try {
            const destPath = path.join(this.legacyPath, file);
            fs.renameSync(filePath, destPath);
            console.log(`📦 Archived: ${file} → legacy/`);
            archivedCount++;
          } catch (error) {
            console.warn(`⚠️  Could not archive ${file}:`, error.message);
          }
        }
      }
    }
    
    console.log(`✅ Archived ${archivedCount} legacy components`);
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      unifiedComponents: fs.readdirSync(this.unifiedPath).length,
      archivedComponents: fs.existsSync(this.legacyPath) ? fs.readdirSync(this.legacyPath).length : 0,
      duplicateGroups: Object.keys(this.duplicateGroups).length,
      status: 'completed'
    };

    const reportPath = path.join(this.srcPath, 'component-migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📋 Migration report saved to:', reportPath);
    return report;
  }
}

export { ComponentMerger };

// Auto-execute if run directly
if (process.argv[1] === __filename) {
  const merger = new ComponentMerger();
  merger.execute().catch(console.error);
}
