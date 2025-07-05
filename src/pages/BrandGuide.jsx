import React, { useState } from 'react';
import UnifiedWalletConnect from '../components/UnifiedWalletConnect';

const BrandGuide = ({ account, provider, signer, onConnect, onDisconnect }) => {
  const [copiedColor, setCopiedColor] = useState('');

  const copyToClipboard = color => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(''), 2000);
  };

  const logoVariants = [
    {
      name: 'Orbital Chain',
      description: 'Best for digital platforms and dynamic presentations',
      usage: 'Websites, apps, digital marketing, social media',
    },
    {
      name: 'Hexagonal Network',
      description: 'Perfect for corporate materials and static designs',
      usage: 'Business cards, letterheads, official documents',
    },
    {
      name: 'Chain Links',
      description: 'Ideal for merchandise and simplified applications',
      usage: 'T-shirts, stickers, simplified branding',
    },
  ];

  const colorPalette = {
    primary: [
      {
        name: 'Cyber Blue',
        hex: '#00D4FF',
        psychology: 'Trust and innovation',
      },
      {
        name: 'Royal Purple',
        hex: '#7B2CBF',
        psychology: 'Premium quality and sophistication',
      },
      {
        name: 'Energy Orange',
        hex: '#FF6B35',
        psychology: 'Enthusiasm and growth potential',
      },
    ],
    secondary: [
      {
        name: 'Deep Space',
        hex: '#1A1A2E',
        psychology: 'Primary background color',
      },
      {
        name: 'Midnight Blue',
        hex: '#16213E',
        psychology: 'Secondary background',
      },
      {
        name: 'Silver Mist',
        hex: '#B8C5D1',
        psychology: 'Readable text color',
      },
    ],
    accent: [
      {
        name: 'Success Green',
        hex: '#00FF88',
        psychology: 'Positive metrics and achievements',
      },
      {
        name: 'Alert Red',
        hex: '#FF4757',
        psychology: 'Urgent calls-to-action',
      },
      {
        name: 'Premium Gold',
        hex: '#FFD700',
        psychology: 'VIP tiers and special offers',
      },
    ],
    neutral: [
      {
        name: 'Pure White',
        hex: '#FFFFFF',
        psychology: 'Clean backgrounds and text',
      },
      {
        name: 'Charcoal Gray',
        hex: '#2D3748',
        psychology: 'Secondary text and borders',
      },
      { name: 'True Black', hex: '#0A0A0A', psychology: 'High contrast text' },
    ],
  };

  const LogoShowcase = () => (
    <div className="logo-showcase">
      <div className="logo-versions">
        {/* Transparent Background */}
        <div className="logo-variant">
          <h4>Transparent Background</h4>
          <div className="logo-preview transparent-bg">
            <svg
              width="150"
              height="150"
              viewBox="0 0 400 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="mainGradient1"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="50%" stopColor="#7b2cbf" />
                  <stop offset="100%" stopColor="#ff6b35" />
                </linearGradient>
                <linearGradient
                  id="darkGradient1"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#1a1a2e" />
                  <stop offset="100%" stopColor="#16213e" />
                </linearGradient>
              </defs>
              <g transform="translate(200, 200)">
                <path
                  d="M -80,-20 L -40,-80 L 0,-60 Z"
                  fill="url(#mainGradient1)"
                />
                <path
                  d="M -80,-20 L 0,-60 L -30,-10 Z"
                  fill="url(#darkGradient1)"
                  opacity="0.7"
                />
                <path
                  d="M 40,-80 L 80,-20 L 60,0 Z"
                  fill="url(#mainGradient1)"
                />
                <path
                  d="M 40,-80 L 60,0 L 0,-60 Z"
                  fill="url(#darkGradient1)"
                  opacity="0.7"
                />
                <path d="M 80,20 L 40,80 L 0,60 Z" fill="url(#mainGradient1)" />
                <path
                  d="M 80,20 L 0,60 L 30,10 Z"
                  fill="url(#darkGradient1)"
                  opacity="0.7"
                />
                <path
                  d="M -40,80 L -80,20 L -60,0 Z"
                  fill="url(#mainGradient1)"
                />
                <path
                  d="M -40,80 L -60,0 L 0,60 Z"
                  fill="url(#darkGradient1)"
                  opacity="0.7"
                />
                <path d="M -30,-10 L 0,-60 L 30,10 L 0,60 Z" fill="#16213e" />
              </g>
            </svg>
          </div>
          <p className="usage">
            Best for: Websites, overlays, digital platforms
          </p>
        </div>

        {/* Dark Background */}
        <div className="logo-variant">
          <h4>Dark Background</h4>
          <div className="logo-preview dark-bg">
            <svg
              width="150"
              height="150"
              viewBox="0 0 400 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="mainGradient2"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="50%" stopColor="#7b2cbf" />
                  <stop offset="100%" stopColor="#ff6b35" />
                </linearGradient>
                <linearGradient
                  id="darkGradient2"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#1a1a2e" />
                  <stop offset="100%" stopColor="#16213e" />
                </linearGradient>
              </defs>
              <g transform="translate(200, 200)">
                <path
                  d="M -80,-20 L -40,-80 L 0,-60 Z"
                  fill="url(#mainGradient2)"
                />
                <path
                  d="M -80,-20 L 0,-60 L -30,-10 Z"
                  fill="url(#darkGradient2)"
                  opacity="0.7"
                />
                <path
                  d="M 40,-80 L 80,-20 L 60,0 Z"
                  fill="url(#mainGradient2)"
                />
                <path
                  d="M 40,-80 L 60,0 L 0,-60 Z"
                  fill="url(#darkGradient2)"
                  opacity="0.7"
                />
                <path d="M 80,20 L 40,80 L 0,60 Z" fill="url(#mainGradient2)" />
                <path
                  d="M 80,20 L 0,60 L 30,10 Z"
                  fill="url(#darkGradient2)"
                  opacity="0.7"
                />
                <path
                  d="M -40,80 L -80,20 L -60,0 Z"
                  fill="url(#mainGradient2)"
                />
                <path
                  d="M -40,80 L -60,0 L 0,60 Z"
                  fill="url(#darkGradient2)"
                  opacity="0.7"
                />
                <path d="M -30,-10 L 0,-60 L 30,10 L 0,60 Z" fill="#0a0a0a" />
              </g>
            </svg>
          </div>
          <p className="usage">Best for: Dark themes, social media</p>
        </div>

        {/* Light Background */}
        <div className="logo-variant">
          <h4>Light Background</h4>
          <div className="logo-preview light-bg">
            <svg
              width="150"
              height="150"
              viewBox="0 0 400 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="mainGradient3"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="50%" stopColor="#7b2cbf" />
                  <stop offset="100%" stopColor="#ff6b35" />
                </linearGradient>
                <linearGradient
                  id="darkGradient3"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#1a1a2e" />
                  <stop offset="100%" stopColor="#16213e" />
                </linearGradient>
              </defs>
              <g transform="translate(200, 200)">
                <path
                  d="M -80,-20 L -40,-80 L 0,-60 Z"
                  fill="url(#mainGradient3)"
                />
                <path
                  d="M -80,-20 L 0,-60 L -30,-10 Z"
                  fill="url(#darkGradient3)"
                  opacity="0.7"
                />
                <path
                  d="M 40,-80 L 80,-20 L 60,0 Z"
                  fill="url(#mainGradient3)"
                />
                <path
                  d="M 40,-80 L 60,0 L 0,-60 Z"
                  fill="url(#darkGradient3)"
                  opacity="0.7"
                />
                <path d="M 80,20 L 40,80 L 0,60 Z" fill="url(#mainGradient3)" />
                <path
                  d="M 80,20 L 0,60 L 30,10 Z"
                  fill="url(#darkGradient3)"
                  opacity="0.7"
                />
                <path
                  d="M -40,80 L -80,20 L -60,0 Z"
                  fill="url(#mainGradient3)"
                />
                <path
                  d="M -40,80 L -60,0 L 0,60 Z"
                  fill="url(#darkGradient3)"
                  opacity="0.7"
                />
                <path
                  d="M -30,-10 L 0,-60 L 30,10 L 0,60 Z"
                  fill="#ffffff"
                  stroke="#16213e"
                  strokeWidth="2"
                />
              </g>
            </svg>
          </div>
          <p className="usage">Best for: Print materials, documents</p>
        </div>
      </div>
    </div>
  );

  const ColorSwatch = ({ name, hex, psychology }) => (
    <div className="color-swatch" onClick={() => copyToClipboard(hex)}>
      <div className="color-preview" style={{ backgroundColor: hex }}></div>
      <div className="color-info">
        <h4>{name}</h4>
        <div className="color-hex">{hex}</div>
        <div className="color-psychology">{psychology}</div>
        {copiedColor === hex && <div className="copied-indicator">Copied!</div>}
      </div>
    </div>
  );

  return (
    <div className="brand-guide-page">
      <div className="page-background">
        <div className="animated-bg"></div>
        <div className="gradient-overlay"></div>
      </div>

      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">LeadFive Brand Guidelines</h1>
          <p className="page-subtitle">
            Comprehensive brand identity and usage guidelines for the
            decentralized incentive network
          </p>
        </div>

        {!account && (
          <div className="wallet-connect-section">
            <UnifiedWalletConnect
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              buttonText="Connect Wallet for Brand Assets"
            />
          </div>
        )}

        {account && (
          <div className="brand-dashboard">
            <div className="brand-status-card">
              <h3>Brand Asset Access</h3>
              <div className="status-indicator active">
                <span className="status-icon">🎨</span>
                <span>Full Access Granted</span>
              </div>
              <p>Download high-res assets and brand templates</p>
            </div>
          </div>
        )}

        <div className="brand-content">
          {/* Logo Section */}
          <section className="brand-section">
            <h2>🎨 Logo & Visual Identity</h2>
            <p>
              Our logo represents innovation, trust, and the interconnected
              nature of blockchain technology.
            </p>
            <LogoShowcase />

            <div className="logo-variants">
              {logoVariants.map((variant, index) => (
                <div key={index} className="variant-card">
                  <h4>{variant.name}</h4>
                  <p>{variant.description}</p>
                  <div className="usage-list">
                    <strong>Usage:</strong> {variant.usage}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Color Palette Section */}
          <section className="brand-section">
            <h2>🌈 Color Palette</h2>

            <div className="color-category">
              <h3>Primary Colors</h3>
              <div className="color-grid">
                {colorPalette.primary.map((color, index) => (
                  <ColorSwatch key={index} {...color} />
                ))}
              </div>
            </div>

            <div className="color-category">
              <h3>Secondary Colors</h3>
              <div className="color-grid">
                {colorPalette.secondary.map((color, index) => (
                  <ColorSwatch key={index} {...color} />
                ))}
              </div>
            </div>

            <div className="color-category">
              <h3>Accent Colors</h3>
              <div className="color-grid">
                {colorPalette.accent.map((color, index) => (
                  <ColorSwatch key={index} {...color} />
                ))}
              </div>
            </div>

            <div className="color-category">
              <h3>Neutral Colors</h3>
              <div className="color-grid">
                {colorPalette.neutral.map((color, index) => (
                  <ColorSwatch key={index} {...color} />
                ))}
              </div>
            </div>
          </section>

          {/* Typography Section */}
          <section className="brand-section">
            <h2>📝 Typography</h2>
            <div className="typography-examples">
              <div className="type-example">
                <h1 className="brand-h1">Heading 1 - Brand Title</h1>
                <p>
                  Font: 'Segoe UI', system-ui, sans-serif | Weight: 800 | Size:
                  3.2rem
                </p>
              </div>
              <div className="type-example">
                <h2 className="brand-h2">Heading 2 - Section Title</h2>
                <p>
                  Font: 'Segoe UI', system-ui, sans-serif | Weight: 700 | Size:
                  2.4rem
                </p>
              </div>
              <div className="type-example">
                <h3 className="brand-h3">Heading 3 - Subsection</h3>
                <p>
                  Font: 'Segoe UI', system-ui, sans-serif | Weight: 600 | Size:
                  1.8rem
                </p>
              </div>
              <div className="type-example">
                <p className="brand-body">
                  Body Text - This is the standard paragraph text used
                  throughout the platform.
                </p>
                <p>
                  Font: 'Segoe UI', system-ui, sans-serif | Weight: 400 | Size:
                  1rem
                </p>
              </div>
            </div>
          </section>

          {/* Usage Guidelines */}
          <section className="brand-section">
            <h2>📋 Usage Guidelines</h2>

            <div className="guidelines-grid">
              <div className="guideline-card">
                <h4>✅ Do's</h4>
                <ul>
                  <li>Use adequate white space around the logo</li>
                  <li>Maintain aspect ratio when scaling</li>
                  <li>Use primary colors for call-to-action buttons</li>
                  <li>Apply gradients for dynamic backgrounds</li>
                  <li>Use Success Green for positive metrics</li>
                  <li>Use Premium Gold for VIP features</li>
                </ul>
              </div>

              <div className="guideline-card dont">
                <h4>❌ Don'ts</h4>
                <ul>
                  <li>Don't stretch or distort the logo</li>
                  <li>Don't use low contrast color combinations</li>
                  <li>Don't place logo on busy backgrounds</li>
                  <li>Don't use colors outside the palette</li>
                  <li>Don't use Comic Sans or unprofessional fonts</li>
                  <li>Don't make text smaller than 14px</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Digital Applications */}
          <section className="brand-section">
            <h2>💻 Digital Applications</h2>
            <div className="application-examples">
              <div className="app-example">
                <h4>Website Headers</h4>
                <p>
                  Use Deep Space (#1A1A2E) background with Silver Mist (#B8C5D1)
                  text
                </p>
              </div>
              <div className="app-example">
                <h4>Buttons & CTAs</h4>
                <p>
                  Primary gradient: Cyber Blue to Royal Purple with Energy
                  Orange accents
                </p>
              </div>
              <div className="app-example">
                <h4>Status Indicators</h4>
                <p>
                  Success Green for positive, Alert Red for warnings, Premium
                  Gold for premium features
                </p>
              </div>
              <div className="app-example">
                <h4>Social Media</h4>
                <p>
                  Use high-contrast logo versions, maintain brand colors in all
                  posts
                </p>
              </div>
            </div>
          </section>

          {/* Downloads Section */}
          {account && (
            <section className="brand-section">
              <h2>📥 Brand Assets Download</h2>
              <div className="download-section">
                <p>
                  Access high-resolution logos, color swatches, and brand
                  templates:
                </p>
                <div className="download-buttons">
                  <button className="download-btn primary">
                    Logo Package (.ZIP)
                  </button>
                  <button className="download-btn secondary">
                    Color Palette (.ASE)
                  </button>
                  <button className="download-btn secondary">
                    Brand Template (.PSD)
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandGuide;
