import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, isDemoModeActive, setDemoModeActive } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [completion, setCompletion] = useState(null);
  const [isDemo, setIsDemo] = useState(isDemoModeActive());
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshIdentity = useCallback(async (demoOverride) => {
    try {
      setLoading(true);
      const useDemo = demoOverride !== undefined ? demoOverride : isDemoModeActive();
      const res = await api.get('/api/auth/me', { demoOverride: useDemo });
      setUser(res.data.user);
      setProfile(res.data.profile);
      setSkills(res.data.skills || []);
      setCompletion(res.data.completion || null);
      setIsDemo(Boolean(res.data.user?.isDemo));
      return res.data;
    } catch {
      setUser(null);
      setProfile(null);
      setSkills([]);
      setCompletion(null);
      setIsDemo(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshIdentity();
  }, [refreshIdentity]);

  const enterDemoMode = useCallback(async () => {
    setDemoModeActive(true);
    setIsDemo(true);
    const data = await refreshIdentity(true);
    addToast('Entered isolated Demo Mode (Sample Student Profile).', 'success');
    return data;
  }, [refreshIdentity, addToast]);

  const resetDemoData = useCallback(async () => {
    await api.post('/api/auth/demo-reset', {}, { demoOverride: true });
    const data = await refreshIdentity(true);
    addToast('Demo data reset to its original sample state.', 'success');
    return data;
  }, [refreshIdentity, addToast]);

  const exitDemoMode = useCallback(async () => {
    setDemoModeActive(false);
    setIsDemo(false);
    setUser(null);
    setProfile(null);
    setSkills([]);
    setCompletion(null);
  }, []);

  const login = useCallback(async (email, password) => {
    setDemoModeActive(false);
    const res = await api.post('/api/auth/login', { email, password }, { demoOverride: false });
    await refreshIdentity(false);
    addToast('Welcome back!', 'success');
    return res.data;
  }, [refreshIdentity, addToast]);

  const register = useCallback(async (payload) => {
    setDemoModeActive(false);
    const res = await api.post('/api/auth/register', payload, { demoOverride: false });
    await refreshIdentity(false);
    addToast('Account created! Let’s set up your career profile.', 'success');
    return res.data;
  }, [refreshIdentity, addToast]);

  const logout = useCallback(async () => {
    const wasDemo = isDemo;
    setDemoModeActive(false);
    try {
      if (!wasDemo) {
        await api.post('/api/auth/logout', {}, { demoOverride: false });
      }
    } catch {
      // Ignore logout network error
    }
    setUser(null);
    setProfile(null);
    setSkills([]);
    setCompletion(null);
    setIsDemo(false);
    addToast(wasDemo ? 'Exited Demo Mode.' : 'Signed out successfully.', 'success');
  }, [isDemo, addToast]);

  const value = {
    user,
    profile,
    skills,
    completion,
    isDemo,
    loading,
    refreshIdentity,
    enterDemoMode,
    resetDemoData,
    exitDemoMode,
    login,
    register,
    logout,
    toasts,
    addToast,
    removeToast
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
