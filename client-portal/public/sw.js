// This is a dummy service worker to prevent proxy errors for /sw.js in development.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.registration.unregister());
