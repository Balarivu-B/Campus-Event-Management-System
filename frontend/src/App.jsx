import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getUser, setUser as persistUser, logout, getMe } from './api';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import MyRegistrations from './pages/MyRegistrations';

// Organizer Pages
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import ManageEvents from './pages/ManageEvents';
import Participants from './pages/Participants';

// Faculty Pages
import FacultyDashboard from './pages/FacultyDashboard';
import PendingEvents from './pages/PendingEvents';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';

// Protected Route Wrapper Component
function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/events" replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => getUser());
  const [theme, setTheme] = useState(() => localStorage.getItem('cems_theme') || 'light');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cems_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    // Verify session on mount if token exists
    async function verifyUser() {
      try {
        const res = await getMe();
        if (res?.user) {
          setUser(res.user);
          persistUser(res.user);
        }
      } catch (err) {
        // Token expired or invalid
        handleLogout();
      }
    }
    if (user) {
      verifyUser();
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleUserUpdated = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="app-container" data-theme={theme}>
      <Navbar user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />

      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home user={user} />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails user={user} />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/events" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/events" replace /> : <Register onLoginSuccess={handleLoginSuccess} />}
          />

          {/* Authenticated User Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <Profile user={user} onUserUpdated={handleUserUpdated} />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={['STUDENT', 'ADMIN']}>
                <StudentDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/registrations"
            element={
              <ProtectedRoute user={user} allowedRoles={['STUDENT', 'ADMIN']}>
                <MyRegistrations />
              </ProtectedRoute>
            }
          />

          {/* Organizer Routes */}
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={['ORGANIZER', 'ADMIN']}>
                <OrganizerDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/create-event"
            element={
              <ProtectedRoute user={user} allowedRoles={['ORGANIZER', 'ADMIN']}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events"
            element={
              <ProtectedRoute user={user} allowedRoles={['ORGANIZER', 'ADMIN']}>
                <ManageEvents user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/participants"
            element={
              <ProtectedRoute user={user} allowedRoles={['ORGANIZER', 'FACULTY', 'ADMIN']}>
                <Participants user={user} />
              </ProtectedRoute>
            }
          />

          {/* Faculty Routes */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={['FACULTY', 'ADMIN']}>
                <FacultyDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/pending-events"
            element={
              <ProtectedRoute user={user} allowedRoles={['FACULTY', 'ADMIN']}>
                <PendingEvents user={user} />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={['ADMIN']}>
                <AdminDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute user={user} allowedRoles={['ADMIN']}>
                <ManageUsers currentUser={user} />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
