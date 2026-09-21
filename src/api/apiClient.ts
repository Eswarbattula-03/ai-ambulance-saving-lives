/**
 * LifeRescue AI — real backend API client
 * ------------------------------------------------------------------
 * Thin, typed wrapper around the Express + MongoDB Atlas backend
 * (see /server). The base URL is the ONLY configuration the browser
 * needs — no database credentials live here or anywhere in the
 * frontend bundle. MongoDB access happens exclusively server-side.
 *
 * Base URL resolution:
 *   1. import.meta.env.VITE_API_URL   (from .env, e.g. http://localhost:5000)
 *   2. fallback: http://localhost:5000 (the local Express API)
 *
 * The Vite dev server also proxies "/api" → :5000 (see vite.config.ts),
 * but we call the absolute base URL directly as required for dev.
 */

/** Development API base URL. Overridable via VITE_API_URL. */
const RAW_BASE =
  (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5000';

/** Normalised base URL without a trailing slash. */
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');

/** Collection names exposed by the backend. */
export type CollectionName =
  | 'users'
  | 'patients'
  | 'drivers'
  | 'ambulances'
  | 'hospitals'
  | 'requests'
  | 'trips'
  | 'notifications'
  | 'contacts';

export interface BackendStatus {
  ok: boolean;
  service?: string;
  backend?: string;
  database?: {
    name?: string;
    connected?: boolean;
    state?: string;
    host?: string | null;
    uriConfigured?: boolean;
    ping?: boolean;
    error?: string | null;
  };
  time?: string;
}

export interface AuthResult {
  ok: boolean;
  user?: Record<string, unknown> & { id?: string; name?: string; email?: string; role?: string };
  message?: string;
}

/** Thrown for non-2xx responses so callers can surface a message. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  const text = await res.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!res.ok) {
    throw new ApiError(data?.message || data?.error || `HTTP ${res.status}`, res.status);
  }
  return data as T;
}

export const api = {
  /** Liveness probe (no DB access). */
  health: () => request<{ ok: boolean; service?: string; time?: string }>('/api/health'),

  /** Combined backend + database status. */
  status: () => request<BackendStatus>('/api/status'),

  /** Document counts for every collection. */
  collectionCounts: () =>
    request<{ ok: boolean; database?: string; collections: Record<string, number> }>(
      '/api/collections',
    ),

  /** Read-only list of a collection. */
  list: <T>(collection: CollectionName, limit = 500) =>
    request<{ ok: boolean; count: number; data: T[] }>(
      `/api/${collection}?limit=${limit}`,
    ),

  /** Read a single document by business id. */
  get: <T>(collection: CollectionName, id: string) =>
    request<{ ok: boolean; data: T }>(`/api/${collection}/${encodeURIComponent(id)}`),

  /** Create (or idempotently upsert) a document. */
  create: <T>(collection: CollectionName, item: unknown) =>
    request<{ ok: boolean; data: T }>(`/api/${collection}`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  /** Update a document by business id. */
  update: <T>(collection: CollectionName, id: string, patch: unknown) =>
    request<{ ok: boolean; data: T }>(
      `/api/${collection}/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: JSON.stringify(patch) },
    ),

  /** Delete a document by business id. */
  remove: (collection: CollectionName, id: string) =>
    request<{ ok: boolean }>(`/api/${collection}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  /** Idempotently seed collections (upsert by business id). */
  seed: (collections: Partial<Record<CollectionName, unknown[]>>) =>
    request<{ ok: boolean; seeded?: Record<string, number>; message?: string }>('/api/seed', {
      method: 'POST',
      body: JSON.stringify({ collections }),
    }),

  /** Authenticate against the backend. */
  login: (email: string, password: string) =>
    request<AuthResult>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /** Register a new account on the backend. */
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }) =>
    request<AuthResult>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export default api;