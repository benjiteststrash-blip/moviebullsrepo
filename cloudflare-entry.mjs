import nextWorker from './.open-next/worker.js';

const appWorker = {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    if (path.startsWith('/api/player-proxy')) return Response.json({error:'Reload the title page to use the current player.'},{status:410});
    // Anonymous visitors have no account ID; generous per-IP limits also accommodate shared networks.
    const {success} = await env.APP_REQUESTS.limit({key:request.headers.get('CF-Connecting-IP') || 'local'});
    if (!success) return new Response('Too many requests. Please wait a minute.',{status:429,headers:{'Retry-After':'60','Cache-Control':'no-store'}});
    const cacheable = request.method === 'GET' && path.startsWith('/api/tmdb/');
    if (cacheable) {
      const cached = await caches.default.match(request);
      if (cached) return cached;
    }
    const response = await nextWorker.fetch(request,env,ctx);
    if (cacheable && response.ok) ctx.waitUntil(caches.default.put(request,response.clone()));
    return response;
  }
};
export default appWorker;
export * from './.open-next/worker.js';
