import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Calendar, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { getDashboardStats } from '../api';
import Loading from '../components/Loading';

export default function FacultyDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getDashboardStats();
        setData(res);
      } catch (err) {
        console.warn('Error loading faculty stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <Loading fullPage message="Loading faculty coordinator portal..." />;
  }

  const stats = data?.stats || {
    totalEvents: 0,
    pendingEvents: 0,
    approvedEvents: 0,
    rejectedEvents: 0
  };

  const pendingQueue = data?.pendingQueue || [];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem 1.5rem' }}>
      <div className="page-header">
        <div className="page-header-title">
          <h1>Faculty Coordinator Dashboard</h1>
          <p>Welcome, {user?.name}! Review and authorize student club event proposals.</p>
        </div>
        <Link to="/faculty/pending-events" className="btn btn-primary btn-sm">
          <Clock size={16} />
          <span>Pending Review Queue ({stats.pendingEvents})</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingEvents}</h3>
            <p>Pending Review</p>
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
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <XCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.rejectedEvents}</h3>
            <p>Rejected Events</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalEvents}</h3>
            <p>Total Campus Events</p>
          </div>
        </div>
      </div>

      {/* Pending Queue Shortcut */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Pending Event Proposals Awaiting Review</h2>
          <Link to="/faculty/pending-events" style={{ fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Open Review Queue</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {pendingQueue.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-color)',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <ShieldCheck size={40} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>All caught up!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              No event proposals are currently waiting for faculty approval.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Organizer</th>
                  <th>Category</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingQueue.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <strong style={{ fontSize: '0.95rem' }}>{ev.title}</strong>
                    </td>
                    <td>
                      <div>{ev.organizer_name}</div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ev.organizer_department}</span>
                    </td>
                    <td><span className="category-tag">{ev.category}</span></td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{ev.event_date}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ev.start_time?.substring(0, 5)}</div>
                    </td>
                    <td>{ev.location}</td>
                    <td>
                      <Link to="/faculty/pending-events" className="btn btn-primary btn-sm">
                        Review
                      </Link>
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
