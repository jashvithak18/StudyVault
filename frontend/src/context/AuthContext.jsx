import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
      } catch (err) {
        localStorage.removeItem('token');
        setError(err.response?.data?.message || 'Session expired');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';
      const response = await axios.post(`${API_BASE_URL}/auth/users`, { 
        firstName, 
        lastName, 
        email, 
        password,
        role: "STUDENT",
        profileImageUrl: ""
      });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
