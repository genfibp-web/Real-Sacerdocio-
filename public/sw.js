const CACHE_NAME = 'real-sacerdocio-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/logo_Rs.png',
  '/fondo_grande.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 🛡️ PROTECCIÓN DE SESIÓN: Ignorar peticiones de API, Supabase, y el panel de Admin
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('/api/') || 
    event.request.url.includes('supabase.co') ||
    event.request.url.includes('/admin')
  ) {
    return; // Dejar que el navegador haga la petición normal a la red
  }

  // Estrategia Cache-First solo para imágenes y archivos estáticos
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});