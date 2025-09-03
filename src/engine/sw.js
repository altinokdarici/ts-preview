// New file
// Service Worker for module hosting. It stores modules posted from the iframe and serves them
self.moduleStore = self.moduleStore || {};

self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of clients immediately
  event.waitUntil(self.clients.claim());
});

// Receive modules posted by the iframe and store them in moduleStore
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;
  if (data.type === 'STORE_MODULES' && data.modules) {
    // data.modules is expected to be an object where keys are absolute paths like:
    // "/src/engine/__modules/index.js" -> "module source..."
    Object.assign(self.moduleStore, data.modules);
  }
});

// Intercept fetches for module paths under /src/engine/__modules/
self.addEventListener('fetch', (event) => {
  try {
    const url = new URL(event.request.url);
    // Adjust this to match the iframe scope / location of index.html.
    // We're looking for requests to ".../src/engine/__modules/<module>"
    const modulesPrefix = '/src/engine/__modules/';
    if (url.pathname.startsWith(modulesPrefix)) {
      const requestedKey = decodeURIComponent(url.pathname);
      const source = self.moduleStore[requestedKey];
      if (typeof source === 'string') {
        // Serve the module with correct content type
        const headers = { 'Content-Type': 'application/javascript; charset=utf-8' };
        event.respondWith(new Response(source, { status: 200, headers }));
        return;
      }
    }
  } catch (err) {
    // fall through to default fetch
  }
  // Default: let the request go to network
});