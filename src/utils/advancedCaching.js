/**
 * Advanced Caching System
 * Multi-layer caching with persistence, invalidation, and optimization
 */

// ============ CACHE STORAGE TYPES ============
const STORAGE_TYPES = {
  MEMORY: 'memory',
  SESSION: 'sessionStorage',
  LOCAL: 'localStorage',
  INDEXED_DB: 'indexedDB',
};

// ============ CACHE STRATEGIES ============
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// ============ ADVANCED CACHE CLASS ============
class AdvancedCache {
  constructor(options = {}) {
    this.name = options.name || 'default';
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 300000; // 5 minutes
    this.storageType = options.storageType || STORAGE_TYPES.MEMORY;
    this.enableCompression = options.enableCompression || false;
    this.enableEncryption = options.enableEncryption || false;

    // Internal storage
    this.memoryCache = new Map();
    this.metadata = new Map();
    this.accessOrder = [];
    this.sizeTracker = 0;

    // Event listeners
    this.listeners = new Map();

    // Initialize storage
    this.initializeStorage();

    // Cleanup timer
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  // Initialize storage based on type
  initializeStorage() {
    switch (this.storageType) {
      case STORAGE_TYPES.SESSION:
        this.storage = sessionStorage;
        break;
      case STORAGE_TYPES.LOCAL:
        this.storage = localStorage;
        break;
      case STORAGE_TYPES.INDEXED_DB:
        this.initializeIndexedDB();
        break;
      default:
        this.storage = null; // Memory only
    }

    // Load existing cache from persistent storage
    if (this.storage) {
      this.loadFromStorage();
    }
  }

  // Initialize IndexedDB
  async initializeIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(`cache_${this.name}`, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.indexedDB = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('expiry', 'expiry');
          store.createIndex('lastAccessed', 'lastAccessed');
        }
      };
    });
  }

  // Generate cache key
  generateKey(key, tags = []) {
    const baseKey = typeof key === 'string' ? key : JSON.stringify(key);
    const tagString = tags.length > 0 ? `_${tags.sort().join('_')}` : '';
    return `${this.name}_${baseKey}${tagString}`;
  }

  // Compress data if enabled
  async compressData(data) {
    if (!this.enableCompression) return data;

    try {
      const jsonString = JSON.stringify(data);
      const compressed = await this.gzipCompress(jsonString);
      return { _compressed: true, data: compressed };
    } catch (error) {
      console.warn('Compression failed, storing uncompressed:', error);
      return data;
    }
  }

  // Decompress data if compressed
  async decompressData(data) {
    if (!data || !data._compressed) return data;

    try {
      const decompressed = await this.gzipDecompress(data.data);
      return JSON.parse(decompressed);
    } catch (error) {
      console.warn('Decompression failed:', error);
      return null;
    }
  }

  // Simple gzip compression (browser compatible)
  async gzipCompress(text) {
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    writer.write(new TextEncoder().encode(text));
    writer.close();

    const chunks = [];
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) chunks.push(value);
    }

    return new Uint8Array(
      chunks.reduce((acc, chunk) => [...acc, ...chunk], [])
    );
  }

  // Simple gzip decompression (browser compatible)
  async gzipDecompress(compressed) {
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    writer.write(compressed);
    writer.close();

    const chunks = [];
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) chunks.push(value);
    }

    const result = new Uint8Array(
      chunks.reduce((acc, chunk) => [...acc, ...chunk], [])
    );
    return new TextDecoder().decode(result);
  }

  // Set cache entry
  async set(key, value, options = {}) {
    const {
      ttl = this.defaultTTL,
      tags = [],
      priority = 0,
      strategy = CACHE_STRATEGIES.CACHE_FIRST,
    } = options;

    const cacheKey = this.generateKey(key, tags);
    const expiry = Date.now() + ttl;
    const size = this.calculateSize(value);

    // Compress data if enabled
    const processedValue = await this.compressData(value);

    const entry = {
      key: cacheKey,
      value: processedValue,
      expiry,
      lastAccessed: Date.now(),
      accessCount: 1,
      size,
      tags,
      priority,
      strategy,
    };

    // Store in memory
    this.memoryCache.set(cacheKey, entry);
    this.metadata.set(cacheKey, {
      expiry,
      lastAccessed: entry.lastAccessed,
      accessCount: entry.accessCount,
      size,
      tags,
      priority,
    });

    // Update access order for LRU
    this.updateAccessOrder(cacheKey);
    this.sizeTracker += size;

    // Store in persistent storage
    if (this.storage) {
      await this.saveToStorage(cacheKey, entry);
    }

    // Enforce size limits
    await this.enforceSizeLimit();

    // Emit event
    this.emit('set', { key: cacheKey, value, options });

    return true;
  }

  // Get cache entry
  async get(key, options = {}) {
    const { tags = [], strategy = CACHE_STRATEGIES.CACHE_FIRST } = options;
    const cacheKey = this.generateKey(key, tags);

    // Try memory cache first
    let entry = this.memoryCache.get(cacheKey);

    // If not in memory, try persistent storage
    if (!entry && this.storage) {
      entry = await this.loadFromStorage(cacheKey);
      if (entry) {
        this.memoryCache.set(cacheKey, entry);
      }
    }

    // Check if entry exists and is not expired
    if (!entry || this.isExpired(entry)) {
      this.emit('miss', { key: cacheKey });
      return null;
    }

    // Update access metadata
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    this.updateAccessOrder(cacheKey);

    // Decompress data if compressed
    const value = await this.decompressData(entry.value);

    this.emit('hit', { key: cacheKey, value });
    return value;
  }

  // Check if entry is expired
  isExpired(entry) {
    return Date.now() > entry.expiry;
  }

  // Update access order for LRU
  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  // Calculate approximate size of data
  calculateSize(data) {
    return JSON.stringify(data).length * 2; // Rough estimate
  }

  // Enforce cache size limits
  async enforceSizeLimit() {
    while (
      this.sizeTracker > this.maxSize * 1024 * 1024 &&
      this.accessOrder.length > 0
    ) {
      const oldestKey = this.accessOrder.shift();
      await this.delete(oldestKey);
    }
  }

  // Delete cache entry
  async delete(key, tags = []) {
    const cacheKey = this.generateKey(key, tags);
    const entry = this.memoryCache.get(cacheKey);

    if (entry) {
      this.sizeTracker -= entry.size;
      this.memoryCache.delete(cacheKey);
      this.metadata.delete(cacheKey);

      const index = this.accessOrder.indexOf(cacheKey);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
    }

    // Delete from persistent storage
    if (this.storage) {
      await this.deleteFromStorage(cacheKey);
    }

    this.emit('delete', { key: cacheKey });
    return true;
  }

  // Clear cache by tags
  async clearByTags(tags) {
    const keysToDelete = [];

    for (const [key, metadata] of this.metadata.entries()) {
      if (metadata.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key);
    }

    return keysToDelete.length;
  }

  // Clear all cache
  async clear() {
    this.memoryCache.clear();
    this.metadata.clear();
    this.accessOrder = [];
    this.sizeTracker = 0;

    if (this.storage) {
      await this.clearStorage();
    }

    this.emit('clear');
    return true;
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, metadata] of this.metadata.entries()) {
      if (now > metadata.expiry) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));

    if (expiredKeys.length > 0) {
      this.emit('cleanup', { expired: expiredKeys.length });
    }
  }

  // Save to persistent storage
  async saveToStorage(key, entry) {
    try {
      if (this.storageType === STORAGE_TYPES.INDEXED_DB && this.indexedDB) {
        const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        await store.put(entry);
      } else if (this.storage) {
        this.storage.setItem(key, JSON.stringify(entry));
      }
    } catch (error) {
      console.warn('Failed to save to storage:', error);
    }
  }

  // Load from persistent storage
  async loadFromStorage(key) {
    try {
      if (this.storageType === STORAGE_TYPES.INDEXED_DB && this.indexedDB) {
        const transaction = this.indexedDB.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const request = store.get(key);

        return new Promise(resolve => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(null);
        });
      } else if (this.storage) {
        const item = this.storage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch (error) {
      console.warn('Failed to load from storage:', error);
    }
    return null;
  }

  // Delete from persistent storage
  async deleteFromStorage(key) {
    try {
      if (this.storageType === STORAGE_TYPES.INDEXED_DB && this.indexedDB) {
        const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        await store.delete(key);
      } else if (this.storage) {
        this.storage.removeItem(key);
      }
    } catch (error) {
      console.warn('Failed to delete from storage:', error);
    }
  }

  // Clear persistent storage
  async clearStorage() {
    try {
      if (this.storageType === STORAGE_TYPES.INDEXED_DB && this.indexedDB) {
        const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        await store.clear();
      } else if (this.storage) {
        const keys = [];
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key && key.startsWith(`${this.name}_`)) {
            keys.push(key);
          }
        }
        keys.forEach(key => this.storage.removeItem(key));
      }
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }

  // Event system
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }

  off(event, listener) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.memoryCache.size,
      sizeInBytes: this.sizeTracker,
      hitRate: this.hitRate || 0,
      memoryUsage: `${(this.sizeTracker / 1024 / 1024).toFixed(2)} MB`,
      oldestEntry: this.accessOrder[0],
      newestEntry: this.accessOrder[this.accessOrder.length - 1],
    };
  }

  // Destroy cache
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.clear();
    this.listeners.clear();

    if (this.indexedDB) {
      this.indexedDB.close();
    }
  }
}

