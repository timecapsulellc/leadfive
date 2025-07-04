<<<<<<< HEAD
// LeadFive PWA Service Worker
// Version 3.0.0 - Simplified and Robust

const CACHE_NAME = 'leadfive-v3.0.0';
const RUNTIME_CACHE = 'leadfive-runtime-v3.0.0';

// Minimal critical assets to cache for offline usage
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Safe cache handling with enhanced error recovery
const safeCacheAdd = async (cache, url) => {
  try {
    console.log(`🔄 Attempting to cache: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response && response.ok && response.status === 200) {
      await cache.put(url, response.clone());
      console.log(`✅ Successfully cached: ${url}`);
      return true;
    } else {
      console.warn(`⚠️ Failed to fetch for cache: ${url} (status: ${response?.status})`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Cache error for ${url}:`, error);
    return false;
  }
};

// Install event with robust error handling
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing v3.0.0...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('📦 Starting asset caching...');
        
        // Cache assets sequentially to prevent overwhelming
        let successCount = 0;
        for (const url of STATIC_ASSETS) {
          const success = await safeCacheAdd(cache, url);
          if (success) successCount++;
        }
        
        console.log(`✅ Cached ${successCount}/${STATIC_ASSETS.length} critical assets`);
        
        // Force activation
        await self.skipWaiting();
        console.log('✅ Service Worker installation complete');
        
      } catch (error) {
        console.error('❌ Service Worker installation failed:', error);
        // Still skip waiting to try to activate
        await self.skipWaiting();
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => {
            console.log(`🗑️ Deleting old cache: ${name}`);
            return caches.delete(name);
          });
        
        await Promise.all(deletePromises);
        
        // Take control of all pages
        await self.clients.claim();
        console.log('✅ Service Worker activated and claimed clients');
        
      } catch (error) {
        console.error('❌ Service Worker activation failed:', error);
      }
    })()
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip requests to other domains
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(event.request);
        
        // If successful, cache it and return
        if (networkResponse && networkResponse.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          // Clone the response as it can only be used once
          cache.put(event.request, networkResponse.clone()).catch(err => {
            console.warn('Failed to cache response:', err);
          });
          return networkResponse;
        }
        
        // If network failed, try cache
        throw new Error('Network response not ok');
        
      } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(event.request);
        
        if (cachedResponse) {
          console.log(`📦 Serving from cache: ${event.request.url}`);
          return cachedResponse;
        }
        
        // If it's a navigation request and we have index.html cached, serve that
        if (event.request.mode === 'navigate') {
          const indexResponse = await caches.match('/index.html');
          if (indexResponse) {
            console.log('📦 Serving index.html for navigation');
            return indexResponse;
          }
        }
        
        // Nothing worked, throw the error
        console.error('❌ No cache or network response available for:', event.request.url);
        throw error;
      }
    })()
  );
});

console.log('🚀 LeadFive Service Worker v3.0.0 loaded');
=======
const CACHE_NAME = 'leadfive-v1.10.3';
const STATIC_CACHE = 'leadfive-static-v1.10.3';
const DYNAMIC_CACHE = 'leadfive-dynamic-v1.10.3';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Core assets will be cached dynamically based on actual build
];

self.addEventListener('install', function(event) {
  console.log('🚀 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Enhanced caching strategy
  if (request.destination === 'document') {
    // Network first for HTML pages
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          console.log('📱 Service Worker: Network failed, serving cached page');
          return caches.match('/');
        })
    );
  } else if (request.destination === 'script' || request.destination === 'style') {
    // Cache first for JS/CSS assets
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            console.log('📱 Service Worker: Serving asset from cache:', request.url);
            return response;
          }
          return fetch(request).then(response => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
    );
  } else {
    // Default strategy for other requests
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request).catch(() => {
            console.log('📱 Service Worker: Network failed for:', request.url);
            return new Response('Offline', { status: 503 });
          });
        })
    );
  }
});

self.addEventListener('activate', function(event) {
  console.log('✅ Service Worker: Activated');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🚀 Service Worker: Cache cleanup complete');
      return self.clients.claim();
    })
  );
});
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
