import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, CheckCircle2, Bell, ArrowRight, MapPin, Clock } from 'lucide-react';
import { getDashboardStats } from '../api';
import Loading from '../components/Loading';

export default function StudentDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getDashboardStats();
        setData(res);
      } catch (err) {
        console.warn('Error loading student dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <Loading fullPage message="Loading student portal..." />;
  }

  const stats = data?.stats || {
    totalRegistered: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    unreadNotifications: 0
  };

  const recentRegistrations = data?.recentRegistrations || [];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem 1.5rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-title">
          <h1>Student Dashboard</h1>
          <p>Welcome back, {user?.name}! Track your event schedules and confirmations.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/events" className="btn btn-primary btn-sm">
            Browse Events
          </Link>
          <Link to="/student/registrations" className="btn btn-secondary btn-sm">
            My Registrations
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
            <Ticket size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalRegistered}</h3>
            <p>Total Registrations</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.upcomingEvents}</h3>
            <p>Upcoming Events</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.completedEvents}</h3>
            <p>Completed Events</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Bell size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.unreadNotifications}</h3>
            <p>Unread Notifications</p>
          </div>
        </div>
      </div>

      {/* Upcoming / Recent Registrations */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Upcoming Registered Events</h2>
          <Link to="/student/registrations" style={{ fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentRegistrations.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-color)',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              You haven't registered for any events yet.
            </p>
            <Link to="/events" className="btn btn-primary btn-sm">
              Discover Events Now
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentRegistrations.map((reg) => (
              <div
                key={reg.registration_id}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <span className="category-tag" style={{ marginBottom: '0.35rem' }}>{reg.category}</span>
                  <h3 style={{ fontSize: '1.15rem', marginTop: '0.2rem' }}>{reg.title}</h3>
                  <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} color="var(--primary)" /> {reg.event_date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} color="var(--primary)" /> {reg.start_time?.substring(0, 5)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} color="var(--primary)" /> {reg.location}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-approved">
                    <span className="badge-dot"></span> Confirmed
                  </span>
                  <Link to={`/events/${reg.event_id}`} className="btn btn-secondary btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
