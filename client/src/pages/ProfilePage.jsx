import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  RotateCcw,
  Plus,
  Check,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../layouts/AppShell.jsx';
import {
  Card,
  Badge,
  Button,
  FormField,
  ProgressBar,
  LoadingSkeleton
} from '../components/ui.jsx';

const ROLES = [
  'Frontend',
  'Backend',
  'Full-Stack',
  'Python',
  'Data Analyst',
  'beginner ML',
  'UI/UX'
];

export default function ProfilePage() {
  const { refreshIdentity, addToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const [initialSnapshot, setInitialSnapshot] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [studyYear, setStudyYear] = useState('3rd Year');
  const [targetRole, setTargetRole] = useState('Frontend');
  const [workMode, setWorkMode] = useState('Remote or Hybrid');
  const [location, setLocation] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [resumeUrl, setResumeUrl] = useState('');
  const [skills, setSkills] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [completion, setCompletion] = useState(null);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');

  const applyProfileData = (data) => {
    setName(data.user?.name || '');
    setEmail(data.user?.email || '');
    setIsDemoUser(Boolean(data.user?.isDemo));
    setCollege(data.profile?.college || '');
    setCourse(data.profile?.course || '');
    setStudyYear(data.profile?.studyYear || '3rd Year');
    setTargetRole(data.profile?.targetRole || 'Frontend');
    setWorkMode(data.profile?.workMode || 'Remote or Hybrid');
    setLocation(data.profile?.location || '');
    setWeeklyHours(data.profile?.weeklyHours || 5);
    setResumeUrl(data.profile?.resumeUrl || '');
    setSkills(
      (data.skills || []).map((s) => ({
        name: s.name,
        proficiency: s.proficiency || 'Beginner',
        status: s.status || 'Active'
      }))
    );
    setCatalog(data.catalog || []);
    setCompletion(data.completion || null);
    setInitialSnapshot(data);
    setIsDirty(false);
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/profile');
      applyProfileData(res.data);
    } catch (err) {
      setError(err.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Warn before closing tab with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const addOrUpdateSkill = (skillName, proficiency = 'Intermediate') => {
    const clean = String(skillName || '').trim();
    if (!clean) return;
    setIsDirty(true);
    setSkills((prev) => {
      const idx = prev.findIndex((s) => s.name.toLowerCase() === clean.toLowerCase());
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], proficiency };
        return copy;
      }
      return [...prev, { name: clean, proficiency, status: 'Active' }];
    });
  };

  const removeSkill = (skillName) => {
    setIsDirty(true);
    setSkills((prev) =>
      prev.filter((s) => s.name.toLowerCase() !== skillName.toLowerCase())
    );
  };

  const handleCancelChanges = () => {
    if (initialSnapshot) {
      applyProfileData(initialSnapshot);
      addToast('Reverted unsaved changes.', 'success');
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setError('');
    try {
      setSaving(true);
      const res = await api.put('/api/profile', {
        name: name.trim(),
        college: college.trim(),
        course: course.trim(),
        studyYear: studyYear.trim(),
        targetRole,
        workMode,
        location: location.trim(),
        weeklyHours: Number(weeklyHours) || 5,
        resumeUrl: resumeUrl.trim(),
        onboarded: true,
        skills
      });
      applyProfileData({
        ...initialSnapshot,
        ...res.data
      });
      await refreshIdentity();
      addToast(
        'Profile & skills saved! Your match scores and skill gaps have been updated.',
        'success'
      );
    } catch (err) {
      setError(err.message || 'Could not save profile changes.');
      addToast(err.message || 'Could not save profile changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title="My Profile & Skills"
      primaryCta={
        <div style={{ display: 'flex', gap: 8 }}>
          {isDirty && (
            <Button variant="secondary" size="sm" onClick={handleCancelChanges}>
              <RotateCcw size={14} /> Discard
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveProfile}
            loading={saving}
          >
            <Save size={14} /> Save Profile
          </Button>
        </div>
      }
    >
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card><LoadingSkeleton lines={3} /></Card>
          <Card><LoadingSkeleton lines={6} /></Card>
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {error && (
            <div
              style={{
                backgroundColor: 'var(--color-danger-soft)',
                border: '1px solid var(--color-danger-border)',
                color: 'var(--color-danger)',
                padding: '12px 16px',
                borderRadius: 10,
                fontSize: 13.5
              }}
            >
              {error}
            </div>
          )}

          {isDirty && (
            <div
              style={{
                backgroundColor: 'var(--color-warning-soft)',
                border: '1px solid var(--color-warning-border)',
                color: 'var(--color-warning)',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <AlertCircle size={15} /> You have unsaved changes to your profile or skills.
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" size="sm" onClick={handleCancelChanges}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={saving}>
                  Save Changes Now
                </Button>
              </div>
            </div>
          )}

          {/* Profile Completion Card */}
          <Card
            title="Profile Completion Status"
            subtitle="Complete every field so SkillBridge AI can compute accurate match scores and roadmaps"
          >
            <ProgressBar
              value={completion?.percentage || 0}
              label={`${completion?.completedCount || 0} of ${completion?.totalCount || 7} core profile sections complete`}
            />
            {completion?.missingHints?.length > 0 ? (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, color: 'var(--color-muted)', fontWeight: 600 }}>
                  Missing fields:
                </span>
                {completion.missingHints.map((hint) => (
                  <Badge key={hint} variant="warning">
                    {hint}
                  </Badge>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: 10, fontSize: 13, color: 'var(--color-teal)', fontWeight: 600 }}>
                ✓ Your profile is 100% complete!
              </div>
            )}
          </Card>

          {/* Academic & Career Details */}
          <Card
            title="Academic & Career Preferences"
            subtitle={
              isDemoUser
                ? 'DEMO PROFILE — Editing these fields updates the isolated Demo Student session.'
                : `Account Email: ${email}`
            }
          >
            <div className="grid-2">
              <FormField label="Full Name">
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsDirty(true);
                  }}
                />
              </FormField>

              <FormField label="Target Career Role">
                <select
                  className="form-select"
                  value={targetRole}
                  onChange={(e) => {
                    setTargetRole(e.target.value);
                    setIsDirty(true);
                  }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="College / University">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., State Institute of Technology"
                  value={college}
                  onChange={(e) => {
                    setCollege(e.target.value);
                    setIsDirty(true);
                  }}
                />
              </FormField>

              <FormField label="Course / Degree">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., B.Tech Computer Science"
                  value={course}
                  onChange={(e) => {
                    setCourse(e.target.value);
                    setIsDirty(true);
                  }}
                />
              </FormField>

              <FormField label="Current Study Year">
                <select
                  className="form-select"
                  value={studyYear}
                  onChange={(e) => {
                    setStudyYear(e.target.value);
                    setIsDirty(true);
                  }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year / Final Year">4th Year / Final Year</option>
                  <option value="Recent Graduate / Fresher">Recent Graduate / Fresher</option>
                </select>
              </FormField>

              <FormField label="Preferred Work Mode">
                <select
                  className="form-select"
                  value={workMode}
                  onChange={(e) => {
                    setWorkMode(e.target.value);
                    setIsDirty(true);
                  }}
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote or Hybrid">Remote or Hybrid</option>
                </select>
              </FormField>

              <FormField label="Preferred Location">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Bengaluru / Remote"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setIsDirty(true);
                  }}
                />
              </FormField>

              <FormField
                label="Weekly Learning Hours (1–60)"
                helper="Used to pace your weekly Career Roadmap"
              >
                <input
                  type="number"
                  min={1}
                  max={60}
                  className="form-input"
                  value={weeklyHours}
                  onChange={(e) => {
                    setWeeklyHours(e.target.value);
                    setIsDirty(true);
                  }}
                />
              </FormField>
            </div>

            <FormField
              label="Resume / Portfolio URL (Optional)"
              helper="Paste a link to your Google Drive resume, GitHub profile, or portfolio website (must start with http:// or https://)"
            >
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/your-username"
                  value={resumeUrl}
                  onChange={(e) => {
                    setResumeUrl(e.target.value);
                    setIsDirty(true);
                  }}
                />
                {resumeUrl && /^https?:\/\/.+/i.test(resumeUrl) && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                  >
                    <ExternalLink size={14} /> Open
                  </a>
                )}
              </div>
            </FormField>
          </Card>

          {/* Skills & Proficiency Manager */}
          <Card
            title={`Your Skills & Proficiency (${skills.length})`}
            subtitle="Adding or removing skills immediately updates your Internship Match Scores and Skill-Gap analysis once saved."
          >
            {/* Quick-Add Catalog */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 8 }}>
                Click to toggle skills from catalog:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {catalog.map((catSkill) => {
                  const hasIt = skills.some(
                    (s) => s.name.toLowerCase() === catSkill.name.toLowerCase()
                  );
                  return (
                    <button
                      key={catSkill.id}
                      type="button"
                      onClick={() =>
                        hasIt
                          ? removeSkill(catSkill.name)
                          : addOrUpdateSkill(catSkill.name, 'Intermediate')
                      }
                      className={`btn btn-sm ${hasIt ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {hasIt ? <Check size={13} /> : <Plus size={13} />} {catSkill.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Skill Input */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                alignItems: 'flex-end',
                padding: 14,
                borderRadius: 10,
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                marginBottom: 18
              }}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 4 }}>
                  Add Custom Skill
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a skill (e.g., React, SQL, Docker)..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                />
              </div>

              <div style={{ width: 160 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 4 }}>
                  Proficiency Level
                </label>
                <select
                  className="form-select"
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  addOrUpdateSkill(newSkillName, newSkillProficiency);
                  setNewSkillName('');
                }}
              >
                <Plus size={15} /> Add Skill
              </Button>
            </div>

            {/* Current Skills List */}
            {skills.length === 0 ? (
              <p style={{ fontSize: 13.5, color: 'var(--color-muted)' }}>
                No skills listed. Add at least one skill above to enable personalized matching.
              </p>
            ) : (
              <div className="grid-2">
                {skills.map((sk) => (
                  <div
                    key={sk.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>{sk.name}</span>
                      {sk.status && sk.status !== 'Active' && (
                        <Badge variant="indigo" className="ml-2" style={{ marginLeft: 8 }}>
                          {sk.status}
                        </Badge>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        className="form-select"
                        style={{ width: 135, padding: '4px 8px', fontSize: 13 }}
                        value={sk.proficiency}
                        onChange={(e) => addOrUpdateSkill(sk.name, e.target.value)}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(sk.name)}
                        style={{ color: 'var(--color-danger)' }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                marginTop: 22,
                paddingTop: 16,
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10
              }}
            >
              {isDirty && (
                <Button type="button" variant="secondary" onClick={handleCancelChanges}>
                  Cancel Changes
                </Button>
              )}
              <Button type="submit" variant="primary" loading={saving}>
                <Save size={15} /> Save Profile & Recalculate Matches
              </Button>
            </div>
          </Card>
        </form>
      )}
    </AppShell>
  );
}
