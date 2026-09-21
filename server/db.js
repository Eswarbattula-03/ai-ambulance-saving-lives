/**
 * LifeRescue AI — MongoDB (Atlas) connection helper
 * ------------------------------------------------------------------
 * Reads the connection string EXCLUSIVELY from the `MONGODB_URI`
 * environment variable (loaded from `.env` by dotenv).
 *
 * - No credentials are hardcoded anywhere in this file.
 * - Any credentials present in an error message are redacted before
 *   they are written to the console.
 */

import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';

const SERVER_SELECTION_TIMEOUT_MS = Number(process.env.MONGODB_TIMEOUT_MS || 10000);

/**
 * The application database. The backend must always talk to the
 * "liferescue" database, even if the configured URI omits a database
 * path (or points somewhere else). Override with MONGODB_DB_NAME only if
 * you deliberately want a different database.
 */
export const DB_NAME = (process.env.MONGODB_DB_NAME || 'liferescue').trim();

/**
 * Public DNS resolvers used ONLY as a fallback when the system resolver
 * cannot answer the SRV/TXT lookups required by `mongodb+srv://` URIs.
 * Override with the MONGODB_DNS_SERVERS env var (comma separated).
 */
const DNS_FALLBACK_SERVERS = (process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Some Windows setups can resolve SRV records via the OS resolver but NOT
 * via Node's bundled c-ares resolver (which the MongoDB driver uses),
 * producing `querySrv ECONNREFUSED`. Detect that and, if so, point Node's
 * resolver at public DNS so the connection can proceed.
 * Credentials are never involved here.
 */
async function ensureSrvResolution(uri) {
  if (!/^mongodb\+srv:\/\//i.test(uri)) return; // direct (non-SRV) URI

  let host;
  try {
    host = new URL(uri.replace(/^mongodb\+srv:/i, 'http:')).hostname;
  } catch {
    return; // let the driver surface the malformed-URI error
  }

  try {
    await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
  } catch {
    try {
      dns.setServers(DNS_FALLBACK_SERVERS);
      await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
      console.warn(`[db] System DNS could not resolve the MongoDB SRV record; using fallback DNS: ${DNS_FALLBACK_SERVERS.join(', ')}`);
    } catch {
      console.warn('[db] SRV resolution failed with both the system and fallback DNS resolvers.');
    }
  }
}

/** Last captured (and redacted) connection error, exposed via getDbStatus(). */
let lastError = null;

/**
 * Strip user:password credentials out of any string so it is safe to log.
 * e.g. mongodb+srv://user:secret@host/db -> mongodb+srv://user:****@host/db
 */
export function redact(text) {
  if (!text) return '';
  return String(text)
    .replace(/mongodb(\+srv)?:\/\/[^:@/\s]+:[^@/\s]+@/gi, 'mongodb$1://****:****@')
    .replace(/\/\/[^:@/\s]+:[^@/\s]+@/g, '//****:****@');
}

/** True when MONGODB_URI is present and non-empty. */
export function hasUri() {
  return typeof process.env.MONGODB_URI === 'string' && process.env.MONGODB_URI.trim().length > 0;
}

/**
 * Connect to MongoDB Atlas with Mongoose.
 * Resolves with the live connection on success, or `null` on failure
 * (the API still starts so `/api/db-status` can report the problem).
 */
export async function connectToDatabase() {
  if (!hasUri()) {
    lastError = 'MONGODB_URI is not set. Add it to the .env file (see .env.example).';
    console.error('[db] MONGODB_URI is not set. Create a .env file with MONGODB_URI=<your Atlas connection string>.');
    return null;
  }

  // Make sure the SRV lookup can succeed before handing the URI to Mongoose.
  await ensureSrvResolution(process.env.MONGODB_URI);

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log('[db] MongoDB connection established.');
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected.');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('[db] MongoDB reconnected.');
  });
  mongoose.connection.on('error', (err) => {
    lastError = redact(err?.message || err);
    console.error('[db] MongoDB error:', lastError);
  });

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      // Force the database the application must use, regardless of the
      // path present in the URI.
      dbName: DB_NAME,
    });
    lastError = null;
    const { host, name } = mongoose.connection;
    // Only the host + database name are logged — never the credentials.
    console.log(`[db] Connected to MongoDB Atlas (database: "${name}", host: ${host}).`);
    return mongoose.connection;
  } catch (error) {
    lastError = redact(error?.message || error);
    console.error('[db] MongoDB connection FAILED:', lastError);
    return null;
  }
}

/** Non-secret snapshot of the current connection state. */
export function getDbStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = mongoose.connection.readyState;
  return {
    ok: state === 1,
    connected: state === 1,
    state: states[state] || 'unknown',
    database: mongoose.connection.name || DB_NAME,
    host: mongoose.connection.host || null,
    uriConfigured: hasUri(),
    error: lastError,
  };
}

/** Actively ping the server (read-only, non-destructive). */
export async function pingDatabase() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) return false;
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    lastError = redact(error?.message || error);
    return false;
  }
}

/** Gracefully close the connection (used on process shutdown). */
export async function closeDatabase() {
  try {
    await mongoose.connection.close();
  } catch {
    /* ignore */
  }
}

export default mongoose;