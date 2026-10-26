import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Button,
  Card,
  FormField,
  SkillChip,
  Badge,
  ProgressBar
} from '../components/ui.jsx';

const STEPS = [
  'Basic Info',
  'Career Goal',
  'Skills',
  'Preferences',
  'Review'
];

const ROLES = [
  { id: 'Frontend', label: 'Frontend Developer', desc: 'HTML, CSS, JavaScript, React, responsive UI' },
  { id: 'Backend', label: 'Backend Developer', desc: 'Node.js, Express, SQL, REST APIs' },
  { id: 'Full-Stack', label: 'Full-Stack Developer', desc: 'React + Node.js + SQL end-to-end apps' },
  { id: 'Python', label: 'Python Developer', desc: 'Python scripting, SQL, REST APIs, testing' },
  { id: 'Data Analyst', label: 'Data Analyst', desc: 'SQL, Excel, Python, Pandas, Visualization' },
  { id: 'beginner ML', label: 'Machine Learning (Beginner)', desc: 'Python, NumPy, Pandas, Scikit-Learn, Statistics' },
  { id: 'UI/UX', label: 'UI/UX Designer', desc: 'User Research, Wireframing, Figma, Prototyping' }
];

const QUICK_SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express',
  'SQL', 'Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'Excel',
  'Data Visualization', 'Statistics', 'Figma', 'Wireframing',
  'Prototyping', 'User Research', 'Git', 'REST APIs', 'TypeScript', 'Tailwind CSS'
];

