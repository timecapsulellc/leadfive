/**
 * Advanced Service Worker for LeadFive PWA
 * Implements comprehensive offline support with intelligent caching strategies
 */

const CACHE_VERSION = 'leadfive-v2.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Cache timeout configurations
const CACHE_TIMEOUT = 5000; // 5 seconds
const CACHE_MAX_AGE = {
  static: 7 * 24 * 60 * 60 * 1000, // 7 days
  dynamic: 24 * 60 * 60 * 1000,    // 1 day
  api: 5 * 60 * 1000,              // 5 minutes
  images: 30 * 24 * 60 * 60 * 1000 // 30 days
};

// Static resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Core CSS will be determined at runtime
];

// Dynamic routes that should be cached
const DYNAMIC_ROUTES = [
  '/dashboard',
  '/referrals',
  '/genealogy',
  '/withdrawals',
  '/packages',
  '/about',
  '/security'
];

// API endpoints that can be cached
const CACHEABLE_API_PATTERNS = [
  /\/api\/v1\/crypto\/prices/,
  /\/api\/v1\/user\/profile/,
  /\/api\/v1\/dashboard\/stats/,
  /coingecko\.com/,
  /bscscan\.com/
];

// Resources that should never be cached
const NEVER_CACHE_PATTERNS = [
  /\/api\/v1\/auth\//,
  /\/api\/v1\/wallet\//,
  /\/api\/v1\/transactions\//,
  /chrome-extension/,
  /localhost/
];

// Offline fallback pages
const OFFLINE_FALLBACKS = {
  page: '/offline.html',
  image: '/icons/offline-image.svg',
  api: { error: 'Offline', message: 'Please check your connection' }
};

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    (async () => {
      try {
        // Cache static assets
        const staticCache = await caches.open(STATIC_CACHE);
        await staticCache.addAll(STATIC_ASSETS);
        
        // Pre-cache critical dynamic routes
        const dynamicCache = await caches.open(DYNAMIC_CACHE);
        await Promise.allSettled(
          DYNAMIC_ROUTES.map(route => 
            fetch(route)
              .then(response => response.ok ? dynamicCache.put(route, response) : null)
              .catch(() => null) // Ignore failures during install
          )
        );
        
        // Create offline fallback cache
        await createOfflineFallbacks();
        
        console.log('Service Worker cached core assets');
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
        
      } catch (error) {
        console.error('Service Worker install failed:', error);
      }
    })()
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.startsWith(CACHE_VERSION)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
        
        // Claim all clients
        await self.clients.claim();
        
        console.log('Service Worker activated');
        
        // Notify clients of activation
        await notifyClients({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
        
      } catch (error) {
        console.error('Service Worker activation failed:', error);
      }
    })()
  );
});

/**
 * Fetch Event - Handle all network requests
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip never-cache patterns
  if (shouldNeverCache(request.url)) {
    return;
  }
  
  event.respondWith(handleFetch(request, url));
});

/**
 * Handle fetch requests with appropriate caching strategy
 */
async function handleFetch(request, url) {
  try {
    // Determine caching strategy based on request type
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    } else if (isAPIRequest(url)) {
      return await networkFirst(request, API_CACHE);
    } else if (isImageRequest(url)) {
      return await cacheFirst(request, IMAGE_CACHE);
    } else {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
  } catch (error) {
    console.error('Fetch failed:', error);
    return await getOfflineFallback(request, url);
  }
}

/**
 * Cache First Strategy - For static assets
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, CACHE_MAX_AGE.static)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetchWithTimeout(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse; // Return stale cache if network fails
    }
    throw error;
  }
}

/**
 * Network First Strategy - For API requests
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetchWithTimeout(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse && !isExpired(cachedResponse, CACHE_MAX_AGE.api)) {
      // Add offline indicator header
      const response = cachedResponse.clone();
      response.headers.set('X-Served-From', 'cache');
      return response;
    }
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy - For dynamic content
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch fresh content in background
  const fetchPromise = fetchWithTimeout(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.warn('Background fetch failed:', error);
      return null;
    });
  
  // Return cached version immediately if available
  if (cachedResponse && !isExpired(cachedResponse, CACHE_MAX_AGE.dynamic)) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return await fetchPromise;
}

/**
 * Fetch with timeout to prevent hanging requests
 */
async function fetchWithTimeout(request, timeout = CACHE_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(request, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Check if cached response is expired
 */
function isExpired(response, maxAge) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const responseDate = new Date(dateHeader);
  const now = new Date();
  return (now - responseDate) > maxAge;
}

/**
 * Get appropriate offline fallback
 */
async function getOfflineFallback(request, url) {
  if (isImageRequest(url)) {
    const cache = await caches.open(STATIC_CACHE);
    return await cache.match(OFFLINE_FALLBACKS.image);
  } else if (isAPIRequest(url)) {
    return new Response(
      JSON.stringify(OFFLINE_FALLBACKS.api),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 503,
        statusText: 'Service Unavailable'
      }
    );
  } else {
    const cache = await caches.open(STATIC_CACHE);
    return await cache.match(OFFLINE_FALLBACKS.page) || 
           await cache.match('/index.html');
  }
}

/**
 * Create offline fallback pages and assets
 */
async function createOfflineFallbacks() {
  const cache = await caches.open(STATIC_CACHE);
  
  // Create offline page
  const offlinePageHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>LeadFive - Offline</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: system-ui, -apple-system, sans-serif; 
          text-align: center; 
          padding: 2rem; 
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          margin: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        .offline-container {
          max-width: 400px;
        }
        h1 { color: #00d4ff; margin-bottom: 1rem; }
        .icon { font-size: 4rem; margin-bottom: 1rem; }
        .retry-btn {
          background: #00d4ff;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="icon">📡</div>
        <h1>You're Offline</h1>
        <p>LeadFive requires an internet connection to access your dashboard and perform transactions.</p>
        <p>Please check your connection and try again.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Retry Connection
        </button>
      </div>
    </body>
    </html>
  `;
  
  await cache.put(
    OFFLINE_FALLBACKS.page,
    new Response(offlinePageHTML, {
      headers: { 'Content-Type': 'text/html' }
    })
  );
  
  // Create offline image SVG
  const offlineImageSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#f3f4f6"/>
      <text x="100" y="100" text-anchor="middle" dominant-baseline="middle" 
            font-family="system-ui" font-size="60" fill="#9ca3af">📡</text>
      <text x="100" y="140" text-anchor="middle" dominant-baseline="middle" 
            font-family="system-ui" font-size="12" fill="#6b7280">Offline</text>
    </svg>
  `;
  
  await cache.put(
    OFFLINE_FALLBACKS.image,
    new Response(offlineImageSVG, {
      headers: { 'Content-Type': 'image/svg+xml' }
    })
  );
}

/**
 * Helper functions for request classification
 */
function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/i.test(url.pathname) ||
         url.pathname === '/' ||
         url.pathname === '/index.html' ||
         url.pathname === '/manifest.json';
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         CACHEABLE_API_PATTERNS.some(pattern => pattern.test(url.href));
}

function isImageRequest(url) {
  return /\.(png|jpg|jpeg|gif|svg|webp|avif)$/i.test(url.pathname);
}

function shouldNeverCache(url) {
  return NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Notify all clients about service worker events
 */
async function notifyClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage(message);
  });
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Handle queued transactions or data when back online
  console.log('Background sync triggered');
  await notifyClients({ type: 'SYNC_COMPLETE' });
}

/**
 * Handle push notifications
 */
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: data.url
      })
    );
  }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data)
    );
  }
});

console.log('LeadFive Service Worker loaded - Advanced offline support enabled');