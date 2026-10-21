self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('fetch', function(event) {
  // Este evento es OBLIGATORIO para que Chrome detecte la PWA
});