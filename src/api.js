import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.merdannotfound.ru',
  timeout: 10000,  // 10 сек таймаут
});

// Interceptor для токена (для защищённых запросов)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;