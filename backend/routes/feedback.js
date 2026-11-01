const express = require('express');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');

const router = express.Router();

const feedbackRules = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message too long'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
];

// POST /api/feedback
router.post('/', feedbackRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const fb = await Feedback.create(req.body);
    res.status(201).json({ message: 'Feedback submitted successfully', id: fb._id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/feedback (admin use — no auth for demo simplicity)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(50);
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
