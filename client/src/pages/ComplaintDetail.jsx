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
    return <div className="loading-container">Loading complaint details...</div>;
  }

  if (error && !complaint) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="complaint-detail-container">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>
        <h1>Complaint Details</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="detail-card">
        <div className="detail-badges">
          <span className={`badge priority-badge ${getPriorityClass(complaint.priority)}`}>
            {complaint.priority} Priority
          </span>
          <span className={`badge status-badge ${getStatusClass(complaint.status)}`}>
            {complaint.status}
          </span>
          <span className="badge department-badge">{complaint.department}</span>
        </div>

        <div className="detail-section">
          <h2>Complaint Description</h2>
          <p className="complaint-text">{complaint.complaintText}</p>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>Location</label>
            <p>📍 {complaint.location}</p>
          </div>
          <div className="detail-item">
            <label>Submitted On</label>
            <p>📅 {formatDate(complaint.createdAt)}</p>
          </div>
          <div className="detail-item">
            <label>Last Updated</label>
            <p>🕒 {formatDate(complaint.updatedAt)}</p>
          </div>
          {complaint.citizenId && (
            <div className="detail-item">
              <label>Citizen</label>
              <p>👤 {complaint.citizenId.name}</p>
              <p className="text-small">{complaint.citizenId.email}</p>
            </div>
          )}
        </div>

        {complaint.priorityReason && (
          <div className="detail-section ai-section">
            <h3>🤖 AI Classification Reasoning</h3>
            <p>{complaint.priorityReason}</p>
          </div>
        )}

        {complaint.imageUrl && (
          <div className="detail-section">
            <h3>Attached Image</h3>
            <img
              src={complaint.imageUrl}
              alt="Complaint"
              className="complaint-image"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {complaint.resolutionRemarks && (
          <div className="detail-section">
            <h3>Resolution Remarks</h3>
            <p className="resolution-text">{complaint.resolutionRemarks}</p>
            {complaint.updatedBy && (
              <p className="text-small">Updated by: {complaint.updatedBy.name}</p>
            )}
          </div>
        )}

        {isOfficial && user?.role === 'official' && user?.department && complaint.department === user.department && (
          <div className="detail-section update-section">
            <h3>Update Complaint Status</h3>
            <form onSubmit={handleUpdateSubmit} className="update-form">
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="resolutionRemarks">Resolution Remarks</label>
                <textarea
                  id="resolutionRemarks"
                  value={updateForm.resolutionRemarks}
                  onChange={(e) => setUpdateForm({ ...updateForm, resolutionRemarks: e.target.value })}
                  placeholder="Add remarks about the resolution or progress"
                  rows="4"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetail;
