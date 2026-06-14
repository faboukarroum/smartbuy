import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : 'https://smartbuyserver1.vercel.app/api');

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getStoredAuthData = () => {
  const rawAuth = localStorage.getItem('fikilshi-auth') || localStorage.getItem('smartbuy-auth');

  if (!rawAuth) {
    return null;
  }

  try {
    return JSON.parse(rawAuth);
  } catch {
    return null;
  }
};

export const getAuthConfig = () => {
  const authData = getStoredAuthData();
  const token = authData?.state?.user?.token;

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};
