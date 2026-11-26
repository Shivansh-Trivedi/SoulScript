import { useEffect, useId, useRef } from 'react';
import brandLogo from '../assets/soulscript-logo.webp';

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return <button className={`button button--${variant} button--${size} ${className}`.trim()} {...props}>{children}</button>;
}

export function TextField({ label, hint, error, id: suppliedId, className = '', ...props }) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return <div className={`field ${className}`.trim()}>
    <label className="field__label" htmlFor={id}>{label}</label>
    <input id={id} className="input" aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} {...props} />
    {hint && <span className="field__hint" id={hintId}>{hint}</span>}
    {error && <span className="field__error" id={errorId}>{error}</span>}
  </div>;
}

export function Card({ className = '', as: Component = 'section', children, ...props }) {
  return <Component className={`card ${className}`.trim()} {...props}>{children}</Component>;
}
export function Badge({ tone = 'neutral', children }) { return <span className={`badge badge--${tone}`}>{children}</span>; }
export function LoadingState({ label = 'Loading' }) { return <div className="state state--loading" role="status"><span className="spinner" aria-hidden="true" />{label}</div>; }
export function EmptyState({ title, children, action }) { return <div className="state state--empty"><span className="state__icon" aria-hidden="true">✳</span><h3>{title}</h3><p>{children}</p>{action}</div>; }
export function ErrorState({ title = 'Something went wrong', children, action }) { return <div className="state state--error" role="alert"><span className="state__icon" aria-hidden="true">!</span><h3>{title}</h3><p>{children}</p>{action}</div>; }
export function Toast({ tone = 'success', children, onDismiss }) {
  return <div className={`toast toast--${tone}`} role={tone === 'error' ? 'alert' : 'status'}><span>{children}</span>{onDismiss && <button className="toast__dismiss" type="button" aria-label="Dismiss notification" onClick={onDismiss}>×</button>}</div>;
}

export function Modal({ title, children, onClose, actions }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll('button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    focusable?.[0]?.focus();
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'Tab' && focusable?.length) {
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previousFocus?.focus?.(); };
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef}>
      <header className="modal__header"><h2 id={titleId}>{title}</h2><button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}>×</button></header>
      <div className="modal__body">{children}</div>{actions && <footer className="modal__actions">{actions}</footer>}
    </section>
  </div>;
}

export function Brand({ compact = false }) {
  return <span className={`brand ${compact ? 'brand--compact' : ''}`}><span className="brand__art"><img src={brandLogo} alt="SoulScript" /></span></span>;
}
