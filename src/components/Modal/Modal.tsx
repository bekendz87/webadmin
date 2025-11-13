import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
    showCloseButton?: boolean;
    closeOnBackdropClick?: boolean;
    footerContent?: ReactNode;
    icon?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = '4xl',
    showCloseButton = true,
    closeOnBackdropClick = true,
    footerContent,
    icon
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => {
                document.body.style.overflow = 'unset';
            }, 300);
            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl'
    };

    const modalContent = (
        <div 
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 999999 }}
            onClick={handleBackdropClick}
        >
            {/* macOS26 Glass Backdrop */}
            <div
                className={`fixed inset-0 transition-all duration-300 ease-out ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                    zIndex: 999998,
                    background: 'var(--card-bg)',
                    backdropFilter: 'var(--backdrop-blur)',
                    WebkitBackdropFilter: 'var(--backdrop-blur)'
                }}
            />

            {/* macOS26 Modal Content */}
            <div
                className={`relative w-full ${maxWidthClasses[maxWidth]} transition-all duration-300 ease-out transform ${
                    isVisible
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-4'
                }`}
                style={{ zIndex: 999999 }}
                onClick={(e) => e.stopPropagation()}
            >
                <Card className="!p-0 max-h-[90vh] flex flex-col overflow-hidden">
                    {/* macOS26 Header */}
                    <CardHeader className="px-6 py-5 border-b border-[var(--card-border)] bg-[var(--glass-bg)] backdrop-filter backdrop-blur-md">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                {icon && (
                                    <div className="flex-shrink-0">
                                        {icon}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-[var(--primary-text)] font-['SF_Pro_Display']">
                                        {title}
                                    </h3>
                                </div>
                            </div>
                            {showCloseButton && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    leftIcon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    }
                                >
                                    
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    {/* macOS26 Content */}
                    <CardContent className="px-6 py-6 overflow-y-auto flex-1">
                        {children}
                    </CardContent>

                    {/* macOS26 Footer */}
                    {footerContent && (
                        <CardFooter className="px-6 py-4 border-t border-[var(--card-border)] bg-[var(--glass-bg)]">
                            <div className="flex justify-end space-x-3 w-full">
                                {footerContent}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default Modal;
