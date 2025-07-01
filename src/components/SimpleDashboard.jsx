import React from 'react';
import { FaDollarSign, FaUsers, FaNetworkWired, FaGift } from 'react-icons/fa';

const SimpleDashboard = ({ data, account }) => {
  const stats = [
    {
      icon: FaDollarSign,
      label: 'Total Earnings',
      value: `$${(data?.totalEarnings || 0).toFixed(2)}`,
      change: '+12.5%'
    },
    {
      icon: FaUsers,
      label: 'Direct Referrals',
      value: data?.directReferrals || 0,
      change: '+2'
    },
    {
      icon: FaNetworkWired,
      label: 'Team Size',
      value: data?.teamSize || 0,
      change: '+5'
    },
    {
      icon: FaGift,
      label: 'Pending Rewards',
      value: `$${(data?.pendingRewards || 0).toFixed(2)}`,
      change: 'Ready to claim'
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Lead Five Dashboard</h2>
      <p>Welcome to your dashboard! Here's your current status:</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        margin: '20px 0'
      }}>
        {stats.map((stat, index) => (
          <div key={index} style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <stat.icon style={{ fontSize: '24px', marginRight: '10px' }} />
              <span style={{ fontSize: '14px', opacity: 0.9 }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
              {stat.value}
            </div>
            <span style={{ 
              fontSize: '12px', 
              color: '#4ade80',
              background: 'rgba(74, 222, 128, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      <div style={{ 
        background: '#f8fafc',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px'
      }}>
        <h3>Account Information</h3>
        <p><strong>Wallet:</strong> {account ? `${String(account).slice(0, 6)}...${String(account).slice(-4)}` : 'Not connected'}</p>
        <p><strong>Status:</strong> {data ? 'Active' : 'Loading...'}</p>
        <p><strong>Package:</strong> ${data?.currentPackage || 0}</p>
      </div>

      <div style={{ 
        background: '#f0f9ff',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        border: '1px solid #0ea5e9'
      }}>
        <h3 style={{ color: '#0ea5e9' }}>🎯 Next Steps</h3>
        <ul>
          <li>Invite team members to grow your network</li>
          <li>Claim your pending rewards</li>
          <li>Upgrade your package for higher earnings</li>
          <li>Check your withdrawal status</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleDashboard;
