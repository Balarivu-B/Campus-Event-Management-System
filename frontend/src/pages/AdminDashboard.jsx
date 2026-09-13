import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Ticket, CheckCircle, Clock, Shield, ArrowRight, UserCheck } from 'lucide-react';
import { getDashboardStats } from '../api';
import Loading from '../components/Loading';

export default function AdminDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getDashboardStats();
        setData(res);
      } catch (err) {
        console.warn('Error loading admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <Loading fullPage message="Loading system administration dashboard..." />;
  }

  const stats = data?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    totalStudents: 0,
    totalOrganizers: 0,
    totalFaculty: 0,
    totalAdmins: 0,
    totalEvents: 0,
    approvedEvents: 0,
    pendingEvents: 0,
    totalRegistrations: 0
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem 1.5rem' }}>
      <div className="page-header">
        <div className="page-header-title">
          <h1>System Administration Dashboard</h1>
          <p>Global metrics, user account access control, and campus platform oversight.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/users" className="btn btn-primary btn-sm">
            <Users size={16} />
            <span>Manage All Users</span>
          </Link>
          <Link to="/events" className="btn btn-secondary btn-sm">
            <span>View Events Directory</span>
          </Link>
        </div>
      </div>

      {/* Main Stat Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Registered Users ({stats.activeUsers} active)</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalEvents}</h3>
            <p>Total Campus Events</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.approvedEvents}</h3>
            <p>Approved Events</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingEvents}</h3>
            <p>Pending Approval</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
            <Ticket size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalRegistrations}</h3>
            <p>Total Registrations</p>
          </div>
        </div>
      </div>

      {/* Role Breakdown Cards */}
      <div style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>User Role Distribution</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem'
        }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Students</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>{stats.totalStudents}</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Event attendees & participants</p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Organizers</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', marginTop: '0.25rem' }}>{stats.totalOrganizers}</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Student council & club leads</p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Faculty</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>{stats.totalFaculty}</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Department coordinators</p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Administrators</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>{stats.totalAdmins}</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Platform superintendents</p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div style={{ marginTop: '2.5rem', background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Platform Control Links</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Direct administrative controls for auditing users and monitoring campus activity.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/admin/users" className="btn btn-primary">
            <Users size={16} />
            <span>Manage User Directory</span>
          </Link>
          <Link to="/faculty/pending-events" className="btn btn-secondary">
            <Clock size={16} />
            <span>Review Pending Events ({stats.pendingEvents})</span>
          </Link>
          <Link to="/organizer/create-event" className="btn btn-secondary">
            <Calendar size={16} />
            <span>Post Institutional Event</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
