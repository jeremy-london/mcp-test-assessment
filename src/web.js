// Local inspector UI and a JSON bridge over the same callTool() the MCP server uses.
// No dependencies beyond node:http. Binds to 127.0.0.1 only.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { callTool } from './server.js';
import { TOOLS } from './tools.js';
import { EXAMPLES } from './examples.js';

const here = dirname(fileURLToPath(import.meta.url));
const UI_DIR = join(here, '..', 'ui');
const PORT = Number(process.env.PORT ?? 3000);
const MAX_BODY_BYTES = 64 * 1024;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  const isRaw = Buffer.isBuffer(body) || typeof body === 'string';
  res.end(isRaw ? body : JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw Object.assign(new Error('request body too large'), { status: 413 });
    }
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw Object.assign(new Error('request body is not valid JSON'), { status: 400 });
  }
}

export function createWebServer() {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');

      if (req.method === 'GET' && url.pathname === '/api/tools') {
        return send(
          res,
          200,
          TOOLS.map(({ name, description, inputSchema }) => ({
            name,
            description,
            inputSchema,
            examples: EXAMPLES[name] ?? [],
          })),
        );
      }

      const match = url.pathname.match(/^\/api\/tools\/([a-z_]+)$/);
      if (req.method === 'POST' && match) {
        const args = await readBody(req);
        const started = Date.now();
        const result = await callTool(match[1], args);
        return send(res, result.isError ? 400 : 200, {
          tool: match[1],
          isError: result.isError,
          durationMs: Date.now() - started,
          data: JSON.parse(result.content[0].text),
        });
      }

      if (req.method === 'GET' && (url.pathname === '/' || url.pathname.startsWith('/static/'))) {
        const file = url.pathname === '/' ? 'index.html' : url.pathname.slice('/static/'.length);
        if (file.includes('..')) {
          return send(res, 400, { error: 'bad path' });
        }
        const body = await readFile(join(UI_DIR, file));
        return send(res, 200, body, TYPES[extname(file)] ?? 'application/octet-stream');
      }

      send(res, 404, { error: 'not found' });
    } catch (err) {
      const status = err.status ?? (err.code === 'ENOENT' ? 404 : 500);
      send(res, status, { error: err.message });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createWebServer().listen(PORT, '127.0.0.1', () => {
    console.log(`UI running at http://127.0.0.1:${PORT}`);
  });
}
