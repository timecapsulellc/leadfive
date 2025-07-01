/**
 * Business Presentation Page
 * Full-page presentation of Lead Five business knowledge
 * SEO-optimized standalone page for business information
 */

import React, { useEffect } from 'react';
// import { Helmet } from 'react-helmet-async';
import BusinessKnowledgeDashboard from '../components/BusinessKnowledgeDashboard';
import { businessKnowledgeBase } from '../data/knowledgeBase';
import './BusinessPresentation.css';

const BusinessPresentation = () => {
  useEffect(() => {
    // Preload critical business data
    console.log('📊 Business Knowledge Base loaded:', businessKnowledgeBase.metadata);
  }, []);

  const generatePageMetadata = () => {
    const allSlides = businessKnowledgeBase.slides;
    const allKeywords = [...new Set(allSlides.flatMap(slide => slide.keywords))];
    
    return {
      title: "Lead Five Business Presentation - Revolutionary Digital Business Platform",
      description: "Comprehensive business presentation of Lead Five - a revolutionary digital business platform built on blockchain technology with level income system, AI-powered tools, and military-grade security.",
      keywords: allKeywords.join(", "),
      canonicalUrl: `${window.location.origin}/business-presentation`,
      ogTitle: "Lead Five - Revolutionary Digital Business Platform Presentation",
      ogDescription: "Discover Lead Five's cutting-edge digital business platform with blockchain technology, smart contracts, AI integration, and comprehensive compensation plans.",
      ogImage: `${window.location.origin}/business-presentation-og.jpg`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Lead Five Business Presentation",
        "description": "Comprehensive business presentation of Lead Five digital business platform",
        "url": `${window.location.origin}/business-presentation`,
        "mainEntity": {
          "@type": "Organization",
          "name": "Lead Five",
          "description": "Revolutionary digital business platform built on blockchain technology",
          "url": `${window.location.origin}`,
          "foundingDate": "2024",
          "industry": "Digital Business Technology",
          "features": [
            "Blockchain Technology",
            "Smart Contracts", 
            "AI-Powered Tools",
            "Level Income System",
            "Help Pool Bonus",
            "Real-time Analytics"
          ],
          "technology": [
            "BSC Network",
            "Solidity Smart Contracts",
            "React.js",
            "OpenAI Integration",
            "Web3 Technology"
          ]
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": window.location.origin
            },
            {
              "@type": "ListItem", 
              "position": 2,
              "name": "Business Presentation",
              "item": `${window.location.origin}/business-presentation`
            }
          ]
        }
      }
    };
  };

  const metadata = generatePageMetadata();

  return (
    <>
      {/* SEO and Meta Tags */}
      {/* <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <link rel="canonical" href={metadata.canonicalUrl} />
        
        <meta property="og:title" content={metadata.ogTitle} />
        <meta property="og:description" content={metadata.ogDescription} />
        <meta property="og:image" content={metadata.ogImage} />
        <meta property="og:url" content={metadata.canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Lead Five" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.ogTitle} />
        <meta name="twitter:description" content={metadata.ogDescription} />
        <meta name="twitter:image" content={metadata.ogImage} />
        
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Lead Five" />
        <meta name="theme-color" content="#667eea" />
        
        <script type="application/ld+json">
          {JSON.stringify(metadata.structuredData)}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Lead Five Digital Platform",
            "description": "Revolutionary blockchain-based digital business platform with smart contracts and AI integration",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "50",
              "priceCurrency": "USDT",
              "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "150"
            },
            "features": [
              "3x10 Matrix Compensation",
              "Smart Contract Automation", 
              "Real-time Analytics",
              "AI Business Coaching",
              "Blockchain Security"
            ]
          })}
        </script>
      </Helmet> */}

      {/* Page Content */}
      <div className="business-presentation-page">
        {/* SEO-friendly header */}
        <header className="presentation-header" style={{ display: 'none' }}>
          <h1>Lead Five Business Presentation - Revolutionary Digital Platform</h1>
          <p>
            Comprehensive overview of Lead Five's blockchain-based digital business platform featuring 
            smart contracts, AI integration, and innovative compensation structures.
          </p>
          
          {/* Hidden SEO content */}
          <div className="seo-content">
            <h2>Platform Features</h2>
            <ul>
              <li>Blockchain Technology on BSC Network</li>
              <li>Smart Contract Automation</li>
              <li>Level Income System with $50 USDT joining amount</li>
              <li>AI-Powered Business Tools</li>
              <li>Real-time Analytics Dashboard</li>
              <li>Military-Grade Security</li>
              <li>Global Accessibility</li>
            </ul>
            
            <h2>Technology Stack</h2>
            <ul>
              <li>BSC (Binance Smart Chain) Integration</li>
              <li>Solidity Smart Contracts</li>
              <li>React.js Frontend</li>
              <li>OpenAI GPT Integration</li>
              <li>Web3 Wallet Connectivity</li>
              <li>Progressive Web App (PWA)</li>
            </ul>
            
            <h2>Compensation Structure</h2>
            <ul>
              <li>Joining Amount: $50 USDT</li>
              <li>Level Income: $5 per registration across 10 levels</li>
              <li>Help Pool Bonus: Global pool sharing</li>
              <li>Leadership Rewards: Performance based</li>
              <li>Rank Advancement Bonus: Achievement based</li>
              <li>Maximum Earnings Potential: $153,600</li>
            </ul>
            
            <h2>Security & Trust</h2>
            <ul>
              <li>Third-party Security Audits</li>
              <li>Open Source Verification</li>
              <li>Immutable Blockchain Records</li>
              <li>End-to-end Encryption</li>
              <li>GDPR Compliance</li>
              <li>Multi-signature Wallets</li>
            </ul>
          </div>
        </header>

        {/* Main Business Knowledge Dashboard */}
        <main role="main">
          <BusinessKnowledgeDashboard isStandalone={true} />
          
          {/* Enhanced Presentation Options */}
          <div className="presentation-options">
            <div className="options-container">
              <h2>📊 Complete Business Presentation</h2>
              <p>Explore our comprehensive business overview in different formats</p>
              
              <div className="options-grid">
                <div className="option-card">
                  <div className="option-icon">🎯</div>
                  <h3>Interactive Slides</h3>
                  <p>Full presentation with 19 detailed slides, navigation controls, and interactive features</p>
                  <a href="/business-slides" className="option-btn primary">
                    View Interactive Slides
                  </a>
                </div>
                
                <div className="option-card">
                  <div className="option-icon">📥</div>
                  <h3>Download PDF</h3>
                  <p>Get the complete Lead Five business presentation as a downloadable PDF document</p>
                  <a href="/Lead_Five_Business_presentation.pdf" download className="option-btn secondary">
                    Download PDF (2.3 MB)
                  </a>
                </div>
                
                <div className="option-card">
                  <div className="option-icon">🤖</div>
                  <h3>AI Assistant</h3>
                  <p>Ask our AI assistant any questions about Lead Five's business model and features</p>
                  <a href="/dashboard" className="option-btn tertiary">
                    Chat with AI
                  </a>
                </div>
              </div>
              
              <div className="quick-facts">
                <div className="fact-item">
                  <strong>19 Slides</strong>
                  <span>Complete Coverage</span>
                </div>
                <div className="fact-item">
                  <strong>$50 USDT</strong>
                  <span>Entry Investment</span>
                </div>
                <div className="fact-item">
                  <strong>$153,600</strong>
                  <span>Max Potential Earnings</span>
                </div>
                <div className="fact-item">
                  <strong>Level Income</strong>
                  <span>Compensation Plan</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Hidden footer with additional SEO content */}
        <footer className="presentation-footer" style={{ display: 'none' }}>
          <div className="footer-content">
            <h3>About Lead Five</h3>
            <p>
              Lead Five represents the next evolution in digital business, combining 
              blockchain technology with artificial intelligence to create a transparent, 
              secure, and profitable platform for global entrepreneurs.
            </p>
            
            <h4>Key Benefits</h4>
            <ul>
              <li>Transparent blockchain-based compensation</li>
              <li>Automated smart contract payments</li>
              <li>AI-powered business insights</li>
              <li>Global accessibility and compliance</li>
              <li>Military-grade security protocols</li>
            </ul>
            
            <h4>Technology Advantages</h4>
            <ul>
              <li>Built on proven BSC network</li>
              <li>Audited smart contracts</li>
              <li>Real-time transaction verification</li>
              <li>Cross-platform compatibility</li>
              <li>Scalable infrastructure</li>
            </ul>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BusinessPresentation;
