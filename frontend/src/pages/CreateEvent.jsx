import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { createEvent } from '../api';
import EventForm from '../components/EventForm';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await createEvent(formData);
      setSuccessMsg(res.message || 'Event created successfully. Waiting for faculty approval.');

      setTimeout(() => {
        navigate('/organizer/events');
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to create event.');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      <Link to="/organizer/dashboard" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div className="page-header-title">
          <h1>Create Campus Event</h1>
          <p>Submit a new event proposal for faculty coordinator review and student participation.</p>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <Info size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Approval Notice: </strong>
          New event submissions will be created with status <strong>PENDING</strong> and must be approved by a Faculty Coordinator before opening for student registration.
        </span>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <EventForm
        onSubmit={handleSubmit}
        loading={loading}
        onCancel={() => navigate('/organizer/dashboard')}
      />
    </div>
  );
}
