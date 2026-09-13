import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Calendar size={18} />
              </div>
              <h3 style={{ margin: 0 }}>CEMS Portal</h3>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#94a3b8' }}>
              Campus Event Management System — The comprehensive centralized platform for event discovery,
              streamlined student registration, faculty approval workflows, and administrative management.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/events">Discover Events</Link></li>
              <li><Link to="/login">Account Login</Link></li>
              <li><Link to="/register">Student Registration</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>User Portals</h4>
            <ul className="footer-links">
              <li><Link to="/student/dashboard">Student Portal</Link></li>
              <li><Link to="/organizer/dashboard">Organizer Portal</Link></li>
              <li><Link to="/faculty/dashboard">Faculty Approval</Link></li>
              <li><Link to="/admin/dashboard">System Administration</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Security & Roles</h4>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Shield size={20} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                Role-based access control with JWT encryption, MySQL relational integrity, and automated status notifications.
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Campus Event Management System (CEMS). Built for Academic Excellence.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
            <span>Clean Architecture & Full-Stack Reliability</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
