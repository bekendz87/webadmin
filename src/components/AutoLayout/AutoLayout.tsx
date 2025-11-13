import React from 'react';
import { useLocation } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout/PublicLayout.component';
import { DashboardLayout } from '@/layouts//DashboardLayout/DashboardLayout.component';
import { useAuth } from '@/contexts/AuthContext';
import { PATHS } from '@/constants/paths';

interface AutoLayoutProps {
  children: React.ReactNode;
}

export const AutoLayout: React.FC<AutoLayoutProps> = ({ children }) => {
  const location: any = useLocation();
  const { user } = useAuth();

  // Pages that don't need layout (full page display)
  const noLayoutPages = [PATHS.LOGIN];

  // Check if current page should bypass layout
  const shouldBypassLayout = noLayoutPages.includes(location.pathname);

  // Known protected routes that should have layout
  const protectedRoutesWithLayout = [
    PATHS.DASHBOARD,
    PATHS.OTP,
    PATHS.REPORT_INVOICE,
    PATHS.REPORT_HOSPITAL_APPOINTMENT,
    PATHS.REPORT_EXAMINATION,
    PATHS.REPORT_CARD
  ];

  // Check if current path is a known protected route
  const isKnownProtectedRoute = protectedRoutesWithLayout.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  // If user is authenticated and on a known protected route, use dashboard layout
  if (user && isKnownProtectedRoute) {
    return (
      <DashboardLayout>
        {children}
      </DashboardLayout>
    );
  }

  // For login page or when not authenticated, bypass layout
  if (shouldBypassLayout || !user) {
    return <>{children}</>;
  }

  // For 404 pages (authenticated user on unknown route), bypass layout to show full page 404
  return <>{children}</>;
};
