import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import '../styles/Dashboard.css';

const OfficialDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ priority: '', status: '', department: '' });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [complaintsRes, statsRes] = await Promise.all([
        complaintAPI.getDepartmentComplaints(filters),
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

  const handleComplaintClick = (complaint) => {
    navigate(`/official/complaint/${complaint._id}`);
  };

  if (loading && complaints.length === 0) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>{user.role === 'admin' ? 'All Departments' : `${user.department} Department`} Dashboard</h1>
          <p className="dashboard-subtitle">
            {user.role === 'admin' ? 'View and oversee all department complaints' : 'Manage and resolve civic complaints'}
          </p>
        </div>
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

      <div className="priority-stats">
        <div className="priority-stat priority-high">
          <span className="priority-label">High Priority:</span>
          <span className="priority-count">{getPriorityCount('High')}</span>
        </div>
        <div className="priority-stat priority-medium">
          <span className="priority-label">Medium Priority:</span>
          <span className="priority-count">{getPriorityCount('Medium')}</span>
        </div>
        <div className="priority-stat priority-low">
          <span className="priority-label">Low Priority:</span>
          <span className="priority-count">{getPriorityCount('Low')}</span>
        </div>
      </div>

      <div className="filter-section">
        {user.role === 'admin' && (
          <div className="filter-group">
            <label>Filter by Department:</label>
            <div className="filter-buttons">
              <button className={`filter-btn ${filters.department === '' ? 'active' : ''}`} onClick={() => handleFilterChange('department', '')}>All</button>
              <button className={`filter-btn ${filters.department === 'Roads' ? 'active' : ''}`} onClick={() => handleFilterChange('department', 'Roads')}>Roads</button>
              <button className={`filter-btn ${filters.department === 'Electricity' ? 'active' : ''}`} onClick={() => handleFilterChange('department', 'Electricity')}>Electricity</button>
              <button className={`filter-btn ${filters.department === 'Drainage' ? 'active' : ''}`} onClick={() => handleFilterChange('department', 'Drainage')}>Drainage</button>
              <button className={`filter-btn ${filters.department === 'Sanitation' ? 'active' : ''}`} onClick={() => handleFilterChange('department', 'Sanitation')}>Sanitation</button>
            </div>
          </div>
        )}
        <div className="filter-group">
          <label>Filter by Status:</label>
          <div className="filter-buttons">
            <button className={`filter-btn ${filters.status === 'Pending' ? 'active' : ''}`} onClick={() => handleFilterChange('status', 'Pending')}>Pending</button>
            <button className={`filter-btn ${filters.status === 'In Progress' ? 'active' : ''}`} onClick={() => handleFilterChange('status', 'In Progress')}>In Progress</button>
            <button className={`filter-btn ${filters.status === 'Resolved' ? 'active' : ''}`} onClick={() => handleFilterChange('status', 'Resolved')}>Resolved</button>
          </div>
        </div>

        <div className="filter-group">
          <label>Filter by Priority:</label>
          <div className="filter-buttons">
            <button className={`filter-btn ${filters.priority === 'High' ? 'active' : ''}`} onClick={() => handleFilterChange('priority', 'High')}>High</button>
            <button className={`filter-btn ${filters.priority === 'Medium' ? 'active' : ''}`} onClick={() => handleFilterChange('priority', 'Medium')}>Medium</button>
            <button className={`filter-btn ${filters.priority === 'Low' ? 'active' : ''}`} onClick={() => handleFilterChange('priority', 'Low')}>Low</button>
          </div>
        </div>
      </div>

      <div className="complaints-list">
        {loading ? (
          <div className="loading-message">Loading...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints found matching the selected filters</p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
              showCitizenInfo={true}
              onClick={handleComplaintClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OfficialDashboard;
