import React, { useState, useEffect } from 'react';
import api from '../api';

// Static fallback images if backend not connected
const FALLBACK = [
  { _id: '1', title: 'Hackathon 2026', imageUrl: 'https://picsum.photos/seed/hack/400/300', category: 'Events' },
  { _id: '2', title: 'Robotics Workshop', imageUrl: 'https://picsum.photos/seed/robot/400/300', category: 'Workshop' },
  { _id: '3', title: 'AI Talk', imageUrl: 'https://picsum.photos/seed/ai/400/300', category: 'Talk' },
  { _id: '4', title: 'Closing Ceremony', imageUrl: 'https://picsum.photos/seed/close/400/300', category: 'Events' },
  { _id: '5', title: 'Code Sprint', imageUrl: 'https://picsum.photos/seed/code/400/300', category: 'Competition' },
  { _id: '6', title: 'Web Dev Bootcamp', imageUrl: 'https://picsum.photos/seed/web/400/300', category: 'Workshop' },
];

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/gallery')
      .then(r => setItems(r.data.length ? r.data : FALLBACK))
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];
  const filtered = filter === 'All' ? items : items.filter(i => i.category === filter);

  return (
    <div className="page">
      <h2 style={{ marginBottom: '1.5rem' }}>Event Gallery</h2>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {categories.map(c => (
          <button
            key={c}
            className={`btn ${filter === c ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '.3rem .9rem', fontSize: '.85rem' }}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="gallery-grid">
          {filtered.map(item => (
            <div key={item._id} className="gallery-item">
              {/* alt text for accessibility + Lighthouse score */}
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"           /* native lazy loading — performance optimisation */
                width="400"
                height="300"
              />
              <div className="gallery-caption">{item.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

