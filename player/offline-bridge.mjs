export function offlineBridge(appOrigin) {
  return `(${installOfflineBridge.toString()})(${JSON.stringify(appOrigin)});`;
}

function installOfflineBridge(appOrigin) {
  let hooked;
  let lastSource = '';
  const source = value => {
    try {
      const url = new URL(value, location.href);
      if (url.protocol !== 'https:' || url.username || url.password || url.href.length > 16000 || url.href === lastSource) return;
      lastSource = url.href;
      parent.postMessage({ type: 'moviebulls-player', state: 'source', url: url.href }, appOrigin);
    } catch { /* A blob URL is playback-only, so it is never offered for saving. */ }
  };
  const hookHls = () => {
    const prototype = window.Hls?.prototype;
    if (!prototype?.loadSource || prototype === hooked) return;
    hooked = prototype;
    const load = prototype.loadSource;
    prototype.loadSource = function (url, ...args) { source(url); return load.call(this, url, ...args); };
  };
  // Deferred vendor scripts finish before the provider creates its player.
  document.addEventListener('load', event => { if (event.target.tagName === 'SCRIPT') hookHls(); }, true);
  hookHls();
  document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('video');
    if (!video) return;
    const nativeSource = () => { if (video.currentSrc || video.src) source(video.currentSrc || video.src); };
    video.addEventListener('loadstart', nativeSource);
    video.addEventListener('loadedmetadata', nativeSource);
    nativeSource();
  });
}
