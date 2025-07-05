import React, { useState, useEffect } from 'react';
import coinMarketCapService from '../services/coinMarketCapService';
import './MarketDataWidget.css';

const MarketDataWidget = ({
  compact = false,
  showChart = false,
  refreshInterval = 60000, // 1 minute
}) => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch market data
  const fetchMarketData = async () => {
    try {
      setError(null);
      const summary = await coinMarketCapService.getMarketSummary();
      setMarketData(summary);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to load market data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();

    const interval = setInterval(fetchMarketData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleRefresh = () => {
    setLoading(true);
    coinMarketCapService.clearCache();
    fetchMarketData();
  };

  if (loading) {
    return (
      <div className={`market-data-widget loading ${compact ? 'compact' : ''}`}>
        <div className="widget-header">
          <h3>Market Overview</h3>
          <span className="loading-indicator">⏳</span>
        </div>
        <div className="loading-content">
          <p>Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className={`market-data-widget error ${compact ? 'compact' : ''}`}>
        <div className="widget-header">
          <h3>Market Overview</h3>
          <button onClick={handleRefresh} className="refresh-btn">
            🔄
          </button>
        </div>
        <div className="error-content">
          <p>Market data unavailable</p>
        </div>
      </div>
    );
  }

  const { cryptos, averageChange, lastUpdated } = marketData;

  return (
    <div className={`market-data-widget ${compact ? 'compact' : ''}`}>
      <div className="widget-header">
        <h3>Market Overview</h3>
        <div className="header-controls">
          <div className="market-sentiment">
            <span
              className={`sentiment-indicator ${averageChange >= 0 ? 'bullish' : 'bearish'}`}
            >
              {averageChange >= 0 ? '📈' : '📉'}
            </span>
            <span className="sentiment-text">
              {averageChange >= 0 ? 'Bullish' : 'Bearish'}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      <div className="market-metrics">
        {!compact && (
          <div className="market-summary">
            <div className="summary-item">
              <span className="summary-label">Average Change (24h)</span>
              <span
                className={`summary-value ${averageChange >= 0 ? 'positive' : 'negative'}`}
              >
                {averageChange >= 0 ? '+' : ''}
                {averageChange.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        <div className="crypto-list">
          {Object.entries(cryptos).map(([symbol, data]) => (
            <div key={symbol} className="crypto-item">
              <div className="crypto-info">
                <div className="crypto-header">
                  <span className="crypto-symbol">{symbol}</span>
                  <span className="crypto-price">
                    {coinMarketCapService.formatPrice(data.price)}
                  </span>
                </div>
                <div className="crypto-details">
                  <span
                    className={`price-change ${data.change24h >= 0 ? 'positive' : 'negative'}`}
                  >
                    {data.change24h >= 0 ? '▲' : '▼'}
                    {coinMarketCapService.formatChange(data.change24h)}
                  </span>
                  {!compact && data.volume24h > 0 && (
                    <span className="volume">
                      Vol: {formatVolume(data.volume24h)}
                    </span>
                  )}
                </div>
              </div>
              {!compact && (
                <div className="crypto-visual">
                  <div className="price-bar">
                    <div
                      className={`price-fill ${data.change24h >= 0 ? 'positive' : 'negative'}`}
                      style={{
                        width: `${Math.min(Math.abs(data.change24h) * 10, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="widget-footer">
        <div className="platform-highlight">
          <span className="highlight-text">
            💎 LeadFive uses USDT on BSC Network
          </span>
        </div>
        {lastUpdated && (
          <span className="last-updated">
            Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

// Helper function to format volume
const formatVolume = volume => {
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(1)}B`;
  } else if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(1)}M`;
  } else if (volume >= 1e3) {
    return `$${(volume / 1e3).toFixed(1)}K`;
  }
  return `$${volume.toFixed(0)}`;
};

// Mini version for dashboard cards
export const MarketSummaryCard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coinMarketCapService.getMarketSummary().then(data => {
      setSummary(data);
      setLoading(false);
    });
  }, []);

  if (loading || !summary) {
    return (
      <div className="market-summary-card loading">
        <div className="card-content">
          <span>📊</span>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="market-summary-card">
      <div className="card-content">
        <div className="card-icon">📊</div>
        <div className="card-info">
          <div className="card-title">Market</div>
          <div
            className={`card-value ${summary.averageChange >= 0 ? 'positive' : 'negative'}`}
          >
            {summary.averageChange >= 0 ? '+' : ''}
            {summary.averageChange.toFixed(1)}%
          </div>
        </div>
        <div className="card-indicator">
          {summary.averageChange >= 0 ? '📈' : '📉'}
        </div>
      </div>
    </div>
  );
};

export default MarketDataWidget;
