import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../layouts/AppShell.jsx';
import {
  Card,
  Badge,
  Button,
  SkillChip,
  ProgressBar,
  LoadingSkeleton
} from '../components/ui.jsx';

export default function InternshipDetailPage() {
  const { id } = useParams();
  const { addToast, isDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = location.pathname.startsWith('/demo') || isDemo ? '/demo' : '/app';

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [tracking, setTracking] = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/api/internships/${id}`);
      setInternship(res.data.internship);
    } catch (err) {
      setError(err.message || 'Could not load internship details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleToggleSave = async () => {
    try {
      setSaving(true);
      const res = await api.post(`/api/internships/${id}/save`);
      addToast(res.message, 'success');
      setInternship((prev) => ({ ...prev, isSaved: res.data.isSaved }));
    } catch (err) {
      addToast(err.message || 'Could not update saved state.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTrackOpportunity = async () => {
    try {
      setTracking(true);
      const res = await api.post('/api/applications', {
        internshipId: internship.id,
        title: internship.title,
        company: internship.company,
        status: 'Interested',
        deadline: internship.deadline || null,
        notes:
          internship.match?.score !== null && internship.match?.score !== undefined
            ? `Added from Match Analysis (${internship.match.score}% skill fit).`
            : 'Added from Internship Explorer.'
      });
      addToast(res.message, 'success');
      setInternship((prev) => ({
        ...prev,
        existingApplication: res.data.application
      }));
    } catch (err) {
      if (err.status === 409) {
        addToast('This internship is already in your Application Tracker.', 'success');
        navigate(`${basePath}/applications`);
      } else {
        addToast(err.message || 'Could not add to tracker.', 'error');
      }
    } finally {
      setTracking(false);
    }
  };

  const resolvePath = (path) => {
    if (!path) return `${basePath}/roadmap`;
    return path.replace(/^\/app/, basePath);
  };

  return (
    <AppShell
      title="Opportunity & Match Analysis"
      primaryCta={
        <Link to={`${basePath}/internships`} className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back to Listings
        </Link>
      }
    >
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card><LoadingSkeleton lines={4} /></Card>
          <Card><LoadingSkeleton lines={5} /></Card>
        </div>
      )}

      {!loading && error && (
        <Card title="Unable to load internship">
          <p style={{ color: 'var(--color-muted)', marginBottom: 16 }}>{error}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="primary" onClick={loadDetail}>
              <RefreshCw size={15} /> Retry
            </Button>
            <Link to={`${basePath}/internships`} className="btn btn-secondary">
              Back to Internships
            </Link>
          </div>
        </Card>
      )}

      {!loading && !error && internship && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Opportunity Header Card */}
          <Card>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 16
              }}
            >
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  <Badge variant="indigo">{internship.domain}</Badge>
                  <Badge variant="neutral">{internship.workMode}</Badge>
                  <Badge variant="neutral">{internship.experienceLevel} Level</Badge>
                  {internship.isDemo && (
                    <Badge variant="warning">SAMPLE DATA — Seeded Demo Opportunity</Badge>
                  )}
                </div>
                <h2 style={{ fontSize: 24, marginBottom: 4 }}>{internship.title}</h2>
                <p style={{ fontSize: 15, color: 'var(--color-muted)', fontWeight: 600 }}>
                  {internship.company}
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <Button
                  variant={internship.isSaved ? 'secondary' : 'ghost'}
                  onClick={handleToggleSave}
                  loading={saving}
                >
                  <Bookmark
                    size={16}
                    fill={internship.isSaved ? 'var(--color-primary)' : 'none'}
                  />
                  {internship.isSaved ? 'Saved' : 'Save Opportunity'}
                </Button>

                {internship.existingApplication ? (
                  <Link
                    to={`${basePath}/applications`}
                    className="btn btn-teal"
                  >
                    <Briefcase size={16} /> Tracked ({internship.existingApplication.status}) →
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleTrackOpportunity}
                    loading={tracking}
                  >
                    <Briefcase size={16} /> Track in My Applications
                  </Button>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                padding: '14px 16px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                fontSize: 13.5
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={15} /> <strong>Location:</strong> {internship.location}
              </span>
              {internship.duration && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={15} /> <strong>Duration:</strong> {internship.duration}
                </span>
              )}
              {internship.stipend && (
                <span>
                  <strong>Stipend:</strong> {internship.stipend}
                </span>
              )}
              {internship.deadline && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={15} /> <strong>Target Deadline:</strong> {internship.deadline}
                </span>
              )}
            </div>

            {internship.isDemo && (
              <p style={{ fontSize: 12.5, color: 'var(--color-muted)', marginTop: 12 }}>
                <strong>Data honesty note:</strong> This is a seeded sample opportunity for hackathon
                demonstration and skill-fit testing. No external application link is fabricated.
              </p>
            )}
          </Card>

          {/* Explainable Match Analysis Card (Section 4.6) */}
          <Card
            title="Explainable Skill-Fit Analysis"
            subtitle="Transparent rule-based comparison between your profile skills and this role's requirements"
          >
            {internship.match?.status === 'NO_PROFILE_SKILLS' ? (
              <div
                style={{
                  padding: 20,
                  backgroundColor: 'var(--color-warning-soft)',
                  border: '1px solid var(--color-warning-border)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16
                }}
              >
                <div>
                  <h4 style={{ color: 'var(--color-warning)', fontSize: 16, marginBottom: 4 }}>
                    Add your skills to calculate your personalized match score
                  </h4>
                  <p style={{ fontSize: 13.5, color: 'var(--color-muted)' }}>
                    We never display a misleading personalized score when your profile has zero skills listed.
                  </p>
                </div>
                <Link to={`${basePath}/profile`} className="btn btn-primary">
                  Add Skills to Profile
                </Link>
              </div>
            ) : internship.match?.status === 'NO_REQUIREMENTS' ? (
              <div
                style={{
                  padding: 18,
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10
                }}
              >
                <h4 style={{ fontSize: 16, marginBottom: 4 }}>
                  {internship.match.explanation}
                </h4>
                <p style={{ fontSize: 13.5, color: 'var(--color-muted)' }}>
                  This fellowship has no mandatory technical skill prerequisites. Review the
                  optional preferred skills below.
                </p>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 20,
                    padding: 20,
                    backgroundColor: 'var(--color-bg)',
                    borderRadius: 12,
                    border: '1px solid var(--color-border)',
                    marginBottom: 20
                  }}
                >
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: 36,
                          fontWeight: 800,
                          color:
                            internship.match.score >= 75
                              ? 'var(--color-teal)'
                              : internship.match.score >= 45
                                ? 'var(--color-primary)'
                                : 'var(--color-warning)'
                        }}
                      >
                        {internship.match.score}%
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>Skill-Fit Score</div>
                        <div style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>
                          {internship.match.matchedCount} of {internship.match.totalRequired} required skills matched
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--color-navy)' }}>
                      {internship.match.explanation}
                    </p>
                  </div>

                  <div style={{ minWidth: 240 }}>
                    <ProgressBar
                      value={internship.match.score}
                      label="Required Skills Coverage"
                    />
                    {internship.match.nextAction && (
                      <div style={{ marginTop: 12 }}>
                        <Link
                          to={resolvePath(internship.match.nextAction.path)}
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%' }}
                        >
                          {internship.match.nextAction.label} <ArrowRight size={14} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Matched vs Missing Required Skills */}
            <div className="grid-2" style={{ marginTop: 16 }}>
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    color: 'var(--color-teal)',
                    marginBottom: 10
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    Matched Required Skills ({internship.match?.matchedRequired?.length || 0})
                  </span>
                </div>
                {internship.match?.matchedRequired?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {internship.match.matchedRequired.map((sk) => (
                      <SkillChip
                        key={sk.name}
                        name={sk.name}
                        level={`You: ${sk.userProficiency}`}
                        variant="matched"
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                    None of the mandatory required skills are currently in your profile.
                  </p>
                )}
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    color: 'var(--color-warning)',
                    marginBottom: 10
                  }}
                >
                  <AlertCircle size={16} />
                  <span>
                    Missing Required Skills ({internship.match?.missingRequired?.length || 0})
                  </span>
                </div>
                {internship.match?.missingRequired?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {internship.match.missingRequired.map((sk) => (
                      <SkillChip
                        key={sk.name}
                        name={sk.name}
                        level="Missing"
                        variant="missing"
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--color-teal)', fontWeight: 600 }}>
                    Zero missing required skills! You meet every core requirement.
                  </p>
                )}
              </div>
            </div>

            {/* Preferred / Bonus Skills (Kept separate from mandatory requirements per Section 4.6) */}
            {(internship.preferredSkills?.length > 0 ||
              internship.match?.matchedPreferred?.length > 0 ||
              internship.match?.missingPreferred?.length > 0) && (
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 6 }}>
                  Preferred / Bonus Skills (Optional — Not Counted Against Mandatory Score)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {internship.match?.matchedPreferred?.map((p) => (
                    <SkillChip
                      key={p.name}
                      name={p.name}
                      level={`Matched (${p.userProficiency})`}
                      variant="matched"
                    />
                  ))}
                  {internship.match?.missingPreferred?.map((p) => (
                    <SkillChip key={p.name} name={p.name} level="Optional Bonus" />
                  ))}
                </div>
              </div>
            )}

            {/* How this score works disclosure */}
            <div
              style={{
                marginTop: 16,
                padding: '12px 14px',
                borderRadius: 8,
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-navy)',
                fontSize: 13,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10
              }}
            >
              <Info size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>How this score works:</strong>{' '}
                <code>{internship.match?.formula}</code>. Preferred skills are shown separately so
                they never penalize your core readiness score. Neither sensitive traits nor college
                prestige are ever included.
              </div>
            </div>
          </Card>

          {/* Role Overview & Responsibilities */}
          <div className="grid-2">
            <Card title="Opportunity Overview">
              <p style={{ fontSize: 14.5, color: 'var(--color-navy)', lineHeight: 1.6 }}>
                {internship.description}
              </p>
            </Card>

            <Card title="Key Responsibilities">
              <p style={{ fontSize: 14.5, color: 'var(--color-navy)', lineHeight: 1.6 }}>
                {internship.responsibilities ||
                  'Collaborate with the engineering and product team, complete assigned sprint tasks, and document your work clearly.'}
              </p>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
