import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const DEPARTMENTS = [
  { title: 'Roads & Public Works', description: 'Potholes, road damage, traffic signals, and public infrastructure.' },
  { title: 'Electricity & Street Lighting', description: 'Street lights, power outages, and electrical hazards.' },
  { title: 'Sanitation & Waste Management', description: 'Garbage collection, waste disposal, and cleanliness.' },
  { title: 'Drainage & Sewerage', description: 'Blocked drains, waterlogging, and sewer issues.' },
  { title: 'Water Supply', description: 'Water supply disruptions, quality, and distribution.' },
];

const STEPS = [
  { num: 1, title: 'Submit Complaint', text: 'Describe the issue with location and optional image.' },
  { num: 2, title: 'AI-Based Analysis', text: 'The system classifies and prioritizes your complaint.' },
  { num: 3, title: 'Department Routing', text: 'Complaint is routed to the responsible department.' },
  { num: 4, title: 'Status Tracking', text: 'Track progress until resolution.' },
];

const BENEFITS = [
  'Unified access to multiple departments',
  'AI-assisted prioritization',
  'Faster response handling',
  'Transparent complaint tracking',
  'Scalable smart-city architecture',
];

const Home = () => {
  const { isAuthenticated, isCitizen, isOfficial, isAdmin } = useAuth();

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">AI-Powered Civic Grievance Management Platform</h1>
          <p className="hero-subtitle">
            A unified digital platform for reporting and prioritizing civic infrastructure issues.
          </p>
          <p className="hero-supporting">
            Report issues related to roads, electricity, sanitation, drainage, and public utilities through a single intelligent system.
          </p>
          <div className="hero-actions">
            <Link to="/citizen/new-complaint" className="btn btn-primary hero-cta-primary">
              Raise a Complaint
            </Link>
            {isAuthenticated && isCitizen && (
              <Link to="/citizen/dashboard" className="btn btn-outline hero-cta-secondary">
                Track Complaint Status
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="btn btn-outline hero-cta-secondary">
                Track Complaint Status
              </Link>
            )}
            {(isOfficial || isAdmin) && (
              <Link to="/official/dashboard" className="btn btn-outline hero-cta-secondary">
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section about-section">
        <div className="section-inner">
          <h2 className="section-title">Improving Urban Governance Through Intelligent Technology</h2>
          <p className="about-text">
            This platform simplifies civic issue reporting by providing a single interface for multiple municipal departments. AI-assisted classification and prioritization help authorities respond more efficiently.
          </p>
        </div>
      </section>

      {/* Departments */}
      <section className="section departments-section">
        <div className="section-inner">
          <h2 className="section-title">Civic Departments Covered</h2>
          <div className="departments-grid">
            {DEPARTMENTS.map((dept, i) => (
              <div key={i} className="department-card">
                <h3 className="department-card-title">{dept.title}</h3>
                <p className="department-card-desc">{dept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      
      {/* CTA */}
      <section className="section cta-section">
        <div className="section-inner cta-inner">
          <p className="cta-text">Contribute to better urban governance by reporting civic issues responsibly.</p>
          <Link to="/citizen/new-complaint" className="btn btn-primary cta-btn">
            Submit a Complaint
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
