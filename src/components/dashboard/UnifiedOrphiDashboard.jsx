/**
 * ORPHI CrowdFund Unified Dashboard
 * Complete feature integration with mobile optimization
 * Developed by LEAD 5 - Young Blockchain Engineers
 */

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import useWallet from '../../hooks/useWallet';
import useContract from '../../hooks/useContract';
import EarningsOverview from './EarningsOverview';
import TeamOverview from './TeamOverview';
import WithdrawalPanel from './WithdrawalPanel';
import ReferralManager from './ReferralManager';
import AdminDashboard from '../admin/AdminDashboard';
import LoadingSpinner from '../common/LoadingSpinner';
import OrphiChainLogo from '../OrphiChainLogo';
import WalletConnection from '../web3/WalletConnection';
import FileUploader from '../common/FileUploader';
import '../../styles/unified-dashboard.css';

// Lazy load heavy components for better performance
const MatrixVisualization = lazy(() => import('./MatrixVisualization'));
const TeamGenealogy = lazy(() => import('./TeamGenealogy'));

const UnifiedOrphiDashboard = ({ 
  account, 
  contract, 
  provider, 
  signer, 
  userInfo, 
  networkStats, 
  isConnected, 
  onBackToClassic 
}) => {
  // Use passed props instead of hooks for better integration
  // const { account, isConnected, connectWallet, disconnectWallet } = useWallet();
  // const { contract, isLoading: contractLoading } = useContract();

  // Main state management
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    totalEarnings: userInfo?.totalEarnings ? parseFloat(userInfo.totalEarnings) : 0,
    teamSize: userInfo?.teamSize ? parseInt(userInfo.teamSize) : 0,
    directReferrals: userInfo?.directReferrals ? parseInt(userInfo.directReferrals) : 0,
    packageLevel: userInfo?.packageLevel ? parseInt(userInfo.packageLevel) : 0,
    withdrawableAmount: userInfo?.balance ? parseFloat(userInfo.balance) : 0,
    isRegistered: userInfo?.isRegistered || false,
    isCapped: false
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    screenWidth: window.innerWidth
  });

  // AI and voice states
  const [aiEnabled, setAiEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'ai',
      message: `Welcome to ORPHI! 🚀 I'm your AI assistant. Ask me anything about your Web3 crowdfunding journey!`,
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState(null);

  // Real-time data
  const [liveStats, setLiveStats] = useState({
    totalUsers: networkStats?.totalUsers || 12847,
    totalVolume: networkStats?.totalVolume ? parseInt(networkStats.totalVolume) : 2850000,
    activeUsers: Math.floor((networkStats?.totalUsers || 12847) * 0.7),
    dailyEarnings: 45600
  });

  // Brand colors
  const colors = {
    primary: '#00D4FF',
    secondary: '#7B2CBF', 
    accent: '#FF6B35',
    success: '#00FF88',
    error: '#FF4757',
    background: '#1A1A2E',
    surface: '#16213E'
  };

  // Device detection
  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      setDeviceInfo({
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        screenWidth: width
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  // Placeholder for AI initialization (to be implemented later)

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    if (!contract || !account) return;

    setLoading(true);
    setError('');

    try {
      const [userInfo, bonuses, teamData] = await Promise.all([
        contract.getUserInfo(account),
        contract.getUserBonuses(account),
        contract.getTeamData(account)
      ]);

      setUserStats({
        totalEarnings: Number(userInfo.totalEarnings) / 1e18,
        teamSize: Number(teamData.teamSize),
        directReferrals: Number(userInfo.directReferrals),
        packageLevel: Number(userInfo.packageLevel),
        withdrawableAmount: Number(userInfo.withdrawableAmount) / 1e18,
        isRegistered: userInfo.isRegistered,
        isCapped: userInfo.isCapped
      });

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  // Update userStats when userInfo prop changes
  useEffect(() => {
    if (userInfo) {
      setUserStats({
        totalEarnings: userInfo.totalEarnings ? parseFloat(userInfo.totalEarnings) : 0,
        teamSize: userInfo.teamSize ? parseInt(userInfo.teamSize) : 0,
        directReferrals: userInfo.directReferrals ? parseInt(userInfo.directReferrals) : 0,
        packageLevel: userInfo.packageLevel ? parseInt(userInfo.packageLevel) : 0,
        withdrawableAmount: userInfo.balance ? parseFloat(userInfo.balance) : 0,
        isRegistered: userInfo.isRegistered || false,
        isCapped: false
      });
    }
  }, [userInfo]);

  // Update liveStats when networkStats prop changes
  useEffect(() => {
    if (networkStats) {
      setLiveStats({
        totalUsers: networkStats.totalUsers || 12847,
        totalVolume: networkStats.totalVolume ? parseInt(networkStats.totalVolume) : 2850000,
        activeUsers: Math.floor((networkStats.totalUsers || 12847) * 0.7),
        dailyEarnings: 45600
      });
    }
  }, [networkStats]);

  // Fetch data when wallet connects (fallback for direct usage)
  useEffect(() => {
    if (isConnected && contract && !userInfo) {
      fetchUserData();
    }
  }, [isConnected, contract, fetchUserData, userInfo]);

  // Load uploaded files from localStorage on component mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('orphi_uploaded_files');
    if (savedFiles) {
      setUploadedFiles(JSON.parse(savedFiles));
    }
  }, []);

  // Handle successful file upload
  const handleFileUploadComplete = (result) => {
    console.log('Upload completed:', result);
    
    const newFile = {
      id: Date.now().toString(),
      name: result.originalName || result.fileName,
      url: result.fileUrl,
      uploadedAt: new Date().toISOString(),
      size: result.metadata?.size || 0,
      type: result.metadata?.type || 'application/pdf'
    };

    const updatedFiles = [...uploadedFiles, newFile];
    setUploadedFiles(updatedFiles);
    localStorage.setItem('orphi_uploaded_files', JSON.stringify(updatedFiles));
  };

  // Handle file download
  const handleFileDownload = (file) => {
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file preview
  const handleFilePreview = (file) => {
    setSelectedPreviewFile(file);
  };

  // Handle file deletion
  const handleFileDelete = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
      setUploadedFiles(updatedFiles);
      localStorage.setItem('orphi_uploaded_files', JSON.stringify(updatedFiles));
      
      // Close preview if the deleted file was being previewed
      if (selectedPreviewFile && selectedPreviewFile.id === fileId) {
        setSelectedPreviewFile(null);
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // AI Chat Handler - Separate Text and Voice Responses
  const handleChatMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      message: message.trim(),
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    try {
      // Get ChatGPT text response
      const userContext = {
        account,
        earnings: userStats.totalEarnings,
        teamSize: userStats.teamSize,
        packageLevel: userStats.packageLevel,
        isRegistered: userStats.isRegistered
      };

      // Import services dynamically
      const { default: OpenAIService } = await import('../../services/OpenAIService');
      const { default: ElevenLabsService } = await import('../../services/ElevenLabsService');

      // Get text response from ChatGPT
      const textResponse = await OpenAIService.getChatResponse(message, userContext);

      // Add AI text response
      const aiMessage = {
        type: 'ai',
        message: textResponse,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);

      // Generate voice response using ElevenLabs (chatbot style)
      if (voiceEnabled) {
        const voiceResponse = await ElevenLabsService.generateSpeech(textResponse);
        if (voiceResponse.success) {
          voiceResponse.play();
        }
      }

    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // Fallback response
      const fallbackMessage = {
        type: 'ai',
        message: "I'm having trouble connecting right now, but I'm here to help! 🚀 Try asking about your earnings, team growth, or investment strategies.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Voice-only motivational messages (separate from chat)
  const playVoiceMotivation = async () => {
    try {
      const { default: ElevenLabsService } = await import('../../services/ElevenLabsService');
      
      const motivationalMessages = [
        "You're building something incredible! 🚀 The blockchain revolution needs leaders like you!",
        "Diamond hands! 💎 Your Web3 journey is just getting started!",
        "To the moon! 🌙 Every successful investor started exactly where you are now!",
        "Blockchain champion! ⚡ You're part of the future of finance!",
        "Crypto success incoming! 💰 Your persistence will pay off!"
      ];

      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      const audio = await ElevenLabsService.generateMotivationalMessage({ mood: 'excited' });
      
      if (audio.success) {
        audio.play();
      }
    } catch (error) {
      console.error('Voice motivation error:', error);
    }
  };

  // Navigation tabs
  const navigationTabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'earnings', label: '💰 Earnings', icon: '💰' },
    { id: 'team', label: '👥 Team', icon: '👥' },
    { id: 'genealogy', label: '🌐 Network', icon: '🌐' },
    { id: 'matrix', label: '⚡ Matrix', icon: '⚡' },
    { id: 'referrals', label: '🔗 Referrals', icon: '🔗' },
    { id: 'withdraw', label: '💳 Withdraw', icon: '💳' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' }
  ];

  // Admin check
  const isAdmin = account && ['0x...'].includes(account); // Add admin addresses

  if (isAdmin) {
    navigationTabs.push({ id: 'admin', label: '⚙️ Admin', icon: '⚙️' });
  }

  // Render mobile navigation
  const renderMobileNavigation = () => (
    <div className={`mobile-nav-overlay ${showMobileMenu ? 'active' : ''}`}>
      <div className="mobile-nav-content">
        <div className="mobile-nav-header">
          <OrphiChainLogo size="small" />
          <button 
            className="close-mobile-nav"
            onClick={() => setShowMobileMenu(false)}
          >
            ✕
          </button>
        </div>
        <nav className="mobile-nav-tabs">
          {navigationTabs.map(tab => (
            <button
              key={tab.id}
              className={`mobile-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setShowMobileMenu(false);
              }}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  // Render main content based on active tab
  const renderMainContent = () => {
    const commonProps = { wallet: { account }, contract };

    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-grid">
            <div className="overview-stats">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <div className="stat-value">${userStats.totalEarnings.toFixed(2)}</div>
                  <div className="stat-label">Total Earnings</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-value">{userStats.teamSize}</div>
                  <div className="stat-label">Team Size</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔗</div>
                <div className="stat-content">
                  <div className="stat-value">{userStats.directReferrals}</div>
                  <div className="stat-label">Direct Referrals</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💎</div>
                <div className="stat-content">
                  <div className="stat-value">${userStats.withdrawableAmount.toFixed(2)}</div>
                  <div className="stat-label">Withdrawable</div>
                </div>
              </div>
            </div>

            <div className="overview-panels">
              <EarningsOverview {...commonProps} />
              <TeamOverview {...commonProps} />
            </div>

            {/* Live Global Stats */}
            <div className="global-stats-panel">
              <h3>🌍 Global Network Stats</h3>
              <div className="global-stats-grid">
                <div className="global-stat">
                  <div className="stat-value">{liveStats.totalUsers.toLocaleString()}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="global-stat">
                  <div className="stat-value">${(liveStats.totalVolume / 1000000).toFixed(1)}M</div>
                  <div className="stat-label">Total Volume</div>
                </div>
                <div className="global-stat">
                  <div className="stat-value">{liveStats.activeUsers.toLocaleString()}</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="global-stat">
                  <div className="stat-value">${liveStats.dailyEarnings.toLocaleString()}</div>
                  <div className="stat-label">Daily Earnings</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'earnings':
        return <EarningsOverview {...commonProps} />;

      case 'team':
        return (
          <div className="team-dashboard">
            <TeamOverview {...commonProps} />
            <Suspense fallback={<LoadingSpinner />}>
              <TeamGenealogy {...commonProps} />
            </Suspense>
          </div>
        );

      case 'genealogy':
        return (
          <div className="genealogy-dashboard">
            <h2>🌐 Network Genealogy</h2>
            <p>Interactive network tree visualization coming soon...</p>
            <div className="genealogy-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">🌳</div>
                <h3>Network Tree Visualization</h3>
                <p>Your genealogy tree will be displayed here with interactive features</p>
              </div>
            </div>
          </div>
        );

      case 'matrix':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MatrixVisualization {...commonProps} />
          </Suspense>
        );

      case 'referrals':
        return <ReferralManager {...commonProps} />;

      case 'withdraw':
        return <WithdrawalPanel {...commonProps} />;

      case 'analytics':
        return (
          <div className="analytics-dashboard">
            <h2>📈 Analytics Dashboard</h2>
            <p>Advanced analytics and insights coming soon...</p>
            <div className="analytics-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">📊</div>
                <h3>Team Performance Analytics</h3>
                <p>Detailed charts and metrics will be displayed here</p>
              </div>
            </div>
          </div>
        );

      case 'admin':
        return isAdmin ? <AdminDashboard wallet={{ account }} /> : null;

      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="unified-orphi-dashboard">
      <style jsx>{`
        .unified-orphi-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%);
          color: white;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Header */
        .dashboard-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-title {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-subtitle {
          color: #888;
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-to-classic-btn {
          background: linear-gradient(135deg, #FF6B35, #7B2CBF);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .back-to-classic-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }

        .ai-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ai-toggle-btn, .voice-toggle-btn, .motivation-btn, .pdf-upload-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          padding: 0.5rem;
          border-radius: 8px;
          color: #ccc;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-toggle-btn:hover, .voice-toggle-btn:hover, .motivation-btn:hover, .pdf-upload-btn:hover {
          background: ${colors.primary}20;
          color: ${colors.primary};
          transform: translateY(-2px);
        }

        .ai-toggle-btn.active {
          background: ${colors.primary};
          color: white;
        }

        .voice-toggle-btn.active {
          background: ${colors.success};
          color: white;
        }

        .pdf-upload-btn.active {
          background: ${colors.accent};
          color: white;
        }

        .motivation-btn:hover {
          background: ${colors.accent}20;
          color: ${colors.accent};
        }

        .ai-toggle-btn {
          background: ${colors.secondary};
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .ai-toggle-btn:hover {
          background: ${colors.primary};
          transform: translateY(-2px);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }

        /* Navigation */
        .dashboard-navigation {
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0 2rem;
          overflow-x: auto;
        }

        .nav-tabs {
          display: flex;
          gap: 0.5rem;
          min-width: max-content;
        }

        .nav-tab {
          background: none;
          border: none;
          color: #ccc;
          padding: 1rem 1.5rem;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          font-weight: 500;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-tab:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-tab.active {
          color: ${colors.primary};
          border-bottom-color: ${colors.primary};
          background: rgba(0, 212, 255, 0.1);
        }

        /* Main Content */
        .dashboard-main {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Overview Grid */
        .overview-grid {
          display: grid;
          gap: 2rem;
        }

        .overview-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.2);
          border-color: ${colors.primary};
        }

        .stat-icon {
          font-size: 2rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
          border-radius: 12px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: #888;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .overview-panels {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        /* Global Stats Panel */
        .global-stats-panel {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .global-stats-panel h3 {
          color: ${colors.primary};
          margin-bottom: 1.5rem;
          font-size: 1.2rem;
        }

        .global-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .global-stat {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .global-stat .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${colors.success};
          margin-bottom: 0.5rem;
        }

        .global-stat .stat-label {
          color: #888;
          font-size: 0.8rem;
        }

        /* AI Chat Panel */
        .ai-chat-panel {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 350px;
          max-height: 500px;
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        /* PDF Upload Panel */
        .pdf-upload-panel {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          width: 400px;
          max-height: 600px;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow-y: auto;
        }

        .upload-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .upload-header h3 {
          margin: 0;
          color: ${colors.accent};
          font-size: 1.1rem;
        }

        .close-upload-btn {
          background: none;
          border: none;
          color: #ccc;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .close-upload-btn:hover {
          color: ${colors.error};
          background: ${colors.error}20;
        }

        .upload-content {
          margin-bottom: 1.5rem;
        }

        .upload-info {
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.2);
          border-radius: 8px;
          padding: 1rem;
        }

        .upload-info h4 {
          color: ${colors.accent};
          margin: 0 0 0.75rem 0;
          font-size: 0.9rem;
        }

        .upload-info ul {
          margin: 0;
          padding-left: 1rem;
          color: #ccc;
        }

        .upload-info li {
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }

        /* Uploaded Files Section */
        .uploaded-files-section {
          margin: 1.5rem 0;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .uploaded-files-section h4 {
          color: ${colors.primary};
          margin: 0 0 1rem 0;
          font-size: 0.9rem;
        }

        .files-list {
          max-height: 200px;
          overflow-y: auto;
        }

        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .file-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: ${colors.primary}40;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .file-icon {
          font-size: 1.5rem;
          color: ${colors.accent};
        }

        .file-details {
          flex: 1;
        }

        .file-name {
          color: white;
          font-weight: 500;
          font-size: 0.85rem;
          margin-bottom: 0.25rem;
          word-break: break-word;
        }

        .file-meta {
          color: #888;
          font-size: 0.75rem;
        }

        .file-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-btn:hover {
          background: ${colors.primary}40;
          color: ${colors.primary};
        }

        .download-btn:hover {
          background: ${colors.success}40;
          color: ${colors.success};
        }

        .delete-btn:hover {
          background: ${colors.error}40;
          color: ${colors.error};
        }

        /* PDF Preview Modal */
        .pdf-preview-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .preview-content {
          background: ${colors.background};
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          width: 90vw;
          height: 90vh;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .preview-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.05);
        }

        .preview-header h3 {
          margin: 0;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .preview-actions {
          display: flex;
          gap: 0.5rem;
        }

        .preview-action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .preview-action-btn.download-btn:hover {
          background: ${colors.success}40;
          color: ${colors.success};
        }

        .preview-action-btn.close-btn:hover {
          background: ${colors.error}40;
          color: ${colors.error};
        }

        .preview-body {
          flex: 1;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pdf-iframe {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 8px;
          background: white;
        }

        .preview-fallback {
          text-align: center;
          color: #888;
        }

        .fallback-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          color: ${colors.accent};
        }

        .fallback-download-btn {
          background: ${colors.primary};
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-weight: 500;
          margin-top: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .preview-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
        }

        .file-details {
          display: flex;
          gap: 2rem;
          font-size: 0.85rem;
          color: #888;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chat-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .close-chat-btn {
          background: none;
          border: none;
          color: #ccc;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .close-chat-btn:hover {
          color: ${colors.error};
          background: ${colors.error}20;
        }

        .chat-header h3 {
          margin: 0;
          color: ${colors.primary};
          font-size: 1.1rem;
        }

        .ai-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #888;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #666;
        }

        .status-indicator.active {
          background: ${colors.success};
          box-shadow: 0 0 10px ${colors.success};
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 1rem;
          max-height: 300px;
        }

        .chat-message {
          margin-bottom: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
          max-width: 85%;
        }

        .chat-message.user {
          background: ${colors.primary}20;
          border: 1px solid ${colors.primary}40;
          margin-left: auto;
        }

        .chat-message.ai {
          background: ${colors.secondary}20;
          border: 1px solid ${colors.secondary}40;
        }

        .message-content {
          font-size: 0.9rem;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }

        .message-time {
          font-size: 0.7rem;
          color: #666;
        }

        .chat-input-form {
          display: flex;
          gap: 0.5rem;
        }

        .chat-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 0.75rem;
          color: white;
          font-size: 0.9rem;
        }

        .chat-input:focus {
          outline: none;
          border-color: ${colors.primary};
        }

        .chat-send-btn {
          background: ${colors.primary};
          border: none;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          color: white;
          cursor: pointer;
          font-size: 1rem;
        }

        .chat-send-btn:hover:not(:disabled) {
          background: ${colors.secondary};
        }

        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${colors.primary};
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Mobile Navigation */
        .mobile-nav-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          z-index: 10000;
          display: none;
        }

        .mobile-nav-overlay.active {
          display: block;
        }

        .mobile-nav-content {
          background: ${colors.background};
          width: 280px;
          height: 100%;
          padding: 2rem;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-nav-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .close-mobile-nav {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .mobile-nav-tabs {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-tab {
          background: none;
          border: none;
          color: #ccc;
          padding: 1rem;
          text-align: left;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mobile-nav-tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .mobile-nav-tab.active {
          background: ${colors.primary}20;
          color: ${colors.primary};
          border: 1px solid ${colors.primary}40;
        }

        .tab-icon {
          font-size: 1.2rem;
          width: 24px;
        }

        .tab-label {
          font-weight: 500;
        }

        /* Team Dashboard */
        .team-dashboard {
          display: grid;
          gap: 2rem;
        }

        .genealogy-dashboard {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        /* Wallet Connection */
        .wallet-connection-panel {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          margin: 2rem;
        }

        .wallet-connection-panel h2 {
          color: ${colors.primary};
          margin-bottom: 1rem;
        }

        .wallet-connection-panel p {
          color: #888;
          margin-bottom: 2rem;
        }

        /* Loading States */
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem;
        }

        /* Error States */
        .error-message {
          background: ${colors.error}20;
          border: 1px solid ${colors.error}40;
          color: ${colors.error};
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard-header {
            padding: 1rem;
          }

          .header-title {
            font-size: 1.2rem;
          }

          .header-subtitle {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .dashboard-navigation {
            display: none;
          }

          .dashboard-main {
            padding: 1rem;
          }

          .overview-stats {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }

          .overview-panels {
            grid-template-columns: 1fr;
          }

          .global-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .ai-chat-panel {
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
            width: auto;
          }

          .pdf-upload-panel {
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
            width: auto;
            max-height: 70vh;
          }

          .preview-overlay {
            padding: 1rem;
          }

          .preview-content {
            width: 95vw;
            height: 85vh;
          }

          .preview-header {
            padding: 0.75rem 1rem;
          }

          .preview-header h3 {
            font-size: 1rem;
          }

          .preview-actions {
            flex-direction: column;
            gap: 0.25rem;
          }

          .preview-action-btn {
            padding: 0.5rem;
            font-size: 0.8rem;
          }

          .file-details {
            flex-direction: column;
            gap: 0.5rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .stat-icon {
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
          }

          .stat-value {
            font-size: 1.4rem;
          }
        }

        @media (max-width: 480px) {
          .overview-stats {
            grid-template-columns: 1fr;
          }

          .global-stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
          }
        }

        /* Animation */
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: ${colors.primary};
          border-radius: 4px;
        }
      `}</style>

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <OrphiChainLogo size="small" />
          <div>
            <h1 className="header-title">ORPHI Dashboard</h1>
            <span className="header-subtitle">Powered by LEAD 5 Engineers</span>
          </div>
        </div>
        
        <div className="header-right">
          {onBackToClassic && (
            <button 
              className="back-to-classic-btn"
              onClick={onBackToClassic}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Classic
            </button>
          )}

          {/* AI Controls */}
          {isConnected && (
            <div className="ai-controls">
              <button 
                className={`pdf-upload-btn ${showPDFUpload ? 'active' : ''}`}
                onClick={() => setShowPDFUpload(!showPDFUpload)}
                title="Upload PDF Documents"
              >
                <i className="fas fa-file-pdf"></i>
              </button>

              <button 
                className={`ai-toggle-btn ${showChat ? 'active' : ''}`}
                onClick={() => setShowChat(!showChat)}
                title="AI Chat Assistant"
              >
                <i className="fas fa-robot"></i>
              </button>
              
              <button 
                className={`voice-toggle-btn ${voiceEnabled ? 'active' : ''}`}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title="Toggle Voice Responses"
              >
                <i className={`fas ${voiceEnabled ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
              </button>

              <button 
                className="motivation-btn"
                onClick={playVoiceMotivation}
                title="Get Voice Motivation"
              >
                <i className="fas fa-microphone"></i>
              </button>
            </div>
          )}
          
          <WalletConnection />
          
          {deviceInfo.isMobile && (
            <button 
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              ☰
            </button>
          )}
        </div>
      </header>

      {/* Navigation */}
      {isConnected && (
        <nav className={`dashboard-navigation ${deviceInfo.isMobile && showMobileMenu ? 'mobile-open' : ''}`}>
          <div className="nav-tabs">
            {navigationTabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (deviceInfo.isMobile) setShowMobileMenu(false);
                }}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        {loading && (
          <div className="loading-container">
            <LoadingSpinner size={48} />
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!isConnected ? (
          <div className="wallet-connection-panel">
            <h2>Welcome to ORPHI CrowdFund</h2>
            <p>Connect your wallet to access the dashboard and start building your Web3 empire!</p>
            <WalletConnection />
          </div>
        ) : (
          <div className="fade-in">
            {renderMainContent()}
          </div>
        )}
      </main>

      {/* AI Chat Panel */}
      {showChat && (
        <div className="ai-chat-panel">
          <div className="chat-header">
            <h3>🤖 AI Assistant</h3>
            <div className="chat-controls">
              <div className="ai-status">
                <div className={`status-indicator ${aiEnabled ? 'active' : ''}`}></div>
                <span>ChatGPT</span>
              </div>
              <div className="ai-status">
                <div className={`status-indicator ${voiceEnabled ? 'active' : ''}`}></div>
                <span>Voice</span>
              </div>
              <button onClick={() => setShowChat(false)} className="close-chat-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.type}`}>
                <div className="message-content">{msg.message}</div>
                <div className="message-time">
                  {msg.timestamp?.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message ai typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form className="chat-input-form" onSubmit={(e) => {
            e.preventDefault();
            handleChatMessage(chatInput);
          }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask me about your Web3 journey..."
              className="chat-input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="chat-send-btn"
              disabled={isTyping || !chatInput.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}

      {/* PDF Upload Panel */}
      {showPDFUpload && (
        <div className="pdf-upload-panel">
          <div className="upload-header">
            <h3>📄 Upload PDF Documents</h3>
            <button onClick={() => setShowPDFUpload(false)} className="close-upload-btn">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="upload-content">
            <FileUploader 
              userId={account}
              projectId="orphi-crowdfund"
              allowMultiple={true}
              showAIProcessing={true}
              onUploadComplete={handleFileUploadComplete}
              onError={(error) => {
                console.error('Upload error:', error);
                // You can add error notifications here
              }}
              className="orphi-pdf-uploader"
            />
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files-section">
              <h4>📁 Your Uploaded Files ({uploadedFiles.length})</h4>
              <div className="files-list">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="file-item">
                    <div className="file-info">
                      <div className="file-icon">📄</div>
                      <div className="file-details">
                        <div className="file-name">{file.name}</div>
                        <div className="file-meta">
                          {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button 
                        onClick={() => handleFilePreview(file)}
                        className="action-btn preview-btn"
                        title="Preview PDF"
                      >
                        👁️
                      </button>
                      <button 
                        onClick={() => handleFileDownload(file)}
                        className="action-btn download-btn"
                        title="Download PDF"
                      >
                        ⬇️
                      </button>
                      <button 
                        onClick={() => handleFileDelete(file.id)}
                        className="action-btn delete-btn"
                        title="Delete PDF"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="upload-info">
            <h4>📋 Features Available:</h4>
            <ul>
              <li>✅ Drag & drop PDF files from your computer</li>
              <li>👁️ Preview PDFs directly in the dashboard</li>
              <li>⬇️ Download files anytime</li>
              <li>🤖 AI-powered document analysis</li>
              <li>🔒 Secure file storage</li>
              <li>📊 Automatic content extraction</li>
              <li>💬 ChatGPT text analysis</li>
              <li>🔊 ElevenLabs voice summaries</li>
            </ul>
          </div>
        </div>
              )}

      {/* PDF Preview Modal */}
      {selectedPreviewFile && (
        <div className="pdf-preview-modal">
          <div className="preview-overlay" onClick={() => setSelectedPreviewFile(null)}>
            <div className="preview-content" onClick={(e) => e.stopPropagation()}>
              <div className="preview-header">
                <h3>📄 {selectedPreviewFile.name}</h3>
                <div className="preview-actions">
                  <button 
                    onClick={() => handleFileDownload(selectedPreviewFile)}
                    className="preview-action-btn download-btn"
                    title="Download PDF"
                  >
                    <i className="fas fa-download"></i> Download
                  </button>
                  <button 
                    onClick={() => setSelectedPreviewFile(null)}
                    className="preview-action-btn close-btn"
                    title="Close Preview"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <div className="preview-body">
                {selectedPreviewFile.type === 'application/pdf' ? (
                  <iframe 
                    src={selectedPreviewFile.url}
                    title={selectedPreviewFile.name}
                    className="pdf-iframe"
                  />
                ) : (
                  <div className="preview-fallback">
                    <div className="fallback-icon">📄</div>
                    <h4>Preview not available</h4>
                    <p>This file type cannot be previewed directly.</p>
                    <button 
                      onClick={() => handleFileDownload(selectedPreviewFile)}
                      className="fallback-download-btn"
                    >
                      <i className="fas fa-download"></i> Download to view
                    </button>
                  </div>
                )}
              </div>
              
              <div className="preview-footer">
                <div className="file-details">
                  <span>Size: {formatFileSize(selectedPreviewFile.size)}</span>
                  <span>Uploaded: {new Date(selectedPreviewFile.uploadedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {renderMobileNavigation()}
    </div>
  );
};

export default UnifiedOrphiDashboard; 