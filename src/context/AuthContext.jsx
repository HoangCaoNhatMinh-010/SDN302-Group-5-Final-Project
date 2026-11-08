import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../utils/constants';
import { DEMO_USERS } from '../data/mockData';

const AuthContext = createContext(null);

const STORAGE_KEY = 'medcare_auth_state';

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
