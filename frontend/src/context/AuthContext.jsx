import React, { createContext, useState, useContext, useEffect } from 'react'; 
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize state by trying to get the token from localStorage
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const [user, setUser] = useState(null); 

  // This effect runs whenever the token changes, or on initial load
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        localStorage.setItem('authToken', token);
        if (userRole) localStorage.setItem('userRole', userRole);

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await apiClient.get('/users/me');
          setUser(response.data);
        } catch (error) {
          console.error("Invalid token, logging out", error);
          logout();
        }
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        delete apiClient.defaults.headers.common['Authorization'];
        setUser(null);
        setUserRole(null);
      }
    };
    fetchUser();
  }, [token]);


  const _performLogin = async (endpoint, email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await apiClient.post(endpoint, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    const { access_token, user_role } = response.data;
    setUserRole(user_role);
    setToken(access_token);
    return user_role;
  };

  const userLogin = async (email, password) => {
    return await _performLogin('/auth/login/user', email, password);
  };
  
  const coachLogin = async (email, password) => {
    return await _performLogin('/auth/login/coach', email, password);
  };

  const logout = () => {
    // Setting the token to null will trigger the useEffect to clear everything
    setToken(null);
  };

  const value = {
    token,
    user,
    userRole, 
    userLogin,
    coachLogin,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};