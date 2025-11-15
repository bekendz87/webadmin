import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';

export interface MultiSelectOption {
    key: string;
    value: string;
    label?: string;
}

export interface MultiSelectProps {
    options: MultiSelectOption[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    searchable?: boolean;
    maxDisplay?: number;
    className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Chọn các tùy chọn...",
    disabled = false,
    label,
    searchable = true,
    maxDisplay = 2,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef < HTMLDivElement > (null);
    const triggerRef = useRef < HTMLButtonElement > (null);
    const containerRef = useRef < HTMLDivElement > (null);

    // Filter options based on search term
    const filteredOptions = searchable
        ? options.filter(option =>
            (option.value || option.label || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;

    // Get selected options
    const selectedOptions = options.filter(option => value.includes(option.key));

    // Display text for selected items
    const getDisplayContent = () => {
        if (selectedOptions.length === 0) {
            return (
                <span className="text-[var(--primary-text-secondary)]">
                    {placeholder}
                </span>
            );
        }

        if (selectedOptions.length <= maxDisplay) {
            return (
                <div className="flex flex-wrap gap-1">
                    {selectedOptions.map(option => (
                        <Badge
                            key={option.key}
                            variant="primary"
                            size="sm"
                            className="bg-[var(--accent)] text-white"
                        >
                            {option.value || option.label}
                        </Badge>
                    ))}
                </div>
            );
        }

        return (
            <div className="flex flex-wrap gap-1">
                {selectedOptions.slice(0, maxDisplay).map(option => (
                    <Badge
                        key={option.key}
                        variant="primary"
                        size="sm"
                        className="bg-[var(--accent)] text-white"
                    >
                        {option.value || option.label}
                    </Badge>
                ))}
                <Badge variant="default" size="sm">
                    +{selectedOptions.length - maxDisplay}
                </Badge>
            </div>
        );
    };

    // Simplified option toggle without API calls
    const handleOptionToggle = (optionKey: string) => {
        if (disabled) return;

        const newValue = value.includes(optionKey)
            ? value.filter(v => v !== optionKey)
            : [...value, optionKey];

        onChange(newValue);
    };

    // Simplified select all without API calls
    const handleSelectAll = () => {
        if (disabled) return;

        const allKeys = filteredOptions.map(option => option.key);
        const allSelected = allKeys.every(key => value.includes(key));

        if (allSelected) {
            onChange(value.filter(v => !allKeys.includes(v)));
        } else {
            const newValue = [...new Set([...value, ...allKeys])];
            onChange(newValue);
        }
    };

    // Simplified clear all without API calls
    const handleClearAll = () => {
        if (disabled) return;
        onChange([]);
    };

    // Calculate dropdown position
    const calculateDropdownPosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const dropdownHeight = 400;

            let top = rect.bottom + window.scrollY + 8;
            let left = rect.left + window.scrollX;

            // Position above if not enough space below
            if (rect.bottom + dropdownHeight > viewportHeight && rect.top > dropdownHeight) {
                top = rect.top + window.scrollY - dropdownHeight - 8;
            }

            // Ensure dropdown fits horizontally
            const dropdownWidth = Math.max(rect.width, 300);
            if (left + dropdownWidth > window.innerWidth) {
                left = window.innerWidth - dropdownWidth - 16;
            }

            setDropdownPosition({ top, left, width: dropdownWidth });
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Don't close if clicking inside dropdown or trigger
            if (
                (containerRef.current && containerRef.current.contains(target)) ||
                (dropdownRef.current && dropdownRef.current.contains(target))
            ) {
                return;
            }

            setIsOpen(false);
            setSearchTerm('');
        };

        const handleScroll = (event: Event) => {
            // Only close if scrolling outside the dropdown
            const target = event.target as Node;
            if (
                dropdownRef.current &&
                (dropdownRef.current === target || dropdownRef.current.contains(target))
            ) {
                // Scrolling inside dropdown, don't close
                return;
            }

            // Update position instead of closing
            calculateDropdownPosition();
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('scroll', handleScroll, true); // Use capture phase
            window.addEventListener('resize', calculateDropdownPosition);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', calculateDropdownPosition);
        };
    }, [isOpen]);

