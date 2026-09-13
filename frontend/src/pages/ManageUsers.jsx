import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Edit, Trash2, Shield, AlertCircle, CheckCircle, ArrowLeft, Search, UserX, UserCheck, X } from 'lucide-react';
import { getUsers, updateUser, deleteUser } from '../api';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';

export default function ManageUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modals
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUsers({
        search: search.trim() || undefined,
        role: roleFilter !== 'All' ? roleFilter : undefined
      });
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async () => {
    if (!toggleTarget) return;
    try {
      setActionLoading(true);
      const newStatus = !toggleTarget.is_active;
      await updateUser(toggleTarget.id, { is_active: newStatus });
      setToggleTarget(null);
      setSuccess(`User account ${newStatus ? 'activated' : 'deactivated'} successfully.`);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess('User removed from system successfully.');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setActionLoading(true);
      await updateUser(editingUser.id, {
        name: editingUser.name,
        department: editingUser.department,
        phone: editingUser.phone,
        role: editingUser.role,
        is_active: editingUser.is_active
      });
      setEditingUser(null);
      setSuccess('User details updated successfully.');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user.');
    } finally {
      setActionLoading(false);
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
      <Link to="/admin/dashboard" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Admin Dashboard
      </Link>

      <div className="page-header">
        <div className="page-header-title">
          <h1>Manage User Directory</h1>
          <p>Auditing user identities, role assignments, department affiliations, and account activation.</p>
        </div>
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

      {/* Filter and Search Bar */}
      <div className="search-filter-wrapper" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="FACULTY">Faculty</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.65rem 1.25rem' }}>
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      {loading ? (
        <Loading message="Loading user directory..." />
      ) : users.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)'
        }}>
          <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No users found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try broadening your search query or role filter.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>School / College</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>{u.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className="role-chip" style={{
                      background: u.role === 'ADMIN' ? '#f59e0b' : u.role === 'FACULTY' ? '#10b981' : u.role === 'ORGANIZER' ? '#0284c7' : 'var(--primary)'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{u.institution || 'Main Campus'}</span>
                  </td>
                  <td>{u.department || 'N/A'}</td>
                  <td>{u.phone || 'N/A'}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                      <span className="badge-dot"></span>
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingUser({ ...u })}
                        title="Edit User Info & Role"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className={`btn ${u.is_active ? 'btn-outline-danger' : 'btn-success'} btn-sm`}
                        onClick={() => setToggleTarget(u)}
                        title={u.is_active ? 'Deactivate User' : 'Activate User'}
                      >
                        {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => setDeleteTarget(u)}
                        title="Delete User"
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User: {editingUser.name}</h3>
              <button className="modal-close-btn" onClick={() => setEditingUser(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEditUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address (Read Only)</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editingUser.email}
                    disabled
                    style={{ background: '#f8fafc' }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      className="form-control"
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="ORGANIZER">ORGANIZER</option>
                      <option value="FACULTY">FACULTY</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Account Status</label>
                    <select
                      className="form-control"
                      value={editingUser.is_active ? '1' : '0'}
                      onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.value === '1' })}
                    >
                      <option value="1">Active</option>
                      <option value="0">Deactivated</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>School / College</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingUser.institution || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, institution: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingUser.department || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingUser.phone || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save User Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Active/Deactivate Confirmation Modal */}
      <ConfirmModal
        isOpen={!!toggleTarget}
        title={toggleTarget?.is_active ? 'Deactivate User Account' : 'Activate User Account'}
        message={`Are you sure you want to ${toggleTarget?.is_active ? 'deactivate' : 'reactivate'} the account for "${toggleTarget?.name}"? ${toggleTarget?.is_active ? 'They will no longer be able to log in.' : 'They will regain access immediately.'}`}
        confirmText={toggleTarget?.is_active ? 'Deactivate' : 'Activate'}
        isDestructive={toggleTarget?.is_active}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleTarget(null)}
      />

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${deleteTarget?.name}" (${deleteTarget?.email})? All associated registrations will also be removed.`}
        confirmText={actionLoading ? 'Deleting...' : 'Delete User'}
        isDestructive={true}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
