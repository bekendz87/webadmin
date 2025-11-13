import React from 'react';
import { cn } from '@/utils/cn';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary';
  text?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', variant = 'default', text, ...props }, ref) => {
    const sizeStyles = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };

    const variantStyles = {
      default: 'text-[var(--primary-text-secondary)]',
      primary: 'text-[var(--accent)]',
      secondary: 'text-[var(--primary-text)]'
    };

    const textSizeStyles = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg'
    };

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center gap-3', className)}
        {...props}
      >
        <div className="relative">
          {/* Main spinner */}
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-transparent',
              sizeStyles[size],
              variantStyles[variant]
            )}
            style={{
              borderTopColor: 'currentColor',
              borderRightColor: 'currentColor',
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent'
            }}
          />
          
          {/* Inner glow effect */}
          <div
            className={cn(
              'absolute inset-0 rounded-full opacity-20',
              sizeStyles[size]
            )}
            style={{
              background: `conic-gradient(from 0deg, transparent, currentColor, transparent)`,
              animation: 'spin 1.5s linear infinite reverse'
            }}
          />
        </div>
        
        {text && (
          <span 
            className={cn(
              'font-medium animate-pulse',
              textSizeStyles[size],
              variantStyles[variant]
            )}
          >
            {text}
          </span>
        )}
      </div>
    );
  }
);
LoadingSpinner.displayName = 'LoadingSpinner';

// Overlay spinner for full-page loading
interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  text = 'Đang tải...', 
  className 
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      'bg-[var(--primary-bg-solid)]/80 backdrop-blur-sm',
      'transition-opacity duration-300',
      className
    )}>
      <div className="liquid-glass-card p-8">
        <LoadingSpinner size="xl" variant="primary" text={text} />
      </div>
    </div>
  );
};

// Inline loading component
interface InlineLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const InlineLoading: React.FC<InlineLoadingProps> = ({ 
  size = 'md', 
  text, 
  className 
}) => (
  <div className={cn('flex items-center justify-center py-8', className)}>
    <LoadingSpinner size={size} variant="primary" text={text} />
  </div>
);

export { LoadingSpinner, LoadingOverlay, InlineLoading };
export type { LoadingSpinnerProps, LoadingOverlayProps, InlineLoadingProps };
