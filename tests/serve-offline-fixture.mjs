import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const fixtureRoot = resolve(process.argv[2]);
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.m3u8': 'application/vnd.apple.mpegurl', '.ts': 'video/mp2t' };
const harness = `<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline browser check</title><body><h1>Offline browser check</h1><button id="save" disabled>Save test video</button><p id="status" role="status">Preparing offline storage</p><a href="/downloads.html">Open Downloads</a><script type="module">
import {saveDownload} from '/offline/store.mjs';
const button=document.querySelector('#save'),status=document.querySelector('#status');
await navigator.serviceWorker.register('/pwa-sw.js');
await navigator.serviceWorker.ready;
function ready(){if(navigator.serviceWorker.controller){button.disabled=false;status.textContent='Ready to save the generated 12-second video';}}
navigator.serviceWorker.addEventListener('controllerchange',ready);ready();
button.onclick=async()=>{button.disabled=true;try{await saveDownload('/fixture/index.m3u8',{id:'movie-999999999',title:'Offline playback check'},{signal:new AbortController().signal,onProgress:p=>status.textContent='Saving '+p.done+'/'+p.total});status.textContent='Saved successfully';}catch(e){status.textContent=e.message;}finally{button.disabled=false;}};
</script></body></html>`;
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://127.0.0.1:4173').pathname;
    if (path === '/test.html') { response.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' }); response.end(harness); return; }
    const root = path.startsWith('/fixture/') ? fixtureRoot : publicRoot;
    const relative = path.startsWith('/fixture/') ? path.slice('/fixture/'.length) : path.slice(1);
    const file = resolve(root, relative);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || !(await stat(file)).isFile()) throw new Error('Not found');
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[file.slice(file.lastIndexOf('.'))] || 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-store' });
    response.end(body);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(4173, '127.0.0.1', () => console.log('Offline fixture: http://127.0.0.1:4173/test.html'));
