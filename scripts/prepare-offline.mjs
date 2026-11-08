import { copyFile, mkdir } from 'node:fs/promises';
await mkdir(new URL('../public/offline/', import.meta.url), { recursive: true });
await copyFile(new URL('../node_modules/hls.js/dist/hls.light.min.js', import.meta.url), new URL('../public/offline/hls.min.js', import.meta.url));
await copyFile(new URL('../node_modules/hls.js/LICENSE', import.meta.url), new URL('../public/offline/hls-LICENSE.txt', import.meta.url));
