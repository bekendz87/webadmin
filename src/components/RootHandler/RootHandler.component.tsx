import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/Login/Login.page';
import routerPath from '@/routerPath';

const RootHandler: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // macOS26 Loading State
  if (isLoading) {
    return (
      <div className="macos-interface">
        <div className="macos-app min-h-screen flex items-center justify-center macos-login-bg">
          
          {/* Liquid Glass Loading Card */}
          <div className="liquid-glass-card max-w-md w-full mx-6 macos-slide-down">
            
            {/* Loading Content */}
            <div className="text-center">
              
              {/* Enhanced Loading Spinner Container */}
              <div className="relative mb-6">
                <div className="loading-spinner mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-transparent border-t-white/30 rounded-full animate-spin"></div>
                </div>
              </div>

              {/* Loading Header */}
              <h3 className="macos-heading-3 mb-3">Đang kiểm tra phiên đăng nhập</h3>
              
              {/* Loading Description */}
              <p className="macos-body-secondary mb-6">
                Vui lòng đợi trong giây lát...
              </p>

              {/* Progress Indicator */}
              <div className="relative">
                <div className="w-full h-1.5 bg-glass-bg rounded-full overflow-hidden border border-glass-border">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full"
                    style={{
                      backgroundSize: '200% 100%',
                      animation: 'liquidFlow 2s ease-in-out infinite'
                    }}
                  ></div>
                </div>
              </div>

              {/* Loading Dots */}
              <div className="flex justify-center space-x-2 mt-6 opacity-60">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
              </div>
              
            </div>
            
          </div>
          
        </div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to={routerPath.dashboard} replace />;
  }

  // Show login page for unauthenticated users
  return <LoginPage />;
};

export default RootHandler;