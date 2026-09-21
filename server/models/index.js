/**
 * LifeRescue AI — Mongoose models
 * ------------------------------------------------------------------
 * Only the models actually used by the existing application are
 * defined here. Each schema mirrors the TypeScript interfaces in
 * `src/types.ts` so the backend and the frontend speak the same shape.
 *
 * Conventions:
 *  - The app uses its own human-readable string ids (e.g. "AMB-101",
 *    "EMR-2041"). Mongoose's default `id` virtual is disabled and a real
 *    `id` field is used instead (unique + indexed).
 *  - `versionKey` is disabled so documents serialise cleanly for the UI.
 *
 * DEMO / EDUCATIONAL project — data is simulated, not real medical data.
 * NOTE: the `User` model stores a demo password. It is `select: false`
 * so it is never returned by default queries or list endpoints.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Shared schema options: no `__v`, no default `id` virtual. */
const baseOptions = { versionKey: false, id: false, timestamps: false };

/** A required, unique, indexed business id. */
const businessId = { type: String, required: true, unique: true, index: true, trim: true };

/* ------------------------------- User ------------------------------ */

const userSchema = new Schema(
  {
    id: businessId,
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: '', trim: true },
    role: {
      type: String,
      required: true,
      enum: ['patient', 'driver', 'hospital', 'admin'],
      index: true,
    },
    // Demo-only credential. Never returned unless explicitly selected.
    password: { type: String, default: '', select: false },
    avatar: { type: String },
    address: { type: String },
    emergencyContact: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  baseOptions,
);

/* ------------------------------ Patient ---------------------------- */

const patientSchema = new Schema(
  {
    id: businessId,
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    address: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    emergencyContactName: { type: String, default: '' },
    allergies: { type: String },
    conditions: { type: String },
    registeredAt: { type: String, default: () => new Date().toISOString() },
  },
  baseOptions,
);

/* ------------------------------ Driver ----------------------------- */

const driverSchema = new Schema(
  {
    id: businessId,
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    licenseNo: { type: String, default: '' },
    experienceYears: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    status: { type: String, enum: ['Available', 'On Trip', 'Offline'], default: 'Offline', index: true },
    currentAmbulanceId: { type: String, default: null },
    completedTrips: { type: Number, default: 0, min: 0 },
    joinedAt: { type: String, default: () => new Date().toISOString() },
    location: { type: String, default: '' },
  },
  baseOptions,
);

/* ----------------------------- Ambulance --------------------------- */

const equipmentSchema = new Schema(
  { name: { type: String, required: true }, available: { type: Boolean, default: true } },
  { _id: false },
);

const ambulanceSchema = new Schema(
  {
    id: businessId,
    type: {
      type: String,
      required: true,
      enum: [
        'Basic Life Support',
        'Advanced Life Support',
        'ICU Ambulance',
        'Neonatal Ambulance',
        'Patient Transport',
        'Accident Emergency',
      ],
    },
    driverId: { type: String, default: null },
    driverName: { type: String, default: 'Unassigned' },
    location: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Available', 'Busy', 'Offline', 'Maintenance'],
      default: 'Available',
      index: true,
    },
    equipment: { type: [equipmentSchema], default: [] },
    distanceKm: { type: Number, default: 0 },
    etaMinutes: { type: Number, default: 0 },
    vehicleNo: { type: String, default: '' },
    baseHospitalId: { type: String, default: '' },
    lastService: { type: String, default: () => new Date().toISOString() },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    routeProgress: { type: Number, default: 0, min: 0, max: 1 },
  },
  baseOptions,
);

/* ----------------------------- Hospital ---------------------------- */

const hospitalSchema = new Schema(
  {
    id: businessId,
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
    distanceKm: { type: Number, default: 0 },
    emergencyDept: { type: Boolean, default: false },
    icuAvailable: { type: Boolean, default: false },
    icuBeds: { type: Number, default: 0, min: 0 },
    icuBedsTotal: { type: Number, default: 0, min: 0 },
    departments: { type: [String], default: [] },
    specializations: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    open24x7: { type: Boolean, default: false },
    ambulancesAvailable: { type: Number, default: 0, min: 0 },
    incomingPatients: { type: Number, default: 0, min: 0 },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
  },
  baseOptions,
);

/* -------------------------- EmergencyRequest ----------------------- */

