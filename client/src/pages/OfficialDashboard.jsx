import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import '../styles/Dashboard.css';

const OfficialDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ priority: '', basePriority: '', status: '', department: '' });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (filters.priority) params.basePriority = filters.priority;
      const [complaintsRes, statsRes] = await Promise.all([
        complaintAPI.getDepartmentComplaints(params),
        complaintAPI.getStats()
      ]);
      setComplaints(complaintsRes.data.data.complaints);
      setStats(statsRes.data.data.stats);
    } catch (err) {
      setError('Failed to load complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value === prev[filterType] ? '' : value
    }));
  };

  const getStatusCount = (status) => stats?.byStatus?.find(s => s._id === status)?.count || 0;
  const getPriorityCount = (priority) => stats?.byPriority?.find(p => p._id === priority)?.count || 0;

  const getPriorityClass = (p) => p === 'High' ? 'priority-high' : p === 'Medium' ? 'priority-medium' : 'priority-low';
  const getStatusClass = (s) => s === 'Pending' ? 'status-pending' : s === 'In Progress' ? 'status-in-progress' : 'status-resolved';

  const handleView = (id) => {
    navigate(`/official/complaint/${id}`);
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-container">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">
            {user.role === 'admin' ? 'All Departments' : `${user.department} Department`} Dashboard
          </h1>
          <p className="page-subtitle">
            {user.role === 'admin' ? 'View and oversee all department complaints.' : 'Manage and resolve civic complaints for your department.'}
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{complaints.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card stat-pending">
          <span className="stat-value">{getStatusCount('Pending')}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card stat-progress">
          <span className="stat-value">{getStatusCount('In Progress')}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card stat-resolved">
          <span className="stat-value">{getStatusCount('Resolved')}</span>
          <span className="stat-label">Resolved</span>
        </div>
      </div>

      <div className="priority-stats">
        <div className="priority-stat priority-high">
          <span className="priority-label">High</span>
          <span className="priority-count">{getPriorityCount('High')}</span>
        </div>
        <div className="priority-stat priority-medium">
          <span className="priority-label">Medium</span>
          <span className="priority-count">{getPriorityCount('Medium')}</span>
        </div>
        <div className="priority-stat priority-low">
          <span className="priority-label">Low</span>
          <span className="priority-count">{getPriorityCount('Low')}</span>
        </div>
      </div>

      <div className="filter-section">
        {user.role === 'admin' && (
          <div className="filter-group">
            <label>Department</label>
            <div className="filter-buttons">
              <button type="button" className={`filter-btn ${filters.department === '' ? 'active' : ''}`} onClick={() => handleFilterChange('department', '')}>All</button>
              <button type="button" className={`filter-btn ${filters.department === 'Roads' ? 'active' : ''}`} onClick={() => handleFilterChange('department', 'Roads')}>Roads</button>
              <button type="button" className={`filter-btn ${filters.department === 'Electricity' ? 'active' : ''}`} onClick={() => handleFilterChange('department', 'Electricity')}>Electricity</button>
              <button type="button" className={`filter-btn ${filters.department === 'Drainage' ? 'active' : ''}`} onClick={() => handleFilterChange('department', 'Drainage')}>Drainage</button>
              <button type="button" className={`filter-btn ${filters.department === 'Sanitation' ? 'active' : ''}`} onClick={() => handleFilterChange('department', 'Sanitation')}>Sanitation</button>
            </div>
          </div>
        )}
        <div className="filter-group">
          <label>Status</label>
          <div className="filter-buttons">
            <button type="button" className={`filter-btn ${filters.status === '' ? 'active' : ''}`} onClick={() => handleFilterChange('status', '')}>All</button>
            <button type="button" className={`filter-btn ${filters.status === 'Pending' ? 'active' : ''}`} onClick={() => handleFilterChange('status', 'Pending')}>Pending</button>
            <button type="button" className={`filter-btn ${filters.status === 'In Progress' ? 'active' : ''}`} onClick={() => handleFilterChange('status', 'In Progress')}>In Progress</button>
            <button type="button" className={`filter-btn ${filters.status === 'Resolved' ? 'active' : ''}`} onClick={() => handleFilterChange('status', 'Resolved')}>Resolved</button>
          </div>
        </div>
        <div className="filter-group">
          <label>Base priority</label>
          <div className="filter-buttons">
            <button type="button" className={`filter-btn ${filters.priority === '' ? 'active' : ''}`} onClick={() => handleFilterChange('priority', '')}>All</button>
            <button type="button" className={`filter-btn ${filters.priority === 'High' ? 'active' : ''}`} onClick={() => handleFilterChange('priority', 'High')}>High</button>
            <button type="button" className={`filter-btn ${filters.priority === 'Medium' ? 'active' : ''}`} onClick={() => handleFilterChange('priority', 'Medium')}>Medium</button>
            <button type="button" className={`filter-btn ${filters.priority === 'Low' ? 'active' : ''}`} onClick={() => handleFilterChange('priority', 'Low')}>Low</button>
          </div>
        </div>
      </div>

      <div className="complaints-section">
        {loading ? (
          <div className="loading-message">Loading...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No complaints found</p>
            <p className="empty-state-text">No complaints match the selected filters.</p>
          </div>
        ) : (
          <div className="official-table-wrap">
            <table className="official-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Complaint</th>
                  <th>Base priority</th>
                  <th>Days pending</th>
                  <th>Final score</th>
                  <th>Status</th>
                  <th>Indicators</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => {
                  const baseP = c.basePriority || c.priority;
                  const daysPending = c.daysPending ?? 0;
                  const indicators = [];
                  if (c.status !== 'Resolved' && daysPending > 0) indicators.push({ key: 'delay', label: 'Urgent due to delay' });
                  if (c.sensitiveLocation) indicators.push({ key: 'location', label: 'Sensitive location' });
                  if (c.escalatedByRules) indicators.push({ key: 'ai', label: 'AI escalated' });
                  return (
                    <tr key={c._id}>
                      <td className="col-rank">{c.executionRank ?? '—'}</td>
                      <td className="col-preview">
                        <span title={c.complaintText}>
                          {c.complaintText.length > 80 ? `${c.complaintText.substring(0, 80)}...` : c.complaintText}
                        </span>
                      </td>
                      <td>
                        <span className={`badge priority-badge ${getPriorityClass(baseP)}`}>{baseP}</span>
                      </td>
                      <td>{c.status === 'Resolved' ? '—' : daysPending}</td>
                      <td className="col-score">{c.priorityScore ?? '—'}</td>
                      <td>
                        <span className={`badge status-badge ${getStatusClass(c.status)}`}>{c.status}</span>
                      </td>
                      <td className="col-indicators">
                        {indicators.length === 0 ? '—' : indicators.map((i) => (
                          <span key={i.key} className={`indicator-badge indicator-${i.key}`} title={i.label}>{i.label}</span>
                        ))}
                      </td>
                      <td className="col-action">
                        <button type="button" className="btn btn-primary" onClick={() => handleView(c._id)}>
                          View / Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficialDashboard;
