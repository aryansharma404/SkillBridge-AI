import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, FlaskConical } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, FormField, Card } from '../components/ui.jsx';

export function LoginPage() {
  const { login, enterDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.from || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    try {
      setLoading(true);
      const data = await login(email.trim(), password);
      if (returnTo) {
        navigate(returnTo);
      } else if (!data.user.onboarded) {
        navigate('/onboarding');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleTryDemo = async () => {
    try {
      setDemoLoading(true);
      await enterDemoMode();
      navigate('/demo/dashboard');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
      }}
    >
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 700,
          fontSize: 20,
          color: 'var(--color-navy)',
          marginBottom: 24
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Sparkles size={18} />
        </div>
        <span>SkillBridge AI</span>
      </Link>

      <div style={{ width: '100%', maxWidth: 420 }}>
        <Card title="Sign in to your account" subtitle="Continue your personalized career & internship plan">
          {error && (
            <div
              style={{
                backgroundColor: 'var(--color-danger-soft)',
                border: '1px solid var(--color-danger-border)',
                color: 'var(--color-danger)',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FormField label="Email Address">
              <input
                type="email"
                className="form-input"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Password">
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              Sign In
            </Button>
          </form>

          <div
            style={{
              margin: '20px 0',
              borderTop: '1px solid var(--color-border)',
              paddingTop: 16,
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 10 }}>
              Evaluating for a hackathon or want an instant preview?
            </p>
            <Button
              variant="secondary"
              onClick={handleTryDemo}
              loading={demoLoading}
              style={{ width: '100%' }}
            >
              <FlaskConical size={15} /> Open Preloaded Demo Workspace
            </Button>
          </div>

          <p style={{ fontSize: 13.5, textAlign: 'center', color: 'var(--color-muted)' }}>
            New to SkillBridge AI?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create a student account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register, enterDemoMode } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();

  const validateClient = () => {
    const errs = {};
    if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validateClient()) return;

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword
      });
      navigate('/onboarding');
    } catch (err) {
      if (Array.isArray(err.details) && err.details.length > 0) {
        const mapped = {};
        err.details.forEach((d) => {
          if (d.field) mapped[d.field] = d.message;
        });
        setFieldErrors(mapped);
      }
      setGeneralError(err.message || 'Unable to register.');
    } finally {
      setLoading(false);
    }
  };

  const handleTryDemo = async () => {
    try {
      setDemoLoading(true);
      await enterDemoMode();
      navigate('/demo/dashboard');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
      }}
    >
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 700,
          fontSize: 20,
          color: 'var(--color-navy)',
          marginBottom: 24
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Sparkles size={18} />
        </div>
        <span>SkillBridge AI</span>
      </Link>

      <div style={{ width: '100%', maxWidth: 440 }}>
        <Card
          title="Create your student account"
          subtitle="Build your skill profile, find matching internships, and generate a learning plan"
        >
          {generalError && (
            <div
              style={{
                backgroundColor: 'var(--color-danger-soft)',
                border: '1px solid var(--color-danger-border)',
                color: 'var(--color-danger)',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16
              }}
            >
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FormField label="Full Name" error={fieldErrors.name}>
              <input
                type="text"
                className={`form-input ${fieldErrors.name ? 'form-input-error' : ''}`}
                placeholder="Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormField>

            <FormField label="College / Personal Email" error={fieldErrors.email}>
              <input
                type="email"
                className={`form-input ${fieldErrors.email ? 'form-input-error' : ''}`}
                placeholder="aarav@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>

            <FormField
              label="Password"
              helper="At least 6 characters"
              error={fieldErrors.password}
            >
              <input
                type="password"
                className={`form-input ${fieldErrors.password ? 'form-input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>

            <FormField label="Confirm Password" error={fieldErrors.confirmPassword}>
              <input
                type="password"
                className={`form-input ${fieldErrors.confirmPassword ? 'form-input-error' : ''}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', marginTop: 6 }}
            >
              Create Account & Continue
            </Button>
          </form>

          <div
            style={{
              margin: '20px 0',
              borderTop: '1px solid var(--color-border)',
              paddingTop: 16,
              textAlign: 'center'
            }}
          >
            <Button
              variant="secondary"
              onClick={handleTryDemo}
              loading={demoLoading}
              style={{ width: '100%' }}
            >
              <FlaskConical size={15} /> Skip Registration — Try Demo Mode
            </Button>
          </div>

          <p style={{ fontSize: 13.5, textAlign: 'center', color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
