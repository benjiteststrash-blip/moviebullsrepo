export const DOWNLOAD_PREFIX = 'moviebulls-download-v1-';
export const MEDIA_PATH = '/__moviebulls_offline__/';

function mediaUrl(value, base) {
  const url = new URL(value, base);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password ||
      (url.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(url.hostname))) {
    throw new Error('This video source cannot be saved offline.');
  }
  return url.href;
}

// Only complete, unencrypted VOD playlists are supported in this first version.
export function parsePlaylist(text, source, localBase) {
  if (text.length > 1024 * 1024 || !text.trimStart().startsWith('#EXTM3U')) throw new Error('This source did not return a video playlist. Try reloading the player.');
  if (/#EXT-X-(?:KEY|SESSION-KEY):.*METHOD=(?!NONE(?:,|$))/m.test(text)) throw new Error('This video uses encryption and cannot be saved offline.');
  if (/#EXT-X-STREAM-INF|#EXT-X-MEDIA:|#EXT-X-BYTERANGE|#EXT-X-MAP:.*BYTERANGE|#EXT-X-I-FRAMES-ONLY|#EXT-X-PART:/m.test(text)) {
    throw new Error('This stream format is not supported for offline saving yet. Try another title.');
  }
  if (!text.includes('#EXT-X-ENDLIST')) throw new Error('Only complete videos can be saved offline.');
  const files = [];
  let duration = 0;
  const add = value => {
    if (files.length >= 20000) throw new Error('This video has too many parts to save offline.');
    const local = `${localBase}part-${files.length}`;
    files.push({ remote: mediaUrl(value, source), local });
    return local;
  };
  const lines = text.split(/\r?\n/).map(line => {
    const value = line.trim();
    if (value.startsWith('#EXTINF:')) duration += Number.parseFloat(value.slice(8)) || 0;
    if (value.startsWith('#EXT-X-MAP:')) {
      if (!/URI="[^"]+"/.test(value)) throw new Error('The video initialization data is missing.');
      return value.replace(/URI="([^"]+)"/, (_, uri) => `URI="${add(uri)}"`);
    }
    // Keep only playback tags: never retain remote key, subtitle or session URLs.
    if (value.startsWith('#')) return /^#(?:EXTM3U$|EXTINF:|EXT-X-(?:VERSION:|TARGETDURATION:|MEDIA-SEQUENCE:|DISCONTINUITY(?:$|-SEQUENCE:)|ENDLIST$|PLAYLIST-TYPE:|INDEPENDENT-SEGMENTS$|GAP$))/.test(value) ? value : '';
    return value ? add(value) : '';
  });
  if (!files.length || !duration) throw new Error('No video parts were found.');
  return { playlist: lines.join('\n'), files, duration };
}

function cacheBase(name) { return new URL(`${MEDIA_PATH}${encodeURIComponent(name)}/`, location.origin).href; }

export async function listDownloads() {
  const names = (await caches.keys()).filter(name => name.startsWith(DOWNLOAD_PREFIX));
  const items = await Promise.all(names.map(async name => {
    const cache = await caches.open(name);
    const response = await cache.match(`${cacheBase(name)}metadata.json`);
    if (!response) return { cacheName: name, title: 'Interrupted download', status: 'incomplete', bytes: 0, savedAt: 0 };
    const metadata = await response.json();
    return { ...metadata, cacheName: name };
  }));
  return items.sort((a, b) => b.savedAt - a.savedAt);
}

export async function deleteDownload(name) {
  if (!name.startsWith(DOWNLOAD_PREFIX)) throw new Error('Invalid download.');
  return caches.delete(name);
}

async function limitedBody(response, max, signal) {
  if (!response.ok || response.type === 'opaque') throw new Error('The video provider refused the download. Reload the player and try again.');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('The video provider returned an empty response.');
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > max) throw new Error('This stream has video parts too large to save safely.');
      chunks.push(value);
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
  if (!bytes) throw new Error('The video provider returned an empty response.');
  return new Blob(chunks);
}

/** @param {string} source @param {{id: string, title: string}} title @param {{signal: AbortSignal, onProgress: (progress: {done: number, total: number, bytes: number}) => void}} options */
export async function saveDownload(source, title, { signal, onProgress }) {
  if (!/^(movie|tv)-\d+(?:-\d+-\d+)?$/.test(title.id)) throw new Error('Invalid title.');
  signal.throwIfAborted();
  if (!navigator.serviceWorker.controller) throw new Error('Offline storage is getting ready. Reload this page and try again.');
  const worker = await navigator.serviceWorker.ready;
  if (!worker.active || !navigator.serviceWorker.controller) throw new Error('Offline storage is getting ready. Reload this page and try again.');
  const name = `${DOWNLOAD_PREFIX}${title.id}-${crypto.randomUUID()}`;
  const base = cacheBase(name);
  const controller = new AbortController();
  const cancel = () => controller.abort(signal.reason);
  signal.addEventListener('abort', cancel, { once: true });
  if (signal.aborted) cancel();
  let firstError;
  try {
    const response = await fetch(mediaUrl(source, location.origin), { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
    const manifest = await limitedBody(response, 1024 * 1024, controller.signal);
    const parsed = parsePlaylist(await manifest.text(), response.url || source, base);
    const cache = await caches.open(name);
    const metadata = { id: title.id, title: String(title.title).slice(0, 300), status: 'incomplete', bytes: 0, savedAt: Date.now(), duration: parsed.duration, parts: parsed.files.length };
    await cache.put(`${base}metadata.json`, Response.json(metadata));
    let next = 0;
    let done = 0;
    onProgress({ done, total: parsed.files.length, bytes: 0 });
    async function downloadParts() {
      try {
        while (next < parsed.files.length) {
          controller.signal.throwIfAborted();
          const file = parsed.files[next++];
          const part = await fetch(file.remote, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
          if (/text\/html|application\/json/i.test(part.headers.get('content-type') || '')) throw new Error('The video link expired. Reload the player and try again.');
          const blob = await limitedBody(part, 32 * 1024 * 1024, controller.signal);
          await cache.put(file.local, new Response(blob, { headers: { 'Content-Type': 'application/octet-stream' } }));
          metadata.bytes += blob.size;
          onProgress({ done: ++done, total: parsed.files.length, bytes: metadata.bytes });
        }
      } catch (error) { firstError ??= error; controller.abort(); }
    }
    await Promise.all([downloadParts(), downloadParts(), downloadParts()]);
    if (firstError) throw firstError;
    controller.signal.throwIfAborted();
    await cache.put(`${base}index.m3u8`, new Response(parsed.playlist, { headers: { 'Content-Type': 'application/vnd.apple.mpegurl' } }));
    metadata.status = 'ready';
    await cache.put(`${base}metadata.json`, Response.json(metadata));
    return { ...metadata, cacheName: name };
  } catch (error) {
    await caches.delete(name);
    if (error?.name === 'QuotaExceededError') throw new Error('Your device is out of storage. Delete a download or free some space, then try again.');
    throw error;
  } finally { signal.removeEventListener('abort', cancel); }
}

export function downloadPlaylistUrl(name) { return `${cacheBase(name)}index.m3u8`; }
export function formatBytes(bytes) { return bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(1)} GB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`; }
