// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi, userApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage (cache) to prevent flash
  const [user, setUser] = useState(() => {
    try {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    } catch {
        return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    // Listen for storage events (e.g. login in another tab)
    window.addEventListener('storage', checkAuth);
    // Listen for custom auth events (e.g. from OAuth redirect)
    window.addEventListener('authChange', checkAuth);
    // Listen for session expiry from api.js
    window.addEventListener('sessionExpired', handleSessionExpired);
    
    return () => {
        window.removeEventListener('storage', checkAuth);
        window.removeEventListener('authChange', checkAuth);
        window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, []);

  const handleSessionExpired = () => {
      logout();
      toast.error('Session expired. Please login again.');
  };

  const checkAuth = async () => {
    // Only hit the server if we have a cached user — no point pinging /users/me
    // for anonymous visitors (it would trigger an OAuth redirect on the backend).
    const cachedUser = localStorage.getItem('user');
    if (!cachedUser) {
        setLoading(false);
        return;
    }
    try {
        // Re-validate the session cookie is still alive
        const userData = await userApi.getProfile();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
        // Cookie expired or invalid — clear stale cache
        setUser(null);
        localStorage.removeItem('user');
    } finally {
        setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      // setUser(data.user) is implicitly handled by api.js caching and potential checkAuth?
      // But explicit set is faster UI update
      setUser(data.user);
      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authApi.register(userData);
      setUser(data.user);
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    // Optimistic UI update
    const cleanup = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/');
        toast.success('Logged out successfully');
    };

    authApi.logout()
        .then(cleanup)
        .catch((err) => {
            console.error('Logout API failed:', err);
            cleanup();
        });
  };

  const updateProfile = async (data) => {
      try {
          const updatedUser = await userApi.updateProfile(data);
          setUser(updatedUser);
          toast.success('Profile updated');
          return true;
      } catch (error) {
          toast.error(error.message || 'Update failed');
          return false;
      }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};