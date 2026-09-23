// Local-only browser preview. Run `node scripts/preview-server.mjs` from this repo.
// Replaces js/jev.js in the HTTP response without changing the app's files.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const mockPath = fileURLToPath(new URL('./mock-jev.js', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const security = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; connect-src 'none'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'",
  'X-Content-Type-Options': 'nosniff',
};

const banner = '<aside style="padding:.7rem 1rem;background:#edf4e8;color:#17281d;font:600 14px system-ui">Lokale Testvorschau · simulierte Jev-Antworten · keine API-Anfrage · Urteile: <strong id="preview-requests">0</strong></aside>';

async function responseFor(pathname) {
  if (pathname === '/js/key.js') return { code: 404, data: 'Key unavailable in preview', type: 'text/plain' };
  if (pathname === '/js/jev.js') return { code: 200, data: await readFile(mockPath), type: types['.js'] };

  const name = pathname === '/' ? '/index.html' : pathname;
  if (!/^\/(?:index\.html|(?:css|js|img)\/[-\w./]+)$/.test(name)) return { code: 404, data: 'Not found', type: 'text/plain' };
  const file = resolve(root, `.${name}`);
  if (!file.startsWith(root + sep) || !(await stat(file)).isFile()) return { code: 404, data: 'Not found', type: 'text/plain' };
  const ext = file.slice(file.lastIndexOf('.'));
  if (!types[ext]) return { code: 404, data: 'Not found', type: 'text/plain' };
  let data = await readFile(file);
  if (name === '/index.html') {
    // The preview works entirely offline. Fonts fall back to system fonts.
    const html = data.toString('utf8')
      .replace(/\s*<link rel="preconnect" href="https:\/\/fonts\.(?:googleapis|gstatic)\.com"[^>]*\/>/g, '')
      .replace(/\s*<link\s+rel="stylesheet"\s+href="https:\/\/fonts\.googleapis\.com\/css2\?[^\"]+"\s*\/>/g, '')
      .replace('<body>', `<body>\n    ${banner}`);
    data = Buffer.from(html);
  }
  return { code: 200, data, type: types[ext] };
}

export function createPreviewServer() {
  return createServer(async (request, response) => {
    try {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, security).end();
        return;
      }
      const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
      const { code, data, type } = await responseFor(pathname);
      response.writeHead(code, { ...security, 'Content-Type': `${type}; charset=utf-8` });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch {
      response.writeHead(404, security).end('Not found');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createPreviewServer();
  server.listen(0, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${server.address().port}`;
    process.stdout.write(`JudgeYou Testvorschau: ${url}\nNur lokal. Keine echten API-Schlüssel oder Jev-Anfragen. Mit Strg+C beenden.\n`);
  });
}
