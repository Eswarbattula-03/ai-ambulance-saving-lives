/**
 * LifeRescue AI — Shared domain types
 * ------------------------------------------------------------------
 * These types describe the whole emergency-transportation domain:
 * users, patients, ambulances, drivers, hospitals, emergency requests,
 * trips, notifications, contacts and vitals.
 *
 * NOTE: All data in this project is DEMO / SIMULATED and is intended
 * for an educational college project. It is not real medical data.
 */

export type Role = 'patient' | 'driver' | 'hospital' | 'admin';

export type Priority = 'critical' | 'urgent' | 'non-critical';

export type EmergencyType =
  | 'Accident'
  | 'Chest Pain'
  | 'Breathing Problem'
  | 'Unconsciousness'
  | 'Severe Bleeding'
  | 'Burn Injury'
  | 'Pregnancy Emergency'
  | 'Child Emergency'
  | 'Other';

export type AmbulanceType =
  | 'Basic Life Support'
  | 'Advanced Life Support'
  | 'ICU Ambulance'
  | 'Neonatal Ambulance'
  | 'Patient Transport'
  | 'Accident Emergency';

export type AmbulanceStatus = 'Available' | 'Busy' | 'Offline' | 'Maintenance';

export type RequestStatus =
  | 'Requested'
  | 'Assigned'
  | 'Driver Accepted'
  | 'On The Way'
  | 'Arrived At Patient'
  | 'Patient Picked Up'
  | 'Going To Hospital'
  | 'Arrived At Hospital'
  | 'Handover Complete'
  | 'Completed'
  | 'Cancelled';

/** Ordered stages used by the live-tracking timeline. */
export const TRIP_STAGES: RequestStatus[] = [
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
];

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  password: string; // demo only — never do this in production
  avatar?: string;
  address?: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
  emergencyContactName: string;
  allergies?: string;
  conditions?: string;
  registeredAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNo: string;
  experienceYears: number;
  rating: number;
  status: 'Available' | 'On Trip' | 'Offline';
  currentAmbulanceId: string | null;
  completedTrips: number;
  joinedAt: string;
  location: string;
}

export interface Equipment {
  name: string;
  available: boolean;
}

export interface Ambulance {
  id: string; // e.g. AMB-101
  type: AmbulanceType;
  driverId: string | null;
  driverName: string;
  location: string;
  status: AmbulanceStatus;
  equipment: Equipment[];
  distanceKm: number;
  etaMinutes: number;
  vehicleNo: string;
  baseHospitalId: string;
  lastService: string;
  latitude: number;
  longitude: number;
  /** Progress 0..1 of the ambulance along the demo route. */
  routeProgress: number;
}

export type Department =
  | 'Emergency'
  | 'ICU'
  | 'Cardiology'
  | 'Neurology'
  | 'Orthopaedics'
  | 'Pediatrics'
  | 'Obstetrics'
  | 'Trauma'
  | 'Burns'
  | 'General Medicine';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  location: string;
  phone: string;
  distanceKm: number;
  emergencyDept: boolean;
  icuAvailable: boolean;
  icuBeds: number;
  icuBedsTotal: number;
  departments: Department[];
  specializations: string[];
  rating: number;
  open24x7: boolean;
  ambulancesAvailable: number;
  incomingPatients: number;
  latitude: number;
  longitude: number;
}

export interface Vitals {
  heartRate: number; // bpm
  spo2: number; // %
  systolic: number; // mmHg
  diastolic: number; // mmHg
  temperature: number; // °C
  respiratoryRate: number; // breaths/min
  recordedAt: string;
}

export interface EmergencyRequest {
  id: string; // e.g. EMR-2041
  patientId: string | null;
  patientName: string;
  patientAge: number;
  phone: string;
  location: string;
  emergencyType: EmergencyType;
  symptoms: string;
  isAccident: boolean;
  isConscious: boolean;
  breathingDifficulty: boolean;
  severeBleeding: boolean;
  emergencyContact: string;
  priority: Priority;
  aiSummary: string;
  status: RequestStatus;
  ambulanceId: string | null;
  hospitalId: string | null;
  createdAt: string;
  completedAt?: string;
  responseTimeMinutes?: number;
  timeline: { status: RequestStatus; at: string }[];
  vitals?: Vitals;
  notes?: string;
}

export type NotificationType = 'emergency' | 'ambulance' | 'hospital' | 'info' | 'success';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  audience: Role | 'all';
  link?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  primary: boolean;
}

export interface CompletedTrip {
  id: string;
  requestId: string;
  date: string;
  patientName: string;
  emergencyType: EmergencyType;
  ambulanceId: string;
  driverName: string;
  hospitalName: string;
  responseTimeMinutes: number;
  tripDurationMinutes: number;
  status: 'Completed';
  distanceKm: number;
  rating?: number;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  at: string;
}

export interface Settings {
  language: 'en' | 'te' | 'hi';
  darkMode: boolean;
  notifications: boolean;
  locationPermission: boolean;
  shareData: boolean;
  soundAlerts: boolean;
  autoCallEmergencyContact: boolean;
}

export interface BookingFilters {
  location: string;
  type: 'all' | AmbulanceType;
  onlyAvailable: boolean;
  maxDistance: number;
  requiredEquipment: string[];
}

/** Result returned by the mock API after a booking/action. */
export interface ActionResult<T = unknown> {
  ok: boolean;
  message: string;
  data?: T;
}