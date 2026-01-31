import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import '../styles/Form.css';

const NewComplaint = () => {
  const [formData, setFormData] = useState({
    complaintText: '',
    location: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await complaintAPI.create(formData);
      setSuccess(true);
      setTimeout(() => navigate('/citizen/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="form-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Complaint Submitted Successfully!</h2>
          <p>Our AI has analyzed your complaint and assigned it to the appropriate department.</p>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <h1 className="form-title">File a New Complaint</h1>
        <p className="form-subtitle">
          Describe your civic issue and our AI will automatically classify it
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-group">
            <label htmlFor="complaintText">Complaint Description *</label>
            <textarea
              id="complaintText"
              name="complaintText"
              value={formData.complaintText}
              onChange={handleChange}
              placeholder="Describe the issue in detail (minimum 10 characters)"
              rows="6"
              required
              minLength="10"
            />
            <small className="form-hint">
              Be specific about the problem. Our AI will analyze this to determine the department and priority.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Main Street near City Hall, Sector 5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL (Optional)</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/citizen/dashboard')} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>

        <div className="info-box">
          <h3>What happens next?</h3>
          <ol>
            <li>Our AI analyzes your complaint text</li>
            <li>Automatically assigns to the right department (Roads, Electricity, Drainage, or Sanitation)</li>
            <li>Sets priority level (High, Medium, or Low)</li>
            <li>Department officials review and update status</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default NewComplaint;
