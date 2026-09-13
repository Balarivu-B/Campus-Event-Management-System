import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ShieldAlert, CheckCircle2, Building2, UserCheck, AlertCircle } from 'lucide-react';
import { register, getFacultyByInstitution } from '../api';

export default function Register({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science',
    institution: 'College of Engineering',
    phone: '',
    role: 'STUDENT'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchingFaculty, setMatchingFaculty] = useState([]);
  const [fetchingFaculty, setFetchingFaculty] = useState(false);
  const navigate = useNavigate();

  // Check matching faculty for the entered/selected institution
  useEffect(() => {
    const inst = formData.institution ? formData.institution.trim() : '';
    if (!inst || inst.length < 3) {
      setMatchingFaculty([]);
      return;
    }

    let isMounted = true;
    setFetchingFaculty(true);
    getFacultyByInstitution(inst)
      .then(data => {
        if (isMounted) {
          setMatchingFaculty(data.faculty || []);
        }
      })
      .catch(() => {
        if (isMounted) setMatchingFaculty([]);
      })
      .finally(() => {
        if (isMounted) setFetchingFaculty(false);
      });

    return () => {
      isMounted = false;
    };
  }, [formData.institution]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.institution.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await register(formData);
      onLoginSuccess(data.user);

      if (data.user.role === 'ORGANIZER') {
        navigate('/organizer/dashboard');
      } else if (data.user.role === 'FACULTY') {
        navigate('/faculty/pending-events');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '580px', padding: '3.5rem 1.5rem' }}>
      <div className="form-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <UserPlus size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Create an Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Register to organize events, approve proposals, or participate across campus.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name <span style={{ color: 'red' }}>*</span></label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="e.g. Alex Johnson"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Campus Email Address <span style={{ color: 'red' }}>*</span></label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="e.g. user@college.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Register As <span style={{ color: 'red' }}>*</span></label>
            <select
              id="role"
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              style={{ fontWeight: 600 }}
            >
              <option value="STUDENT">Student (Discover & Attend Events)</option>
              <option value="ORGANIZER">Event Organizer (Create Campus Event Proposals)</option>
              <option value="FACULTY">Faculty Member (Review & Approve Events for Your College)</option>
            </select>
          </div>

          {/* School / College Input (Typed text with suggestions) */}
          <div className="form-group">
            <label htmlFor="institution">
              School / College Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              list="institution-suggestions"
              id="institution"
              name="institution"
              type="text"
              className="form-control"
              placeholder="Type your School or College (e.g. College of Engineering)"
              value={formData.institution}
              onChange={handleChange}
              required
            />
            <datalist id="institution-suggestions">
              <option value="College of Engineering" />
              <option value="College of Arts & Sciences" />
              <option value="School of Business" />
              <option value="School of Medicine & Health" />
              <option value="School of Law" />
              <option value="School of Design" />
              <option value="Faculty of Applied Sciences" />
            </datalist>
            <span className="form-hint">
              You can type any custom School / College name or pick a suggestion.
            </span>
          </div>

          {/* Institutional Faculty Approval Matching Callout */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', fontWeight: 600 }}>
              <Building2 size={16} style={{ color: 'var(--primary)' }} />
              <span>College Approval Scoping for "{formData.institution || 'Your College'}":</span>
            </div>

            {formData.role === 'ORGANIZER' && (
              <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
                Proposals you create will only be reviewable and approvable by faculty registered under <strong>{formData.institution}</strong>.
              </p>
            )}

            {formData.role === 'FACULTY' && (
              <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
                You will have authority to review, approve, or reject event proposals submitted by organizers from <strong>{formData.institution}</strong>.
              </p>
            )}

            {formData.role === 'STUDENT' && (
              <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
                You will discover approved campus events and represent <strong>{formData.institution}</strong>.
              </p>
            )}

            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              {fetchingFaculty ? (
                <span style={{ color: 'var(--text-secondary)' }}>Checking faculty coordinators...</span>
              ) : matchingFaculty.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)' }}>
                  <UserCheck size={15} />
                  <span>
                    <strong>Registered Faculty Approvers:</strong> {matchingFaculty.map(f => f.name).join(', ')}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <AlertCircle size={15} style={{ color: 'var(--warning)' }} />
                  <span>
                    No faculty coordinator registered yet for this college. A faculty member can register under this college to approve event proposals.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                list="department-suggestions"
                id="department"
                name="department"
                type="text"
                className="form-control"
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={handleChange}
              />
              <datalist id="department-suggestions">
                <option value="Computer Science" />
                <option value="Information Technology" />
                <option value="Electronics & Communication" />
                <option value="Mechanical Engineering" />
                <option value="Civil Engineering" />
                <option value="Business Administration" />
                <option value="Fine Arts" />
                <option value="General Sciences" />
              </datalist>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-control"
                placeholder="+1 555-0199"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password <span style={{ color: 'red' }}>*</span></label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password <span style={{ color: 'red' }}>*</span></label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '1.25rem' }}
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
