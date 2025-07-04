import React, { useState, useEffect } from 'react';
import coinMarketCapService from '../services/coinMarketCapService';
import './PortfolioValue.css';

const PortfolioValue = ({ 
  usdtBalance = 0, 
  bnbBalance = 0, 
  showDetailed = false,
  className = '',
  refreshInterval = 60000 // 1 minute
}) => {
  const [portfolioData, setPortfolioData] = useState({
    totalUSD: 0,
    assets: {},
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate portfolio value
  const calculatePortfolioValue = async () => {
    try {
      setError(null);
      const prices = await coinMarketCapService.getCurrentPrices(['tether', 'binancecoin']);
      
      const usdtPrice = prices.USDT?.price || 1;
      const bnbPrice = prices.BNB?.price || 600;
      
      const usdtValue = parseFloat(usdtBalance) * usdtPrice;
      const bnbValue = parseFloat(bnbBalance) * bnbPrice;
      const totalUSD = usdtValue + bnbValue;
      
      setPortfolioData({
        totalUSD,
        assets: {
          USDT: {
            balance: usdtBalance,
            price: usdtPrice,
            value: usdtValue,
            symbol: 'USDT'
          },
          BNB: {
            balance: bnbBalance,
            price: bnbPrice,
            value: bnbValue,
            symbol: 'BNB'
          }
        },
        lastUpdated: new Date()
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error calculating portfolio value:', err);
      setError('Failed to calculate portfolio value');
      setLoading(false);
    }
  };

  useEffect(() => {
    calculatePortfolioValue();
    
    const interval = setInterval(calculatePortfolioValue, refreshInterval);
    return () => clearInterval(interval);
  }, [usdtBalance, bnbBalance, refreshInterval]);

  const handleRefresh = () => {
    setLoading(true);
    coinMarketCapService.clearCache();
    calculatePortfolioValue();
  };

  if (loading && portfolioData.totalUSD === 0) {
    return (
      <div className={`portfolio-value loading ${className}`}>
        <div className="portfolio-header">
          <span className="loading-indicator">⏳</span>
          <span>Calculating portfolio value...</span>
        </div>
      </div>
    );
  }

  if (error && portfolioData.totalUSD === 0) {
    return (
      <div className={`portfolio-value error ${className}`}>
        <div className="portfolio-header">
          <span className="error-indicator">⚠️</span>
          <span>Portfolio calculation unavailable</span>
          <button onClick={handleRefresh} className="refresh-btn">
            🔄
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`portfolio-value ${className}`}>
      <div className="portfolio-header">
        <div className="portfolio-title">
          <span className="title-text">Portfolio Value</span>
          <button 
            onClick={handleRefresh} 
            className="refresh-btn"
            disabled={loading}
            title="Refresh portfolio value"
          >
            {loading ? '⏳' : '🔄'}
          </button>
        </div>
        <div className="total-value">
          {coinMarketCapService.formatPrice(portfolioData.totalUSD)}
        </div>
      </div>

      {showDetailed && (
        <div className="portfolio-details">
          {Object.entries(portfolioData.assets).map(([symbol, asset]) => {
            if (asset.balance <= 0) return null;
            
            return (
              <div key={symbol} className="asset-row">
                <div className="asset-info">
                  <span className="asset-symbol">{symbol}</span>
                  <span className="asset-balance">
                    {parseFloat(asset.balance).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6
                    })}
                  </span>
                </div>
                <div className="asset-value">
                  <span className="current-price">
                    @ {coinMarketCapService.formatPrice(asset.price)}
                  </span>
                  <span className="asset-usd-value">
                    {coinMarketCapService.formatPrice(asset.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="portfolio-footer">
        {portfolioData.lastUpdated && (
          <span className="last-updated">
            Updated: {portfolioData.lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

// Component for earnings display with USD conversion
export const EarningsDisplay = ({ 
  earnings, 
  currency = 'USDT', 
  showUSD = true,
  className = '' 
}) => {
  const [usdValue, setUsdValue] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showUSD && earnings > 0) {
      setLoading(true);
      coinMarketCapService.calculateUSDValue(earnings).then(value => {
        setUsdValue(value);
        setLoading(false);
      });
    }
  }, [earnings, showUSD]);

  return (
    <div className={`earnings-display ${className}`}>
      <div className="primary-amount">
        {parseFloat(earnings).toLocaleString()} {currency}
      </div>
      {showUSD && (
        <div className="secondary-amount">
          {loading ? (
            <span className="loading-text">Converting...</span>
          ) : (
            usdValue && (
              <span className="usd-equivalent">
                ≈ {coinMarketCapService.formatPrice(usdValue)}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default PortfolioValue;