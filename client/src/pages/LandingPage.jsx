import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Target,
  Map,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FlaskConical,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Badge, Button, SkillChip, ProgressBar } from '../components/ui.jsx';

export default function LandingPage() {
  const { user, isDemo, enterDemoMode } = useAuth();
  const [enteringDemo, setEnteringDemo] = useState(false);
  const navigate = useNavigate();

  const handleTryDemo = async () => {
    try {
      setEnteringDemo(true);
      await enterDemoMode();
      navigate('/demo/dashboard');
    } finally {
      setEnteringDemo(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: 'var(--color-card)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'var(--color-navy)',
              fontWeight: 700,
              fontSize: 18
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

          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            <a href="#features" style={{ color: 'var(--color-muted)' }}>
              Features
            </a>
            <a href="#how-it-works" style={{ color: 'var(--color-muted)' }}>
              How It Works
            </a>
            {user && !isDemo ? (
              <Link to="/app/dashboard" className="btn btn-primary btn-sm">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ color: 'var(--color-navy)', fontWeight: 600 }}>
                  Log In
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTryDemo}
                  loading={enteringDemo}
                >
                  <FlaskConical size={14} /> Try Demo
                </Button>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '64px 24px 48px',
          maxWidth: 1180,
          margin: '0 auto',
          width: '100%'
        }}
      >
        <div className="grid-2" style={{ alignItems: 'center', gap: 40 }}>
          <div>
            <Badge variant="indigo" className="mb-3">
              Student Career & Internship Assistant
            </Badge>
            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                lineHeight: 1.18,
                marginTop: 12,
                marginBottom: 16
              }}
            >
              See exactly how your skills fit an internship—and what to learn next.
            </h1>
            <p
              style={{
                fontSize: 16,
                color: 'var(--color-muted)',
                marginBottom: 28,
                maxWidth: 540
              }}
            >
              SkillBridge AI helps college students move from uncertainty to a concrete
              career-preparation plan. Compare your current skills against role requirements,
              generate a week-by-week learning roadmap, and track every application in one calm
              workspace.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Your Career Plan <ArrowRight size={17} />
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleTryDemo}
                loading={enteringDemo}
              >
                <FlaskConical size={17} /> Try Instant Judge Demo
              </Button>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--color-muted)', marginTop: 12 }}>
              No sign-up needed for Demo Mode • Pre-loaded with sample student skills, 16 sample
              internships, and an interactive roadmap.
            </p>
          </div>

          {/* Stylized Product Preview Card (Clearly labeled as Preview per Section 4.1) */}
          <div
            className="card"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
              padding: 24
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: '1px solid var(--color-border)'
              }}
            >
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)' }}>
                  INTERACTIVE WORKSPACE PREVIEW
                </span>
                <h3 style={{ fontSize: 16, marginTop: 2 }}>
                  Frontend Web Developer Intern — Match Breakdown
                </h3>
              </div>
              <Badge variant="teal">75% Skill Fit</Badge>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: 'var(--color-muted)' }}>
                Matched Required Skills (3 of 4)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <SkillChip name="HTML" level="Intermediate" variant="matched" />
                <SkillChip name="CSS" level="Intermediate" variant="matched" />
                <SkillChip name="JavaScript" level="Beginner" variant="matched" />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: 'var(--color-muted)' }}>
                Missing Required Skill (1 of 4)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <SkillChip name="React" level="Required" variant="missing" />
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                padding: 14,
                borderRadius: 10,
                border: '1px solid var(--color-border)'
              }}
            >
              <ProgressBar value={50} label="Suggested Action: Week 2 React Fundamentals" />
              <div
                style={{
                  fontSize: 12.5,
                  color: 'var(--color-muted)',
                  marginTop: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>Formula: (3 matched ÷ 4 required) × 100 = 75%</span>
                <Badge variant="neutral">Preview Illustration</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Row */}
      <section
        id="features"
        style={{
          padding: '48px 24px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, marginBottom: 8 }}>
              Everything a student needs to bridge the skill gap
            </h2>
            <p style={{ color: 'var(--color-muted)', maxWidth: 600, margin: '0 auto' }}>
              Designed for transparency and action—no black-box scores or fabricated claims.
            </p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14
                }}
              >
                <Target size={20} />
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>1. Explainable Matching</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                See the exact mathematical breakdown of how your current skills match an internship’s
                required vs. preferred stack—never a mysterious AI number.
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'var(--color-teal-soft)',
                  color: 'var(--color-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14
                }}
              >
                <CheckCircle2 size={20} />
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>2. Role Skill-Gap Analyzer</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                Compare your profile against Frontend, Backend, Full-Stack, Python, Data Analyst,
                beginner ML, or UI/UX benchmarks with High/Medium/Low priorities.
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'var(--color-warning-soft)',
                  color: 'var(--color-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14
                }}
              >
                <Map size={20} />
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>3. Actionable Career Roadmap</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                Turn missing skills into concrete weekly tasks tailored to your available study hours,
                paired with a personal Kanban Application Tracker.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        style={{
          padding: '56px 24px',
          maxWidth: 1180,
          margin: '0 auto',
          width: '100%'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 26, marginBottom: 8 }}>How SkillBridge AI Works</h2>
          <p style={{ color: 'var(--color-muted)' }}>
            Move from uncertainty to action in three connected steps.
          </p>
        </div>

        <div className="grid-3">
          <div className="card">
            <Badge variant="indigo">Step 1</Badge>
            <h3 style={{ fontSize: 17, marginTop: 12, marginBottom: 6 }}>
              Add your skills & target role
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
              Enter your current skills (Beginner, Intermediate, Advanced) and weekly study hours.
            </p>
          </div>
          <div className="card">
            <Badge variant="indigo">Step 2</Badge>
            <h3 style={{ fontSize: 17, marginTop: 12, marginBottom: 6 }}>
              Inspect internship match & gaps
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
              Filter opportunities by domain or work mode and see which required skills are already
              present vs. missing.
            </p>
          </div>
          <div className="card">
            <Badge variant="teal">Step 3</Badge>
            <h3 style={{ fontSize: 17, marginTop: 12, marginBottom: 6 }}>
              Follow your roadmap & track applications
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
              Complete weekly learning tasks, update your skills, and organize applications from
              Interested to Offer.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          backgroundColor: 'var(--color-navy)',
          color: '#CBD5E1',
          padding: '32px 24px'
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 16 }}>
              SkillBridge AI
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
              Privacy note: We collect only the profile and skill data needed for matching and
              roadmap generation. Demo mode is strictly isolated from real accounts.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, fontSize: 13.5 }}>
            <a href="#features" style={{ color: '#E2E8F0' }}>
              Features
            </a>
            <a href="#how-it-works" style={{ color: '#E2E8F0' }}>
              How It Works
            </a>
            <Link to="/login" style={{ color: '#E2E8F0' }}>
              Login
            </Link>
            <Link to="/register" style={{ color: '#E2E8F0' }}>
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
