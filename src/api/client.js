import axios from 'axios';
import useAuthStore from '../store/authStore';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : 'https://smartbuyserver1.vercel.app/api');

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
});

const getAuthorizationHeader = (headers = {}) =>
  headers.Authorization || headers.authorization || (typeof headers.get === 'function' ? headers.get('Authorization') : undefined);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && getAuthorizationHeader(error.config?.headers)) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  },
);

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
