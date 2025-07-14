import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Health check
export const testConnection = () => api.get('/health');

// Sales Orders
export const getSalesOrders = (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  return api.get(`/sales-orders?${queryParams.toString()}`);
};

export const getSalesOrderById = (id) => api.get(`/sales-orders/${id}`);

export const createSalesOrder = (data) => api.post('/sales-orders', data);

export const updateSalesOrder = (id, data) => api.put(`/sales-orders/${id}`, data);

export const deleteSalesOrder = (id) => api.delete(`/sales-orders/${id}`);

export const getSalesOrderStats = () => api.get('/sales-orders/stats');

export const testBusinessCentralConnection = () => api.get('/sales-orders/bc-test');

// Products
export const getProducts = (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  return api.get(`/products?${queryParams.toString()}`);
};

export const getProductById = (id) => api.get(`/products/${id}`);

export const searchProducts = (term) => api.get(`/products/search/${term}`);

// Customers
export const getCustomers = (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  return api.get(`/customers?${queryParams.toString()}`);
};

export const getCustomerById = (id) => api.get(`/customers/${id}`);

export const searchCustomers = (term) => api.get(`/customers/search/${term}`);

export default api; 