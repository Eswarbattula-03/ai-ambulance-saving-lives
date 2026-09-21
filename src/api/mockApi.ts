/**
 * LifeRescue AI — Mock API layer
 * ------------------------------------------------------------------
 * This module emulates a REST API + real-time service entirely in the
 * browser so the demo works with zero backend setup. Every function is
 * async and returns realistic, deterministic results.
 *
 * If a real backend is configured (see /server + VITE_API_URL), the same
 * call signatures can be pointed at it without touching the UI.
 */

import {
  ambulances as seedAmbulances,
  completedTrips as seedTrips,
  emergencyContacts as seedContacts,
  emergencyRequests as seedRequests,
  hospitals as seedHospitals,
  drivers as seedDrivers,
  patients as seedPatients,
  users as seedUsers,
  notifications as seedNotifications,
  demoRoute,
} from '../data/demoData';
import type {
  ActionResult,
  AiMessage,
  Ambulance,
  AppNotification,
  CompletedTrip,
  EmergencyRequest,
  EmergencyType,
  Hospital,
  Priority,
  RequestStatus,
  Role,
  User,
  Vitals,
} from '../types';
import { TRIP_STAGES } from '../types';

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const formatINRTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? 's' : ''} ago`;
};

export const priorityLabel: Record<Priority, string> = {
  critical: '🔴 Critical',
  urgent: '🟠 Urgent',
  'non-critical': '🟢 Non-Critical',
};

export const priorityClass: Record<Priority, string> = {
  critical: 'badge-critical',
  urgent: 'badge-urgent',
  'non-critical': 'badge-stable',
};

export const statusClass = (status: RequestStatus): string => {
  if (status === 'Completed' || status === 'Handover Complete') return 'badge-stable';
  if (status === 'Cancelled') return 'badge-neutral';
  if (status === 'Requested') return 'badge-info';
  return 'badge-urgent';
};

/* ------------------------------------------------------------------ */
/* AI priority triage (rule-based decision support, NOT diagnosis)     */
/* ------------------------------------------------------------------ */

export interface TriageInput {
  emergencyType: EmergencyType;
  symptoms: string;
  isAccident: boolean;
  isConscious: boolean;
  breathingDifficulty: boolean;
  severeBleeding: boolean;
  age: number;
}

export interface TriageResult {
  priority: Priority;
  score: number;
  summary: string;
  reasons: string[];
  suggestedAmbulanceType: Ambulance['type'];
  suggestedDepartment: string;
  disclaimer: string;
}

/**
 * Rule-based, transparent priority scoring. Presented strictly as
 * decision-support. It never diagnoses a disease.
 */
export function triage(input: TriageInput): TriageResult {
  let score = 0;
  const reasons: string[] = [];

  if (!input.isConscious) { score += 4; reasons.push('Patient reported as not conscious'); }
  if (input.breathingDifficulty) { score += 4; reasons.push('Breathing difficulty reported'); }
  if (input.severeBleeding) { score += 3; reasons.push('Severe bleeding reported'); }
  if (input.isAccident) { score += 2; reasons.push('Accident / trauma involved'); }
  if (input.age >= 65) { score += 2; reasons.push('Age 65 or above (higher risk group)'); }
  if (input.age <= 5) { score += 2; reasons.push('Young child (higher risk group)'); }

  const highRiskTypes: EmergencyType[] = ['Chest Pain', 'Breathing Problem', 'Unconsciousness', 'Pregnancy Emergency'];
  if (highRiskTypes.includes(input.emergencyType)) {
    score += 3;
    reasons.push(`Reported category: ${input.emergencyType}`);
  }
  if (input.emergencyType === 'Severe Bleeding') { score += 2; reasons.push('Reported category: Severe Bleeding'); }
  if (input.emergencyType === 'Burn Injury') { score += 1; reasons.push('Reported category: Burn Injury'); }

  const text = input.symptoms.toLowerCase();
  const redFlags = ['unconscious', 'not breathing', 'no pulse', 'severe', 'heavy bleeding', 'collapsed', 'seizure', 'stroke', 'heart attack', 'unresponsive'];
  const hits = redFlags.filter((w) => text.includes(w));
  if (hits.length) { score += hits.length * 2; reasons.push(`Red-flag keywords in description: ${hits.join(', ')}`); }

  const priority: Priority = score >= 7 ? 'critical' : score >= 3 ? 'urgent' : 'non-critical';

  const ambType: Ambulance['type'] =
    priority === 'critical'
      ? input.breathingDifficulty || !input.isConscious
        ? 'ICU Ambulance'
        : 'Advanced Life Support'
      : input.isAccident
      ? 'Accident Emergency'
      : priority === 'urgent'
      ? 'Advanced Life Support'
      : 'Basic Life Support';

  const dept =
    input.emergencyType === 'Chest Pain' ? 'Cardiology'
    : input.emergencyType === 'Pregnancy Emergency' ? 'Obstetrics'
    : input.emergencyType === 'Child Emergency' ? 'Pediatrics'
    : input.emergencyType === 'Burn Injury' ? 'Burns'
    : input.emergencyType === 'Accident' ? 'Trauma'
    : priority === 'critical' ? 'ICU'
    : 'Emergency';

  const summary =
    priority === 'critical'
      ? 'Reported symptoms suggest a potentially time-critical situation. Immediate emergency transport and hospital pre-alert recommended.'
      : priority === 'urgent'
      ? 'Reported symptoms require prompt medical attention. Emergency transport is recommended without delay.'
      : 'Reported symptoms currently appear lower urgency. Emergency transport can be arranged, or contact your doctor for guidance.';

  return {
    priority,
    score,
    summary,
    reasons,
    suggestedAmbulanceType: ambType as Ambulance['type'],
    suggestedDepartment: dept,
    disclaimer:
      'AI priority is only a decision-support feature and is not a medical diagnosis. Always follow the guidance of trained emergency professionals.',
  };
}

/* ------------------------------------------------------------------ */
/* Simulated live ambulance movement                                   */
/* ------------------------------------------------------------------ */

/** Interpolate a position along the demo route for progress 0..1. */
export function routePosition(progress: number) {
  const pts = demoRoute.waypoints;
  const clamped = Math.max(0, Math.min(1, progress));
  const total = pts.length - 1;
  const exact = clamped * total;
  const i = Math.min(total - 1, Math.floor(exact));
  const t = exact - i;
  const a = pts[i];
  const b = pts[i + 1];
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

/** Build an SVG path string for the full demo route. */
export const routePath = demoRoute.waypoints
  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
  .join(' ');

export function generateVitals(base: Partial<Vitals> = {}, critical = false): Vitals {
  const jitter = (n: number, spread: number) =>
    Math.round(n + (Math.random() - 0.5) * spread);
  return {
    heartRate: jitter(base.heartRate ?? (critical ? 122 : 82), critical ? 14 : 10),
    spo2: Math.min(100, jitter(base.spo2 ?? (critical ? 91 : 97), critical ? 5 : 3)),
    systolic: jitter(base.systolic ?? (critical ? 146 : 120), 12),
    diastolic: jitter(base.diastolic ?? (critical ? 92 : 78), 9),
    temperature: Number((base.temperature ?? 36.9 + (Math.random() - 0.5) / 5).toFixed(1)),
    respiratoryRate: jitter(base.respiratoryRate ?? (critical ? 25 : 17), critical ? 6 : 4),
    recordedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* AI assistant (fallback engine + configurable real API)              */
/* ------------------------------------------------------------------ */

const EMERGENCY_KEYWORDS = ['chest', 'breath', 'bleed', 'unconscious', 'accident', 'pain', 'burn', 'stroke', 'heart', 'seizure', 'collapse', 'faint', 'vomit', 'pregnan', 'baby', 'child', 'injur', 'fracture'];

export interface AiReply {
  text: string;
  urgent: boolean;
}

/**
 * Conversational fallback engine. If VITE_AI_API_URL + VITE_AI_API_KEY are
 * provided the app will call that endpoint first (see askAiAssistant).
 */
export function localAiReply(message: string, lang: 'en' | 'te' | 'hi' = 'en'): AiReply {
  const m = message.toLowerCase();
  const urgent = EMERGENCY_KEYWORDS.some((k) => m.includes(k));

  if (lang === 'te') {
    return urgent
      ? {
          urgent: true,
          text:
            'ఇది అత్యవసర పరిస్థితి కావచ్చు. దయచేసి వెంటనే అంబులెన్స్‌ను పిలవండి. శిక్షణ పొందిన అత్యవసర వైద్య సిబ్బంది సూచనలను పాటించండి.\n\n⚠️ ఇది వైద్య నిర్ధారణ కాదు.',
        }
      : {
          urgent: false,
          text:
            'మీ ప్రశ్నకు ధన్యవాదాలు. అత్యవసర పరిస్థితిలో ఉంటే వెంటనే SOS నొక్కండి. ఇది డెమో సహాయకుడు మాత్రమే.\n\n⚠️ ఇది వైద్య నిర్ధారణ కాదు.',
        };
  }
  if (lang === 'hi') {
    return urgent
      ? {
          urgent: true,
          text:
            'यह एक आपातकालीन स्थिति हो सकती है। कृपया तुरंत एम्बुलेंस बुलाएँ और प्रशिक्षित आपातकालीन कर्मियों के निर्देशों का पालन करें।\n\n⚠️ यह चिकित्सीय निदान नहीं है।',
        }
      : {
          urgent: false,
          text:
            'आपके प्रश्न के लिए धन्यवाद। आपात स्थिति में तुरंत SOS दबाएँ। यह केवल एक डेमो सहायक है।\n\n⚠️ यह चिकित्सीय निदान नहीं है।',
        };
  }

  if (urgent) {
    return {
      urgent: true,
      text:
        'This may require urgent medical attention. Please request emergency medical services immediately and follow instructions from trained emergency professionals.\n\n' +
        'Please tap 🚑 REQUEST AMBULANCE now, and share your exact location with the dispatcher.\n\n' +
        '⚠️ I am an AI assistant for decision support only. I do not diagnose diseases and this is not a medical diagnosis. In a life-threatening emergency, contact your local emergency number immediately.',
    };
  }

  if (/ambulance|book|transport/.test(m)) {
    return {
      urgent: false,
      text:
        'You can book an ambulance from the 🚑 Book Ambulance page. Choose your location and ambulance type, review the ETA and equipment list, then press BOOK NOW.\n\n⚠️ Demo assistant — decision support only, not a medical diagnosis.',
    };
  }
  if (/hospital|icu|bed/.test(m)) {
    return {
      urgent: false,
      text:
        'Use the 🏥 Find Hospital page to compare nearby hospitals by distance, emergency department, ICU availability and specialisation. Press SELECT HOSPITAL to set your destination.\n\n⚠️ Demo assistant — decision support only, not a medical diagnosis.',
    };
  }
  if (/track|where|eta|how long/.test(m)) {
    return {
      urgent: false,
      text:
        'Open the 📍 Track Ambulance page to see live location, distance, ETA and the full status timeline of your trip.\n\n⚠️ Demo assistant — decision support only, not a medical diagnosis.',
    };
  }
  if (/contact|call/.test(m)) {
    return {
      urgent: false,
      text:
        'Your emergency contacts are listed on the 📞 Emergency Contacts page. You can also call the assigned driver directly from the tracking page.\n\n⚠️ Demo assistant — decision support only, not a medical diagnosis.',
    };
  }
  return {
    urgent: false,
    text:
      'I can help you request an ambulance, find a hospital, track an active ambulance or manage emergency contacts.\n\nDescribe what is happening (for example: "my father has difficulty breathing") and I will suggest the next step.\n\n⚠️ I am a demo AI assistant. I do not diagnose diseases. In a life-threatening emergency, contact your local emergency medical service immediately.',
  };
}

/**
 * Ask the assistant. Uses a configured external API when available,
 * otherwise falls back to the local rule engine (so the demo always works).
 */
export async function askAiAssistant(
  message: string,
  history: AiMessage[],
  lang: 'en' | 'te' | 'hi' = 'en',
): Promise<AiReply> {
  const apiUrl = import.meta.env?.VITE_AI_API_URL;
  const apiKey = import.meta.env?.VITE_AI_API_KEY;

  if (apiUrl && apiKey) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          language: lang,
          messages: [...history.map((h) => ({ role: h.role === 'ai' ? 'assistant' : 'user', content: h.text })), { role: 'user', content: message }],
          system:
            'You are an emergency medical dispatch decision-support assistant. Never diagnose. Always advise contacting emergency services for urgent symptoms. Keep answers short and actionable.',
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { reply?: string; text?: string };
        const text = data.reply || data.text;
        if (text) return { text, urgent: EMERGENCY_KEYWORDS.some((k) => message.toLowerCase().includes(k)) };
      }
    } catch {
      /* fall through to local engine */
    }
  }

  await wait(650 + Math.random() * 550);
  return localAiReply(message, lang);
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export async function apiLogin(email: string, password: string): Promise<ActionResult<User>> {
  await wait(520);
  const user = seedUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return { ok: false, message: 'No account found with that email address.' };
  if (user.password !== password) return { ok: false, message: 'Incorrect password. Please try again.' };
  return { ok: true, message: `Welcome back, ${user.name}!`, data: user };
}

export async function apiRegister(input: {
  name: string; email: string; phone: string; password: string; role: Role;
}): Promise<ActionResult<User>> {
  await wait(650);
  if (seedUsers.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
    return { ok: false, message: 'An account with this email already exists.' };
  }
  const user: User = {
    id: `USR-${Date.now().toString().slice(-5)}`,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    role: input.role,
    password: input.password,
    createdAt: new Date().toISOString(),
  };
  seedUsers.push(user);
  return { ok: true, message: 'Registration successful. Please sign in.', data: user };
}

/* ------------------------------------------------------------------ */
/* Emergency request lifecycle                                         */
/* ------------------------------------------------------------------ */

let requestCounter = 2100;
let notifCounter = 2100;

export function createRequestId() {
  return `EMR-${++requestCounter}`;
}

export function makeNotification(
  type: AppNotification['type'],
  title: string,
  message: string,
  audience: AppNotification['audience'],
  link?: string,
): AppNotification {
  return {
    id: `NTF-${++notifCounter}`,
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    audience,
    link,
  };
}

/**
 * Dispatch: choose the best available ambulance for a request, considering
 * required type, equipment and distance. Mirrors a real dispatch heuristic.
 */
export function dispatchAmbulance(
  list: Ambulance[],
  priority: Priority,
  preferredType?: Ambulance['type'],
): Ambulance | null {
  const available = list.filter((a) => a.status === 'Available');
  if (!available.length) return null;

  const scored = available.map((a) => {
    let score = 100 - a.distanceKm * 6;
    if (preferredType && a.type === preferredType) score += 45;
    if (priority === 'critical') {
      if (a.type === 'ICU Ambulance' || a.type === 'Advanced Life Support') score += 25;
      if (a.equipment.some((e) => e.name === 'Ventilator')) score += 10;
      if (a.equipment.some((e) => e.name === 'Defibrillator')) score += 8;
    }
    if (priority === 'urgent' && a.type === 'Advanced Life Support') score += 12;
    score += a.etaMinutes ? Math.max(0, 20 - a.etaMinutes) : 0;
    return { a, score };
  });

  scored.sort((x, y) => y.score - x.score);
  return scored[0].a;
}

export function nextStage(status: RequestStatus): RequestStatus | null {
  const idx = TRIP_STAGES.indexOf(status);
  if (idx < 0 || idx >= TRIP_STAGES.length - 1) return null;
  return TRIP_STAGES[idx + 1];
}

/* ------------------------------------------------------------------ */
/* Aggregate helpers used by dashboards                                */
/* ------------------------------------------------------------------ */

export function hospitalById(list: Hospital[], id: string | null) {
  return list.find((h) => h.id === id) ?? null;
}

export function ambulanceById(list: Ambulance[], id: string | null) {
  return list.find((a) => a.id === id) ?? null;
}

export function requestById(list: EmergencyRequest[], id: string | null) {
  return list.find((r) => r.id === id) ?? null;
}

export function toCompletedTrip(req: EmergencyRequest, ambulanceName: string, hospitalName: string): CompletedTrip {
  return {
    id: `TRP-${Date.now().toString().slice(-5)}`,
    requestId: req.id,
    date: req.completedAt || new Date().toISOString(),
    patientName: req.patientName,
    emergencyType: req.emergencyType,
    ambulanceId: req.ambulanceId || 'UNASSIGNED',
    driverName: ambulanceName,
    hospitalName,
    responseTimeMinutes: req.responseTimeMinutes || 8,
    tripDurationMinutes: 22,
    status: 'Completed',
    distanceKm: 6.4,
    rating: 5,
  };
}

export { seedAmbulances, seedTrips, seedContacts, seedRequests, seedHospitals, seedDrivers, seedPatients, seedUsers, seedNotifications };