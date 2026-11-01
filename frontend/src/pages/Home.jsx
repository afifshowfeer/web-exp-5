import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const events = [
  { id: 1, title: 'Hackathon 2026', desc: '24-hour coding marathon with prizes worth ₹1L+', date: 'Jan 14', venue: 'Main Hall' },
  { id: 2, title: 'Robotics Challenge', desc: 'Design, build and race your autonomous bot', date: 'Jan 15', venue: 'Lab Block' },
  { id: 3, title: 'AI/ML Workshop', desc: 'Hands-on session on building AI models', date: 'Jan 14', venue: 'Seminar Hall' },
  { id: 4, title: 'Code Sprint', desc: 'Competitive programming for all skill levels', date: 'Jan 16', venue: 'CS Dept' },
  { id: 5, title: 'Paper Presentation', desc: 'Present your research to industry experts', date: 'Jan 15', venue: 'Auditorium' },
  { id: 6, title: 'Tech Quiz', desc: 'Test your tech knowledge across domains', date: 'Jan 16', venue: 'Amphitheatre' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page">
      <section className="hero">
        <h1>Welcome to <span>TechFest</span> 2026</h1>
        <p>Three days of innovation, competition, and inspiration — 14–16 January 2026</p>
        <div className="hero-btns">
          {user ? (
            <Link to="/feedback" className="btn btn-primary">Submit Feedback</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">Register Now</Link>
              <Link to="/gallery" className="btn btn-outline">View Gallery</Link>
            </>
          )}
        </div>
      </section>

      <h2 style={{ marginBottom: '1.5rem' }}>Featured Events</h2>
      <div className="events-grid">
        {events.map(e => (
          <div key={e.id} className="card event-card">
            <h3>{e.title}</h3>
            <p>{e.desc}</p>
            <div className="event-meta">
              <span>📅 {e.date}</span>
              <span>📍 {e.venue}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
