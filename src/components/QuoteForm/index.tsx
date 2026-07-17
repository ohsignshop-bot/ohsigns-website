import { useState, useRef, useCallback, useEffect } from 'react';

type Mode = 'quote' | 'sample';

interface Props {
  mode?: Mode;
  bmsUrl?: string;
}

interface FormState {
  customer_name: string;
  email: string;
  phone: string;
  product_type: string;
  width_in: string;
  height_in: string;
  qty: string;
  budget: string;
  comments: string;
  shipping_address: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

const PRODUCT_TYPES = [
  'Die-cut decals / stickers',
  'UV-printed hard goods (acrylic, wood, metal, PVC)',
  'Fine-art / archival print',
  'Design services',
  'Other / Custom',
];

const BUDGET_RANGES = [
  'Under $100',
  '$100 – $250',
  '$250 – $500',
  '$500 – $1,000',
  '$1,000 – $2,500',
  '$2,500+',
  'Not sure yet',
];

const ACCEPT_EXT = '.png,.jpg,.jpeg,.pdf,.ai,.svg,.eps';
const MAX_FILE_BYTES = 20 * 1024 * 1024;

const EMPTY: FormState = {
  customer_name: '',
  email: '',
  phone: '',
  product_type: '',
  width_in: '',
  height_in: '',
  qty: '1',
  budget: '',
  comments: '',
  shipping_address: '',
};

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function Field({
  label, required, optional, error, children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="qf-field">
      <label className="qf-label">
        {label}
        {required && <span className="qf-req" aria-hidden="true"> *</span>}
        {optional && <span className="qf-opt"> (optional)</span>}
      </label>
      {children}
      {error && <p className="qf-err" role="alert">{error}</p>}
    </div>
  );
}

export default function QuoteForm({ mode = 'quote', bmsUrl }: Props) {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [errors, setErrors]   = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus]   = useState<Status>('idle');
  const [errMsg, setErrMsg]   = useState('');
  const [reqNum, setReqNum]   = useState('');
  const [artworkFile, setArtworkFile]   = useState<File | null>(null);
  const [artworkErr, setArtworkErr]     = useState('');
  const [dragOver, setDragOver]         = useState(false);

