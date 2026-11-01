import React, { useState, useEffect } from 'react';
import api from '../api';

// ── Star renderer ────────────────────────────────────────────────────────────
const Stars = ({ rating }) => {
  if (!rating) return null;
  return (
    <span style={{ color: '#f5c518', fontSize: '1rem' }} aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
};

// ── Single feedback card ─────────────────────────────────────────────────────
const FeedbackCard = ({ fb }) => (
  <div className="card" style={{ marginBottom: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.4rem' }}>
      <div>
        <strong>{fb.name}</strong>
        <span style={{ color: 'var(--text-muted)', fontSize: '.8rem', marginLeft: '.6rem' }}>
          {fb.email}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.2rem' }}>
        <Stars rating={fb.rating} />
        <span style={{ color: 'var(--text-muted)', fontSize: '.75rem' }}>
          {new Date(fb.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </span>
      </div>
    </div>
    {/* XSS-safe: React renders this as text, never HTML */}
    <p style={{ color: 'var(--text)', marginTop: '.3rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
      {fb.message}
    </p>
  </div>
);

// ── Feedback submit form ─────────────────────────────────────────────────────
const FeedbackForm = ({ onSubmitted }) => {
  const [form, setForm] = useState({ name: '', email: '', message: '', rating: '' });
  const [status, setStatus] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus(''); setErrMsg('');
    setLoading(true);
    try {
      await api.post('/api/feedback', form);
      setStatus('success');
      setForm({ name: '', email: '', message: '', rating: '' });
      onSubmitted(); // refresh list
    } catch (err) {
      setStatus('error');
      setErrMsg(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.error ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="success-msg" style={{ fontSize: '1rem', padding: '1rem', textAlign: 'center' }}>
        ✅ Thank you for your feedback!{' '}
        <button
          onClick={() => setStatus('')}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="fb-name">Your Name</label>
        <input id="fb-name" name="name" type="text" required
          value={form.name} onChange={handleChange} placeholder="John Doe" />
      </div>
      <div className="form-group">
        <label htmlFor="fb-email">Email</label>
        <input id="fb-email" name="email" type="email" required
          value={form.email} onChange={handleChange} placeholder="you@example.com" />
      </div>
      <div className="form-group">
        <label htmlFor="fb-message">Message</label>
        <textarea id="fb-message" name="message" rows={4} required maxLength={1000}
          value={form.message} onChange={handleChange}
          placeholder="Share your experience at TechFest 2026…" />
      </div>
      <div className="form-group">
        <label htmlFor="fb-rating">Rating</label>
        <select id="fb-rating" name="rating" value={form.rating} onChange={handleChange}>
          <option value="">Select rating</option>
          <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
          <option value="4">⭐⭐⭐⭐ Good</option>
          <option value="3">⭐⭐⭐ Average</option>
          <option value="2">⭐⭐ Poor</option>
          <option value="1">⭐ Very Poor</option>
        </select>
      </div>
      {status === 'error' && <p className="error-msg">{errMsg}</p>}
      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Submitting…' : 'Submit Feedback'}
      </button>
    </form>
  );
};

// ── Main Feedback page ────────────────────────────────────────────────────────
export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [fbLoading, setFbLoading] = useState(true);
  const [fbError, setFbError] = useState('');

  const fetchFeedbacks = async () => {
    setFbLoading(true);
    setFbError('');
    try {
      const { data } = await api.get('/api/feedback');
      setFeedbacks(data);
    } catch {
      setFbError('Could not load feedbacks — backend may not be connected yet.');
    } finally {
      setFbLoading(false);
    }
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  return (
    <div className="page" style={{ maxWidth: '680px', margin: '0 auto' }}>

      {/* ── Submit form ── */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Share Your Feedback</h2>
        <FeedbackForm onSubmitted={fetchFeedbacks} />
      </div>

      {/* ── Past feedbacks ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Past Feedbacks</h2>
          {feedbacks.length > 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>
              {feedbacks.length} response{feedbacks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {fbLoading ? (
          <div className="spinner" />
        ) : fbError ? (
          <div className="card" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            ⚠️ {fbError}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="card" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            No feedbacks yet — be the first to share! 🎉
          </div>
        ) : (
          feedbacks.map(fb => <FeedbackCard key={fb._id} fb={fb} />)
        )}
      </div>
    </div>
  );
}
