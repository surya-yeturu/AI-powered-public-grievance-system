import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const { isAuthenticated, isCitizen, isOfficial } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">🏙️ Smart City Grievance System</h1>
        <p className="hero-subtitle">
          AI-Powered Civic Complaint Management Platform
        </p>
        <p className="hero-description">
          Report civic issues, track their status, and help build a better city.
          Our AI automatically classifies and prioritizes complaints for faster resolution.
        </p>

        {!isAuthenticated ? (
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Register as Citizen
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        ) : (
          <div className="hero-actions">
            {isCitizen && (
              <>
                <Link to="/citizen/dashboard" className="btn btn-primary">
                  My Dashboard
                </Link>
                <Link to="/citizen/new-complaint" className="btn btn-secondary">
                  File New Complaint
                </Link>
              </>
            )}
            {isOfficial && (
              <Link to="/official/dashboard" className="btn btn-primary">
                Official Dashboard
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Classification</h3>
            <p>Automatic department assignment and priority detection using OpenAI</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Tracking</h3>
            <p>Track your complaint status from submission to resolution</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏛️</div>
            <h3>Multi-Department</h3>
            <p>Roads, Electricity, Drainage, and Sanitation departments</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Priority Management</h3>
            <p>High, Medium, and Low priority levels for efficient handling</p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Submit Complaint</h3>
            <p>Citizens register and submit civic complaints with details and images</p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Analysis</h3>
            <p>Our AI analyzes the complaint and assigns department & priority</p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Official Review</h3>
            <p>Department officials review and update complaint status</p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <h3>Resolution</h3>
            <p>Track progress until the issue is resolved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
