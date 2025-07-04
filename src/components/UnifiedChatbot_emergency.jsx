/**
 * MINIMAL ARIA Chatbot - Emergency Fix Version
 * This version has NO FaMinimize anywhere
 */

import React, { useState } from 'react';
import { 
  FaRobot, 
  FaTimes, 
  FaMinus,
  FaExpand
} from 'react-icons/fa';

const UnifiedChatbot = ({ userStats, account, userInfo, mode = 'floating', position = 'bottom-right' }) => {
  console.log('[ARIA DEBUG] EMERGENCY FIX - UnifiedChatbot loading...');
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="aria-chatbot-container" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999
    }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00D4FF 0%, #0066CC 100%)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)'
          }}
          title="Open ARIA Assistant"
        >
          <FaRobot />
        </button>
      )}

      {isOpen && (
        <div style={{
          width: '400px',
          height: isMinimized ? '60px' : '500px',
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          border: '1px solid #e0e0e0',
          transition: 'all 0.3s ease',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #00D4FF 0%, #0066CC 100%)',
            color: 'white',
            padding: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaRobot />
              <span>ARIA Assistant</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '5px'
                }}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <FaExpand /> : <FaMinus />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '5px'
                }}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#333' }}>
              <h3>✅ ARIA Fixed!</h3>
              <p>No more FaMinimize errors!</p>
              <p>Emergency minimal version working.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedChatbot;
