import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="logo">⚡ TechFest 2026</Link>
      <nav>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/gallery">Gallery</NavLink>
        <NavLink to="/feedback">Feedback</NavLink>
        {user ? (
          <>
            <span style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>
              Hi, {user.name.split(' ')[0]}
            </span>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

