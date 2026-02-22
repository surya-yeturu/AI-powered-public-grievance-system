import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/AdminEscalations.css';

const AdminEscalations = () => {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [runningCheck, setRunningCheck] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminAPI.getEscalations();
      setEscalations(res.data.data.escalations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load escalations');
      setEscalations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleRunCheck = async () => {
    try {
      setRunningCheck(true);
      setError('');
      await adminAPI.runCheckEscalations();
      await fetchEscalations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to run escalation check');
    } finally {
      setRunningCheck(false);
    }
  };

  const getPriorityClass = (p) => (p === 'High' ? 'priority-high' : p === 'Medium' ? 'priority-medium' : 'priority-low');
  const getStatusClass = (s) => (s === 'Pending' ? 'status-pending' : s === 'In Progress' ? 'status-in-progress' : 'status-resolved');
  const getEscalationClass = (level) => (level === 'Resolution Delayed' ? 'escalation-resolution' : level === 'Response Delayed' ? 'escalation-response' : '');

  const handleView = (id) => {
    navigate(`/official/complaint/${id}`);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="page-container">
        <div className="error-message">Access denied. Admin only.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-header escalation-header">
        <div>
          <h1 className="page-title">Escalation &amp; Delay Alerts</h1>
          <p className="page-subtitle">
            Monitor complaints with no response or delayed resolution. Run the check to update escalation status.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-run-check"
          onClick={handleRunCheck}
          disabled={runningCheck}
        >
          {runningCheck ? 'Running…' : 'Run escalation check'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-container">Loading escalations…</div>
      ) : escalations.length === 0 ? (
        <div className="empty-state escalation-empty">
          <p className="empty-state-title">No escalated complaints</p>
          <p className="empty-state-text">
            Run the escalation check to evaluate open complaints against delay rules. Complaints that meet criteria will appear here.
          </p>
        </div>
      ) : (
        <div className="escalation-alerts-section">
          <div className="official-table-wrap escalation-table-wrap">
            <table className="official-table escalation-table">
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Department</th>
                  <th>Base priority</th>
                  <th>Status</th>
                  <th>Days since last update</th>
                  <th>Escalation reason</th>
                  <th>Assigned official</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {escalations.map((row) => (
                  <tr key={row._id} className={getEscalationClass(row.escalationLevel)}>
                    <td className="col-preview">
                      <span title={row.complaintText}>
                        {row.complaintText?.length > 50 ? `${row.complaintText.substring(0, 50)}...` : row.complaintText}
                      </span>
                      <span className="complaint-id-small">ID: {row._id?.slice(-8)}</span>
                    </td>
                    <td>{row.department}</td>
                    <td>
                      <span className={`badge priority-badge ${getPriorityClass(row.basePriority || row.priority)}`}>
                        {row.basePriority || row.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-badge ${getStatusClass(row.status)}`}>{row.status}</span>
                    </td>
                    <td className="col-days">{row.daysSinceLastUpdate ?? '—'}</td>
                    <td className="col-reason">{row.escalationReason || row.escalationLevel}</td>
                    <td>{row.updatedBy?.name ?? '—'}</td>
                    <td className="col-action">
                      <button type="button" className="btn btn-primary" onClick={() => handleView(row._id)}>
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEscalations;
