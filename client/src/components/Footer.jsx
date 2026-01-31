import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo">Smart City Civic Grievance Platform</span>
        </div>
        <p className="footer-disclaimer">
          This platform uses an AI-assisted decision-support system for classification and prioritization. Final decisions remain with the responsible authorities.
        </p>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <a href="#privacy">Privacy</a>
          <a href="#help">Help</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
