import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'default', 
    width, 
    height, 
    animation = 'pulse',
    style,
    ...props 
  }, ref) => {
    const baseStyles = 'invoice-loading-skeleton bg-[var(--card-bg)] border border-[var(--card-border)]';
    
    const variantStyles = {
      default: 'rounded-lg',
      text: 'rounded h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-none'
    };

    const animationStyles = {
      pulse: 'animate-pulse',
      wave: 'invoice-loading-skeleton', // Uses CSS animation from globals.css
      none: ''
    };

    const inlineStyles = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          animationStyles[animation],
          className
        )}
        style={inlineStyles}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

// Pre-built skeleton components for common use cases
const SkeletonText = ({ lines = 1, className }: { lines?: number; className?: string }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton 
        key={index} 
        variant="text" 
        className={index === lines - 1 ? 'w-3/4' : 'w-full'} 
      />
    ))}
  </div>
);

const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('space-y-4', className)}>
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
  </div>
);

const SkeletonAvatar = ({ size = 40, className }: { size?: number; className?: string }) => (
  <Skeleton 
    variant="circular" 
    width={size} 
    height={size} 
    className={className} 
  />
);

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar };
export type { SkeletonProps };
