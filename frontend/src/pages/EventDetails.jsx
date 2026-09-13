import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Mail,
  Building,
  ShieldCheck,
  Ticket
} from 'lucide-react';
import { getEvent, registerEvent, cancelRegistration } from '../api';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';

export default function EventDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getEvent(id);
      setEvent(data.event);
      setIsRegistered(data.isRegistered);
      setRegistrationId(data.registrationId);
    } catch (err) {
      setMessage({ text: err.message || 'Failed to load event details.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ text: '', type: '' });
      const res = await registerEvent(id);
      setMessage({ text: res.message || 'Registration successful!', type: 'success' });
      setIsRegistered(true);
      fetchDetails(); // Refresh counts
    } catch (err) {
      setMessage({ text: err.message || 'Registration failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    try {
      setSubmitting(true);
      await cancelRegistration(registrationId);
      setShowCancelModal(false);
      setIsRegistered(false);
      setMessage({ text: 'Your registration has been cancelled.', type: 'info' });
      fetchDetails(); // Refresh counts
    } catch (err) {
      setMessage({ text: err.message || 'Failed to cancel registration.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading fullPage message="Loading event details..." />;
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Event Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
          The requested event may have been removed or is unavailable.
        </p>
        <Link to="/events" className="btn btn-primary">
          Browse All Events
        </Link>
      </div>
    );
  }

  const isFull = event.available_seats <= 0;
  const isApproved = event.status === 'APPROVED';

  // Format date and time
  const formattedDate = new Date(event.event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem', maxWidth: '1000px' }}>
      <Link to="/events" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Events
      </Link>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : message.type === 'error' ? <XCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Event Card */}
      <div className="form-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span className="category-tag" style={{ marginBottom: '0.75rem' }}>{event.category}</span>
            <h1 style={{ fontSize: '2.25rem', marginTop: '0.25rem' }}>{event.title}</h1>
          </div>
          <div>
            <span className={`badge badge-${event.status.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
              <span className="badge-dot"></span>
              {event.status}
            </span>
          </div>
        </div>

        {/* Rejection notice if viewing rejected event */}
        {event.status === 'REJECTED' && event.rejection_reason && (
          <div className="alert alert-error" style={{ marginBottom: '1.75rem' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Rejection Notice: </strong>
              <span>{event.rejection_reason}</span>
            </div>
          </div>
        )}

        {/* Grid of Key Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          margin: '1.75rem 0'
        }}>
          <div className="event-meta-item">
            <Calendar size={20} color="var(--primary)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>DATE</span>
              <strong style={{ fontSize: '0.95rem' }}>{formattedDate}</strong>
            </div>
          </div>

          <div className="event-meta-item">
            <Clock size={20} color="var(--primary)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>TIME</span>
              <strong style={{ fontSize: '0.95rem' }}>{formatTime(event.start_time)} - {formatTime(event.end_time)}</strong>
            </div>
          </div>

          <div className="event-meta-item">
            <MapPin size={20} color="var(--primary)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>LOCATION / VENUE</span>
              <strong style={{ fontSize: '0.95rem' }}>{event.location}</strong>
            </div>
          </div>

          <div className="event-meta-item">
            <Users size={20} color="var(--primary)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>AVAILABILITY</span>
              <strong style={{ fontSize: '0.95rem', color: event.available_seats <= 5 ? '#ef4444' : 'var(--text-primary)' }}>
                {event.available_seats} of {event.capacity} seats left
              </strong>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ margin: '2rem 0' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>About This Event</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', fontSize: '1rem' }}>
            {event.description}
          </p>
        </div>

        {/* Organizer Box */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          margin: '2rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700
          }}>
            {event.organizer_name ? event.organizer_name.charAt(0).toUpperCase() : 'O'}
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Host / Organizer</span>
            <h4 style={{ fontSize: '1rem', margin: 0 }}>{event.organizer_name}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {event.organizer_department} • {event.organizer_email}
            </p>
          </div>
        </div>

        {/* Registration Actions Box */}
        <div style={{
          background: isApproved ? 'var(--primary-light)' : '#f1f5f9',
          border: '1px solid #c7d2fe',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
              {isRegistered
                ? 'You are registered for this event'
                : !isApproved
                ? `Event Status: ${event.status}`
                : isFull
                ? 'Event Registration is Full'
                : 'Reserve Your Seat'}
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              {isRegistered
                ? 'Your registration has been confirmed. Present your confirmation upon entry.'
                : !isApproved
                ? 'Registration opens as soon as faculty coordinators approve the event proposal.'
                : isFull
                ? 'All available attendee slots have been booked.'
                : `${event.available_seats} remaining seats available.`}
            </p>
          </div>

          <div>
            {!user ? (
              <Link to="/login" className="btn btn-primary">
                Login to Register
              </Link>
            ) : user.role !== 'STUDENT' ? (
              <span className="badge" style={{ background: '#e2e8f0', color: '#475569', padding: '0.5rem 1rem' }}>
                Registration is for Students Only
              </span>
            ) : isRegistered ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span className="badge badge-approved" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}>
                  <CheckCircle size={16} /> Registered
                </span>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setShowCancelModal(true)}
                  disabled={submitting}
                >
                  Cancel Registration
                </button>
              </div>
            ) : !isApproved ? (
              <button className="btn btn-secondary" disabled>
                Pending Approval
              </button>
            ) : isFull ? (
              <button className="btn btn-secondary" disabled>
                Registration Full
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                onClick={handleRegister}
                disabled={submitting}
              >
                <Ticket size={18} />
                <span>{submitting ? 'Registering...' : 'Register Now'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Registration Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Registration"
        message={`Are you sure you want to cancel your registration for "${event.title}"? Your seat will be made available to other students.`}
        confirmText="Yes, Cancel Registration"
        isDestructive={true}
        onConfirm={handleCancelRegistration}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
}
