import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionManager } from '@/utils/auth';
import { User, UserSession } from '@/types/auth';
import { request } from '@/utils/request';
import routerPath from '@/routerPath';

interface AuthContextType {
  user: User | null;
  session: UserSession | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (sessionData: UserSession) => void;
  logout: () => void;
  checkAuth: () => boolean;
  hasPermission: (permission?: string) => boolean;
}

const AuthContext = createContext < AuthContextType > ({
  user: null,
  session: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
  login: () => { },
  logout: () => { },
  checkAuth: () => false,
  hasPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState < User | null > (null);
  const [session, setSession] = useState < UserSession | null > (null);
  const [permissions, setPermissions] = useState < string[] > ([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = React.useCallback((): boolean => {
    try {
      const currentSession = sessionManager.getSession();
      if (currentSession && sessionManager.isSessionValid()) {
        setUser(currentSession.user);
        setSession(currentSession);
        setPermissions((currentSession.permissions || []).map(permission => permission.toString()));
        setIsAuthenticated(true);
        return true;
      } else {
        sessionManager.clearSession();
        setUser(null);
        setSession(null);
        setPermissions([]);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setSession(null);
      setPermissions([]);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  const login = React.useCallback((sessionData: UserSession) => {
    sessionManager.saveSession(sessionData);
    setUser(sessionData.user);
    setSession(sessionData);
    setPermissions((sessionData.permissions || []).map(permission => permission.toString()));
    setIsAuthenticated(true);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      // Get current user info before clearing session
      const currentSession = sessionManager.getSession();
      const currentUser = currentSession?.user;

      // Send logout notification to API before clearing session
      if (currentUser) {
        try {
          await request({
            method: 'POST',
            url: '/api/notification/create',
            headers: {
              'X-User-ID': currentUser._id,
              'X-Username': currentUser.username
            },
            body: {
              userId: currentUser._id,
              username: currentUser.username,
              title: 'Đăng xuất khỏi hệ thống',
              message: `Bạn đã đăng xuất khỏi hệ thống DROH lúc ${new Date().toLocaleString('vi-VN')}`,
              type: 'error'
            }
          });
        
        } catch (notificationError) {
          console.error('Failed to send logout notification:', notificationError);
          // Don't block logout flow if notification fails
        }
      }

      // Call backend logout API
      try {
        await request({
          method: 'GET',
          url: routerPath.auth.logout,
          params: {}
        });
      } catch (apiError) {
        console.error('Backend logout API failed:', apiError);
        // Don't block logout flow if API fails
      }

      // Small delay to ensure notification is processed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to login page
      navigate('/');
    } catch (error) {
      console.error('Logout process failed:', error);
      // Navigate anyway
      navigate('/');
    } finally {
      // Clear session regardless of API call results
      sessionManager.clearSession();
      setUser(null);
      setSession(null);
      setPermissions([]);
      setIsAuthenticated(false);
    }
  }, [navigate]);

  const hasPermission = React.useCallback((permission?: string): boolean => {
    if (!permission) {
      return true;
    }
    return permissions.includes(permission);
  }, [permissions]);

  useEffect(() => {
    checkAuth();
    setIsLoading(false);
  }, []);

  const value: AuthContextType = React.useMemo(() => ({
    user,
    session,
    permissions,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    hasPermission,
  }), [user, session, permissions, isAuthenticated, isLoading, login, logout, checkAuth, hasPermission]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};