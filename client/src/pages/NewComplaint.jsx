import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI, uploadImage } from '../services/api';
import '../styles/Form.css';

const ACCEPT_IMAGES = 'image/jpeg,image/png,image/gif,image/webp';
const MAX_FILE_MB = 5;

const NewComplaint = () => {
  const [formData, setFormData] = useState({
    complaintText: '',
    location: '',
    imageUrl: '',
    mapLocationUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_FILE_MB} MB.`);
      return;
    }
    setError('');
    setUploading(true);
    try {
      const res = await uploadImage(file);
      const url = res.data?.data?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        setImageFile(file.name);
        setShowUrlInput(false);
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed. Try a different file or paste a link.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setImageFile(null);
    setShowUrlInput(false);
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
      <div className="page-container form-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Complaint Submitted Successfully</h2>
          <p>Your complaint has been received and assigned to the appropriate department using AI classification.</p>
          <p className="text-small">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container form-container">
      <div className="form-card">
        <h1 className="form-title">Submit a Complaint</h1>
        <p className="form-subtitle">Complete the form below. Your complaint will be classified and routed to the responsible department.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-group">
            <label htmlFor="complaintText">Complaint description *</label>
            <textarea
              id="complaintText"
              name="complaintText"
              value={formData.complaintText}
              onChange={handleChange}
              placeholder="Describe the issue in detail. Include type of problem, exact location, and when you noticed it."
              rows="6"
              required
              minLength="10"
            />
            <span className="form-hint">Be specific. A clear description helps the system assign the correct department and priority. Minimum 10 characters.</span>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Main Street near City Hall, Sector 5"
              required
            />
          </div>

          <div className="form-group">
            <label>Map location URL (optional)</label>
            <input
              type="url"
              name="mapLocationUrl"
              value={formData.mapLocationUrl}
              onChange={handleChange}
              placeholder="Paste Google Maps or other map link so officials can navigate to the spot"
            />
            <span className="form-hint">e.g. Google Maps share link. Helps officials reach the exact location.</span>
          </div>

          <div className="form-group">
            <label>Photo (optional)</label>
            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_IMAGES}
                onChange={handleFileSelect}
                className="upload-input"
                disabled={uploading}
              />
              <button
                type="button"
                className="btn btn-secondary upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Choose file to upload'}
              </button>
              {imageFile && (
                <span className="upload-filename">
                  {imageFile}
                  <button type="button" className="upload-clear" onClick={clearImage} aria-label="Remove image">×</button>
                </span>
              )}
            </div>
            {!showUrlInput && !formData.imageUrl && (
              <button type="button" className="link-button" onClick={() => setShowUrlInput(true)}>
                Or paste image URL
              </button>
            )}
            {showUrlInput && (
              <div className="url-input-wrap">
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="url-input"
                />
                <button type="button" className="link-button" onClick={() => { setShowUrlInput(false); setFormData((p) => ({ ...p, imageUrl: '' })); }}>Cancel</button>
              </div>
            )}
            <span className="form-hint">Upload an image (JPEG, PNG, GIF, WebP, max {MAX_FILE_MB} MB) or paste a link.</span>
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
      </div>
    </div>
  );
};

export default NewComplaint;
