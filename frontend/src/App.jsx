import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './index.css';

// Lazy-loaded pages for performance (code splitting)
const Home = lazy(() => import('./pages/Home'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const Feedback = lazy(() => import('./pages/Feedback'));

const Spinner = () => <div className="spinner" aria-label="Loading…" />;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div className="page" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <h2 style={{ fontSize: '3rem' }}>404</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '.5rem' }}>Page not found.</p>
    </div>
  );
}
