/**
 * LifeRescue AI — Reusable UI kit (compact, dependency-free).
 */
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useApp } from '../store/AppStore';

export const Spinner = ({ large = false }: { large?: boolean }) => (
  <span className={large ? 'spinner spinner-lg' : 'spinner'} role="status" aria-label="Loading" />
);

export const LoadingBlock = ({ label = 'Loading…' }: { label?: string }) => (
  <div className="loading-block"><Spinner large /><span>{label}</span></div>
);

export const EmptyState = ({ icon = '📭', title, message, action }:
  { icon?: string; title: string; message?: string; action?: ReactNode }) => (
  <div className="empty">
    <div className="empty-icon">{icon}</div>
    <h4>{title}</h4>
    {message && <p className="small" style={{ maxWidth: '42ch', margin: '0 auto' }}>{message}</p>}
    {action}
  </div>
);

export const Modal = ({ open, onClose, title, children, footer, size = '' }:
  { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'lg' | '' }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal ${size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head"><h3>{title}</h3><button className="close-x" onClick={onClose} aria-label="Close">×</button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmLabel = 'CONFIRM', variant = 'danger' }:
  { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: ReactNode; confirmLabel?: string; variant?: 'danger' | 'primary' | 'success' }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm"
    footer={<><button className="btn btn-outline" onClick={onClose}>CANCEL</button>
      <button className={`btn btn-${variant}`} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button></>}>
    <div className="stack gap-3">{message}</div>
  </Modal>
);

export const ToastHost = () => {
  const { toasts, dismissToast } = useApp();
  const icons: Record<string, string> = { success: '✅', error: '⛔', warning: '⚠️', info: 'ℹ️' };
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.variant}`}>
          <span className="toast-icon">{icons[t.variant]}</span>
          <div className="flex-1">
            <div className="toast-title">{t.title}</div>
            {t.message && <div className="toast-msg">{t.message}</div>}
          </div>
          <button className="toast-close" onClick={() => dismissToast(t.id)} aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  );
};

export const StatCard = ({ icon, value, label, sub, tone = 'brand' }:
  { icon: string; value: ReactNode; label: string; sub?: string; tone?: 'brand' | 'critical' | 'urgent' | 'stable' | 'info' }) => (
  <div className="stat">
    <div className={`stat-icon ${tone}`}>{icon}</div>
    <div className="flex-1">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

export const PriorityBadge = ({ priority }: { priority: 'critical' | 'urgent' | 'non-critical' }) => {
  const cls = priority === 'critical' ? 'badge-critical' : priority === 'urgent' ? 'badge-urgent' : 'badge-stable';
  const label = priority === 'critical' ? '🔴 Critical' : priority === 'urgent' ? '🟠 Urgent' : '🟢 Non-Critical';
  return <span className={`badge ${cls}`}>{label}</span>;
};

export const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Available: 'badge-stable', Busy: 'badge-urgent', Offline: 'badge-neutral', Maintenance: 'badge-info',
    Completed: 'badge-stable', Cancelled: 'badge-neutral', Requested: 'badge-info', 'On Trip': 'badge-urgent',
    'In Transit': 'badge-urgent', Acknowledged: 'badge-info', Pending: 'badge-info',
  };
  return <span className={`badge ${map[status] ?? 'badge-urgent'}`}>{status}</span>;
};

export const LiveBadge = ({ children = 'LIVE' }: { children?: ReactNode }) => (
  <span className="badge badge-dark"><span className="pulse" />{children}</span>
);

export const Field = ({ label, required, error, hint, children }:
  { label?: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}{required && <span className="req">*</span>}</label>}
    {children}
    {error && <div className="field-error">⚠ {error}</div>}
    {hint && !error && <div className="field-hint">{hint}</div>}
  </div>
);

export const TextInput = ({ value, onChange, placeholder, type = 'text', invalid, min, max, disabled }:
  { value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string; invalid?: boolean; min?: number; max?: number; disabled?: boolean }) => (
  <input className={`input ${invalid ? 'invalid' : ''}`} type={type} value={value} placeholder={placeholder} min={min} max={max} disabled={disabled}
    onChange={(e) => onChange(e.target.value)} />
);

export const TextArea = ({ value, onChange, placeholder, rows = 4, invalid }:
  { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; invalid?: boolean }) => (
  <textarea className={`textarea ${invalid ? 'invalid' : ''}`} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
);

export const Select = ({ value, onChange, options, invalid }:
  { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; invalid?: boolean }) => (
  <select className={`select ${invalid ? 'invalid' : ''}`} value={value} onChange={(e) => onChange(e.target.value)}>
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

export const Toggle = ({ checked, onChange, label }:
  { checked: boolean; onChange: (v: boolean) => void; label?: string }) => (
  <label className="checkbox-row" style={{ justifyContent: 'space-between', width: '100%' }}>
    {label && <span>{label}</span>}
    <span className="toggle"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span className="toggle-slider" /></span>
  </label>
);

export const Tabs = ({ tabs, active, onChange }:
  { tabs: { id: string; label: string; icon?: string }[]; active: string; onChange: (id: string) => void }) => (
  <div className="tabs" role="tablist">
    {tabs.map((t) => (
      <button key={t.id} role="tab" aria-selected={active === t.id} className={`tab ${active === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)}>
        {t.icon && `${t.icon} `}{t.label}
      </button>
    ))}
  </div>
);