export default function OnboardingPage() {
  const { user, profile, skills: existingSkills, refreshIdentity, addToast } = useAuth();
  const [step, setStep] = useState(0);
  const [college, setCollege] = useState(profile?.college || '');
  const [course, setCourse] = useState(profile?.course || '');
  const [studyYear, setStudyYear] = useState(profile?.studyYear || '3rd Year');
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'Frontend');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillName, setCustomSkillName] = useState('');
  const [customProficiency, setCustomProficiency] = useState('Beginner');
  const [workMode, setWorkMode] = useState(profile?.workMode || 'Remote or Hybrid');
  const [location, setLocation] = useState(profile?.location || 'Remote / Bengaluru');
  const [weeklyHours, setWeeklyHours] = useState(profile?.weeklyHours || 6);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (existingSkills && existingSkills.length > 0 && selectedSkills.length === 0) {
      setSelectedSkills(
        existingSkills.map((s) => ({
          name: s.name,
          proficiency: s.proficiency || 'Beginner',
          status: s.status || 'Active'
        }))
      );
    }
  }, [existingSkills]);

  const addOrUpdateSkill = (name, proficiency = 'Beginner') => {
    const clean = name.trim();
    if (!clean) return;
    setSelectedSkills((prev) => {
      const existsIdx = prev.findIndex((p) => p.name.toLowerCase() === clean.toLowerCase());
      if (existsIdx >= 0) {
        const copy = [...prev];
        copy[existsIdx] = { ...copy[existsIdx], proficiency };
        return copy;
      }
      return [...prev, { name: clean, proficiency, status: 'Active' }];
    });
  };

  const removeSkill = (name) => {
    setSelectedSkills((prev) =>
      prev.filter((p) => p.name.toLowerCase() !== name.toLowerCase())
    );
  };

  const handleNext = () => {
    setError('');
    if (step === 0) {
      if (!college.trim() || !course.trim() || !studyYear.trim()) {
        setError('Please fill in your college/university, course, and current study year.');
        return;
      }
    }
    if (step === 1 && !targetRole) {
      setError('Please select a target career role.');
      return;
    }
    if (step === 2 && selectedSkills.length === 0) {
      setError('Please select at least 1 current skill so we can compute accurate match scores.');
      return;
    }
    if (step === 3) {
      const hrs = Number(weeklyHours);
      if (Number.isNaN(hrs) || hrs < 1 || hrs > 60) {
        setError('Weekly learning hours must be between 1 and 60.');
        return;
      }
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const handleBack = () => {
    setError('');
    setStep((s) => Math.max(0, s - 1));
  };

  const handleCompleteOnboarding = async () => {
    try {
      setSaving(true);
      setError('');
      await api.put('/api/profile', {
        college: college.trim(),
        course: course.trim(),
        studyYear: studyYear.trim(),
        targetRole,
        workMode,
        location: location.trim(),
        weeklyHours: Number(weeklyHours) || 5,
        onboarded: true,
        skills: selectedSkills
      });
      await refreshIdentity();
      addToast('Onboarding complete! Here are your personalized matches.', 'success');
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save onboarding details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '36px 20px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
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
        <div>
          <h1 style={{ fontSize: 22 }}>Welcome to SkillBridge AI, {user?.name || 'Student'}</h1>
          <p style={{ fontSize: 13.5, color: 'var(--color-muted)' }}>
            Let’s set up your profile in 5 quick steps so your match scores and roadmap are accurate.
          </p>
        </div>
      </div>

      {/* Stepper Indicator */}
      <div style={{ marginBottom: 24 }}>
        <ProgressBar
          value={((step + 1) / STEPS.length) * 100}
          label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 10,
            gap: 8,
            flexWrap: 'wrap'
          }}
        >
          {STEPS.map((label, idx) => (
            <span
              key={label}
              style={{
                fontSize: 12,
                fontWeight: idx === step ? 700 : 500,
                color:
                  idx === step
                    ? 'var(--color-primary)'
                    : idx < step
                      ? 'var(--color-teal)'
                      : 'var(--color-muted)'
              }}
            >
              {idx < step ? '✓ ' : `${idx + 1}. `}
              {label}
            </span>
          ))}
        </div>
      </div>

      <Card>
        {error && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-soft)',
              border: '1px solid var(--color-danger-border)',
              color: 'var(--color-danger)',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13.5,
              marginBottom: 18
            }}
          >
            {error}
          </div>
        )}

        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 19, marginBottom: 6 }}>1. Basic Academic Information</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: 13.5, marginBottom: 20 }}>
              Tell us where you are currently studying. (Note: College prestige is never used in
              skill-fit calculations.)
            </p>

            <FormField label="College / University Name">
              <input
                type="text"
                className="form-input"
                placeholder="e.g., National Institute of Technology / State Engineering College"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </FormField>

            <div className="grid-2">
              <FormField label="Degree / Course">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., B.Tech Computer Science / BCA"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </FormField>

              <FormField label="Current Study Year">
                <select
                  className="form-select"
                  value={studyYear}
                  onChange={(e) => setStudyYear(e.target.value)}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year / Final Year">4th Year / Final Year</option>
                  <option value="Recent Graduate / Fresher">Recent Graduate / Fresher</option>
                </select>
              </FormField>
            </div>
          </div>
        )}

        {/* Step 1: Career Goal */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 19, marginBottom: 6 }}>2. Choose Your Target Internship Role</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: 13.5, marginBottom: 20 }}>
              We use your target role to benchmark your skill gaps and sequence your learning roadmap.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ROLES.map((r) => {
                const selected = targetRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setTargetRole(r.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      padding: '14px 16px',
                      borderRadius: 10,
                      border: selected
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                      backgroundColor: selected ? 'var(--color-primary-soft)' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: 15 }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>
                        Key stack: {r.desc}
                      </div>
                    </div>
                    {selected && <Badge variant="indigo">Selected</Badge>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 19, marginBottom: 6 }}>3. Your Current Skills & Proficiency</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: 13.5, marginBottom: 16 }}>
              Click skills below to add them, or type any skill and choose your proficiency level.
            </p>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8, color: 'var(--color-muted)' }}>
                Quick-Add Popular Skills:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK_SKILLS.map((sk) => {
                  const isAdded = selectedSkills.some(
                    (s) => s.name.toLowerCase() === sk.toLowerCase()
                  );
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() =>
                        isAdded ? removeSkill(sk) : addOrUpdateSkill(sk, 'Intermediate')
                      }
                      className={`btn btn-sm ${isAdded ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {isAdded ? <Check size={13} /> : <Plus size={13} />} {sk}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                marginBottom: 20,
                padding: 14,
                backgroundColor: 'var(--color-bg)',
                borderRadius: 10,
                border: '1px solid var(--color-border)'
              }}
            >
              <div style={{ flex: 1, minWidth: 180 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 4 }}>
                  Add Custom Skill
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., PostgreSQL, Docker"
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                />
              </div>
              <div style={{ width: 150 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 4 }}>
                  Proficiency
                </label>
                <select
                  className="form-select"
                  value={customProficiency}
                  onChange={(e) => setCustomProficiency(e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  addOrUpdateSkill(customSkillName, customProficiency);
                  setCustomSkillName('');
                }}
              >
                <Plus size={15} /> Add
              </Button>
            </div>

            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>
                Your Selected Skills ({selectedSkills.length})
              </div>
              {selectedSkills.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                  No skills selected yet. Click any skill above to add it.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedSkills.map((sk) => (
                    <div
                      key={sk.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--color-border)',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{sk.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <select
                          className="form-select"
                          style={{ width: 140, padding: '4px 8px', fontSize: 13 }}
                          value={sk.proficiency}
                          onChange={(e) => addOrUpdateSkill(sk.name, e.target.value)}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(sk.name)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 19, marginBottom: 6 }}>4. Work & Study Preferences</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: 13.5, marginBottom: 20 }}>
              Set your preferred internship work mode and how many hours per week you can dedicate to
              closing skill gaps.
            </p>

            <div className="grid-2">
              <FormField label="Preferred Work Mode">
                <select
                  className="form-select"
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote or Hybrid">Remote or Hybrid</option>
                </select>
              </FormField>

              <FormField label="Preferred City / Location">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Bengaluru, Remote, Pune"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </FormField>
            </div>

            <FormField
              label="Weekly Learning Hours Available"
              helper="Used to pace your weekly Career Roadmap tasks realistically (1–60 hrs/week)."
            >
              <input
                type="number"
                min={1}
                max={60}
                className="form-input"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
              />
            </FormField>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 19, marginBottom: 6 }}>5. Review Your Career Profile</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: 13.5, marginBottom: 20 }}>
              Confirm your details below. You can update any of these anytime from My Profile.
            </p>

            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: 10,
                padding: 18,
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginBottom: 16
              }}
            >
              <div className="grid-2">
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>College & Course</div>
                  <div style={{ fontWeight: 600 }}>
                    {college} — {course} ({studyYear})
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Target Role</div>
                  <div style={{ fontWeight: 600 }}>{targetRole}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Work Preference</div>
                  <div style={{ fontWeight: 600 }}>
                    {workMode} • {location}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Weekly Study Pace</div>
                  <div style={{ fontWeight: 600 }}>{weeklyHours} hours / week</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>
                  Skills ({selectedSkills.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedSkills.map((sk) => (
                    <SkillChip
                      key={sk.name}
                      name={sk.name}
                      level={sk.proficiency}
                      variant="matched"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid var(--color-border)'
          }}
        >
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={step === 0 || saving}
          >
            <ArrowLeft size={15} /> Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button variant="primary" onClick={handleNext}>
              Next Step <ArrowRight size={15} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleCompleteOnboarding}
              loading={saving}
            >
              <Check size={16} /> Save & Open Dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
