/**
 * Lead Five Business Knowledge Base
 * Structured data from the official Lead Five business presentation
 * Exact terminology and compensation details as per PDF documentation
 */

export const businessKnowledgeBase = {
  metadata: {
    version: "2.0.0",
    lastUpdated: new Date().toISOString(),
    totalSlides: 19,
    categories: ["platform", "compensation", "security", "technology", "community", "features", "growth"]
  },

  slides: [
    {
      id: "slide-01",
      title: "Lead Five - Revolutionary Digital Platform",
      category: "platform",
      keywords: ["Lead Five", "blockchain", "platform", "digital", "business", "compensation"],
      seoTitle: "Lead Five - Revolutionary Digital Business Platform",
      seoDescription: "Lead Five is a cutting-edge digital platform built on blockchain technology, offering secure, transparent, and profitable business opportunities through innovative compensation plans.",
      content: {
        mainHeading: "Lead Five - Revolutionary Digital Platform",
        subheading: "The Future of Digital Business",
        bulletPoints: [
          "Built on secure BSC blockchain technology",
          "Transparent compensation system",
          "Global digital accessibility",
          "Smart contract automation",
          "Real-time earnings tracking",
          "Entry package: $50 USDT",
          "Maximum earnings potential: $153,600"
        ],
        keyMetrics: {
          "Entry Investment": "$50 USDT",
          "Maximum Earnings": "$153,600",
          "Blockchain": "BSC Network",
          "Global Reach": "190+ Countries",
          "Smart Contracts": "Audited & Verified"
        }
      },
      chatbotContext: "Lead Five is a revolutionary digital business platform built on blockchain technology. The platform offers a unique compensation plan starting with a $50 USDT entry package and maximum earnings potential of $153,600. It uses smart contracts for automated, transparent operations.",
      htmlContent: `
        <div class="slide-content">
          <h1>Lead Five - Revolutionary Digital Platform</h1>
          <h2>The Future of Digital Business</h2>
          <ul>
            <li>Built on secure blockchain technology</li>
            <li>Transparent compensation system</li>
            <li>Global accessibility</li>
            <li>Smart contract automation</li>
            <li>Real-time earnings tracking</li>
          </ul>
        </div>
      `
    },

    {
      id: "slide-02",
      title: "Platform Features & Capabilities",
      category: "features",
      keywords: ["features", "capabilities", "dashboard", "tools", "analytics"],
      seoTitle: "Lead Five Platform Features - Advanced Business Tools & Analytics",
      seoDescription: "Explore Lead Five's comprehensive platform features including real-time analytics, team management tools, and automated compensation systems.",
      content: {
        mainHeading: "Platform Features & Capabilities",
        sections: [
          {
            title: "Real-Time Dashboard",
            features: [
              "Live earnings tracking",
              "Team performance metrics",
              "Interactive genealogy tree",
              "Advanced analytics"
            ]
          },
          {
            title: "AI-Powered Tools",
            features: [
              "Smart business coaching",
              "Predictive analytics",
              "Automated insights",
              "Voice assistant integration"
            ]
          },
          {
            title: "Blockchain Integration",
            features: [
              "Smart contract automation",
              "Transparent transactions",
              "Secure wallet connectivity",
              "Real-time verification"
            ]
          }
        ]
      },
      chatbotContext: "Lead Five offers comprehensive platform features including a real-time dashboard with live earnings tracking, AI-powered business tools, and full blockchain integration. The platform provides smart business coaching, predictive analytics, and automated insights through AI.",
      htmlContent: `
        <div class="slide-content">
          <h1>Platform Features & Capabilities</h1>
          <div class="features-grid">
            <div class="feature-section">
              <h3>Real-Time Dashboard</h3>
              <ul>
                <li>Live earnings tracking</li>
                <li>Team performance metrics</li>
                <li>Interactive genealogy tree</li>
                <li>Advanced analytics</li>
              </ul>
            </div>
            <div class="feature-section">
              <h3>AI-Powered Tools</h3>
              <ul>
                <li>Smart business coaching</li>
                <li>Predictive analytics</li>
                <li>Automated insights</li>
                <li>Voice assistant integration</li>
              </ul>
            </div>
          </div>
        </div>
      `
    },

    {
      id: "slide-03",
      title: "Security & Trust Framework",
      category: "security",
      keywords: ["security", "trust", "blockchain", "smart contracts", "audit"],
      seoTitle: "Lead Five Security Framework - Blockchain-Powered Trust & Safety",
      seoDescription: "Lead Five's comprehensive security framework includes audited smart contracts, blockchain transparency, and military-grade encryption for ultimate trust.",
      content: {
        mainHeading: "Security & Trust Framework",
        securityFeatures: [
          {
            title: "Smart Contract Security",
            description: "Audited and verified smart contracts",
            details: [
              "Third-party security audits",
              "Open source verification",
              "Immutable blockchain records",
              "Automated compliance checks"
            ]
          },
          {
            title: "Data Protection",
            description: "Military-grade encryption and privacy",
            details: [
              "End-to-end encryption",
              "GDPR compliance",
              "Secure data storage",
              "Privacy-first design"
            ]
          },
          {
            title: "Financial Security",
            description: "Transparent and secure transactions",
            details: [
              "Blockchain transparency",
              "Real-time verification",
              "Fraud prevention",
              "Secure wallet integration"
            ]
          }
        ]
      },
      chatbotContext: "Lead Five prioritizes security through audited smart contracts, military-grade encryption, and full blockchain transparency. All smart contracts are third-party audited, data is protected with end-to-end encryption, and financial transactions are secured through blockchain verification.",
      htmlContent: `
        <div class="slide-content">
          <h1>Security & Trust Framework</h1>
          <div class="security-grid">
            <div class="security-feature">
              <h3>Smart Contract Security</h3>
              <p>Audited and verified smart contracts</p>
              <ul>
                <li>Third-party security audits</li>
                <li>Open source verification</li>
                <li>Immutable blockchain records</li>
              </ul>
            </div>
          </div>
        </div>
      `
    },

    {
      id: "slide-04",
      title: "Compensation Plan Structure",
      category: "compensation",
      keywords: ["compensation", "earnings", "matrix", "referral", "bonuses"],
      seoTitle: "Lead Five Compensation Plan - Maximize Your Earnings Potential",
      seoDescription: "Discover Lead Five's comprehensive compensation plan with matrix bonuses, referral rewards, and multiple income streams designed for maximum profitability.",
      content: {
        mainHeading: "Compensation Plan Structure",
        mainHeading: "Compensation Plan Structure",
        planOverview: {
          joiningAmount: "$50 USDT",
          levelIncome: "10 Levels Deep", 
          helpPoolBonus: "Global Pool Sharing",
          maxEarnings: "$153,600",
          payoutFrequency: "Real-time"
        },
        incomeStreams: [
          {
            type: "Level Income",
            percentage: "$5 per registration",
            description: "Earnings from 10 levels deep on direct and indirect registrations"
          },
          {
            type: "Help Pool Bonus",
            percentage: "Pool sharing",
            description: "Share in global help pool based on qualification"
          },
          {
            type: "Leadership Rewards",
            percentage: "Performance based",
            description: "Additional rewards for achieving leadership ranks"
          },
          {
            type: "Rank Advancement Bonus",
            percentage: "Achievement based",
            description: "Bonus rewards for advancing to higher ranks"
          }
        ],
        packages: [
          {
            name: "Lead Five Package",
            price: "$50 USDT",
            totalEarnings: "$153,600",
            description: "Single entry package with maximum earning potential"
          }
        ]
      },
      chatbotContext: "Lead Five uses a level-based compensation plan with a single $50 USDT joining amount. Members earn $5 for each registration across 10 levels, participate in help pool bonus sharing, and can achieve maximum earnings of $153,600. The platform also offers leadership rewards and rank advancement bonuses.",
      htmlContent: `
        <div class="slide-content">
          <h1>Compensation Plan Structure</h1>
          <div class="compensation-overview">
            <div class="level-info">
              <h3>Level Income System</h3>
              <ul>
                <li>10 levels deep earning</li>
                <li>$5 per registration on each level</li>
                <li>Real-time payouts</li>
                <li>Maximum potential: $153,600</li>
              </ul>
            </div>
          </div>
        </div>
      `
    },

    {
      id: "slide-05",
      title: "Technology Stack & Innovation",
      category: "technology",
      keywords: ["technology", "blockchain", "BSC", "smart contracts", "innovation"],
      seoTitle: "Lead Five Technology Stack - Advanced Blockchain Innovation",
      seoDescription: "Lead Five leverages cutting-edge blockchain technology on BSC network with smart contracts, AI integration, and innovative features.",
      content: {
        mainHeading: "Technology Stack & Innovation",
        technologies: [
          {
            category: "Blockchain Infrastructure",
            items: [
              "BSC (Binance Smart Chain) Network",
              "Solidity Smart Contracts",
              "Web3 Integration",
              "MetaMask Compatibility"
            ]
          },
          {
            category: "Frontend Technologies",
            items: [
              "React.js Framework",
              "Real-time WebSockets",
              "Progressive Web App (PWA)",
              "Mobile-First Design"
            ]
          },
          {
            category: "AI & Analytics",
            items: [
              "OpenAI GPT Integration",
              "Predictive Analytics",
              "Voice Assistant (ElevenLabs)",
              "Smart Business Coaching"
            ]
          },
          {
            category: "Security & Compliance",
            items: [
              "Multi-signature Wallets",
              "Encrypted Communications",
              "GDPR Compliance",
              "Security Audits"
            ]
          }
        ]
      },
      chatbotContext: "Lead Five is built on the BSC (Binance Smart Chain) network using Solidity smart contracts. The platform features React.js frontend, AI integration with OpenAI GPT and ElevenLabs voice assistant, real-time analytics, and comprehensive security measures including multi-signature wallets and encryption.",
      htmlContent: `
        <div class="slide-content">
          <h1>Technology Stack & Innovation</h1>
          <div class="tech-grid">
            <div class="tech-category">
              <h3>Blockchain Infrastructure</h3>
              <ul>
                <li>BSC (Binance Smart Chain) Network</li>
                <li>Solidity Smart Contracts</li>
                <li>Web3 Integration</li>
              </ul>
            </div>
          </div>
        </div>
      `
    }

    // Note: This is a condensed version showing the structure.
    // In the full implementation, all 19 slides would be included here
    // with complete data following the same pattern.
  ],

  // Categories for easy filtering and organization
  categories: {
    overview: {
      name: "Platform Overview",
      description: "General information about Lead Five platform",
      slides: ["slide-01"]
    },
    features: {
      name: "Features & Capabilities",
      description: "Platform features and user capabilities",
      slides: ["slide-02"]
    },
    security: {
      name: "Security & Trust",
      description: "Security measures and trust framework",
      slides: ["slide-03"]
    },
    compensation: {
      name: "Compensation Plan",
      description: "Earnings structure and compensation details",
      slides: ["slide-04"]
    },
    technology: {
      name: "Technology Stack",
      description: "Technical infrastructure and innovations",
      slides: ["slide-05"]
    }
  },

  // Search functionality for the knowledge base
  searchIndex: {
    keywords: [
      "Lead Five", "blockchain", "BSC", "smart contracts", "compensation", 
      "level income", "help pool", "security", "AI", "dashboard", "earnings",
      "technology", "React", "Web3", "USDT", "MetaMask", "joining amount"
    ],
    concepts: [
      {
        term: "Level Income System",
        definition: "A compensation structure where members earn $5 for each registration across 10 levels deep",
        relatedSlides: ["slide-04"]
      },
      {
        term: "Help Pool Bonus",
        definition: "Global pool sharing system where qualified members receive bonus distributions",
        relatedSlides: ["slide-04"]
      },
      {
        term: "BSC Network",
        definition: "Binance Smart Chain - the blockchain network powering Lead Five's smart contracts",
        relatedSlides: ["slide-05", "slide-03"]
      },
      {
        term: "Smart Contracts",
        definition: "Automated blockchain programs that execute compensation and handle transactions transparently",
        relatedSlides: ["slide-03", "slide-05"]
      }
    ]
  }
};

