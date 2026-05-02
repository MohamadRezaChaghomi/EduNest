'use client';
import { createContext, useEffect, useState } from 'react';
import { api, setToken, removeToken } from '@/lib/api';
import { toast } from 'sonner';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // فقط برای بار اول که صفحه لود می‌شود
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const res = await api.auth.me();
        if (isMounted) setUser(res.user);
      } catch (error) {
        if (error.status !== 401 && isMounted) {
          console.error('Failed to fetch user:', error);
        }
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUser();
    return () => { isMounted = false; };
  }, []);

  const login = async (identifier, password, rememberMe = false) => {
    const res = await api.auth.login({ identifier, password, rememberMe });
    if (res.token) setToken(res.token);
    // مستقیماً از پاسخ سرور user را بگیر
    if (res.user) setUser(res.user);
    else {
      // fallback (در صورت نبودن user در پاسخ)
      const userRes = await api.auth.me();
      setUser(userRes.user);
    }
    return res;
  };

  const register = async (data) => {
    const res = await api.auth.register(data);
    if (res.token) setToken(res.token);
    // مستقیماً از پاسخ سرور user را بگیر
    if (res.user) setUser(res.user);
    else {
      const userRes = await api.auth.me();
      setUser(userRes.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      // ignore
    } finally {
      removeToken();
      setUser(null);
    }
  };

  const logoutAll = async () => {
    await api.auth.logoutAll();
    removeToken();
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.auth.updateProfile(data);
    const userRes = await api.auth.me();
    setUser(userRes.user);
    toast.success('Profile updated successfully');
    return res;
  };

  const changePassword = async (data) => {
    const res = await api.auth.changePassword(data);
    toast.success('Password changed successfully');
    return res;
  };

  const requestOtp = async (phone) => {
    return await api.auth.requestOtp(phone);
  };

  const verifyOtp = async (phone, code, rememberMe) => {
    const res = await api.auth.verifyOtp(phone, code, rememberMe);
    if (res.token) setToken(res.token);
    if (res.user) setUser(res.user);
    else {
      const userRes = await api.auth.me();
      setUser(userRes.user);
    }
    return res;
  };

  const value = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}