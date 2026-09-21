/**
 * LifeRescue AI — backend synchronisation helper
 * ------------------------------------------------------------------
 * Bridges the browser store with the Express + MongoDB Atlas backend.
 *
 * Design goals:
 *  - The UI must never break if the backend is offline. Every network
 *    call here is best-effort: failures are logged and swallowed, and
 *    the app falls back to its local in-memory (demo) state.
 *  - Reads happen once at startup. If the database is empty it is
 *    seeded (idempotently) from the app's existing demo data set.
 *  - Writes are fire-and-forget so the existing synchronous UI actions
 *    remain instant and unchanged.
 *
 * No database credentials are used here — the browser only ever talks
 * to the HTTP API on http://localhost:5000.
 */

import { api, API_BASE_URL, type CollectionName } from './apiClient';
import type {
  Ambulance,
  AppNotification,
  CompletedTrip,
  Driver,
  EmergencyContact,
  EmergencyRequest,
  Hospital,
  Patient,
  User,
} from '../types';

export interface LoadedData {
  users: User[];
  patients: Patient[];
  drivers: Driver[];
  ambulances: Ambulance[];
  hospitals: Hospital[];
  requests: EmergencyRequest[];
  trips: CompletedTrip[];
  notifications: AppNotification[];
  contacts: EmergencyContact[];
}

export interface BackendInfo {
  online: boolean;
  databaseConnected: boolean;
  databaseName?: string;
  host?: string | null;
  baseUrl: string;
}

/** Snapshot of backend reachability for the UI. */
export async function checkBackend(): Promise<BackendInfo> {
  try {
    const status = await api.status();
    return {
      online: true,
      databaseConnected: Boolean(status?.database?.connected && status?.database?.ping),
      databaseName: status?.database?.name,
      host: status?.database?.host ?? null,
      baseUrl: API_BASE_URL,
    };
  } catch {
    return { online: false, databaseConnected: false, baseUrl: API_BASE_URL };
  }
}

/** Payload shape accepted by POST /api/seed. */
export type SeedPayload = Partial<Record<CollectionName, unknown[]>>;

/** Idempotently seed the backend from the app's demo data. */
export async function seedBackend(payload: SeedPayload): Promise<boolean> {
  try {
    const res = await api.seed(payload);
    return Boolean(res?.ok);
  } catch (error) {
    console.warn('[backendSync] seed failed:', (error as Error)?.message || error);
    return false;
  }
}

/**
 * Load every collection from the backend. Returns null if the backend
 * is unreachable or the database is not connected.
 */
export async function loadBackendData(): Promise<LoadedData | null> {
  try {
    const [users, patients, drivers, ambulances, hospitals, requests, trips, notifications, contacts] =
      await Promise.all([
        api.list<User>('users'),
        api.list<Patient>('patients'),
        api.list<Driver>('drivers'),
        api.list<Ambulance>('ambulances'),
        api.list<Hospital>('hospitals'),
        api.list<EmergencyRequest>('requests'),
        api.list<CompletedTrip>('trips'),
        api.list<AppNotification>('notifications'),
        api.list<EmergencyContact>('contacts'),
      ]);
    return {
      users: users.data ?? [],
      patients: patients.data ?? [],
      drivers: drivers.data ?? [],
      ambulances: ambulances.data ?? [],
      hospitals: hospitals.data ?? [],
      requests: requests.data ?? [],
      trips: trips.data ?? [],
      notifications: notifications.data ?? [],
      contacts: contacts.data ?? [],
    };
  } catch (error) {
    console.warn('[backendSync] load failed:', (error as Error)?.message || error);
    return null;
  }
}

/** Fire-and-forget write helper — never throws, never blocks the UI. */
function background(label: string, run: () => Promise<unknown>): void {
  run().catch((error) => {
    console.warn(`[backendSync] ${label} failed:`, (error as Error)?.message || error);
  });
}

/** Create/upsert a document (best-effort). */
export function saveDoc(collection: CollectionName, doc: unknown): void {
  background(`save ${collection}`, () => api.create(collection, doc));
}

/** Patch a document by id (best-effort). */
export function patchDoc(collection: CollectionName, id: string, patch: unknown): void {
  background(`patch ${collection}/${id}`, () => api.update(collection, id, patch));
}

/** Delete a document by id (best-effort). */
export function removeDoc(collection: CollectionName, id: string): void {
  background(`remove ${collection}/${id}`, () => api.remove(collection, id));
}