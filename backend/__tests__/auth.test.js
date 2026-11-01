/**
 * Auth API Tests
 * Run: npm test
 *
 * These tests verify the /api/auth endpoints work correctly
 * and that security measures (validation, injection sanitisation) are in place.
 *
 * NOTE: Tests run without a real DB — they test the HTTP layer only.
 *       Mongoose calls are intercepted by the in-memory mock below.
 */

process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = ''; // skip real DB

const request = require('supertest');
const { app } = require('../server');

// ── Mock mongoose so tests don't need Atlas ──────────────────────────────────
jest.mock('../models/User', () => {
  const bcrypt = require('bcryptjs');
  const users = [];

  return {
    findOne: jest.fn((query) => {
      const email = typeof query.email === 'string' ? query.email : null;
      const u = email ? users.find((x) => x.email === email) : null;
      // Simulate .select('+password') chaining — just return the promise
      const result = u
        ? { ...u, correctPassword: async (pwd) => bcrypt.compare(pwd, u.password) }
        : null;
      const promise = Promise.resolve(result);
      promise.select = () => Promise.resolve(result);
      return promise;
    }),
    create: jest.fn(async (data) => {
      const hashed = await bcrypt.hash(data.password, 1);
      const user = { _id: 'mock-id-123', role: 'user', ...data, password: hashed };
      users.push(user);
      return user;
    }),
  };
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('should register a new user and return 201', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test',
      password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('should return 400 when password is too short', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'short@example.com',
      password: '123',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('should return 400 for invalid email format', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(res.status).toBe(400);
  });

  it('should return 401 for wrong credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });
});

describe('Security: NoSQL Injection Prevention', () => {
  it('should sanitise $gt operator in login body (injection attempt)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: { $gt: '' },       // classic NoSQL injection attempt
      password: 'anything',
    });
    // express-mongo-sanitize strips $ keys → validation catches invalid email
    expect([400, 401]).toContain(res.status);
    // Must NOT return 200
    expect(res.status).not.toBe(200);
  });
});

describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

describe('POST /api/feedback', () => {
  it('should return 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/feedback').send({ name: 'Only Name' });
    expect(res.status).toBe(400);
  });
});
