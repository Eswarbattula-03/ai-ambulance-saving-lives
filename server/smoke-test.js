/**
 * LifeRescue AI — backend smoke test
 * ------------------------------------------------------------------
 * Starts the Express app on an ephemeral port, hits the public
 * endpoints, prints the responses and exits. No database connection is
 * required (the app is created without connecting).
 *
 * Run with:  npm run test:api
 */

import http from 'node:http';
import { createApp } from './app.js';

/** Perform a GET request that always closes its socket (Connection: close). */
function get(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { agent: false, headers: { Connection: 'close' } }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
  });
}

const app = createApp();
const server = app.listen(0, async () => {
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  let failures = 0;

  try {
    for (const path of ['/', '/api/health', '/api/db-status']) {
      const { status, body } = await get(base + path);
      // /api/db-status returns 503 until a real Atlas URI is configured.
      const expected = path === '/api/db-status' ? [200, 503] : [200];
      const ok = expected.includes(status);
      if (!ok) failures += 1;
      console.log(`[smoke] ${ok ? 'PASS' : 'FAIL'} GET ${path} -> ${status} ${body}`);
    }
  } catch (error) {
    failures += 1;
    console.error('[smoke] request failed:', error?.message || error);
  } finally {
    console.log(failures === 0 ? '[smoke] ✅ API smoke test PASSED.' : '[smoke] ❌ API smoke test FAILED.');
    process.exitCode = failures === 0 ? 0 : 1;
    server.close(); // let Node exit naturally (avoids a Windows libuv exit race)
  }
});