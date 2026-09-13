import React, { useState } from 'react';
import { User, Mail, Building, Phone, Shield, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { updateUser, setUser } from '../api';

export default function Profile({ user, onUserUpdated }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    institution: user?.institution || 'College of Engineering',
    department: user?.department || '',
    phone: user?.phone || '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });

      const payload = {
        name: formData.name,
        institution: formData.institution,
        department: formData.department,
        phone: formData.phone
      };

      if (formData.password.trim()) {
        if (formData.password.trim().length < 6) {
          setMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
          setLoading(false);
          return;
        }
        payload.password = formData.password.trim();
      }

      const res = await updateUser(user.id, payload);
      setUser(res.user);
      onUserUpdated(res.user);
      setFormData(prev => ({ ...prev, password: '' }));
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '680px', padding: '3rem 1.5rem' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div className="page-header-title">
          <h1>My Profile</h1>
          <p>Manage your personal account settings and college credentials.</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Account Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          fontWeight: 700
        }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.25rem' }}>{user?.name}</h2>
          <p style={{ color: '#e0e7ff', fontSize: '0.9rem', margin: 0 }}>
            {user?.email} • <span className="role-chip" style={{ background: 'rgba(255, 255, 255, 0.3)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>{user?.role}</span>
          </p>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form className="form-card" onSubmit={handleSubmit}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Personal Details</h3>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address (Read Only)</label>
          <input
            id="email"
            type="email"
            className="form-control"
            value={user?.email || ''}
            disabled
            style={{ background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="institution">School / College</label>
          <input
            id="institution"
            name="institution"
            type="text"
            className="form-control"
            value={formData.institution}
            onChange={handleChange}
            placeholder="e.g. College of Engineering"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              id="department"
              name="department"
              type="text"
              className="form-control"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label htmlFor="password">Change Password (leave blank to keep current)</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control"
            placeholder="Enter new password (min. 6 chars)"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
