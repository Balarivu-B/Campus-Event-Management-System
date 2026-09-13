import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Users, ArrowRight } from 'lucide-react';

export default function EventCard({ event }) {
  const {
    id,
    title,
    description,
    category,
    event_date,
    start_time,
    end_time,
    location,
    capacity,
    organizer_name,
    registered_count = 0,
    available_seats = capacity,
    status
  } = event;

  const percentFull = Math.min(100, Math.round((registered_count / capacity) * 100));

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format 24h time to 12h
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const getStatusBadgeClass = () => {
    switch (status) {
      case 'APPROVED': return 'badge-approved';
      case 'PENDING': return 'badge-pending';
      case 'REJECTED': return 'badge-rejected';
      case 'CANCELLED': return 'badge-cancelled';
      case 'COMPLETED': return 'badge-completed';
      default: return 'badge-approved';
    }
  };

  return (
    <div className="event-card">
      <div className="event-card-header">
        <span className="category-tag">{category}</span>
        <span className={`badge ${getStatusBadgeClass()}`}>
          <span className="badge-dot"></span>
          {status}
        </span>
      </div>

      <div className="event-card-body">
        <h3 className="event-card-title">{title}</h3>
        <p className="event-card-desc">{description}</p>

        <div className="event-meta-list">
          <div className="event-meta-item">
            <Calendar size={15} />
            <span>{formatDate(event_date)}</span>
          </div>
          <div className="event-meta-item">
            <Clock size={15} />
            <span>{formatTime(start_time)} - {formatTime(end_time)}</span>
          </div>
          <div className="event-meta-item">
            <MapPin size={15} />
            <span>{location}</span>
          </div>
        </div>

        <div className="capacity-container">
          <div className="capacity-info">
            <span>Seats Filled: {registered_count} / {capacity}</span>
            <span style={{ fontWeight: 600, color: available_seats <= 5 ? '#ef4444' : 'var(--text-secondary)' }}>
              {available_seats > 0 ? `${available_seats} seats left` : 'Full'}
            </span>
          </div>
          <div className="capacity-progress">
            <div
              className={`capacity-fill ${percentFull > 80 ? 'high' : ''}`}
              style={{ width: `${percentFull}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="event-card-footer">
        <div className="event-organizer-info">
          By <span>{organizer_name || 'Organizer'}</span>
        </div>
        <Link to={`/events/${id}`} className="btn btn-primary btn-sm">
          <span>View Details</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
