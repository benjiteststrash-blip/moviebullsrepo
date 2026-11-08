const CACHE = "moviebulls-pwa-v4";
const OFFLINE = "/offline.html";
const SHELL = [OFFLINE, "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Recreate redirected asset responses, which browsers reject as navigation fallbacks.
    for (const path of SHELL) {
      const response = await fetch(path, { cache: "reload" });
      if (!response.ok) throw new Error("Offline assets could not be cached");
      await cache.put(path, new Response(response.body, { headers: { "Content-Type": response.headers.get("Content-Type") || "application/octet-stream" } }));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("moviebulls-pwa-") && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname === "/icons/icon-192.png") {
    event.respondWith(caches.match("/icons/icon-192.png", { cacheName: CACHE }).then((cached) => cached || fetch(event.request)));
    return;
  }
  // Catalogue and online playback remain network-only. Video requests stay on the network.
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(async () => {
    const cached = await caches.match(OFFLINE, { cacheName: CACHE });
    // Cloudflare redirects .html URLs; a navigation fallback must be a fresh, decoded response.
    if (cached) return new Response(cached.body, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
    return new Response("Moviebulls is offline. Reconnect and try again.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }));
});
