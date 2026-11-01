# ⚡ TechFest 2026 Portal

A full-stack MERN application for the TechFest 2026 event portal.

## Architecture

```
React (Vercel) → Express API (Render) → MongoDB Atlas
```

## Pages
- **Home** – Event listings and hero section  
- **Gallery** – Lazy-loaded image gallery with category filters  
- **Register / Login** – Secure JWT authentication  
- **Feedback** – Validated feedback form  

## Security Implemented
| Threat | Fix |
|--------|-----|
| NoSQL Injection | `express-mongo-sanitize` strips `$` operators |
| XSS | Helmet CSP headers + React's default text escaping |
| CSRF | `SameSite=Strict` + `HttpOnly` cookies |
| Brute Force | `express-rate-limit` on `/api/auth` |
| Header attacks | `helmet` sets 11 security headers |
| Input injection | `express-validator` validates & sanitises all inputs |

## Local Setup

```bash
# Backend
cd backend
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev            # runs on :5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev            # runs on :5173
```

## Live URLs
| Service | URL |
|---------|-----|
| Frontend | https://techfest-2026.vercel.app |
| Backend API | https://techfest-2026-api.onrender.com |
| Database | MongoDB Atlas |
