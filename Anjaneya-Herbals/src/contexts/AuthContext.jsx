// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi, userApi } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage (cache) to prevent flash
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorage = () => checkAuth(false);
    const handleAuthChange = (event) =>
      checkAuth(event?.detail?.force || false);

    // Set up listeners before the first auth check.
    window.addEventListener("storage", handleStorage);
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("sessionExpired", handleSessionExpired);

    checkAuth();

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("sessionExpired", handleSessionExpired);
    };
  }, []);

  const handleSessionExpired = () => {
    logout();
    toast.error("Session expired. Please login again.");
  };

  const syncAuthenticatedUser = async (fallbackUser = null) => {
    if (fallbackUser) {
      setUser(fallbackUser);
      localStorage.setItem("user", JSON.stringify(fallbackUser));
    }

    try {
      const profile = await userApi.getProfile();
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
      return profile;
    } catch (error) {
      if (!fallbackUser) {
        setUser(null);
        localStorage.removeItem("user");
      }
      return fallbackUser;
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async (force = false) => {
    const cachedUser = localStorage.getItem("user");
    if (!cachedUser && !force) {
      setUser(null);
      setLoading(false);
      return;
    }

    let parsedUser = null;
    try {
      parsedUser = cachedUser ? JSON.parse(cachedUser) : null;
    } catch {
      parsedUser = null;
    }

    if (parsedUser) {
      setUser(parsedUser);
    }

    await syncAuthenticatedUser(parsedUser);
  };

  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      await syncAuthenticatedUser(data?.user ?? null);
      window.dispatchEvent(new Event("authChange"));
      toast.success("Login successful!");
      return data;
    } catch (error) {
      toast.error(error.message || "Login failed");
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authApi.register(userData);
      await syncAuthenticatedUser(data?.user ?? null);
      window.dispatchEvent(new Event("authChange"));
      toast.success("Registration successful!");
      return data;
    } catch (error) {
      toast.error(error.message || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    // Optimistic UI update
    const cleanup = () => {
      setUser(null);
      localStorage.removeItem("user");
      navigate("/");
      toast.success("Logged out successfully");
    };

    authApi
      .logout()
      .then(cleanup)
      .catch((err) => {
        console.error("Logout API failed:", err);
        cleanup();
      });
  };

  const updateProfile = async (data) => {
    try {
      const updatedUser = await userApi.updateProfile(data);
      setUser(updatedUser);
      toast.success("Profile updated");
      return true;
    } catch (error) {
      toast.error(error.message || "Update failed");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
