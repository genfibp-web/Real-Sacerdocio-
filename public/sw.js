// Versión: 2.0 - Forzar actualización
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon.png', // Asegúrate de que esta imagen exista en tu carpeta public
      badge: '/icon.png', // El icono pequeño que sale en Android
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
      tag: 'real-sacerdocio-alert', // Si llegan 2, reemplaza la anterior (no se acumulan)
      renotify: true,
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});