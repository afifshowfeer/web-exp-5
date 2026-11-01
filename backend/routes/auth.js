const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// ── Validation rules ─────────────────────────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('college').optional().trim().escape(),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Helper: sign JWT and set httpOnly cookie ──────────────────────────────────
const sendToken = (res, user) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,                          // JS cannot read this cookie → blocks XSS theft
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',                      // blocks CSRF — cookie not sent on cross-site requests
    maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days
  });

  return token;
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', registerRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password, college } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password, college });
    const token = sendToken(res, user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', loginRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;

    // select: false on password — must explicitly include it here
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = sendToken(res, user);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
