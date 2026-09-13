import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Tag, FileText } from 'lucide-react';

const CATEGORIES = [
  'Technical',
  'Workshop',
  'Seminar',
  'Cultural',
  'Sports',
  'Hackathon',
  'Competition',
  'Club Activity',
  'Other'
];

export default function EventForm({
  initialData = {},
  onSubmit,
  isEditing = false,
  loading = false,
  onCancel
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    event_date: '',
    start_time: '09:00',
    end_time: '17:00',
    location: '',
    capacity: 50
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Ensure date format is YYYY-MM-DD
      let formattedDate = initialData.event_date || '';
      if (formattedDate && formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      }

      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'Technical',
        event_date: formattedDate,
        start_time: initialData.start_time ? initialData.start_time.substring(0, 5) : '09:00',
        end_time: initialData.end_time ? initialData.end_time.substring(0, 5) : '17:00',
        location: initialData.location || '',
        capacity: initialData.capacity || 50
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setError('Event Title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Event Description is required.');
      return;
    }
    if (!formData.event_date) {
      setError('Please select an event date.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Event Location / Venue is required.');
      return;
    }
    const cap = parseInt(formData.capacity, 10);
    if (isNaN(cap) || cap <= 0) {
      setError('Event Capacity must be at least 1.');
      return;
    }
    if (formData.start_time >= formData.end_time) {
      setError('End time must be later than start time.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">
          Event Title <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className="form-control"
          placeholder="e.g. Annual Hackathon 2026"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">
            Event Category <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            id="category"
            name="category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="capacity">
            Attendee Capacity <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            max="5000"
            className="form-control"
            placeholder="e.g. 100"
            value={formData.capacity}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row-3">
        <div className="form-group">
          <label htmlFor="event_date">
            Event Date <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            className="form-control"
            value={formData.event_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="start_time">
            Start Time <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            className="form-control"
            value={formData.start_time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="end_time">
            End Time <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="end_time"
            name="end_time"
            type="time"
            className="form-control"
            value={formData.end_time}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location">
          Location / Venue <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          id="location"
          name="location"
          type="text"
          className="form-control"
          placeholder="e.g. Tech Park Auditorium A or Seminar Hall 2"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">
          Detailed Description <span style={{ color: 'red' }}>*</span>
        </label>
        <textarea
          id="description"
          name="description"
          className="form-control"
          rows={4}
          placeholder="Provide a comprehensive summary of the event agenda, speaker details, and eligibility criteria..."
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event (Submit for Review)'}
        </button>
      </div>
    </form>
  );
}
