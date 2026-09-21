/**
 * LifeRescue AI — Express application (routes)
 * ------------------------------------------------------------------
 * Kept separate from `index.js` so the app can be imported and tested
 * (e.g. a smoke test) without opening a listening socket or requiring
 * a database connection at import time.
 *
 * This backend persists the app's domain data in MongoDB Atlas and
 * exposes:
 *
 *   GET    /                    → service info
 *   GET    /api/health          → liveness probe (no DB access)
 *   GET    /api/db-status       → MongoDB connection status (ping)
 *   GET    /api/status          → combined app + database status
 *   GET    /api/collections     → list of data collections and counts
 *   POST   /api/seed            → idempotently seed collections (upsert by id)
 *   POST   /api/auth/login      → authenticate a demo user
 *   POST   /api/auth/register   → register a new user
 *   GET    /api/:collection     → list documents for a known collection
 *   POST   /api/:collection     → create (upsert by business id) a document
 *   GET    /api/:collection/:id → read a single document by business id
 *   PATCH  /api/:collection/:id → update a document by business id
 *   DELETE /api/:collection/:id → delete a document by business id
 *
 * The routes only serve the collections the existing app uses
 * (users, patients, drivers, ambulances, hospitals, requests, trips,
 * notifications, contacts). No database credentials are ever exposed.
 */

import express from 'express';
import { getDbStatus, pingDatabase, DB_NAME } from './db.js';
import { collections } from './models/index.js';

/** Collections the API is allowed to serve. */
const ALLOWED = Object.keys(collections);

/** Resolve a collection name to its Mongoose model (or null if unknown). */
const modelFor = (name) => (ALLOWED.includes(name) ? collections[name] : null);

/** Standard "database not connected" guard response. */
const dbUnavailable = (res) =>
  res.status(503).json({ ok: false, message: 'Database not connected.' });

