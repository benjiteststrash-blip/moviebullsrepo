import {API_PATHS, EMBED_PATH, PROVIDER_ORIGIN, preparePlayerHtml, readLimited, validApiQuery} from './filter.mjs';
import {offlineBridge} from './offline-bridge.mjs';

function originOf(value) { try { return new URL(value).origin; } catch { return ''; } }
function errorResponse(message, status = 502) {
  return new Response(message, {status, headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
function bootstrap(appOrigin) {
  return `<script>(()=>{
    ${offlineBridge(appOrigin)}
    const send=state=>parent.postMessage({type:'moviebulls-player',state},${JSON.stringify(appOrigin)});
    Object.defineProperty(window,'open',{value:()=>null,writable:false,configurable:false});
    document.addEventListener('click',event=>{
      const link=event.target.closest?.('a');
      if(link&&['_blank','_top','_parent'].includes(link.target)){event.preventDefault();event.stopImmediatePropagation();}
    },true);
    document.addEventListener('DOMContentLoaded',()=>{
      const video=document.querySelector('video');
      if(!video){send('unavailable');return;}
      video.addEventListener('playing',()=>send('playing'));
      send('ready');
      const unavailable=document.getElementById('fs-player-unavailable');
      if(unavailable)new MutationObserver(()=>{if(!unavailable.hidden)send('unavailable');}).observe(unavailable,{attributes:true});
    });
  })();</script>`;
}

const playerWorker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const appOrigin = originOf(env.APP_ORIGIN);
    if (url.pathname === '/health' && request.method === 'GET') return Response.json({ok:true,player:'primary-only'});
    if (!appOrigin) return errorResponse('Player configuration missing',503);
    if (request.method !== 'GET') return errorResponse('Method not allowed',405);
    const isEmbed = EMBED_PATH.test(url.pathname);
    const isApi = API_PATHS.has(url.pathname);
    if (!isEmbed && !isApi) return errorResponse('Not found',404);
    const referrerOrigin = originOf(request.headers.get('referer'));
    if (isEmbed && (referrerOrigin !== appOrigin || url.search)) return errorResponse('Open the player from Moviebulls',403);
    if (isApi && (referrerOrigin !== url.origin || !validApiQuery(url.searchParams))) return errorResponse('Invalid playback request',403);
    const client = request.headers.get('CF-Connecting-IP') || 'local';
    const {success} = await env.PLAYER_REQUESTS.limit({key:client});
    if (!success) return new Response('Too many requests. Please wait a minute.',{status:429,headers:{'Retry-After':'60','Cache-Control':'no-store'}});
    try {
      const providerPath = isEmbed ? url.pathname.replace(/\/?$/, '/') : '/wp-json/fstream/v1/' + url.pathname.slice(5);
      const upstreamUrl = new URL(providerPath, PROVIDER_ORIGIN);
      // The provider CDN caches embed pages beyond their stream-token lifetime.
      if (isEmbed) upstreamUrl.searchParams.set('_mb',String(Date.now()));
      if (isApi) upstreamUrl.search = url.search;
      const headers = {Referer:PROVIDER_ORIGIN+'/',Accept:isEmbed?'text/html':'application/json','Cache-Control':'no-cache'};
      const userAgent = request.headers.get('user-agent');
      if (userAgent) headers['User-Agent'] = userAgent;
      if (isApi) headers.Origin = PROVIDER_ORIGIN;
      const nonce = request.headers.get('x-wp-nonce');
      if (isApi && nonce && /^[a-zA-Z0-9_-]{1,64}$/.test(nonce)) headers['X-WP-Nonce'] = nonce;
      const upstream = await fetch(upstreamUrl,{headers,cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(15000)});
      if (upstream.status >= 300 && upstream.status < 400) return errorResponse('Provider redirected the player. Please retry.');
      if (isApi) {
        if (!upstream.headers.get('content-type')?.includes('application/json')) return errorResponse('Provider returned an unexpected response');
        return new Response(await readLimited(upstream,1024*1024),{status:upstream.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
      }
      if (!upstream.ok || !upstream.headers.get('content-type')?.includes('text/html')) return errorResponse('This title is temporarily unavailable. Please retry.');
      const html = preparePlayerHtml(await readLimited(upstream,512*1024),url.origin);
      const response = new Response(html,{headers:{
        'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'strict-origin-when-cross-origin','X-Content-Type-Options':'nosniff',
        'Content-Security-Policy':`script-src 'unsafe-inline' 'unsafe-eval' https://vidsrc.wiki https://www.gstatic.com https://www.google.com; frame-src 'none'; worker-src blob:; object-src 'none'; form-action 'none'; base-uri https://vidsrc.wiki; frame-ancestors ${appOrigin}`
      }});
      return new HTMLRewriter()
        .on('head',{element(element){element.prepend(`<base href="${PROVIDER_ORIGIN}${providerPath}">${bootstrap(appOrigin)}`,{html:true});}})
        .on('base',{element(element){element.remove();}})
        .on('script',{element(element){
          const attributes = (element.getAttribute('src')||'')+' '+(element.getAttribute('id')||'');
          // These last two scripts only detect debugging and redirect the top page; playback uses player.js.
          if (/googletagmanager|google_gtagjs|googlesitekit|monetag|doubleclick|googlesyndication|disable-devtool|devtools-guard/i.test(attributes)) element.remove();
        }})
        .on('iframe',{element(element){element.remove();}})
        .transform(response);
    } catch(error) {
      console.error(JSON.stringify({event:'player-failed',path:url.pathname,reason:error.name}));
      return errorResponse('The player could not load this title. Please retry.');
    }
  }
};
export default playerWorker;
