// Serves the built dist/ folder for production QA screenshots.
// Usage: npm run build && node serve.mjs  →  http://localhost:3000
//
// For day-to-day development, use `npm run dev` (Vite, port 5173) instead.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 3000;
const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));
// Serve the build output, not the project root — Vite emits everything into dist/.
const ROOT = path.join(PROJECT_ROOT, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
    let filePath = path.normalize(path.join(ROOT, urlPath));

    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    let stat;
    try { stat = await fs.stat(filePath); } catch { stat = null; }

    if (stat && stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      try { stat = await fs.stat(filePath); } catch { stat = null; }
    }

    // SPA fallback: any non-asset path that wasn't found falls back to dist/index.html
    // so client-side routes like /lessons, /stats, /settings work on a static host.
    if (!stat) {
      const ext = path.extname(filePath).toLowerCase();
      if (!ext) {
        const fallback = path.join(ROOT, 'index.html');
        try {
          const data = await fs.readFile(fallback);
          res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
          res.end(data);
          return;
        } catch {
          // dist/index.html doesn't exist either → fall through to 404
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found — run `npm run build` first, then `node serve.mjs`.');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] ?? 'application/octet-stream';
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`500 ${err.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}`);
});
