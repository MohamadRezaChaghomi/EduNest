'use client';
import { createContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const res = await api.auth.me();
        if (mounted) setUser(res.user);
      } catch (err) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();

    return () => { mounted = false; };
  }, []);

  const login = async (identifier, password, rememberMe) => {
    const res = await api.auth.login({ identifier, password, rememberMe });
    await fetchUser();
    return res;
  };

  const register = async (data) => {
    const res = await api.auth.register(data);
    await fetchUser();
    return res;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const logoutAll = async () => {
    await api.auth.logoutAll();
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.auth.updateProfile(data);
    await fetchUser();
    return res;
  };

  const changePassword = async (data) => {
    return await api.auth.changePassword(data);
  };

  const requestOtp = async (phone) => {
    return await api.auth.requestOtp(phone);
  };

  const verifyOtp = async (phone, code, rememberMe) => {
    const res = await api.auth.verifyOtp(phone, code, rememberMe);
    await fetchUser();
    return res;
  };

  // Helper to refresh user data after actions
  const fetchUser = async () => {
    try {
      const res = await api.auth.me();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
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
        logoutAll,
        updateProfile,
        changePassword,
        requestOtp,
        verifyOtp,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}