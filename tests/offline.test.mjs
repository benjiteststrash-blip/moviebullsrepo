import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { DOWNLOAD_PREFIX, MEDIA_PATH, parsePlaylist, saveDownload, listDownloads, deleteDownload } from '../public/offline/store.mjs';
import { offlineBridge } from '../player/offline-bridge.mjs';

const playlist = '#EXTM3U\n#EXT-X-TARGETDURATION:6\n#EXTINF:6,\nfirst.ts?token=a\n#EXTINF:4,\nsecond.ts\n#EXT-X-ENDLIST\n';
function memoryCaches() {
  const stores = new Map();
  return {
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const map = stores.get(name);
      return {
        async put(key, response) { map.set(String(key), response.clone()); },
        async match(key) { return map.get(String(key))?.clone(); },
        async keys() { return [...map.keys()].map(key => new Request(key)); },
      };
    },
  };
}
function setup(t) {
  const caches = memoryCaches();
  for (const [key, value] of Object.entries({ caches, location: { origin: 'https://app.example' }, navigator: { serviceWorker: { controller: {}, ready: Promise.resolve({ active: {} }) } } })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => { if (original) Object.defineProperty(globalThis, key, original); else delete globalThis[key]; });
  }
  return caches;
}

test('rewrites VOD segments and initialization data to local URLs, removing remote metadata', () => {
  const parsed = parsePlaylist(playlist.replace('#EXTINF:6,', '#EXT-X-MAP:URI="init.mp4"\n#EXT-X-SESSION-DATA:URI="https://tracking.example"\n#EXTINF:6,'), 'https://media.example/path/index.m3u8', 'https://app.example/local/');
  assert.equal(parsed.duration, 10);
  assert.equal(parsed.files.length, 3);
  assert.equal(parsed.files[0].remote, 'https://media.example/path/init.mp4');
  assert.match(parsed.playlist, /URI="https:\/\/app.example\/local\/part-0"/);
  assert(!parsed.playlist.includes('tracking.example'));
  assert(!parsed.playlist.includes('token='));
});

test('rejects encryption, live, separate-track/master, byte-range and unsafe playlists', () => {
  for (const extra of ['#EXT-X-KEY:METHOD=AES-128,URI="key"', '#EXT-X-STREAM-INF:BANDWIDTH=1', '#EXT-X-MEDIA:TYPE=AUDIO', '#EXT-X-BYTERANGE:123@0', '#EXT-X-MAP:URI="a",BYTERANGE="30@0"']) {
    assert.throws(() => parsePlaylist(playlist.replace('#EXTM3U', '#EXTM3U\n' + extra), 'https://media.example/v.m3u8', '/local/'));
  }
  assert.throws(() => parsePlaylist(playlist.replace('#EXT-X-ENDLIST', ''), 'https://media.example/v.m3u8', '/local/'));
  assert.throws(() => parsePlaylist(playlist.replace('second.ts', 'file:///secret'), 'https://media.example/v.m3u8', '/local/'));
});

test('publishes ready metadata only after every part is saved, then deletes only that download', async t => {
  const caches = setup(t);
  await caches.open('unrelated-watchlist');
  const calls = [];
  t.mock.method(globalThis, 'fetch', async url => { calls.push(url); return new Response(String(url).endsWith('.m3u8') ? playlist : 'video data'); });
  const progress = [];
  const saved = await saveDownload('https://media.example/index.m3u8', { id: 'movie-550', title: 'Example' }, { signal: new AbortController().signal, onProgress: value => progress.push(value) });
  assert.equal(saved.status, 'ready');
  assert.equal(saved.bytes, 20);
  assert.equal((await listDownloads())[0].title, 'Example');
  const cache = await caches.open(saved.cacheName);
  assert.equal((await cache.keys()).length, 4);
  assert.equal(progress.at(-1).done, 2);
  assert.equal(calls.length, 3);
  await deleteDownload(saved.cacheName);
  assert.deepEqual(await caches.keys(), ['unrelated-watchlist']);
  await assert.rejects(deleteDownload('unrelated-watchlist'));
});

test('cancellation and failed media parts leave no playable or partial download', async t => {
  const caches = setup(t);
  let fail = false;
  t.mock.method(globalThis, 'fetch', async url => new Response(String(url).endsWith('.m3u8') ? playlist : 'part', fail && !String(url).endsWith('.m3u8') ? { status: 403 } : {}));
  const abort = new AbortController();
  await assert.rejects(saveDownload('https://media.example/index.m3u8', { id: 'tv-1-1-1', title: 'Episode' }, { signal: abort.signal, onProgress: value => { if (value.done) abort.abort(); } }));
  assert.deepEqual(await caches.keys(), []);
  fail = true;
  await assert.rejects(saveDownload('https://media.example/index.m3u8', { id: 'movie-1', title: 'Movie' }, { signal: new AbortController().signal, onProgress() {} }), /refused/);
  assert.deepEqual(await caches.keys(), []);
});

test('storage exhaustion removes the partial download and reports a useful error', async t => {
  const caches = setup(t);
  const open = caches.open;
  caches.open = async name => {
    const cache = await open(name);
    const put = cache.put;
    cache.put = async (key, response) => { if (key.includes('part-')) throw new DOMException('full', 'QuotaExceededError'); return put(key, response); };
    return cache;
  };
  t.mock.method(globalThis, 'fetch', async url => new Response(String(url).endsWith('.m3u8') ? playlist : 'part'));
  await assert.rejects(saveDownload('https://media.example/index.m3u8', { id: 'movie-1', title: 'Movie' }, { signal: new AbortController().signal, onProgress() {} }), /out of storage/);
  assert.deepEqual(await caches.keys(), []);
});

test('player bridge captures HLS and native URLs while preserving playback', () => {
  const listeners = {};
  const sent = [];
  const context = { window: {}, location: { href: 'https://player.example/embed/movie/1/' }, URL, parent: { postMessage(...args) { sent.push(args); } }, document: { addEventListener(type, callback) { listeners[type] = callback; }, querySelector() { return null; } } };
  vm.runInNewContext(offlineBridge('https://app.example'), context);
  class Hls { loadSource(url) { return url + ':original'; } }
  context.window.Hls = Hls;
  listeners.load({ target: { tagName: 'SCRIPT' } });
  assert.equal(new Hls().loadSource('https://media.example/index.m3u8'), 'https://media.example/index.m3u8:original');
  new Hls().loadSource('blob:invalid');
  assert.equal(sent.length, 1);
  assert.equal(sent[0][0].state, 'source');
  assert.equal(sent[0][1], 'https://app.example');
});

test('offline worker serves saved bytes/ranges without a network and keeps videos during upgrades', async () => {
  const caches = memoryCaches();
  const listeners = {};
  const context = { self: { location: { origin: 'https://app.example' }, addEventListener(type, callback) { listeners[type] = callback; }, clients: { async claim() {} } }, caches, Response, Request, URL, fetch() { throw new Error('Network must not be used'); } };
  vm.runInNewContext(await readFile(new URL('../public/pwa-sw.js', import.meta.url), 'utf8'), context);
  const name = `${DOWNLOAD_PREFIX}movie-1-test`;
  const url = `https://app.example${MEDIA_PATH}${name}/part-0`;
  await (await caches.open(name)).put(url, new Response('0123456789'));
  await caches.open('moviebulls-pwa-v1');
  let activation;
  listeners.activate({ waitUntil(promise) { activation = promise; } });
  await activation;
  assert.deepEqual(await caches.keys(), [name]);
  async function request(range, target = url) {
    let response;
    listeners.fetch({ request: new Request(target, { headers: range ? { Range: range } : {} }), respondWith(value) { response = value; } });
    return response;
  }
  assert.equal(await (await request()).text(), '0123456789');
  const ranged = await request('bytes=2-5');
  assert.equal(ranged.status, 206);
  assert.equal(await ranged.text(), '2345');
  assert.equal(ranged.headers.get('Content-Range'), 'bytes 2-5/10');
  assert.equal(await (await request('bytes=-3')).text(), '789');
  assert.equal((await request('bytes=99-')).status, 416);
  assert.equal((await request('bytes=0-1,3-4')).status, 416);
  assert.equal((await request(undefined, url.replace('part-0', 'part-missing'))).status, 404);
});

test('captures media playlists when the provider keeps HLS private and reannounces after playing', () => {
  const sent = [];
  const listeners = {};
  const events = {};
  class Xhr {
    open() { return 'original'; }
    addEventListener(type, handler) { this[type] = handler; }
  }
  const video = { currentSrc: 'blob:media-source', addEventListener(type, handler) { events[type] = handler; } };
  const context = { window: { XMLHttpRequest: Xhr }, location: { href: 'https://player.example/' }, URL, parent: { postMessage(data) { sent.push(data); } }, document: { addEventListener(type, handler) { listeners[type] = handler; }, querySelector() { return video; } } };
  vm.runInNewContext(offlineBridge('https://app.example'), context);
  listeners.DOMContentLoaded();
  const xhr = new Xhr();
  assert.equal(xhr.open('GET', 'https://media.example/video.m3u8'), 'original');
  xhr.responseType = 'text';
  xhr.responseText = playlist;
  xhr.responseURL = 'https://media.example/video.m3u8';
  xhr.load();
  assert.equal(sent.at(-1).url, xhr.responseURL);
  const before = sent.length;
  events.playing();
  assert.equal(sent.length, before + 1);
  assert.equal(sent.at(-1).url, xhr.responseURL);
});

test('injected browser script remains self-contained after the deployment bundler adds name helpers', async () => {
  const { build } = await import('esbuild');
  const bundle = await build({ entryPoints: [new URL('../player/offline-bridge.mjs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')], bundle: true, format: 'esm', keepNames: true, write: false });
  const deployed = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
  const context = { window: {}, location: { href: 'https://player.example/' }, URL, parent: { postMessage() {} }, document: { addEventListener() {}, querySelector() { return null; } } };
  assert.doesNotThrow(() => vm.runInNewContext(deployed.offlineBridge('https://app.example'), context));
});
