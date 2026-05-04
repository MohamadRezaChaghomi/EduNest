// hooks/useAxios.js
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = refreshResponse.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export function useAxios() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const request = async (config) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance(config);
      if (isMounted.current) return response.data;
      return null;
    } catch (err) {
      if (isMounted.current) setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const get = (url, params) => request({ method: 'GET', url, params });
  const post = (url, data) => request({ method: 'POST', url, data });
  const put = (url, data) => request({ method: 'PUT', url, data });
  const del = (url) => request({ method: 'DELETE', url });

  return { loading, error, request, get, post, put, delete: del };
}