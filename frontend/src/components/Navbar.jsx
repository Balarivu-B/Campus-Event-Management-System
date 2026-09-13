import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Calendar, User, LogOut, Menu, X, PlusCircle, LayoutDashboard, Ticket, CheckSquare, Users, Sun, Moon } from 'lucide-react';
import Notification from './Notification';

export default function Navbar({ user, onLogout, theme, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT': return '/student/dashboard';
      case 'ORGANIZER': return '/organizer/dashboard';
      case 'FACULTY': return '/faculty/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/events';
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand" onClick={() => setMobileOpen(false)}>
          <div className="nav-brand-logo">
            <Calendar size={22} />
          </div>
          <span>CEMS</span>
        </Link>

        {/* Desktop & Mobile Links */}
        <nav className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            Events
          </NavLink>

          {/* Role-specific Nav Links */}
          {user && (
            <>
              <NavLink to={getDashboardPath()} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                Dashboard
              </NavLink>

              {user.role === 'STUDENT' && (
                <NavLink to="/student/registrations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  My Registrations
                </NavLink>
              )}

              {user.role === 'ORGANIZER' && (
                <>
                  <NavLink to="/organizer/create-event" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                    Create Event
                  </NavLink>
                  <NavLink to="/organizer/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                    Manage Events
                  </NavLink>
                </>
              )}

              {user.role === 'FACULTY' && (
                <NavLink to="/faculty/pending-events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  Review Queue
                </NavLink>
              )}

              {user.role === 'ADMIN' && (
                <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  Manage Users
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Dark Mode Toggle */}
          <button
            className="nav-badge-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme Mode"
          >
            {theme === 'dark' ? <Sun size={19} color="#fbbf24" /> : <Moon size={19} />}
          </button>

          {user ? (
            <>
              <Notification />

              <Link to="/profile" className="user-pill" title="View Profile">
                <User size={16} />
                <span>{user.name.split(' ')[0]}</span>
                <span className="role-chip">{user.role}</span>
              </Link>

              <button className="btn btn-secondary btn-sm" onClick={handleLogout} title="Log Out">
                <LogOut size={16} />
                <span style={{ display: 'inline-block' }}>Logout</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Toggle Button */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
