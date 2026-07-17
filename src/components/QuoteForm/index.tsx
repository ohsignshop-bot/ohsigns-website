import { useState, useRef, useCallback } from 'react';

type Mode = 'quote' | 'sample';

interface Props {
  mode?: Mode;
  bmsUrl?: string;
}

interface FormState {
  customer_name: string;
  email: string;
  phone: string;
  company: string;
  product_type: string;
  quantity: string;
  width_inches: string;
  height_inches: string;
  material: string;
  comments: string;
  // sample-pack extras
  shipping_address: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

const PRODUCT_TYPES = [
  'Decals / Stickers',
  'Vehicle Wrap or Decal',
  'UV Print (rigid substrate)',
  'Storefront / Window Signage',
  'Floor Graphics',
  'Design Services',
  'Other / Not Sure',
];

const MATERIALS = [
  "Not sure — help me choose",
  'Cut vinyl (standard)',
  'Printed vinyl (CMYK)',
  'Window perforated film',
  'Acrylic (UV print)',
  'Aluminium composite (UV print)',
  'PVC foam board (UV print)',
  'Wood / other rigid substrate',
  'Floor-rated vinyl',
];

const EMPTY: FormState = {
  customer_name: '',
  email: '',
  phone: '',
  company: '',
  product_type: '',
  quantity: '',
  width_inches: '',
  height_inches: '',
  material: '',
  comments: '',
  shipping_address: '',
};

function Field({ label, required, optional, children }: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="qf-field">
      <label className="qf-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
        {optional && <span className="qf-optional"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

export default function QuoteForm({ mode = 'quote', bmsUrl }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');
  const loadTs = useRef(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);

  const update = useCallback((field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    }, [errors]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.customer_name.trim()) next.customer_name = 'Name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'A valid email is required.';
    if (mode === 'quote' && !form.product_type)
      next.product_type = 'Please select a product type.';
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

    let comments = form.comments.trim();

    if (mode === 'sample') {
      comments = `SAMPLE PACK REQUEST\nShipping address: ${form.shipping_address.trim()}\n\n${comments}`;
    }

    const payload: Record<string, string | number> = {
      customer_name: form.customer_name.trim(),
      email: form.email.trim(),
      comments,
    };
    if (form.phone.trim())    payload.phone    = form.phone.trim();
    if (form.company.trim())  payload.company  = form.company.trim();
    if (mode === 'quote') {
      if (form.product_type)       payload.product_type  = form.product_type;
      if (form.quantity.trim())    payload.quantity       = form.quantity.trim();
      if (form.width_inches.trim())  payload.width_inches  = form.width_inches.trim();
      if (form.height_inches.trim()) payload.height_inches = form.height_inches.trim();
      if (form.material)           payload.material       = form.material;
    }

    const endpoint = bmsUrl
      || (typeof import.meta !== 'undefined' && (import.meta as Record<string, unknown>).env
          ? ((import.meta as Record<string, Record<string, string>>).env.PUBLIC_BMS_REQUEST_URL)
          : undefined)
      || 'https://bms.ohsigns.shop/api/public/requests';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrMsg('Something went wrong. Please email us at hello@ohsigns.shop.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="qf-success" role="status">
        <div className="qf-success-icon" aria-hidden="true">&#10003;</div>
        <h2 className="qf-success-title">
          {mode === 'sample' ? 'Sample pack request received!' : 'Quote request received!'}
        </h2>
        <p className="qf-success-body">
          {mode === 'sample'
            ? "We'll get your sample pack out within 1–2 business days."
            : "We'll get back to you within one business day — usually faster."}
        </p>
        <button
          className="qf-reset-btn"
          onClick={() => { setForm(EMPTY); setErrors({}); setStatus('idle'); }}
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form className="qf-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="qf-website">Website</label>
        <input ref={honeypotRef} type="text" id="qf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="qf-section">
        <p className="qf-section-label">About you</p>
        <div className="qf-row-2">
          <Field label="Name" required>
            <input
              className={`qf-input${errors.customer_name ? ' qf-input--err' : ''}`}
              type="text"
              value={form.customer_name}
              onChange={update('customer_name')}
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
            {errors.customer_name && <p className="qf-err">{errors.customer_name}</p>}
          </Field>
          <Field label="Email" required>
            <input
              className={`qf-input${errors.email ? ' qf-input--err' : ''}`}
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="jane@company.com"
              autoComplete="email"
              required
            />
            {errors.email && <p className="qf-err">{errors.email}</p>}
          </Field>
        </div>
        <div className="qf-row-2">
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
          <Field label="Company" optional>
            <input
              className="qf-input"
              type="text"
              value={form.company}
              onChange={update('company')}
              placeholder="Acme Co."
              autoComplete="organization"
            />
          </Field>
        </div>
      </div>

      {mode === 'quote' && (
        <div className="qf-section">
          <p className="qf-section-label">Project details</p>
          <Field label="What do you need?" required>
            <select
              className={`qf-select${errors.product_type ? ' qf-input--err' : ''}`}
              value={form.product_type}
              onChange={update('product_type')}
              required
            >
              <option value="">— Select a product type —</option>
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.product_type && <p className="qf-err">{errors.product_type}</p>}
          </Field>
          <div className="qf-row-3">
            <Field label="Quantity" optional>
              <input
                className="qf-input"
                type="text"
                value={form.quantity}
                onChange={update('quantity')}
                placeholder="e.g. 100"
                inputMode="numeric"
              />
            </Field>
            <Field label='Width (inches)' optional>
              <input
                className="qf-input"
                type="text"
                value={form.width_inches}
                onChange={update('width_inches')}
                placeholder="e.g. 12"
                inputMode="decimal"
              />
            </Field>
            <Field label='Height (inches)' optional>
              <input
                className="qf-input"
                type="text"
                value={form.height_inches}
                onChange={update('height_inches')}
                placeholder="e.g. 8"
                inputMode="decimal"
              />
            </Field>
          </div>
          <Field label="Preferred material" optional>
            <select
              className="qf-select"
              value={form.material}
              onChange={update('material')}
            >
              <option value="">— Not sure yet —</option>
              {MATERIALS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {mode === 'sample' && (
        <div className="qf-section">
          <p className="qf-section-label">Shipping</p>
          <Field label="Shipping address" required>
            <input
              className={`qf-input${errors.shipping_address ? ' qf-input--err' : ''}`}
              type="text"
              value={form.shipping_address}
              onChange={update('shipping_address')}
              placeholder="123 Main St, City, State ZIP"
              autoComplete="street-address"
              required
            />
            {errors.shipping_address && <p className="qf-err">{errors.shipping_address}</p>}
          </Field>
        </div>
      )}

      <div className="qf-section">
        <p className="qf-section-label">
          {mode === 'sample' ? 'Anything specific you want to evaluate?' : 'Anything else we should know?'}
        </p>
        <Field label="Notes" optional>
          <textarea
            className="qf-textarea"
            value={form.comments}
            onChange={update('comments')}
            placeholder={
              mode === 'sample'
                ? 'e.g. Looking at material options for product labels on bottles'
                : 'e.g. I need these by a specific date, or I have existing artwork in AI format'
            }
            rows={4}
          />
        </Field>
      </div>

      {status === 'error' && (
        <div className="qf-form-error" role="alert">{errMsg}</div>
      )}

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
          No obligation. We'll review your request and reply with a quote — usually within one business day.
        </p>
      </div>
    </form>
  );
}
