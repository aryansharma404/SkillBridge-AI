import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, Bookmark, AlertCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../layouts/AppShell.jsx';
import {
  Card,
  Button,
  Badge,
  InternshipCard,
  EmptyState,
  LoadingSkeleton
} from '../components/ui.jsx';

export default function InternshipExplorerPage() {
  const { addToast, isDemo } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/demo') || isDemo ? '/demo' : '/app';

  const [internships, setInternships] = useState([]);
  const [hasUserSkills, setHasUserSkills] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('All');
  const [workMode, setWorkMode] = useState('All');
  const [city, setCity] = useState('All');
  const [experienceLevel, setExperienceLevel] = useState('All');
  const [minStipend, setMinStipend] = useState('');
  const [savedOnly, setSavedOnly] = useState(searchParams.get('saved') === 'true');
  const [sort, setSort] = useState('match');

  const fetchInternships = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (domain !== 'All') params.set('domain', domain);
      if (workMode !== 'All') params.set('workMode', workMode);
      if (city !== 'All') params.set('location', city);
      if (experienceLevel !== 'All') params.set('experienceLevel', experienceLevel);
      if (minStipend) params.set('minStipend', minStipend);
      if (savedOnly) params.set('savedOnly', 'true');
      params.set('sort', sort);

      const res = await api.get(`/api/internships?${params.toString()}`);
      setInternships(res.data.internships || []);
      setHasUserSkills(Boolean(res.data.hasUserSkills));
    } catch (err) {
      setError(err.message || 'Unable to load internship listings.');
    } finally {
      setLoading(false);
    }
  }, [search, domain, workMode, city, experienceLevel, minStipend, savedOnly, sort]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const handleToggleSave = async (internshipId) => {
    try {
      setSavingId(internshipId);
      const res = await api.post(`/api/internships/${internshipId}/save`);
      addToast(res.message, 'success');
      setInternships((prev) =>
        prev.map((item) =>
          item.id === internshipId ? { ...item, isSaved: res.data.isSaved } : item
        )
      );
    } catch (err) {
      addToast(err.message || 'Failed to update saved state.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setDomain('All');
    setWorkMode('All');
    setCity('All');
    setExperienceLevel('All');
    setMinStipend('');
    setSavedOnly(false);
    setSort('match');
  };

  return (
    <AppShell
      title="Explore Internships"
      primaryCta={
        <Link to={`${basePath}/skill-gaps`} className="btn btn-primary btn-sm">
          Analyze Skill Gaps
        </Link>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {!hasUserSkills && !loading && (
          <div
            className="card"
            style={{
              backgroundColor: 'var(--color-warning-soft)',
              borderColor: 'var(--color-warning-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-warning)' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>
                Your profile has no skills listed yet. Add your current skills to calculate personalized match scores.
              </span>
            </div>
            <Link to={`${basePath}/profile`} className="btn btn-primary btn-sm">
              Add Skills Now
            </Link>
          </div>
        )}

        {/* Filter & Search Bar */}
        <Card>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 2, minWidth: 240, position: 'relative' }}>
              <Search
                size={16}
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
                style={{ paddingLeft: 36 }}
                placeholder="Search title, company, domain, or skill (e.g., React, SQL, Python)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ minWidth: 160 }}>
              <select
                className="form-select"
                aria-label="Filter by domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              >
                <option value="All">All Domains</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Full-Stack">Full-Stack</option>
                <option value="Python">Python</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="beginner ML">Machine Learning (Beginner)</option>
                <option value="UI/UX">UI/UX</option>
              </select>
            </div>

            <div style={{ minWidth: 140 }}>
              <select
                className="form-select"
                aria-label="Filter by work mode"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
              >
                <option value="All">All Work Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                aria-label="Filter by location"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="All">All Locations</option>
                <option value="Remote">Remote</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Chennai">Chennai</option>
                <option value="Delhi">Delhi NCR</option>
              </select>

              <select
                className="form-select"
                style={{ width: 'auto' }}
                aria-label="Filter by experience level"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="All">All Experience Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
              </select>

              <select
                className="form-select"
                style={{ width: 'auto' }}
                aria-label="Minimum monthly stipend"
                value={minStipend}
                onChange={(e) => setMinStipend(e.target.value)}
              >
                <option value="">Any Stipend</option>
                <option value="15000">₹15,000+ / mo</option>
                <option value="18000">₹18,000+ / mo</option>
                <option value="20000">₹20,000+ / mo</option>
              </select>

              <Button
                variant={savedOnly ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSavedOnly((v) => !v)}
              >
                <Bookmark size={14} /> {savedOnly ? 'Saved Only' : 'Show Saved'}
              </Button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, color: 'var(--color-muted)', fontWeight: 600 }}>
                Active Sort:
              </span>
              <select
                className="form-select"
                style={{ width: 'auto', fontWeight: 600 }}
                aria-label="Sort internships"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="match">Sort by: Skill Match Score</option>
                <option value="stipend">Sort by: Highest Stipend</option>
                <option value="title">Sort by: Role Title (A–Z)</option>
              </select>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Meta */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8
          }}
        >
          <div style={{ fontSize: 13.5, color: 'var(--color-muted)' }}>
            Showing <strong>{internships.length}</strong> internship opportunities • Sorted by{' '}
            <Badge variant="indigo">
              {sort === 'match'
                ? 'Skill Match Score'
                : sort === 'stipend'
                  ? 'Highest Stipend'
                  : 'Role Title'}
            </Badge>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>
            All seeded demo listings are clearly labeled as <strong>SAMPLE DATA</strong>.
          </div>
        </div>

        {/* Listings Grid */}
        {loading && (
          <div className="grid-2">
            <Card><LoadingSkeleton lines={4} /></Card>
            <Card><LoadingSkeleton lines={4} /></Card>
            <Card><LoadingSkeleton lines={4} /></Card>
            <Card><LoadingSkeleton lines={4} /></Card>
          </div>
        )}

        {!loading && error && (
          <Card title="Could not load internships">
            <p style={{ color: 'var(--color-muted)', marginBottom: 14 }}>{error}</p>
            <Button variant="primary" onClick={fetchInternships}>
              <RefreshCw size={15} /> Retry
            </Button>
          </Card>
        )}

        {!loading && !error && internships.length === 0 && (
          <EmptyState
            title="No matching internships found"
            description="Try clearing your search keyword or adjusting domain and work-mode filters."
            actionLabel="Reset All Filters"
            onAction={resetFilters}
          />
        )}

        {!loading && !error && internships.length > 0 && (
          <div className="grid-2">
            {internships.map((intern) => (
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
    </AppShell>
  );
}
