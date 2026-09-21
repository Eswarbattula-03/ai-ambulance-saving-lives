/**
 * LifeRescue AI — full server integration check
 * ------------------------------------------------------------------
 * Spawns the real backend (`server/index.js`) exactly as `npm run
 * server` does, waits for it to boot, probes the HTTP endpoints, then
 * stops it. This verifies the end-to-end startup path (dotenv → Mongoose
 * connect attempt → Express listen), independent of whether Atlas
 * authentication succeeds.
 *
 * Run with:  npm run test:server
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const entry = path.join(__dirname, 'index.js');
const PORT = Number(process.env.PORT || 5000);
const BASE = `http://127.0.0.1:${PORT}`;

const child = spawn(process.execPath, [entry], {
  cwd: path.join(__dirname, '..'),
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

child.stdout.on('data', (d) => process.stdout.write(`[server] ${d}`));
child.stderr.on('data', (d) => process.stderr.write(`[server] ${d}`));

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function get(target) {
  return new Promise((resolve, reject) => {
    const req = http.get(target, { agent: false, headers: { Connection: 'close' } }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
  });
}

async function probe(pathname) {
  // Retry a few times to allow the server to finish booting.
  for (let i = 0; i < 20; i += 1) {
    try {
      return await get(BASE + pathname);
    } catch {
      await delay(500);
    }
  }
  throw new Error(`server did not respond on ${pathname}`);
}

async function main() {
  let failures = 0;
  try {
    const health = await probe('/api/health');
    console.log(`[itest] GET /api/health -> ${health.status} ${health.body}`);
    if (health.status !== 200) failures += 1;

    const dbStatus = await probe('/api/db-status');
    console.log(`[itest] GET /api/db-status -> ${dbStatus.status} ${dbStatus.body}`);
    // 200 = connected, 503 = reachable but not authed/connected. Both mean the server ran.
    if (![200, 503].includes(dbStatus.status)) failures += 1;

    console.log(
      failures === 0
        ? '[itest] ✅ Server boots and serves HTTP endpoints.'
        : '[itest] ❌ Server integration check FAILED.',
    );
  } catch (error) {
    failures += 1;
    console.error('[itest] error:', error?.message || error);
  } finally {
    child.kill();
    process.exitCode = failures === 0 ? 0 : 1;
  }
}

main();