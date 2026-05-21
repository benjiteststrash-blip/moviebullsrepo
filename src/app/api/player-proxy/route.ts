import { NextRequest, NextResponse } from "next/server";

function failedSourceResponse(url: string, details: string) {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        height: 100%;
        background: #000;
        color: #888;
        font-family: Arial, sans-serif;
      }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <p>Player source unavailable. Please refresh or try again later.</p>
    <script>
      window.parent.postMessage({
        type: "player-source-failed",
        url: ${JSON.stringify(url)},
        details: ${JSON.stringify(details)}
      }, "*");
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sanitizeSandboxTokens(value: string) {
  return value
    .split(/\s+/)
    .filter((token) => {
      const normalized = token.trim().toLowerCase();
      return normalized &&
        normalized !== "allow-top-navigation" &&
        normalized !== "allow-top-navigation-by-user-activation" &&
        normalized !== "allow-popups-to-escape-sandbox";
    })
    .join(" ");
}

function buildBlockerScript(providerHost: string) {
  return `<script data-proxy-blocker>
(function () {
  var ownScript = document.currentScript;
  try {
    if (ownScript && ownScript.remove) ownScript.remove();
  } catch(e) {}

  var PROVIDER_HOST = ${JSON.stringify(providerHost)};
  var ALLOWED_HOSTS = [
    location.hostname,
    PROVIDER_HOST,
    'vidsrc.wiki',
    'cdn.jwplayer.com',
    'jwplayer.com',
    'gstatic.com',
    'googleapis.com',
    'cloudflare.com',
    'cloudflareinsights.com',
    'wsrv.nl'
  ];

  var AD_HOSTS = [
    'doubleclick.net','googlesyndication.com','pagead2.googlesyndication.com',
    'adsbygoogle.js','propellerads.com','popads.net','popcash.net','monetag.com',
    'hilltopads.net','trafficjunky.com','exoclick.com','juicyads.com','plugrush.com',
    'adsterra.com','revcontent.com','outbrain.com','taboola.com','mgid.com',
    'clkmon.com','clkrevenue.com','trkmon.com','cpmstar.com','adnxs.com',
    'rubiconproject.com','adsystem.com','advertising.com','amazon-adsystem.com',
    'criteo.com','pubmatic.com','openx.net','33across.com','sharethrough.com',
    'smartadserver.com','spotxchange.com','vidoomy.com','highperformanceformat.com',
    'effectivecpmnetwork.com','go.oclasrv.com','oclasrv.com','clkfly.pw',
    'bslinks.site','cutlinks.net','shorte.st','ouo.io','za.gl','fc.lc',
    'shrinkearn.com','adbull.me','adrinolinks.com','linkvertise.com',
    'intellipopup.com','adsco.re','histats.com','sstatic1.histats.com',
    's10.histats.com','cloudnestra.com','llvpn.com','anymanga.com','vidsrc.sbs',
    'adserver.com','adserver.ad','ads.trafficjunky.com','cdn.adsafeprotected.com',
    'cdn3.adsafeprotected.com','cdn4.adsafeprotected.com','adnxs.com',
    'cdn.viglink.com','pixel.quantserve.com','scorecardresearch.com',
    'sb.scorecardresearch.com','pixel.rubiconproject.com','ads.pubmatic.com',
    'ib.adnxs.com','securepubads.g.doubleclick.net','tpc.googlesyndication.com',
    'adservice.google.com','pagead2.googlesyndication.com','googleadservices.com',
    'googleads.g.doubleclick.net','cm.g.doubleclick.net','ad.doubleclick.net',
    'partner.googleadservices.com','www.googletagservices.com','googletagmanager.com',
    'analytics.google.com','ssl.google-analytics.com','www.google-analytics.com',
    'www.googletagmanager.com','connect.facebook.net','staticxx.facebook.com',
    'www.facebook.com','platform.twitter.com','ads.pinterest.com',
    'analytics.twitter.com','bat.bing.com','adservice.google.it',
    'adservice.google.co.uk','pagead2.googlesyndication.com',
    'fundingchoicesmessages.google.com'
  ];

  var TRACKING_KEYS = /^(showTrkURL|trkUrl|adUrl|adsUrl|popUrl|popupUrl|popunder_url|popunderUrl|trackUrl|trackingUrl|clickUrl|clickunderUrl)$/i;
  var SUSPICIOUS_CODE = /(popunder|clickunder|showTrk|showTrkURL|popUrl|popupUrl|popunder_url|\\\\x6f\\\\x70\\\\x65\\\\x6e|window\\s*\\[\\s*['"]\\\\x[0-9a-f]{2}|window\\.open|open\\s*\\(\\s*['"]?https?:|s10\\.histats|cloudnestra|llvpn|tag\\.min\\.js|zone\s*=|_Hasync|Histats|DisableDevtool)/i;
  var NAV_WORDS = /(^|[\\W_])(adserver|advert|ads?|sponsor|popup|popunder|clickunder|onclick|redirect|campaign|tracking?|tracker|click|vast|preroll|banner|promo|zone|monetag|propeller|oclasrv|linkvertise|shorte|ouo|clk|revenue)([\\W_]|$)/i;
  var AD_RELAY_PATTERNS = [
    /monerominer|adskeeper|adspyglass|popunder/i,
    /(^|\\.)go\\.(?!vidsrc)/i,
    /(^|[\\W_])(track|click|redir|redirect)\\./i,
    /[a-z]{8,12}\\.(fun|top|xyz|click|life|online|site)(?:[\\/:?#]|$)/i,
    /(^|\\.)(rcp|asdf)\\./i,
    /cloudnestra|llvpn/i,
    /^[a-z]{2,4}\\.histats\\./i,
    /tag\\.min\\.js/i,
    /(zone|pops?|trk?|monet)[a-z]*\\.(com|net|org|info|xyz|top|fun|click|life|online|site)/i
  ];

  function textOf(value) {
    try {
      return String(value || '');
    } catch(e) {
      return '';
    }
  }

  try {
    var proxyDocumentDomain = document.domain || location.hostname;
    var documentDomainShim = {
      get: function() {
        return proxyDocumentDomain || location.hostname;
      },
      set: function(value) {
        proxyDocumentDomain = textOf(value) || proxyDocumentDomain || location.hostname;
      },
      configurable: true
    };

    try {
      Object.defineProperty(document, 'domain', documentDomainShim);
    } catch(e) {
      Object.defineProperty(Document.prototype, 'domain', documentDomainShim);
    }
  } catch(e) {}

  function hostMatches(host, domain) {
    return host === domain || host.endsWith('.' + domain);
  }

  function isAllowedHost(host) {
    if (!host) return false;
    return ALLOWED_HOSTS.some(function(domain) {
      return hostMatches(host, domain);
    });
  }

  function isAdHost(host) {
    if (!host) return false;
    return AD_HOSTS.some(function(domain) {
      return hostMatches(host, domain);
    });
  }

  function parseUrl(url) {
    try {
      return new URL(textOf(url), location.href);
    } catch(e) {
      return null;
    }
  }

  function isMediaAssetUrl(url) {
    var parsed = parseUrl(url);
    if (!parsed) return false;
    return /\\.(mp4|m3u8|ts|m4s|webm|vtt|srt|ass|ssa|jpg|jpeg|png|gif|webp|svg|css|js|json|woff2?|wasm)(?:\\?|$)/i.test(parsed.pathname);
  }

  function hasAdWords(value) {
    return NAV_WORDS.test(textOf(value));
  }

  function isAdRelayUrl(url) {
    var raw = textOf(url);
    if (!raw) return false;
    var parsed = parseUrl(raw);
    var sample = raw;
    if (parsed) sample += ' ' + parsed.hostname + parsed.pathname;
    return AD_RELAY_PATTERNS.some(function(pattern) {
      return pattern.test(sample);
    });
  }

  function isAdUrl(url) {
    var raw = textOf(url);
    if (!raw) return false;
    if (/^\\s*javascript:/i.test(raw) && /(open|popup|popunder|clickunder|location|redirect)/i.test(raw)) return true;

    var parsed = parseUrl(raw);
    if (!parsed) return false;
    if (isAdHost(parsed.hostname)) return true;
    if (isAllowedHost(parsed.hostname)) return false;
    if (isMediaAssetUrl(raw)) return false;
    if (isAdRelayUrl(raw)) return true;

    return hasAdWords(raw);
  }

  function shouldBlockNavigation(url) {
    var raw = textOf(url);
    if (!raw) return false;
    if (raw === 'about:blank' || raw.charAt(0) === '#') return false;
    if (/^\\s*data:/i.test(raw)) return true;
    return isAdUrl(raw);
  }

  function classText(el) {
    try {
      if (!el) return '';
      if (typeof el.className === 'string') return el.className;
      if (el.className && typeof el.className.baseVal === 'string') return el.className.baseVal;
      if (el.classList && el.classList.length) return Array.prototype.join.call(el.classList, ' ');
    } catch(e) {}
    return '';
  }

  function elementIdentity(el) {
    return textOf(
      (el.id || '') + ' ' +
      classText(el) + ' ' +
      (el.getAttribute && (
        (el.getAttribute('aria-label') || '') + ' ' +
        (el.getAttribute('role') || '') + ' ' +
        (el.getAttribute('data-player') || '') + ' ' +
        (el.getAttribute('data-plyr') || '') + ' ' +
        (el.getAttribute('data-jwplayer') || '')
      ))
    ).toLowerCase();
  }

  function isKnownPlayerElement(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName.toUpperCase();
    if (/^(VIDEO|AUDIO|SOURCE|TRACK)$/i.test(tag)) return true;
    var id = elementIdentity(el);
    return /(plyr|jwplayer|jw-|video[-_]js|vjs[-_]?|mejs|flowplayer|html5[-_]video|mediaelement|dplayer|artplayer|vidstack|shaka|hls[-_]?player|bitmovin|xgplayer|clappr|fluid_player|player-wrapper|player-container|video-player|stream-player)/i.test(id) ||
      Boolean(el.getAttribute && (
        el.getAttribute('data-player') ||
        el.getAttribute('data-plyr') ||
        el.getAttribute('data-jwplayer')
      ));
  }

  function isInsidePlayer(el) {
    var node = el;
    while (node && node !== document.documentElement) {
      if (isKnownPlayerElement(node)) return true;
      node = node.parentElement;
    }
    return false;
  }

  function hasSuspiciousInlineHandler(el) {
    if (!el || !el.getAttribute) return false;
    var inline = [
      el.getAttribute('onclick'),
      el.getAttribute('onmousedown'),
      el.getAttribute('onmouseup'),
      el.getAttribute('onpointerdown'),
      el.getAttribute('ontouchstart')
    ].join(' ');
    return SUSPICIOUS_CODE.test(inline) || (hasAdWords(inline) && /open|location|href|assign|replace/i.test(inline));
  }

  function blockOpen() {
    return null;
  }

  try {
    Object.defineProperty(window, 'open', {
      value: blockOpen,
      writable: false,
      configurable: false
    });
  } catch(e) {
    window.open = blockOpen;
  }

  try {
    Object.defineProperty(window, 'openDatabase', {
      value: blockOpen,
      writable: false,
      configurable: false
    });
  } catch(e) {
    window.openDatabase = blockOpen;
  }

  try {
    var originalJsonParse = JSON.parse;
    function sanitizeTrackingFields(value, depth) {
      if (!value || depth > 8) return value;
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) sanitizeTrackingFields(value[i], depth + 1);
        return value;
      }
      if (typeof value !== 'object') return value;

      Object.keys(value).forEach(function(key) {
        try {
          if (TRACKING_KEYS.test(key)) {
            value[key] = '';
            return;
          }
          if (typeof value[key] === 'object') sanitizeTrackingFields(value[key], depth + 1);
        } catch(e) {}
      });
      return value;
    }

    JSON.parse = function(text) {
      var result = originalJsonParse.apply(this, arguments);
      return sanitizeTrackingFields(result, 0);
    };
  } catch(e) {}

  try {
    var originalEval = window.eval;
    window.eval = function(code) {
      if (typeof code === 'string' && SUSPICIOUS_CODE.test(code)) return undefined;
      return originalEval.call(window, code);
    };
  } catch(e) {}

  try {
    var OriginalFunction = window.Function;
    window.Function = function() {
      var args = Array.prototype.slice.call(arguments);
      var body = textOf(args[args.length - 1]);
      if (SUSPICIOUS_CODE.test(body)) return function() {};
      return OriginalFunction.apply(this, args);
    };
    window.Function.prototype = OriginalFunction.prototype;
  } catch(e) {}

  try {
    var originalFetch = window.fetch;
    window.fetch = function(input) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (isAdUrl(url)) return Promise.reject(new TypeError('Blocked'));
      return originalFetch.apply(this, arguments);
    };
  } catch(e) {}

  try {
    var originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      this.__proxyBlocked = isAdUrl(url);
      if (!this.__proxyBlocked) return originalXHROpen.apply(this, arguments);
    };
    var originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
      if (this.__proxyBlocked) return;
      return originalXHRSend.apply(this, arguments);
    };
  } catch(e) {}

  try {
    Object.defineProperty(document, 'location', {
      get: function() { return window.location; },
      set: function(value) {
        if (!shouldBlockNavigation(value)) window.location.href = value;
      },
      configurable: true
    });
  } catch(e) {}

  try {
    var locationProps = ['href', 'hostname', 'host', 'pathname', 'search', 'port', 'protocol'];
    locationProps.forEach(function(prop) {
      var desc = Object.getOwnPropertyDescriptor(Location.prototype, prop);
      if (!desc || !desc.set || !desc.get) return;
      Object.defineProperty(Location.prototype, prop, {
        get: desc.get,
        set: function(value) {
          if (!shouldBlockNavigation(value)) desc.set.call(this, value);
        },
        configurable: true
      });
    });

    var originalAssign = Location.prototype.assign;
    Location.prototype.assign = function(url) {
      if (!shouldBlockNavigation(url)) return originalAssign.call(this, url);
    };

    var originalReplace = Location.prototype.replace;
    Location.prototype.replace = function(url) {
      if (!shouldBlockNavigation(url)) return originalReplace.call(this, url);
    };
  } catch(e) {}

  try {
    var originalPushState = history.pushState;
    var originalReplaceState = history.replaceState;
    history.pushState = function(state, title, url) {
      if (url && shouldBlockNavigation(url)) return;
      return originalPushState.apply(this, arguments);
    };
    history.replaceState = function(state, title, url) {
      if (url && shouldBlockNavigation(url)) return;
      return originalReplaceState.apply(this, arguments);
    };
  } catch(e) {}

  try {
    var originalPostMessage = window.postMessage;
    function isSuspiciousMessage(message) {
      var data = textOf(message);
      if (!data) return false;
      if (isAdUrl(data)) return true;
      if (/(window\\.open|\\.open\\(|location\\.(?:href|assign|replace)|top\\.location|parent\\.location|pop(?:up|under)|clickunder)/i.test(data)) return true;
      return /(^|[\\W_])(redirect|navigate)([\\W_]|$)/i.test(data) && hasAdWords(data);
    }

    window.postMessage = function(message, targetOrigin, transfer) {
      try {
        var data = typeof message === 'string' ? message : JSON.stringify(message);
        if (isSuspiciousMessage(data)) return;
      } catch(e) {}
      return originalPostMessage.apply(this, arguments);
    };

    window.addEventListener('message', function(event) {
      try {
        var data = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
        if (isSuspiciousMessage(data)) event.stopImmediatePropagation();
      } catch(e) {}
    }, true);
  } catch(e) {}

  try {
    var originalFormSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function() {
      var action = this.getAttribute('action') || this.action || '';
      if (action && shouldBlockNavigation(action)) return;
      return originalFormSubmit.apply(this, arguments);
    };
    document.addEventListener('submit', function(event) {
      var form = event.target;
      var action = form && form.getAttribute ? (form.getAttribute('action') || form.action || '') : '';
      if (action && shouldBlockNavigation(action)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  } catch(e) {}

  try {
    var originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
      var attr = textOf(name).toLowerCase();
      var val = textOf(value);
      var tag = this.tagName ? this.tagName.toUpperCase() : '';

      if (attr === 'sandbox') {
        val = val.replace(/\\ballow-top-navigation(?:-by-user-activation)?\\b/gi, '')
          .replace(/\\ballow-popups-to-escape-sandbox\\b/gi, '')
          .replace(/\\s+/g, ' ')
          .trim();
        return originalSetAttribute.call(this, name, val);
      }
      if (attr === 'src' && /^(VIDEO|SOURCE|AUDIO|TRACK)$/i.test(tag)) {
        return originalSetAttribute.apply(this, arguments);
      }
      if ((attr === 'href' || attr === 'src') && isAdUrl(val)) return;
      if (attr === 'target' && /^_blank$/i.test(val)) {
        var href = this.getAttribute && this.getAttribute('href');
        if (href && isAdUrl(href)) return;
      }
      if (/^on(?:click|mousedown|mouseup|pointerdown|touchstart)$/i.test(attr) && SUSPICIOUS_CODE.test(val)) return;

      return originalSetAttribute.apply(this, arguments);
    };
  } catch(e) {}

  try {
    var originalAnchorClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function() {
      var href = this.getAttribute('href') || '';
      if (isAdUrl(href) || /^\\s*javascript:/i.test(href)) return;
      return originalAnchorClick.apply(this, arguments);
    };
  } catch(e) {}

  try {
    var originalHtmlClick = HTMLElement.prototype.click;
    HTMLElement.prototype.click = function() {
      if (isInsidePlayer(this)) return originalHtmlClick.apply(this, arguments);
      if (hasSuspiciousInlineHandler(this)) return;
      return originalHtmlClick.apply(this, arguments);
    };
  } catch(e) {}

  try {
    var originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      var eventName = textOf(type).toLowerCase();
      var guardedEvent = /^(click|auxclick|mousedown|mouseup|pointerdown|pointerup|touchstart|touchend|touchmove|mousemove)$/.test(eventName);
      if (guardedEvent && listener && !isInsidePlayer(this)) {
        var source = '';
        try {
          source = typeof listener === 'function' ? listener.toString() : textOf(listener && listener.handleEvent);
        } catch(e) {}
        if (SUSPICIOUS_CODE.test(source)) return;
      }
      return originalAddEventListener.apply(this, arguments);
    };
  } catch(e) {}

  function pointerX(event) {
    if (event && event.touches && event.touches[0]) return event.touches[0].clientX;
    if (event && event.changedTouches && event.changedTouches[0]) return event.changedTouches[0].clientX;
    return event ? event.clientX : undefined;
  }

  function pointerY(event) {
    if (event && event.touches && event.touches[0]) return event.touches[0].clientY;
    if (event && event.changedTouches && event.changedTouches[0]) return event.changedTouches[0].clientY;
    return event ? event.clientY : undefined;
  }

  function getPath(event) {
    if (event && event.composedPath) return event.composedPath();
    var path = [];
    var node = event && event.target;
    while (node) {
      path.push(node);
      node = node.parentElement;
    }
    return path;
  }

  function isTransparentClickLayer(el) {
    if (!el || !el.tagName || isInsidePlayer(el)) return false;
    try {
      var style = window.getComputedStyle(el);
      var rect = el.getBoundingClientRect();
      var large = rect.width > window.innerWidth * 0.55 && rect.height > window.innerHeight * 0.18;
      var nearlyInvisible = parseFloat(style.opacity || '1') <= 0.05 ||
        style.visibility === 'hidden' ||
        style.backgroundColor === 'transparent' ||
        style.backgroundColor === 'rgba(0, 0, 0, 0)';
      var clickable = style.cursor === 'pointer' || el.tagName === 'A' || hasSuspiciousInlineHandler(el);
      var empty = !textOf(el.textContent).trim() && !el.querySelector('video,audio,canvas,svg,img,button,input');
      return large && nearlyInvisible && clickable && empty;
    } catch(e) {
      return false;
    }
  }

  function blockBadClick(event) {
    var path = getPath(event);
    for (var i = 0; i < path.length; i++) {
      if (path[i] && path[i].tagName && isInsidePlayer(path[i])) return;
    }

    for (var j = 0; j < path.length; j++) {
      var el = path[j];
      if (!el || !el.tagName) continue;

      if (el.tagName === 'A' || el.tagName === 'AREA') {
        var href = el.getAttribute('href') || '';
        if (isAdUrl(href) || /^\\s*javascript:/i.test(href)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
      }

      if (hasSuspiciousInlineHandler(el) || isTransparentClickLayer(el)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
    }
  }

  function scrubPoint(x, y) {
    if (typeof x !== 'number' || typeof y !== 'number') return;
    try {
      var stack = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [document.elementFromPoint(x, y)];
      for (var i = 0; i < stack.length; i++) {
        var el = stack[i];
        if (!el || el === document.documentElement || el === document.body) continue;
        if (isInsidePlayer(el)) return;
        if (isTransparentClickLayer(el)) {
          el.style.setProperty('pointer-events', 'none', 'important');
        }
      }
    } catch(e) {}
  }

  function scrubHover(event) {
    scrubPoint(pointerX(event), pointerY(event));
  }

  document.addEventListener('pointermove', scrubHover, true);
  document.addEventListener('mousemove', scrubHover, true);
  document.addEventListener('pointerdown', blockBadClick, true);
  document.addEventListener('mousedown', blockBadClick, true);
  document.addEventListener('click', blockBadClick, true);
  document.addEventListener('auxclick', blockBadClick, true);
  document.addEventListener('touchstart', blockBadClick, { capture: true, passive: false });
  document.addEventListener('touchend', blockBadClick, { capture: true, passive: false });

  function cleanKnownAdElements() {
    try {
      document.querySelectorAll('a[href], area[href], iframe[src], script[src], form[action]').forEach(function(el) {
        if (isInsidePlayer(el)) return;
        var url = el.getAttribute('href') || el.getAttribute('src') || el.getAttribute('action') || '';
        if (isAdUrl(url)) {
          if (el.tagName === 'SCRIPT') {
            el.remove();
            return;
          }
          el.removeAttribute('href');
          el.removeAttribute('src');
          el.removeAttribute('action');
          el.style.setProperty('pointer-events', 'none', 'important');
        }
      });
    } catch(e) {}
  }

  cleanKnownAdElements();
  setTimeout(cleanKnownAdElements, 1000);
  setTimeout(cleanKnownAdElements, 3000);
  setInterval(cleanKnownAdElements, 5000);
})();
</script>`;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let srcUrl: URL;
  try {
    srcUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url parameter" }, { status: 400 });
  }

  if (srcUrl.protocol !== "https:" && srcUrl.protocol !== "http:") {
    return NextResponse.json({ error: "Unsupported url protocol" }, { status: 400 });
  }

  try {
    const res = await fetch(srcUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: srcUrl.origin + "/",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return failedSourceResponse(url, `Provider returned ${res.status} ${res.statusText}`);
    }

    let html = await res.text();

    html = html.replace(/<meta[^>]+http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, "");
    html = html.replace(
      /\bsandbox=(["'])([^"']*)\1/gi,
      (_match, quote: string, value: string) => `sandbox=${quote}${sanitizeSandboxTokens(value)}${quote}`
    );
    html = html.replace(
      /(setAttribute\(\s*["']sandbox["']\s*,\s*["'])([^"']*)(["']\s*\))/gi,
      (_match, before: string, value: string, after: string) => `${before}${sanitizeSandboxTokens(value)}${after}`
    );
    html = html.replace(
      /function\s+vzKill\s*\(\s*reason\s*\)\s*\{/g,
      "function vzKill(reason){if(reason==='devtools')return;"
    );
    html = html.replace(
      /<script[^>]+src=["'][^"']*(?:googlesyndication|doubleclick|pagead2|adsbygoogle|propellerads|popads|popcash|monetag|hilltopads|exoclick|juicyads|adsterra|taboola|outbrain|revcontent)[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,
      ""
    );

    const depth = parseInt(req.nextUrl.searchParams.get("depth") || "0", 10);

    if (depth < 3) {
      html = html.replace(
        /<iframe\s+[^>]*?src\s*=\s*"([^"]+)"[^>]*>/gi,
        (_match, iframeSrc: string) => {
          const decodedSrc = iframeSrc.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
          if (
            !decodedSrc.startsWith("data:") &&
            !decodedSrc.startsWith("javascript:") &&
            !decodedSrc.startsWith("#") &&
            !decodedSrc.startsWith("/api/player-proxy")
          ) {
            try {
              const resolved = new URL(decodedSrc, srcUrl.origin).toString();
              if (resolved.startsWith("http")) {
                const proxied = `/api/player-proxy?url=${encodeURIComponent(resolved)}&depth=${depth + 1}&preserveLocation=1`;
                return _match.replace(`"${iframeSrc}"`, `"${proxied}"`);
              }
            } catch {}
          }
          return _match;
        }
      );
    }

    const blockAds = req.nextUrl.searchParams.get("blocker") === "1";
    const preserveLocation = req.nextUrl.searchParams.get("preserveLocation") === "1";
    const providerBase = `<base href="${escapeHtmlAttribute(srcUrl.toString())}">`;
    const locationShim = `<script>
(function () {
  var ownScript = document.currentScript;
  try {
    history.replaceState(history.state, document.title, location.origin + ${JSON.stringify(`${srcUrl.pathname}${srcUrl.search}${srcUrl.hash}`)});
  } catch(e) {}
  try {
    if (ownScript && ownScript.remove) ownScript.remove();
  } catch(e) {}
})();
</script>`;
    const injected = `${providerBase}${providerBase ? "\n" : ""}${preserveLocation ? "" : `${locationShim}\n`}${blockAds ? buildBlockerScript(srcUrl.hostname) : ""}`;

    if (/<head[\s>]/i.test(html)) {
      html = html.replace(/(<head[^>]*>)/i, `$1\n${injected}`);
    } else {
      html = `<head>${injected}</head>\n${html}`;
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
    return failedSourceResponse(url, String(err));
  }
}
