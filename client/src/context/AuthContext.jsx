import { createContext, useState, useEffect } from 'react';
import api from '../lib/api';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  const updateNotificationEmail = async (notificationEmail) => {
    const { data } = await api.put('/auth/notification-email', { notificationEmail });
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateNotificationEmail, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
