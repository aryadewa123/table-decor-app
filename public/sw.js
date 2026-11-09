// Service Worker for Yabes Atelier PWA
// Caches app shell for offline access

const CACHE_NAME = 'yabes-atelier-v5'
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/flowers/poppy-field.jpg',
  '/flowers/wedding-bouquet.jpg',
  '/flowers/table-flowers.jpg',
  '/flowers/lavender-verification.jpg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      ))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/'))
    )
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  )
})