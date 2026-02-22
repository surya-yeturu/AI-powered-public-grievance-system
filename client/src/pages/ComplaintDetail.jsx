import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintAPI, adminAPI } from '../services/api';
import '../styles/ComplaintDetail.css';

const MAX_PROGRESS_IMAGES = 5;

const ComplaintDetail = () => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    resolutionRemarks: ''
  });
  const [progressImages, setProgressImages] = useState([]);
  const [adminNoteText, setAdminNoteText] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false);

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
      if (progressImages.length > 0) {
        const formData = new FormData();
        formData.append('status', updateForm.status);
        formData.append('remarks', updateForm.resolutionRemarks);
        formData.append('resolutionRemarks', updateForm.resolutionRemarks);
        progressImages.forEach((file) => formData.append('images', file));
        await complaintAPI.updateStatus(id, formData);
      } else {
        await complaintAPI.updateStatus(id, updateForm);
      }
      await fetchComplaint();
      setProgressImages([]);
      alert('Complaint status updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setUpdating(false);
    }
  };

  const handleProgressImagesChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PROGRESS_IMAGES);
    setProgressImages(files);
  };

  const handleAddAdminNote = async (e) => {
    e.preventDefault();
    if (!adminNoteText.trim()) return;
    setNoteSubmitting(true);
    try {
      await adminAPI.addAdminNote(id, { note: adminNoteText.trim() });
      setAdminNoteText('');
      await fetchComplaint();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleMarkFollowUp = async () => {
    setFollowUpSubmitting(true);
    try {
      await adminAPI.markFollowUpInitiated(id);
      await fetchComplaint();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark follow-up');
    } finally {
      setFollowUpSubmitting(false);
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

  const canUpdateStatus =
    (user?.role === 'official' && user?.department && complaint.department === user.department) ||
    user?.role === 'admin';

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
          {(user?.role === 'official' || user?.role === 'admin') && complaint.escalatedToAdmin && (
            <span className="badge badge-escalated">Escalated – Admin Notified</span>
          )}
        </div>

        {user?.role === 'citizen' && complaint.escalatedToAdmin && (
          <p className="detail-escalation-citizen">Your complaint is under review by higher authorities due to delay.</p>
        )}

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

        {complaint.progressUpdates && complaint.progressUpdates.length > 0 && (
          <section className="detail-section detail-progress-updates">
            <h2 className="detail-section-title">Progress Updates</h2>
            {user?.role === 'citizen' && (
              <p className="detail-progress-transparency">Work images uploaded by authorities for transparency.</p>
            )}
            <ol className="progress-updates-list">
              {[...complaint.progressUpdates]
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map((update, idx) => (
                  <li key={idx} className="progress-update-item">
                    <div className="progress-update-header">
                      <span className={`badge status-badge ${getStatusClass(update.status)}`}>{update.status}</span>
                      <time dateTime={update.updatedAt}>{formatDate(update.updatedAt)}</time>
                      {update.updatedBy && <span className="progress-update-by">by {update.updatedBy.name}</span>}
                    </div>
                    {update.remarks && <p className="progress-update-remarks">{update.remarks}</p>}
                    {update.images && update.images.length > 0 && (
                      <div className="progress-update-gallery">
                        {update.images.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="progress-update-thumb-wrap">
                            <img src={url} alt={`Update ${idx + 1}`} className="progress-update-thumb" />
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
            </ol>
          </section>
        )}

        {user?.role === 'admin' && (
          <section className="detail-section detail-admin-section">
            <h2 className="detail-section-title">Admin Actions</h2>
            <p className="detail-section-subtitle">Internal notes and follow-up. Do not resolve complaints here.</p>
            {complaint.adminNotes && complaint.adminNotes.length > 0 && (
              <div className="admin-notes-list">
                <h3 className="admin-notes-title">Internal notes</h3>
                <ul>
                  {complaint.adminNotes.map((n, idx) => (
                    <li key={idx} className="admin-note-item">
                      <p className="admin-note-text">{n.text}</p>
                      <span className="admin-note-meta">
                        {n.addedBy?.name} — {formatDate(n.addedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <form onSubmit={handleAddAdminNote} className="detail-update-form admin-note-form">
              <div className="form-group">
                <label htmlFor="adminNote">Add internal note</label>
                <textarea
                  id="adminNote"
                  value={adminNoteText}
                  onChange={(e) => setAdminNoteText(e.target.value)}
                  placeholder="Internal note (not visible to citizen)"
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-secondary" disabled={noteSubmitting || !adminNoteText.trim()}>
                {noteSubmitting ? 'Adding…' : 'Add note'}
              </button>
            </form>
            {!complaint.followUpInitiatedAt && (
              <button
                type="button"
                className="btn btn-primary btn-follow-up"
                onClick={handleMarkFollowUp}
                disabled={followUpSubmitting}
              >
                {followUpSubmitting ? 'Updating…' : 'Mark follow-up initiated'}
              </button>
            )}
            {complaint.followUpInitiatedAt && (
              <p className="follow-up-marked">Follow-up initiated on {formatDate(complaint.followUpInitiatedAt)}.</p>
            )}
          </section>
        )}

        {canUpdateStatus && (
          <section className="detail-section detail-update-section">
            <h2 className="detail-section-title">Update Complaint Status</h2>
            <form onSubmit={handleUpdateSubmit} className="detail-update-form">
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select id="status" value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} required>
                  {complaint.status === 'Pending' && <option value="Pending">Pending</option>}
                  {(complaint.status === 'Pending' || complaint.status === 'In Progress') && (
                    <>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </>
                  )}
                  {complaint.status === 'Resolved' && <option value="Resolved">Resolved</option>}
                </select>
                <span className="form-hint">Status can only move forward (Pending → In Progress → Resolved).</span>
              </div>
              <div className="form-group">
                <label htmlFor="resolutionRemarks">Remarks (optional)</label>
                <textarea id="resolutionRemarks" value={updateForm.resolutionRemarks} onChange={(e) => setUpdateForm({ ...updateForm, resolutionRemarks: e.target.value })} placeholder="Add remarks about the resolution or progress" rows="4" />
              </div>
              <div className="form-group">
                <label htmlFor="progressImages">Images (optional, max {MAX_PROGRESS_IMAGES})</label>
                <input
                  id="progressImages"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  multiple
                  onChange={handleProgressImagesChange}
                  className="detail-file-input"
                />
                {progressImages.length > 0 && (
                  <span className="form-hint">{progressImages.length} image(s) selected. Clear by choosing again.</span>
                )}
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
