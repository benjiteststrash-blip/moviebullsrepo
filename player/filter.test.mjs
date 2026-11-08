import test from 'node:test';
import assert from 'node:assert/strict';
import {EMBED_PATH, preparePlayerHtml, validApiQuery, readLimited} from './filter.mjs';
import playerWorker from './index.mjs';
test('only numeric movie and episode embed paths',()=>{
  for (const path of ['/embed/movie/550/','/embed/tv/1399/1/1']) assert(EMBED_PATH.test(path));
  for (const path of ['/embed/movie/0','/embed/movie/https://example.com','/embed/movie/550/../../admin','/embed/tv/1/0/1']) assert(!EMBED_PATH.test(path));
});
test('rejects arbitrary query parameters and duplicate tokens',()=>{
  assert(validApiQuery(new URLSearchParams('tok=abc&failed=1')));
  for(const query of ['url=https://example.com','tok=a&tok=b','tok=a&redirect=https://example.com','tmdb_id=abc&type=movie']) assert(!validApiQuery(new URLSearchParams(query)));
});
test('preserves primary playback and removes iframe fallbacks',()=>{
  const source='var FSTREAM_PLAYER_SETTINGS = '+JSON.stringify({backupServers:[{url:'https://ads.example'}],priorityServers:[{}],embedApi:{servers:[{}]},streamTok:'primary-token',clientExtract:{auto:true}})+';\nvar FSTREAM={"restUrl":"https://vidsrc.wiki/wp-json/fstream/v1/"};';
  const output=preparePlayerHtml(source,'https://player.example');
  for (const expected of ['"backupServers":[]','"priorityServers":[]','"embedApi":null','primary-token','https://player.example/api/']) assert(output.includes(expected));
  assert(!output.includes('https://ads.example'));
  assert.throws(()=>preparePlayerHtml('<html>changed format</html>','https://player.example'));
});
test('caps upstream response bodies',async()=>{
  assert.equal(await readLimited(new Response('small'),10),'small');
  await assert.rejects(readLimited(new Response('too large'),3));
});
test('rejects embeds from other sites and arbitrary API URLs before any fetch',async()=>{
  const env={APP_ORIGIN:'https://app.example',PLAYER_REQUESTS:{limit(){throw new Error('Unexpected rate-limit call');}}};
  const embed=await playerWorker.fetch(new Request('https://player.example/embed/movie/550/',{headers:{Referer:'https://other.example/'}}),env);
  assert.equal(embed.status,403);
  const api=await playerWorker.fetch(new Request('https://player.example/api/stream?url=https://other.example/',{headers:{Referer:'https://player.example/'}}),env);
  assert.equal(api.status,403);
});
test('returns a retryable response when the request limit is reached',async()=>{
  const env={APP_ORIGIN:'https://app.example',PLAYER_REQUESTS:{async limit(){return {success:false};}}};
  const response=await playerWorker.fetch(new Request('https://player.example/embed/movie/550/',{headers:{Referer:'https://app.example/'}}),env);
  assert.equal(response.status,429);
  assert.equal(response.headers.get('Retry-After'),'60');
});
test('requests a fresh provider token page rather than an expired CDN copy',async(t)=>{
  let upstream;
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    upstream={url:new URL(url),options};
    return new Response('Unavailable',{status:503});
  });
  const env={APP_ORIGIN:'https://app.example',PLAYER_REQUESTS:{async limit(){return {success:true};}}};
  await playerWorker.fetch(new Request('https://player.example/embed/movie/550/',{headers:{Referer:'https://app.example/'}}),env);
  assert.equal(upstream.url.origin,'https://vidsrc.wiki');
  assert.match(upstream.url.searchParams.get('_mb'),/^\d+$/);
  assert.equal(upstream.options.cache,'no-store');
});
