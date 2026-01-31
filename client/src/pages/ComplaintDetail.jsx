import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import '../styles/ComplaintDetail.css';

const ComplaintDetail = () => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    resolutionRemarks: ''
  });

  const { id } = useParams();
  const { user, isOfficial } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getComplaintById(id);
      const complaintData = response.data.data.complaint;
      setComplaint(complaintData);
      setUpdateForm({
        status: complaintData.status,
        resolutionRemarks: complaintData.resolutionRemarks || ''
      });
    } catch (err) {
      setError('Failed to load complaint details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      await complaintAPI.updateStatus(id, updateForm);
      await fetchComplaint();
      alert('Complaint status updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'In Progress': return 'status-in-progress';
      case 'Resolved': return 'status-resolved';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">Loading complaint details...</div>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="page-container">
        <div className="error-container">
          <p>{error}</p>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Go back</button>
        </div>
      </div>
    );
  }

  const canUpdateStatus = isOfficial && user?.role === 'official' && user?.department && complaint.department === user.department;

  return (
    <div className="page-container detail-page">
      <div className="detail-header">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary back-button">Back</button>
        <h1 className="page-title">Complaint Details</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="detail-card">
        <div className="detail-badges">
          <span className={`badge priority-badge ${getPriorityClass(complaint.basePriority || complaint.priority)}`}>{complaint.basePriority || complaint.priority} Priority</span>
          <span className={`badge status-badge ${getStatusClass(complaint.status)}`}>{complaint.status}</span>
          <span className="badge department-badge">{complaint.department}</span>
          {complaint.daysPending != null && complaint.status !== 'Resolved' && (
            <span className="badge days-badge">Days pending: {complaint.daysPending}</span>
          )}
        </div>

        <section className="detail-section">
          <h2 className="detail-section-title">Complaint Description</h2>
          <p className="detail-complaint-text">{complaint.complaintText}</p>
        </section>

        <section className="detail-section detail-meta-grid">
          <div className="detail-meta-item">
            <span className="detail-meta-label">Location</span>
            <span className="detail-meta-value">{complaint.location}</span>
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Submitted on</span>
            <span className="detail-meta-value">{formatDate(complaint.createdAt)}</span>
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Last updated</span>
            <span className="detail-meta-value">{formatDate(complaint.updatedAt)}</span>
          </div>
          {complaint.citizenId && (
            <div className="detail-meta-item">
              <span className="detail-meta-label">Citizen</span>
              <span className="detail-meta-value">{complaint.citizenId.name} — {complaint.citizenId.email}</span>
            </div>
          )}
        </section>

        {(complaint.priorityExplanation || complaint.priorityReason) && (
          <section className="detail-section detail-ai-section detail-explanation-section">
            <h2 className="detail-section-title">Priority explanation</h2>
            <p className="detail-section-subtitle">Every priority decision is explainable.</p>
            {complaint.priorityExplanation ? (
              <div className="priority-explanation">
                <p className="detail-ai-reason"><strong>AI reason:</strong> {complaint.priorityExplanation.aiReason || complaint.priorityReason}</p>
                {complaint.priorityExplanation.agingDays > 0 && complaint.status !== 'Resolved' && (
                  <p className="detail-explanation-line"><strong>Time-based escalation:</strong> +{complaint.priorityExplanation.agingScore} points ({complaint.priorityExplanation.agingDays} day(s) pending).</p>
                )}
                {complaint.priorityExplanation.sensitiveLocation && (
                  <p className="detail-explanation-line"><strong>Sensitive location:</strong> +{complaint.priorityExplanation.locationBonus} points.</p>
                )}
                {complaint.priorityExplanation.escalatedByRules && (
                  <p className="detail-explanation-line"><strong>Rule escalation:</strong> Priority increased by rules (safety/duration/location).</p>
                )}
                <p className="detail-explanation-score"><strong>Final priority score:</strong> {complaint.priorityExplanation.finalScore ?? complaint.priorityScore}</p>
                {complaint.priorityExplanation.summary?.length > 0 && (
                  <ul className="detail-explanation-summary">
                    {complaint.priorityExplanation.summary.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="detail-ai-reason">{complaint.priorityReason}</p>
            )}
          </section>
        )}

        {complaint.mapLocationUrl && (
          <section className="detail-section">
            <h2 className="detail-section-title">Map Location</h2>
            <a href={complaint.mapLocationUrl} target="_blank" rel="noopener noreferrer" className="detail-map-link">
              Open location in map
            </a>
            <span className="form-hint">Officials can use this link to navigate to the spot.</span>
          </section>
        )}

        {complaint.imageUrl && (
          <section className="detail-section">
            <h2 className="detail-section-title">Attached Image</h2>
            <img src={complaint.imageUrl} alt="Complaint" className="detail-image" onError={(e) => { e.target.style.display = 'none'; }} />
          </section>
        )}

        {complaint.resolutionRemarks && (
          <section className="detail-section">
            <h2 className="detail-section-title">Resolution Remarks</h2>
            <p className="detail-resolution-text">{complaint.resolutionRemarks}</p>
            {complaint.updatedBy && <p className="text-small">Updated by: {complaint.updatedBy.name}</p>}
          </section>
        )}

        {canUpdateStatus && (
          <section className="detail-section detail-update-section">
            <h2 className="detail-section-title">Update Status</h2>
            <form onSubmit={handleUpdateSubmit} className="detail-update-form">
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select id="status" value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} required>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="resolutionRemarks">Resolution remarks (optional)</label>
                <textarea id="resolutionRemarks" value={updateForm.resolutionRemarks} onChange={(e) => setUpdateForm({ ...updateForm, resolutionRemarks: e.target.value })} placeholder="Add remarks about the resolution or progress" rows="4" />
              </div>
              <button type="submit" className="btn btn-primary btn-update-status" disabled={updating}>
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetail;
