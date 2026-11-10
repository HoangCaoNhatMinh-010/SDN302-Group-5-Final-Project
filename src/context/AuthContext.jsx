import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../utils/constants';
import { DEMO_USERS } from '../data/mockData';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

const STORAGE_KEY = 'medcare_auth_state';
const TOKEN_KEY = 'medcare_auth_token';

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (token && token !== 'undefined' && token !== 'null' && saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isAuthenticated && parsed.role && parsed.currentUser) {
          return {
            isAuthenticated: true,
            role: parsed.role,
            currentUser: parsed.currentUser,
          };
        }
      }
    } catch {
      // fallback
    }

    return {
      isAuthenticated: false,
      role: null,
      currentUser: null,
    };
  });

  // Xác minh phiên đăng nhập từ token hiện có khi khởi chạy ứng dụng
  useEffect(() => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (!authState.isAuthenticated || !currentToken || currentToken === 'undefined' || currentToken === 'null') {
      if (authState.isAuthenticated) {
        setAuthState({ isAuthenticated: false, role: null, currentUser: null });
      }
      return;
    }

    let isMounted = true;
    const syncSession = async () => {
      try {
        const meRes = await apiClient.get('/auth/me');
        if (isMounted && meRes && meRes.data) {
          setAuthState((prev) => ({
            ...prev,
            role: meRes.data.role || prev.role,
            currentUser: { ...prev.currentUser, ...meRes.data, id: meRes.data.id || meRes.data._id },
          }));
        }
      } catch {
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          setAuthState({
            isAuthenticated: false,
            role: null,
            currentUser: null,
          });
        }
      }
    };

    syncSession();
    return () => {
      isMounted = false;
    };
  }, [authState.isAuthenticated]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    } catch (e) {
      console.error('Failed to save auth state to localStorage', e);
    }
  }, [authState]);

  /**
   * Set user role directly (for demo switcher)
   */
  const setRole = async (newRole) => {
    if (!ROLES[newRole]) return;
    if (newRole === ROLES.PATIENT) {
      try {
        const res = await apiClient.post('/auth/login', {
          identifier: DEMO_USERS[ROLES.PATIENT].email,
          password: 'password123',
        });
        if (res && res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
          setAuthState({
            isAuthenticated: true,
            role: newRole,
            currentUser: res.user,
          });
          return;
        }
      } catch {
        // fallback
      }
    }
    const user = DEMO_USERS[newRole];
    setAuthState({
      isAuthenticated: true,
      role: newRole,
      currentUser: user,
    });
  };

  /**
   * Login with specified role or user object + optional JWT token
   */
  const login = (roleOrUser = ROLES.PATIENT, token = null) => {
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

    if (token) {
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch {
        // ignore
      }
    }

    const nextState = {
      isAuthenticated: true,
      role: targetRole,
      currentUser: user,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // ignore
    }

    setAuthState(nextState);
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
   * Logout user cleanly
   */
  const logout = () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ isAuthenticated: false, role: null, currentUser: null })
      );
    } catch {
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
    return setRole(targetRole);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
