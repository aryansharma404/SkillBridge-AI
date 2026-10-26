import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Calendar,
  Info,
  RefreshCw,
  LayoutGrid,
  List
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../layouts/AppShell.jsx';
import {
  Card,
  Badge,
  Button,
  FormField,
  EmptyState,
  ConfirmDialog,
  LoadingSkeleton
} from '../components/ui.jsx';

const STATUSES = ['Interested', 'Applied', 'Interview', 'Offer', 'Rejected'];

export default function ApplicationTrackerPage() {
  const { addToast } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    activeCount: 0,
    countsByStatus: {
      Interested: 0,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // kanban | list

  // Create / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('Interested');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await api.get(`/api/applications?${params.toString()}`);
      setApplications(res.data.applications || []);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.message || 'Unable to load your application tracker.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const openCreateModal = () => {
    setEditingApp(null);
    setTitle('');
    setCompany('');
    setStatus('Interested');
    setDeadline('');
    setNotes('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (app) => {
    setEditingApp(app);
    setTitle(app.title || '');
    setCompany(app.company || '');
    setStatus(app.status || 'Interested');
    setDeadline(app.deadline || '');
    setNotes(app.notes || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveApplication = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim() || !company.trim()) {
      setFormError('Both Role Title and Company Name are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingApp) {
        const res = await api.patch(`/api/applications/${editingApp.id}`, {
          title: title.trim(),
          company: company.trim(),
          status,
          deadline: deadline.trim() || null,
          notes: notes.trim()
        });
        addToast(res.message, 'success');
      } else {
        const res = await api.post('/api/applications', {
          title: title.trim(),
          company: company.trim(),
          status,
          deadline: deadline.trim() || null,
          notes: notes.trim()
        });
        addToast(res.message, 'success');
      }
      setModalOpen(false);
      await loadApplications();
    } catch (err) {
      setFormError(err.message || 'Failed to save application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (appId, nextStatus) => {
    try {
      const res = await api.patch(`/api/applications/${appId}`, { status: nextStatus });
      addToast(res.message, 'success');
      await loadApplications();
    } catch (err) {
      addToast(err.message || 'Could not update status.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/api/applications/${deleteTarget.id}`);
      addToast(res.message, 'success');
      setDeleteTarget(null);
      await loadApplications();
    } catch (err) {
      addToast(err.message || 'Failed to delete application.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const statusBadgeVariant = (st) => {
    if (st === 'Offer') return 'teal';
    if (st === 'Interview') return 'indigo';
    if (st === 'Applied') return 'indigo';
    if (st === 'Rejected') return 'danger';
    return 'neutral';
  };

  return (
    <AppShell
      title="Personal Application Tracker"
      primaryCta={
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus size={15} /> Add Opportunity
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Honesty Disclosure Banner (Section 4.9) */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            backgroundColor: 'var(--color-primary-soft)',
            border: '1px solid #C7D2FE',
            fontSize: 13,
            color: 'var(--color-navy)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <Info size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <span>
            <strong>Tracker Honesty Note:</strong> Changing a record’s status to{' '}
            <em>Applied</em> updates your personal organizer only—it does not submit an external
            application on a company portal.
          </span>
        </div>

        {/* Derived Statistics Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12
          }}
        >
          {STATUSES.map((st) => (
            <Card key={st} style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 600 }}>
                  {st}
                </span>
                <Badge variant={statusBadgeVariant(st)}>
                  {stats.countsByStatus?.[st] || 0}
                </Badge>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
                {stats.countsByStatus?.[st] || 0}
              </div>
            </Card>
          ))}
        </div>

        {/* Search, Status Filter & View Switcher */}
        <Card>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1, minWidth: 260 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-muted)'
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 34 }}
                  placeholder="Search role title, company, or notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: 'auto' }}
                aria-label="Filter by application status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses ({stats.total})</option>
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st} ({stats.countsByStatus?.[st] || 0})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button
                variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid size={14} /> Board View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={14} /> List View
              </Button>
              <Button variant="primary" size="sm" onClick={openCreateModal}>
                <Plus size={14} /> Add Custom Role
              </Button>
            </div>
          </div>
        </Card>

        {loading && (
          <Card>
            <LoadingSkeleton lines={4} height={26} />
          </Card>
        )}

        {!loading && error && (
          <Card title="Could not load applications">
            <p style={{ color: 'var(--color-muted)', marginBottom: 14 }}>{error}</p>
            <Button variant="primary" onClick={loadApplications}>
              <RefreshCw size={15} /> Retry
            </Button>
          </Card>
        )}

        {!loading && !error && applications.length === 0 && (
          <EmptyState
            title="No Applications in Tracker Yet"
            description="Add an opportunity from the Internship Explorer or click 'Add Custom Role' to track your applications from Interested to Offer."
            actionLabel="Add Opportunity Manually"
            onAction={openCreateModal}
          />
        )}

        {/* Kanban Columns View */}
        {!loading && !error && applications.length > 0 && viewMode === 'kanban' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))',
              gap: 14,
              alignItems: 'flex-start'
            }}
          >
            {STATUSES.filter((st) => statusFilter === 'All' || statusFilter === st).map(
              (colStatus) => {
                const colItems = applications.filter((a) => a.status === colStatus);
                return (
                  <div
                    key={colStatus}
                    style={{
                      backgroundColor: '#F1F5F9',
                      borderRadius: 12,
                      padding: 12,
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                        padding: '0 4px'
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{colStatus}</span>
                      <Badge variant={statusBadgeVariant(colStatus)}>{colItems.length}</Badge>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {colItems.length === 0 ? (
                        <div
                          style={{
                            padding: '18px 10px',
                            textAlign: 'center',
                            fontSize: 12.5,
                            color: 'var(--color-muted)',
                            border: '1px dashed var(--color-border)',
                            borderRadius: 8
                          }}
                        >
                          No items in {colStatus}
                        </div>
                      ) : (
                        colItems.map((app) => (
                          <div
                            key={app.id}
                            className="card"
                            style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}
                          >
                            <div>
                              <h4 style={{ fontSize: 15, marginBottom: 2 }}>{app.title}</h4>
                              <div
                                style={{
                                  fontSize: 13,
                                  color: 'var(--color-muted)',
                                  fontWeight: 500
                                }}
                              >
                                {app.company}
                              </div>
                            </div>

                            {app.deadline && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: 'var(--color-warning)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <Calendar size={12} /> Deadline: {app.deadline}
                              </div>
                            )}

                            {app.notes && (
                              <p
                                style={{
                                  fontSize: 12.5,
                                  color: 'var(--color-muted)',
                                  backgroundColor: 'var(--color-bg)',
                                  padding: 8,
                                  borderRadius: 6
                                }}
                              >
                                {app.notes}
                              </p>
                            )}

                            <div>
                              <label
                                style={{
                                  fontSize: 11,
                                  color: 'var(--color-muted)',
                                  display: 'block',
                                  marginBottom: 4
                                }}
                              >
                                Move Status:
                              </label>
                              <select
                                className="form-select"
                                style={{ padding: '4px 8px', fontSize: 12.5 }}
                                value={app.status}
                                onChange={(e) =>
                                  handleQuickStatusChange(app.id, e.target.value)
                                }
                              >
                                {STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 6,
                                paddingTop: 6,
                                borderTop: '1px solid var(--color-border)'
                              }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(app)}
                              >
                                <Edit3 size={13} /> Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTarget(app)}
                                style={{ color: 'var(--color-danger)' }}
                              >
                                <Trash2 size={13} /> Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* Grouped List View */}
        {!loading && !error && applications.length > 0 && viewMode === 'list' && (
          <Card title={`Tracked Applications (${applications.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {applications.map((app) => (
                <div
                  key={app.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    padding: 14,
                    borderRadius: 10,
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15.5 }}>{app.title}</span>
                      <Badge variant={statusBadgeVariant(app.status)}>{app.status}</Badge>
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--color-muted)' }}>
                      {app.company}
                      {app.deadline ? ` • Deadline: ${app.deadline}` : ''}
                    </div>
                    {app.notes && (
                      <div style={{ fontSize: 12.5, color: 'var(--color-muted)', marginTop: 4 }}>
                        Notes: {app.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <select
                      className="form-select"
                      style={{ width: 135, padding: '6px 8px', fontSize: 13 }}
                      value={app.status}
                      onChange={(e) => handleQuickStatusChange(app.id, e.target.value)}
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <Button variant="secondary" size="sm" onClick={() => openEditModal(app)}>
                      <Edit3 size={14} /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(app)}
                      style={{ color: 'var(--color-danger)' }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Create / Edit Application Modal */}
      {modalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 style={{ fontSize: 18, marginBottom: 14 }}>
              {editingApp ? 'Edit Tracked Application' : 'Add Opportunity to Tracker'}
            </h3>

            {formError && (
              <div
                style={{
                  backgroundColor: 'var(--color-danger-soft)',
                  border: '1px solid var(--color-danger-border)',
                  color: 'var(--color-danger)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 12
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveApplication}>
              <FormField label="Role Title *">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Frontend Developer Intern"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Company Name *">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., NovaCraft Studio"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </FormField>

              <div className="grid-2">
                <FormField label="Status">
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Deadline (Optional)">
                  <input
                    type="date"
                    className="form-input"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </FormField>
              </div>

              <FormField label="Notes / Next Steps">
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Interview prep notes, referral contact, or missing skill to brush up..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </FormField>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <Button
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  {editingApp ? 'Save Changes' : 'Add to Tracker'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Application from Tracker?"
        description={
          deleteTarget
            ? `Are you sure you want to remove "${deleteTarget.title}" at ${deleteTarget.company} from your tracker?`
            : ''
        }
        confirmLabel="Delete Record"
        variant="destructive"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}
