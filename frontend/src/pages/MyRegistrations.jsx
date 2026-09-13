import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, XCircle, CheckCircle, Ticket, AlertCircle } from 'lucide-react';
import { getMyRegistrations, cancelRegistration } from '../api';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReg, setSelectedReg] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyRegistrations();
      setRegistrations(data.registrations || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch registered events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleConfirmCancel = async () => {
    if (!selectedReg) return;
    try {
      setCancelling(true);
      await cancelRegistration(selectedReg.registration_id);
      setSelectedReg(null);
      fetchRegistrations();
    } catch (err) {
      setError(err.message || 'Failed to cancel registration.');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem 1.5rem' }}>
      <div className="page-header">
        <div className="page-header-title">
          <h1>My Event Registrations</h1>
          <p>Review your confirmed event seats and attendance history.</p>
        </div>
        <Link to="/events" className="btn btn-primary btn-sm">
          Discover More Events
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Loading message="Loading your registrations..." />
      ) : registrations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)'
        }}>
          <Ticket size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No registrations yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            You have not signed up for any events yet. Explore upcoming workshops, hackathons, and activities!
          </p>
          <Link to="/events" className="btn btn-primary">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Event Date & Time</th>
                <th>Venue / Location</th>
                <th>Status</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.registration_id}>
                  <td>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                      <Link to={`/events/${reg.event_id}`} style={{ color: 'var(--text-primary)' }}>
                        {reg.title}
                      </Link>
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Hosted by {reg.organizer_name}
                    </span>
                  </td>
                  <td>
                    <span className="category-tag">{reg.category}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div>{formatDate(reg.event_date)}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {reg.start_time?.substring(0, 5)} - {reg.end_time?.substring(0, 5)}
                      </div>
                    </div>
                  </td>
                  <td>{reg.location}</td>
                  <td>
                    <span className={`badge ${reg.registration_status === 'REGISTERED' ? 'badge-approved' : 'badge-cancelled'}`}>
                      <span className="badge-dot"></span>
                      {reg.registration_status}
                    </span>
                  </td>
                  <td>{formatDate(reg.registered_at)}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/events/${reg.event_id}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
                      {reg.registration_status === 'REGISTERED' && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => setSelectedReg(reg)}
                          title="Cancel Registration"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Cancel Modal */}
      <ConfirmModal
        isOpen={!!selectedReg}
        title="Cancel Event Registration"
        message={`Are you sure you want to cancel your seat for "${selectedReg?.title}"?`}
        confirmText={cancelling ? 'Cancelling...' : 'Yes, Cancel'}
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setSelectedReg(null)}
      />
    </div>
  );
}
