self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // minimal fetch handler for PWA installability
});
