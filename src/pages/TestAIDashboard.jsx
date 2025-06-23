import React, { useState } from 'react';
import { FaRobot, FaBrain, FaLightbulb, FaChartLine, FaMicrophone } from 'react-icons/fa';
import AICoachingPanel from '../components/AICoachingPanel';
import AIEarningsPrediction from '../components/AIEarningsPrediction';
import AITransactionHelper from '../components/AITransactionHelper';
import ExtraordinaryAIAssistant from '../components/ExtraordinaryAIAssistant';
import './Dashboard.css';

const TestAIDashboard = () => {
  const [userStats] = useState({
    totalEarnings: 5000,
    teamSize: 25,
    activeReferrals: 8,
    currentLevel: 3,
    networkHealth: 85,
    daysSinceLastLogin: 0,
    teamGrowthRate: 15.5,
    loginStreak: 7,
    monthlyGoal: 5000,
    packageLevel: 90,
    daysSinceLastReferral: 2,
    voiceEnabled: true,
    dailyEarnings: 125,
    weeklyGrowth: 15.5,
    monthlyTarget: 5000
  });

  const [account] = useState('0x1234...5678');

  return (
    <div className="dashboard-container">
      <div className="test-ai-header">
        <h1 style={{ 
          color: '#00D4FF', 
          textAlign: 'center', 
          marginBottom: '3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <FaRobot /> AI Dashboard Features Test
        </h1>
        
        <div style={{
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <p style={{ color: '#00D4FF', margin: 0 }}>
            ✅ All AI components are working! This page shows all AI features in action.
          </p>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gap: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        
        <section style={{
          background: 'rgba(26, 26, 46, 0.8)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '15px',
          padding: '2rem'
        }}>
          <h2 style={{ 
            color: '#BA55D3', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FaRobot /> AI Business Coaching
          </h2>
          <AICoachingPanel userStats={userStats} account={account} />
        </section>
        
        <section style={{
          background: 'rgba(26, 26, 46, 0.8)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '15px',
          padding: '2rem'
        }}>
          <h2 style={{ 
            color: '#BA55D3', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FaBrain /> AI Earnings Prediction
          </h2>
          <AIEarningsPrediction userStats={userStats} account={account} />
        </section>
        
        <section style={{
          background: 'rgba(26, 26, 46, 0.8)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '15px',
          padding: '2rem'
        }}>
          <h2 style={{ 
            color: '#BA55D3', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FaLightbulb /> AI Transaction Helper
          </h2>
          <AITransactionHelper 
            userBalance="1.5"
            pendingRewards={234.56}
            recentTransactions={[
              { type: 'withdrawal', amount: 500, date: new Date() },
              { type: 'earning', amount: 125, date: new Date() }
            ]}
            account={account}
          />
        </section>
        
        <section style={{
          background: 'rgba(26, 26, 46, 0.8)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '15px',
          padding: '2rem'
        }}>
          <h2 style={{ 
            color: '#BA55D3', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FaMicrophone /> Voice Assistant (ExtraordinaryAIAssistant)
          </h2>
          <div style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <p style={{ color: '#00D4FF', margin: 0, fontSize: '0.9rem' }}>
              🎤 This is the Voice Assistant component that provides AI-powered voice interactions, 
              real-time coaching, and intelligent responses to help users navigate the platform.
            </p>
          </div>
          <ExtraordinaryAIAssistant 
            userStats={userStats}
            account={account}
          />
        </section>
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '3rem',
        padding: '2rem'
      }}>
        <h3 style={{ color: '#00D4FF', marginBottom: '1rem' }}>
          Navigation Test
        </h3>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            style={{
              background: 'linear-gradient(135deg, #00D4FF 0%, #BA55D3 100%)',
              color: '#fff',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaChartLine /> Go to Main Dashboard
          </button>
          
          <button 
            onClick={() => {
              localStorage.setItem('dashboardActiveSection', 'ai-assistant');
              window.location.href = '/dashboard';
            }}
            style={{
              background: 'transparent',
              color: '#00D4FF',
              border: '2px solid #00D4FF',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaRobot /> Go to AI Assistant Section
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAIDashboard;
