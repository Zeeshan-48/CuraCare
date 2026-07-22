import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('curacare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle responses (automatic redirect on token expiration)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('curacare_user');
      localStorage.removeItem('curacare_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper to extract clean error message
export const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'An error occurred';
};

// Auth API Calls
export const loginApi = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (name, email, password) => {
  const response = await API.post('/auth/register', { name, email, password });
  return response.data;
};

export const googleLoginApi = async (token) => {
  const response = await API.post('/auth/google', { token });
  return response.data;
};

export const verifyOtpApi = async (email, otp) => {
  const response = await API.post('/auth/verify-otp', { email, otp });
  return response.data;
};

export const resendOtpApi = async (email) => {
  const response = await API.post('/auth/resend-otp', { email });
  return response.data;
};

export const forgotPasswordApi = async (email) => {
  const response = await API.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordApi = async (email, otp, newPassword) => {
  const response = await API.post('/auth/reset-password', { email, otp, newPassword });
  return response.data;
};

export const getProfileApi = async () => {
  const response = await API.get('/auth/profile');
  return response.data;
};

export const updateProfileApi = async (profileData) => {
  const response = await API.put('/auth/profile', profileData);
  return response.data;
};

// Categories API Calls
export const getCategoriesApi = async () => {
  const response = await API.get('/categories');
  return response.data;
};

export const createCategoryApi = async (categoryData) => {
  const response = await API.post('/categories', categoryData);
  return response.data;
};

export const deleteCategoryApi = async (id) => {
  const response = await API.delete(`/categories/${id}`);
  return response.data;
};

export const updateCategoryApi = async (id, categoryData) => {
  const response = await API.put(`/categories/${id}`, categoryData);
  return response.data;
};

// Products API Calls
export const getProductsApi = async (params = {}) => {
  const response = await API.get('/products', { params });
  return response.data;
};

export const getProductByIdApi = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

export const createProductApi = async (productData) => {
  const response = await API.post('/products', productData);
  return response.data;
};

export const updateProductApi = async (id, productData) => {
  const response = await API.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProductApi = async (id) => {
  const response = await API.delete(`/products/${id}`);
  return response.data;
};

export const getAiRecommendationsApi = async (symptomInput) => {
  const response = await API.post('/products/recommendations', { symptomInput });
  return response.data;
};

// Cart API Calls
export const getCartApi = async () => {
  const response = await API.get('/cart');
  return response.data;
};

export const updateCartApi = async (items) => {
  const response = await API.put('/cart', { items });
  return response.data;
};

// Orders API Calls
export const createOrderApi = async (orderData) => {
  const response = await API.post('/orders', orderData);
  return response.data;
};

export const getMyOrdersApi = async () => {
  const response = await API.get('/orders/my-orders');
  return response.data;
};

export const getOrderByIdApi = async (id) => {
  const response = await API.get(`/orders/${id}`);
  return response.data;
};

export const getAllOrdersApi = async () => {
  const response = await API.get('/orders');
  return response.data;
};

export const updateOrderStatusApi = async (id, orderStatus, paymentStatus) => {
  const response = await API.put(`/orders/${id}/status`, { orderStatus, paymentStatus });
  return response.data;
};

export const updateOrderPrescriptionStatusApi = async (id, prescriptionStatus) => {
  const response = await API.put(`/orders/${id}/prescription`, { prescriptionStatus });
  return response.data;
};

// Reviews API Calls
export const createReviewApi = async (productId, rating, comment) => {
  const response = await API.post('/reviews', { productId, rating, comment });
  return response.data;
};

export const getProductReviewsApi = async (productId) => {
  const response = await API.get(`/reviews/product/${productId}`);
  return response.data;
};

export const updateReviewStatusApi = async (id, status) => {
  const response = await API.put(`/reviews/${id}/status`, { status });
  return response.data;
};

export const uploadImageApi = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Razorpay API Calls
export const createRazorpayOrderApi = async (amount) => {
  const response = await API.post('/payments/razorpay-order', { amount });
  return response.data;
};

export const verifySignatureApi = async (paymentDetails) => {
  const response = await API.post('/payments/verify-signature', paymentDetails);
  return response.data;
};

// Customer Messages API Calls
export const submitMessageApi = async (messageData) => {
  const response = await API.post('/messages', messageData);
  return response.data;
};

export const getMessagesApi = async () => {
  const response = await API.get('/messages');
  return response.data;
};

// Banners API Calls
export const getBannersApi = async () => {
  const response = await API.get('/banners');
  return response.data;
};

// Testimonials API Calls
export const getTestimonialsApi = async () => {
  const response = await API.get('/testimonials');
  return response.data;
};

// Health Tips API Calls
export const getHealthTipsApi = async () => {
  const response = await API.get('/health-tips');
  return response.data;
};

export default API;

