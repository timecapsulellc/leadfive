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
