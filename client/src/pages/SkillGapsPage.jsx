import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Target,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Map,
  RefreshCw,
  ArrowRight
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
  EmptyState,
  LoadingSkeleton
} from '../components/ui.jsx';

const TARGET_ROLES = [
  { id: 'Frontend', label: 'Frontend' },
  { id: 'Backend', label: 'Backend' },
  { id: 'Full-Stack', label: 'Full-Stack' },
  { id: 'Python', label: 'Python' },
  { id: 'Data Analyst', label: 'Data Analyst' },
  { id: 'beginner ML', label: 'beginner ML' },
  { id: 'UI/UX', label: 'UI/UX' }
];

export default function SkillGapsPage() {
  const { profile, refreshIdentity, addToast, isDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = location.pathname.startsWith('/demo') || isDemo ? '/demo' : '/app';

  const [selectedRole, setSelectedRole] = useState(profile?.targetRole || 'Frontend');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingSkill, setUpdatingSkill] = useState('');

  const loadSkillGaps = useCallback(async (roleToFetch) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(
        `/api/skill-gaps?role=${encodeURIComponent(roleToFetch || 'Frontend')}`
      );
      setAnalysis(res.data);
      if (res.data.role) {
        setSelectedRole(res.data.role);
      }
    } catch (err) {
      setError(err.message || 'Unable to load skill-gap analysis.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkillGaps(selectedRole);
  }, [selectedRole, loadSkillGaps]);

  const handleSkillProgressAction = async (skillName, status, proficiency) => {
    try {
      setUpdatingSkill(skillName);
      const res = await api.post('/api/profile/skills/status', {
        skillName,
        status,
        proficiency
      });
      addToast(res.message, 'success');
      await refreshIdentity();
      await loadSkillGaps(selectedRole);
    } catch (err) {
      addToast(err.message || 'Could not update skill state.', 'error');
    } finally {
      setUpdatingSkill('');
    }
  };

  const handleGenerateRoadmapForRole = async () => {
    try {
      setUpdatingSkill('__roadmap__');
      await api.post('/api/roadmap/generate', {
        targetRole: selectedRole
      });
      addToast(`Generated Career Roadmap for ${selectedRole}!`, 'success');
      navigate(`${basePath}/roadmap`);
    } catch (err) {
      addToast(err.message || 'Could not generate roadmap.', 'error');
    } finally {
      setUpdatingSkill('');
    }
  };

  return (
    <AppShell
      title="Skill-Gap Analyzer"
      primaryCta={
        <Button
          variant="primary"
          size="sm"
          onClick={handleGenerateRoadmapForRole}
          loading={updatingSkill === '__roadmap__'}
        >
          <Map size={15} /> Generate {selectedRole} Roadmap
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Target Role Selector Bar */}
        <Card
          title="Select Target Career Role"
          subtitle="Compare your current skills against structured role requirements and learning priorities"
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TARGET_ROLES.map((r) => {
              const active = selectedRole.toLowerCase() === r.id.toLowerCase();
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`btn ${active ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </Card>

        {loading && (
          <Card>
            <LoadingSkeleton lines={5} height={24} />
          </Card>
        )}

        {!loading && error && (
          <Card title="Could not load skill gaps">
            <p style={{ color: 'var(--color-muted)', marginBottom: 14 }}>{error}</p>
            <Button variant="primary" onClick={() => loadSkillGaps(selectedRole)}>
              <RefreshCw size={15} /> Retry
            </Button>
          </Card>
        )}

        {!loading && !error && analysis && (
          <>
            {/* Readiness Overview & Recommended Project Activity */}
            <div className="grid-2">
              <Card
                title={`${analysis.roleLabel} Readiness`}
                subtitle={analysis.description}
              >
                <div style={{ marginBottom: 18 }}>
                  <ProgressBar
                    value={analysis.readinessScore}
                    label={`${analysis.matchedCount} of ${analysis.totalRequired} required skills in your profile`}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Badge variant="teal">{analysis.matchedCount} Matched</Badge>
                  <Badge variant="warning">{analysis.missingCount} Missing Required</Badge>
                </div>
              </Card>

              <Card
                title="Recommended Next Activity"
                subtitle="Practical project suggestion for your highest-priority skill gap"
              >
                {analysis.nextSkillRecommendation && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      backgroundColor: 'var(--color-primary-soft)',
                      border: '1px solid #C7D2FE'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6
                      }}
                    >
                      <span style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
                        Focus Skill: {analysis.nextSkillRecommendation.skill}
                      </span>
                      <Badge variant="indigo">
                        {analysis.nextSkillRecommendation.priority} Priority
                      </Badge>
                    </div>
                    <p style={{ fontSize: 13.5, color: 'var(--color-navy)', marginBottom: 12 }}>
                      {analysis.nextSkillRecommendation.activity}
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleGenerateRoadmapForRole}
                      loading={updatingSkill === '__roadmap__'}
                    >
                      Build Weekly Plan for {analysis.roleLabel} <ArrowRight size={14} />
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Required Skills Comparison Table / Cards */}
            <Card
              title={`Required Skills Breakdown — ${analysis.roleLabel}`}
              subtitle="Mark any missing skill as 'Learning' or 'Completed' to persist it to your profile and immediately recalculate your readiness score."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {analysis.requiredComparison.map((item) => {
                  const priorityVariant =
                    item.priority === 'High'
                      ? 'danger'
                      : item.priority === 'Medium'
                        ? 'warning'
                        : 'neutral';

                  return (
                    <div
                      key={item.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 16,
                        padding: 16,
                        borderRadius: 10,
                        border: '1px solid var(--color-border)',
                        backgroundColor: item.matched ? 'var(--color-teal-soft)' : '#FFFFFF'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 15.5 }}>
                            {item.sequence}. {item.name}
                          </span>
                          <Badge variant={priorityVariant}>{item.priority} Priority</Badge>
                          {item.matched ? (
                            <Badge variant="teal">
                              Matched ({item.proficiency} • {item.status})
                            </Badge>
                          ) : (
                            <Badge variant="warning">Missing Requirement</Badge>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 6 }}>
                          <strong>Suggested Project:</strong> {item.projectSuggestion}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {!item.matched ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              loading={updatingSkill === item.name}
                              onClick={() =>
                                handleSkillProgressAction(item.name, 'Learning', 'Beginner')
                              }
                            >
                              <BookOpen size={14} /> Mark as Learning
                            </Button>
                            <Button
                              variant="teal"
                              size="sm"
                              loading={updatingSkill === item.name}
                              onClick={() =>
                                handleSkillProgressAction(item.name, 'Completed', 'Intermediate')
                              }
                            >
                              <CheckCircle2 size={14} /> Mark Completed
                            </Button>
                          </>
                        ) : (
                          <>
                            {item.status !== 'Completed' && (
                              <Button
                                variant="teal"
                                size="sm"
                                loading={updatingSkill === item.name}
                                onClick={() =>
                                  handleSkillProgressAction(
                                    item.name,
                                    'Completed',
                                    item.proficiency || 'Intermediate'
                                  )
                                }
                              >
                                <CheckCircle2 size={14} /> Mark Completed
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              loading={updatingSkill === item.name}
                              onClick={() => handleSkillProgressAction(item.name, 'Remove')}
                            >
                              Remove from Profile
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Optional Preferred Skills */}
            {analysis.preferredComparison?.length > 0 && (
              <Card
                title="Optional / Preferred Role Skills"
                subtitle="Bonus skills that strengthen your portfolio after you finish the mandatory requirements"
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {analysis.preferredComparison.map((pref) => (
                    <div
                      key={pref.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--color-border)',
                        backgroundColor: pref.matched ? 'var(--color-teal-soft)' : 'var(--color-bg)'
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{pref.name}</span>
                      {pref.matched ? (
                        <Badge variant="teal">Added ({pref.proficiency})</Badge>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={updatingSkill === pref.name}
                          onClick={() =>
                            handleSkillProgressAction(pref.name, 'Learning', 'Beginner')
                          }
                        >
                          + Add as Learning
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
