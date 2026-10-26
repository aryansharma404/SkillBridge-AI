import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Target,
  Map,
  Briefcase,
  UserCircle,
  Menu,
  X,
  LogOut,
  RotateCcw,
  Sparkles,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, ConfirmDialog } from '../components/ui.jsx';

export default function AppShell({ children, title, primaryCta }) {
  const { user, isDemo, logout, resetDemoData } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const basePath = location.pathname.startsWith('/demo') || isDemo ? '/demo' : '/app';

  const navItems = [
    { label: 'Dashboard', to: `${basePath}/dashboard`, icon: LayoutDashboard },
    { label: 'Explore Internships', to: `${basePath}/internships`, icon: Compass },
    { label: 'Skill Gaps', to: `${basePath}/skill-gaps`, icon: Target },
    { label: 'Career Roadmap', to: `${basePath}/roadmap`, icon: Map },
    { label: 'Application Tracker', to: `${basePath}/applications`, icon: Briefcase },
    { label: 'My Profile', to: `${basePath}/profile`, icon: UserCircle }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleConfirmReset = async () => {
    try {
      setResetting(true);
      await resetDemoData();
      setConfirmResetOpen(false);
      // Reload current page state cleanly
      window.location.reload();
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="app-shell">
      <div
        className={`mobile-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      <aside className={`app-sidebar ${drawerOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <Link to="/" className="sidebar-brand-title">
              SkillBridge AI
            </Link>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>
              Career & Internship Assistant
            </div>
          </div>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setDrawerOpen(false)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Workspace navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`.trim()
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontWeight: 600, color: '#E2E8F0', marginBottom: 2 }}>
            {user?.name || 'Student'}
          </div>
          <div style={{ fontSize: 11.5, marginBottom: 10 }}>
            {isDemo ? 'Isolated Demo Workspace' : user?.email}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              borderColor: 'rgba(255,255,255,0.18)'
            }}
          >
            <LogOut size={14} />
            {isDemo ? 'Exit Demo Mode' : 'Sign Out'}
          </button>
        </div>
      </aside>

      <div className="app-main-area">
        {isDemo && (
          <div className="demo-banner" role="region" aria-label="Demo mode notice">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
              <FlaskConical size={16} />
              <span>
                DEMO PROFILE — Sample data, not a real student. All edits are isolated from real user accounts.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmResetOpen(true)}
              >
                <RotateCcw size={13} /> Reset Demo Data
              </Button>
              <Link to="/register" className="btn btn-primary btn-sm">
                Create Real Account
              </Link>
            </div>
          </div>
        )}

        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm mobile-menu-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
            <h1 style={{ fontSize: 20 }}>{title}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {primaryCta}
            <Link
              to={`${basePath}/profile`}
              className="btn btn-ghost btn-sm"
              title="Open Profile & Skills"
            >
              <UserCircle size={17} />
              <span style={{ display: 'inline-block' }}>{user?.name || 'Profile'}</span>
            </Link>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset Demo Workspace to Starting State?"
        description="This restores Demo Student's initial skills (HTML, CSS, JavaScript), sample roadmap, and sample application records. Real student accounts are never affected."
        confirmLabel="Reset Demo Data"
        variant="primary"
        loading={resetting}
        onConfirm={handleConfirmReset}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}
