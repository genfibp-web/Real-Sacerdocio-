// Versión: 2.2 - Separando tags de notificaciones
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [200, 100, 200, 100, 200],
      silent: false,
      data: { url: data.url || '/' },
      // 🛠️ Usamos la URL como tag único para que no se sobreescriban
      tag: data.url || 'general-alert', 
      renotify: true,
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});