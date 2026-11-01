const express = require('express');
const Gallery = require('../models/Gallery');

const router = express.Router();

// GET /api/gallery
router.get('/', async (req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Seed some default items if empty (for demo)
router.post('/seed', async (req, res) => {
  try {
    const count = await Gallery.countDocuments();
    if (count > 0) return res.json({ message: 'Already seeded' });

    const items = [
      { title: 'Hackathon 2026', imageUrl: 'https://picsum.photos/seed/hack/400/300', category: 'Events' },
      { title: 'Robotics Workshop', imageUrl: 'https://picsum.photos/seed/robot/400/300', category: 'Workshop' },
      { title: 'AI Talk', imageUrl: 'https://picsum.photos/seed/ai/400/300', category: 'Talk' },
      { title: 'Closing Ceremony', imageUrl: 'https://picsum.photos/seed/close/400/300', category: 'Events' },
      { title: 'Code Sprint', imageUrl: 'https://picsum.photos/seed/code/400/300', category: 'Competition' },
      { title: 'Web Dev Bootcamp', imageUrl: 'https://picsum.photos/seed/web/400/300', category: 'Workshop' },
    ];
    await Gallery.insertMany(items);
    res.json({ message: 'Seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
