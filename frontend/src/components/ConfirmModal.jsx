import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  showReasonInput = false,
  reasonPlaceholder = 'Please enter a reason...',
  onConfirm,
  onCancel
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (showReasonInput && !reason.trim()) {
      setError('Please provide a reason to continue.');
      return;
    }
    setError('');
    onConfirm(showReasonInput ? reason.trim() : true);
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle
              size={20}
              color={isDestructive ? 'var(--status-rejected-text)' : 'var(--primary)'}
            />
            <h3>{title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onCancel} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: showReasonInput ? '1rem' : 0 }}>
            {message}
          </p>

          {showReasonInput && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Rejection Reason <span style={{ color: 'red' }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder={reasonPlaceholder}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.35rem' }}>{error}</p>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