const vitalsSchema = new Schema(
  {
    heartRate: { type: Number, default: 0 },
    spo2: { type: Number, default: 0 },
    systolic: { type: Number, default: 0 },
    diastolic: { type: Number, default: 0 },
    temperature: { type: Number, default: 0 },
    respiratoryRate: { type: Number, default: 0 },
    recordedAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false },
);

const timelineSchema = new Schema(
  { status: { type: String, required: true }, at: { type: String, required: true } },
  { _id: false },
);

const REQUEST_STATUSES = [
  'Requested',
  'Assigned',
  'Driver Accepted',
  'On The Way',
  'Arrived At Patient',
  'Patient Picked Up',
  'Going To Hospital',
  'Arrived At Hospital',
  'Handover Complete',
  'Completed',
  'Cancelled',
];

const emergencyRequestSchema = new Schema(
  {
    id: businessId,
    patientId: { type: String, default: null },
    patientName: { type: String, required: true, trim: true },
    patientAge: { type: Number, default: 0, min: 0, max: 130 },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    emergencyType: {
      type: String,
      required: true,
      enum: [
        'Accident',
        'Chest Pain',
        'Breathing Problem',
        'Unconsciousness',
        'Severe Bleeding',
        'Burn Injury',
        'Pregnancy Emergency',
        'Child Emergency',
        'Other',
      ],
      index: true,
    },
    symptoms: { type: String, default: '' },
    isAccident: { type: Boolean, default: false },
    isConscious: { type: Boolean, default: true },
    breathingDifficulty: { type: Boolean, default: false },
    severeBleeding: { type: Boolean, default: false },
    emergencyContact: { type: String, default: '' },
    priority: { type: String, enum: ['critical', 'urgent', 'non-critical'], default: 'urgent', index: true },
    aiSummary: { type: String, default: '' },
    status: { type: String, enum: REQUEST_STATUSES, default: 'Requested', index: true },
    ambulanceId: { type: String, default: null },
    hospitalId: { type: String, default: null },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    completedAt: { type: String },
    responseTimeMinutes: { type: Number },
    timeline: { type: [timelineSchema], default: [] },
    vitals: { type: vitalsSchema },
    notes: { type: String },
  },
  baseOptions,
);

/* ------------------------------- Trip ------------------------------ */

const tripSchema = new Schema(
  {
    id: businessId,
    requestId: { type: String, required: true, index: true },
    date: { type: String, default: () => new Date().toISOString() },
    patientName: { type: String, default: '' },
    emergencyType: { type: String, default: 'Other' },
    ambulanceId: { type: String, default: '' },
    driverName: { type: String, default: '' },
    hospitalName: { type: String, default: '' },
    responseTimeMinutes: { type: Number, default: 0 },
    tripDurationMinutes: { type: Number, default: 0 },
    status: { type: String, default: 'Completed' },
    distanceKm: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5 },
  },
  baseOptions,
);

/* --------------------------- Notification -------------------------- */

const notificationSchema = new Schema(
  {
    id: businessId,
    type: { type: String, enum: ['emergency', 'ambulance', 'hospital', 'info', 'success'], default: 'info' },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    read: { type: Boolean, default: false, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    audience: { type: String, enum: ['patient', 'driver', 'hospital', 'admin', 'all'], default: 'all', index: true },
    link: { type: String },
  },
  baseOptions,
);

/* ------------------------- EmergencyContact ------------------------ */

const emergencyContactSchema = new Schema(
  {
    id: businessId,
    name: { type: String, required: true, trim: true },
    relationship: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    primary: { type: Boolean, default: false },
  },
  baseOptions,
);

/* ------------------------------ Exports ---------------------------- */

export const User = mongoose.model('User', userSchema);
export const Patient = mongoose.model('Patient', patientSchema);
export const Driver = mongoose.model('Driver', driverSchema);
export const Ambulance = mongoose.model('Ambulance', ambulanceSchema);
export const Hospital = mongoose.model('Hospital', hospitalSchema);
export const EmergencyRequest = mongoose.model('EmergencyRequest', emergencyRequestSchema);
export const Trip = mongoose.model('Trip', tripSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

/** Collection registry used by the generic read routes. */
export const collections = {
  users: User,
  patients: Patient,
  drivers: Driver,
  ambulances: Ambulance,
  hospitals: Hospital,
  requests: EmergencyRequest,
  trips: Trip,
  notifications: Notification,
  contacts: EmergencyContact,
};

export default {
  User,
  Patient,
  Driver,
  Ambulance,
  Hospital,
  EmergencyRequest,
  Trip,
  Notification,
  EmergencyContact,
};