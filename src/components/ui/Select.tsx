import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Input } from './Input';

export interface SelectOption {
    key: string;
    value: string;
    label?: string;
    disabled?: boolean;
}

export interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    options: SelectOption[];
    disabled?: boolean;
    required?: boolean;
    error?: string;
    className?: string;
}

const Select: React.FC<SelectProps> = ({
    value,
    onChange,
    label,
    placeholder = 'Chọn một tùy chọn',
    options = [],
    disabled = false,
    required = false,
    error,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Get selected option
    const selectedOption = options.find(option => option.key === value || option.value === value);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        (option.value || option.label || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle dropdown open/close
    const toggleDropdown = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        setSearchTerm('');
    };

    // Close dropdown
    const closeDropdown = () => {
        setIsOpen(false);
        setSearchTerm('');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current && options.length > 5) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, options.length]);

    // Handle option selection
    const handleOptionSelect = (optionValue: string, optionKey: string) => {
        onChange(optionKey);
        closeDropdown();
    };

    return (
        <div className={cn('relative', className)} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-[var(--primary-text)] mb-2 font-['SF_Pro_Display']">
                    {label}
                    {required && <span className="text-[var(--macos-red)] ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <Button
                    variant="outline"
                    onClick={toggleDropdown}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    className={cn(
                        'w-full min-h-[2.5rem] p-3 justify-between text-left',
                        'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20',
                        isOpen && 'border-[var(--accent)]',
                        error && 'border-[var(--macos-red)]',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <span className={cn(
                        'flex-1 text-left',
                        !selectedOption && 'text-[var(--primary-text-secondary)]'
                    )}>
                        {selectedOption ? (selectedOption.label || selectedOption.value) : placeholder}
                    </span>
                    <svg
                        className={cn(
                            'h-4 w-4 text-[var(--primary-text-secondary)] transition-transform duration-200 ml-2',
                            isOpen && 'rotate-180'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </Button>

                {/* Compact Modal Dropdown */}
                {isOpen && (
                    <>
                        {/* Minimal Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
                            onClick={closeDropdown}
                        >
                            {/* Dropdown Modal - Compact */}
                            <div
                                className="relative animate-slideDown"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    maxHeight: '60vh'
                                }}
                            >
                                <div style={{
                                    backgroundColor: 'var(--card-bg)',
                                    backdropFilter: 'var(--backdrop-blur)',
                                    WebkitBackdropFilter: 'var(--backdrop-blur)',
                                    border: '1px solid var(--card-border)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.2)',
                                    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                                    maxHeight: '60vh',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    {/* Header with Close Button */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '12px',
                                        paddingBottom: '8px',
                                        borderBottom: '1px solid var(--card-border)'
                                    }}>
                                        <h3 style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: 'var(--primary-text)',
                                            margin: 0
                                        }}>
                                            Chọn tùy chọn
                                        </h3>
                                        
                                        <button
                                            onClick={closeDropdown}
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                color: 'var(--primary-text-secondary)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--macos-red)';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = 'var(--primary-text-secondary)';
                                            }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Search Input */}
                                    {options.length > 5 && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <Input
                                                ref={searchInputRef}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Tìm kiếm..."
                                                size="sm"
                                                leftIcon={
                                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                }
                                            />
                                        </div>
                                    )}

                                    {/* Options List */}
                                    <div style={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        maxHeight: '300px',
                                        marginBottom: selectedOption ? '8px' : 0
                                    }}>
                                        {filteredOptions.length === 0 ? (
                                            <div style={{
                                                padding: '20px',
                                                textAlign: 'center',
                                                color: 'var(--primary-text-secondary)',
                                                fontSize: '14px'
                                            }}>
                                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                                                <div>Không tìm thấy kết quả</div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                {filteredOptions.map((option) => (
                                                    <button
                                                        key={option.key}
                                                        onClick={() => !option.disabled && handleOptionSelect(option.value, option.key)}
                                                        disabled={option.disabled}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 12px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            cursor: option.disabled ? 'not-allowed' : 'pointer',
                                                            backgroundColor: (option.key === value || option.value === value)
                                                                ? 'var(--accent)'
                                                                : 'transparent',
                                                            color: (option.key === value || option.value === value)
                                                                ? 'white'
                                                                : option.disabled
                                                                ? 'var(--primary-text-secondary)'
                                                                : 'var(--primary-text)',
                                                            fontSize: '13px',
                                                            fontWeight: '500',
                                                            textAlign: 'left',
                                                            transition: 'all 0.2s',
                                                            opacity: option.disabled ? 0.5 : 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            if (!option.disabled && !(option.key === value || option.value === value)) {
                                                                e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
                                                            }
                                                        }}
                                                        onMouseOut={(e) => {
                                                            if (!option.disabled && !(option.key === value || option.value === value)) {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                            }
                                                        }}
                                                    >
                                                        <span>{option.label || option.value}</span>
                                                        {(option.key === value || option.value === value) && (
                                                            <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Clear Selection */}
                                    {selectedOption && (
                                        <div style={{ 
                                            paddingTop: '8px',
                                            borderTop: '1px solid var(--card-border)' 
                                        }}>
                                            <button
                                                onClick={() => handleOptionSelect('', '')}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--macos-red)',
                                                    backgroundColor: 'transparent',
                                                    color: 'var(--macos-red)',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'var(--macos-red)';
                                                    e.currentTarget.style.color = 'white';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = 'var(--macos-red)';
                                                }}
                                            >
                                                Xóa lựa chọn
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-[var(--macos-red)] flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export default Select;
