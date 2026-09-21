/**
 * LifeRescue AI — Application state store
 * ------------------------------------------------------------------
 * A React Context store that holds the full demo domain state and exposes
 * every workflow action (SOS → dispatch → tracking → hospital → handover).
 * State is persisted to localStorage so refreshes keep the demo coherent.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ambulances as seedAmbulances,
  completedTrips as seedTrips,
  drivers as seedDrivers,
  emergencyContacts as seedContacts,
  emergencyRequests as seedRequests,
  hospitals as seedHospitals,
  notifications as seedNotifications,
  patients as seedPatients,
  users as seedUsers,
} from '../data/demoData';
import {
  ambulanceById,
  createRequestId,
  dispatchAmbulance,
  hospitalById,
  makeNotification,
  nextStage,
  toCompletedTrip,
  generateVitals,
} from '../api/mockApi';
import type {
  Ambulance,
  AppNotification,
  CompletedTrip,
  Driver,
  EmergencyContact,
  EmergencyRequest,
  EmergencyType,
  Hospital,
  Patient,
  Priority,
  RequestStatus,
  Role,
  Settings,
  User,
} from '../types';

/* ------------------------------------------------------------------ */
/* Toast types                                                         */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

/* ------------------------------------------------------------------ */
/* Context shape                                                       */
/* ------------------------------------------------------------------ */

export interface NewRequestBody {
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
  vitals?: EmergencyRequest['vitals'];
  preferredAmbulanceType?: Ambulance['type'];
}

interface Ctx {
  /* Data */
  ambulances: Ambulance[];
  drivers: Driver[];
  hospitals: Hospital[];
  patients: Patient[];
  requests: EmergencyRequest[];
  trips: CompletedTrip[];
  notifications: AppNotification[];
  contacts: EmergencyContact[];
  users: User[];

  /* Session */
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  register: (u: Omit<User, 'id' | 'createdAt'>) => boolean;
  logout: () => void;

  /* Settings */
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;

