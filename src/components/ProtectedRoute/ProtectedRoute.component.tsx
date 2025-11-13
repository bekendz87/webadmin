import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  requireAuth: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAuth, children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // macOS26 Enhanced Loading State
  if (isLoading) {
    return (
      <div className="macos-interface">
        <div className="macos-app min-h-screen flex items-center justify-center macos-login-bg">
          
          {/* Enhanced Liquid Glass Loading Card */}
          <div className="liquid-glass-card max-w-md w-full mx-6 macos-slide-up">
            
            {/* Loading Content Container */}
            <div className="text-center">
              
              {/* Advanced Loading Spinner */}
              <div className="relative mb-8">
                
                {/* Main Spinner */}
                <div className="loading-spinner mx-auto"></div>
                
                {/* Inner Ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-transparent border-t-white/30 rounded-full animate-spin"></div>
                </div>
                
                {/* Pulse Effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border border-accent/20 rounded-full animate-ping"></div>
                </div>
                
              </div>

              {/* Loading Header */}
              <h3 className="macos-heading-3 mb-3 macos-text-primary">
                Đang kiểm tra phiên đăng nhập
              </h3>
              
              {/* Loading Subtitle */}
              <p className="macos-body-secondary mb-8 leading-relaxed">
                Vui lòng đợi trong giây lát...
              </p>

              {/* Enhanced Progress Bar */}
              <div className="relative mb-6">
                <div className="w-full h-1.5 bg-glass-bg rounded-full overflow-hidden border border-glass-border relative">
                  
                  {/* Animated Progress Fill */}
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full relative overflow-hidden"
                    style={{
                      backgroundSize: '200% 100%',
                      animation: 'liquidFlow 2s ease-in-out infinite'
                    }}
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                  
                </div>
              </div>

              {/* Animated Status Indicators */}
              <div className="flex justify-center items-center space-x-3 opacity-70">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                </div>
                
                <span className="text-xs macos-text-secondary font-medium tracking-wide">
                  Đang xác thực
                </span>
              </div>
              
            </div>
            
          </div>
          
        </div>
      </div>
    );
  }

  // Redirect to login if auth required but not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;