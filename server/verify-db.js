/**
 * LifeRescue AI — MongoDB Atlas connection check
 * ------------------------------------------------------------------
 * Non-destructive verification script. It reuses the same `db.js`
 * module the API server uses, so a success here means the server will
 * connect too.
 *
 * Run with:  npm run db:check
 *
 * It never prints the connection string or the password — only the
 * database name, host and a redacted error (if any).
 */

import { connectToDatabase, getDbStatus, pingDatabase, closeDatabase } from './db.js';

async function main() {
  console.log('[check] Connecting to MongoDB Atlas using MONGODB_URI…');

  await connectToDatabase();
  const status = getDbStatus();
  const ping = status.connected ? await pingDatabase() : false;

  console.log('[check] Result:', JSON.stringify({ ...status, ping }, null, 2));

  await closeDatabase();

  if (status.connected && ping) {
    console.log('[check] ✅ MongoDB Atlas connection VERIFIED.');
    process.exit(0);
  }

  console.error('[check] ❌ MongoDB Atlas connection NOT verified.');
  process.exit(1);
}

main().catch(async (error) => {
  console.error('[check] Unexpected error:', error?.message || error);
  await closeDatabase();
  process.exit(1);
});