// ============ CACHE MANAGER ============
class CacheManager {
  constructor() {
    this.caches = new Map();
    this.globalStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  // Create or get cache instance
  getCache(name, options = {}) {
    if (!this.caches.has(name)) {
      const cache = new AdvancedCache({ name, ...options });

      // Track global stats
      cache.on('hit', () => this.globalStats.hits++);
      cache.on('miss', () => this.globalStats.misses++);
      cache.on('set', () => this.globalStats.sets++);
      cache.on('delete', () => this.globalStats.deletes++);

      this.caches.set(name, cache);
    }

    return this.caches.get(name);
  }

  // Get all cache names
  getCacheNames() {
    return Array.from(this.caches.keys());
  }

  // Get global statistics
  getGlobalStats() {
    const totalHitRate =
      this.globalStats.hits + this.globalStats.misses > 0
        ? (this.globalStats.hits /
            (this.globalStats.hits + this.globalStats.misses)) *
          100
        : 0;

    return {
      ...this.globalStats,
      hitRate: `${totalHitRate.toFixed(2)}%`,
      totalCaches: this.caches.size,
    };
  }

  // Clear all caches
  async clearAll() {
    for (const cache of this.caches.values()) {
      await cache.clear();
    }
  }

  // Destroy all caches
  destroyAll() {
    for (const cache of this.caches.values()) {
      cache.destroy();
    }
    this.caches.clear();
  }
}

// ============ EXPORTS ============
export const cacheManager = new CacheManager();

// Predefined cache instances
export const apiCache = cacheManager.getCache('api', {
  maxSize: 50, // 50MB
  defaultTTL: 300000, // 5 minutes
  storageType: STORAGE_TYPES.SESSION,
  enableCompression: true,
});

export const imageCache = cacheManager.getCache('images', {
  maxSize: 100, // 100MB
  defaultTTL: 3600000, // 1 hour
  storageType: STORAGE_TYPES.LOCAL,
  enableCompression: false,
});

export const userDataCache = cacheManager.getCache('userData', {
  maxSize: 10, // 10MB
  defaultTTL: 1800000, // 30 minutes
  storageType: STORAGE_TYPES.SESSION,
  enableCompression: true,
});

export { AdvancedCache, CACHE_STRATEGIES, STORAGE_TYPES };
export default cacheManager;
