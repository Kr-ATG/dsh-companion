/* PWA worker for the /mp mobile shell only — never caches API or session data. */
const CACHE_NAME = 'dsh-companion-shell-v1.0.6'
const OFFLINE_URL = '/mp/offline.html'
const SHELL_PATHS = new Set([
  '/mp/',
  '/mp/manifest.webmanifest',
  '/mp/apple-touch-icon.png',
  '/mp/icon-192.png',
  '/mp/icon-512.png',
  '/mp/logo.svg',
  OFFLINE_URL,
])

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => (key.startsWith('dsh-mobile-plus-shell-') || key.startsWith('dsh-companion-shell-')) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
    ]),
  )
})

/* 点通知：已开的同页窗口聚焦并导航到对应会话，否则新开窗口。 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = (event.notification.data && event.notification.data.link) || '/mp/'
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of list) {
      try {
        const u = new URL(link, self.location.href)
        if (client.url.split('#')[0] === u.origin + u.pathname) {
          await client.focus()
          if ('navigate' in client) await client.navigate(link)
          else client.postMessage({ type: 'navigate', url: link })
          return
        }
      } catch { /* 继续找下一个 */ }
    }
    await self.clients.openWindow(link)
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname === '/mp/api' || url.pathname.startsWith('/mp/api/') || url.pathname.startsWith('/mp/pair/')) return

  const isNav = request.mode === 'navigate' && (url.pathname === '/mp/' || url.pathname === '/mp')
  if (isNav) {
    event.respondWith(networkFirst(request, OFFLINE_URL, false))
    return
  }
  if (SHELL_PATHS.has(url.pathname)) event.respondWith(networkFirst(request, url.pathname))
})

async function networkFirst(request, fallbackPath, allowCachedResponse = true) {
  try {
    const response = await fetch(request)
    if (response.status >= 500) throw new Error('shell unavailable')
    if (response.ok && new URL(request.url).search === '') {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    const cache = await caches.open(CACHE_NAME)
    if (allowCachedResponse) {
      const cached = await cache.match(request)
      if (cached !== undefined) return cached
    }
    const fallback = await cache.match(fallbackPath)
    if (fallback !== undefined) return fallback
    return new Response('', { status: 503, statusText: 'Service Unavailable' })
  }
}
