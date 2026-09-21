/**
 * LifeRescue AI — backend entry point (MongoDB Atlas)
 * ------------------------------------------------------------------
 * Connects to MongoDB Atlas (via Mongoose) and starts the minimal
 * Express API. It does NOT change or replace the existing Vite/React
 * frontend or its browser-only mock API.
 *
 * Run with:  npm run server
 *
 * The connection string is read ONLY from the MONGODB_URI environment
 * variable (loaded from `.env`). No credentials are hardcoded and none
 * are ever printed to the console.
 *
 * Endpoints:
 *   GET /api/health     → liveness probe (no DB access)
 *   GET /api/db-status  → MongoDB connection status (read-only ping)
 *
 * The Vite dev server proxies `/api` → http://localhost:5000
 * (see vite.config.ts), so the frontend can reach these endpoints.
 */

import 'dotenv/config';
import { createApp } from './app.js';
import { connectToDatabase, closeDatabase } from './db.js';

const PORT = Number(process.env.PORT || 5000);

async function start() {
  console.log('[api] Starting LifeRescue AI backend…');

  // Attempt the Atlas connection; the API still starts if it fails so
  // that `/api/db-status` can report the problem.
  await connectToDatabase();

  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`[api] Listening on http://localhost:${PORT}`);
    console.log('[api] Check MongoDB connection: GET /api/db-status');
  });

  const shutdown = async (signal) => {
    console.log(`[api] ${signal} received — shutting down…`);
    server.close();
    await closeDatabase();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

start();