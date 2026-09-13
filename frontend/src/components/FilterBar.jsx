import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'All',
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

export default function FilterBar({
  category,
  onCategoryChange,
  date,
  onDateChange,
  sort,
  onSortChange,
  onReset
}) {
  const hasActiveFilters = category !== 'All' || date !== '' || sort !== 'date_asc';

  return (
    <div className="filters-row">
      <div className="filter-item">
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
          Category
        </label>
        <select
          className="form-control"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.88rem' }}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-item">
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
          Event Date
        </label>
        <input
          type="date"
          className="form-control"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.88rem' }}
        />
      </div>

      <div className="filter-item">
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
          Sort By
        </label>
        <select
          className="form-control"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.88rem' }}
        >
          <option value="date_asc">Date: Upcoming First</option>
          <option value="date_desc">Date: Furthest First</option>
          <option value="title_asc">Title: A to Z</option>
          <option value="title_desc">Title: Z to A</option>
          <option value="created_desc">Newly Added</option>
        </select>
      </div>

      {hasActiveFilters && (
        <div style={{ alignSelf: 'flex-end', marginBottom: '2px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onReset}
            title="Reset Filters"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      )}
    </div>
  );
}
