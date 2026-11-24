// Service Worker for Esolution Engenharia
// Cache-first for static assets, network-first for HTML/navigation

// Trocar a versão apaga os caches antigos no "activate".
// v2: deixa de guardar respostas do admin e das server functions (dados de leads).
const STATIC_CACHE_NAME = "esolution-static-v2";
const HTML_CACHE_NAME = "esolution-html-v2";

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/images/favicon.png",
  "/images/apple-touch-icon.png",
];

// Install event - precache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE_NAME && name !== HTML_CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests (except for fonts which we want to cache)
  if (url.origin !== location.origin && !url.pathname.match(/\.(woff|woff2|ttf|eot)$/)) {
    return;
  }

  // Admin, login e server functions: sempre rede, nunca cache (dados privados e sessão).
  if (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/_serverFn") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // HTML/Navigation requests - Network First
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request, HTML_CACHE_NAME));
    return;
  }

  // Static assets - Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirst(request, HTML_CACHE_NAME));
});

// Cache First strategy - for static assets (JS, CSS, images, fonts)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return a fallback for images if needed
    if (request.destination === "image") {
      return new Response("", { status: 404 });
    }
    throw error;
  }
}

// Network First strategy - for HTML/navigation
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    // Só guarda respostas comuns do próprio site (nada com cookie de sessão ou redirect).
    if (networkResponse.ok && networkResponse.type === "basic" && !networkResponse.redirected) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/");
    }
    throw error;
  }
}

// Check if the request is for a static asset
function isStaticAsset(pathname) {
  return (
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif)$/) ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/videos/") ||
    pathname.startsWith("/assets/")
  );
}

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
