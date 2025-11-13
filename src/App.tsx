'use client';

import { Suspense, useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import NextTopLoader from 'nextjs-toploader';

// Contexts
import { AuthProvider, SidebarProvider, AlertProvider, NotificationProvider } from './contexts/index';

// Routes
import { AppRoutes } from './routes';

// Components
import Loader from './components/Loader/Loader.component';


export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Loader />;
  }

  // ✅ Tạo router với các cờ tương lai
  const router = createBrowserRouter(
    [
      {
        path: '*',
        element: (
          <ThemeProvider>
            <AlertProvider>
              <NotificationProvider>
                <AuthProvider>
                  <SidebarProvider>
                    <NextTopLoader
                      color="#5750F1"
                      showSpinner={false}
                      height={3}
                      speed={200}
                    />
                    <Suspense fallback={<Loader />}>
                      <AppRoutes />
                    </Suspense>
                  </SidebarProvider>
                </AuthProvider>
              </NotificationProvider>
            </AlertProvider>
          </ThemeProvider>
        ),
      },
    ],
    {
      future: {
        v7_relativeSplatPath: true,
      },
    }
  );

  return <RouterProvider router={router} />;
}