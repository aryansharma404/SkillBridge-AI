import React, { useState, useEffect, useCallback } from 'react';
import {
  Map,
  CheckCircle2,
  Circle,
  Edit3,
  RefreshCw,
  Clock,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../layouts/AppShell.jsx';
import {
  Card,
  Badge,
  Button,
  ProgressBar,
  EmptyState,
  ConfirmDialog,
  FormField,
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

export default function RoadmapPage() {
  const { addToast } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [targetRole, setTargetRole] = useState('Frontend');
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Edit step state
  const [editingStepId, setEditingStepId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editObjective, setEditObjective] = useState('');
  const [editTask, setEditTask] = useState('');
  const [editHours, setEditHours] = useState(5);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadRoadmap = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/roadmap');
      setRoadmap(res.data.roadmap);
      if (res.data.roadmap?.targetRole) {
        setTargetRole(res.data.roadmap.targetRole);
      } else if (res.data.targetRole) {
        setTargetRole(res.data.targetRole);
      }
      if (res.data.weeklyHours) {
        setWeeklyHours(res.data.weeklyHours);
      }
    } catch (err) {
      setError(err.message || 'Unable to load your career roadmap.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  const executeGenerate = async () => {
    try {
      setGenerating(true);
      setConfirmRegenerateOpen(false);
      const res = await api.post('/api/roadmap/generate', {
        targetRole,
        weeklyHours: Number(weeklyHours) || 5
      });
      setRoadmap(res.data.roadmap);
      addToast(res.message, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to generate roadmap.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleRequestGenerate = () => {
    if (roadmap && roadmap.steps?.length > 0) {
      setConfirmRegenerateOpen(true);
    } else {
      executeGenerate();
    }
  };

  const handleToggleComplete = async (step) => {
    try {
      setTogglingId(step.id);
      const nextCompleted = !step.completedAt;
      const res = await api.patch(`/api/roadmap/steps/${step.id}`, {
        completed: nextCompleted
      });
      setRoadmap(res.data.roadmap);
      addToast(
        nextCompleted ? `Completed "${step.title}"!` : `Marked "${step.title}" as incomplete.`,
        'success'
      );
    } catch (err) {
      addToast(err.message || 'Failed to update step completion.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const startEditStep = (step) => {
    setEditingStepId(step.id);
    setEditTitle(step.title);
    setEditObjective(step.objective);
    setEditTask(step.task);
    setEditHours(step.estimatedHours || 5);
  };

  const handleSaveStepEdit = async (stepId) => {
    if (!editTitle.trim()) {
      addToast('Step title cannot be empty.', 'error');
      return;
    }
    try {
      setSavingEdit(true);
      const res = await api.patch(`/api/roadmap/steps/${stepId}`, {
        title: editTitle.trim(),
        objective: editObjective.trim(),
        task: editTask.trim(),
        estimatedHours: Number(editHours) || 5
      });
      setRoadmap(res.data.roadmap);
      setEditingStepId(null);
      addToast('Roadmap step updated.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save step changes.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <AppShell
      title="Personalized Career Roadmap"
      primaryCta={
        <Button
          variant="primary"
          size="sm"
          onClick={handleRequestGenerate}
          loading={generating}
        >
          <Sparkles size={15} /> {roadmap ? 'Regenerate Plan' : 'Generate Plan'}
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Generator Controls & Progress Summary */}
        <Card
          title="Roadmap Configuration & Progress"
          subtitle="Sequenced weekly tasks tailored to your target role, existing skills, missing skill gaps, and study pace"
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              alignItems: 'flex-end',
              marginBottom: roadmap ? 20 : 0
            }}
          >
            <div style={{ minWidth: 200, flex: 1 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>
                Target Career Role
              </label>
              <select
                className="form-select"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ width: 180 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>
                Weekly Study Hours
              </label>
              <input
                type="number"
                min={1}
                max={60}
                className="form-input"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
              />
            </div>

            <Button
              variant="primary"
              onClick={handleRequestGenerate}
              loading={generating}
            >
              <RefreshCw size={15} /> {roadmap ? 'Regenerate Roadmap' : 'Generate My Roadmap'}
            </Button>
          </div>

          {roadmap && (
            <div
              style={{
                paddingTop: 18,
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 20
              }}
            >
              <div style={{ flex: 1, minWidth: 260 }}>
                <ProgressBar
                  value={roadmap.progressPercentage || 0}
                  label={`Completion Progress: ${roadmap.completedSteps} of ${roadmap.totalSteps} weekly steps completed`}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {roadmap.source === 'ai-assisted' ? (
                  <Badge variant="indigo">Source: AI-Assisted Plan (Gemini)</Badge>
                ) : (
                  <Badge variant="neutral">
                    Source: Deterministic Rule-Based Engine (No API Key Required)
                  </Badge>
                )}
              </div>
            </div>
          )}
        </Card>

        {loading && (
          <Card>
            <LoadingSkeleton lines={5} height={26} />
          </Card>
        )}

        {!loading && error && (
          <Card title="Could not load roadmap">
            <p style={{ color: 'var(--color-muted)', marginBottom: 14 }}>{error}</p>
            <Button variant="primary" onClick={loadRoadmap}>
              <RefreshCw size={15} /> Retry
            </Button>
          </Card>
        )}

        {!loading && !error && (!roadmap || roadmap.steps?.length === 0) && (
          <EmptyState
            title="No Career Roadmap Generated Yet"
            description="Click 'Generate My Roadmap' above to turn your missing role skills into a clear week-by-week learning plan."
            actionLabel="Generate My Roadmap"
            onAction={executeGenerate}
          />
        )}

        {!loading && !error && roadmap && roadmap.steps?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {roadmap.steps.map((step) => {
              const isCompleted = Boolean(step.completedAt);
              const isEditing = editingStepId === step.id;

              return (
                <div
                  key={step.id}
                  className="card"
                  style={{
                    borderLeft: isCompleted
                      ? '4px solid var(--color-teal)'
                      : '4px solid var(--color-primary)',
                    backgroundColor: isCompleted ? 'var(--color-teal-soft)' : '#FFFFFF'
                  }}
                >
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="grid-2">
                        <FormField label="Step Title">
                          <input
                            type="text"
                            className="form-input"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </FormField>
                        <FormField label="Estimated Effort (Hours)">
                          <input
                            type="number"
                            min={1}
                            max={60}
                            className="form-input"
                            value={editHours}
                            onChange={(e) => setEditHours(e.target.value)}
                          />
                        </FormField>
                      </div>

                      <FormField label="Learning Objective">
                        <input
                          type="text"
                          className="form-input"
                          value={editObjective}
                          onChange={(e) => setEditObjective(e.target.value)}
                        />
                      </FormField>

                      <FormField label="Practical Task / Deliverable">
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={editTask}
                          onChange={(e) => setEditTask(e.target.value)}
                        />
                      </FormField>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingStepId(null)}
                          disabled={savingEdit}
                        >
                          <X size={14} /> Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveStepEdit(step.id)}
                          loading={savingEdit}
                        >
                          <Check size={14} /> Save Step
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 16
                      }}
                    >
                      <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 260 }}>
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(step)}
                          disabled={togglingId === step.id}
                          aria-label={
                            isCompleted
                              ? `Mark ${step.title} incomplete`
                              : `Mark ${step.title} complete`
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            marginTop: 2,
                            cursor: 'pointer',
                            color: isCompleted ? 'var(--color-teal)' : 'var(--color-muted)'
                          }}
                        >
                          {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </button>

                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              flexWrap: 'wrap',
                              marginBottom: 4
                            }}
                          >
                            <Badge variant={isCompleted ? 'teal' : 'indigo'}>
                              Sequence #{step.sequence}
                            </Badge>
                            <span
                              style={{
                                fontSize: 12.5,
                                color: 'var(--color-muted)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <Clock size={13} /> Est. {step.estimatedHours} hrs
                            </span>
                            {isCompleted && <Badge variant="teal">Completed</Badge>}
                          </div>

                          <h3
                            style={{
                              fontSize: 17,
                              marginBottom: 6,
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              opacity: isCompleted ? 0.85 : 1
                            }}
                          >
                            {step.title}
                          </h3>

                          <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 8 }}>
                            <strong>Objective:</strong> {step.objective}
                          </p>

                          <div
                            style={{
                              padding: '10px 12px',
                              borderRadius: 8,
                              backgroundColor: isCompleted ? '#FFFFFF' : 'var(--color-bg)',
                              border: '1px solid var(--color-border)',
                              fontSize: 13.5
                            }}
                          >
                            <strong>Practical Task:</strong> {step.task}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditStep(step)}
                        >
                          <Edit3 size={14} /> Edit
                        </Button>
                        <Button
                          variant={isCompleted ? 'secondary' : 'teal'}
                          size="sm"
                          loading={togglingId === step.id}
                          onClick={() => handleToggleComplete(step)}
                        >
                          {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmRegenerateOpen}
        title="Regenerate Your Career Roadmap?"
        description={`This will replace your current roadmap with a fresh weekly sequence for ${targetRole} (${weeklyHours} hrs/week) based on your latest profile skills. Steps with matching titles that you already completed will be preserved.`}
        confirmLabel="Yes, Regenerate Plan"
        variant="primary"
        loading={generating}
        onConfirm={executeGenerate}
        onCancel={() => setConfirmRegenerateOpen(false)}
      />
    </AppShell>
  );
}
