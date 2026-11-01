import React, { useState } from 'react';
import api from '../api';

export default function Feedback() {
  const [form, setForm] = useState({ name: '', email: '', message: '', rating: '' });
  const [status, setStatus] = useState('');   // 'success' | 'error'
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

  return (
    <div className="feedback-wrapper">
      <div className="card feedback-card">
        <h2 style={{ marginBottom: '1.5rem' }}>Share Your Feedback</h2>
        {status === 'success' ? (
          <div className="success-msg" style={{ fontSize: '1rem', padding: '1rem' }}>
            ✅ Thank you for your feedback! We appreciate it.
          </div>
        ) : (
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
              {/*
                XSS Prevention:
                React renders this with textContent (not innerHTML) — any
                <script>alert('xss')</script> typed here is displayed as PLAIN TEXT,
                never executed. dangerouslySetInnerHTML is never used.
              */}
              <textarea id="fb-message" name="message" rows={5} required maxLength={1000}
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
        )}
      </div>
    </div>
  );
}

