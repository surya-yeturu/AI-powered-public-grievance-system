import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo">Smart City Grievance Platform</span>
          <p className="footer-disclaimer">
            AI-assisted classification and prioritisation. Final decisions always remain with the responsible authorities.
          </p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/citizen/new-complaint">Report an issue</Link>
          <Link to="/login">Track a complaint</Link>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Smart City Grievance Platform</div>
    </footer>
  );
};

export default Footer;
