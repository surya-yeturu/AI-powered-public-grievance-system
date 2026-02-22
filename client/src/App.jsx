import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import NewComplaint from './pages/NewComplaint';
import OfficialDashboard from './pages/OfficialDashboard';
import ComplaintDetail from './pages/ComplaintDetail';
import AdminEscalations from './pages/AdminEscalations';

// Styles
import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Citizen Routes */}
              <Route
                path="/citizen/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/new-complaint"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <NewComplaint />
                  </ProtectedRoute>
                }
              />

              {/* Official / Admin Routes */}
              <Route
                path="/official/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['official', 'admin']}>
                    <OfficialDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/official/complaint/:id"
                element={
                  <ProtectedRoute allowedRoles={['official', 'admin']}>
                    <ComplaintDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/escalations"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminEscalations />
                  </ProtectedRoute>
                }
              />

              {/* Shared Routes */}
              <Route
                path="/complaint/:id"
                element={
                  <ProtectedRoute>
                    <ComplaintDetail />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