/** Strip any password field from a returned user document. */
function sanitizeUser(doc) {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete obj.password;
  return obj;
}

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  /* --------------------------- CORS -------------------------------- */
  /* Allows the Vite dev server (different port) to call this API.     */
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*');
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });

  /* --------------------------- Routes ------------------------------ */

  /** Liveness probe — does not touch the database. */
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'liferescue-ai-api', time: new Date().toISOString() });
  });

  /** Reports the MongoDB Atlas connection state (read-only ping). */
  app.get('/api/db-status', async (_req, res) => {
    const status = getDbStatus();
    const ping = status.connected ? await pingDatabase() : false;
    res.status(status.connected && ping ? 200 : 503).json({ ...status, ping });
  });

  /** Combined application + database status for the frontend. */
  app.get('/api/status', async (_req, res) => {
    const status = getDbStatus();
    const ping = status.connected ? await pingDatabase() : false;
    const connected = status.connected && ping;
    res.status(connected ? 200 : 503).json({
      ok: connected,
      service: 'liferescue-ai-api',
      backend: 'running',
      database: { name: DB_NAME, ...status, ping },
      time: new Date().toISOString(),
    });
  });

  /** List the available data collections (and document counts). */
  app.get('/api/collections', async (_req, res) => {
    if (!getDbStatus().connected) return dbUnavailable(res);
    try {
      const entries = await Promise.all(
        Object.entries(collections).map(async ([name, model]) => [
          name,
          await model.estimatedDocumentCount(),
        ]),
      );
      return res.json({ ok: true, database: DB_NAME, collections: Object.fromEntries(entries) });
    } catch {
      return res.status(500).json({ ok: false, message: 'Failed to read collections.' });
    }
  });

  /* --------------------------- Seeding ----------------------------- */

  /**
   * Idempotently seed collections. Body: { collections: { name: [docs] } }.
   * Each document is upserted by its business `id`, so calling this more
   * than once never creates duplicates and never overwrites richer data
   * already present.
   */
  app.post('/api/seed', async (req, res) => {
    if (!getDbStatus().connected) return dbUnavailable(res);
    const payload = req.body?.collections;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ ok: false, message: 'Body must be { collections: { name: [docs] } }' });
    }
    const seeded = {};
    try {
      for (const [name, docs] of Object.entries(payload)) {
        const model = modelFor(name);
        if (!model || !Array.isArray(docs)) continue;
        let count = 0;
        for (const doc of docs) {
          if (!doc || typeof doc !== 'object' || !doc.id) continue;
          await model.updateOne(
            { id: doc.id },
            { $setOnInsert: doc },
            { upsert: true },
          );
          count += 1;
        }
        seeded[name] = count;
      }
      return res.json({ ok: true, seeded });
    } catch (error) {
      return res.status(500).json({ ok: false, message: 'Seed failed.', error: String(error?.message || error) });
    }
  });

  /* ----------------------------- Auth ------------------------------ */

  /** Authenticate a demo user by email + password. */
  app.post('/api/auth/login', async (req, res) => {
    if (!getDbStatus().connected) return dbUnavailable(res);
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email and password are required.' });
    }
    try {
      const user = await collections.users.findOne({ email }).select('+password').lean();
      if (!user) return res.status(404).json({ ok: false, message: 'No account found with that email address.' });
      if (user.password !== password) {
        return res.status(401).json({ ok: false, message: 'Incorrect password. Please try again.' });
      }
      return res.json({ ok: true, user: sanitizeUser(user), message: `Welcome back, ${user.name}!` });
    } catch {
      return res.status(500).json({ ok: false, message: 'Sign-in failed. Please try again.' });
    }
  });

  /** Register a new user. */
  app.post('/api/auth/register', async (req, res) => {
    if (!getDbStatus().connected) return dbUnavailable(res);
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const phone = String(req.body?.phone || '').trim();
    const password = String(req.body?.password || '');
    const role = String(req.body?.role || 'patient');
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, message: 'Name, email and password are required.' });
    }
    try {
      const existing = await collections.users.findOne({ email }).lean();
      if (existing) {
        return res.status(409).json({ ok: false, message: 'An account with this email already exists.' });
      }
      const created = await collections.users.create({
        id: `USR-${Date.now().toString().slice(-6)}`,
        name,
        email,
        phone,
        role,
        password,
        createdAt: new Date().toISOString(),
      });
      return res.status(201).json({ ok: true, user: sanitizeUser(created), message: 'Registration successful. Please sign in.' });
    } catch {
      return res.status(500).json({ ok: false, message: 'Registration failed. Please try again.' });
    }
  });

  /* ------------------ Generic collection CRUD ---------------------- */

  /** List documents for a known collection. */
  app.get('/api/:collection', async (req, res) => {
    const model = modelFor(req.params.collection);
    if (!model) return res.status(404).json({ ok: false, message: 'Unknown collection' });
    if (!getDbStatus().connected) return dbUnavailable(res);
    try {
      const limit = Math.min(Number(req.query.limit) || 500, 500);
      const docs = await model.find().sort({ createdAt: -1 }).limit(limit).lean();
      const data = req.params.collection === 'users' ? docs.map(sanitizeUser) : docs;
      return res.json({ ok: true, count: data.length, data });
    } catch {
      return res.status(500).json({ ok: false, message: 'Query failed.' });
    }
  });

  /** Create (upsert by business id) a document. */
  app.post('/api/:collection', async (req, res) => {
    const name = req.params.collection;
    const model = modelFor(name);
    if (!model) return res.status(404).json({ ok: false, message: 'Unknown collection' });
    if (!getDbStatus().connected) return dbUnavailable(res);
    const doc = req.body;
    if (!doc || typeof doc !== 'object' || !doc.id) {
      return res.status(400).json({ ok: false, message: 'Body must be an object with an "id" field.' });
    }
    try {
      const saved = await model.findOneAndUpdate(
        { id: doc.id },
        { $set: doc },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).lean();
      const data = name === 'users' ? sanitizeUser(saved) : saved;
      return res.status(201).json({ ok: true, data });
    } catch (error) {
      return res.status(400).json({ ok: false, message: 'Create failed.', error: String(error?.message || error) });
    }
  });

  /** Read a single document by business id. */
  app.get('/api/:collection/:id', async (req, res) => {
    const name = req.params.collection;
    const model = modelFor(name);
    if (!model) return res.status(404).json({ ok: false, message: 'Unknown collection' });
    if (!getDbStatus().connected) return dbUnavailable(res);
    try {
      const doc = await model.findOne({ id: req.params.id }).lean();
      if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });
      return res.json({ ok: true, data: name === 'users' ? sanitizeUser(doc) : doc });
    } catch {
      return res.status(500).json({ ok: false, message: 'Query failed.' });
    }
  });

  /** Update a document by business id. */
  app.patch('/api/:collection/:id', async (req, res) => {
    const name = req.params.collection;
    const model = modelFor(name);
    if (!model) return res.status(404).json({ ok: false, message: 'Unknown collection' });
    if (!getDbStatus().connected) return dbUnavailable(res);
    const patch = req.body;
    if (!patch || typeof patch !== 'object') {
      return res.status(400).json({ ok: false, message: 'Body must be an object of fields to update.' });
    }
    try {
      const saved = await model.findOneAndUpdate(
        { id: req.params.id },
        { $set: patch },
        { new: true },
      ).lean();
      if (!saved) return res.status(404).json({ ok: false, message: 'Not found' });
      return res.json({ ok: true, data: name === 'users' ? sanitizeUser(saved) : saved });
    } catch (error) {
      return res.status(400).json({ ok: false, message: 'Update failed.', error: String(error?.message || error) });
    }
  });

  /** Delete a document by business id. */
  app.delete('/api/:collection/:id', async (req, res) => {
    const model = modelFor(req.params.collection);
    if (!model) return res.status(404).json({ ok: false, message: 'Unknown collection' });
    if (!getDbStatus().connected) return dbUnavailable(res);
    try {
      const result = await model.deleteOne({ id: req.params.id });
      if (!result.deletedCount) return res.status(404).json({ ok: false, message: 'Not found' });
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'Delete failed.' });
    }
  });

  /** Friendly root. */
  app.get('/', (_req, res) => {
    res.json({
      ok: true,
      service: 'liferescue-ai-api',
      endpoints: [
        '/api/health',
        '/api/db-status',
        '/api/status',
        '/api/collections',
        '/api/seed',
        '/api/auth/login',
        '/api/auth/register',
        '/api/:collection',
      ],
    });
  });

  /* --------------------------- 404 --------------------------------- */
  app.use((_req, res) => {
    res.status(404).json({ ok: false, message: 'Not found' });
  });

  return app;
}

export default createApp;