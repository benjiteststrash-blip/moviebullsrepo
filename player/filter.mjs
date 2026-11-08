export const PROVIDER_ORIGIN = 'https://vidsrc.wiki';
export const EMBED_PATH = /^\/embed\/(?:movie\/[1-9]\d{0,8}|tv\/[1-9]\d{0,8}\/[1-9]\d{0,3}\/[1-9]\d{0,3})\/?$/;
export const API_PATHS = new Set(['/api/stream', '/api/stream/more', '/api/cx']);
const QUERY_KEYS = new Set(['tok', 'tmdb_id', 'type', 'season', 'episode', 'failed']);

export function validApiQuery(params) {
  if (params.toString().length > 4096) return false;
  for (const [key, value] of params) {
    if (!QUERY_KEYS.has(key) || params.getAll(key).length !== 1 || value.length > 2048) return false;
    if (['tmdb_id', 'season', 'episode'].includes(key) && !/^[1-9]\d{0,8}$/.test(value)) return false;
    if (key === 'type' && !['movie', 'tv'].includes(value)) return false;
    if (key === 'failed' && value !== '1') return false;
  }
  return params.has('tok') || (params.has('tmdb_id') && params.has('type'));
}

export function preparePlayerHtml(html, origin) {
  let foundSettings = false;
  html = html.replace(/(\bvar\s+FSTREAM_PLAYER_SETTINGS\s*=\s*)(\{[^\n]*\})(\s*;)/, (_match, before, json, after) => {
    const settings = JSON.parse(json);
    settings.backupServers = [];
    settings.priorityServers = [];
    settings.embedApi = null;
    settings.forceSource = 'default';
    settings.forceBackupIndex = '0';
    foundSettings = true;
    return before + JSON.stringify(settings).replaceAll('<', '\\u003c') + after;
  });
  if (!foundSettings) throw new Error('Provider player format changed');
  return html.replaceAll(`${PROVIDER_ORIGIN}/wp-json/fstream/v1/`, `${origin}/api/`);
}

export async function readLimited(response, limit) {
  if (Number(response.headers.get('content-length')) > limit) throw new Error('Response too large');
  const reader = response.body?.getReader();
  if (!reader) return '';
  const chunks = []; let size = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error('Response too large');
      chunks.push(value);
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
  const result = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(result);
}