  const loadTs      = useRef(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset load timestamp on mount (SSR-safe)
  useEffect(() => { loadTs.current = Date.now(); }, []);

  const update = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      },
    [],
  );

  function applyFile(file: File) {
    setArtworkErr('');
    if (file.size > MAX_FILE_BYTES) {
      setArtworkErr('File too large — 20 MB max.');
      return;
    }
    setArtworkFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  }

  function removeFile() {
    setArtworkFile(null);
    setArtworkErr('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.customer_name.trim())
      next.customer_name = 'Name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'A valid email is required.';
    if (!form.comments.trim())
      next.comments = 'Please describe your project.';
    if (mode === 'sample' && !form.shipping_address.trim())
      next.shipping_address = 'Shipping address is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Bot guards
    if (honeypotRef.current?.value) return;
    if (Date.now() - loadTs.current < 3000) return;

    if (!validate()) return;

    setStatus('submitting');
    setErrMsg('');

    let comments = form.comments.trim();
    if (mode === 'sample') {
      comments = `SAMPLE PACK REQUEST\nShipping address: ${form.shipping_address.trim()}\n\n${comments}`;
    }

    const payload: Record<string, string | number> = {
      customer_name: form.customer_name.trim(),
      email: form.email.trim(),
      comments,
      source: 'website',
    };

    if (form.phone.trim()) payload.phone = form.phone.trim();

    if (mode === 'quote') {
      if (form.product_type)   payload.product_type = form.product_type;
      if (form.width_in.trim())  payload.width_in  = parseFloat(form.width_in)  || form.width_in.trim();
      if (form.height_in.trim()) payload.height_in = parseFloat(form.height_in) || form.height_in.trim();
      payload.qty = parseInt(form.qty, 10) || 1;
      if (form.budget)         payload.budget = form.budget;
    }

    if (artworkFile) {
      try {
        payload.artwork_base64   = await readAsBase64(artworkFile);
        payload.artwork_filename = artworkFile.name;
      } catch {
        // Non-fatal: submit without artwork
      }
    }

    const endpoint =
      bmsUrl
      || (typeof import.meta !== 'undefined' && (import.meta as Record<string, unknown>).env
          ? (import.meta as Record<string, Record<string, string>>).env.PUBLIC_BMS_REQUEST_URL
          : undefined)
      || 'https://bms.ohsigns.shop/api/public/requests';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { success: boolean; req_num?: string };
      setReqNum(data.req_num ?? '');
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrMsg('Something went wrong. Email us at hello@ohsigns.shop and we\'ll sort it out.');
      setStatus('error');
    }
  }

  // ── Success state ───────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="qf-success" role="status">
        <p className="qf-success-stage">
          {mode === 'sample' ? 'SAMPLE REQUEST RECEIVED' : 'QUOTE REQUEST RECEIVED'}
        </p>
        <h2 className="qf-success-title">
          {mode === 'sample' ? "You're on the list." : "We've got it."}
        </h2>
        {reqNum && (
          <div className="qf-success-ref">
            <span className="qf-ref-label">Your reference number</span>
            <span className="qf-ref-num">{reqNum}</span>
          </div>
        )}
        <p className="qf-success-body">
          {mode === 'sample'
            ? "Sample pack ships within 1–2 business days."
            : "Hold onto this reference — you'll hear from us within one business day."}
        </p>
        <button
          className="qf-reset-btn"
          onClick={() => { setForm(EMPTY); setErrors({}); setStatus('idle'); setReqNum(''); setArtworkFile(null); }}
        >
          Submit another request
        </button>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <form className="qf-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot — hidden from humans and screen readers */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="qf-website">Website</label>
        <input
          ref={honeypotRef}
          type="text"
          id="qf-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* ── Contact ────────────────────────────────────────────────────────── */}
      <fieldset className="qf-fieldset">
        <legend className="qf-legend">Contact</legend>
        <div className="qf-row-2">
          <Field label="Name" required error={errors.customer_name}>
            <input
              className={`qf-input${errors.customer_name ? ' qf-input--err' : ''}`}
              type="text"
              value={form.customer_name}
              onChange={update('customer_name')}
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Email" required error={errors.email}>
            <input
              className={`qf-input${errors.email ? ' qf-input--err' : ''}`}
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="jane@company.com"
              autoComplete="email"
              required
            />
          </Field>
        </div>
        <Field label="Phone" optional>
          <input
            className="qf-input"
            type="tel"
            value={form.phone}
            onChange={update('phone')}
            placeholder="(555) 555-5555"
            autoComplete="tel"
          />
        </Field>
      </fieldset>

      {/* ── Project (quote mode only) ───────────────────────────────────────── */}
      {mode === 'quote' && (
        <fieldset className="qf-fieldset">
          <legend className="qf-legend">Project</legend>

          <Field label="What do you need?" optional>
            <select
              className="qf-select"
              value={form.product_type}
              onChange={update('product_type')}
            >
              <option value="">— Select a type —</option>
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>

          <div className="qf-row-3">
            <Field label="Width (in)" optional>
              <input
                className="qf-input"
                type="text"
                value={form.width_in}
                onChange={update('width_in')}
                placeholder="e.g. 4"
                inputMode="decimal"
              />
            </Field>
            <Field label="Height (in)" optional>
              <input
                className="qf-input"
                type="text"
                value={form.height_in}
                onChange={update('height_in')}
                placeholder="e.g. 3"
                inputMode="decimal"
              />
            </Field>
            <Field label="Quantity" optional>
              <input
                className="qf-input"
                type="text"
                value={form.qty}
                onChange={update('qty')}
                placeholder="1"
                inputMode="numeric"
              />
            </Field>
          </div>

          <Field label="Budget" optional>
            <select
              className="qf-select"
              value={form.budget}
              onChange={update('budget')}
            >
              <option value="">— Select a range —</option>
              {BUDGET_RANGES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
        </fieldset>
      )}

      {/* ── Artwork upload ──────────────────────────────────────────────────── */}
      <fieldset className="qf-fieldset">
        <legend className="qf-legend">
          {mode === 'sample' ? 'Have artwork to share?' : 'Artwork'}
        </legend>

        {/* Die-cut drop zone */}
        <div
          className={`qf-dropzone${dragOver ? ' qf-dropzone--over' : ''}${artworkFile ? ' qf-dropzone--filled' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload artwork file"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_EXT}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-hidden="true"
          />
          {artworkFile ? (
            <div className="qf-file-attached">
              <span className="qf-file-name">{artworkFile.name}</span>
              <span className="qf-file-size">({(artworkFile.size / 1024 / 1024).toFixed(1)} MB)</span>
              <button
                type="button"
                className="qf-file-remove"
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                aria-label="Remove attached file"
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <div className="qf-dropzone-prompt">
              <span className="qf-dropzone-icon" aria-hidden="true">⊞</span>
              <span className="qf-dropzone-text">
                Drop file here or <span className="qf-dropzone-link">click to attach</span>
              </span>
              <span className="qf-dropzone-formats">PNG, JPG, PDF, AI, SVG, EPS · 20 MB max</span>
            </div>
          )}
        </div>
        {artworkErr && <p className="qf-err" role="alert">{artworkErr}</p>}
        <p className="qf-field-hint">
          {mode === 'sample'
            ? 'Optional — share a reference or project you have in mind.'
            : "Optional — AI, EPS, or PDF preferred. We'll tell you if it needs prep."}
        </p>
      </fieldset>

      {/* ── Shipping (sample mode only) ────────────────────────────────────── */}
      {mode === 'sample' && (
        <fieldset className="qf-fieldset">
          <legend className="qf-legend">Shipping</legend>
          <Field label="Shipping address" required error={errors.shipping_address}>
            <input
              className={`qf-input${errors.shipping_address ? ' qf-input--err' : ''}`}
              type="text"
              value={form.shipping_address}
              onChange={update('shipping_address')}
              placeholder="123 Main St, City, State ZIP"
              autoComplete="street-address"
              required
            />
          </Field>
        </fieldset>
      )}

      {/* ── Notes ──────────────────────────────────────────────────────────── */}
      <fieldset className="qf-fieldset">
        <legend className="qf-legend">
          {mode === 'sample' ? 'What are you evaluating?' : 'Project notes'}
        </legend>
        <Field
          label="Tell us what you need"
          required
          error={errors.comments}
        >
          <textarea
            className={`qf-textarea${errors.comments ? ' qf-input--err' : ''}`}
            value={form.comments}
            onChange={update('comments')}
            placeholder={
              mode === 'sample'
                ? 'e.g. Evaluating substrate options for outdoor product labels'
                : 'Describe your project — material preferences, deadline, intended use, anything that helps us quote accurately.'
            }
            rows={5}
          />
        </Field>
      </fieldset>

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {status === 'error' && (
        <div className="qf-form-error" role="alert">
          {errMsg}
        </div>
      )}

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <div className="qf-submit-row">
        <button
          type="submit"
          className="qf-submit"
          disabled={status === 'submitting'}
        >
          {status === 'submitting'
            ? 'Sending…'
            : mode === 'sample'
              ? 'Request Sample Pack'
              : 'Submit Quote Request'}
        </button>
        <p className="qf-disclaimer">
          No obligation. We'll review your request and respond with a quote — usually within one business day.
        </p>
      </div>
    </form>
  );
}
