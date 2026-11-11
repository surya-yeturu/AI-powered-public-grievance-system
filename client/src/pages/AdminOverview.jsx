import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import '../styles/Dashboard.css';

const DEPTS = ['Roads', 'Electricity', 'Drainage', 'Sanitation'];
const EMPTY = { Pending: 0, 'In Progress': 0, Resolved: 0 };
const sumOf = (v) => v.Pending + v['In Progress'] + v.Resolved;

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: 'Roads' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const [a, o] = await Promise.all([adminAPI.getAnalytics(), adminAPI.listOfficials()]);
      setData(a.data.data);
      setOfficials(o.data.data.officials);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createOfficial(form);
      toast.success(`Official created for ${form.department}`);
      setForm({ name: '', email: '', password: '', department: 'Roads' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Failed to create official');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="page-container">
        <div className="stats-grid">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton skeleton-stat" />)}</div>
        <div className="skeleton skeleton-card" />
      </div>
    );
  }

  const t = data?.statusTotals || EMPTY;
  const max = Math.max(1, ...DEPTS.map((d) => sumOf(data?.departments?.[d] || EMPTY)));
  const pct = (n) => `${(n / max) * 100}%`;

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Admin Overview</h1>
          <p className="page-subtitle">System-wide status, escalations and staff management.</p>
        </div>
        <Link to="/admin/escalations" className="btn btn-primary">View escalations</Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><span className="stat-value">{sumOf(t)}</span><span className="stat-label">Total complaints</span></div>
        <div className="stat-card stat-pending"><span className="stat-value">{t.Pending}</span><span className="stat-label">Pending</span></div>
        <div className="stat-card stat-progress"><span className="stat-value">{t['In Progress']}</span><span className="stat-label">In Progress</span></div>
        <div className="stat-card stat-resolved"><span className="stat-value">{t.Resolved}</span><span className="stat-label">Resolved</span></div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span className="stat-value">{data?.escalatedOpen ?? 0}</span><span className="stat-label">Open escalations</span></div>
        <div className="stat-card"><span className="stat-value">{data?.needsReviewOpen ?? 0}</span><span className="stat-label">AI needs review</span></div>
      </div>

      <div className="overview-grid">
        <section className="panel">
          <h2>Complaints by department</h2>
          <div className="chart-bars">
            {DEPTS.map((d) => {
              const v = data?.departments?.[d] || EMPTY;
              return (
                <div key={d} className="chart-row">
                  <span>{d}</span>
                  <div className="chart-track" title={`${v.Pending} pending, ${v['In Progress']} in progress, ${v.Resolved} resolved`}>
                    <span className="chart-seg pending" style={{ width: pct(v.Pending) }} />
                    <span className="chart-seg progress" style={{ width: pct(v['In Progress']) }} />
                    <span className="chart-seg resolved" style={{ width: pct(v.Resolved) }} />
                  </div>
                  <strong>{sumOf(v)}</strong>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <span><i style={{ background: '#f59e0b' }} />Pending</span>
            <span><i style={{ background: '#3b82f6' }} />In Progress</span>
            <span><i style={{ background: '#10b981' }} />Resolved</span>
          </div>
        </section>

        <section className="panel">
          <h2>Add a government official</h2>
          <form onSubmit={handleCreate} className="official-form">
            <div><label htmlFor="of-name">Name</label><input id="of-name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label htmlFor="of-email">Email</label><input id="of-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label htmlFor="of-pass">Password</label><input id="of-pass" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div>
              <label htmlFor="of-dept">Department</label>
              <select id="of-dept" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {DEPTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create official'}</button>
          </form>
          <ul className="official-list">
            {officials.map((o) => (
              <li key={o._id}><span>{o.name} · {o.email}</span><span className="badge department-badge">{o.department}</span></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AdminOverview;