  /* Toasts */
  toasts: Toast[];
  toast: (variant: Toast['variant'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;

  /* Workflow */
  activeRequest: EmergencyRequest | null;
  createEmergencyRequest: (body: NewRequestBody) => EmergencyRequest;
  assignAmbulance: (requestId: string, ambulanceId: string) => void;
  setDestinationHospital: (requestId: string, hospitalId: string) => void;
  advanceRequest: (requestId: string) => RequestStatus | null;
  cancelRequest: (requestId: string, reason?: string) => void;
  completeHandover: (requestId: string) => void;

  /* Ambulance CRUD */
  addAmbulance: (a: Omit<Ambulance, 'routeProgress'>) => void;
  updateAmbulance: (id: string, patch: Partial<Ambulance>) => void;
  deleteAmbulance: (id: string) => void;

  /* Driver CRUD */
  addDriver: (d: Omit<Driver, 'id' | 'joinedAt'>) => void;
  updateDriver: (id: string, patch: Partial<Driver>) => void;

  /* Hospital CRUD */
  addHospital: (h: Omit<Hospital, 'id'>) => void;
  updateHospital: (id: string, patch: Partial<Hospital>) => void;

  /* Notifications */
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;

  /* Contacts */
  addContact: (c: Omit<EmergencyContact, 'id'>) => void;
  updateContact: (id: string, patch: Partial<EmergencyContact>) => void;
  deleteContact: (id: string) => void;

  /* Simulation */
  simulationOn: boolean;
  setSimulationOn: (v: boolean) => void;
}

const AppContext = createContext<Ctx | null>(null);

const STORAGE_KEY = 'liferescue-ai-state-v1';

const defaultSettings: Settings = {
  language: 'en',
  darkMode: false,
  notifications: true,
  locationPermission: true,
  shareData: true,
  soundAlerts: false,
  autoCallEmergencyContact: false,
};

interface Persisted {
  currentUser?: User | null;
  settings?: Settings;
  ambulanceStatus?: Record<string, Ambulance['status']>;
  contacts?: EmergencyContact[];
  notificationRead?: Record<string, boolean>;
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : {};
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = useMemo(loadPersisted, []);

  const [ambulances, setAmbulances] = useState<Ambulance[]>(() => seedAmbulances.map((a) => ({ ...a })));
  const [drivers, setDrivers] = useState<Driver[]>(() => seedDrivers.map((d) => ({ ...d })));
  const [hospitals, setHospitals] = useState<Hospital[]>(() => seedHospitals.map((h) => ({ ...h })));
  const [patients] = useState<Patient[]>(() => seedPatients.map((p) => ({ ...p })));
  const [requests, setRequests] = useState<EmergencyRequest[]>(() => seedRequests.map((r) => ({ ...r })));
  const [trips, setTrips] = useState<CompletedTrip[]>(() => seedTrips.map((t) => ({ ...t })));
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => persisted.contacts ?? seedContacts.map((c) => ({ ...c })));
  const [users, setUsers] = useState<User[]>(() => seedUsers.map((u) => ({ ...u })));
  const [currentUser, setCurrentUser] = useState<User | null>(persisted.currentUser ?? null);
  const [settings, setSettings] = useState<Settings>(() => ({ ...defaultSettings, ...persisted.settings }));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [simulationOn, setSimulationOn] = useState(true);
  const [notificationRead, setNotificationRead] = useState<Record<string, boolean>>(() => persisted.notificationRead ?? {});

  const notifications = useMemo<AppNotification[]>(
    () => seedNotifications.map((n) => ({ ...n, read: notificationRead[n.id] ?? n.read })),
    [notificationRead],
  );

  /* ---------------- persistence ---------------- */
  useEffect(() => {
    const data: Persisted = {
      currentUser,
      settings,
      contacts,
      notificationRead,
      ambulanceStatus: ambulances.reduce<Record<string, Ambulance['status']>>((acc, a) => {
        acc[a.id] = a.status;
        return acc;
      }, {}),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage may be unavailable; demo continues in-memory */
    }
  }, [currentUser, settings, contacts, notificationRead, ambulances]);

  /* ---------------- theme ---------------- */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
  }, [settings.darkMode]);

  /* ---------------- toasts ---------------- */
  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (variant: Toast['variant'], title: string, message?: string) => {
      const id = `T-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, variant, title, message }]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4800);
    },
    [],
  );

  const pushNotification = useCallback(
    (n: AppNotification) => {
      setNotificationRead((prev) => ({ ...prev, [n.id]: false }));
    },
    [],
  );

  /* ---------------- auth ---------------- */
  const login = useCallback(
    (email: string, password: string) => {
      const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || user.password !== password) return false;
      setCurrentUser(user);
      toast('success', `Welcome, ${user.name}`, `Signed in as ${user.role}.`);
      return true;
    },
    [users, toast],
  );

  const register = useCallback(
    (u: Omit<User, 'id' | 'createdAt'>) => {
      if (users.some((x) => x.email.toLowerCase() === u.email.toLowerCase())) return false;
      const user: User = { ...u, id: `USR-${Date.now().toString().slice(-5)}`, createdAt: new Date().toISOString() };
      setUsers((prev) => [...prev, user]);
      return true;
    },
    [users],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    toast('info', 'Signed out', 'You have been safely signed out.');
  }, [toast]);

  /* ---------------- settings ---------------- */
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  /* ---------------- workflow ---------------- */
  const activeRequest = useMemo(() => {
    if (!currentUser) return requests.find((r) => r.id === 'EMR-2056') ?? null;
    if (currentUser.role === 'patient') {
      return (
        requests.find((r) => r.patientName === currentUser.name && !['Completed', 'Cancelled'].includes(r.status)) ??
        null
      );
    }
    return requests.find((r) => !['Completed', 'Cancelled'].includes(r.status)) ?? null;
  }, [requests, currentUser]);

  const createEmergencyRequest = useCallback(
    (body: NewRequestBody): EmergencyRequest => {
      const id = createRequestId();
      const now = new Date().toISOString();
      const auto = dispatchAmbulance(ambulances, body.priority, body.preferredAmbulanceType);
      const autoHospital = hospitals.find((h) => h.emergencyDept && (body.priority !== 'critical' || h.icuAvailable)) ?? hospitals[0];

      const request: EmergencyRequest = {
        id,
        patientId: currentUser?.role === 'patient' ? 'PAT-001' : null,
        patientName: body.patientName,
        patientAge: body.patientAge,
        phone: body.phone,
        location: body.location,
        emergencyType: body.emergencyType,
        symptoms: body.symptoms,
        isAccident: body.isAccident,
        isConscious: body.isConscious,
        breathingDifficulty: body.breathingDifficulty,
        severeBleeding: body.severeBleeding,
        emergencyContact: body.emergencyContact,
        priority: body.priority,
        aiSummary: body.aiSummary,
        status: auto ? 'Assigned' : 'Requested',
        ambulanceId: auto ? auto.id : null,
        hospitalId: autoHospital ? autoHospital.id : null,
        createdAt: now,
        responseTimeMinutes: auto ? auto.etaMinutes : undefined,
        timeline: [{ status: 'Requested', at: now }],
        vitals: body.vitals ?? generateVitals({}, body.priority === 'critical'),
      };
      if (auto) request.timeline.push({ status: 'Assigned', at: now });

      setRequests((prev) => [request, ...prev]);

      if (auto) {
        setAmbulances((prev) => prev.map((a) => (a.id === auto.id ? { ...a, status: 'Busy', routeProgress: 0 } : a)));
      }

      pushNotification(
        makeNotification('emergency', `🚨 Emergency ${id} created`, `${body.patientName} • ${body.emergencyType} • Priority ${body.priority.toUpperCase()}`, 'admin', '/admin'),
      );
      if (auto) {
        pushNotification(
          makeNotification('ambulance', '🚑 Ambulance assigned', `${auto.id} (${auto.driverName}) assigned to ${id}. ETA ${auto.etaMinutes} min.`, 'patient', '/track'),
        );
      }
      if (autoHospital) {
        pushNotification(
          makeNotification('hospital', '🏥 Hospital pre-alert sent', `${autoHospital.name} notified for ${id}. Required department: Emergency.`, 'hospital', '/hospital'),
        );
      }
      toast('success', `Emergency ${id} created`, auto ? `Ambulance ${auto.id} assigned • ETA ${auto.etaMinutes} min` : 'Awaiting ambulance assignment');
      return request;
    },
    [ambulances, hospitals, currentUser, pushNotification, toast],
  );

  const assignAmbulance = useCallback(
    (requestId: string, ambulanceId: string) => {
      const amb = ambulanceById(ambulances, ambulanceId);
      if (!amb) return;
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                ambulanceId,
                status: 'Assigned',
                responseTimeMinutes: amb.etaMinutes,
                timeline: [...r.timeline, { status: 'Assigned' as RequestStatus, at: new Date().toISOString() }],
              }
            : r,
        ),
      );
      setAmbulances((prev) => prev.map((a) => (a.id === ambulanceId ? { ...a, status: 'Busy', routeProgress: 0 } : a)));
      pushNotification(makeNotification('ambulance', '🚑 Ambulance assigned', `${amb.id} (${amb.driverName}) assigned to ${requestId}.`, 'patient', '/track'));
      toast('success', `Ambulance ${amb.id} assigned`, `Driver ${amb.driverName} • ETA ${amb.etaMinutes} min`);
    },
    [ambulances, pushNotification, toast],
  );

  const setDestinationHospital = useCallback(
    (requestId: string, hospitalId: string) => {
      const hsp = hospitalById(hospitals, hospitalId);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, hospitalId } : r)));
      if (hsp) {
        pushNotification(makeNotification('hospital', '🏥 Destination hospital selected', `${hsp.name} set as destination for ${requestId}.`, 'patient', '/track'));
        toast('success', 'Hospital selected', `${hsp.name} will receive the patient.`);
      }
    },
    [hospitals, pushNotification, toast],
  );

  const advanceRequest = useCallback(
    (requestId: string) => {
      let advanced: RequestStatus | null = null;
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          const nxt = nextStage(r.status);
          if (!nxt) return r;
          advanced = nxt;
          const isComplete = nxt === 'Completed';
          return {
            ...r,
            status: nxt,
            completedAt: isComplete ? new Date().toISOString() : r.completedAt,
            timeline: [...r.timeline, { status: nxt, at: new Date().toISOString() }],
          };
        }),
      );

      if (advanced === 'On The Way') {
        pushNotification(makeNotification('ambulance', '📍 Ambulance on the way', `Ambulance is en route for ${requestId}.`, 'patient', '/track'));
      } else if (advanced === 'Going To Hospital') {
        pushNotification(makeNotification('hospital', '🚨 Emergency patient incoming', `Patient from ${requestId} is en route to your facility.`, 'hospital', '/hospital'));
      } else if (advanced === 'Handover Complete') {
        pushNotification(makeNotification('success', '✓ Patient handover complete', `Handover for ${requestId} completed at the hospital.`, 'hospital', '/hospital'));
      } else if (advanced === 'Completed') {
        const req = requests.find((r) => r.id === requestId);
        if (req) {
          const amb = ambulanceById(ambulances, req.ambulanceId);
          const hsp = hospitalById(hospitals, req.hospitalId);
          setTrips((prev) => [toCompletedTrip(req, amb?.driverName ?? 'Driver', hsp?.name ?? 'Hospital'), ...prev]);
        }
        setAmbulances((prev) =>
          prev.map((a) => (a.id === requests.find((r) => r.id === requestId)?.ambulanceId ? { ...a, status: 'Available', routeProgress: 0 } : a)),
        );
        pushNotification(makeNotification('success', '✓ Trip completed', `${requestId} has been completed and added to history.`, 'patient', '/history'));
      }

      if (advanced) toast('info', 'Status updated', `Trip ${requestId} → ${advanced}`);
      return advanced;
    },
    [requests, ambulances, hospitals, pushNotification, toast],
  );

  const cancelRequest = useCallback(
    (requestId: string, reason = 'Cancelled by user') => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: 'Cancelled', notes: reason, timeline: [...r.timeline, { status: 'Cancelled' as RequestStatus, at: new Date().toISOString() }] }
            : r,
        ),
      );
      const req = requests.find((r) => r.id === requestId);
      if (req?.ambulanceId) {
        setAmbulances((prev) => prev.map((a) => (a.id === req.ambulanceId ? { ...a, status: 'Available', routeProgress: 0 } : a)));
      }
      toast('warning', `Emergency ${requestId} cancelled`, reason);
    },
    [requests, toast],
  );

  const completeHandover = useCallback(
    (requestId: string) => {
      const stages: RequestStatus[] = ['Arrived At Hospital', 'Handover Complete', 'Completed'];
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          const now = new Date().toISOString();
          return {
            ...r,
            status: 'Completed',
            completedAt: now,
            timeline: [
              ...r.timeline,
              { status: 'Arrived At Hospital', at: now },
              { status: 'Handover Complete', at: now },
              { status: 'Completed', at: now },
            ],
          };
        }),
      );
      const req = requests.find((r) => r.id === requestId);
      if (req) {
        const amb = ambulanceById(ambulances, req.ambulanceId);
        const hsp = hospitalById(hospitals, req.hospitalId);
        setTrips((prev) => [toCompletedTrip({ ...req, status: 'Completed' }, amb?.driverName ?? 'Driver', hsp?.name ?? 'Hospital'), ...prev]);
      }
      setAmbulances((prev) => prev.map((a) => (a.id === req?.ambulanceId ? { ...a, status: 'Available', routeProgress: 0 } : a)));
      toast('success', 'Patient handed over', `${requestId} marked complete.`);
      void stages;
    },
    [requests, ambulances, hospitals, toast],
  );

  /* ---------------- ambulance CRUD ---------------- */
  const addAmbulance = useCallback(
    (a: Omit<Ambulance, 'routeProgress'>) => {
      setAmbulances((prev) => [...prev, { ...a, routeProgress: 0 }]);
      toast('success', 'Ambulance added', `${a.id} (${a.type}) added to the fleet.`);
    },
    [toast],
  );

  const updateAmbulance = useCallback(
    (id: string, patch: Partial<Ambulance>) => {
      setAmbulances((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
      toast('success', 'Ambulance updated', `${id} details saved.`);
    },
    [toast],
  );

  const deleteAmbulance = useCallback(
    (id: string) => {
      setAmbulances((prev) => prev.filter((a) => a.id !== id));
      toast('warning', 'Ambulance removed', `${id} deleted from the fleet.`);
    },
    [toast],
  );

  /* ---------------- driver CRUD ---------------- */
  const addDriver = useCallback(
    (d: Omit<Driver, 'id' | 'joinedAt'>) => {
      setDrivers((prev) => [...prev, { ...d, id: `DRV-${Date.now().toString().slice(-4)}`, joinedAt: new Date().toISOString() }]);
      toast('success', 'Driver added', `${d.name} added to the roster.`);
    },
    [toast],
  );

  const updateDriver = useCallback(
    (id: string, patch: Partial<Driver>) => {
      setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
      toast('success', 'Driver updated', `${id} profile saved.`);
    },
    [toast],
  );

  /* ---------------- hospital CRUD ---------------- */
  const addHospital = useCallback(
    (h: Omit<Hospital, 'id'>) => {
      setHospitals((prev) => [...prev, { ...h, id: `HSP-${String(prev.length + 1).padStart(2, '0')}` }]);
      toast('success', 'Hospital added', `${h.name} registered in the network.`);
    },
    [toast],
  );

  const updateHospital = useCallback(
    (id: string, patch: Partial<Hospital>) => {
      setHospitals((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
      toast('success', 'Hospital updated', `${id} details saved.`);
    },
    [toast],
  );

  /* ---------------- notifications ---------------- */
  const markNotificationRead = useCallback((id: string) => {
    setNotificationRead((prev) => ({ ...prev, [id]: true }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotificationRead((prev) => {
      const next = { ...prev };
      seedNotifications.forEach((n) => { next[n.id] = true; });
      return next;
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotificationRead((prev) => ({ ...prev, [id]: true }));
  }, []);

  /* ---------------- contacts ---------------- */
  const addContact = useCallback(
    (c: Omit<EmergencyContact, 'id'>) => {
      setContacts((prev) => [...prev, { ...c, id: `EC-${Date.now().toString().slice(-4)}` }]);
      toast('success', 'Contact added', `${c.name} saved to emergency contacts.`);
    },
    [toast],
  );

  const updateContact = useCallback(
    (id: string, patch: Partial<EmergencyContact>) => {
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      toast('success', 'Contact updated', 'Emergency contact saved.');
    },
    [toast],
  );

  const deleteContact = useCallback(
    (id: string) => {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast('warning', 'Contact removed', 'Emergency contact deleted.');
    },
    [toast],
  );

  /* ---------------- live simulation ---------------- */
  const ambulanceRef = useRef(ambulances);
  ambulanceRef.current = ambulances;

  useEffect(() => {
    if (!simulationOn) return;
    const interval = setInterval(() => {
      setAmbulances((prev) => {
        let changed = false;
        const next = prev.map((a) => {
          if (a.status !== 'Busy' || a.routeProgress >= 1) return a;
          changed = true;
          const progress = Math.min(1, a.routeProgress + 0.012);
          const distance = Math.max(0.1, Number((a.distanceKm * (1 - progress)).toFixed(1)));
          const eta = Math.max(1, Math.ceil(a.etaMinutes * (1 - progress)));
          return { ...a, routeProgress: progress, distanceKm: distance, etaMinutes: eta };
        });
        return changed ? next : prev;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [simulationOn]);

  const value: Ctx = {
    ambulances, drivers, hospitals, patients, requests, trips, notifications, contacts, users,
    currentUser, login, register, logout,
    settings, updateSettings,
    toasts, toast, dismissToast,
    activeRequest, createEmergencyRequest, assignAmbulance, setDestinationHospital,
    advanceRequest, cancelRequest, completeHandover,
    addAmbulance, updateAmbulance, deleteAmbulance,
    addDriver, updateDriver,
    addHospital, updateHospital,
    markNotificationRead, markAllNotificationsRead, deleteNotification,
    addContact, updateContact, deleteContact,
    simulationOn, setSimulationOn,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export type { Role };