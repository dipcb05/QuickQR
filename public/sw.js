const CACHE_NAME = 'quickqr-cache-20260703214455'
const APP_SHELL_ROUTES = ['/', '/scan', '/create', '/history', '/settings', '/offline.html']
const ASSETS_TO_CACHE = [
  ...APP_SHELL_ROUTES,
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-icon-180.png'
]

const isSameOrigin = (request) => new URL(request.url).origin === self.location.origin

const updateCache = async (request) => {
  try {
    const response = await fetch(request)
    if (response && response.status === 200 && (response.type === 'basic' || response.type === 'default')) {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    return null
  }
}

const getCachedRouteFallback = async (request) => {
  const url = new URL(request.url)
  return (await caches.match(request)) ||
    (await caches.match(url.pathname)) ||
    (await caches.match('/scan')) ||
    (await caches.match('/offline.html'))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {})
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('quickqr-')) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET' || !request.url.startsWith('http') || !isSameOrigin(request)) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cachedResponse = await caches.match(request)
      const networkPromise = updateCache(request)
      if (cachedResponse) return cachedResponse

      const routeFallback = await getCachedRouteFallback(request)
      if (routeFallback) return routeFallback

      const networkResponse = await networkPromise
      return networkResponse || Response.error()
    })())
    return
  }

  const url = new URL(request.url)
  const isStaticAsset = url.pathname.startsWith('/_next/static/') ||
    ASSETS_TO_CACHE.includes(url.pathname) ||
    /\.(?:png|jpe?g|svg|ico|webp|css|js|woff2?)$/i.test(url.pathname)

  if (isStaticAsset) {
    event.respondWith((async () => {
      const cachedResponse = await caches.match(request)
      const networkPromise = updateCache(request)
      if (cachedResponse) return cachedResponse

      const networkResponse = await networkPromise
      return networkResponse || Response.error()
    })())
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache)
        })
        return response
      })
      .catch(() => {
        return caches.match(request).then(cached => {
          return cached || caches.match('/offline.html') || new Response('Offline - Not Cached', {
            status: 404,
            statusText: 'Not Found'
          })
        })
      })
  )
})
