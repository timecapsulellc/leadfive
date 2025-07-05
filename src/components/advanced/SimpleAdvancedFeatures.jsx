import React from 'react';
import { FaRocket, FaBolt, FaHeartbeat, FaChartLine } from 'react-icons/fa';

const SimpleAdvancedFeatures = ({ dashboardData, userStats }) => {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '2rem',
        margin: '2rem 0',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        <FaRocket style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
        <h2 style={{ margin: 0 }}>🚀 Advanced LeadFive Features</h2>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          Modern dashboard with AI coaching, real-time stats, and analytics
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* AI Success Coach Preview */}
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(102, 126, 234, 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <FaBolt style={{ color: '#667eea', fontSize: '1.5rem' }} />
            <h3 style={{ margin: 0, color: '#2d3748' }}>AI Success Coach</h3>
          </div>
          <p style={{ color: '#4a5568', lineHeight: 1.6, margin: 0 }}>
            Get personalized coaching advice, earnings forecasts, and strategic
            growth recommendations powered by AI.
          </p>
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(72, 187, 120, 0.1)',
              borderRadius: '8px',
              borderLeft: '4px solid #48bb78',
            }}
          >
            <strong style={{ color: '#48bb78' }}>💡 Current Tip:</strong>
            <p style={{ margin: '0.5rem 0 0 0', color: '#2d3748' }}>
              Focus on team building to unlock higher commission rates!
            </p>
          </div>
        </div>

        {/* Real-Time Stats Preview */}
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(72, 187, 120, 0.1), rgba(56, 161, 105, 0.1))',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(72, 187, 120, 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <FaChartLine style={{ color: '#48bb78', fontSize: '1.5rem' }} />
            <h3 style={{ margin: 0, color: '#2d3748' }}>
              Real-Time Statistics
            </h3>
          </div>
          <p style={{ color: '#4a5568', lineHeight: 1.6, margin: 0 }}>
            Live network activity, team performance metrics, and transaction
            monitoring with 15-second updates.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '1rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#2d3748',
                }}
              >
                94%
              </div>
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                Network Health
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#2d3748',
                }}
              >
                Live
              </div>
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                Updates
              </div>
            </div>
          </div>
        </div>

        {/* Network Health Preview */}
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(246, 173, 85, 0.1), rgba(237, 137, 54, 0.1))',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(246, 173, 85, 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <FaHeartbeat style={{ color: '#f6ad55', fontSize: '1.5rem' }} />
            <h3 style={{ margin: 0, color: '#2d3748' }}>
              Network Health Monitor
            </h3>
          </div>
          <p style={{ color: '#4a5568', lineHeight: 1.6, margin: 0 }}>
            Monitor smart contract performance, security metrics, and system
            status in real-time.
          </p>
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#48bb78',
              }}
            ></div>
            <span style={{ color: '#48bb78', fontWeight: 'bold' }}>
              All Systems Operational
            </span>
          </div>
        </div>

        {/* Advanced Analytics Preview */}
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(229, 62, 62, 0.1), rgba(197, 48, 48, 0.1))',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(229, 62, 62, 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <FaChartLine style={{ color: '#e53e3e', fontSize: '1.5rem' }} />
            <h3 style={{ margin: 0, color: '#2d3748' }}>Advanced Analytics</h3>
          </div>
          <p style={{ color: '#4a5568', lineHeight: 1.6, margin: 0 }}>
            Deep-dive into earnings breakdown, team performance, and comparison
            analytics with visual charts.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <div
              style={{
                fontSize: '0.8rem',
                color: '#718096',
                marginBottom: '0.3rem',
              }}
            >
              Earnings Growth
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '75%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '4px',
                }}
              ></div>
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: '#48bb78',
                marginTop: '0.3rem',
                fontWeight: 'bold',
              }}
            >
              +32% this month
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          textAlign: 'center',
        }}
      >
        <strong style={{ color: '#667eea' }}>✨ Features Status:</strong>
        <span style={{ color: '#2d3748', marginLeft: '0.5rem' }}>
          All advanced features are loaded and ready to use!
        </span>
      </div>
    </div>
  );
};

export default SimpleAdvancedFeatures;
