import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isCitizen, isOfficial, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🏙️ Smart City Grievance
        </Link>

        <div className="navbar-menu">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-link navbar-link-primary">Register</Link>
            </>
          ) : (
            <>
              <span className="navbar-user">
                {user.name} ({user.role})
              </span>
              
              {isCitizen && (
                <>
                  <Link to="/citizen/dashboard" className="navbar-link">My Complaints</Link>
                  <Link to="/citizen/new-complaint" className="navbar-link">New Complaint</Link>
                </>
              )}
              
              {(isOfficial || isAdmin) && (
                <>
                  <Link to="/official/dashboard" className="navbar-link">Dashboard</Link>
                  <span className="navbar-department">{isAdmin ? 'All Departments' : user.department}</span>
                </>
              )}
              
              <button onClick={handleLogout} className="navbar-button">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
