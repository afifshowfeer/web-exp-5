import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tf_user')) || null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    setUser(data.user);
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (form) => {
    const { data } = await api.post('/api/auth/register', form);
    setUser(data.user);
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    return data;
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
    localStorage.removeItem('tf_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