    // Simplified button click without API calls
    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled) return;

        if (!isOpen) {
            calculateDropdownPosition();
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className={cn('relative dropdown-portal', className)} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-[var(--primary-text)] mb-2 font-['SF_Pro_Display']">
                    {label}
                </label>
            )}

            <div className="relative">
                <Button
                    ref={triggerRef}
                    variant="outline"
                    onClick={handleButtonClick}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    className={cn(
                        'w-full min-h-[2.5rem] p-3 justify-between text-left',
                        'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20',
                        isOpen && 'border-[var(--accent)]',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <div className="flex-1">
                        {getDisplayContent()}
                    </div>
                    <svg
                        className={cn(
                            'w-5 h-5 text-[var(--primary-text-secondary)] transition-transform duration-200 ml-2',
                            isOpen && 'rotate-180'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </Button>

                {/* Enhanced MultiSelect Dropdown */}
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[9998]"
                            onClick={() => setIsOpen(false)}
                        />
                        <div
                            ref={dropdownRef}
                            className="fixed z-[9999] animate-slideDown"
                            style={{
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                                width: `${dropdownPosition.width}px`,
                                minWidth: '300px'
                            }}
                            onClick={(e) => e.stopPropagation()} // Prevent backdrop click
                        >
                            <Card className="p-0 max-h-80 overflow-hidden">
                                {searchable && (
                                    <div className="p-3 border-b border-[var(--card-border)] bg-[var(--card-bg)] sticky top-0 z-10">
                                        <Input
                                            placeholder="Tìm kiếm..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            leftIcon={
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            }
                                            autoFocus
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-3 border-b border-[var(--card-border)] bg-[var(--card-bg)] sticky top-12 z-10">
                                    <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Chọn tất cả
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleClearAll}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Xóa tất cả
                                    </Button>
                                </div>

                                {/* Options with improved scroll handling */}
                                <div
                                    className="max-h-60 overflow-y-auto"
                                    onScroll={(e) => e.stopPropagation()} // Prevent scroll bubbling
                                >
                                    {filteredOptions.length > 0 ? (
                                        filteredOptions.map((option) => {
                                            const isSelected = value.includes(option.key);
                                            return (
                                                <Button
                                                    key={option.key}
                                                    variant="ghost"
                                                    onClick={() => handleOptionToggle(option.key)}
                                                    className="w-full justify-start p-3 h-auto"
                                                >
                                                    <div className={cn(
                                                        'w-4 h-4 rounded border-2 transition-all duration-200 mr-3',
                                                        'flex items-center justify-center backdrop-filter backdrop-blur-sm',
                                                        isSelected
                                                            ? 'bg-[var(--accent)] border-[var(--accent)]'
                                                            : 'border-[var(--card-border)]'
                                                    )}>
                                                        {isSelected && (
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="flex-1 text-left text-[var(--primary-text)] font-['SF_Pro_Display']">
                                                        {option.value || option.label || option.key}
                                                    </span>
                                                </Button>
                                            );
                                        })
                                    ) : (
                                        <div className="p-6 text-center text-[var(--primary-text-secondary)]">
                                            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Không tìm thấy tùy chọn nào
                                        </div>
                                    )}
                                </div>

                                {selectedOptions.length > 0 && (
                                    <div className="p-3 border-t border-[var(--card-border)] bg-[var(--card-bg)]/90 backdrop-blur-sm sticky bottom-0">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[var(--primary-text-secondary)]">
                                                Đã chọn {selectedOptions.length} / {options.length}
                                            </span>
                                            <Badge variant="primary" size="sm">
                                                {selectedOptions.length}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MultiSelect;
export { MultiSelect };
