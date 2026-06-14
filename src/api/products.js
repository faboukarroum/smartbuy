import axios from 'axios';
import { API_BASE_URL, getAuthConfig } from './client';

// Product API
export const getProducts = (params = {}) => {
  const { keyword = '', category = 'All', pageNumber = 1, pageSize = 20, sortBy = 'newest' } = params;
  return axios.get(`${API_BASE_URL}/products`, {
    params: { keyword, category, pageNumber, pageSize, sortBy }
  });
};

export const getProductById = (id) => axios.get(`${API_BASE_URL}/products/${id}`);

export const createProduct = (data) => {
  const config = getAuthConfig();
  return axios.post(`${API_BASE_URL}/products`, data, config);
};

export const updateProduct = (id, data) => {
  const config = getAuthConfig();
  return axios.put(`${API_BASE_URL}/products/${id}`, data, config);
};

export const deleteProduct = (id) => {
  const config = getAuthConfig();
  return axios.delete(`${API_BASE_URL}/products/${id}`, config);
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

  return axios.post(`${API_BASE_URL}/uploads/product-image`, formData, config);
};

// Order API
export const createOrder = (data) => {
  const config = getAuthConfig();
  return axios.post(`${API_BASE_URL}/orders`, data, config);
};

export const getOrders = () => {
  const config = getAuthConfig();
  return axios.get(`${API_BASE_URL}/orders`, config);
};

export const getMyOrders = () => {
  const config = getAuthConfig();
  return axios.get(`${API_BASE_URL}/orders/myorders`, config);
};

export const updateOrderToDelivered = (id) => {
  const config = getAuthConfig();
  return axios.put(`${API_BASE_URL}/orders/${id}/deliver`, {}, config);
};

export const updateOrderToPaid = (id) => {
  const config = getAuthConfig();
  return axios.put(
    `${API_BASE_URL}/orders/${id}/pay`,
    {
      id: `cod-${id}`,
      status: 'COD_COLLECTED',
      update_time: new Date().toISOString(),
      email_address: '',
    },
    config
  );
};

// User API
export const loginUser = (email, password) => {
  return axios.post(`${API_BASE_URL}/users/login`, { email, password });
};

export const loginWithGoogle = (credential) => {
  return axios.post(`${API_BASE_URL}/users/google`, { credential });
};

export const registerUser = (name, email, password) => {
  return axios.post(`${API_BASE_URL}/users`, { name, email, password });
};

export const requestPasswordReset = (email) => {
  return axios.post(`${API_BASE_URL}/users/forgot-password`, { email });
};

export const resetPassword = (token, password) => {
  return axios.put(`${API_BASE_URL}/users/reset-password/${token}`, { password });
};

export const getUsers = () => {
  const config = getAuthConfig();
  return axios.get(`${API_BASE_URL}/users`, config);
};

export const getUserProfile = () => {
  const config = getAuthConfig();
  return axios.get(`${API_BASE_URL}/users/profile`, config);
};

export const updateUserProfile = (data) => {
  const config = getAuthConfig();
  return axios.put(`${API_BASE_URL}/users/profile`, data, config);
};

export const updateUser = (id, data) => {
  const config = getAuthConfig();
  return axios.put(`${API_BASE_URL}/users/${id}`, data, config);
};

export const deleteUser = (id) => {
  const config = getAuthConfig();
  return axios.delete(`${API_BASE_URL}/users/${id}`, config);
};

// Settings API
export const getSettings = () => {
  return axios.get(`${API_BASE_URL}/settings`);
};

export const updateSettings = (data) => {
  const config = getAuthConfig();
  return axios.put(`${API_BASE_URL}/settings`, data, config);
};
