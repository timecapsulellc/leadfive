/**
 * Business Presentation Slides - Exact PDF Replica
 * Complete interactive presentation with downloadable PDF
 */

import React, { useState, useEffect } from 'react';
import { 
  FaDownload, 
  FaPrint, 
  FaShare, 
  FaChevronLeft, 
  FaChevronRight,
  FaDollarSign,
  FaUsers,
  FaShieldAlt,
  FaRocket,
  FaGlobe,
  FaChartLine,
  FaCrown,
  FaNetworkWired,
  FaLock,
  FaMobile,
  FaGraduationCap,
  FaHeart,
  FaCode,
  FaEye,
  FaLanguage,
  FaCog,
  FaCoins,
  FaTrophy,
  FaStar,
  FaArrowUp,
  FaMap,
  FaBullseye
} from 'react-icons/fa';
import './BusinessPresentationSlides.css';

const BusinessPresentationSlides = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Complete slide data matching the PDF exactly
  const slides = [
    {
      id: 1,
      title: "Lead Five",
      subtitle: "Revolutionary Digital Business Platform",
      content: {
        headline: "Welcome to Lead Five",
        description: "The Future of Digital Business on Blockchain",
        features: [
          "🚀 Revolutionary Level Income System",
          "💎 Blockchain-Powered Smart Contracts", 
          "🛡️ Military-Grade Security",
          "🌍 Global Accessibility",
          "💰 Transparent Compensation"
        ],
        cta: "Join the Revolution Today!"
      },
      background: "linear-gradient(135deg, #00D4FF 0%, #7B2CBF 100%)", /* Cyber Blue to Royal Purple */
      icon: <FaRocket />
    },
    {
      id: 2,
      title: "Lead Five Compensation Plan",
      subtitle: "Level Income System",
      content: {
        headline: "Unprecedented Earning Potential",
        description: "Our revolutionary level income system offers maximum earning potential",
        features: [
          "💰 Joining Amount: $50 USDT",
          "📈 Maximum Earnings: $153,600",
          "🔄 10 Levels Deep Income",
          "⚡ Instant Blockchain Payouts",
          "🎯 $5 Per Registration",
          "🌟 Help Pool Bonus System"
        ],
        levelIncome: {
          joining: "$50 USDT one-time joining amount",
          perLevel: "$5 earned per registration on each level",
          levels: "10 levels deep earning potential",
          helpPool: "Additional help pool bonus sharing",
          maxEarnings: "Maximum potential: $153,600"
        }
      },
      background: "linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)", /* Energy Orange to Premium Gold */
      icon: <FaDollarSign />
    },
    {
      id: 3,
      title: "Advanced Security Features",
      subtitle: "Military-Grade Protection",
      content: {
        headline: "Uncompromising Security",
        description: "Your investments and data protected by cutting-edge technology",
        features: [
          "🔐 End-to-End Encryption",
          "🛡️ Multi-Signature Wallets",
          "🔒 Smart Contract Audits",
          "🌐 Decentralized Architecture",
          "🚨 Real-time Fraud Detection",
          "📱 2FA Authentication",
          "🔑 Hardware Wallet Support",
          "⚡ Instant Transaction Verification"
        ],
        security: {
          blockchain: "BSC Blockchain Security",
          contracts: "Audited Smart Contracts",
          wallets: "Multi-Signature Protection", 
          encryption: "256-bit AES Encryption"
        }
      },
      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      icon: <FaShieldAlt />
    },
    {
      id: 4,
      title: "User Experience Excellence",
      subtitle: "Intuitive & Powerful",
      content: {
        headline: "Seamless User Journey",
        description: "Designed for both beginners and experienced network marketers",
        features: [
          "🎨 Modern, Intuitive Interface",
          "📱 Mobile-First Design",
          "⚡ Lightning-Fast Performance",
          "🌍 Multi-Language Support",
          "🤖 AI-Powered Assistant",
          "📊 Real-Time Analytics",
          "🔔 Smart Notifications",
          "💬 Integrated Chat System"
        ],
        ux: {
          onboarding: "5-Minute Setup Process",
          support: "24/7 AI Assistant",
          training: "Interactive Tutorials",
          community: "Global User Network"
        }
      },
      background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      icon: <FaUsers />
    },
    {
      id: 5,
      title: "Lead Five Investment Package",
      subtitle: "Single Entry Investment",
      content: {
        headline: "Investment Package Details",
        description: "Simple, transparent investment with maximum earning potential",
        packages: [
          {
            name: "Lead Five Package",
            price: "$50 USDT",
            features: [
              "One-time joining amount",
              "Entry into Level Income System",
              "10 Levels Deep Earnings",
              "$5 per registration on each level",
              "Help Pool Bonus eligibility",
              "Leadership rewards potential",
              "Rank advancement bonuses"
            ],
            popular: true,
            maxEarnings: "$153,600"
          }
        ],
        benefits: [
          "🎯 No Monthly Fees",
          "💰 One-Time $50 USDT Investment",
          "🔄 Lifetime Income Potential",
          "📈 Maximum Earnings: $153,600"
        ]
      },
      background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      icon: <FaCoins />
    },
    {
      id: 6,
      title: "Global Accessibility",
      subtitle: "Worldwide Opportunity",
      content: {
        headline: "Borderless Digital Business",
        description: "Connect with opportunities worldwide through blockchain technology",
        features: [
          "🌍 Available in 190+ Countries",
          "💱 Multi-Currency Support",
          "🕐 24/7 Global Operations",
          "🌐 Decentralized Network",
          "📞 Multi-Language Support",
          "🚀 Cross-Border Payments",
          "🔗 Global Community",
          "📡 Worldwide Accessibility"
        ],
        global: {
          countries: "190+ Countries Supported",
          languages: "25+ Languages Available",
          timezone: "24/7 Operations",
          currencies: "Multiple Crypto Support"
        }
      },
      background: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
      icon: <FaGlobe />
    },
    {
      id: 7,
      title: "Educational Resources",
      subtitle: "Comprehensive Learning Platform",
      content: {
        headline: "Knowledge is Power",
        description: "Complete training system to ensure your success",
        features: [
          "📚 Comprehensive Training Library",
          "🎥 Video Tutorials & Webinars",
          "📖 Step-by-Step Guides",
          "🏆 Certification Programs",
          "👥 Mentorship Network",
          "📊 Performance Analytics",
          "🎯 Goal Setting Tools",
          "💡 Success Strategies"
        ],
        education: {
          courses: "50+ Training Modules",
          certificates: "Professional Certifications",
          mentors: "Expert Mentorship",
          community: "Learning Community"
        }
      },
      background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      icon: <FaGraduationCap />
    },
    {
      id: 8,
      title: "Community Building",
      subtitle: "Strong Network Foundation",
      content: {
        headline: "Build Your Empire",
        description: "Tools and systems to build a thriving network",
        features: [
          "👥 Team Building Tools",
          "📈 Genealogy Tracking",
          "💬 Communication Hub",
          "🎉 Recognition System",
          "📊 Performance Leaderboards",
          "🤝 Collaboration Features",
          "🎯 Team Challenges",
          "🏆 Achievement Badges"
        ],
        community: {
          tools: "Advanced Team Tools",
          tracking: "Real-Time Genealogy",
          communication: "Integrated Messaging",
          recognition: "Achievement System"
        }
      },
      background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      icon: <FaHeart />
    },
    {
      id: 9,
      title: "Smart Contract Integration",
      subtitle: "Blockchain Technology",
      content: {
        headline: "Trustless Automation",
        description: "Smart contracts ensure transparent and automatic operations",
        features: [
          "⚡ Automated Payouts",
          "🔒 Immutable Records",
          "🔍 Transparent Operations",
          "⚖️ Fair Distribution",
          "🚀 Instant Execution",
          "🛡️ Tamper Proof",
          "💰 Gas Optimized",
          "🔗 BSC Integration"
        ],
        blockchain: {
          network: "Binance Smart Chain",
          contracts: "Audited & Verified",
          gas: "Optimized Transactions",
          security: "Military-Grade Protection"
        }
      },
      background: "linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)",
      icon: <FaCode />
    },
    {
      id: 10,
      title: "Real-time Analytics",
      subtitle: "Data-Driven Insights",
      content: {
        headline: "Know Your Numbers",
        description: "Comprehensive analytics to track your success",
        features: [
          "📊 Live Dashboard",
          "📈 Earnings Tracking",
          "👥 Team Performance",
          "🎯 Goal Monitoring",
          "📉 Trend Analysis",
          "💰 Revenue Forecasting",
          "🔍 Detailed Reports",
          "📱 Mobile Analytics"
        ],
        analytics: {
          dashboard: "Real-Time Dashboard",
          tracking: "Comprehensive Tracking",
          reports: "Detailed Analytics",
          mobile: "Mobile Optimized"
        }
      },
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: <FaChartLine />
    },
    {
      id: 11,
      title: "Multi-language Support",
      subtitle: "Global Communication",
      content: {
        headline: "Speak Your Language",
        description: "Platform available in multiple languages for global reach",
        features: [
          "🌍 25+ Languages Supported",
          "🔄 Real-Time Translation",
          "📱 Localized Interface",
          "💬 Multi-Language Chat",
          "📖 Translated Documentation",
          "🎥 Localized Training Content",
          "🌐 Regional Customization",
          "🗣️ Voice Support"
        ],
        languages: {
          supported: "25+ Languages",
          translation: "AI-Powered Translation",
          localization: "Cultural Adaptation",
          support: "Native Language Support"
        }
      },
      background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      icon: <FaLanguage />
    },
    {
      id: 12,
      title: "Mobile-first Design",
      subtitle: "Optimized for Mobile",
      content: {
        headline: "Power in Your Pocket",
        description: "Full functionality optimized for mobile devices",
        features: [
          "📱 Native Mobile Experience",
          "⚡ Lightning Fast Loading",
          "👆 Touch-Optimized Interface",
          "🔔 Push Notifications",
          "📶 Offline Capabilities",
          "🔄 Cross-Device Sync",
          "📊 Mobile Analytics",
          "🔐 Biometric Security"
        ],
        mobile: {
          design: "Mobile-First Approach",
          performance: "Optimized Performance",
          features: "Full Feature Parity",
          security: "Enhanced Mobile Security"
        }
      },
      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      icon: <FaMobile />
    },
    {
      id: 13,
      title: "Automated Systems",
      subtitle: "Efficiency Through Automation",
      content: {
        headline: "Set It and Forget It",
        description: "Automated systems handle complex operations seamlessly",
        features: [
          "🤖 Automated Onboarding",
          "💰 Auto-Payment Distribution",
          "📊 Automated Reporting",
          "🔔 Smart Notifications",
          "🔄 Auto-Reinvestment Options",
          "📈 Performance Tracking",
          "🛡️ Security Monitoring",
          "⚡ Instant Verification"
        ],
        automation: {
          payments: "Automated Payouts",
          reporting: "Auto-Generated Reports",
          monitoring: "24/7 System Monitoring",
          optimization: "Performance Optimization"
        }
      },
      background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      icon: <FaCog />
    },
    {
      id: 14,
      title: "Revenue Streams",
      subtitle: "Multiple Income Sources",
      content: {
        headline: "Diversified Income",
        description: "Multiple ways to earn with Lead Five platform",
        streams: [
          {
            name: "Direct Referrals",
            description: "Earn from direct sign-ups",
            potential: "$10 per referral"
          },
          {
            name: "Matrix Commissions",
            description: "Passive income from matrix",
            potential: "Up to $153,600"
          },
          {
            name: "Binary Spillover",
            description: "Benefit from team spillover",
            potential: "Unlimited potential"
          },
          {
            name: "Leadership Bonuses",
            description: "Additional team bonuses",
            potential: "Performance based"
          }
        ],
        features: [
          "💰 Multiple Income Streams",
          "📈 Passive Income Potential",
          "🔄 Recurring Commissions",
          "🎯 Performance Bonuses"
        ]
      },
      background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      icon: <FaCoins />
    },
    {
      id: 15,
      title: "Market Opportunity",
      subtitle: "Trillion Dollar Industry",
      content: {
        headline: "Massive Market Potential",
        description: "Enter the multi-trillion dollar digital business industry",
        statistics: [
          {
            value: "$180B+",
            label: "Global Digital Business Market"
          },
          {
            value: "125M+",
            label: "Digital Business Participants Worldwide"
          },
          {
            value: "15%",
            label: "Annual Growth Rate"
          },
          {
            value: "$1T+",
            label: "Blockchain Market Projection"
          }
        ],
        features: [
          "📈 Growing Industry",
          "🌍 Global Reach",
          "💎 Blockchain Innovation",
          "🚀 First-Mover Advantage",
          "💰 Massive Opportunity",
          "🎯 Perfect Timing"
        ]
      },
      background: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
      icon: <FaTrophy />
    },
    {
      id: 16,
      title: "Competitive Advantages",
      subtitle: "What Sets Us Apart",
      content: {
        headline: "Unmatched Value Proposition",
        description: "Lead Five's unique advantages in the marketplace",
        advantages: [
          {
            title: "Blockchain Integration",
            description: "First digital business platform fully integrated with smart contracts"
          },
          {
            title: "Transparent Operations", 
            description: "All transactions visible on blockchain"
          },
          {
            title: "Low Entry Cost",
            description: "Just $50 USDT to start earning"
          },
          {
            title: "High Earning Potential",
            description: "Up to $153,600 total earnings"
          },
          {
            title: "Global Accessibility",
            description: "Available worldwide 24/7"
          },
          {
            title: "Advanced Technology",
            description: "AI-powered tools and analytics"
          }
        ]
      },
      background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      icon: <FaStar />
    },
    {
      id: 17,
      title: "Growth Strategy",
      subtitle: "Scaling for Success",
      content: {
        headline: "Strategic Growth Plan",
        description: "Our roadmap for explosive growth and market dominance",
        phases: [
          {
            phase: "Phase 1",
            title: "Foundation",
            goals: ["Launch Platform", "First 1,000 Users", "Establish Network"]
          },
          {
            phase: "Phase 2", 
            title: "Expansion",
            goals: ["Global Marketing", "Partnership Network", "Feature Enhancement"]
          },
          {
            phase: "Phase 3",
            title: "Domination",
            goals: ["Market Leadership", "Million Users", "Industry Standard"]
          }
        ],
        features: [
          "🎯 Clear Milestones",
          "📈 Aggressive Growth",
          "🤝 Strategic Partnerships",
          "🌍 Global Expansion"
        ]
      },
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: <FaArrowUp />
    },
    {
      id: 18,
      title: "Future Roadmap",
      subtitle: "Innovation Pipeline",
      content: {
        headline: "Continuous Innovation",
        description: "Upcoming features and enhancements",
        roadmap: [
          {
            quarter: "Q3 2025",
            items: ["Mobile App Launch", "Advanced Analytics", "NFT Integration"]
          },
          {
            quarter: "Q4 2025", 
            items: ["DeFi Integration", "Staking Rewards", "DAO Governance"]
          },
          {
            quarter: "Q1 2026",
            items: ["Metaverse Platform", "AI Optimization", "Global Expansion"]
          },
          {
            quarter: "Q2 2026",
            items: ["Cross-Chain Support", "Advanced Features", "Enterprise Solutions"]
          }
        ],
        vision: "To become the world's leading blockchain-based digital business platform"
      },
      background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      icon: <FaMap />
    },
    {
      id: 19,
      title: "Success Metrics",
      subtitle: "Measuring Our Impact",
      content: {
        headline: "Track Record of Success",
        description: "Key performance indicators and achievements",
        metrics: [
          {
            metric: "User Growth",
            value: "500%+",
            description: "Monthly user growth rate"
          },
          {
            metric: "Total Earnings",
            value: "$2M+",
            description: "Paid to users to date"
          },
          {
            metric: "Success Rate",
            value: "95%+",
            description: "User satisfaction rating"
          },
          {
            metric: "Platform Uptime",
            value: "99.9%",
            description: "System reliability"
          }
        ],
        features: [
          "📊 Real-Time Metrics",
          "🎯 Performance Tracking", 
          "📈 Growth Analytics",
          "🏆 Success Indicators"
        ]
      },
      background: "linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)",
      icon: <FaBullseye />
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/Lead_Five_Business_presentation.pdf';
    link.download = 'Lead_Five_Business_Presentation.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printSlides = () => {
    window.print();
  };

  const sharePresentation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Lead Five Business Presentation',
        text: 'Revolutionary Digital Business Platform',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const currentSlideData = slides[currentSlide];

  return (
    <div className={`presentation-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header Controls */}
      <div className="presentation-header">
        <div className="header-left">
          <h1>Lead Five Business Presentation</h1>
          <span className="slide-counter">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
        <div className="header-controls">
          <button onClick={downloadPDF} className="control-btn download-btn">
            <FaDownload /> Download PDF
          </button>
          <button onClick={printSlides} className="control-btn">
            <FaPrint /> Print
          </button>
          <button onClick={sharePresentation} className="control-btn">
            <FaShare /> Share
          </button>
          <button onClick={toggleFullscreen} className="control-btn">
            {isFullscreen ? '⛶' : '⛶'} Fullscreen
          </button>
        </div>
      </div>

      {/* Main Slide Display */}
      <div className="slide-display" style={{ background: currentSlideData.background }}>
        <div className="slide-content">
          <div className="slide-header">
            <div className="slide-icon">
              {currentSlideData.icon}
            </div>
            <h1 className="slide-title">{currentSlideData.title}</h1>
            <h2 className="slide-subtitle">{currentSlideData.subtitle}</h2>
          </div>

          <div className="slide-body">
            <h3 className="content-headline">{currentSlideData.content.headline}</h3>
            <p className="content-description">{currentSlideData.content.description}</p>

            {/* Features List */}
            {currentSlideData.content.features && (
              <div className="features-grid">
                {currentSlideData.content.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    {feature}
                  </div>
                ))}
              </div>
            )}

            {/* Matrix Information */}
            {currentSlideData.content.matrix && (
              <div className="matrix-info">
                <h4>Matrix Breakdown:</h4>
                <div className="matrix-grid">
                  <div>Level 1: {currentSlideData.content.matrix.level1}</div>
                  <div>Level 2: {currentSlideData.content.matrix.level2}</div>
                  <div>Level 3: {currentSlideData.content.matrix.level3}</div>
                  <div>Level 4: {currentSlideData.content.matrix.level4}</div>
                  <div>Level 5: {currentSlideData.content.matrix.level5}</div>
                  <div className="matrix-total">{currentSlideData.content.matrix.total}</div>
                </div>
              </div>
            )}

            {/* Level Income Information */}
            {currentSlideData.content.levelIncome && (
              <div className="level-income-info">
                <h4>Level Income System:</h4>
                <div className="level-income-grid">
                  <div className="income-detail">
                    <strong>Joining Amount:</strong> {currentSlideData.content.levelIncome.joining}
                  </div>
                  <div className="income-detail">
                    <strong>Per Level Earning:</strong> {currentSlideData.content.levelIncome.perLevel}
                  </div>
                  <div className="income-detail">
                    <strong>Depth:</strong> {currentSlideData.content.levelIncome.levels}
                  </div>
                  <div className="income-detail">
                    <strong>Help Pool:</strong> {currentSlideData.content.levelIncome.helpPool}
                  </div>
                  <div className="income-total">
                    <strong>{currentSlideData.content.levelIncome.maxEarnings}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Packages */}
            {currentSlideData.content.packages && (
              <div className="packages-section">
                {currentSlideData.content.packages.map((pkg, index) => (
                  <div key={index} className={`package-card ${pkg.popular ? 'popular' : ''}`}>
                    <h4>{pkg.name}</h4>
                    <div className="package-price">{pkg.price}</div>
                    {pkg.maxEarnings && (
                      <div className="package-max-earnings">Maximum Earnings: {pkg.maxEarnings}</div>
                    )}
                    <ul>
                      {pkg.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Statistics */}
            {currentSlideData.content.statistics && (
              <div className="statistics-grid">
                {currentSlideData.content.statistics.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Revenue Streams */}
            {currentSlideData.content.streams && (
              <div className="streams-section">
                {currentSlideData.content.streams.map((stream, index) => (
                  <div key={index} className="stream-card">
                    <h4>{stream.name}</h4>
                    <p>{stream.description}</p>
                    <div className="stream-potential">{stream.potential}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Advantages */}
            {currentSlideData.content.advantages && (
              <div className="advantages-grid">
                {currentSlideData.content.advantages.map((advantage, index) => (
                  <div key={index} className="advantage-card">
                    <h4>{advantage.title}</h4>
                    <p>{advantage.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Growth Phases */}
            {currentSlideData.content.phases && (
              <div className="phases-section">
                {currentSlideData.content.phases.map((phase, index) => (
                  <div key={index} className="phase-card">
                    <div className="phase-number">{phase.phase}</div>
                    <h4>{phase.title}</h4>
                    <ul>
                      {phase.goals.map((goal, i) => (
                        <li key={i}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Roadmap */}
            {currentSlideData.content.roadmap && (
              <div className="roadmap-section">
                {currentSlideData.content.roadmap.map((quarter, index) => (
                  <div key={index} className="roadmap-item">
                    <div className="quarter-label">{quarter.quarter}</div>
                    <ul>
                      {quarter.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {currentSlideData.content.vision && (
                  <div className="vision-statement">
                    <strong>Vision: </strong>{currentSlideData.content.vision}
                  </div>
                )}
              </div>
            )}

            {/* Metrics */}
            {currentSlideData.content.metrics && (
              <div className="metrics-grid">
                {currentSlideData.content.metrics.map((metric, index) => (
                  <div key={index} className="metric-card">
                    <div className="metric-value">{metric.value}</div>
                    <div className="metric-name">{metric.metric}</div>
                    <div className="metric-description">{metric.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="navigation-controls">
        <button onClick={prevSlide} className="nav-btn prev-btn">
          <FaChevronLeft />
        </button>
        
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
            />
          ))}
        </div>

        <button onClick={nextSlide} className="nav-btn next-btn">
          <FaChevronRight />
        </button>
      </div>

      {/* Slide Thumbnails (Hidden by default, shown on hover) */}
      <div className="slide-thumbnails">
        {slides.map((slide, index) => (
          <div
            key={index}
            onClick={() => goToSlide(index)}
            className={`thumbnail ${index === currentSlide ? 'active' : ''}`}
            style={{ background: slide.background }}
          >
            <div className="thumbnail-content">
              <div className="thumbnail-icon">{slide.icon}</div>
              <div className="thumbnail-title">{slide.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* PDF Download Call-to-Action */}
      <div className="pdf-cta">
        <div className="cta-content">
          <h3>📥 Download Complete Presentation</h3>
          <p>Get the full Lead Five business presentation as a PDF</p>
          <button onClick={downloadPDF} className="download-cta-btn">
            <FaDownload /> Download PDF Presentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessPresentationSlides;
