import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user info
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  // Add axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry the original request
            const originalRequest = error.config;
            originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Verify token by making a request to get current user info
        const response = await axios.get('http://localhost:8000/api/auth/me/');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

 // Dans la fonction login, modifiez la partie qui gère la réponse de connexion
const login = async (username, password) => {
  try {
    const response = await axios.post('http://localhost:8000/api/auth/login/', {
      username,
      password,
    });

    const { access, refresh, user } = response.data;
    
    // Stockez les tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Stockez les informations de l'utilisateur
    localStorage.setItem('user', JSON.stringify(user));
    
    // Configurez l'en-tête d'autorisation pour toutes les requêtes suivantes
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    // Mettez à jour l'état de l'utilisateur
    setUser(user);
    
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Échec de la connexion' 
    };
  }
};

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', userData);
      const { access, refresh, user: newUser } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser(newUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        logout();
        return false;
      }

      const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
        refresh,
      });

      const { access } = response.data;
      localStorage.setItem('access_token', access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    refreshToken,
    loading,
    userRole: user?.role,
    userId: user?.id,
    userSiteId: user?.site_id, // Assuming site_id is stored in user data
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};