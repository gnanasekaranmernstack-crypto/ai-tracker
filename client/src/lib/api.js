import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (envUrl) {
    const normalizedUrl = envUrl.replace(/\/+$/, '');
    return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
  }

  return `http://${window.location.hostname}:5001/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
