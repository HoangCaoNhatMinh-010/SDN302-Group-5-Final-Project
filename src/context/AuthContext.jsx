import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);
const TOKEN_KEY = 'medcare_auth_token';
const LEGACY_STORAGE_KEY = 'medcare_auth_state';
const hasStoredToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return Boolean(token && token !== 'undefined' && token !== 'null');
  } catch {
    return false;
  }
};

const unauthenticatedState = {
  isAuthenticated: false,
  role: null,
  currentUser: null,
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(unauthenticatedState);
  const [isLoading, setIsLoading] = useState(hasStoredToken);

  useEffect(() => {
    let active = true;
    let token;
    try {
      token = localStorage.getItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.error('Không thể đọc phiên đăng nhập đã lưu:', error);
      return () => {
        active = false;
      };
    }

    if (!token || token === 'undefined' || token === 'null') {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch (error) {
        console.error('Không thể xóa token đăng nhập không hợp lệ:', error);
      }
      return () => {
        active = false;
      };
    }

    apiClient.get('/auth/me')
      .then((response) => {
        if (!active || !response.data) return;
        setAuthState({
          isAuthenticated: true,
          role: response.data.role,
          currentUser: response.data,
        });
      })
      .catch((error) => {
        console.error('Phiên đăng nhập không hợp lệ hoặc API không truy cập được:', error);
        localStorage.removeItem(TOKEN_KEY);
        if (active) setAuthState(unauthenticatedState);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = (user) => {
    if (!user?.id || !user?.role) {
      throw new Error('Phản hồi đăng nhập thiếu thông tin tài khoản hợp lệ.');
    }
    setAuthState({
      isAuthenticated: true,
      role: user.role,
      currentUser: user,
    });
    return user;
  };

  const updateCurrentUser = (updatedFields) => {
    setAuthState((previous) => ({
      ...previous,
      currentUser: previous.currentUser
        ? { ...previous.currentUser, ...updatedFields }
        : null,
    }));
  };

  const logout = () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.error('Không thể xóa phiên đăng nhập đã lưu:', error);
    }
    setAuthState(unauthenticatedState);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isLoading,
        login,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
