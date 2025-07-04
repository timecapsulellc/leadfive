/**
 * AIRA Agent Information Component
 * Displays comprehensive details about all AIRA personalities and their capabilities
 */

import React, { useState } from 'react';
import { 
  FaBrain, 
  FaChartBar, 
  FaBullseye, 
  FaChess,
  FaMicrophone,
  FaRobot,
  FaCog,
  FaUsers,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

const AIRAAgentInfo = () => {
  const [expandedAgent, setExpandedAgent] = useState(null);

  const agents = {
    advisor: {
      name: 'Revenue Advisor',
      icon: FaBrain,
      color: '#00D4FF',
      description: 'PhD-Level Financial Strategist & Earnings Optimizer',
      voiceProfile: 'Professional male voice with confident financial authority',
      expertise: 'Financial Technology, Blockchain Economics, Investment Strategy',
      capabilities: [
        '💰 Advanced earnings calculations and projections',
        '📈 ROI optimization strategies for each membership tier',
        '🔄 Smart withdrawal ratio recommendations',
        '⚡ Real-time portfolio performance analysis',
        '🎯 Personalized upgrade timing guidance'
      ],
      specialties: [
        'Advanced financial modeling and projections',
        'Blockchain economics and DeFi strategies',
        'Portfolio optimization algorithms',
        'Risk assessment and mitigation',
        'Tax-efficient withdrawal planning'
      ],
      personalityTraits: [
        'Confident and authoritative',
        'Data-driven decision making',
        'Results-focused approach',
        'Professional communication style'
      ]
    },
    analyzer: {
      name: 'Network Analyzer',
      icon: FaChartBar,
      color: '#1e3a8a',
      description: 'Advanced Analytics & Performance Intelligence',
      voiceProfile: 'Analytical female voice with clear articulation and data-driven confidence',
      expertise: 'Data Science, Network Analysis, Performance Metrics',
      capabilities: [
        '📊 Real-time network performance dashboards',
        '🔍 Advanced pattern recognition in team behavior',
        '📈 Predictive analytics for growth opportunities',
        '⚖️ Binary tree balance optimization',
        '🎯 Conversion rate analysis and improvement'
      ],
      specialties: [
        'Machine learning pattern recognition',
        'Statistical analysis and modeling',
        'Performance metrics optimization',
        'Predictive analytics algorithms',
        'Network topology analysis'
      ],
      personalityTraits: [
        'Analytical and methodical',
        'Detail-oriented approach',
        'Evidence-based recommendations',
        'Clear and precise communication'
      ]
    },
    mentor: {
      name: 'Success Mentor',
      icon: FaBullseye,
      color: '#7c3aed',
      description: 'Motivational Coach & Mindset Transformation Specialist',
      voiceProfile: 'Enthusiastic motivational voice with emotional warmth and inspiring energy',
      expertise: 'Performance Psychology, Leadership Development, Success Coaching',
      capabilities: [
        '💪 Personalized motivation based on your current mood',
        '🧠 Mindset transformation techniques',
        '🎯 Goal-setting and achievement frameworks',
        '🔥 Confidence building exercises',
        '👥 Leadership development coaching'
      ],
      specialties: [
        'Cognitive behavioral coaching techniques',
        'Emotional intelligence development',
        'Goal achievement psychology',
        'Leadership training methodologies',
        'Confidence building strategies'
      ],
      personalityTraits: [
        'Enthusiastic and inspiring',
        'Empathetic and supportive',
        'Action-oriented guidance',
        'Positive and uplifting energy'
      ]
    },
    strategist: {
      name: 'Binary Strategist',
      icon: FaChess,
      color: '#059669',
      description: 'Long-Term Wealth Architect & Strategic Planner',
      voiceProfile: 'Strategic voice with executive presence and thoughtful planning authority',
      expertise: 'Strategic Planning, Systems Architecture, Long-term Wealth Building',
      capabilities: [
        '♟️ Advanced binary tree placement strategies',
        '🏗️ Long-term wealth architecture planning',
        '🔄 Systematic reinvestment optimization',
        '📅 Multi-phase growth timeline development',
        '🎯 Strategic partner placement recommendations'
      ],
      specialties: [
        'Strategic planning frameworks',
        'Systems thinking and architecture',
        'Long-term wealth building strategies',
        'Risk management planning',
        'Systematic growth methodologies'
      ],
      personalityTraits: [
        'Strategic and forward-thinking',
        'Systematic approach to planning',
        'Executive-level communication',
        'Focus on long-term outcomes'
      ]
    }
  };

  const toggleExpanded = (agentKey) => {
    setExpandedAgent(expandedAgent === agentKey ? null : agentKey);
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px',
      padding: '24px',
      margin: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ 
          margin: '0 0 10px 0', 
          color: '#fbbf24',
          fontSize: '2rem',
          fontWeight: 'bold'
        }}>
          🤖 AIRA Agent Intelligence System
        </h2>
        <p style={{ 
          margin: 0, 
          color: '#cbd5e1',
          fontSize: '1.1rem'
        }}>
          Advanced AI Personalities Powered by OpenAI & ElevenLabs
        </p>
      </div>

      {/* Technology Stack */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '25px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#10b981' }}>🚀 Technology Stack</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <FaRobot style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 5px 0', color: '#3b82f6' }}>OpenAI GPT-4</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
              Advanced language understanding and intelligent responses
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <FaMicrophone style={{ fontSize: '2rem', color: '#8b5cf6', marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 5px 0', color: '#8b5cf6' }}>ElevenLabs Voice AI</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
              Professional voice synthesis with personality-specific voices
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <FaCog style={{ fontSize: '2rem', color: '#10b981', marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 5px 0', color: '#10b981' }}>Smart Fallbacks</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
              Intelligent fallback systems ensure 100% uptime
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <FaUsers style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 5px 0', color: '#f59e0b' }}>Personality Engine</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
              Context-aware responses based on user data and goals
            </p>
          </div>
        </div>
      </div>

      {/* Agent Profiles */}
      <h3 style={{ margin: '0 0 20px 0', color: '#fbbf24' }}>👥 Meet Your AI Team</h3>
      
      {Object.entries(agents).map(([key, agent]) => {
        const IconComponent = agent.icon;
        const isExpanded = expandedAgent === key;
        
        return (
          <div key={key} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '15px',
            marginBottom: '15px',
            overflow: 'hidden',
            border: `1px solid ${agent.color}20`
          }}>
            {/* Agent Header */}
            <div 
              onClick={() => toggleExpanded(key)}
              style={{
                background: `linear-gradient(135deg, ${agent.color}20, rgba(255,255,255,0.05))`,
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <IconComponent style={{ fontSize: '2.5rem', color: agent.color }} />
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: agent.color, fontSize: '1.3rem' }}>
                    {agent.name}
                  </h4>
                  <p style={{ margin: '0 0 5px 0', color: '#cbd5e1', fontSize: '0.95rem' }}>
                    {agent.description}
                  </p>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                    🎓 {agent.expertise}
                  </p>
                </div>
              </div>
              {isExpanded ? 
                <FaChevronUp style={{ color: agent.color, fontSize: '1.2rem' }} /> :
                <FaChevronDown style={{ color: agent.color, fontSize: '1.2rem' }} />
              }
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div style={{ padding: '20px', borderTop: `1px solid ${agent.color}30` }}>
                {/* Voice Profile */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#8b5cf6' }}>🎤 Voice Profile</h5>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>
                    {agent.voiceProfile}
                  </p>
                </div>

                {/* Capabilities */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#10b981' }}>⚡ Core Capabilities</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                    {agent.capabilities.map((capability, index) => (
                      <div key={index} style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        color: '#e2e8f0'
                      }}>
                        {capability}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#f59e0b' }}>🎯 Advanced Specialties</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {agent.specialties.map((specialty, index) => (
                      <div key={index} style={{
                        fontSize: '0.85rem',
                        color: '#cbd5e1',
                        padding: '5px 0'
                      }}>
                        • {specialty}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personality Traits */}
                <div>
                  <h5 style={{ margin: '0 0 10px 0', color: '#ef4444' }}>🧠 Personality Traits</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {agent.personalityTraits.map((trait, index) => (
                      <span key={index} style={{
                        background: `${agent.color}20`,
                        color: agent.color,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        border: `1px solid ${agent.color}30`
                      }}>
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Integration Info */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        padding: '20px',
        marginTop: '25px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#10b981' }}>🔗 Seamless Integration</h3>
        <p style={{ margin: '0 0 15px 0', color: '#cbd5e1' }}>
          All AIRA agents work together to provide comprehensive support for your LeadFive journey.
          Switch between personalities anytime to get specialized assistance for any situation.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ 
            background: 'rgba(16, 185, 129, 0.2)', 
            color: '#10b981', 
            padding: '8px 16px', 
            borderRadius: '20px',
            fontSize: '0.9rem',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            ✅ Real-time Voice Responses
          </span>
          <span style={{ 
            background: 'rgba(59, 130, 246, 0.2)', 
            color: '#3b82f6', 
            padding: '8px 16px', 
            borderRadius: '20px',
            fontSize: '0.9rem',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            ✅ Context-Aware Intelligence
          </span>
          <span style={{ 
            background: 'rgba(139, 92, 246, 0.2)', 
            color: '#8b5cf6', 
            padding: '8px 16px', 
            borderRadius: '20px',
            fontSize: '0.9rem',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            ✅ Personality Switching
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIRAAgentInfo;