import { deleteDownload, downloadPlaylistUrl, formatBytes, listDownloads } from './store.mjs';

const status = document.querySelector('#status');
const list = document.querySelector('#downloads');
const playback = document.querySelector('#playback');
const video = document.querySelector('#video');
const playerMessage = document.querySelector('#player-message');
let hls;
let playing;

function stop() {
  hls?.destroy();
  hls = null;
  video.pause();
  video.removeAttribute('src');
  video.load();
  playing = null;
  playback.hidden = true;
}
document.querySelector('#close-player').addEventListener('click', stop);
video.addEventListener('error', () => { if (!playback.hidden) playerMessage.textContent = 'This download could not play. Try opening it again, or delete it and save the title again while online.'; });

async function play(item) {
  stop();
  try {
    const cache = await caches.open(item.cacheName);
    const files = await cache.keys();
    if (files.length !== item.parts + 2) throw new Error('Some video parts are missing. Delete this download and save the title again while online.');
    if (!navigator.serviceWorker.controller) throw new Error('Offline playback is getting ready. Reload this page and try again.');
    playing = item.cacheName;
    document.querySelector('#playing-title').textContent = item.title;
    playerMessage.textContent = '';
    playback.hidden = false;
    const source = downloadPlaylistUrl(item.cacheName);
    // Some browsers advertise native HLS but bypass local service-worker video responses.
    if (window.Hls?.isSupported()) {
      hls = new window.Hls({ enableWorker: false });
      hls.on(window.Hls.Events.ERROR, (_event, data) => { if (data.fatal) playerMessage.textContent = 'This download could not play. Try opening it again, or save the title again while online.'; });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      throw new Error('Offline video playback is not supported in this browser. Try Chrome, Edge or Safari.');
    }
    video.focus();
    playback.scrollIntoView({ block: 'start', behavior: 'instant' });
  } catch (error) { status.textContent = error.message; stop(); }
}

async function render() {
  try {
    if (!('caches' in window) || !('serviceWorker' in navigator)) throw new Error('This browser does not support offline downloads. Try Chrome, Edge or Safari.');
    const items = await listDownloads();
    list.replaceChildren();
    status.textContent = items.length ? '' : 'No downloads yet. Save a movie or episode from its player to watch it here.';
    for (const item of items) {
      const row = document.createElement('li');
      const details = document.createElement('div');
      const heading = document.createElement('h2');
      heading.textContent = item.title;
      const summary = document.createElement('p');
      summary.textContent = item.status === 'ready' ? `${formatBytes(item.bytes)} · ${Math.ceil(item.duration / 60)} min · Ready to watch` : 'Interrupted download · Delete and save again from the player';
      details.append(heading, summary);
      const actions = document.createElement('div');
      actions.className = 'actions';
      if (item.status === 'ready') {
        const watch = document.createElement('button');
        watch.className = 'primary';
        watch.textContent = 'Watch offline';
        watch.setAttribute('aria-label', `Watch ${item.title} offline`);
        watch.addEventListener('click', () => void play(item));
        actions.append(watch);
      }
      const remove = document.createElement('button');
      remove.textContent = 'Delete';
      remove.setAttribute('aria-label', `Delete ${item.title}`);
      remove.addEventListener('click', async () => {
        remove.disabled = true;
        try { if (playing === item.cacheName) stop(); await deleteDownload(item.cacheName); await render(); }
        catch { status.textContent = 'The download could not be deleted. Try again.'; remove.disabled = false; }
      });
      actions.append(remove);
      row.append(details, actions);
      list.append(row);
    }
  } catch (error) { status.textContent = error.message; }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/pwa-sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => { status.textContent = 'Offline storage could not start. Reload while online and try again.'; });
}
window.addEventListener('pageshow', () => void render());
window.addEventListener('focus', () => void render());
await render();
