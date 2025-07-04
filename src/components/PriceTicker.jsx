import React, { useState, useEffect } from 'react';
import coinMarketCapService from '../services/coinMarketCapService';
import './PriceTicker.css';

const PriceTicker = ({ symbols = ['USDT', 'BNB', 'BTC', 'ETH'], autoRefresh = true, refreshInterval = 30000 }) => {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch price data
  const fetchPrices = async () => {
    try {
      setError(null);
      const priceData = await coinMarketCapService.getCurrentPrices();
      setPrices(priceData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('Failed to load price data');
      setLoading(false);
    }
  };

  // Initial load and auto-refresh setup
  useEffect(() => {
    fetchPrices();

    if (autoRefresh) {
      const interval = setInterval(fetchPrices, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Manual refresh handler
  const handleRefresh = () => {
    setLoading(true);
    coinMarketCapService.clearCache();
    fetchPrices();
  };

  if (loading && Object.keys(prices).length === 0) {
    return (
      <div className="price-ticker loading">
        <div className="ticker-item">
          <span className="loading-text">Loading prices...</span>
        </div>
      </div>
    );
  }

  if (error && Object.keys(prices).length === 0) {
    return (
      <div className="price-ticker error">
        <div className="ticker-item">
          <span className="error-text">Price data unavailable</span>
          <button onClick={handleRefresh} className="refresh-btn">
            🔄
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="price-ticker">
      <div className="ticker-container">
        <div className="ticker-scroll">
          {symbols.map(symbol => {
            const coinData = prices[symbol];
            if (!coinData) return null;

            const changeClass = coinData.change24h >= 0 ? 'positive' : 'negative';
            const changeIcon = coinData.change24h >= 0 ? '▲' : '▼';

            return (
              <div key={symbol} className="ticker-item">
                <div className="coin-info">
                  <span className="coin-symbol">{symbol}</span>
                  <span className="coin-price">
                    {coinMarketCapService.formatPrice(coinData.price)}
                  </span>
                  <span className={`coin-change ${changeClass}`}>
                    {changeIcon} {coinMarketCapService.formatChange(coinData.change24h)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="ticker-controls">
          <button 
            onClick={handleRefresh} 
            className="refresh-btn"
            disabled={loading}
            title="Refresh prices"
          >
            {loading ? '⏳' : '🔄'}
          </button>
          {lastUpdated && (
            <span className="last-updated">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceTicker;