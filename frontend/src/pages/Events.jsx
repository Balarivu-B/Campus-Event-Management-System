import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, AlertCircle, Compass } from 'lucide-react';
import { getEvents } from '../api';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import Loading from '../components/Loading';

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalEvents: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter criteria initialized from URL or defaults
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'date_asc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Sync state to URL params
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    if (date) params.date = date;
    if (sort && sort !== 'date_asc') params.sort = sort;
    if (page > 1) params.page = page.toString();

    setSearchParams(params, { replace: true });
  }, [search, category, date, sort, page, setSearchParams]);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getEvents({
        search,
        category: category !== 'All' ? category : undefined,
        date: date || undefined,
        sort,
        page,
        limit: 6
      });

      setEvents(data.events || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, category, date, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setDate('');
    setSort('date_asc');
    setPage(1);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem 1.5rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-title">
          <h1>Discover Campus Events</h1>
          <p>Browse, filter, and register for approved seminars, workshops, cultural fests, and competitions.</p>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{events.length}</strong> of <strong>{pagination.totalEvents}</strong> events
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="search-filter-wrapper">
        <SearchBar
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          onClear={() => { setSearch(''); setPage(1); }}
        />
        <FilterBar
          category={category}
          onCategoryChange={(cat) => { setCategory(cat); setPage(1); }}
          date={date}
          onDateChange={(d) => { setDate(d); setPage(1); }}
          sort={sort}
          onSortChange={(s) => { setSort(s); setPage(1); }}
          onReset={handleResetFilters}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Events Grid / Loading / Empty State */}
      {loading ? (
        <Loading message="Fetching events from server..." />
      ) : events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)'
        }}>
          <Compass size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No events found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
            We couldn't find any events matching your selected criteria. Try adjusting your search query or reset the filters.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="events-grid">
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  className={`page-btn ${num === pagination.page ? 'active' : ''}`}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              ))}

              <button
                className="page-btn"
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
