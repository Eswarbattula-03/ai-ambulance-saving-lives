/**
 * LifeRescue AI — Application shell, routing and pages.
 * ------------------------------------------------------------------
 * This is the single entry component for the demo SPA. It wires the
 * reusable UI kit (src/components/ui.tsx) to the domain store
 * (src/store/AppStore.tsx), the mock API (src/api/mockApi.ts) and the
 * demo data set (src/data/demoData.ts).
 *
 * DEMO ONLY — all patients, trips, vitals and locations are fictional.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useApp } from './store/AppStore';
import {
  BarChart,
  Counter,
  DataTable,
  DemoNotice,
  DonutChart,
  EmptyState,
  Field,
  HBarChart,
  LiveBadge,
  MapView,
  Modal,
  PriorityBadge,
  SectionHead,
  Select,
  StatCard,
  StatusBadge,
  Stepper,
  Tabs,
  TextArea,
  TextInput,
  Timeline,
  ToastHost,
  Toggle,
} from './components/ui';
import {
  analytics,
  ambulanceTypes,
  emergencyTypes,
  equipmentCatalogue,
  locations,
} from './data/demoData';
import { formatDate, timeAgo, triage } from './api/mockApi';
import { TRIP_STAGES } from './types';
import type { AmbulanceType, EmergencyType, Priority, Role } from './types';

/* ------------------------------------------------------------------ */
/* Navigation model                                                    */
/* ------------------------------------------------------------------ */

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles: Role[] | 'all';
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: '🏠', roles: 'all' },
  { to: '/book', label: 'Book Ambulance', icon: '🚑', roles: 'all' },
  { to: '/track', label: 'Track', icon: '📍', roles: 'all' },
  { to: '/hospitals', label: 'Hospitals', icon: '🏥', roles: 'all' },
  { to: '/history', label: 'History', icon: '🧾', roles: 'all' },
  { to: '/contacts', label: 'Contacts', icon: '📞', roles: 'all' },
  { to: '/driver', label: 'Driver', icon: '🧑‍✈️', roles: ['driver'] },
  { to: '/hospital', label: 'Hospital', icon: '🏥', roles: ['hospital'] },
  { to: '/admin', label: 'Admin', icon: '🛡️', roles: ['admin'] },
];

