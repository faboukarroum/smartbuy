import axios from 'axios';

const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : 'https://smartbuyserver1.vercel.app/api');

// Product API
export const getProducts = (params = {}) => {
  const { keyword = '', category = 'All', pageNumber = 1, pageSize = 20, sortBy = 'newest' } = params;
  return axios.get(`${BASE}/products`, {
    params: { keyword, category, pageNumber, pageSize, sortBy }
  });
};

export const getProductById = (id) => axios.get(`${BASE}/products/${id}`);

export const createProduct = (data) => {
  const config = getAuthConfig();
  return axios.post(`${BASE}/products`, data, config);
};

export const updateProduct = (id, data) => {
  const config = getAuthConfig();
  return axios.put(`${BASE}/products/${id}`, data, config);
};

export const deleteProduct = (id) => {
  const config = getAuthConfig();
  return axios.delete(`${BASE}/products/${id}`, config);
};

export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const config = {
    ...getAuthConfig(),
    headers: {
      ...getAuthConfig().headers,
      'Content-Type': 'multipart/form-data',
    },
  };

  return axios.post(`${BASE}/uploads/product-image`, formData, config);
};

// Order API
export const getOrders = () => {
  const config = getAuthConfig();
  return axios.get(`${BASE}/orders`, config);
};

export const updateOrderToDelivered = (id) => {
  const config = getAuthConfig();
  return axios.put(`${BASE}/orders/${id}/deliver`, {}, config);
};

// User API
export const loginUser = (email, password) => {
  return axios.post(`${BASE}/users/login`, { email, password });
};

export const registerUser = (name, email, password) => {
  return axios.post(`${BASE}/users`, { name, email, password });
};

export const getUsers = () => {
  const config = getAuthConfig();
  return axios.get(`${BASE}/users`, config);
};

// Helper for auth headers
const getAuthConfig = () => {
  const authData = JSON.parse(localStorage.getItem('fikilshi-auth') || localStorage.getItem('smartbuy-auth'));
  const token = authData?.state?.user?.token;
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};
