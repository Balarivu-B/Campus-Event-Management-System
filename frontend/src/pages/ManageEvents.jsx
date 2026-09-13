import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Users, Eye, AlertCircle, CheckCircle, X } from 'lucide-react';
import { getEvents, deleteEvent, updateEvent } from '../api';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';
import EventForm from '../components/EventForm';

export default function ManageEvents({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrganizerEvents = async () => {
    try {
      setLoading(true);
      setError('');
      // Query events created by this organizer
      const data = await getEvents({ organizer_id: user?.id, limit: 100, sort: 'created_desc' });
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOrganizerEvents();
    }
  }, [user]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await deleteEvent(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess('Event deleted successfully.');
      fetchOrganizerEvents();
    } catch (err) {
      setError(err.message || 'Failed to delete event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (formData) => {
    if (!editingEvent) return;
    try {
      setActionLoading(true);
      await updateEvent(editingEvent.id, formData);
      setEditingEvent(null);
      setSuccess('Event updated successfully.');
      fetchOrganizerEvents();
    } catch (err) {
      setError(err.message || 'Failed to update event.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`badge badge-${status.toLowerCase()}`}>
        <span className="badge-dot"></span>
        {status}
      </span>
    );
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem 1.5rem' }}>
      <div className="page-header">
        <div className="page-header-title">
          <h1>Manage Your Events</h1>
          <p>Create, update, monitor attendee capacity, and view registered rosters.</p>
        </div>
        <Link to="/organizer/create-event" className="btn btn-primary btn-sm">
          <PlusCircle size={16} />
          <span>New Event</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Editing Modal / View */}
      {editingEvent && (
        <div className="modal-backdrop" onClick={() => setEditingEvent(null)}>
          <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Event: {editingEvent.title}</h3>
              <button className="modal-close-btn" onClick={() => setEditingEvent(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <EventForm
                initialData={editingEvent}
                onSubmit={handleSaveEdit}
                isEditing={true}
                loading={actionLoading}
                onCancel={() => setEditingEvent(null)}
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <Loading message="Loading events..." />
      ) : events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No events created yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Start drafting an event to invite campus participants!
          </p>
          <Link to="/organizer/create-event" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Create First Event</span>
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title & Location</th>
                <th>Category</th>
                <th>Event Date</th>
                <th>Status</th>
                <th>Participants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>{ev.title}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.location}</span>
                    {ev.status === 'REJECTED' && ev.rejection_reason && (
                      <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.25rem' }}>
                        Reason: {ev.rejection_reason}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="category-tag">{ev.category}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.88rem' }}>{ev.event_date}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {ev.start_time?.substring(0, 5)} - {ev.end_time?.substring(0, 5)}
                    </div>
                  </td>
                  <td>{getStatusBadge(ev.status)}</td>
                  <td>
                    <Link
                      to={`/organizer/participants?eventId=${ev.id}`}
                      style={{ fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      title="View registered student roster"
                    >
                      <Users size={15} />
                      <span>{ev.registered_count || 0} / {ev.capacity}</span>
                    </Link>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/events/${ev.id}`} className="btn btn-secondary btn-sm" title="Public View">
                        <Eye size={14} />
                      </Link>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingEvent(ev)}
                        title="Edit Event"
                      >
                        <Edit size={14} />
                      </button>
                      <Link
                        to={`/organizer/participants?eventId=${ev.id}`}
                        className="btn btn-secondary btn-sm"
                        title="Attendee Roster"
                      >
                        <Users size={14} />
                      </Link>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => setDeleteTarget(ev)}
                        title="Delete Event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Campus Event"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? All existing student registrations will also be removed.`}
        confirmText={actionLoading ? 'Deleting...' : 'Delete Event'}
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
