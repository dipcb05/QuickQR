const CACHE_NAME = 'qrcode-scanner-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/apple-icon-180x180.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Cache addAll failed:', err)
        return Promise.resolve()
      })
    })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Strategy: Try network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        // Clone and cache successful responses
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache)
        })

        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((response) => {
          return response || new Response('Offline - Page not cached', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          })
        })
      })
  )
})
