import { useState, useRef, useEffect } from 'react';

type Mode = 'quote' | 'sample';
type Status = 'idle' | 'submitting' | 'success' | 'error';

interface VisualOption { value: string; label: string; swatch?: string; icon?: string; }
interface SizeOption  { w: number; h: number; label: string; }
interface FieldDef {
  id: string; label: string;
  kind: 'dim_pair' | 'visual_radio' | 'size_grid' | 'number' | 'text' | 'textarea';
  optional?: boolean; placeholder?: string; rows?: number;
  options?: VisualOption[]; sizes?: SizeOption[];
  mapsTo?: 'qty' | 'budget';
}
interface ServiceDef { id: string; label: string; color: string; hex: string; fields: FieldDef[]; }

/* ── Service definitions ───────────────────────────────────────────────────── */
const SERVICES: ServiceDef[] = [
  {
    id: 'vinyl', label: 'Vinyl Decal', color: 'var(--cyan)', hex: '#00AEEF',
    fields: [
      {
        id: 'vinyl_material', label: 'Material', kind: 'visual_radio',
        options: [
          { value: 'Cast Vinyl',       label: 'Cast',      swatch: '#F0EEE8' },
          { value: 'Metallic Gold',    label: 'Gold',      swatch: 'linear-gradient(135deg,#6b4c00 0%,#f5c518 35%,#d4a017 65%,#6b4c00 100%)' },
          { value: 'Metallic Silver',  label: 'Silver',    swatch: 'linear-gradient(135deg,#555 0%,#d8d8d8 40%,#888 70%,#555 100%)' },
          { value: 'Holographic',      label: 'Holo',      swatch: 'linear-gradient(135deg,#ff0080,#ff8000,#ffe600,#00e5ff,#0060ff,#8000ff,#ff0080)' },
          { value: 'Reflective White', label: 'Reflective',swatch: 'repeating-linear-gradient(45deg,#d0cfc9 0px,#d0cfc9 3px,#f8f7f4 3px,#f8f7f4 8px)' },
        ],
      },
      { id: 'vinyl_size', label: 'Size (inches)', kind: 'dim_pair' },
      { id: 'vinyl_qty',  label: 'Quantity', kind: 'number', mapsTo: 'qty', placeholder: '50' },
    ],
  },
  {
    id: 'sticker', label: 'Sticker Print', color: 'var(--magenta)', hex: '#EC008C',
    fields: [
      {
        id: 'sticker_shape', label: 'Shape', kind: 'visual_radio',
        options: [
          { value: 'Die-Cut',   label: 'Die-Cut', icon: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 5 C29 5 36 11 35 21 C34 31 24 37 16 34 C8 31 4 23 7 15 C10 7 14 5 20 5Z" stroke="currentColor" stroke-width="1.5"/></svg>' },
          { value: 'Circle',    label: 'Circle',  icon: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="1.5"/></svg>' },
          { value: 'Square',    label: 'Square',  icon: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="28" height="28" stroke="currentColor" stroke-width="1.5"/></svg>' },
          { value: 'Rectangle', label: 'Rect.',   icon: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="10" width="32" height="20" stroke="currentColor" stroke-width="1.5"/></svg>' },
        ],
      },
      {
        id: 'sticker_finish', label: 'Finish', kind: 'visual_radio',
        options: [
          { value: 'Gloss Laminate',    label: 'Gloss',  swatch: 'linear-gradient(145deg,#ffffff 0%,#e0e0e0 40%,#f8f8f8 70%,#c8c8c8 100%)' },
          { value: 'Matte Laminate',    label: 'Matte',  swatch: '#c8c6c2' },
          { value: 'Kraft / Uncoated',  label: 'Kraft',  swatch: '#c4a265' },
          { value: 'Holographic',       label: 'Holo',   swatch: 'linear-gradient(135deg,#ff0080,#ff8000,#ffe600,#00e5ff,#0060ff,#8000ff,#ff0080)' },
        ],
      },
      {
        id: 'sticker_size', label: 'Size', kind: 'size_grid',
        sizes: [
          { w: 2, h: 2,   label: '2×2"'   },
          { w: 3, h: 3,   label: '3×3"'   },
          { w: 4, h: 4,   label: '4×4"'   },
          { w: 2, h: 3.5, label: '2×3.5"' },
          { w: 3, h: 5,   label: '3×5"'   },
        ],
      },
      { id: 'sticker_qty', label: 'Quantity', kind: 'number', mapsTo: 'qty', placeholder: '100' },
    ],
  },
  {
    id: 'fineart', label: 'Fine-Art Print', color: 'var(--yellow)', hex: '#FFF200',
    fields: [
      {
        id: 'fineart_paper', label: 'Paper', kind: 'visual_radio',
        options: [
          { value: 'Gloss Photo',     label: 'Gloss Photo',  swatch: 'linear-gradient(145deg,#ffffff 0%,#e0e0e0 40%,#f8f8f8 70%,#d0d0d0 100%)' },
          { value: 'Matte Photo',     label: 'Matte Photo',  swatch: '#dddbd6' },
          { value: 'Fine Art Cotton', label: 'F.A. Cotton',  swatch: 'linear-gradient(135deg,#f5efe0 0%,#e8dfc8 50%,#f0e8d5 100%)' },
          { value: 'Canvas',          label: 'Canvas',       swatch: '#c4a870' },
        ],
      },
      {
        id: 'fineart_size', label: 'Size', kind: 'size_grid',
        sizes: [
          { w: 5,  h: 7,  label: '5×7"'   },
          { w: 8,  h: 10, label: '8×10"'  },
          { w: 11, h: 14, label: '11×14"' },
          { w: 16, h: 20, label: '16×20"' },
          { w: 20, h: 24, label: '20×24"' },
        ],
      },
      { id: 'fineart_qty', label: 'Quantity', kind: 'number', mapsTo: 'qty', placeholder: '1' },
    ],
  },
  {
    id: 'uv', label: 'UV Print', color: 'var(--cyan)', hex: '#00AEEF',
    fields: [
      {
        id: 'uv_substrate', label: 'Substrate', kind: 'visual_radio',
        options: [
          { value: 'Acrylic',             label: 'Acrylic',  swatch: 'linear-gradient(135deg,rgba(210,245,255,0.8) 0%,rgba(255,255,255,0.95) 50%,rgba(210,245,255,0.7) 100%)' },
          { value: 'Dibond / Aluminium',  label: 'Dibond',   swatch: 'linear-gradient(135deg,#555 0%,#bbb 40%,#888 70%,#555 100%)' },
          { value: 'PVC Foam Board',      label: 'PVC Foam', swatch: '#e2e0dc' },
          { value: 'Wood',                label: 'Wood',     swatch: 'linear-gradient(135deg,#a07850 0%,#c09060 40%,#a07850 100%)' },
          { value: 'Other substrate',     label: 'Other',    swatch: 'repeating-linear-gradient(45deg,#333 0px,#333 3px,#444 3px,#444 8px)' },
        ],
      },
      { id: 'uv_size', label: 'Size (inches)', kind: 'dim_pair' },
      { id: 'uv_qty',  label: 'Quantity', kind: 'number', mapsTo: 'qty', placeholder: '1' },
    ],
  },
  {
    id: 'design', label: 'Graphic Design', color: 'var(--magenta)', hex: '#EC008C',
    fields: [
      {
        id: 'design_type', label: 'Service Type', kind: 'visual_radio',
        options: [
          { value: 'Logo Design',       label: 'Logo',     icon: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="20,6 33,30 7,30" stroke="currentColor" stroke-width="1.5"/><line x1="20" y1="6" x2="20" y2="30" stroke="currentColor" stroke-width="1" opacity="0.35"/></svg>' },
          { value: 'Brand Identity',    label: 'Brand',    icon: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="11" height="11" stroke="currentColor" stroke-width="1.5"/><circle cx="28" cy="11" r="5.5" stroke="currentColor" stroke-width="1.5"/><line x1="6" y1="23" x2="34" y2="23" stroke="currentColor" stroke-width="1"/><line x1="6" y1="28" x2="27" y2="28" stroke="currentColor" stroke-width="1"/><line x1="6" y1="33" x2="20" y2="33" stroke="currentColor" stroke-width="1"/></svg>' },
          { value: 'Signage Layout',    label: 'Signage',  icon: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="32" height="20" stroke="currentColor" stroke-width="1.5"/><line x1="20" y1="28" x2="20" y2="36" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="12" width="10" height="12" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="22" y1="15" x2="32" y2="15" stroke="currentColor" stroke-width="1"/><line x1="22" y1="20" x2="30" y2="20" stroke="currentColor" stroke-width="1"/></svg>' },
          { value: 'File Prep / Cleanup', label: 'File Prep', icon: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4 H24 L34 14 V36 H10 Z" stroke="currentColor" stroke-width="1.5"/><path d="M24 4 V14 H34" stroke="currentColor" stroke-width="1.5"/><line x1="15" y1="21" x2="29" y2="21" stroke="currentColor" stroke-width="1"/><line x1="15" y1="27" x2="24" y2="27" stroke="currentColor" stroke-width="1"/></svg>' },
          { value: 'Other / Not Sure',  label: 'Other',    icon: '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="1.5"/><circle cx="20" cy="28" r="1.5" fill="currentColor"/><path d="M20 24 C20 20 26 19 26 15 C26 11 23 9 20 9 C17 9 14 11 14 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
        ],
      },
      {
        id: 'design_budget', label: 'Ballpark Budget', kind: 'visual_radio', optional: true, mapsTo: 'budget',
        options: [
          { value: 'Under $300',   label: 'Under $300' },
          { value: '$300–$600',    label: '$300–$600'  },
          { value: '$600–$1,200',  label: '$600–$1,200'},
          { value: '$1,200+',      label: '$1,200+'    },
          { value: 'Not sure yet', label: 'Not sure'   },
        ],
      },
    ],
  },
  {
    id: 'general', label: 'General Request', color: 'var(--paper)', hex: '#F5F0E8',
    fields: [
      { id: 'general_what', label: 'What do you need?', kind: 'text', placeholder: 'e.g. window vinyl, promotional items, a weird substrate…' },
      {
        id: 'general_budget', label: 'Budget', kind: 'visual_radio', optional: true, mapsTo: 'budget',
        options: [
          { value: 'Under $100',   label: 'Under $100'  },
          { value: '$100–$500',    label: '$100–$500'   },
          { value: '$500–$1,500',  label: '$500–$1,500' },
          { value: '$1,500+',      label: '$1,500+'     },
          { value: 'Not sure yet', label: 'Not sure'    },
        ],
      },
    ],
  },
];

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const ACCEPT_EXT = '.png,.jpg,.jpeg,.pdf,.ai,.svg,.eps';
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function buildSummary(
  svc: ServiceDef,
  vals: Record<string, string>,
  userNotes: string,
  noArtwork: boolean,
  artworkNotes: string,
): string {
  const lines: string[] = [`Service: ${svc.label}`];
  for (const f of svc.fields) {
    if (f.kind === 'dim_pair') {
      const w = vals[`${f.id}_w`]?.trim();
      const h = vals[`${f.id}_h`]?.trim();
      if (w || h) lines.push(`- ${f.label}: ${w || '?'}" × ${h || '?'}"`);
    } else if (f.kind === 'size_grid') {
      const sel = vals[f.id];
      if (sel === 'custom') {
        const w = vals[`${f.id}_w`]?.trim();
        const h = vals[`${f.id}_h`]?.trim();
        lines.push(`- ${f.label}: ${w || '?'}" × ${h || '?'}" (custom)`);
      } else if (sel) {
        const found = f.sizes?.find(s => `${s.w}x${s.h}` === sel);
        lines.push(`- ${f.label}: ${found?.label ?? sel}`);
      }
    } else if (f.kind !== 'textarea') {
      const v = vals[f.id]?.trim();
      if (v) lines.push(`- ${f.label}: ${v}`);
    }
  }
  if (userNotes.trim()) {
    lines.push('--- Customer notes ---');
    lines.push(userNotes.trim());
  }
  if (noArtwork && artworkNotes.trim()) {
    lines.push('--- Artwork notes (no file) ---');
    lines.push(artworkNotes.trim());
  }
  return lines.join('\n');
}

/* ── Sub-components ────────────────────────────────────────────────────────── */
function VisualRadio({ field, vals, onChange, hex }: {
  field: FieldDef; vals: Record<string, string>;
  onChange: (id: string, v: string) => void; hex: string;
}) {
  const sel = vals[field.id] ?? '';
  const isText = !field.options?.some(o => o.swatch || o.icon);
  return (
    <div className={`qf-vr${isText ? ' qf-vr--text' : ''}`}>
      {field.options?.map(opt => {
        const active = sel === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`qf-vr-opt${active ? ' qf-vr-opt--on' : ''}${opt.icon ? ' qf-vr-opt--icon' : ''}${opt.swatch ? ' qf-vr-opt--swatch' : ''}${isText ? ' qf-vr-opt--chip' : ''}`}
            style={active ? { borderColor: hex } : undefined}
            onClick={() => onChange(field.id, active ? '' : opt.value)}
            title={opt.value}
          >
            {opt.swatch && <span className="qf-vr-swatch" style={{ background: opt.swatch }} aria-hidden="true" />}
            {opt.icon && (
              <span
                className="qf-vr-icon"
                style={active ? { color: hex } : undefined}
                dangerouslySetInnerHTML={{ __html: opt.icon }}
                aria-hidden="true"
              />
            )}
            <span className="qf-vr-lbl" style={active ? { color: hex } : undefined}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SizeGrid({ field, vals, onChange, hex }: {
  field: FieldDef; vals: Record<string, string>;
  onChange: (id: string, v: string) => void; hex: string;
}) {
  const sel = vals[field.id] ?? '';
  const sizes = field.sizes ?? [];
  const maxDim = Math.max(...sizes.flatMap(s => [s.w, s.h]), 1);
  const SCALE = 3.0;
  return (
    <div className="qf-sg">
      <div className="qf-sg-row">
        {sizes.map(size => {
          const key = `${size.w}x${size.h}`;
          const active = sel === key;
          const rw = (size.w / maxDim) * SCALE;
          const rh = (size.h / maxDim) * SCALE;
          return (
            <button key={key} type="button"
              className={`qf-sg-btn${active ? ' qf-sg-btn--on' : ''}`}
              style={active ? { borderColor: hex } : undefined}
              onClick={() => onChange(field.id, active ? '' : key)}
            >
              <span className="qf-sg-rect" style={{ width: `${rw}rem`, height: `${rh}rem`, borderColor: active ? hex : undefined }} />
              <span className="qf-sg-lbl" style={active ? { color: hex } : undefined}>{size.label}</span>
            </button>
          );
        })}
        {/* Custom */}
        <button type="button"
          className={`qf-sg-btn${sel === 'custom' ? ' qf-sg-btn--on' : ''}`}
          style={sel === 'custom' ? { borderColor: hex } : undefined}
          onClick={() => onChange(field.id, sel === 'custom' ? '' : 'custom')}
        >
          <span className="qf-sg-rect qf-sg-rect--custom" style={sel === 'custom' ? { borderColor: hex } : undefined} />
          <span className="qf-sg-lbl" style={sel === 'custom' ? { color: hex } : undefined}>Custom</span>
        </button>
      </div>
      {sel === 'custom' && (
        <div className="qf-dim-row">
          <input className="qf-input qf-input--sm" type="text" inputMode="decimal" placeholder="W"
            value={vals[`${field.id}_w`] ?? ''} onChange={e => onChange(`${field.id}_w`, e.target.value)} />
          <span className="qf-dim-x">×</span>
          <input className="qf-input qf-input--sm" type="text" inputMode="decimal" placeholder="H"
            value={vals[`${field.id}_h`] ?? ''} onChange={e => onChange(`${field.id}_h`, e.target.value)} />
          <span className="qf-dim-unit">in</span>
        </div>
      )}
    </div>
  );
}

function DimPair({ field, vals, onChange }: {
  field: FieldDef; vals: Record<string, string>;
  onChange: (id: string, v: string) => void;
}) {
  return (
    <div className="qf-dim-row">
      <input className="qf-input qf-input--sm" type="text" inputMode="decimal" placeholder="Width"
        value={vals[`${field.id}_w`] ?? ''} onChange={e => onChange(`${field.id}_w`, e.target.value)} />
      <span className="qf-dim-x">×</span>
      <input className="qf-input qf-input--sm" type="text" inputMode="decimal" placeholder="Height"
        value={vals[`${field.id}_h`] ?? ''} onChange={e => onChange(`${field.id}_h`, e.target.value)} />
      <span className="qf-dim-unit">in</span>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export default function QuoteForm({ mode = 'quote', bmsUrl }: { mode?: Mode; bmsUrl?: string }) {
  const [svcIdx,   setSvcIdx]   = useState(0);
  const [vals,     setVals]     = useState<Record<string, string>>({});
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [notes,    setNotes]    = useState('');
  const [shipping, setShipping] = useState('');

  const [artFile,      setArtFile]      = useState<File | null>(null);
  const [artErr,       setArtErr]       = useState('');
  const [dragOver,     setDragOver]     = useState(false);
  const [noArtwork,    setNoArtwork]    = useState(false);
  const [artNotes,     setArtNotes]     = useState('');

  const [errs,   setErrs]   = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [reqNum, setReqNum] = useState('');

  const loadTs      = useRef(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);

  useEffect(() => { loadTs.current = Date.now(); }, []);

  const svc = SERVICES[svcIdx];
  const set = (id: string, v: string) => setVals(p => ({ ...p, [id]: v }));
  const darkText = svc.hex === '#FFF200' || svc.hex === '#F5F0E8';

  function applyFile(file: File) {
    setArtErr('');
    if (file.size > MAX_FILE_BYTES) { setArtErr('File too large — 20 MB max.'); return; }
    setArtFile(file);
  }
  function removeFile() {
    setArtFile(null); setArtErr('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim())  next.name  = 'Name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'A valid email is required.';
    if (mode === 'sample' && !shipping.trim()) next.shipping = 'Shipping address is required.';
    setErrs(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypotRef.current?.value) return;
    if (Date.now() - loadTs.current < 3000) return;
    if (!validate()) return;

    setStatus('submitting'); setErrMsg('');

    let comments: string;
    if (mode === 'sample') {
      const parts = ['SAMPLE PACK REQUEST', `Shipping: ${shipping.trim()}`];
      if (notes.trim()) { parts.push('--- Customer notes ---'); parts.push(notes.trim()); }
      comments = parts.join('\n');
    } else {
      comments = buildSummary(svc, vals, notes, noArtwork, artNotes);
    }

    const payload: Record<string, string | number> = {
      customer_name: name.trim(),
      email: email.trim(),
      comments,
      source: 'website',
    };
    if (phone.trim()) payload.phone = phone.trim();

    if (mode === 'quote') {
      payload.product_type = svc.label;
      payload.qty = 1;
      for (const f of svc.fields) {
        if (f.kind === 'dim_pair') {
          const w = parseFloat(vals[`${f.id}_w`] || '');
          const h = parseFloat(vals[`${f.id}_h`] || '');
          if (!isNaN(w)) payload.width_in  = w;
          if (!isNaN(h)) payload.height_in = h;
        } else if (f.kind === 'size_grid') {
          const sel = vals[f.id];
          if (sel === 'custom') {
            const w = parseFloat(vals[`${f.id}_w`] || '');
            const h = parseFloat(vals[`${f.id}_h`] || '');
            if (!isNaN(w)) payload.width_in  = w;
            if (!isNaN(h)) payload.height_in = h;
          } else if (sel) {
            const [ws, hs] = sel.split('x');
            const w = parseFloat(ws); const h = parseFloat(hs);
            if (!isNaN(w)) payload.width_in  = w;
            if (!isNaN(h)) payload.height_in = h;
          }
        } else if (f.kind === 'number' && f.mapsTo === 'qty') {
          const q = parseInt(vals[f.id] || '1', 10);
          payload.qty = isNaN(q) ? 1 : q;
        } else if (f.mapsTo === 'budget') {
          const v = vals[f.id];
          if (v) payload.budget = v;
        }
      }
    }

    if (artFile && !noArtwork) {
      try {
        payload.artwork_base64   = await readAsBase64(artFile);
        payload.artwork_filename = artFile.name;
      } catch { /* non-fatal */ }
    }

    const endpoint =
      bmsUrl
      || (typeof import.meta !== 'undefined' && (import.meta as Record<string, unknown>).env
          ? (import.meta as Record<string, Record<string, string>>).env.PUBLIC_BMS_REQUEST_URL
          : undefined)
      || 'https://bms.ohsigns.shop/api/public/requests';

    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { success: boolean; req_num?: string };
      setReqNum(data.req_num ?? '');
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrMsg("Something went wrong. Email us at hello@ohsigns.shop and we'll sort it out.");
      setStatus('error');
    }
  }

  /* ── Success ─────────────────────────────────────────────────────────────── */
  if (status === 'success') {
    return (
      <div className="qf-success" role="status">
        <p className="qf-success-stage">{mode === 'sample' ? 'SAMPLE REQUEST RECEIVED' : 'QUOTE REQUEST RECEIVED'}</p>
        <h2 className="qf-success-title">{mode === 'sample' ? "You're on the list." : "We've got it."}</h2>
        {reqNum && (
          <div className="qf-success-ref">
            <span className="qf-ref-label">Your reference number</span>
            <span className="qf-ref-num">{reqNum}</span>
          </div>
        )}
        <p className="qf-success-body">
          {mode === 'sample'
            ? 'Sample pack ships within 1–2 business days.'
            : "Hold onto this reference — you'll hear from us within one business day."}
        </p>
        <button className="qf-reset-btn" onClick={() => {
          setName(''); setEmail(''); setPhone(''); setNotes(''); setShipping('');
          setVals({}); setArtFile(null); setArtNotes(''); setNoArtwork(false);
          setErrs({}); setStatus('idle'); setReqNum('');
        }}>Submit another request</button>
      </div>
    );
  }

  /* ── Form ────────────────────────────────────────────────────────────────── */
  return (
    <form className="qf-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* ── Tabs (quote mode only) */}
      {mode === 'quote' && (
        <div className="qf-tabs" role="tablist" aria-label="Service type">
          {SERVICES.map((s, i) => (
            <button
              key={s.id} type="button" role="tab" aria-selected={i === svcIdx}
              className={`qf-tab${i === svcIdx ? ' qf-tab--on' : ''}`}
              style={i === svcIdx ? { background: s.hex, borderColor: s.hex, color: (s.hex === '#FFF200' || s.hex === '#F5F0E8') ? '#0A0A0A' : '#ffffff' } : undefined}
              onClick={() => setSvcIdx(i)}
            >{s.label}</button>
          ))}
        </div>
      )}

      {/* ── Contact */}
      <fieldset className="qf-fieldset">
        <legend className="qf-legend">Contact</legend>
        <div className="qf-row-2">
          <label className="qf-field">
            <span className="qf-label">Name <span className="qf-req" aria-hidden="true">*</span></span>
            <input className={`qf-input${errs.name ? ' qf-input--err' : ''}`} type="text" value={name}
              onChange={e => { setName(e.target.value); setErrs(p => ({ ...p, name: '' })); }}
              placeholder="Jane Doe" autoComplete="name" />
            {errs.name && <p className="qf-err" role="alert">{errs.name}</p>}
          </label>
          <label className="qf-field">
            <span className="qf-label">Email <span className="qf-req" aria-hidden="true">*</span></span>
            <input className={`qf-input${errs.email ? ' qf-input--err' : ''}`} type="email" value={email}
              onChange={e => { setEmail(e.target.value); setErrs(p => ({ ...p, email: '' })); }}
              placeholder="jane@company.com" autoComplete="email" />
            {errs.email && <p className="qf-err" role="alert">{errs.email}</p>}
          </label>
        </div>
        <label className="qf-field">
          <span className="qf-label">Phone <span className="qf-opt">(optional)</span></span>
          <input className="qf-input" type="tel" value={phone}
            onChange={e => setPhone(e.target.value)} placeholder="(555) 555-5555" autoComplete="tel" />
        </label>
      </fieldset>

      {/* ── Service fields (quote mode) */}
      {mode === 'quote' && (
        <fieldset className="qf-fieldset">
          <legend className="qf-legend" style={{ borderBottomColor: `${svc.hex}33` }}>{svc.label}</legend>
          {svc.fields.map(f => (
            <div key={f.id} className="qf-field">
              <span className="qf-label">
                {f.label}
                {f.optional && <span className="qf-opt"> (optional)</span>}
              </span>
              {f.kind === 'visual_radio' && <VisualRadio field={f} vals={vals} onChange={set} hex={svc.hex} />}
              {f.kind === 'size_grid'    && <SizeGrid    field={f} vals={vals} onChange={set} hex={svc.hex} />}
              {f.kind === 'dim_pair'     && <DimPair     field={f} vals={vals} onChange={set} />}
              {f.kind === 'number'       && (
                <input className="qf-input" type="text" inputMode="numeric"
                  placeholder={f.placeholder ?? '1'} value={vals[f.id] ?? ''}
                  onChange={e => set(f.id, e.target.value)} />
              )}
              {f.kind === 'text' && (
                <input className="qf-input" type="text"
                  placeholder={f.placeholder ?? ''} value={vals[f.id] ?? ''}
                  onChange={e => set(f.id, e.target.value)} />
              )}
              {f.kind === 'textarea' && (
                <textarea className="qf-textarea" rows={f.rows ?? 4}
                  placeholder={f.placeholder ?? ''} value={vals[f.id] ?? ''}
                  onChange={e => set(f.id, e.target.value)} />
              )}
            </div>
          ))}
        </fieldset>
      )}

      {/* ── Artwork */}
      <fieldset className="qf-fieldset">
        <legend className="qf-legend">{mode === 'sample' ? 'Have artwork to share?' : 'Artwork'}</legend>

        {mode === 'quote' && (
          <label className="qf-noart-toggle">
            <input type="checkbox" className="qf-toggle-cb" checked={noArtwork}
              onChange={e => { setNoArtwork(e.target.checked); if (e.target.checked) removeFile(); }} />
            <span className={`qf-toggle-box${noArtwork ? ' qf-toggle-box--on' : ''}`} aria-hidden="true" />
            <span className="qf-toggle-lbl">No artwork yet — I'll describe the idea</span>
          </label>
        )}

        {noArtwork ? (
          <textarea className="qf-textarea" rows={4} value={artNotes} onChange={e => setArtNotes(e.target.value)}
            placeholder="Tell us about your idea — style, colors, references, anything that helps us visualize it." />
        ) : (
          <>
            <div
              className={`qf-dropzone${dragOver ? ' qf-dropzone--over' : ''}${artFile ? ' qf-dropzone--filled' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) applyFile(f); }}
              onClick={() => fileRef.current?.click()}
              role="button" tabIndex={0} aria-label="Upload artwork file"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click(); }}
            >
              <input ref={fileRef} type="file" accept={ACCEPT_EXT}
                onChange={e => { const f = e.target.files?.[0]; if (f) applyFile(f); }}
                style={{ display: 'none' }} aria-hidden="true" />
              {artFile ? (
                <div className="qf-file-attached">
                  <span className="qf-file-name">{artFile.name}</span>
                  <span className="qf-file-size">({(artFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                  <button type="button" className="qf-file-remove"
                    onClick={e => { e.stopPropagation(); removeFile(); }} aria-label="Remove file">
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div className="qf-dropzone-prompt">
                  <span className="qf-dropzone-icon" aria-hidden="true">⊞</span>
                  <span className="qf-dropzone-text">Drop file here or <span className="qf-dropzone-link">click to attach</span></span>
                  <span className="qf-dropzone-formats">PNG · JPG · PDF · AI · SVG · EPS · 20 MB max</span>
                </div>
              )}
            </div>
            {artErr && <p className="qf-err" role="alert">{artErr}</p>}
            <p className="qf-field-hint">
              {mode === 'sample' ? 'Optional — share a reference or project you have in mind.' : 'Optional — AI, EPS, or print-ready PDF preferred.'}
            </p>
          </>
        )}
      </fieldset>

      {/* ── Shipping (sample mode) */}
      {mode === 'sample' && (
        <fieldset className="qf-fieldset">
          <legend className="qf-legend">Shipping</legend>
          <label className="qf-field">
            <span className="qf-label">Shipping address <span className="qf-req" aria-hidden="true">*</span></span>
            <input className={`qf-input${errs.shipping ? ' qf-input--err' : ''}`} type="text"
              value={shipping} onChange={e => { setShipping(e.target.value); setErrs(p => ({ ...p, shipping: '' })); }}
              placeholder="123 Main St, City, State ZIP" autoComplete="street-address" />
            {errs.shipping && <p className="qf-err" role="alert">{errs.shipping}</p>}
          </label>
        </fieldset>
      )}

      {/* ── Notes */}
      <fieldset className="qf-fieldset">
        <legend className="qf-legend">{mode === 'sample' ? 'What are you evaluating?' : 'Customer notes'}</legend>
        <textarea className="qf-textarea" rows={4} value={notes} onChange={e => setNotes(e.target.value)}
          placeholder={mode === 'sample'
            ? 'e.g. Evaluating substrate options for outdoor product labels'
            : 'Deadline, special requirements, questions — anything we should know.'} />
      </fieldset>

      {/* ── Error */}
      {status === 'error' && <div className="qf-form-error" role="alert">{errMsg}</div>}

      {/* ── Submit */}
      <div className="qf-submit-row">
        <button type="submit" className="qf-submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : mode === 'sample' ? 'Request Sample Pack' : 'Submit Quote Request'}
        </button>
        <p className="qf-disclaimer">No obligation. We'll review and respond within one business day.</p>
      </div>
    </form>
  );
}
