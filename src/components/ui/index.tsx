import Link from "next/link";
import { AlertCircle, ArrowRight, Inbox, LoaderCircle, RotateCcw } from "lucide-react";
import { clsx } from "clsx";

export function Button({ className, tone = "primary", busy, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "secondary" | "ghost" | "danger"; busy?: boolean }) {
  return <button className={clsx("button", `button--${tone}`, className)} disabled={props.disabled || busy} {...props}>{busy && <LoaderCircle className="spin" size={17} />}{children}</button>;
}

export function LinkButton({ href, children, tone = "primary", className }: { href: string; children: React.ReactNode; tone?: "primary" | "secondary" | "ghost"; className?: string }) {
  return <Link className={clsx("button", `button--${tone}`, className)} href={href}>{children}<ArrowRight size={16} /></Link>;
}

export function StatusPill({ value }: { value: string }) {
  return <span className={`status-pill status-pill--${value}`}>{value.replaceAll("_", " ")}</span>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="page-header__action">{action}</div>}</div>;
}

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return <div className="skeleton-stack" aria-label="Loading">{Array.from({ length: rows }, (_, index) => <div className="skeleton-card" key={index}><span /><span /><span /></div>)}</div>;
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return <div className="state-card"><span className="state-card__icon"><Inbox /></span><h3>{title}</h3><p>{message}</p>{action}</div>;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return <div className="state-card state-card--error"><span className="state-card__icon"><AlertCircle /></span><h3>{title}</h3><p>{message}</p>{onRetry && <Button tone="secondary" onClick={onRetry}><RotateCcw size={16} />Try again</Button>}</div>;
}

export function MetricCard({ label, value, hint, tone = "gold" }: { label: string; value: string | number; hint: string; tone?: string }) {
  return <div className={`metric-card metric-card--${tone}`}><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>;
}

export function Field({ label, error, hint, children, required }: { label: string; error?: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return <label className="field"><span className="field__label">{label}{required && <b aria-hidden="true"> *</b>}</span>{children}{error ? <span className="field__error">{error}</span> : hint ? <span className="field__hint">{hint}</span> : null}</label>;
}