// Helper functions for accessing knowledge base data
export const knowledgeBaseHelpers = {
  // Get slide by ID
  getSlide: (slideId) => {
    return businessKnowledgeBase.slides.find(slide => slide.id === slideId);
  },

  // Get slides by category
  getSlidesByCategory: (category) => {
    return businessKnowledgeBase.slides.filter(slide => slide.category === category);
  },

  // Search slides by keyword
  searchSlides: (query) => {
    const lowercaseQuery = query.toLowerCase();
    return businessKnowledgeBase.slides.filter(slide => 
      slide.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery)) ||
      slide.title.toLowerCase().includes(lowercaseQuery) ||
      slide.chatbotContext.toLowerCase().includes(lowercaseQuery)
    );
  },

  // Get chatbot context for specific topics
  getChatbotContext: (topic) => {
    const relevantSlides = knowledgeBaseHelpers.searchSlides(topic);
    return relevantSlides.map(slide => ({
      title: slide.title,
      context: slide.chatbotContext,
      category: slide.category
    }));
  },

  // Get SEO-optimized content for a category
  getSEOContent: (category) => {
    const categorySlides = knowledgeBaseHelpers.getSlidesByCategory(category);
    return categorySlides.map(slide => ({
      title: slide.seoTitle,
      description: slide.seoDescription,
      keywords: slide.keywords,
      content: slide.htmlContent
    }));
  }
};

export default businessKnowledgeBase;
