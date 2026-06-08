import axios from 'axios';
import toast from 'react-hot-toast';
import { storageGet, storageRemove } from '../utils/storage';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
export const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // localStorage không khả dụng (ví dụ: ngăn chặn theo dõi) - tiếp tục mà không có token
  }
  return config;
});

// Tự động đăng xuất khi nhận được 401/403 (token hết hạn hoặc không hợp lệ)
let isRedirecting = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !isRedirecting) {
      const token = storageGet('token');
      // Chỉ tự động đăng xuất nếu chúng ta có token (tức là phiên đã hết hạn, không phải là không có quyền truy cập trang)
      if (token) {
        isRedirecting = true;
        storageRemove('token');
        storageRemove('user');
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setTimeout(() => {
          window.location.href = '/login';
          isRedirecting = false;
        }, 500);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
