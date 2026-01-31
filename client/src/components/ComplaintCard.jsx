import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ComplaintCard.css';

const ComplaintCard = ({ complaint, showCitizenInfo = false, onClick }) => {
  const navigate = useNavigate();

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'In Progress':
        return 'status-in-progress';
      case 'Resolved':
        return 'status-resolved';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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

  return (
    <div className="complaint-card" onClick={handleClick}>
      <div className="complaint-card-header">
        <div className="complaint-badges">
          <span className={`badge priority-badge ${getPriorityClass(complaint.priority)}`}>
            {complaint.priority}
          </span>
          <span className={`badge status-badge ${getStatusClass(complaint.status)}`}>
            {complaint.status}
          </span>
          <span className="badge department-badge">
            {complaint.department}
          </span>
        </div>
        <div className="complaint-date">
          {formatDate(complaint.createdAt)}
        </div>
      </div>

      <div className="complaint-card-body">
        <p className="complaint-text">
          {complaint.complaintText.length > 150
            ? `${complaint.complaintText.substring(0, 150)}...`
            : complaint.complaintText}
        </p>

        <div className="complaint-info">
          <div className="info-item">
            <span className="info-label">📍 Location:</span>
            <span className="info-value">{complaint.location}</span>
          </div>

          {showCitizenInfo && complaint.citizenId && (
            <div className="info-item">
              <span className="info-label">👤 Citizen:</span>
              <span className="info-value">{complaint.citizenId.name}</span>
            </div>
          )}

          {complaint.priorityReason && (
            <div className="info-item">
              <span className="info-label">🤖 AI Reason:</span>
              <span className="info-value">{complaint.priorityReason}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
