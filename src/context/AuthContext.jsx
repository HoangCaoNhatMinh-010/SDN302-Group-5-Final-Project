import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../utils/constants';
import { DEMO_USERS } from '../data/mockData';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

const STORAGE_KEY = 'medcare_auth_state';
const TOKEN_KEY = 'medcare_auth_token';

export const AuthProvider = ({ children }) => {
  // Load persisted state or default to PATIENT demo account
  const [authState, setAuthState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role && (parsed.currentUser || DEMO_USERS[parsed.role])) {
          return {
            isAuthenticated: parsed.isAuthenticated ?? true,
            role: parsed.role,
            currentUser: parsed.currentUser || DEMO_USERS[parsed.role],
          };
        }
      }
    } catch {
      // fallback
    }

    return {
      isAuthenticated: true,
      role: ROLES.PATIENT,
      currentUser: DEMO_USERS[ROLES.PATIENT],
    };
  });

  // Tự động đảm bảo luôn có Token hợp lệ cho người dùng hiện tại
  useEffect(() => {
    const ensureToken = async () => {
      try {
        const currentToken = localStorage.getItem(TOKEN_KEY);
        // Nếu chưa có token hoặc token không hợp lệ
        if (!currentToken || currentToken === 'undefined' || currentToken === 'null') {
          const res = await apiClient.post('/auth/login', {
            identifier: authState.currentUser?.email || 'minh.nguyen@example.com',
            password: 'password123',
          }).catch(() => null);

          if (res && res.token) {
            localStorage.setItem(TOKEN_KEY, res.token);
            if (res.user) {
              setAuthState((prev) => ({
                ...prev,
                currentUser: { ...prev.currentUser, ...res.user, id: res.user.id || res.user._id },
              }));
            }
          }
        }
      } catch (err) {
        console.warn('Lỗi đồng bộ token ban đầu:', err.message);
      }
    };

    ensureToken();
  }, [authState.role]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    } catch (e) {
      console.error('Failed to save auth state to localStorage', e);
    }
  }, [authState]);

  /**
   * Set user role directly (e.g. for demo switcher or testing)
   */
  const setRole = (newRole) => {
    if (!ROLES[newRole]) return;
    const user = DEMO_USERS[newRole];
    setAuthState({
      isAuthenticated: true,
      role: newRole,
      currentUser: user,
    });
  };

  /**
   * Login with specified role or user object
   */
  const login = (roleOrUser = ROLES.PATIENT) => {
    let user;
    let targetRole;

    if (typeof roleOrUser === 'string') {
      targetRole = roleOrUser;
      user = DEMO_USERS[targetRole] || DEMO_USERS[ROLES.PATIENT];
    } else if (typeof roleOrUser === 'object' && roleOrUser !== null) {
      user = roleOrUser;
      targetRole = roleOrUser.role || ROLES.PATIENT;
    } else {
      targetRole = ROLES.PATIENT;
      user = DEMO_USERS[ROLES.PATIENT];
    }

    setAuthState({
      isAuthenticated: true,
      role: targetRole,
      currentUser: user,
    });
    return user;
  };

  /**
   * Update current user profile fields in shared state & storage
   */
  const updateCurrentUser = (updatedFields) => {
    setAuthState((prev) => {
      const updatedUser = {
        ...prev.currentUser,
        ...updatedFields,
      };
      return {
        ...prev,
        currentUser: updatedUser,
      };
    });
  };

  /**
   * Logout user
   */
  const logout = () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      // ignore
    }
    setAuthState({
      isAuthenticated: false,
      role: null,
      currentUser: null,
    });
  };

  /**
   * Quick Switch to Demo Account
   */
  const switchDemoAccount = (targetRole) => {
    setRole(targetRole);
  };

  const value = {
    isAuthenticated: authState.isAuthenticated,
    role: authState.role,
    currentUser: authState.currentUser,
    login,
    logout,
    setRole,
    updateCurrentUser,
    switchDemoAccount,
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
