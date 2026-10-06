'use client';

import { cloneElement, isValidElement, useEffect, useState, type ReactElement } from 'react';

/* ────────────────────────────────────────────────────────────────────────────
   Admin UI primitives.
   Everything here exists to make the panel forgiving: every input carries a
   hint, every section says what it is for, every save confirms itself.
   ──────────────────────────────────────────────────────────────────────────── */

let toastId = 0;
const toastListeners = new Set<(message: string, tone: 'success' | 'error') => void>();

/** Fire a toast from anywhere in the admin. Errors read differently from saves. */
export function notify(message: string, tone: 'success' | 'error' = 'success'): void {
  toastListeners.forEach((fn) => fn(message, tone));
}

export function AdminToast() {
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = (message: string, tone: 'success' | 'error') => {
      setToast({ message, tone });
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 3500);
    };
    toastListeners.add(show);
    return () => {
      toastListeners.delete(show);
      clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-tone={toast.tone}
      className="admin-toast fixed bottom-6 right-6 z-[100] text-sm px-5 py-3.5 shadow-2xl flex items-center gap-3"
    >
      <span
        aria-hidden
        className="inline-flex h-5 w-5 items-center justify-center bg-white text-xs font-bold"
        style={{ color: 'var(--color-accent-text)' }}
      >
        {toast.tone === 'error' ? '!' : '✓'}
      </span>
      {toast.message}
    </div>
  );
}

/** A numbered card. The number is the visual cue that this is a step, not a wall of fields. */
export function AdminSection({
  step,
  title,
  description,
  children,
  action,
}: {
  step?: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
          {step !== undefined && (
            <span
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                flexShrink: 0,
                background: '#030302',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {step}
            </span>
          )}
          <h2 className="admin-panel-title" style={{ margin: 0 }}>
            {title}
          </h2>
        </div>
        {action}
      </div>

      {description && (
        <p className="admin-section-desc">{description}</p>
      )}

      <div className="admin-panel-body">{children}</div>
    </section>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  /** Rendered under the control — e.g. a character counter or a live preview. */
  note?: React.ReactNode;
};

/**
 * Wraps a control with a label, a hint that answers "what do I type here?", and
 * an error slot. The hint is always present if given — never a placeholder, so
 * it stays readable once the field has a value.
 */
export function AdminField({ label, hint, error, required, children, note }: FieldProps) {
  const fieldId = `admin-field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  const childElement = isValidElement(children)
    ? (children as ReactElement<Record<string, unknown>>)
    : null;
  const control = childElement
    ? cloneElement(childElement, {
        id: childElement.props.id ?? fieldId,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })
    : children;
  const controlId = childElement && typeof childElement.props.id === 'string'
    ? childElement.props.id
    : fieldId;

  return (
    <div className="admin-field">
      <label className="admin-label" htmlFor={childElement ? controlId : undefined}>
        {label}
        {required && (
          <span style={{ color: '#B42318', marginLeft: 4 }} aria-label="required">
            *
          </span>
        )}
      </label>
      {control}
      {hint && !error && <p id={`${fieldId}-hint`} className="admin-hint">{hint}</p>}
      {error && (
        <p id={`${fieldId}-error`} className="admin-hint" style={{ color: '#B42318', marginTop: 6 }} role="alert">
          {error}
        </p>
      )}
      {note}
    </div>
  );
}

export function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input className={`admin-input ${className ?? ''}`.trim()} {...rest} />;
}

export function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea className={`admin-input ${className ?? ''}`.trim()} {...rest} />;
}

export function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select className={`admin-input admin-select ${className ?? ''}`.trim()} {...rest}>
      {children}
    </select>
  );
}

/** On/off switch with a plain-language label so the state is never ambiguous. */
export function AdminToggle({
  checked,
  onChange,
  labelOn,
  labelOff,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  labelOn: string;
  labelOff: string;
  hint?: string;
}) {
  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="admin-btn admin-btn--sm"
        style={
          checked
            ? { backgroundColor: '#030302', color: '#fff' }
            : { backgroundColor: '#fff', color: '#030302', border: '1px solid rgb(211 206 197)' }
        }
      >
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            marginRight: 8,
            background: checked ? '#4ADE80' : '#A1A1AA',
          }}
        />
        {checked ? labelOn : labelOff}
      </button>
      {hint && <p className="admin-hint">{hint}</p>}
    </div>
  );
}

/** Form-level actions. `dirty` drives whether Save is even offered. */
export function AdminActions({
  onSave,
  onCancel,
  saving,
  dirty,
  saveLabel = 'Save changes',
}: {
  onSave: () => void;
  onCancel?: () => void;
  saving?: boolean;
  dirty: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="admin-actions">
      {onCancel && (
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>
          Cancel
        </button>
      )}
      <button
        type="button"
        className="admin-btn"
        disabled={!dirty || saving}
        onClick={onSave}
        title={!dirty ? 'Nothing has changed yet' : undefined}
      >
        {saving ? 'Saving…' : dirty ? saveLabel : 'No changes'}
      </button>
    </div>
  );
}

/** Used by editors that build an absolute Cloudinary/m media URL from a path. */
export function withFallback(src: string | null | undefined, fallback: string): string {
  return src && src.trim() ? src : fallback;
}

/** Monotonic id helper for optimistic list keys. */
export function nextId(): string {
  toastId += 1;
  return `tmp-${toastId}`;
}
