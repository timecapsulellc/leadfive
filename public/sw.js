// LeadFive PWA Service Worker
// Version 1.0.0 - Production Ready

const CACHE_NAME = 'leadfive-crowdfund-v1.0.0';
const RUNTIME_CACHE = 'leadfive-runtime-v1.0.0';
const OFFLINE_CACHE = 'leadfive-offline-v1.0.0';

// Assets to cache for offline usage
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/onboarding-wizard.html',
  '/enhanced-withdrawal.html',
  '/user-dashboard.html',
  '/matrix-dashboard.html',
  '/testnet-home.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/web3.js',
  '/src/contracts.js',
  '/src/components/PWAInstallPrompt.jsx',
  '/src/components/MobileNavigation.jsx',
  '/src/components/RealTimeDashboard.jsx',
  '/src/components/RealTimeDashboard.css'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first for critical data
  NETWORK_FIRST: 'network-first',
  // Cache first for static assets
  CACHE_FIRST: 'cache-first',
  // Stale while revalidate for frequently updated content
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// LeadFive-specific cache strategies
const LEADFIVE_CACHE_STRATEGIES = {
  // Web3 provider cache
  WEB3_CACHE: 'leadfive-web3-cache',
  // Contract data cache
  CONTRACT_CACHE: 'leadfive-contract-cache',
  // Real-time data cache
  REALTIME_CACHE: 'leadfive-realtime-cache'
};

// Runtime cache configuration
const RUNTIME_CACHING = [
  {
    urlPattern: /^https:\/\/fonts\.googleapis\.com/,
    handler: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    options: {
      cacheName: 'google-fonts-stylesheets'
    }
  },
  {
    urlPattern: /^https:\/\/fonts\.gstatic\.com/,
    handler: CACHE_STRATEGIES.CACHE_FIRST,
    options: {
      cacheName: 'google-fonts-webfonts',
      expiration: {
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      }
    }
  },
  {
    urlPattern: /^https:\/\/api\.leadfive\.today/,
    handler: CACHE_STRATEGIES.NETWORK_FIRST,
    options: {
      cacheName: 'api-cache',
      networkTimeoutSeconds: 5,
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 5 // 5 minutes
      }
    }
  }
];

