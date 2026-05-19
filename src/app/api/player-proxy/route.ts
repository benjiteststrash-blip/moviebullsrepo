import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const srcUrl = new URL(url);
    const providerHost = srcUrl.hostname;

    const BLOCKER = `<script>
(function () {
  var ALLOWED_HOSTS = [
    location.hostname,
    '${providerHost}',
    'vidsrc.me',
    'vidlink.pro',
    'vidsrc.wiki',
    '2embed.skin',
    'vidsrc.fyi',
    'vidsrc.mov',
    'vidsrc.to',
    '2embed.cc'
  ];

  var AD_HOSTS = [
    'doubleclick.net','googlesyndication.com','pagead2.googlesyndication.com',
    'adsbygoogle.js','propellerads.com','popads.net','popcash.net','monetag.com',
    'hilltopads.net','trafficjunky.com','exoclick.com','juicyads.com','plugrush.com',
    'adsterra.com','revcontent.com','outbrain.com','taboola.com','mgid.com',
    'clkmon.com','clkrevenue.com','trkmon.com','cpmstar.com','adnxs.com',
    'rubiconproject.com','adsystem.com','advertising.com','amazon-adsystem.com',
    'criteo.com','pubmatic.com','openx.net','33across.com','sharethrough.com',
    'smartadserver.com','spotxchange.com','vidoomy.com','pornhub.com',
  ];

  function isAd(url) {
    if (!url) return false;
    try {
      var parsed = new URL(url, location.href);
      var h = parsed.hostname;
      if (!h) return false;

      if (AD_HOSTS.some(function(d){ return h === d || h.endsWith('.'+d); })) {
        return true;
      }

      var isAllowed = ALLOWED_HOSTS.some(function(allowed) {
        return h === allowed || h.endsWith('.' + allowed);
      });

      var isAsset = /\\.(mp4|m3u8|ts|vtt|png|jpg|jpeg|gif|css|js|json|svg|woff2?|wasm)$/i.test(parsed.pathname) ||
                    /^(cdn|cdnjs|fonts|ajax|player|subtitles)/i.test(h) ||
                    /cloudflare|googleapis|gstatic|jwplayer|vimeo|fastly/i.test(h);

      if (!isAllowed && !isAsset && parsed.protocol !== 'chrome-extension:') {
        return true;
      }

      return false;
    } catch(e){ return false; }
  }

  /* ─── 1. Hook window.open & Freeze it ─── */
  var blockOpen = function() { return null; };
  try {
    Object.defineProperty(window, 'open', {
      value: blockOpen,
      writable: false,
      configurable: false
    });
    Object.defineProperty(window, 'openDatabase', {
      value: blockOpen,
      writable: false,
      configurable: false
    });
  } catch(e) {
    window.open = blockOpen;
  }

  /* ─── 2. Hook HTMLIFrameElement.prototype.contentWindow ─── */
  try {
    var origContentWindow = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow').get;
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
      get: function() {
        var win = origContentWindow.call(this);
        if (win) {
          try {
            win.open = blockOpen;
            Object.defineProperty(win, 'top', { get: function() { return win; } });
            Object.defineProperty(win, 'parent', { get: function() { return win; } });
          } catch(e) {}
        }
        return win;
      },
      configurable: true
    });
  } catch(e) {}

  /* ─── 3. Periodic Frame open/top Clean up ─── */
  setInterval(function() {
    for (var i = 0; i < window.frames.length; i++) {
      try {
        var f = window.frames[i];
        f.open = blockOpen;
        Object.defineProperty(f, 'top', { get: function() { return f; } });
        Object.defineProperty(f, 'parent', { get: function() { return f; } });
      } catch(e) {}
    }
  }, 200);

  /* ─── 4. Block Fetch & XHR ─── */
  var _fetch = window.fetch;
  window.fetch = function(input) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (isAd(url)) return Promise.reject(new TypeError('Blocked'));
    return _fetch.apply(this, arguments);
  };

  var _openXHR = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(m, url) {
    this._blocked = isAd(url);
    if (!this._blocked) _openXHR.apply(this, arguments);
  };
  var _sendXHR = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function() {
    if (!this._blocked) _sendXHR.apply(this, arguments);
  };

  /* ─── 5. Freeze top & parent ─── */
  try {
    Object.defineProperty(window, 'top', { get: function(){ return window; }, configurable: false });
    Object.defineProperty(window, 'parent', { get: function(){ return window; }, configurable: false });
  } catch(e){}

  /* ─── 6. Block all navigation properties on Location.prototype ─── */
  try {
    var locProps = ['href', 'hostname', 'host', 'pathname', 'search', 'port', 'protocol'];
    locProps.forEach(function(prop) {
      var desc = Object.getOwnPropertyDescriptor(Location.prototype, prop);
      if (!desc) return;
      Object.defineProperty(Location.prototype, prop, {
        get: desc.get,
        set: function(val) {
          if (!isAd(val)) desc.set.call(this, val);
        },
        configurable: true
      });
    });

    var _assign = Location.prototype.assign;
    Location.prototype.assign = function(url) {
      if (!isAd(url)) _assign.call(this, url);
    };
    var _replace = Location.prototype.replace;
    Location.prototype.replace = function(url) {
      if (!isAd(url)) _replace.call(this, url);
    };
  } catch(e){}

  /* ─── 7. Block Service Workers ─── */
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.register) {
      navigator.serviceWorker.register = function() {
        return Promise.reject(new Error('Service workers blocked'));
      };
    }
  } catch(e) {}

  /* ─── 8. Block HTML Form submissions entirely ─── */
  try {
    HTMLFormElement.prototype.submit = function() { return; };
  } catch(e) {}
  document.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);

  /* ─── 9. Override click on Anchor prototype to catch programmatic clicks ─── */
  try {
    var _clickAnchor = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function() {
      var href = this.getAttribute('href') || '';
      if (isAd(href)) return;
      _clickAnchor.apply(this, arguments);
    };
  } catch(e) {}

  /* ─── 10. Intercept and block click/mousedown/touchstart events ─── */
  function blockAdLink(e) {
    var path = e.composedPath ? e.composedPath() : [];
    if (path.length === 0) {
      var el = e.target;
      while (el) {
        path.push(el);
        el = el.parentElement;
      }
    }

    for (var i = 0; i < path.length; i++) {
      var el = path[i];
      if (!el || !el.tagName) continue;
      var tag = el.tagName.toUpperCase();

      if (tag === 'A') {
        var href = el.getAttribute('href') || '';
        if (isAd(href) || /^javascript:/i.test(href)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
      }

      // Block invisible overlays by inspecting size
      if (tag === 'A' || tag === 'DIV' || tag === 'SPAN') {
        var r = el.getBoundingClientRect();
        var big = r.width > window.innerWidth * 0.8 && r.height > window.innerHeight * 0.5;
        if (big && el.tagName === 'A') {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
      }
    }
  }
  document.addEventListener('mousedown', blockAdLink, true);
  document.addEventListener('click', blockAdLink, true);
  document.addEventListener('touchstart', blockAdLink, { capture: true, passive: false });

  /* ─── 11. Periodically destroy overlay ad elements ─── */
  function killOverlays() {
    document.querySelectorAll('a, div, span, ins').forEach(function(el) {
      var s = window.getComputedStyle(el);
      var pos = s.position === 'fixed' || s.position === 'absolute';
      var big = el.offsetWidth > window.innerWidth * 0.8 && el.offsetHeight > window.innerHeight * 0.5;
      var highZ = parseInt(s.zIndex) > 50;

      if (pos && big && highZ && el.tagName !== 'VIDEO') {
        var id = ((el.id || '') + ' ' + (el.className || '')).toLowerCase();
        if (id.indexOf('player') === -1 && id.indexOf('video') === -1 && id.indexOf('control') === -1) {
          el.remove();
          return;
        }
      }

      var idMatched = ((el.id || '') + ' ' + (el.className || '')).toLowerCase();
      if (/\b(ad.overlay|popup|interstitial|preroll.ad|vast|clickunder|popunder)\b/.test(idMatched)) {
        el.remove();
      }
    });
  }
  killOverlays();
  document.addEventListener('DOMContentLoaded', killOverlays);
  [300, 800, 1500, 3000, 5000].forEach(function(t){ setTimeout(killOverlays, t); });
  var mo = new MutationObserver(function(){ killOverlays(); });
  document.addEventListener('DOMContentLoaded', function() {
    if (document.body) mo.observe(document.body, { childList: true, subtree: true });
  });
})();
</script>`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: srcUrl.origin + "/",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    let html = await res.text();

    // Server-side stripping
    html = html.replace(/<meta[^>]+http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, "");
    html = html.replace(
      /<script[^>]+src=["'][^"']*(?:googlesyndication|doubleclick|pagead2|adsbygoogle|propellerads|popads|popcash|monetag|hilltopads|exoclick|juicyads|adsterra|taboola|outbrain|revcontent)[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,
      ""
    );
    html = html.replace(/\bon(?:click|mousedown|mouseup|touchstart)\s*=\s*["'][^"']*(?:window\.open|location\.href|window\.top)[^"']*["']/gi, "");

    const baseTag = `<base href="${srcUrl.origin}">`;
    if (/<head[\s>]/i.test(html)) {
      html = html.replace(/(<head[^>]*>)/i, `$1\n${baseTag}\n${BLOCKER}`);
    } else {
      html = `<head>${baseTag}\n${BLOCKER}</head>\n` + html;
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("player-proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch", details: String(err) }, { status: 500 });
  }
}
