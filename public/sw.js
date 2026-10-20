const CACHE_NAME = 'real-sacerdocio-v1';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/logo_Rs.png',
  '/fondo_grande.webp',
  // Puedes agregar aquí otras imágenes estáticas como 'damas.webp', 'pastor.webp', etc.
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
  const url = new URL(event.request.url);

  // 🛡️ REGLA DE ORO: No tocar peticiones de Supabase, API, ni navegación HTML
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    event.request.mode === 'navigate' // El HTML (como /admin) siempre va a la red
  ) {
    return; // Deja que el navegador haga la petición normal
  }

  // Solo cachear imágenes y fuentes estáticas
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});