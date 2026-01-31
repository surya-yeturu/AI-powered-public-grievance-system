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
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Complaints</h1>
        <Link to="/citizen/new-complaint" className="btn btn-primary">
          + New Complaint
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{complaints.length}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-value">{getStatusCount('Pending')}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card stat-progress">
          <div className="stat-value">{getStatusCount('In Progress')}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card stat-resolved">
          <div className="stat-value">{getStatusCount('Resolved')}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      <div className="filter-bar">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-btn ${filter === 'Pending' ? 'active' : ''}`} onClick={() => setFilter('Pending')}>Pending</button>
        <button className={`filter-btn ${filter === 'In Progress' ? 'active' : ''}`} onClick={() => setFilter('In Progress')}>In Progress</button>
        <button className={`filter-btn ${filter === 'Resolved' ? 'active' : ''}`} onClick={() => setFilter('Resolved')}>Resolved</button>
      </div>

      <div className="complaints-list">
        {getFilteredComplaints().length === 0 ? (
          <div className="empty-state">
            <p>No complaints found</p>
            <Link to="/citizen/new-complaint" className="btn btn-secondary">File Your First Complaint</Link>
          </div>
        ) : (
          getFilteredComplaints().map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} showCitizenInfo={false} />
          ))
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