export const BarChart = ({ data, tone = '', unit = '', height = 210 }:
  { data: { label: string; value: number }[]; tone?: '' | 'blue' | 'green' | 'orange'; unit?: string; height?: number }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bars" style={{ height }}>
      {data.map((d) => (
        <div className="bar-col" key={d.label} title={`${d.label}: ${d.value}${unit}`}>
          <span className="bar-val">{d.value}{unit}</span>
          <div className={`bar ${tone}`} style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }} />
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export const HBarChart = ({ data, unit = '' }: { data: { label: string; value: number }[]; unit?: string }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="hbars">
      {data.map((d) => (
        <div className="hbar-row" key={d.label}>
          <span className="hbar-label" title={d.label}>{d.label}</span>
          <span className="hbar-track"><span className="hbar-fill" style={{ width: `${(d.value / max) * 100}%` }} /></span>
          <span className="hbar-val">{d.value}{unit}</span>
        </div>
      ))}
    </div>
  );
};

export const DonutChart = ({ data, size = 168 }: { data: { label: string; value: number; color: string }[]; size?: number }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const r = 60; const c = 2 * Math.PI * r;
  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox="0 0 160 160" role="img" aria-label="Distribution chart">
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="22" />
        {data.map((d) => {
          const len = (d.value / total) * c;
          const el = <circle key={d.label} cx="80" cy="80" r={r} fill="none" stroke={d.color} strokeWidth="22"
            strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 80 80)" />;
          offset += len; return el;
        })}
        <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text)">{total}</text>
        <text x="80" y="94" textAnchor="middle" fontSize="10" fill="var(--text-3)">TOTAL</text>
      </svg>
      <div className="donut-legend">
        {data.map((d) => (
          <div className="donut-legend-item" key={d.label}>
            <span className="swatch" style={{ background: d.color }} /><span>{d.label}</span>
            <span className="dim tiny">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Sparkline = ({ values, color = 'var(--brand-600)' }: { values: number[]; color?: string }) => {
  const path = useMemo(() => {
    if (values.length < 2) return '';
    const min = Math.min(...values); const max = Math.max(...values); const range = max - min || 1;
    return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (values.length - 1)) * 100} ${40 - ((v - min) / range) * 34}`).join(' ');
  }, [values]);
  return <svg className="vital-spark" viewBox="0 0 100 42" preserveAspectRatio="none">
    <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
  </svg>;
};

export const Timeline = ({ items }: { items: { status: string; at?: string; state: 'done' | 'current' | 'todo' }[] }) => (
  <div className="timeline">
    {items.map((it) => (
      <div key={it.status} className={`tl-item ${it.state}`}>
        <div className="tl-node">{it.state === 'done' ? '✓' : it.state === 'current' ? '●' : '○'}</div>
        <div className="tl-body">
          <div className="tl-title">{it.status}</div>
          {it.at && <div className="tl-time">{new Date(it.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>}
        </div>
      </div>
    ))}
  </div>
);

export const Stepper = ({ steps, currentIndex }: { steps: string[]; currentIndex: number }) => (
  <div className="stepper">
    {steps.map((s, i) => (
      <span key={s} style={{ display: 'flex', alignItems: 'center' }}>
        <span className={`step ${i < currentIndex ? 'done' : i === currentIndex ? 'current' : ''}`}>
          <span className="step-num">{i < currentIndex ? '✓' : i + 1}</span>{s}
        </span>
        {i < steps.length - 1 && <span className="step-arrow">›</span>}
      </span>
    ))}
  </div>
);

const ROUTE_PTS = [
  { x: 76, y: 20 }, { x: 66, y: 28 }, { x: 58, y: 24 }, { x: 48, y: 36 },
  { x: 40, y: 46 }, { x: 30, y: 58 }, { x: 22, y: 66 }, { x: 18, y: 72 },
  { x: 30, y: 78 }, { x: 44, y: 82 }, { x: 58, y: 86 }, { x: 70, y: 84 }, { x: 84, y: 80 },
];

export const MapView = ({ progress = 0, label = 'Patient Location', badge, height = 400, animate = false }:
  { progress?: number; label?: string; badge?: ReactNode; height?: number; animate?: boolean }) => {
  const path = ROUTE_PTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const pos = useMemo(() => {
    const clamped = Math.max(0, Math.min(1, progress));
    const exact = clamped * (ROUTE_PTS.length - 1);
    const i = Math.min(ROUTE_PTS.length - 2, Math.floor(exact));
    const t = exact - i;
    return { x: ROUTE_PTS[i].x + (ROUTE_PTS[i + 1].x - ROUTE_PTS[i].x) * t, y: ROUTE_PTS[i].y + (ROUTE_PTS[i + 1].y - ROUTE_PTS[i].y) * t };
  }, [progress]);
  return (
    <div className="map-shell" style={{ minHeight: height }}>
      <svg className="map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ minHeight: height }} role="img" aria-label="Simulated tracking map">
        <defs><pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(100,116,139,0.16)" strokeWidth="0.3" /></pattern></defs>
        <rect width="100" height="100" fill="url(#grid)" />
        {[12, 30, 52, 70, 88].map((y) => <rect key={`h${y}`} x="0" y={y} width="100" height="2.4" fill="rgba(100,116,139,0.10)" />)}
        {[14, 34, 56, 78].map((x) => <rect key={`v${x}`} x={x} y="0" width="2.4" height="100" fill="rgba(100,116,139,0.10)" />)}
        <path d={path} fill="none" stroke="rgba(37,99,235,0.35)" strokeWidth="1.5" strokeLinecap="round" />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="0.7" strokeDasharray="2 2" strokeLinecap="round" />
        <circle cx="84" cy="80" r="3.4" fill="#2563eb" />
        <text x="84" y="74.5" fontSize="3.6" textAnchor="middle">🏥</text>
        <circle cx="18" cy="72" r="3.4" fill="#e11d48" />
        <text x="18" y="66.5" fontSize="3.6" textAnchor="middle">📍</text>
        <g transform={`translate(${pos.x} ${pos.y})`}>
          <circle r="3.6" fill="#16a34a">
            {animate && <animate attributeName="r" values="3.6;5;3.6" dur="1.6s" repeatCount="indefinite" />}
          </circle>
          {animate && (
            <circle r="3.6" fill="none" stroke="#16a34a" strokeWidth="0.6">
              <animate attributeName="r" values="3.6;7;3.6" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="1.6s" repeatCount="indefinite" />
            </circle>
          )}
          <text y="1.2" fontSize="3.4" textAnchor="middle" fill="#fff" fontWeight="800">🚑</text>
        </g>
      </svg>
      <div className="map-legend">
        <span>📍 {label}</span><span>🚑 Ambulance {Math.round(progress * 100)}% along route</span><span>🏥 Destination hospital</span>
      </div>
      {badge && <div className="map-badge">{badge}</div>}
    </div>
  );
};

export const SectionHead = ({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) => (
  <div className="section-head">
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h2>{title}</h2>
    {sub && <p>{sub}</p>}
  </div>
);

export const DemoNotice = () => (
  <div className="info-banner" style={{ marginTop: 'var(--space-4)' }}>
    <span>ℹ️</span>
    <div><strong>Demo / Simulated Data.</strong> Educational demonstration only. All patients, trips, vitals and locations are fictional.</div>
  </div>
);

export const Counter = ({ to, duration = 900 }: { to: number; duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = 0; const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span ref={ref}>0</span>;
};

export const DataTable = ({ columns, rows, empty = 'No records found.' }:
  { columns: string[]; rows: ReactNode[][]; empty?: string }) => (
  <div className="table-wrap">
    <table className="data responsive">
      <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length}><EmptyState icon="🔍" title={empty} /></td></tr>
        ) : rows.map((r, i) => (
          <tr key={i}>{r.map((cell, j) => <td key={j} data-label={columns[j]}>{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  </div>
);