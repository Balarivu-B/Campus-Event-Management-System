import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, PlusCircle, CheckCircle, Clock, Users, ArrowRight, AlertCircle } from 'lucide-react';
import { getDashboardStats } from '../api';
import Loading from '../components/Loading';

export default function OrganizerDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getDashboardStats();
        setData(res);
      } catch (err) {
        console.warn('Error loading organizer stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <Loading fullPage message="Loading organizer dashboard..." />;
  }

  const stats = data?.stats || {
    totalEvents: 0,
    pendingEvents: 0,
    approvedEvents: 0,
    rejectedEvents: 0,
    totalParticipants: 0
  };

  const recentEvents = data?.recentEvents || [];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem 1.5rem' }}>
      <div className="page-header">
        <div className="page-header-title">
          <h1>Organizer Dashboard</h1>
          <p>Welcome, {user?.name}! Manage your event drafts, approvals, and attendee turnouts.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/organizer/create-event" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Create New Event</span>
          </Link>
          <Link to="/organizer/events" className="btn btn-secondary btn-sm">
            Manage All Events
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalEvents}</h3>
            <p>Total Events Created</p>
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
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.approvedEvents}</h3>
            <p>Approved Events</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalParticipants}</h3>
            <p>Total Registered Attendees</p>
          </div>
        </div>
      </div>

      {/* Recent Organizer Events */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Your Recent Events</h2>
          <Link to="/organizer/events" style={{ fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Manage All ({stats.totalEvents})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-color)',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              You haven't created any events yet.
            </p>
            <Link to="/organizer/create-event" className="btn btn-primary">
              <PlusCircle size={16} />
              <span>Create Your First Event</span>
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Participants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <strong style={{ fontSize: '0.95rem' }}>{ev.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ev.location}</div>
                    </td>
                    <td><span className="category-tag">{ev.category}</span></td>
                    <td>{ev.event_date}</td>
                    <td>
                      <span className={`badge badge-${ev.status.toLowerCase()}`}>
                        <span className="badge-dot"></span>
                        {ev.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/organizer/participants?eventId=${ev.id}`}
                        style={{ fontWeight: 600, color: 'var(--primary)' }}
                      >
                        {ev.participant_count || 0} / {ev.capacity}
                      </Link>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/events/${ev.id}`} className="btn btn-secondary btn-sm">
                          View
                        </Link>
                        <Link to={`/organizer/participants?eventId=${ev.id}`} className="btn btn-secondary btn-sm">
                          Roster
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
