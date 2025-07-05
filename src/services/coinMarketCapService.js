// CoinMarketCap API Service for LeadFive Platform
// Note: Using free public APIs for demo purposes

class CoinMarketCapService {
  constructor() {
    // Check for environment configuration
    this.enablePriceTicker =
      import.meta.env.VITE_ENABLE_PRICE_TICKER !== 'false';
    this.refreshInterval =
      parseInt(import.meta.env.VITE_PRICE_REFRESH_INTERVAL) || 30000;
    this.enablePortfolioTracking =
      import.meta.env.VITE_ENABLE_PORTFOLIO_TRACKING !== 'false';
    this.enableMarketWidgets =
      import.meta.env.VITE_ENABLE_MARKET_WIDGETS !== 'false';

    // Using CoinGecko API as primary (free, no API key required)
    // CoinMarketCap API key would be used server-side for premium features
    this.baseURL = 'https://api.coingecko.com/api/v3';
    this.priceCache = new Map();
    this.cacheTimeout = this.refreshInterval; // Use configured refresh interval
  }

  // Get current prices for major cryptocurrencies
  async getCurrentPrices(
    symbols = ['tether', 'binancecoin', 'bitcoin', 'ethereum']
  ) {
    const cacheKey = symbols.join(',');
    const cachedData = this.priceCache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < this.cacheTimeout) {
      return cachedData.data;
    }

    try {
      const symbolsString = symbols.join(',');
      const response = await fetch(
        `${this.baseURL}/simple/price?ids=${symbolsString}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }

      const data = await response.json();

      // Transform data to match our needs
      const transformedData = this.transformPriceData(data);

      // Cache the result
      this.priceCache.set(cacheKey, {
        data: transformedData,
        timestamp: Date.now(),
      });

      return transformedData;
    } catch (error) {
      console.warn('Cannot fetch live prices (CORS or network issue), using fallback data:', error.message);
      return this.getFallbackPrices();
    }
  }

  // Transform CoinGecko data to our format
  transformPriceData(data) {
    const priceData = {};

    Object.keys(data).forEach(coinId => {
      const coin = data[coinId];
      let symbol = '';

      // Map coin IDs to symbols
      switch (coinId) {
        case 'tether':
          symbol = 'USDT';
          break;
        case 'binancecoin':
          symbol = 'BNB';
          break;
        case 'bitcoin':
          symbol = 'BTC';
          break;
        case 'ethereum':
          symbol = 'ETH';
          break;
        default:
          symbol = coinId.toUpperCase();
      }

      priceData[symbol] = {
        symbol,
        price: coin.usd,
        change24h: coin.usd_24h_change || 0,
        marketCap: coin.usd_market_cap || 0,
        volume24h: coin.usd_24h_vol || 0,
        lastUpdated: new Date().toISOString(),
      };
    });

    return priceData;
  }

  // Fallback prices in case API fails
  getFallbackPrices() {
    return {
      USDT: {
        symbol: 'USDT',
        price: 1.0,
        change24h: 0,
        marketCap: 0,
        volume24h: 0,
        lastUpdated: new Date().toISOString(),
      },
      BNB: {
        symbol: 'BNB',
        price: 600,
        change24h: 0,
        marketCap: 0,
        volume24h: 0,
        lastUpdated: new Date().toISOString(),
      },
      BTC: {
        symbol: 'BTC',
        price: 95000,
        change24h: 0,
        marketCap: 0,
        volume24h: 0,
        lastUpdated: new Date().toISOString(),
      },
      ETH: {
        symbol: 'ETH',
        price: 3500,
        change24h: 0,
        marketCap: 0,
        volume24h: 0,
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  // Get specific coin price
  async getCoinPrice(symbol) {
    const prices = await this.getCurrentPrices();
    return prices[symbol.toUpperCase()] || null;
  }

  // Get USDT price specifically (important for LeadFive)
  async getUSDTPrice() {
    return await this.getCoinPrice('USDT');
  }

  // Get BNB price specifically (for BSC network)
  async getBNBPrice() {
    return await this.getCoinPrice('BNB');
  }

  // Calculate USD value from USDT amount
  async calculateUSDValue(usdtAmount) {
    const usdtData = await this.getUSDTPrice();
    if (!usdtData) return usdtAmount; // Fallback to 1:1 ratio

    return parseFloat(usdtAmount) * usdtData.price;
  }

  // Calculate package values in USD
  async getPackageValuesInUSD() {
    const packages = [
      { level: 1, usdt: 30 },
      { level: 2, usdt: 50 },
      { level: 3, usdt: 100 },
      { level: 4, usdt: 200 },
    ];

    const usdtPrice = await this.getUSDTPrice();

    return packages.map(pkg => ({
      ...pkg,
      usd: pkg.usdt * (usdtPrice?.price || 1),
      maxEarnings: pkg.usdt * 4 * (usdtPrice?.price || 1),
    }));
  }

  // Get market summary for dashboard
  async getMarketSummary() {
    try {
      const prices = await this.getCurrentPrices();

      return {
        totalMarketCap: Object.values(prices).reduce(
          (sum, coin) => sum + (coin.marketCap || 0),
          0
        ),
        averageChange:
          Object.values(prices).reduce(
            (sum, coin) => sum + (coin.change24h || 0),
            0
          ) / Object.keys(prices).length,
        lastUpdated: new Date().toISOString(),
        cryptos: prices,
      };
    } catch (error) {
      console.error('Error getting market summary:', error);
      return null;
    }
  }

  // Format price for display
  formatPrice(price, decimals = 2) {
    if (price >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(price);
  }

  // Format percentage change
  formatChange(change) {
    const formatted = Math.abs(change).toFixed(2);
    const sign = change >= 0 ? '+' : '-';
    return `${sign}${formatted}%`;
  }

  // Clear cache (useful for manual refresh)
  clearCache() {
    this.priceCache.clear();
  }
}

// Export singleton instance
export default new CoinMarketCapService();