function visibleNav(role: Role | undefined): NavItem[] {
  return NAV_ITEMS.filter((n) => n.roles === 'all' || (role ? n.roles.includes(role) : false));
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */

function Navbar() {
  const {
    currentUser,
    logout,
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    settings,
    updateSettings,
    activeRequest,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState<'none' | 'notif' | 'user' | 'mobile'>('none');

  useEffect(() => {
    setMenu('none');
  }, [location.pathname]);

  const links = useMemo(() => visibleNav(currentUser?.role), [currentUser]);
  const unread = notifications.filter((n) => !n.read).length;
  const liveTrip = activeRequest && !['Completed', 'Cancelled'].includes(activeRequest.status);

  return (
    <header className="navbar no-print">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-logo">🚑</span>
          <span>
            LifeRescue AI
            <span className="brand-sub">Emergency Response</span>
          </span>
        </NavLink>

        <nav className="nav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {liveTrip && <span className="hide-sm"><LiveBadge>LIVE TRIP</LiveBadge></span>}

          <button
            className="icon-btn"
            title="Toggle dark mode"
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
          >
            {settings.darkMode ? '☀️' : '🌙'}
          </button>

          <div className="menu-wrap">
            <button
              className="icon-btn"
              title="Notifications"
              onClick={() => setMenu(menu === 'notif' ? 'none' : 'notif')}
            >
              🔔
              {unread > 0 && <span className="count-dot">{unread}</span>}
            </button>
            {menu === 'notif' && (
              <div className="menu menu-wide">
                <div className="row between" style={{ padding: '4px 8px' }}>
                  <span className="menu-label">Notifications</span>
                  <button className="btn btn-xs btn-ghost" onClick={markAllNotificationsRead}>
                    Mark all read
                  </button>
                </div>
                {notifications.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    className="menu-item"
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.link) navigate(n.link);
                    }}
                  >
                    <span className="mi-icon">{n.read ? '○' : '●'}</span>
                    <span className="flex-1">
                      <span style={{ display: 'block', fontWeight: 700 }}>{n.title}</span>
                      <span className="tiny dim">{n.message}</span>
                      <span className="tiny dim" style={{ display: 'block' }}>{timeAgo(n.createdAt)}</span>
                    </span>
                  </button>
                ))}
                {notifications.length === 0 && <div className="empty"><p>No notifications.</p></div>}
              </div>
            )}
          </div>

          <div className="menu-wrap hide-sm">
            <button
              className="icon-btn"
              title="Account"
              onClick={() => setMenu(menu === 'user' ? 'none' : 'user')}
            >
              👤
            </button>
            {menu === 'user' && (
              <div className="menu">
                {currentUser ? (
                  <>
                    <div className="menu-label">{currentUser.role}</div>
                    <div style={{ padding: '0 11px 8px' }}>
                      <strong>{currentUser.name}</strong>
                      <div className="tiny dim">{currentUser.email}</div>
                    </div>
                    <div className="menu-sep" />
                    <button className="menu-item" onClick={() => navigate('/settings')}>
                      <span className="mi-icon">⚙️</span> Settings
                    </button>
                    <button className="menu-item danger" onClick={logout}>
                      <span className="mi-icon">🚪</span> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <button className="menu-item" onClick={() => navigate('/login')}>
                      <span className="mi-icon">🔑</span> Sign in
                    </button>
                    <button className="menu-item" onClick={() => navigate('/register')}>
                      <span className="mi-icon">📝</span> Create account
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            className="icon-btn hamburger"
            title="Menu"
            onClick={() => setMenu(menu === 'mobile' ? 'none' : 'mobile')}
          >
            ☰
          </button>
        </div>
      </div>

      {menu === 'mobile' && (
        <div className="mobile-drawer">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="mi-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
          <div className="menu-sep" />
          {currentUser ? (
            <>
              <NavLink to="/settings" className="mobile-nav-link">
                <span className="mi-icon">⚙️</span> Settings
              </NavLink>
              <button className="mobile-nav-link" onClick={logout}>
                <span className="mi-icon">🚪</span> Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="mobile-nav-link">
                <span className="mi-icon">🔑</span> Sign in
              </NavLink>
              <NavLink to="/register" className="mobile-nav-link">
                <span className="mi-icon">📝</span> Create account
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Footer + mobile action bar                                          */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="site-footer no-print">
      <div className="container">
        <div className="footer-cols">
          <div className="footer-col">
            <div className="brand" style={{ marginBottom: 10 }}>
              <span className="brand-logo">🚑</span>
              <span>LifeRescue AI</span>
            </div>
            <p className="small">
              AI-powered ambulance transport and life-saving decision support — an educational
              college demo project. All data is simulated and fictional.
            </p>
          </div>
          <div className="footer-col">
            <h4>Emergency</h4>
            <NavLink className="footer-link" to="/book">Book Ambulance</NavLink>
            <NavLink className="footer-link" to="/track">Track Ambulance</NavLink>
            <NavLink className="footer-link" to="/hospitals">Find Hospital</NavLink>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <NavLink className="footer-link" to="/history">Trip History</NavLink>
            <NavLink className="footer-link" to="/contacts">Emergency Contacts</NavLink>
            <NavLink className="footer-link" to="/settings">Settings</NavLink>
          </div>
          <div className="footer-col">
            <h4>Demo</h4>
            <NavLink className="footer-link" to="/login">Sign in</NavLink>
            <NavLink className="footer-link" to="/register">Register</NavLink>
            <NavLink className="footer-link" to="/admin">Admin Console</NavLink>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} LifeRescue AI — Educational Demo</span>
          <span>Not for real medical use. In an emergency, call your local emergency number.</span>
        </div>
      </div>
    </footer>
  );
}

function MobileActionBar() {
  const navigate = useNavigate();
  return (
    <div className="mobile-action-bar no-print">
      <button className="btn btn-sos flex-1" onClick={() => navigate('/book')}>🆘 SOS</button>
      <button className="btn btn-outline flex-1" onClick={() => navigate('/track')}>📍 Track</button>
      <button className="btn btn-outline flex-1" onClick={() => navigate('/hospitals')}>🏥 Hospitals</button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */

function Home() {
  const { ambulances, hospitals, requests, trips } = useApp();
  const navigate = useNavigate();
  const available = ambulances.filter((a) => a.status === 'Available').length;

  const features = [
    { icon: '🧠', title: 'AI Priority Triage', text: 'Transparent, rule-based scoring that suggests an urgency level, ambulance type and hospital department — decision support only.' },
    { icon: '📍', title: 'Live Tracking', text: 'Follow the ambulance along the route with distance, ETA and a stage-by-stage status timeline.' },
    { icon: '🏥', title: 'Hospital Pre-Alert', text: 'Hospitals are notified in advance with the emergency type, priority and required department.' },
    { icon: '🚑', title: 'Smart Dispatch', text: 'The nearest suitable ambulance is selected based on type, equipment and distance.' },
    { icon: '📞', title: 'Emergency Contacts', text: 'Store and manage the people who should be notified during an emergency.' },
    { icon: '🧾', title: 'Trip History', text: 'Every completed trip is recorded with response time, distance and hospital.' },
  ];

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="hero-eyebrow">🚑 AI-Powered Emergency Response</span>
            <h1>Every second counts. Get help in minutes.</h1>
            <p className="hero-lede">
              LifeRescue AI connects patients, drivers, ambulances and hospitals on one intelligent
              platform — with AI-assisted priority triage, smart dispatch and live tracking.
            </p>
            <div className="hero-cta">
              <button className="btn btn-sos btn-lg" onClick={() => navigate('/book')}>
                🆘 REQUEST AMBULANCE
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/hospitals')}>
                🏥 Find Hospital
              </button>
            </div>
            <DemoNotice />
          </div>

          <div className="card card-pad-lg">
            <div className="row between mb-4">
              <strong>Network status</strong>
              <LiveBadge>SIMULATED</LiveBadge>
            </div>
            <div className="grid grid-2">
              <StatCard icon="🚑" value={<Counter to={available} />} label="Ambulances ready" tone="stable" />
              <StatCard icon="🏥" value={<Counter to={hospitals.length} />} label="Hospitals" tone="info" />
              <StatCard icon="🧾" value={<Counter to={requests.length} />} label="Requests" tone="urgent" />
              <StatCard icon="✅" value={<Counter to={trips.length} />} label="Completed trips" tone="brand" />
            </div>
            <div className="info-banner" style={{ marginTop: 'var(--space-4)' }}>
              <span>⚠️</span>
              <div>
                This is a demonstration. In a real emergency, always contact your local emergency
                services immediately.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container section">
        <SectionHead
          eyebrow="Platform"
          title="One platform, the whole emergency chain"
          sub="From the moment of the SOS to hospital handover, every step is coordinated and visible."
        />
        <div className="grid grid-3">
          {features.map((f) => (
            <div className="card card-pad" key={f.title}>
              <div className="icon-circle" style={{ marginBottom: 12 }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="small">{f.text}</p>
            </div>
          ))}
        </div>
        <div className="text-center" style={{ marginTop: 'var(--space-8)' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/book')}>
            Get started — Book an ambulance
          </button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Book ambulance                                                      */
/* ------------------------------------------------------------------ */

function BookAmbulance() {
  const { createEmergencyRequest, ambulances, toast } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    patientName: '',
    patientAge: '',
    phone: '',
    location: locations[0],
    emergencyType: 'Accident' as EmergencyType,
    symptoms: '',
    emergencyContact: '',
    isAccident: false,
    isConscious: true,
    breathingDifficulty: false,
    severeBleeding: false,
    preferredAmbulanceType: '' as '' | AmbulanceType,
  });
  const [result, setResult] = useState<ReturnType<typeof triage> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.patientName.trim()) e.patientName = 'Patient name is required.';
    if (!form.phone.trim()) e.phone = 'Contact phone is required.';
    if (!form.symptoms.trim()) e.symptoms = 'Please describe the symptoms.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const runTriage = () => {
    if (!validate()) return;
    const t = triage({
      emergencyType: form.emergencyType,
      symptoms: form.symptoms,
      isAccident: form.isAccident,
      isConscious: form.isConscious,
      breathingDifficulty: form.breathingDifficulty,
      severeBleeding: form.severeBleeding,
      age: Number(form.patientAge) || 30,
    });
    setResult(t);
    toast('info', 'AI triage complete', `Suggested priority: ${t.priority.toUpperCase()}`);
  };

  const submit = () => {
    if (!validate()) return;
    const t =
      result ??
      triage({
        emergencyType: form.emergencyType,
        symptoms: form.symptoms,
        isAccident: form.isAccident,
        isConscious: form.isConscious,
        breathingDifficulty: form.breathingDifficulty,
        severeBleeding: form.severeBleeding,
        age: Number(form.patientAge) || 30,
      });
    const request = createEmergencyRequest({
      patientName: form.patientName.trim(),
      patientAge: Number(form.patientAge) || 30,
      phone: form.phone.trim(),
      location: form.location,
      emergencyType: form.emergencyType,
      symptoms: form.symptoms.trim(),
      isAccident: form.isAccident,
      isConscious: form.isConscious,
      breathingDifficulty: form.breathingDifficulty,
      severeBleeding: form.severeBleeding,
      emergencyContact: form.emergencyContact.trim() || '+91 98765 43901',
      priority: t.priority,
      aiSummary: t.summary,
      preferredAmbulanceType: form.preferredAmbulanceType || t.suggestedAmbulanceType,
    });
    navigate('/track');
    toast('success', `Emergency ${request.id} created`, 'Dispatching the nearest suitable ambulance.');
  };

  const available = ambulances.filter((a) => a.status === 'Available');
  const matching = form.preferredAmbulanceType
    ? available.filter((a) => a.type === form.preferredAmbulanceType)
    : available;

  return (
    <div className="container section-tight">
      <div className="page-head">
        <div>
          <h1>🚑 Book an Ambulance</h1>
          <p className="muted">
            Describe the emergency. Our rule-based AI suggests a priority and the most suitable
            ambulance — you stay in control of the final request.
          </p>
        </div>
      </div>

      <div className="dash">
        <div className="stack gap-5">
          <div className="card card-pad-lg">
            <h3>1. Patient & emergency details</h3>
            <div className="form-row">
              <Field label="Patient name" required error={errors.patientName}>
                <TextInput value={form.patientName} onChange={(v) => set('patientName', v)} placeholder="e.g. Ramesh Babu" invalid={!!errors.patientName} />
              </Field>
              <Field label="Age">
                <TextInput type="number" value={form.patientAge} onChange={(v) => set('patientAge', v)} placeholder="e.g. 58" />
              </Field>
            </div>
            <div className="form-row">
              <Field label="Contact phone" required error={errors.phone}>
                <TextInput value={form.phone} onChange={(v) => set('phone', v)} placeholder="+91 ..." invalid={!!errors.phone} />
              </Field>
              <Field label="Emergency contact">
                <TextInput value={form.emergencyContact} onChange={(v) => set('emergencyContact', v)} placeholder="+91 ..." />
              </Field>
            </div>
            <div className="form-row">
              <Field label="Location">
                <Select value={form.location} onChange={(v) => set('location', v)} options={locations.map((l) => ({ value: l, label: l }))} />
              </Field>
              <Field label="Emergency type">
                <Select
                  value={form.emergencyType}
                  onChange={(v) => set('emergencyType', v as EmergencyType)}
                  options={emergencyTypes.map((e) => ({ value: e, label: e }))}
                />
              </Field>
            </div>
            <Field label="What is happening?" required error={errors.symptoms} hint="Describe symptoms, how long ago, and any known conditions.">
              <TextArea value={form.symptoms} onChange={(v) => set('symptoms', v)} rows={4} placeholder="e.g. Severe chest pain radiating to left arm, sweating heavily." invalid={!!errors.symptoms} />
            </Field>

            <div className="grid grid-2">
              <Toggle checked={form.isConscious} onChange={(v) => set('isConscious', v)} label="Patient is conscious" />
              <Toggle checked={form.breathingDifficulty} onChange={(v) => set('breathingDifficulty', v)} label="Breathing difficulty" />
              <Toggle checked={form.severeBleeding} onChange={(v) => set('severeBleeding', v)} label="Severe bleeding" />
              <Toggle checked={form.isAccident} onChange={(v) => set('isAccident', v)} label="Accident / trauma" />
            </div>

            <Field label="Preferred ambulance type (optional)" hint="Leave blank to let dispatch choose.">
              <Select
                value={form.preferredAmbulanceType}
                onChange={(v) => set('preferredAmbulanceType', v as '' | AmbulanceType)}
                options={[{ value: '', label: 'Auto-select by AI' }, ...ambulanceTypes.map((t) => ({ value: t, label: t }))]}
              />
            </Field>

            <div className="row gap-3 wrap mt-4">
              <button className="btn btn-info" onClick={runTriage}>🧠 Run AI triage</button>
              <button className="btn btn-sos" onClick={submit}>🆘 Send emergency request</button>
            </div>
          </div>

          {result && (
            <div className="card card-pad-lg">
              <div className="row between wrap gap-3">
                <h3 style={{ margin: 0 }}>2. AI decision support</h3>
                <PriorityBadge priority={result.priority} />
              </div>
              <p className="mt-4">{result.summary}</p>
              <div className="grid grid-2 mt-4">
                <div className="surface-soft card-pad" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <div className="tiny dim">COMPUTED SCORE</div>
                  <div className="bold" style={{ fontSize: '1.5rem' }}>{result.score}</div>
                </div>
                <div className="surface-soft card-pad" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <div className="tiny dim">SUGGESTED TRANSPORT</div>
                  <div className="bold">{result.suggestedAmbulanceType}</div>
                  <div className="small muted">Department: {result.suggestedDepartment}</div>
                </div>
              </div>
              {result.reasons.length > 0 && (
                <ul className="mt-4 small muted" style={{ paddingLeft: 18 }}>
                  {result.reasons.map((r) => <li key={r}>{r}</li>)}
                </ul>
              )}
              <div className="warn-banner mt-4">
                <span>⚠️</span>
                <div>{result.disclaimer}</div>
              </div>
            </div>
          )}
        </div>

        <aside className="sidebar">
          <div className="sidebar-title">Available ambulances</div>
          {matching.length === 0 ? (
            <EmptyState icon="🚑" title="No matching ambulances" message="Try a different type or leave the preference as auto-select." />
          ) : (
            matching.map((a) => (
              <div className="card card-pad mb-2" key={a.id}>
                <div className="row between">
                  <strong>{a.id}</strong>
                  <StatusBadge status={a.status} />
                </div>
                <div className="small muted">{a.type}</div>
                <div className="tiny dim mt-2">
                  📍 {a.location} • ⏱ {a.etaMinutes} min • {a.distanceKm} km
                </div>
                <div className="chip-row mt-2">
                  {a.equipment.slice(0, 3).map((e) => (
                    <span className="badge badge-neutral" key={e.name}>{e.name}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Track                                                               */
/* ------------------------------------------------------------------ */

function Track() {
  const {
    activeRequest,
    ambulances,
    hospitals,
    advanceRequest,
    cancelRequest,
    completeHandover,
    assignAmbulance,
    setDestinationHospital,
  } = useApp();
  const navigate = useNavigate();

  if (!activeRequest) {
    return (
      <div className="container section">
        <EmptyState
          icon="📍"
          title="No active emergency"
          message="There is no emergency trip in progress right now."
          action={<button className="btn btn-primary mt-4" onClick={() => navigate('/book')}>Book an ambulance</button>}
        />
      </div>
    );
  }

  const amb = ambulances.find((a) => a.id === activeRequest.ambulanceId) ?? null;
  const hsp = hospitals.find((h) => h.id === activeRequest.hospitalId) ?? null;
  const currentIdx = TRIP_STAGES.indexOf(activeRequest.status);
  const timelineItems = TRIP_STAGES.map((stage, i) => {
    const done = activeRequest.timeline.find((t) => t.status === stage);
    return {
      status: stage,
      at: done?.at,
      state: i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'todo',
    } as { status: string; at?: string; state: 'done' | 'current' | 'todo' };
  });

  const canAdvance = !['Completed', 'Cancelled'].includes(activeRequest.status);
  const available = ambulances.filter((a) => a.status === 'Available');

  return (
    <div className="container section-tight">
      <div className="page-head">
        <div>
          <h1>
            📍 Tracking {activeRequest.id}
            {canAdvance && <LiveBadge>LIVE</LiveBadge>}
          </h1>
          <p className="muted">
            {activeRequest.patientName} • {activeRequest.emergencyType} • Priority{' '}
            <PriorityBadge priority={activeRequest.priority} />
          </p>
        </div>
        <div className="row gap-2 wrap">
          <button className="btn btn-outline" onClick={() => navigate('/hospitals')}>🏥 Change hospital</button>
          {canAdvance && <button className="btn btn-primary" onClick={() => advanceRequest(activeRequest.id)}>▶ Advance stage</button>}
          <button className="btn btn-success" onClick={() => completeHandover(activeRequest.id)}>✓ Complete handover</button>
          {canAdvance && <button className="btn btn-outline" onClick={() => cancelRequest(activeRequest.id)}>✕ Cancel</button>}
        </div>
      </div>

      <div className="dash">
        <div className="stack gap-5">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Live route</h3>
              {amb && <span className="badge badge-info">ETA {amb.etaMinutes} min</span>}
            </div>
            <div style={{ padding: 'var(--space-4)' }}>
              <MapView
                progress={amb?.routeProgress ?? 0}
                label={activeRequest.location}
                height={360}
                animate={canAdvance}
                badge={amb ? <>🚑 {amb.id}</> : <>Awaiting ambulance</>}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Status timeline</h3></div>
            <div className="card-body">
              <Stepper steps={TRIP_STAGES} currentIndex={currentIdx} />
              <Timeline items={timelineItems} />
            </div>
          </div>
        </div>

        <aside className="sidebar">
          {amb ? (
            <div className="card card-pad mb-4">
              <div className="sidebar-title">Assigned ambulance</div>
              <div className="row between">
                <strong>{amb.id}</strong>
                <StatusBadge status={amb.status} />
              </div>
              <div className="small muted">{amb.type}</div>
              <dl className="kv mt-4">
                <dt>Driver</dt><dd>{amb.driverName}</dd>
                <dt>Vehicle</dt><dd>{amb.vehicleNo}</dd>
                <dt>Distance</dt><dd>{amb.distanceKm} km</dd>
                <dt>ETA</dt><dd>{amb.etaMinutes} min</dd>
                <dt>Location</dt><dd>{amb.location}</dd>
              </dl>
              <div className="chip-row mt-4">
                {amb.equipment.map((e) => (
                  <span className={`badge ${e.available ? 'badge-stable' : 'badge-neutral'}`} key={e.name}>{e.name}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="card card-pad mb-4">
              <div className="sidebar-title">Assign an ambulance</div>
              {available.length === 0 ? (
                <EmptyState icon="🚑" title="No ambulances available" />
              ) : (
                available.map((a) => (
                  <button
                    key={a.id}
                    className="btn btn-outline btn-block mb-2"
                    onClick={() => assignAmbulance(activeRequest.id, a.id)}
                  >
                    {a.id} — {a.type} ({a.etaMinutes} min)
                  </button>
                ))
              )}
            </div>
          )}

          <div className="card card-pad mb-4">
            <div className="sidebar-title">Destination hospital</div>
            {hsp ? (
              <>
                <strong>{hsp.name}</strong>
                <div className="small muted">{hsp.location} • {hsp.distanceKm} km</div>
                <div className="row gap-2 mt-2 wrap">
                  {hsp.emergencyDept && <span className="badge badge-stable">Emergency</span>}
                  {hsp.icuAvailable && <span className="badge badge-info">ICU {hsp.icuBeds}/{hsp.icuBedsTotal}</span>}
                </div>
              </>
            ) : (
              <p className="small muted">No hospital selected yet.</p>
            )}
            {hospitals.length > 0 && (
              <Field label="Select destination">
                <Select
                  value={activeRequest.hospitalId ?? hospitals[0].id}
                  onChange={(v) => setDestinationHospital(activeRequest.id, v)}
                  options={hospitals.map((h) => ({ value: h.id, label: `${h.name} (${h.distanceKm} km)` }))}
                />
              </Field>
            )}
          </div>

          <div className="card card-pad">
            <div className="sidebar-title">Vitals (simulated)</div>
            {activeRequest.vitals ? (
              <dl className="kv">
                <dt>Heart rate</dt><dd>{activeRequest.vitals.heartRate} bpm</dd>
                <dt>SpO₂</dt><dd>{activeRequest.vitals.spo2}%</dd>
                <dt>Blood pressure</dt><dd>{activeRequest.vitals.systolic}/{activeRequest.vitals.diastolic}</dd>
                <dt>Temperature</dt><dd>{activeRequest.vitals.temperature} °C</dd>
                <dt>Resp. rate</dt><dd>{activeRequest.vitals.respiratoryRate} /min</dd>
              </dl>
            ) : (
              <p className="small muted">No vitals recorded.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hospitals                                                           */
/* ------------------------------------------------------------------ */

function Hospitals() {
  const { hospitals, activeRequest, setDestinationHospital } = useApp();
  const [tab, setTab] = useState<'all' | 'emergency' | 'icu'>('all');
  const [query, setQuery] = useState('');

  const filtered = hospitals.filter((h) => {
    if (tab === 'emergency' && !h.emergencyDept) return false;
    if (tab === 'icu' && !h.icuAvailable) return false;
    if (query && !`${h.name} ${h.location}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container section-tight">
      <div className="page-head">
        <div>
          <h1>🏥 Find a Hospital</h1>
          <p className="muted">Compare nearby hospitals by distance, emergency department, ICU capacity and specialisation.</p>
        </div>
      </div>

      <div className="card card-pad mb-5">
        <Tabs
          tabs={[
            { id: 'all', label: 'All', icon: '🏥' },
            { id: 'emergency', label: 'Emergency', icon: '🚨' },
            { id: 'icu', label: 'ICU available', icon: '🛏️' },
          ]}
          active={tab}
          onChange={(id) => setTab(id as 'all' | 'emergency' | 'icu')}
        />
        <div style={{ marginTop: 'var(--space-4)' }}>
          <TextInput value={query} onChange={setQuery} placeholder="Search by name or area…" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🏥" title="No hospitals match" message="Try clearing the filters." />
      ) : (
        <div className="grid grid-auto">
          {filtered.map((h) => (
            <div className="card card-pad" key={h.id}>
              <div className="row between">
                <strong>{h.name}</strong>
                <span className="badge badge-neutral">⭐ {h.rating}</span>
              </div>
              <div className="small muted mt-2">{h.address}</div>
              <dl className="kv mt-4">
                <dt>Distance</dt><dd>{h.distanceKm} km</dd>
                <dt>ICU beds</dt><dd>{h.icuBeds}/{h.icuBedsTotal}</dd>
                <dt>Incoming</dt><dd>{h.incomingPatients}</dd>
                <dt>Phone</dt><dd>{h.phone}</dd>
              </dl>
              <div className="chip-row mt-2">
                {h.emergencyDept && <span className="badge badge-stable">Emergency</span>}
                {h.icuAvailable && <span className="badge badge-info">ICU</span>}
                {h.open24x7 && <span className="badge badge-neutral">24×7</span>}
              </div>
              <div className="row gap-2 mt-4">
                {activeRequest ? (
                  <button className="btn btn-primary btn-block" onClick={() => setDestinationHospital(activeRequest.id, h.id)}>
                    SELECT HOSPITAL
                  </button>
                ) : (
                  <button className="btn btn-outline btn-block" disabled>
                    Start a request to select
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* History                                                             */
/* ------------------------------------------------------------------ */

function History() {
  const { trips } = useApp();
  const columns = ['Trip', 'Patient', 'Type', 'Ambulance', 'Hospital', 'Response', 'Date'];
  const rows = trips.map((t) => [
    <span className="mono">{t.requestId}</span>,
    t.patientName,
    t.emergencyType,
    t.ambulanceId,
    t.hospitalName,
    `${t.responseTimeMinutes} min`,
    formatDate(t.date),
  ]);

  return (
    <div className="container section-tight">
      <div className="page-head">
        <div>
          <h1>🧾 Trip History</h1>
          <p className="muted">Completed emergency transport records (simulated).</p>
        </div>
      </div>
      <DataTable columns={columns} rows={rows} empty="No completed trips yet." />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Contacts                                                            */
/* ------------------------------------------------------------------ */

function Contacts() {
  const { contacts, addContact, updateContact, deleteContact } = useApp();
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', phone: '', email: '', primary: false });

  const startAdd = () => {
    setEditing(null);
    setForm({ name: '', relationship: '', phone: '', email: '', primary: false });
    setOpen(true);
  };

  const startEdit = (id: string) => {
    const c = contacts.find((x) => x.id === id);
    if (!c) return;
    setEditing(id);
    setForm({ name: c.name, relationship: c.relationship, phone: c.phone, email: c.email, primary: c.primary });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    if (editing) updateContact(editing, form);
    else addContact(form);
    setOpen(false);
  };

  return (
    <div className="container section-tight">
      <div className="page-head">
        <div>
          <h1>📞 Emergency Contacts</h1>
          <p className="muted">People who should be notified during an emergency.</p>
        </div>
        <button className="btn btn-primary" onClick={startAdd}>+ Add contact</button>
      </div>

      {contacts.length === 0 ? (
        <EmptyState icon="📞" title="No contacts yet" message="Add someone who should be informed in an emergency." />
      ) : (
        <div className="grid grid-auto-sm">
          {contacts.map((c) => (
            <div className="card card-pad" key={c.id}>
              <div className="row between">
                <strong>{c.name}</strong>
                {c.primary && <span className="badge badge-stable">Primary</span>}
              </div>
              <div className="small muted">{c.relationship}</div>
              <dl className="kv mt-4">
                <dt>Phone</dt><dd>{c.phone}</dd>
                <dt>Email</dt><dd>{c.email}</dd>
              </dl>
              <div className="row gap-2 mt-4">
                <button className="btn btn-sm btn-outline" onClick={() => startEdit(c.id)}>Edit</button>
                <button className="btn btn-sm btn-outline" onClick={() => deleteContact(c.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit contact' : 'Add contact'}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setOpen(false)}>CANCEL</button>
            <button className="btn btn-primary" onClick={save}>SAVE</button>
          </>
        }
      >
        <Field label="Name" required>
          <TextInput value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="Full name" />
        </Field>
        <Field label="Relationship">
          <TextInput value={form.relationship} onChange={(v) => setForm((p) => ({ ...p, relationship: v }))} placeholder="e.g. Wife, Brother" />
        </Field>
        <Field label="Phone" required>
          <TextInput value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} placeholder="+91 ..." />
        </Field>
        <Field label="Email">
          <TextInput value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} placeholder="name@example.com" />
        </Field>
        <Toggle checked={form.primary} onChange={(v) => setForm((p) => ({ ...p, primary: v }))} label="Primary contact" />
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

function SettingsPage() {
  const { settings, updateSettings, currentUser } = useApp();
  return (
    <div className="container section-tight">
      <div className="page-head">
        <div>
          <h1>⚙️ Settings</h1>
          <p className="muted">Preferences are saved locally in your browser for this demo.</p>
        </div>
      </div>
      <div className="card card-pad-lg" style={{ maxWidth: 680 }}>
        {currentUser && (
          <div className="sidebar-profile">
            <div className="avatar">{currentUser.name.slice(0, 1)}</div>
            <div>
              <strong>{currentUser.name}</strong>
              <div className="tiny dim">{currentUser.email} • {currentUser.role}</div>
            </div>
          </div>
        )}
        <div className="setting-row">
          <div><strong>Dark mode</strong><div className="small muted">Use the dark colour theme.</div></div>
          <Toggle checked={settings.darkMode} onChange={(v) => updateSettings({ darkMode: v })} />
        </div>
        <div className="setting-row">
          <div><strong>Notifications</strong><div className="small muted">Receive in-app emergency notifications.</div></div>
          <Toggle checked={settings.notifications} onChange={(v) => updateSettings({ notifications: v })} />
        </div>
        <div className="setting-row">
          <div><strong>Location permission</strong><div className="small muted">Allow the app to use your simulated location.</div></div>
          <Toggle checked={settings.locationPermission} onChange={(v) => updateSettings({ locationPermission: v })} />
        </div>
        <div className="setting-row">
          <div><strong>Sound alerts</strong><div className="small muted">Play an alert sound on emergency updates.</div></div>
          <Toggle checked={settings.soundAlerts} onChange={(v) => updateSettings({ soundAlerts: v })} />
        </div>
        <div className="setting-row">
          <div><strong>Auto-call emergency contact</strong><div className="small muted">Automatically notify your primary contact.</div></div>
          <Toggle checked={settings.autoCallEmergencyContact} onChange={(v) => updateSettings({ autoCallEmergencyContact: v })} />
        </div>
        <Field label="Language">
          <Select
            value={settings.language}
            onChange={(v) => updateSettings({ language: v as 'en' | 'te' | 'hi' })}
            options={[
              { value: 'en', label: 'English' },
              { value: 'te', label: 'తెలుగు (Telugu)' },
              { value: 'hi', label: 'हिन्दी (Hindi)' },
            ]}
          />
        </Field>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Auth (login / register)                                             */
/* ------------------------------------------------------------------ */

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <h2>🚑 LifeRescue AI</h2>
        <p>AI-powered ambulance transport and life-saving decision support.</p>
        <div className="mt-6">
          <div className="auth-feature">
            <span className="auth-feature-icon">🧠</span>
            <div><strong>AI triage</strong><div className="small">Instant priority suggestion.</div></div>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">🚑</span>
            <div><strong>Smart dispatch</strong><div className="small">Best ambulance for the emergency.</div></div>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">📍</span>
            <div><strong>Live tracking</strong><div className="small">Follow the trip in real time.</div></div>
          </div>
        </div>
      </aside>
      <div className="auth-form-wrap">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}

const DEMO_ACCOUNTS = [
  { role: 'Patient', email: 'patient@demo.in', password: 'patient123' },
  { role: 'Driver', email: 'driver@demo.in', password: 'driver123' },
  { role: 'Hospital', email: 'hospital@demo.in', password: 'hospital123' },
  { role: 'Admin', email: 'admin@demo.in', password: 'admin123' },
];

function Login() {
  const { login, toast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (login(email, password)) {
      navigate('/');
    } else {
      setError('Invalid email or password. Try a demo account below.');
      toast('error', 'Sign-in failed', 'Please check your credentials.');
    }
  };

  return (
    <AuthLayout>
      <h2>Welcome back</h2>
      <p className="muted">Sign in to manage emergencies, trips and contacts.</p>
      <Field label="Email" required>
        <TextInput value={email} onChange={setEmail} placeholder="you@example.com" />
      </Field>
      <Field label="Password" required error={error}>
        <TextInput type="password" value={password} onChange={setPassword} placeholder="••••••••" invalid={!!error} />
      </Field>
      <button className="btn btn-primary btn-block btn-lg" onClick={submit}>SIGN IN</button>
      <p className="small muted text-center mt-4">
        No account? <NavLink to="/register">Create one</NavLink>
      </p>
      <div className="divider" />
      <div className="sidebar-title">Demo accounts</div>
      {DEMO_ACCOUNTS.map((d) => (
        <div className="demo-cred" key={d.email}>
          <div>
            <strong>{d.role}</strong>
            <div><code>{d.email}</code> / <code>{d.password}</code></div>
          </div>
          <button
            className="btn btn-xs btn-outline"
            onClick={() => { setEmail(d.email); setPassword(d.password); setError(''); }}
          >
            Use
          </button>
        </div>
      ))}
    </AuthLayout>
  );
}

function Register() {
  const { register, login, toast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'patient' as Role });
  const [error, setError] = useState('');

  const submit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email and password are required.');
      return;
    }
    const ok = register({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: form.role,
    });
    if (!ok) {
      setError('An account with this email already exists.');
      return;
    }
    toast('success', 'Account created', 'You are now signed in.');
    login(form.email.trim(), form.password);
    navigate('/');
  };

  return (
    <AuthLayout>
      <h2>Create your account</h2>
      <p className="muted">Register as a patient, driver, hospital or administrator.</p>
      <Field label="Full name" required>
        <TextInput value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="Full name" />
      </Field>
      <div className="form-row">
        <Field label="Email" required>
          <TextInput value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} placeholder="you@example.com" />
        </Field>
        <Field label="Phone">
          <TextInput value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} placeholder="+91 ..." />
        </Field>
      </div>
      <Field label="Password" required error={error}>
        <TextInput type="password" value={form.password} onChange={(v) => setForm((p) => ({ ...p, password: v }))} placeholder="••••••••" invalid={!!error} />
      </Field>
      <Field label="Role">
        <Select
          value={form.role}
          onChange={(v) => setForm((p) => ({ ...p, role: v as Role }))}
          options={[
            { value: 'patient', label: 'Patient' },
            { value: 'driver', label: 'Driver' },
            { value: 'hospital', label: 'Hospital' },
            { value: 'admin', label: 'Administrator' },
          ]}
        />
      </Field>
      <button className="btn btn-primary btn-block btn-lg" onClick={submit}>CREATE ACCOUNT</button>
      <p className="small muted text-center mt-4">
        Already registered? <NavLink to="/login">Sign in</NavLink>
      </p>
    </AuthLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Driver dashboard                                                    */
/* ------------------------------------------------------------------ */

function DriverDashboard() {
  const { currentUser, drivers, requests, ambulances, advanceRequest } = useApp();
  const navigate = useNavigate();

  const driver = drivers.find((d) => d.name === currentUser?.name) ?? drivers[0];
  const myAmbulance = ambulances.find((a) => a.id === driver?.currentAmbulanceId) ?? null;
  const myTrips = requests.filter(
    (r) => r.ambulanceId === driver?.currentAmbulanceId && !['Completed', 'Cancelled'].includes(r.status),
  );

  return (
    <div className="container section-tight">
      <div className="page-head">
        <div>
          <h1>🧑‍✈️ Driver Dashboard</h1>
          <p className="muted">{driver?.name} • {driver?.experienceYears} yrs experience • ⭐ {driver?.rating}</p>
        </div>
      </div>

      <div className="grid grid-4 mb-6">
        <StatCard icon="🚑" value={driver?.currentAmbulanceId ?? '—'} label="Assigned ambulance" tone="brand" />
        <StatCard icon="🧾" value={driver?.completedTrips ?? 0} label="Completed trips" tone="stable" />
        <StatCard icon="📍" value={myTrips.length} label="Active trips" tone="urgent" />
        <StatCard icon="📞" value={driver?.location ?? '—'} label="Current area" tone="info" />
      </div>

      <div className="dash">
        <div className="stack gap-5">
          <div className="card">
            <div className="card-header"><h3 className="card-title">My active trips</h3></div>
            <div className="card-body">
              {myTrips.length === 0 ? (
                <EmptyState icon="✅" title="No active trips" message="You have no assigned emergencies right now." />
              ) : (
                myTrips.map((r) => (
                  <div className="card card-pad mb-3" key={r.id}>
                    <div className="row between wrap gap-2">
                      <strong>{r.id} — {r.patientName}</strong>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="small muted mt-2">{r.emergencyType} • {r.location} • <PriorityBadge priority={r.priority} /></div>
                    <div className="row gap-2 mt-4 wrap">
                      <button className="btn btn-primary" onClick={() => advanceRequest(r.id)}>▶ Advance status</button>
                      <button className="btn btn-outline" onClick={() => navigate('/track')}>View route</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="sidebar">
          {myAmbulance && (
            <div className="card card-pad">
              <div className="sidebar-title">My ambulance</div>
              <div className="row between">
                <strong>{myAmbulance.id}</strong>
                <StatusBadge status={myAmbulance.status} />
              </div>
              <div className="small muted">{myAmbulance.type}</div>
              <dl className="kv mt-4">
                <dt>Vehicle</dt><dd>{myAmbulance.vehicleNo}</dd>
                <dt>Location</dt><dd>{myAmbulance.location}</dd>
                <dt>Odometer</dt><dd>{myAmbulance.distanceKm} km</dd>
                <dt>Last service</dt><dd>{formatDate(myAmbulance.lastService)}</dd>
              </dl>
              <div className="chip-row mt-4">
                {myAmbulance.equipment.map((e) => (
                  <span className="badge badge-neutral" key={e.name}>{e.name}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hospital dashboard                                                  */
/* ------------------------------------------------------------------ */

function HospitalDashboard() {
  const { hospitals, requests } = useApp();
  const navigate = useNavigate();
  const hospital = hospitals[0];

  const incoming = requests.filter((r) =>
    ['Going To Hospital', 'Arrived At Hospital', 'Patient Picked Up'].includes(r.status),
  );

  return (
    <div className="container section-tight">
      <div className="page-head">
        <div>
          <h1>🏥 Hospital Dashboard</h1>
          <p className="muted">{hospital?.name} • {hospital?.location}</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/hospitals')}>View network</button>
      </div>

      <div className="grid grid-4 mb-6">
        <StatCard icon="🚨" value={incoming.length} label="Incoming patients" tone="critical" />
        <StatCard icon="🛏️" value={`${hospital?.icuBeds ?? 0}/${hospital?.icuBedsTotal ?? 0}`} label="ICU beds" tone="info" />
        <StatCard icon="🚑" value={hospital?.ambulancesAvailable ?? 0} label="Ambulances available" tone="stable" />
        <StatCard icon="⭐" value={hospital?.rating ?? '—'} label="Rating" tone="brand" />
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Emergency pre-alerts</h3></div>
        <div className="card-body">
          {incoming.length === 0 ? (
            <EmptyState icon="🏥" title="No incoming patients" message="New emergency pre-alerts will appear here." />
          ) : (
            incoming.map((r) => (
              <div className="card card-pad mb-3" key={r.id}>
                <div className="row between wrap gap-2">
                  <strong>{r.id} — {r.patientName} ({r.patientAge})</strong>
                  <PriorityBadge priority={r.priority} />
                </div>
                <div className="small muted mt-2">{r.emergencyType} • {r.location}</div>
                <div className="small mt-2">{r.aiSummary}</div>
                <div className="row gap-2 mt-3">
                  <StatusBadge status={r.status} />
                  <button className="btn btn-sm btn-outline" onClick={() => navigate('/track')}>Track</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Admin console (overview / fleet / patients / analytics)             */
/* ------------------------------------------------------------------ */

function AdminConsole({ initialTab = 'overview' }: { initialTab?: string }) {
  const {
    requests,
    ambulances,
    hospitals,
    trips,
    patients,
    drivers,
    updateAmbulance,
    addAmbulance,
    deleteAmbulance,
  } = useApp();
  const [tab, setTab] = useState(initialTab);
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [fleetOpen, setFleetOpen] = useState(false);
  const [fleetForm, setFleetForm] = useState({
    id: '',
    type: ambulanceTypes[0] as AmbulanceType,
    location: locations[0],
    status: 'Available' as const,
    equipment: [] as string[],
    baseHospitalId: hospitals[0]?.id ?? '',
  });

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const active = requests.filter((r) => !['Completed', 'Cancelled'].includes(r.status));
  const filteredActive = active.filter((r) => priorityFilter === 'all' || r.priority === priorityFilter);

  const toggleEquipment = (name: string) =>
    setFleetForm((p) => ({
      ...p,
      equipment: p.equipment.includes(name)
        ? p.equipment.filter((e) => e !== name)
        : [...p.equipment, name],
    }));

  const saveFleet = () => {
    if (!fleetForm.id.trim()) return;
    addAmbulance({
      id: fleetForm.id.trim(),
      type: fleetForm.type,
      driverId: null,
      driverName: 'Unassigned',
      location: fleetForm.location,
      status: fleetForm.status,
      equipment: (fleetForm.equipment.length ? fleetForm.equipment : ['Oxygen', 'First Aid Kit']).map((name) => ({ name, available: true })),
      distanceKm: 5,
      etaMinutes: 12,
      vehicleNo: `TS 09 E${fleetForm.id.trim().slice(-3)}`,
      baseHospitalId: fleetForm.baseHospitalId,
      lastService: new Date().toISOString(),
      latitude: 17.43,
      longitude: 78.45,
    });
    setFleetOpen(false);
    setFleetForm({ id: '', type: ambulanceTypes[0], location: locations[0], status: 'Available', equipment: [], baseHospitalId: hospitals[0]?.id ?? '' });
  };

  const overview = (
    <>
      <div className="grid grid-4 mb-6">
        <StatCard icon="🚨" value={active.length} label="Active requests" tone="critical" />
        <StatCard icon="🚑" value={ambulances.filter((a) => a.status === 'Available').length} label="Ambulances available" tone="stable" />
        <StatCard icon="🏥" value={hospitals.length} label="Hospitals" tone="info" />
        <StatCard icon="✅" value={trips.length} label="Completed trips" tone="brand" />
      </div>

      <div className="card mb-5">
        <div className="card-header">
          <h3 className="card-title">Active emergency requests</h3>
          <Select
            value={priorityFilter}
            onChange={(v) => setPriorityFilter(v as 'all' | Priority)}
            options={[
              { value: 'all', label: 'All priorities' },
              { value: 'critical', label: 'Critical' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'non-critical', label: 'Non-critical' },
            ]}
          />
        </div>
        <div className="card-body">
          <DataTable
            columns={['Request', 'Patient', 'Type', 'Priority', 'Status', 'Ambulance']}
            rows={filteredActive.map((r) => [
              <span className="mono">{r.id}</span>,
              r.patientName,
              r.emergencyType,
              <PriorityBadge priority={r.priority} />,
              <StatusBadge status={r.status} />,
              r.ambulanceId ?? '—',
            ])}
            empty="No active requests."
          />
        </div>
      </div>
    </>
  );

  const fleet = (
    <>
      <div className="row between mb-4 wrap gap-3">
        <h3 style={{ margin: 0 }}>Fleet management</h3>
        <button className="btn btn-primary" onClick={() => setFleetOpen(true)}>+ Add ambulance</button>
      </div>
      <DataTable
        columns={['Ambulance', 'Type', 'Driver', 'Location', 'Status', 'Actions']}
        rows={ambulances.map((a) => [
          <span className="mono">{a.id}</span>,
          a.type,
          a.driverName,
          a.location,
          <Select
            value={a.status}
            onChange={(v) => updateAmbulance(a.id, { status: v as typeof a.status })}
            options={[
              { value: 'Available', label: 'Available' },
              { value: 'Busy', label: 'Busy' },
              { value: 'Offline', label: 'Offline' },
              { value: 'Maintenance', label: 'Maintenance' },
            ]}
          />,
          <button className="btn btn-xs btn-outline" onClick={() => deleteAmbulance(a.id)}>Remove</button>,
        ])}
        empty="No ambulances in the fleet."
      />
    </>
  );

  const patientsTab = (
    <DataTable
      columns={['ID', 'Name', 'Age', 'Gender', 'Blood', 'Phone', 'Registered']}
      rows={patients.map((p) => [
        <span className="mono">{p.id}</span>,
        p.name,
        p.age,
        p.gender,
        p.bloodGroup,
        p.phone,
        formatDate(p.registeredAt),
      ])}
      empty="No patients registered."
    />
  );

  const analyticsTab = (
    <div className="grid grid-2">
      <div className="card">
        <div className="card-header"><h3 className="card-title">Emergency requests (7 days)</h3></div>
        <div className="card-body"><BarChart data={analytics.emergencyRequests7d} tone="blue" /></div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Response times (minutes)</h3></div>
        <div className="card-body"><BarChart data={analytics.responseTimes7d} tone="green" /></div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Emergency categories</h3></div>
        <div className="card-body"><DonutChart data={analytics.emergencyCategories} /></div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Daily usage</h3></div>
        <div className="card-body"><HBarChart data={analytics.dailyUsage7d} /></div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Completed trips (monthly)</h3></div>
        <div className="card-body"><BarChart data={analytics.completedTripsMonthly} tone="orange" /></div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Driver roster</h3></div>
        <div className="card-body">
          <DataTable
            columns={['Driver', 'Ambulance', 'Rating', 'Trips', 'Status']}
            rows={drivers.map((d) => [
              d.name,
              d.currentAmbulanceId ?? '—',
              `⭐ ${d.rating}`,
              d.completedTrips,
              <StatusBadge status={d.status} />,
            ])}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container section-tight">
      <div className="page-head">
        <div>
          <h1>🛡️ Admin Console</h1>
          <p className="muted">Monitor requests, manage the fleet and review analytics.</p>
        </div>
      </div>

      <div className="card card-pad mb-5">
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'fleet', label: 'Fleet', icon: '🚑' },
            { id: 'patients', label: 'Patients', icon: '🧑‍⚕️' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'overview' && overview}
      {tab === 'fleet' && fleet}
      {tab === 'patients' && patientsTab}
      {tab === 'analytics' && analyticsTab}

      <Modal
        open={fleetOpen}
        onClose={() => setFleetOpen(false)}
        title="Add ambulance"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setFleetOpen(false)}>CANCEL</button>
            <button className="btn btn-primary" onClick={saveFleet}>ADD</button>
          </>
        }
      >
        <Field label="Ambulance ID" required hint="e.g. AMB-113">
          <TextInput value={fleetForm.id} onChange={(v) => setFleetForm((p) => ({ ...p, id: v }))} placeholder="AMB-113" />
        </Field>
        <div className="form-row">
          <Field label="Type">
            <Select
              value={fleetForm.type}
              onChange={(v) => setFleetForm((p) => ({ ...p, type: v as AmbulanceType }))}
              options={ambulanceTypes.map((t) => ({ value: t, label: t }))}
            />
          </Field>
          <Field label="Location">
            <Select
              value={fleetForm.location}
              onChange={(v) => setFleetForm((p) => ({ ...p, location: v }))}
              options={locations.map((l) => ({ value: l, label: l }))}
            />
          </Field>
        </div>
        <Field label="Base hospital">
          <Select
            value={fleetForm.baseHospitalId}
            onChange={(v) => setFleetForm((p) => ({ ...p, baseHospitalId: v }))}
            options={hospitals.map((h) => ({ value: h.id, label: h.name }))}
          />
        </Field>
        <Field label="Equipment">
          <div className="chip-row">
            {equipmentCatalogue.map((e) => (
              <button
                key={e}
                type="button"
                className={`chip ${fleetForm.equipment.includes(e) ? 'active' : ''}`}
                onClick={() => toggleEquipment(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App shell                                                           */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookAmbulance />} />
          <Route path="/track" element={<Track />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/history" element={<History />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/hospital" element={<HospitalDashboard />} />
          <Route path="/patient" element={<Navigate to="/track" replace />} />
          <Route path="/admin" element={<AdminConsole />} />
          <Route path="/ambulances" element={<AdminConsole initialTab="fleet" />} />
          <Route path="/patients" element={<AdminConsole initialTab="patients" />} />
          <Route path="/analytics" element={<AdminConsole initialTab="analytics" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <MobileActionBar />
      <ToastHost />
    </>
  );
}