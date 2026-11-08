const CACHE = "moviebulls-pwa-v5";
const OFFLINE = "/offline.html";
const SHELL = [OFFLINE, "/icons/icon-192.png", "/downloads.html", "/offline/downloads.css", "/offline/downloads.mjs", "/offline/store.mjs", "/offline/hls.min.js"];
const DOWNLOAD_PREFIX = "moviebulls-download-v1-";
const MEDIA_PATH = "/__moviebulls_offline__/";

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
  if (url.pathname.startsWith(MEDIA_PATH)) {
    event.respondWith(readDownload(event.request));
    return;
  }
  if (SHELL.includes(url.pathname) || url.pathname === "/downloads") {
    const key = url.pathname === "/downloads" ? "/downloads.html" : url.pathname;
    event.respondWith(caches.match(key, { cacheName: CACHE }).then((cached) => cached || fetch(event.request)));
    return;
  }
  // Catalogue and online playback remain network-only. Saved videos have their own cache path.
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(async () => {
    const cached = await caches.match(OFFLINE, { cacheName: CACHE });
    // Cloudflare redirects .html URLs; a navigation fallback must be a fresh, decoded response.
    if (cached) return new Response(cached.body, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
    return new Response("Moviebulls is offline. Reconnect and try again.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }));
});

async function readDownload(request) {
  const url = new URL(request.url);
  const name = decodeURIComponent(url.pathname.slice(MEDIA_PATH.length).split("/")[0]);
  if (!name.startsWith(DOWNLOAD_PREFIX) || !(await caches.keys()).includes(name)) return new Response("Download not found", { status: 404 });
  const cache = await caches.open(name);
  const response = await cache.match(url.href);
  if (!response) return new Response("Video part missing. Save the title again while online.", { status: 404 });
  const range = request.headers.get("Range");
  if (!range) return response;
  // Native HLS on Safari can ask for a byte range even when a full part was saved.
  const blob = await response.blob();
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${blob.size}` } });
  const start = match[1] ? Number(match[1]) : Math.max(0, blob.size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), blob.size - 1) : blob.size - 1;
  if (start > end || start >= blob.size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${blob.size}` } });
  return new Response(blob.slice(start, end + 1), { status: 206, headers: { "Content-Type": response.headers.get("Content-Type") || "application/octet-stream", "Content-Range": `bytes ${start}-${end}/${blob.size}`, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes" } });
}
