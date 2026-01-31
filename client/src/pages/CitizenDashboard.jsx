import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import '../styles/Dashboard.css';

const CitizenDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [complaintsRes, statsRes] = await Promise.all([
        complaintAPI.getMyComplaints(),
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

  const getFilteredComplaints = () => {
    if (filter === 'all') return complaints;
    return complaints.filter(c => c.status === filter);
  };

  const getStatusCount = (status) => {
    return stats?.byStatus?.find(s => s._id === status)?.count || 0;
  };

  if (loading) {
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
          <h1 className="page-title">My Complaints</h1>
          <p className="page-subtitle">View and track your submitted civic complaints.</p>
        </div>
        <Link to="/citizen/new-complaint" className="btn btn-primary">
          Submit New Complaint
        </Link>
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

      <div className="filter-bar">
        <span className="filter-label">Status:</span>
        <button type="button" className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button type="button" className={`filter-btn ${filter === 'Pending' ? 'active' : ''}`} onClick={() => setFilter('Pending')}>Pending</button>
        <button type="button" className={`filter-btn ${filter === 'In Progress' ? 'active' : ''}`} onClick={() => setFilter('In Progress')}>In Progress</button>
        <button type="button" className={`filter-btn ${filter === 'Resolved' ? 'active' : ''}`} onClick={() => setFilter('Resolved')}>Resolved</button>
      </div>

      <div className="complaints-section">
        {getFilteredComplaints().length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No complaints found</p>
            <p className="empty-state-text">
              {filter === 'all'
                ? 'You have not submitted any complaints yet. Submit a complaint to get started.'
                : `No complaints with status "${filter}".`}
            </p>
            <Link to="/citizen/new-complaint" className="btn btn-primary empty-state-btn">
              Submit Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="complaints-list citizen-list">
            {getFilteredComplaints().map((complaint) => (
              <ComplaintCard
                key={complaint._id}
                complaint={complaint}
                showCitizenInfo={false}
                lastUpdated={complaint.updatedAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
