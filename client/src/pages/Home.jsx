import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const DEPARTMENTS = [
  { icon: '🛣️', title: 'Roads & Public Works', description: 'Potholes, road damage, footpaths, traffic signals and bridges.' },
  { icon: '💡', title: 'Electricity & Street Lighting', description: 'Street lights, power outages, exposed wires and transformers.' },
  { icon: '🗑️', title: 'Sanitation & Waste', description: 'Garbage collection, waste disposal and public cleanliness.' },
  { icon: '🌊', title: 'Drainage & Sewerage', description: 'Blocked drains, waterlogging, overflow and sewer issues.' }
];

const STEPS = [
  { num: 1, title: 'Describe the issue', text: 'Add details, location and an optional photo.' },
  { num: 2, title: 'AI analyses it', text: 'Gemini reads the text and photo to find the category and urgency.' },
  { num: 3, title: 'Routed instantly', text: 'It goes straight to the responsible department.' },
  { num: 4, title: 'Track to resolution', text: 'Follow every update, with photos, until it is fixed.' }
];

const FEATURES = [
  { title: 'Smart categorisation', text: 'Complaints are auto-routed to Roads, Electricity, Drainage or Sanitation.' },
  { title: 'Age-based priority', text: 'Waiting complaints gain priority every day, so nothing is forgotten.' },
  { title: 'Automatic escalation', text: 'Delays are detected automatically and escalated to administrators.' },
  { title: 'Transparent decisions', text: 'Every priority score comes with a plain-language explanation.' }
];

const Home = () => {
  const { isAuthenticated, isCitizen, isOfficial, isAdmin } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-eyebrow">AI-powered civic platform</span>
          <h1 className="hero-title">Report it. We route it. Together we fix it.</h1>
          <p className="hero-subtitle">
            One place to report civic issues. AI understands your complaint, sends it to the right department and makes sure the most urgent problems are handled first.
          </p>
          <div className="hero-actions">
            {(!isAuthenticated || isCitizen) && (
              <Link to="/citizen/new-complaint" className="btn hero-cta-primary">Raise a complaint</Link>
            )}
            {isAuthenticated && isCitizen && (
              <Link to="/citizen/dashboard" className="btn hero-cta-secondary">Track my complaints</Link>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="btn hero-cta-secondary">Track complaint status</Link>
            )}
            {(isOfficial || isAdmin) && (
              <Link to="/official/dashboard" className="btn hero-cta-primary">Open dashboard</Link>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <h2 className="section-title">How it works</h2>
          <div className="steps-grid">
            {STEPS.map((s) => (
              <div key={s.num} className="step-card">
                <span className="step-num">{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section departments-section">
        <div className="section-inner">
          <h2 className="section-title">Departments covered</h2>
          <div className="departments-grid">
            {DEPARTMENTS.map((dept) => (
              <div key={dept.title} className="department-card">
                <span className="department-icon" aria-hidden="true">{dept.icon}</span>
                <h3 className="department-card-title">{dept.title}</h3>
                <p className="department-card-desc">{dept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <h2 className="section-title">Built for fairness and speed</h2>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(!isAuthenticated || isCitizen) && (
        <section className="section cta-section">
          <div className="section-inner cta-inner">
            <p className="cta-text">See something that needs fixing? It takes less than a minute.</p>
            <Link to="/citizen/new-complaint" className="btn hero-cta-primary cta-btn">Submit a complaint</Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
