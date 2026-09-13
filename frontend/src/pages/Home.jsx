import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Ticket,
  CalendarCheck,
  Bell,
  ArrowRight,
  Sparkles,
  Code,
  Laptop,
  Music,
  Trophy,
  Award,
  Users
} from 'lucide-react';
import { getEvents } from '../api';
import EventCard from '../components/EventCard';
import Loading from '../components/Loading';

const FEATURES = [
  {
    icon: Compass,
    title: 'Discover Events',
    desc: 'Explore diverse technical hackathons, cultural fests, workshops, and sports tournaments across campus.'
  },
  {
    icon: Ticket,
    title: 'Instant Registration',
    desc: 'Secure your attendee seat in seconds with real-time seat tracking and instant registration receipts.'
  },
  {
    icon: CalendarCheck,
    title: 'Event Management',
    desc: 'Organizers can draft proposals, manage live attendee rosters, and view real-time participant metrics.'
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    desc: 'Stay informed with automated updates on proposal approvals, registration confirmations, and schedule updates.'
  }
];

const CATEGORIES = [
  { name: 'Technical', icon: Code, count: 'Coding & Tech Talks' },
  { name: 'Hackathon', icon: Laptop, count: '24h Build Challenges' },
  { name: 'Workshop', icon: Sparkles, count: 'Hands-on Learning' },
  { name: 'Cultural', icon: Music, count: 'Music, Drama & Arts' },
  { name: 'Sports', icon: Trophy, count: 'Tournaments & Matches' },
  { name: 'Competition', icon: Award, count: 'Contests & Quizzes' }
];

export default function Home({ user }) {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await getEvents({ limit: 3, sort: 'date_asc' });
        setFeaturedEvents(data.events || []);
      } catch (err) {
        console.warn('Failed to load featured events', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        color: 'white',
        padding: '5rem 0 6rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '840px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#a5b4fc',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <Sparkles size={16} /> Campus Event Management System (CEMS)
          </div>

          <h1 style={{
            fontSize: '3.25rem',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1.5rem'
          }}>
            Discover, organize and participate in campus events.
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: '#cbd5e1',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '680px',
            margin: '0 auto 2.5rem auto'
          }}>
            The all-in-one portal connecting passionate students, visionary event organizers, faculty coordinators, and college administration in one unified platform.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events" className="btn btn-primary btn-lg" style={{ minWidth: '180px' }}>
              <span>Explore Events</span>
              <ArrowRight size={18} />
            </Link>
            {!user ? (
              <Link to="/register" className="btn btn-secondary btn-lg" style={{ minWidth: '180px', background: 'rgba(255, 255, 255, 0.15)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                <span>Get Started</span>
              </Link>
            ) : (
              <Link
                to={user.role === 'STUDENT' ? '/student/dashboard' : user.role === 'ORGANIZER' ? '/organizer/dashboard' : user.role === 'FACULTY' ? '/faculty/dashboard' : '/admin/dashboard'}
                className="btn btn-secondary btn-lg"
                style={{ minWidth: '180px', background: 'rgba(255, 255, 255, 0.15)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' }}
              >
                <span>Go to Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Showcase Cards */}
      <section style={{ padding: '4.5rem 0', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Designed for Academic & Campus Life</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Equipped with transparent workflows from submission to faculty review and real-time attendance registration.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.75rem'
          }}>
            {FEATURES.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} style={{
                  background: 'var(--bg-page)',
                  padding: '2rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  transition: 'all var(--transition-fast)'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem'
                  }}>
                    <IconComp size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{feat.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Event Categories */}
      <section style={{ padding: '4.5rem 0', background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Explore by Category</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Find events tailored to your technical passions and creative interests.</p>
            </div>
            <Link to="/events" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>View All Categories</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem'
          }}>
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  to={`/events?category=${encodeURIComponent(cat.name)}`}
                  style={{
                    background: 'white',
                    padding: '1.5rem 1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'all var(--transition-normal)'
                  }}
                  className="cat-card"
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <Icon size={22} />
                  </div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{cat.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cat.count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Upcoming Events */}
      <section style={{ padding: '4.5rem 0', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Upcoming Campus Events</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Approved official events ready for student registration.</p>
            </div>
            <Link to="/events" className="btn btn-primary btn-sm">
              <span>Browse All Events</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <Loading message="Loading upcoming events..." />
          ) : featuredEvents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'var(--bg-page)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-color)'
            }}>
              <p style={{ color: 'var(--text-muted)' }}>No upcoming events scheduled at the moment.</p>
            </div>
          ) : (
            <div className="events-grid">
              {featuredEvents.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
