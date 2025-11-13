'use client';

import { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { request } from '@/utils/request';

type AlertState = {
  show: boolean;
  variant: 'error' | 'success' | 'warning' | 'info';
  title: string;
  description: string;
};

type AlertContextType = {
  alert: AlertState;
  showAlert: (variant: 'error' | 'success' | 'warning' | 'info', title: string, description: string, duration?: number, sendToAPI?: boolean) => void;
  hideAlert: () => void;
  sendNotification: (type: 'error' | 'success' | 'warning' | 'info', title: string, message: string) => Promise<void>;
};

const AlertContext = createContext < AlertContextType | undefined > (undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState < AlertState > ({
    show: false,
    variant: 'error',
    title: '',
    description: ''
  });

  const alertTimeoutRef = useRef < NodeJS.Timeout | null > (null);

  const getUserInfo = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return {
          userId: parsed._id || parsed.id || 'demo-user-id',
          username: parsed.username || parsed.name || 'demo-user'
        };
      }
    } catch (error) {
      console.error('Error parsing userInfo from localStorage:', error);
    }
    return { userId: 'demo-user-id', username: 'demo-user' };
  };

  const sendNotification = async (type: 'error' | 'success' | 'warning' | 'info', title: string, message: string) => {
    try {
      const { userId, username } = getUserInfo();

      await request({
        method: 'POST',
        url: '/api/notification/create',
        headers: {
          'X-User-ID': userId,
          'X-Username': username
        },
        body: {
          userId,
          username,
          title,
          message,
          type
        }
      });
    } catch (error) {
      console.error('Failed to send notification to API:', error);
    }
  };

  const showAlert = (variant: 'error' | 'success' | 'warning' | 'info', title: string, description: string, duration = 5000, sendToAPI = false) => {
    // Clear existing timeout
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }

    setAlert({ show: true, variant, title, description });

    // Send to notification API if requested
    if (sendToAPI) {
      sendNotification(variant, title, description);
    }

    // Auto hide after duration
    alertTimeoutRef.current = setTimeout(() => {
      hideAlert();
    }, duration);
  };

  const hideAlert = () => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    setAlert(prev => ({ ...prev, show: false }));
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert, sendNotification }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
