import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Eye, AlertCircle, Check, ArrowLeft, Clock } from 'lucide-react';
import { getEvents, approveEvent, rejectEvent } from '../api';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';

export default function PendingEvents({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [rejectTarget, setRejectTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError('');
      // Query specifically PENDING status events
      const data = await getEvents({ status: 'PENDING', limit: 100 });
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || 'Failed to load pending proposals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async () => {
    if (!approveTarget) return;
    try {
      setActionLoading(true);
      await approveEvent(approveTarget.id);
      setApproveTarget(null);
      setSuccess(`Event "${approveTarget.title}" approved successfully! Students can now register.`);
      fetchPending();
    } catch (err) {
      setError(err.message || 'Failed to approve event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    try {
      setActionLoading(true);
      await rejectEvent(rejectTarget.id, reason);
      setRejectTarget(null);
      setSuccess(`Event "${rejectTarget.title}" rejected with provided feedback.`);
      fetchPending();
    } catch (err) {
      setError(err.message || 'Failed to reject event.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem 1.5rem' }}>
      <Link to="/faculty/dashboard" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Faculty Dashboard
      </Link>

      <div className="page-header">
        <div className="page-header-title">
          <h1>Pending Event Approvals</h1>
          <p>
            Reviewing proposals from your institution: <strong>{user?.institution || 'College of Engineering'}</strong>.
            Faculty coordinators can only review and authorize events from their assigned school or college.
          </p>
        </div>
        <span className="badge badge-pending" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
          <Clock size={14} /> {events.length} Pending Approval
        </span>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <Loading message="Loading pending events..." />
      ) : events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)'
        }}>
          <CheckCircle2 size={44} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Review Queue Empty</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            All event proposals have been reviewed! New submissions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title & Description</th>
                <th>Organizer</th>
                <th>Category</th>
                <th>Date & Time</th>
                <th>Location & Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td style={{ maxWidth: '280px' }}>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>{ev.title}</strong>
                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      margin: '0.25rem 0 0 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {ev.description}
                    </p>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ev.organizer_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500 }}>{ev.organizer_institution || 'Engineering'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.organizer_department}</div>
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
                  <td>
                    <div>{ev.location}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cap: {ev.capacity} seats</div>
                  </td>
                  <td>
                    <span className="badge badge-pending">
                      <span className="badge-dot"></span> PENDING
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/events/${ev.id}`} className="btn btn-secondary btn-sm" title="View Proposal">
                        <Eye size={14} />
                      </Link>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => setApproveTarget(ev)}
                        title="Approve Event"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Check size={14} />
                        <span>Approve</span>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => setRejectTarget(ev)}
                        title="Reject with Reason"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={!!approveTarget}
        title="Approve Campus Event"
        message={`Are you sure you want to approve "${approveTarget?.title}"? Once approved, the event will become visible publicly and open for student registrations.`}
        confirmText={actionLoading ? 'Approving...' : 'Yes, Approve Event'}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />

      {/* Reject with Reason Modal */}
      <ConfirmModal
        isOpen={!!rejectTarget}
        title="Reject Event Proposal"
        message={`Provide a clear reason explaining why "${rejectTarget?.title}" cannot be approved at this time. The organizer will receive this feedback.`}
        confirmText={actionLoading ? 'Rejecting...' : 'Reject Event'}
        isDestructive={true}
        showReasonInput={true}
        reasonPlaceholder="e.g. Venue conflicts with scheduled examinations; please reschedule."
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
