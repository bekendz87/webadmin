'use client';

import { useAlert } from '@/contexts/AlertContext';
import { Alert } from './index';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

export function AlertContainer() {
  const { alert, hideAlert } = useAlert();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        hideAlert();
      }, 5000); // Auto hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [alert.show, hideAlert]);

  if (!alert.show || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed top-20 right-6 max-w-sm w-full pointer-events-none z-alert">
      <div className="macos-fade-in pointer-events-auto">
        <div className="relative group">
          {/* macOS26 Enhanced liquid glass container */}
          <div className="relative transform-gpu">
            {/* Background blur layer */}
            <div className="absolute inset-0 rounded-2xl backdrop-blur-xl bg-white/10 dark:bg-black/10 shadow-2xl"></div>

            {/* Main alert */}
            <Alert
              variant={alert.variant}
              title={alert.title}
              description={alert.description}
              className="pr-12 relative"
            />

            {/* Enhanced close button with macOS26 styling - Fixed Icon */}
            <button
              onClick={hideAlert}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group/close"
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
              title="Đóng thông báo"
            >
              {/* X Icon using CSS instead of SVG */}
              <div
                className="relative w-3.5 h-3.5 flex items-center justify-center transition-transform duration-200 group-hover/close:rotate-90"
                style={{
                  color: 'var(--primary-text-secondary)'
                }}
              >
                <div className="absolute w-3.5 h-0.5 bg-current rounded-full transform rotate-45"></div>
                <div className="absolute w-3.5 h-0.5 bg-current rounded-full transform -rotate-45"></div>
              </div>

              {/* Alternative SVG Icon - More reliable */}
              {/* <svg 
                width="14" 
                height="14" 
                viewBox="0 0 14 14" 
                fill="none" 
                className="transition-transform duration-200 group-hover/close:rotate-90"
                style={{ color: 'var(--primary-text-secondary)' }}
              >
                <path 
                  d="M1 1L13 13M1 13L13 1" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg> */}

              {/* Hover effect background */}
              <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover/close:opacity-100 transition-opacity duration-200"></div>
            </button>

            {/* Advanced glow effect with proper layering */}
            <div className={`absolute inset-0 rounded-2xl opacity-15 dark:opacity-25 blur-2xl -z-20 transition-all duration-500 group-hover:opacity-25 dark:group-hover:opacity-35 ${alert.variant === 'success' ? 'bg-green-400 shadow-green-400/20' :
              alert.variant === 'warning' ? 'bg-orange-400 shadow-orange-400/20' :
                'bg-red-400 shadow-red-400/20'
              }`}></div>

            {/* Outer glow ring */}
            <div className={`absolute -inset-2 rounded-3xl opacity-10 dark:opacity-20 blur-3xl -z-30 transition-all duration-700 ${alert.variant === 'success' ? 'bg-green-300' :
              alert.variant === 'warning' ? 'bg-orange-300' :
                'bg-red-300'
              }`}></div>

            {/* Liquid shine animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {/* Top highlight bar */}
              <div className={`absolute top-0 left-6 right-6 h-px opacity-40 ${alert.variant === 'success' ? 'bg-gradient-to-r from-transparent via-green-400/80 to-transparent' :
                alert.variant === 'warning' ? 'bg-gradient-to-r from-transparent via-orange-400/80 to-transparent' :
                  'bg-gradient-to-r from-transparent via-red-400/80 to-transparent'
                }`}></div>

              {/* Side highlights */}
              <div className={`absolute top-4 bottom-4 left-0 w-px opacity-20 ${alert.variant === 'success' ? 'bg-gradient-to-b from-green-400/60 via-green-300/40 to-transparent' :
                alert.variant === 'warning' ? 'bg-gradient-to-b from-orange-400/60 via-orange-300/40 to-transparent' :
                  'bg-gradient-to-b from-red-400/60 via-red-300/40 to-transparent'
                }`}></div>

              {/* Floating particle effect */}
              <div className="absolute inset-0 opacity-30">
                <div className={`absolute top-3 right-8 w-1 h-1 rounded-full ${alert.variant === 'success' ? 'bg-green-400' :
                  alert.variant === 'warning' ? 'bg-orange-400' :
                    'bg-red-400'
                  } animate-pulse`}></div>
                <div className={`absolute bottom-4 left-12 w-0.5 h-0.5 rounded-full ${alert.variant === 'success' ? 'bg-green-300' :
                  alert.variant === 'warning' ? 'bg-orange-300' :
                    'bg-red-300'
                  } animate-pulse`} style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
