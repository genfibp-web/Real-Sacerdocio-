// Versión: 2.1 - Notificaciones con Sonido y Vibración
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon.png', // Tu logo principal
      badge: '/icon.png', // El icono pequeño en la barra de estado (Android)
      vibrate: [200, 100, 200, 100, 200], // Patrón de vibración más notorio
      silent: false, // ⚠️ CRUCIAL: Obliga al sistema a emitir el sonido por defecto
      data: { url: data.url || '/' },
      tag: 'real-sacerdocio-alert', // Reemplaza la notificación anterior si llega otra
      renotify: true, // Hace vibrar/sonar de nuevo si se usa el mismo tag
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});