// Web3 and blockchain data caching
const WEB3_ENDPOINTS = [
  /^https:\/\/rpc\./,
  /^https:\/\/.*\.infura\.io/,
  /^https:\/\/.*\.alchemy\.com/,
  /^https:\/\/api\.thegraph\.com/
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then(cache => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache offline fallback page
      caches.open(OFFLINE_CACHE).then(cache => {
        return cache.add('/offline.html');
      })
    ]).then(() => {
      console.log('✅ Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),
      
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker: Activation complete');
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip extension requests
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  // Handle different types of requests
  if (request.destination === 'document') {
    event.respondWith(handleDocumentRequest(request));
  } else if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(handleStaticAssetRequest(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('🔄 Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-withdrawal') {
    event.waitUntil(syncWithdrawals());
  } else if (event.tag === 'background-sync-registration') {
    event.waitUntil(syncRegistrations());
  }
});

// Push notification handling
self.addEventListener('push', event => {
  console.log('📨 Push notification received');
  
  if (!event.data) {
    console.warn('Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('📨 Push data:', data);

    const options = {
      body: data.body || 'New notification from LeadFive',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-72x72.png',
      tag: data.tag || 'leadfive-push',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      data: data.data || {},
      vibrate: data.vibrate || [200, 100, 200],
      timestamp: Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'LeadFive', options)
    );

  } catch (error) {
    console.error('❌ Push notification parsing failed:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('OrphiChain Notification', {
        body: 'You have a new update',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'orphi-fallback'
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('🖱️ Notification clicked:', event.notification.tag);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  // Handle notification actions
  const handleAction = async () => {
    const clients = await self.clients.matchAll({ type: 'window' });
    
    // If LeadFive app is already open, focus it
    if (clients.length > 0) {
      const client = clients[0];
      
      // Send message to app about the notification click
      client.postMessage({
        type: 'NOTIFICATION_CLICK',
        action,
        data,
        notificationTag: event.notification.tag
      });
      
      return client.focus();
    }

    // Otherwise open the app
    const urlToOpen = getNotificationUrl(action, data);
    return self.clients.openWindow(urlToOpen);
  };

  event.waitUntil(handleAction());
});

// Get appropriate URL based on notification action
function getNotificationUrl(action, data) {
  const baseUrl = self.location.origin;
  
  switch (action) {
    case 'open-dashboard':
    case 'view-dashboard':
      return `${baseUrl}/#dashboard`;
    
    case 'view-user':
      return `${baseUrl}/#genealogy`;
    
    case 'view-transaction':
    case 'view-pool':
      return `${baseUrl}/#analytics`;
    
    case 'view-network':
      return `${baseUrl}/#network`;
    
    case 'view-emergency':
    case 'view-all':
      return `${baseUrl}/#realtime`;
    
    case 'retry-connection':
      return `${baseUrl}/#realtime`;
    
    default:
      return baseUrl;
  }
}

// Message handling for communication with main thread
self.addEventListener('message', event => {
  console.log('📨 Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      cacheUrls(event.data.urls).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  } else if (event.data && event.data.type === 'REALTIME_UPDATE') {
    // Cache real-time dashboard data
    event.waitUntil(cacheRealtimeData(event.data.payload));
  } else if (event.data && event.data.type === 'WEB3_CACHE') {
    // Cache Web3 transaction data
    event.waitUntil(cacheWeb3Data(event.data.payload));
  } else if (event.data && event.data.type === 'CONTRACT_EVENT') {
    // Handle contract events for offline queuing
    event.waitUntil(handleContractEvent(event.data.payload));
  }
});

// ===== HELPER FUNCTIONS =====

async function handleDocumentRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📱 Service Worker: Document request failed, serving from cache');
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    return caches.match('/offline.html');
  }
}

async function handleStaticAssetRequest(request) {
  try {
    // Cache first strategy
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Static asset request failed', error);
    return new Response('Asset not available', { status: 404 });
  }
}

async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Handle Web3 RPC requests
  if (WEB3_ENDPOINTS.some(pattern => pattern.test(url.origin))) {
    return handleWeb3Request(request);
  }
  
  // Handle LeadFive API requests
  if (url.pathname.includes('/leadfive/') || url.pathname.includes('/realtime/')) {
    return handleLeadFiveApiRequest(request);
  }
  
  try {
    // Network first for API requests
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 5000)
      )
    ]);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Service Worker: API request failed, trying cache');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ 
      error: 'Offline mode: Data not available',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleGenericRequest(request) {
  try {
    // Try cache first for generic requests
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Service Worker: Generic request failed', error);
    
    // Return offline fallback response
    return new Response('Resource not available offline', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Web3 request handler with caching
async function handleWeb3Request(request) {
  try {
    // For read-only calls, try cache first
    if (request.method === 'POST') {
      const body = await request.clone().text();
      const parsedBody = JSON.parse(body);
      
      if (parsedBody.method && parsedBody.method.includes('call')) {
        const cacheKey = `web3-${JSON.stringify(parsedBody)}`;
        const cached = await getCachedData(LEADFIVE_CACHE_STRATEGIES.WEB3_CACHE, cacheKey);
        
        if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
          return new Response(JSON.stringify(cached.data), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    // Network request
    const response = await fetch(request);
    
    if (response.ok && request.method === 'POST') {
      const body = await request.clone().text();
      const parsedBody = JSON.parse(body);
      
      if (parsedBody.method && parsedBody.method.includes('call')) {
        const responseData = await response.clone().json();
        const cacheKey = `web3-${JSON.stringify(parsedBody)}`;
        
        await setCachedData(LEADFIVE_CACHE_STRATEGIES.WEB3_CACHE, cacheKey, {
          data: responseData,
          timestamp: Date.now()
        });
      }
    }
    
    return response;
  } catch (error) {
    console.log('🌐 Web3 request failed, checking cache');
    
    if (request.method === 'POST') {
      const body = await request.clone().text();
      const parsedBody = JSON.parse(body);
      const cacheKey = `web3-${JSON.stringify(parsedBody)}`;
      const cached = await getCachedData(ORPHI_CACHE_STRATEGIES.WEB3_CACHE, cacheKey);
      
      if (cached) {
        return new Response(JSON.stringify(cached.data), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response(JSON.stringify({ 
      error: 'Web3 request failed and no cache available',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// LeadFive API request handler
async function handleLeadFiveApiRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses for real-time dashboard
      const cache = await caches.open(LEADFIVE_CACHE_STRATEGIES.REALTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('📊 LeadFive API request failed, serving cached data');
    
    const cached = await caches.match(request);
    if (cached) {
      // Add offline indicator
      const cachedData = await cached.json();
      return new Response(JSON.stringify({
        ...cachedData,
        offline: true,
        lastUpdate: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'OrphiChain data not available offline',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache real-time dashboard data
async function cacheRealtimeData(data) {
  try {
    await setCachedData(ORPHI_CACHE_STRATEGIES.REALTIME_CACHE, 'dashboard-data', {
      ...data,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to cache real-time data:', error);
  }
}

// Cache Web3 transaction data
async function cacheWeb3Data(data) {
  try {
    await setCachedData(ORPHI_CACHE_STRATEGIES.WEB3_CACHE, `tx-${data.hash}`, {
      ...data,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to cache Web3 data:', error);
  }
}

// Handle contract events for offline processing
async function handleContractEvent(event) {
  try {
    // Store event for later processing
    await addStoredData('contract-events', {
      ...event,
      timestamp: Date.now(),
      processed: false
    });
    
    // Show notification for important events
    if (event.type === 'WithdrawalMade' || event.type === 'UserRegistered') {
      await self.registration.showNotification('OrphiChain Update', {
        body: `${event.type} event received`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'contract-event',
        data: { event }
      });
    }
  } catch (error) {
    console.error('Failed to handle contract event:', error);
  }
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('orphi-') && 
    name !== CACHE_NAME && 
    name !== RUNTIME_CACHE &&
    name !== OFFLINE_CACHE
  );
  
  return Promise.all(
    oldCaches.map(cacheName => {
      console.log(`🗑️ Service Worker: Deleting old cache ${cacheName}`);
      return caches.delete(cacheName);
    })
  );
}

async function cacheUrls(urls) {
  const cache = await caches.open(RUNTIME_CACHE);
  return cache.addAll(urls);
}

async function syncWithdrawals() {
  console.log('💰 Service Worker: Syncing offline withdrawals');
  
  try {
    // Get stored withdrawal requests
    const withdrawalRequests = await getStoredData('offline-withdrawals');
    
    for (const request of withdrawalRequests) {
      try {
        const response = await fetch('/api/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        });
        
        if (response.ok) {
          // Remove from offline storage
          await removeStoredData('offline-withdrawals', request.id);
          
          // Notify user of success
          await self.registration.showNotification('Withdrawal Processed', {
            body: `Your withdrawal of ${request.amount} has been processed`,
            icon: '/icons/icon-192x192.png'
          });
        }
      } catch (error) {
        console.error('Failed to sync withdrawal:', error);
      }
    }
  } catch (error) {
    console.error('Withdrawal sync failed:', error);
  }
}

async function syncRegistrations() {
  console.log('👤 Service Worker: Syncing offline registrations');
  
  try {
    // Get stored registration requests
    const registrationRequests = await getStoredData('offline-registrations');
    
    for (const request of registrationRequests) {
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        });
        
        if (response.ok) {
          // Remove from offline storage
          await removeStoredData('offline-registrations', request.id);
          
          // Notify user of success
          await self.registration.showNotification('Registration Complete', {
            body: 'Your registration has been processed successfully',
            icon: '/icons/icon-192x192.png'
          });
        }
      } catch (error) {
        console.error('Failed to sync registration:', error);
      }
    }
  } catch (error) {
    console.error('Registration sync failed:', error);
  }
}

// IndexedDB helpers for offline storage
async function getStoredData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('orphi-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function removeStoredData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('orphi-offline-db', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Enhanced IndexedDB helpers
async function getCachedData(storeName, key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('orphi-cache-db', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
  });
}

async function setCachedData(storeName, key, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('orphi-cache-db', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const putRequest = store.put(data, key);
      
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
  });
}

async function addStoredData(storeName, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('orphi-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const addRequest = store.add(data);
      
      addRequest.onsuccess = () => resolve(addRequest.result);
      addRequest.onerror = () => reject(addRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

console.log('🚀 Service Worker: Script loaded successfully');
