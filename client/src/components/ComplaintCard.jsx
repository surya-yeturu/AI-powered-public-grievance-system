import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ComplaintCard.css';

const ComplaintCard = ({ complaint, showCitizenInfo = false, onClick, lastUpdated }) => {
  const navigate = useNavigate();

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
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClick = () => {
    if (onClick) {
      onClick(complaint);
    } else {
      navigate(`/complaint/${complaint._id}`);
    }
  };

  const preview = complaint.complaintText.length > 120
    ? `${complaint.complaintText.substring(0, 120)}...`
    : complaint.complaintText;

  const basePriority = complaint.basePriority || complaint.priority;
  const daysPending = complaint.daysPending ?? 0;
  const showPriorityIncreased = complaint.status !== 'Resolved' && (complaint.priorityExplanation?.agingScore > 0 || daysPending > 0);
  const hasProgressImages = complaint.progressUpdates?.some((u) => u.images?.length) ?? false;
  const showWorkInProgressBadge = complaint.status === 'In Progress' && hasProgressImages;
  const showResolvedPhotosBadge = complaint.status === 'Resolved' && hasProgressImages;

  return (
    <article className="complaint-card" onClick={handleClick}>
      <div className="complaint-card-top">
        <div className="complaint-badges">
          <span className={`badge priority-badge ${getPriorityClass(basePriority)}`}>
            {basePriority}
          </span>
          <span className={`badge status-badge ${getStatusClass(complaint.status)}`}>
            {complaint.status}
          </span>
          <span className="badge department-badge">{complaint.department}</span>
          {showWorkInProgressBadge && (
            <span className="badge complaint-card-badge-images">Work in Progress – Images Available</span>
          )}
          {showResolvedPhotosBadge && (
            <span className="badge complaint-card-badge-resolved">Issue Resolved – View Completion Photos</span>
          )}
        </div>
        <time className="complaint-date" dateTime={complaint.createdAt}>
          Last updated: {formatDate(lastUpdated || complaint.updatedAt || complaint.createdAt)}
        </time>
      </div>

      <p className="complaint-card-summary">{preview}</p>

      <div className="complaint-card-meta">
        <span className="meta-item">Location: {complaint.location}</span>
        {complaint.status !== 'Resolved' && daysPending > 0 && (
          <span className="meta-item">Days since submission: {daysPending}</span>
        )}
        {showCitizenInfo && complaint.citizenId && (
          <span className="meta-item">Citizen: {complaint.citizenId.name}</span>
        )}
      </div>

      {showPriorityIncreased && (
        <p className="complaint-card-message">Priority increased due to pending duration.</p>
      )}

      {complaint.inTodayPlan && complaint.status !== 'Resolved' && (
        <p className="complaint-card-scheduled">Your complaint is scheduled for review today.</p>
      )}

      {onClick && (
        <div className="complaint-card-action">
          <span className="action-link">View / Update</span>
        </div>
      )}
    </article>
  );
};

export default ComplaintCard;
