import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Users, ArrowLeft, Mail, Phone, Building, AlertCircle, Calendar } from 'lucide-react';
import { getEventParticipants, getEvents } from '../api';
import Loading from '../components/Loading';

export default function Participants({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [eventsList, setEventsList] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load available events for selector
  useEffect(() => {
    async function loadOrganizerEvents() {
      try {
        const queryParams = user?.role === 'ORGANIZER' ? { organizer_id: user.id } : {};
        const data = await getEvents(queryParams);
        setEventsList(data.events || []);

        // If no eventId in url, pick first event
        if (!eventId && data.events && data.events.length > 0) {
          setSearchParams({ eventId: data.events[0].id.toString() });
        }
      } catch (err) {
        console.warn(err);
      }
    }
    if (user) loadOrganizerEvents();
  }, [user]);

  // Load participants for selected event
  useEffect(() => {
    async function loadParticipants() {
      if (!eventId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await getEventParticipants(eventId);
        setCurrentEvent(res.event);
        setParticipants(res.participants || []);
      } catch (err) {
        setError(err.message || 'Failed to load participants for this event.');
      } finally {
        setLoading(false);
      }
    }

    loadParticipants();
  }, [eventId]);

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem 1.5rem' }}>
      <Link to="/organizer/events" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Events
      </Link>

      <div className="page-header">
        <div className="page-header-title">
          <h1>Event Participants Roster</h1>
          <p>Review registered students and attendance details for your campus event.</p>
        </div>

        {eventsList.length > 0 && (
          <div style={{ minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Select Event
            </label>
            <select
              className="form-control"
              value={eventId || ''}
              onChange={(e) => setSearchParams({ eventId: e.target.value })}
              style={{ padding: '0.55rem 0.85rem' }}
            >
              {eventsList.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.category})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Event Summary Bar */}
      {currentEvent && (
        <div style={{
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{currentEvent.title}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Registered Attendees: <strong>{participants.filter(p => p.registration_status === 'REGISTERED').length}</strong> / Capacity: <strong>{currentEvent.capacity}</strong>
            </span>
          </div>

          <Link to={`/events/${currentEvent.id}`} className="btn btn-secondary btn-sm">
            View Public Event
          </Link>
        </div>
      )}

      {loading ? (
        <Loading message="Loading attendee roster..." />
      ) : participants.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)'
        }}>
          <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No student registrations yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Students haven't registered for this event yet. Once approved and public, student signups will appear here.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Registration Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p, idx) => (
                <tr key={p.registration_id}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong style={{ fontSize: '0.95rem' }}>{p.student_name}</strong>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <Mail size={13} color="var(--primary)" /> {p.student_email}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                      <Building size={13} color="var(--text-muted)" /> {p.student_department || 'General'}
                    </span>
                  </td>
                  <td>{p.student_phone || 'N/A'}</td>
                  <td>{formatDate(p.registered_at)}</td>
                  <td>
                    <span className={`badge ${p.registration_status === 'REGISTERED' ? 'badge-approved' : 'badge-cancelled'}`}>
                      <span className="badge-dot"></span>
                      {p.registration_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
