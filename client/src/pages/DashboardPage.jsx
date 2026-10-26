import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Bookmark,
  Briefcase,
  Map,
  Target,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../layouts/AppShell.jsx';
import {
  Card,
  Badge,
  Button,
  ProgressBar,
  SkillChip,
  InternshipCard,
  EmptyState,
  LoadingSkeleton
} from '../components/ui.jsx';

export default function DashboardPage() {
  const { addToast, isDemo } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const location = useLocation();

  const basePath = location.pathname.startsWith('/demo') || isDemo ? '/demo' : '/app';

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/dashboard/summary');
      setSummary(res.data);
    } catch (err) {
      setError(err.message || 'Unable to load your dashboard overview right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleToggleSave = async (internshipId) => {
    try {
      setSavingId(internshipId);
      const res = await api.post(`/api/internships/${internshipId}/save`);
      addToast(res.message, 'success');
      await loadSummary();
    } catch (err) {
      addToast(err.message || 'Could not update saved state.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const resolvePath = (path) => {
    if (!path) return `${basePath}/internships`;
    return path.replace(/^\/app/, basePath);
  };

  return (
    <AppShell
      title="Student Dashboard"
      primaryCta={
        <Link to={`${basePath}/internships`} className="btn btn-primary btn-sm">
          <Compass size={15} /> Explore Internships
        </Link>
      }
    >
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <LoadingSkeleton lines={3} height={22} />
          </Card>
          <div className="grid-3">
            <Card><LoadingSkeleton lines={2} /></Card>
            <Card><LoadingSkeleton lines={2} /></Card>
            <Card><LoadingSkeleton lines={2} /></Card>
          </div>
          <Card>
            <LoadingSkeleton lines={5} height={24} />
          </Card>
        </div>
      )}

      {!loading && error && (
        <Card title="Could not load dashboard">
          <p style={{ color: 'var(--color-muted)', marginBottom: 16 }}>{error}</p>
          <Button variant="primary" onClick={loadSummary}>
            <RefreshCw size={15} /> Retry Loading
          </Button>
        </Card>
      )}

      {!loading && !error && summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Welcome Header & Profile Completion */}
          <Card>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 20
              }}
            >
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h2 style={{ fontSize: 24 }}>
                    Welcome, {summary.user.name}
                  </h2>
                  {summary.user.targetRole ? (
                    <Badge variant="indigo">Target: {summary.user.targetRole}</Badge>
                  ) : (
                    <Badge variant="warning">Target Role Not Set</Badge>
                  )}
                  {summary.user.isDemo && (
                    <Badge variant="warning">DEMO PROFILE</Badge>
                  )}
                </div>
                <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                  {summary.user.college
                    ? `${summary.user.college} • ${summary.user.studyYear || 'Student'} • ${summary.user.weeklyHours} hrs/week study pace`
                    : 'Complete your student profile and skills to get accurate role match explanations.'}
                </p>
              </div>

              <div style={{ minWidth: 250, maxWidth: 320, width: '100%' }}>
                <ProgressBar
                  value={summary.completion?.percentage || 0}
                  label="Profile Completion"
                />
                {summary.completion?.missingHints?.length > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 6 }}>
                    Missing: {summary.completion.missingHints.slice(0, 2).join(', ')}{' '}
                    <Link to={`${basePath}/profile`} style={{ fontWeight: 600 }}>
                      Update →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Suggested Next Action Banner */}
          {summary.nextAction && (
            <div
              className="card"
              style={{
                backgroundColor: 'var(--color-primary-soft)',
                borderColor: '#C7D2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    Recommended Next Action
                  </div>
                  <h3 style={{ fontSize: 17, marginTop: 2 }}>{summary.nextAction.title}</h3>
                  <p style={{ fontSize: 13.5, color: 'var(--color-muted)', marginTop: 2 }}>
                    {summary.nextAction.description}
                  </p>
                </div>
              </div>
              <Link
                to={resolvePath(summary.nextAction.ctaPath)}
                className="btn btn-primary"
              >
                {summary.nextAction.ctaLabel} <ArrowRight size={15} />
              </Link>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid-3">
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 500 }}>
                    Saved Internships
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>
                    {summary.quickStats.savedInternshipsCount}
                  </div>
                </div>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: 'var(--color-primary-soft)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Bookmark size={20} />
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12.5 }}>
                <Link to={`${basePath}/internships?saved=true`}>View saved listings →</Link>
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 500 }}>
                    Active Applications
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>
                    {summary.quickStats.activeApplicationsCount}
                  </div>
                </div>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: 'var(--color-teal-soft)',
                    color: 'var(--color-teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Briefcase size={20} />
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12.5 }}>
                <Link to={`${basePath}/applications`}>Open Application Tracker →</Link>
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 500 }}>
                    Roadmap Progress
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>
                    {summary.quickStats.roadmapProgressPercentage}%
                  </div>
                </div>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: 'var(--color-warning-soft)',
                    color: 'var(--color-warning)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Map size={20} />
                </div>
              </div>
              <ProgressBar
                value={summary.quickStats.roadmapProgressPercentage}
                showPercent={false}
                label={`${summary.quickStats.roadmapCompletedSteps} of ${summary.quickStats.roadmapTotalSteps} steps completed`}
              />
            </Card>
          </div>

          {/* Skill Readiness & Next Learning Step Row */}
          <div className="grid-2">
            <Card
              title={`Skill Readiness: ${summary.skillReadiness?.roleLabel || 'Target Role'}`}
              subtitle="Comparison of your current profile skills vs. role requirements"
              action={
                <Link to={`${basePath}/skill-gaps`} className="btn btn-secondary btn-sm">
                  <Target size={14} /> Full Analysis
                </Link>
              }
            >
              <div style={{ marginBottom: 16 }}>
                <ProgressBar
                  value={summary.skillReadiness?.readinessScore || 0}
                  label={`${summary.skillReadiness?.matchedCount || 0} of ${summary.skillReadiness?.totalRequired || 0} core role skills present`}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>
                  Matched Role Skills
                </div>
                {summary.skillReadiness?.matchedSkills?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {summary.skillReadiness.matchedSkills.map((sk) => (
                      <SkillChip
                        key={sk.name}
                        name={sk.name}
                        level={sk.proficiency}
                        variant="matched"
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                    No matched role skills yet. Add skills in your profile!
                  </p>
                )}
              </div>

              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>
                  Missing Required Skills to Learn Next
                </div>
                {summary.skillReadiness?.missingSkills?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {summary.skillReadiness.missingSkills.map((sk) => (
                      <SkillChip
                        key={sk.name}
                        name={sk.name}
                        level={`${sk.priority} Priority`}
                        variant="missing"
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--color-teal)', fontWeight: 600 }}>
                    All core role skills matched!
                  </p>
                )}
              </div>
            </Card>

            {/* Learning Card & Application Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Card
                title="Current Learning Focus"
                subtitle="Next incomplete milestone from your Career Roadmap"
                action={
                  <Link to={`${basePath}/roadmap`} className="btn btn-secondary btn-sm">
                    Open Roadmap
                  </Link>
                }
              >
                {!summary.roadmap ? (
                  <EmptyState
                    title="No Roadmap Generated Yet"
                    description="Generate a customized weekly learning plan based on your missing role skills."
                    actionLabel="Generate My Roadmap"
                    actionTo={`${basePath}/roadmap`}
                  />
                ) : summary.roadmap.nextStep ? (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Badge variant="indigo">Step {summary.roadmap.nextStep.sequence}</Badge>
                      <span style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>
                        Est. {summary.roadmap.nextStep.estimatedHours} hrs
                      </span>
                    </div>
                    <h4 style={{ fontSize: 15, marginBottom: 4 }}>
                      {summary.roadmap.nextStep.title}
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 8 }}>
                      {summary.roadmap.nextStep.objective}
                    </p>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                      <strong>Practical task:</strong> {summary.roadmap.nextStep.task}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-teal)' }}>
                    <CheckCircle2 size={20} />
                    <span style={{ fontWeight: 600 }}>
                      You have completed all steps in your current Career Roadmap!
                    </span>
                  </div>
                )}
              </Card>

              <Card
                title="Application Pipeline Summary"
                subtitle="Live counts derived from your Application Tracker"
                action={
                  <Link to={`${basePath}/applications`} className="btn btn-secondary btn-sm">
                    Manage Tracker
                  </Link>
                }
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 8,
                    textAlign: 'center'
                  }}
                >
                  {Object.entries(summary.applicationSummary?.countsByStatus || {}).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        style={{
                          padding: '10px 6px',
                          borderRadius: 8,
                          backgroundColor: 'var(--color-bg)',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{count}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>{status}</div>
                      </div>
                    )
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Recommended Internships */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14
              }}
            >
              <div>
                <h2 style={{ fontSize: 20 }}>Recommended Internships</h2>
                <p style={{ fontSize: 13.5, color: 'var(--color-muted)' }}>
                  Ranked by your explainable skill-fit score and target career domain
                </p>
              </div>
              <Link to={`${basePath}/internships`} className="btn btn-secondary btn-sm">
                View All Listings →
              </Link>
            </div>

            {summary.recommendedInternships?.length === 0 ? (
              <EmptyState
                title="No Internships Found"
                description="Explore the full internship directory to discover opportunities."
                actionLabel="Explore Internships"
                actionTo={`${basePath}/internships`}
              />
            ) : (
              <div className="grid-2">
                {summary.recommendedInternships.map((intern) => (
                  <InternshipCard
                    key={intern.id}
                    internship={intern}
                    basePath={basePath}
                    onToggleSave={handleToggleSave}
                    saving={savingId === intern.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
