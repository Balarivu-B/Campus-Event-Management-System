import React from 'react';

export default function Loading({ message = 'Loading...', fullPage = false }) {
  if (fullPage) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        width: '100%'
      }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{message}</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem 0', width: '100%' }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{message}</p>
    </div>
  );
}
