export function offlineBridge(appOrigin) {
  // Keep injected browser code literal: bundling function.toString() can introduce external helpers.
  return String.raw`(() => {
  const appOrigin = ${JSON.stringify(appOrigin)};
  let hooked;
  let lastSource = '';
  const source = value => {
    if (!value) return;
    try {
      const url = new URL(value, location.href);
      if (url.protocol !== 'https:' || url.username || url.password || url.href.length > 16000) return;
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
  // Provider players may keep their HLS constructor private. Observe the actual playlist response too.
  if (window.XMLHttpRequest) {
    const open = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (...args) {
      this.addEventListener('load', () => {
        try {
          if (!this.responseType || this.responseType === 'text') {
            const text = this.responseText;
            if (typeof text === 'string' && text.trimStart().startsWith('#EXTM3U') && !text.includes('#EXT-X-STREAM-INF')) source(this.responseURL);
          }
        } catch { /* Binary video parts are not playlist responses. */ }
      }, { once: true });
      return open.apply(this, args);
    };
  }
  document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('video');
    if (!video) return;
    const nativeSource = () => { source(lastSource); if (video.currentSrc || video.src) source(video.currentSrc || video.src); };
    video.addEventListener('loadstart', nativeSource);
    video.addEventListener('loadedmetadata', nativeSource);
    video.addEventListener('playing', nativeSource);
    nativeSource();
  });
})();`;
}
