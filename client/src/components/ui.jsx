import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X
} from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const variantClass =
    variant === 'secondary'
      ? 'btn-secondary'
      : variant === 'ghost'
        ? 'btn-ghost'
        : variant === 'destructive'
          ? 'btn-destructive'
          : variant === 'teal'
            ? 'btn-teal'
            : 'btn-primary';

  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {loading ? 'Working...' : children}
    </button>
  );
}

export function Card({ title, subtitle, action, children, className = '', style }) {
  return (
    <div className={`card ${className}`.trim()} style={style}>
      {(title || subtitle || action) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'neutral', className = '' }) {
  const variantClass =
    variant === 'indigo'
      ? 'badge-indigo'
      : variant === 'teal'
        ? 'badge-teal'
        : variant === 'warning'
          ? 'badge-warning'
          : variant === 'danger'
            ? 'badge-danger'
            : 'badge-neutral';

  return <span className={`badge ${variantClass} ${className}`.trim()}>{children}</span>;
}

export function ProgressBar({ value = 0, label, showPercent = true }) {
  const clamped = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  return (
    <div className="progress-wrapper" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      {(label || showPercent) && (
        <div className="progress-header">
          <span>{label}</span>
          {showPercent && <span>{clamped}%</span>}
        </div>
      )}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function SkillChip({ name, level, variant = 'default', onRemove }) {
  const styleClass =
    variant === 'matched'
      ? 'skill-chip-matched'
      : variant === 'missing'
        ? 'skill-chip-missing'
        : '';

  return (
    <span className={`skill-chip ${styleClass}`.trim()}>
      {variant === 'matched' && <CheckCircle2 size={13} />}
      {variant === 'missing' && <AlertCircle size={13} />}
      <span>{name}</span>
      {level && <span className="skill-chip-level">{level}</span>}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          style={{
            background: 'none',
            border: 'none',
            padding: '0 2px',
            cursor: 'pointer',
            color: 'inherit',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          <X size={13} />
        </button>
      )}
    </span>
  );
}

export function FormField({ label, helper, error, children }) {
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      {children}
      {error ? (
        <span className="form-error">{error}</span>
      ) : (
        helper && <span className="form-helper">{helper}</span>
      )}
    </div>
  );
}

export function EmptyState({ title, description, actionLabel, onAction, actionTo }) {
  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-soft)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Sparkles size={22} />
      </div>
      <h3 style={{ fontSize: 17 }}>{title}</h3>
      <p style={{ color: 'var(--color-muted)', maxWidth: 460, fontSize: 14 }}>{description}</p>
      {actionTo && (
        <Link to={actionTo} className="btn btn-primary" style={{ marginTop: 4 }}>
          {actionLabel}
        </Link>
      )}
      {!actionTo && onAction && (
        <Button variant="primary" onClick={onAction} style={{ marginTop: 4 }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ lines = 3, height = 20 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton"
          style={{
            height,
            width: idx === lines - 1 && lines > 1 ? '68%' : '100%'
          }}
        />
      ))}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>{title}</h3>
        <p style={{ color: 'var(--color-muted)', fontSize: 14, marginBottom: 20 }}>
          {description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type === 'error' ? 'toast-error' : 'toast-success'}`}
        >
          <span>{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#CBD5E1',
              cursor: 'pointer',
              padding: 2
            }}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function InternshipCard({
  internship,
  basePath = '/app',
  onToggleSave,
  saving = false
}) {
  const score = internship.match?.score;
  const matchStatus = internship.match?.status;

  let scoreBadgeVariant = 'neutral';
  if (score !== null && score !== undefined) {
    if (score >= 75) scoreBadgeVariant = 'teal';
    else if (score >= 45) scoreBadgeVariant = 'indigo';
    else scoreBadgeVariant = 'warning';
  }

  const requiredNames = (internship.requiredSkills || []).map((r) =>
    typeof r === 'string' ? r : r.name
  );

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 16
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 8
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Badge variant="indigo">{internship.domain}</Badge>
            <Badge variant="neutral">{internship.workMode}</Badge>
            {internship.isDemo && (
              <Badge variant="warning">SAMPLE DATA</Badge>
            )}
          </div>

          <div>
            {score !== null && score !== undefined ? (
              <Badge variant={scoreBadgeVariant}>{score}% Skill Fit</Badge>
            ) : matchStatus === 'NO_PROFILE_SKILLS' ? (
              <Badge variant="warning">Add Skills for Score</Badge>
            ) : (
              <Badge variant="neutral">Open Requirements</Badge>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: 17, marginBottom: 4 }}>
          <Link
            to={`${basePath}/internships/${internship.id}`}
            style={{ color: 'var(--color-navy)' }}
          >
            {internship.title}
          </Link>
        </h3>
        <p style={{ fontSize: 13.5, color: 'var(--color-muted)', fontWeight: 500, marginBottom: 12 }}>
          {internship.company}
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            fontSize: 13,
            color: 'var(--color-muted)',
            marginBottom: 14
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={14} /> {internship.location}
          </span>
          {internship.duration && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} /> {internship.duration}
            </span>
          )}
          {internship.stipend && (
            <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>
              {internship.stipend}
            </span>
          )}
          {internship.deadline && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={14} /> Apply by {internship.deadline}
            </span>
          )}
        </div>

        {requiredNames.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {requiredNames.map((sk) => {
              const isMatched = internship.match?.matchedRequired?.some(
                (m) => m.name.toLowerCase() === sk.toLowerCase()
              );
              const isMissing = internship.match?.missingRequired?.some(
                (m) => m.name.toLowerCase() === sk.toLowerCase()
              );
              return (
                <SkillChip
                  key={sk}
                  name={sk}
                  variant={isMatched ? 'matched' : isMissing ? 'missing' : 'default'}
                />
              );
            })}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTop: '1px solid var(--color-border)',
          gap: 10
        }}
      >
        <Link
          to={`${basePath}/internships/${internship.id}`}
          className="btn btn-primary btn-sm"
        >
          View Match & Details
        </Link>

        {onToggleSave && (
          <Button
            variant={internship.isSaved ? 'secondary' : 'ghost'}
            size="sm"
            disabled={saving}
            onClick={() => onToggleSave(internship.id)}
          >
            <Bookmark
              size={15}
              fill={internship.isSaved ? 'var(--color-primary)' : 'none'}
              color={internship.isSaved ? 'var(--color-primary)' : 'currentColor'}
            />
            {internship.isSaved ? 'Saved' : 'Save'}
          </Button>
        )}
      </div>
    </div>
  );
}
