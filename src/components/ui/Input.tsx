import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    variant = 'default',
    leftIcon,
    rightIcon,
    rightElement,
    label,
    helperText,
    error,
    required,
    disabled,
    ...props 
  }, ref) => {
    
    const hasError = variant === 'error' || !!error;
    
    return (
      <div className="macos26-input-wrapper w-full">
        {label && (
          <label className={cn(
            'macos26-input-label',
            required && 'macos26-input-label-required'
          )}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="macos26-input-icon macos26-input-icon-left">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              'macos26-input',
              leftIcon && 'macos26-input-with-icon-left',
              (rightIcon || rightElement) && 'macos26-input-with-icon-right',
              hasError && 'macos26-input-error',
              className
            )}
            disabled={disabled}
            ref={ref}
            {...props}
          />
          
          {(rightIcon || rightElement) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
              {rightElement || (
                <div className="macos26-input-icon macos26-input-icon-right">
                  {rightIcon}
                </div>
              )}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="macos26-input-helper">
            {hasError && (
              <div className="macos26-input-helper-icon">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <span className={cn(
              'macos26-input-helper-text',
              hasError && 'macos26-input-helper-error'
            )}>
              {error || helperText}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };