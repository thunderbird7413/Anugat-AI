import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Corrected import

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [authToken, setAuthToken] = useState(() => 
    localStorage.getItem('authToken') || null
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authToken) {
      try {
        const decoded = jwtDecode(authToken); // Correct function usage
        setUser(decoded);
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false);
  }, [authToken]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
      const token = response.data.token;
      localStorage.setItem('authToken', token);
      setAuthToken(token);
      navigate('/');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (email, password, institution) => {
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, { email, password, institution });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
    navigate('/login');
  };

  const value = {
    authToken,
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Export the context itself if needed
export default AuthContext;