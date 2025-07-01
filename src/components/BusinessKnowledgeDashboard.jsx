/**
 * Business Knowledge Dashboard
 * Interactive presentation of Lead Five business slides
 * SEO-optimized and user-friendly interface
 */

import React, { useState, useEffect } from 'react';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaSearch, 
  FaFilter,
  FaExpand,
  FaCompress,
  FaBookmark,
  FaShare,
  FaPrint,
  FaDownload,
  FaLightbulb,
  FaChartLine,
  FaShieldAlt,
  FaDollarSign,
  FaCog,
  FaBullhorn,
  FaCheckCircle
} from 'react-icons/fa';
import { businessKnowledgeBase, knowledgeBaseHelpers } from '../data/knowledgeBase';
import './BusinessKnowledgeDashboard.css';

const BusinessKnowledgeDashboard = ({ isStandalone = false }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filteredSlides, setFilteredSlides] = useState(businessKnowledgeBase.slides);
  const [showSearch, setShowSearch] = useState(false);

  // Category icons mapping
  const categoryIcons = {
    overview: FaLightbulb,
    features: FaCog,
    security: FaShieldAlt,
    compensation: FaDollarSign,
    technology: FaCog,
    marketing: FaBullhorn,
    compliance: FaCheckCircle
  };

  // Filter slides based on category and search
  useEffect(() => {
    let slides = businessKnowledgeBase.slides;

    // Filter by category
    if (selectedCategory !== 'all') {
      slides = knowledgeBaseHelpers.getSlidesByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      slides = knowledgeBaseHelpers.searchSlides(searchQuery);
    }

    setFilteredSlides(slides);
    setCurrentSlideIndex(0);
  }, [selectedCategory, searchQuery]);

  const currentSlide = filteredSlides[currentSlideIndex];

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => 
      prev < filteredSlides.length - 1 ? prev + 1 : 0
    );
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => 
      prev > 0 ? prev - 1 : filteredSlides.length - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlideIndex(index);
  };

  // SEO: Generate structured data for current slide
  const generateStructuredData = (slide) => {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": slide.seoTitle,
      "description": slide.seoDescription,
      "keywords": slide.keywords.join(", "),
      "author": {
        "@type": "Organization",
        "name": "Lead Five"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Lead Five",
        "logo": {
          "@type": "ImageObject",
          "url": "/logo.png"
        }
      },
      "dateModified": businessKnowledgeBase.metadata.lastUpdated
    };
  };

  if (!currentSlide) {
    return (
      <div className="business-knowledge-dashboard no-results">
        <div className="no-results-content">
          <FaSearch className="no-results-icon" />
          <h3>No slides found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`business-knowledge-dashboard ${isFullscreen ? 'fullscreen' : ''} ${isStandalone ? 'standalone' : ''}`}>
      {/* SEO: Structured data for current slide */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateStructuredData(currentSlide)) }}
      />

      {/* Header Controls */}
      <div className="dashboard-header">
        <div className="header-left">
          <h2 className="dashboard-title">
            Lead Five Business Knowledge
          </h2>
          <div className="slide-counter">
            {currentSlideIndex + 1} of {filteredSlides.length}
          </div>
        </div>

        <div className="header-controls">
          {/* Search Toggle */}
          <button 
            className={`control-btn ${showSearch ? 'active' : ''}`}
            onClick={() => setShowSearch(!showSearch)}
            title="Search slides"
          >
            <FaSearch />
          </button>

          {/* Fullscreen Toggle */}
          <button 
            className="control-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>

          {/* Share Button */}
          <button 
            className="control-btn"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: currentSlide.seoTitle,
                  text: currentSlide.seoDescription,
                  url: window.location.href
                });
              }
            }}
            title="Share slide"
          >
            <FaShare />
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      {showSearch && (
        <div className="search-filter-bar">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search business knowledge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filter">
            <FaFilter className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              {Object.entries(businessKnowledgeBase.categories).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="main-content">
        {/* Slide Navigation Sidebar */}
        <div className="slide-navigation">
          <h4>Slides</h4>
          <div className="slide-list">
            {filteredSlides.map((slide, index) => {
              const IconComponent = categoryIcons[slide.category] || FaLightbulb;
              return (
                <div
                  key={slide.id}
                  className={`slide-nav-item ${index === currentSlideIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                >
                  <IconComponent className="slide-icon" />
                  <div className="slide-nav-content">
                    <div className="slide-nav-title">{slide.title}</div>
                    <div className="slide-nav-category">{slide.category}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slide Content */}
        <div className="slide-content-container">
          {/* SEO: Semantic HTML structure */}
          <article className="slide-content" itemScope itemType="https://schema.org/Article">
            <header className="slide-header">
              <h1 itemProp="headline">{currentSlide.title}</h1>
              <div className="slide-meta">
                <span className="slide-category" itemProp="articleSection">
                  {businessKnowledgeBase.categories[currentSlide.category]?.name || currentSlide.category}
                </span>
                <div className="slide-keywords" itemProp="keywords">
                  {currentSlide.keywords.map(keyword => (
                    <span key={keyword} className="keyword-tag">{keyword}</span>
                  ))}
                </div>
              </div>
            </header>

            <div className="slide-body" itemProp="articleBody">
              {/* Render slide content based on structure */}
              {currentSlide.content.mainHeading && (
                <h2 className="main-heading">{currentSlide.content.mainHeading}</h2>
              )}

              {currentSlide.content.subheading && (
                <h3 className="sub-heading">{currentSlide.content.subheading}</h3>
              )}

              {/* Bullet Points */}
              {currentSlide.content.bulletPoints && (
                <ul className="bullet-points">
                  {currentSlide.content.bulletPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              )}

              {/* Key Metrics */}
              {currentSlide.content.keyMetrics && (
                <div className="key-metrics">
                  <h4>Key Metrics</h4>
                  <div className="metrics-grid">
                    {Object.entries(currentSlide.content.keyMetrics).map(([key, value]) => (
                      <div key={key} className="metric-item">
                        <span className="metric-label">{key}</span>
                        <span className="metric-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sections (for features slide) */}
              {currentSlide.content.sections && (
                <div className="content-sections">
                  {currentSlide.content.sections.map((section, index) => (
                    <div key={index} className="content-section">
                      <h4>{section.title}</h4>
                      <ul>
                        {section.features.map((feature, fIndex) => (
                          <li key={fIndex}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Security Features */}
              {currentSlide.content.securityFeatures && (
                <div className="security-features">
                  {currentSlide.content.securityFeatures.map((feature, index) => (
                    <div key={index} className="security-feature">
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                      <ul>
                        {feature.details.map((detail, dIndex) => (
                          <li key={dIndex}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Compensation Plan Overview */}
              {currentSlide.content.planOverview && (
                <div className="plan-overview">
                  <h4>Plan Overview</h4>
                  <div className="plan-stats">
                    {Object.entries(currentSlide.content.planOverview).map(([key, value]) => (
                      <div key={key} className="plan-stat">
                        <span className="stat-label">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        <span className="stat-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Income Streams */}
              {currentSlide.content.incomeStreams && (
                <div className="income-streams">
                  <h4>Income Streams</h4>
                  {currentSlide.content.incomeStreams.map((stream, index) => (
                    <div key={index} className="income-stream">
                      <div className="stream-header">
                        <span className="stream-type">{stream.type}</span>
                        <span className="stream-percentage">{stream.percentage}</span>
                      </div>
                      <p className="stream-description">{stream.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Packages */}
              {currentSlide.content.packages && (
                <div className="packages">
                  <h4>Investment Packages</h4>
                  <div className="packages-grid">
                    {currentSlide.content.packages.map((pkg, index) => (
                      <div key={index} className="package-card">
                        <h5>{pkg.name}</h5>
                        <div className="package-price">{pkg.price}</div>
                        <div className="package-earnings">Potential Earnings: {pkg.totalEarnings}</div>
                        {pkg.description && <div className="package-description">{pkg.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies */}
              {currentSlide.content.technologies && (
                <div className="technologies">
                  {currentSlide.content.technologies.map((tech, index) => (
                    <div key={index} className="tech-category">
                      <h4>{tech.category}</h4>
                      <ul>
                        {tech.items.map((item, iIndex) => (
                          <li key={iIndex}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chatbot Context for Developers */}
            {process.env.NODE_ENV === 'development' && (
              <details className="developer-info">
                <summary>Chatbot Context (Dev Only)</summary>
                <pre className="chatbot-context">{currentSlide.chatbotContext}</pre>
              </details>
            )}
          </article>

          {/* Navigation Controls */}
          <div className="slide-navigation-controls">
            <button 
              className="nav-btn prev-btn"
              onClick={prevSlide}
              disabled={filteredSlides.length <= 1}
            >
              <FaChevronLeft />
              Previous
            </button>

            <div className="slide-indicators">
              {filteredSlides.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlideIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>

            <button 
              className="nav-btn next-btn"
              onClick={nextSlide}
              disabled={filteredSlides.length <= 1}
            >
              Next
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="dashboard-footer">
        <div className="knowledge-base-info">
          <span>Knowledge Base v{businessKnowledgeBase.metadata.version}</span>
          <span>•</span>
          <span>{businessKnowledgeBase.metadata.totalSlides} slides</span>
          <span>•</span>
          <span>Last updated: {new Date(businessKnowledgeBase.metadata.lastUpdated).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default BusinessKnowledgeDashboard;
